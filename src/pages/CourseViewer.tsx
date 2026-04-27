import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { CheckCircle2, Download, Lock, Menu, Printer, SquarePlay } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/firebase";
import { initiateSTKPush, queryPaymentStatus } from "@/lib/mpesa";
import { getCourse, getCourseProgress, getModules, getPaymentForModule, markModuleComplete, savePayment, type CourseRecord, type ModuleRecord } from "@/lib/adminData";
import { onAuthStateChanged } from "firebase/auth";

GlobalWorkerOptions.workerSrc = workerUrl;

export default function CourseViewer() {
  const { id, moduleId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseRecord | null>(null);
  const [modules, setModules] = useState<ModuleRecord[]>([]);
  const [activeModule, setActiveModule] = useState<ModuleRecord | null>(null);
  const [courseProgress, setCourseProgress] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userId, setUserId] = useState("guest");
  const [paymentGate, setPaymentGate] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const pdfContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid || "guest");
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!id) return;
    Promise.all([getCourse(id), getModules(id)])
      .then(async ([courseData, moduleData]) => {
        setCourse(courseData);
        setModules(moduleData);
        const nextActive = moduleId ? moduleData.find((module) => module.id === moduleId) || moduleData[0] : moduleData[0];
        setActiveModule(nextActive || null);

        if (nextActive && userId !== "guest") {
          const payment = await getPaymentForModule(userId, id, nextActive.id || "");
          setPaymentGate(Boolean(payment) || nextActive.isFree);
          const progress = await getCourseProgress(userId, id);
          setCourseProgress(progress?.percentComplete || 0);
          setCompletedIds(progress?.completedModuleIds || []);
        } else {
          setPaymentGate(Boolean(nextActive?.isFree));
        }
      })
      .catch(() => toast.error("Unable to load course"));
  }, [id, moduleId, userId]);

  useEffect(() => {
    if (!activeModule || activeModule.type !== "pdf" || !activeModule.pdfUrl || !pdfContainerRef.current) return;
    let cancelled = false;
    setPdfError("");
    pdfContainerRef.current.innerHTML = "";

    const renderPdf = async () => {
      try {
        const pdf = await getDocument(activeModule.pdfUrl).promise;
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          if (cancelled) return;
          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 1.35 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) return;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.className = "mb-4 w-full rounded-2xl border border-slate-200 shadow-sm";
          pdfContainerRef.current?.appendChild(canvas);
          await page.render({ canvasContext: context, viewport }).promise;
        }
      } catch {
        setPdfError("Could not render the PDF preview.");
      }
    };

    void renderPdf();

    return () => {
      cancelled = true;
    };
  }, [activeModule]);

  const isCompleted = activeModule?.id ? completedIds.includes(activeModule.id) : false;

  const openModule = (module: ModuleRecord) => {
    if (!id || !module.id) return;
    setActiveModule(module);
    navigate(`/courses/${id}/${module.id}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleComplete = async () => {
    if (!id || !activeModule?.id || userId === "guest") return;
    await markModuleComplete(userId, id, activeModule.id, modules.length);
    const progress = await getCourseProgress(userId, id);
    setCourseProgress(progress?.percentComplete || 0);
    setCompletedIds(progress?.completedModuleIds || []);
    toast.success("Module marked complete");
  };

  const handleUnlockDownload = async () => {
    if (!course || !activeModule?.id) return;
    setPaymentLoading(true);
    try {
      const phoneNumber = window.prompt("Enter your M-Pesa phone number") || "";
      if (!phoneNumber) return;

      const payableAmount = activeModule.isFree ? 0 : Number(activeModule.price || course.price || 0);
      if (payableAmount <= 0) {
        toast.error("Missing valid price for this module");
        return;
      }

      const result = await initiateSTKPush({
        phoneNumber,
        amount: payableAmount,
        courseId: course.id,
        courseName: course.title,
      });

      if (!result.success || !result.checkoutRequestId) {
        toast.error(result.message || "Unable to start payment");
        return;
      }

      let status = "pending";
      for (let index = 0; index < 12; index += 1) {
        const nextStatus = await queryPaymentStatus(result.checkoutRequestId);
        if (nextStatus.status === "success") {
          status = "completed";
          break;
        }
        if (["cancelled", "failed", "timeout", "error"].includes(nextStatus.status)) {
          status = nextStatus.status;
          break;
        }
        await new Promise((resolve) => window.setTimeout(resolve, 5000));
      }

      if (status !== "completed") {
        toast.error("Payment not confirmed yet. Try again after completing the STK push.");
        return;
      }

      await savePayment({
        userId,
        userEmail: auth.currentUser?.email || undefined,
        courseId: course.id || "",
        moduleId: activeModule.id,
        amount: payableAmount,
        mpesaReceiptNumber: result.checkoutRequestId,
        status: "completed",
        paidAt: null,
        checkoutRequestId: result.checkoutRequestId,
        phoneNumber,
      });

      setPaymentGate(true);
      toast.success("Payment confirmed. Download unlocked.");
    } catch {
      toast.error("Unable to unlock download");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (!course) {
    return <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-600">Loading course...</div>;
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] text-slate-900 print:bg-white">
      <div className="flex min-h-screen">
        <aside className={`fixed inset-y-0 left-0 z-30 w-80 border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 lg:hidden">
            <p className="text-sm font-semibold">{course.title}</p>
            <button onClick={() => setMobileSidebarOpen(false)} className="rounded-xl border border-slate-200 p-2"><Menu className="h-4 w-4" /></button>
          </div>
          <div className="border-b border-slate-100 px-5 py-5">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Course</p>
            <h1 className="mt-2 text-2xl font-bold leading-tight">{course.title}</h1>
            <p className="mt-2 text-sm text-slate-500">{course.category} · {course.level}</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${courseProgress}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-500">{courseProgress}% complete</p>
          </div>

          <div className="px-3 py-4">
            <p className="px-2 pb-3 text-xs uppercase tracking-[0.24em] text-slate-500">Modules</p>
            <div className="space-y-1">
              {modules.map((module) => {
                const active = module.id === activeModule?.id;
                const unlocked = module.isFree || (active && paymentGate);
                return (
                  <button
                    key={module.id}
                    onClick={() => openModule(module)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${active ? "bg-primary/10 text-primary" : "hover:bg-slate-50"}`}
                  >
                    <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                      {unlocked ? <SquarePlay className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{module.title}</span>
                      <span className="block text-xs text-slate-500">{module.type.toUpperCase()} · {module.isFree ? "Free" : "Paid"}</span>
                    </span>
                    {completedIds.includes(module.id || "") ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur lg:px-8 print:hidden">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileSidebarOpen(true)} className="rounded-2xl border border-slate-200 p-2 lg:hidden"><Menu className="h-5 w-5" /></button>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Reading view</p>
                <h2 className="text-lg font-bold text-slate-900">{activeModule?.title || course.title}</h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeModule?.type === "text" ? <Button variant="outline" onClick={handlePrint} className="gap-2"><Printer className="h-4 w-4" /> Print</Button> : null}
              {activeModule?.type === "pdf" ? <Button onClick={handleUnlockDownload} disabled={paymentLoading} className="gap-2 bg-primary text-white hover:bg-primary/90"><Download className="h-4 w-4" /> {paymentGate ? "Download unlocked" : "Pay to download"}</Button> : null}
            </div>
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8">
            <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[1fr,280px]">
              <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm print:border-0 print:shadow-none">
                {activeModule?.type === "text" ? (
                  paymentGate || activeModule.isFree ? (
                    <article className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-primary prose-pre:bg-slate-950 prose-pre:text-white">
                      <h1>{activeModule.title}</h1>
                      <div dangerouslySetInnerHTML={{ __html: activeModule.content }} />
                    </article>
                  ) : (
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 text-sm text-slate-700">
                      <p className="font-semibold text-slate-900">This Type A module is paid</p>
                      <p className="mt-1">Complete payment to unlock the lesson content.</p>
                    </div>
                  )
                ) : activeModule?.type === "pdf" ? (
                  <div className="space-y-4">
                    <div ref={pdfContainerRef} className="max-h-[72vh] overflow-y-auto rounded-2xl bg-slate-50 p-4" />
                    {pdfError ? <p className="text-sm text-red-600">{pdfError}</p> : null}
                    {!paymentGate ? (
                      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-slate-700">
                        <p className="font-semibold text-slate-900">Download locked</p>
                        <p className="mt-1">View the lesson here, then complete payment to unlock the download button.</p>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">Select a module to begin.</div>
                )}
              </section>

              <aside className="space-y-4 print:hidden">
                <Card className="rounded-[1.5rem] border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Module status</p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span>{isCompleted ? "Completed" : "In progress"}</span>
                    <button onClick={() => void handleComplete()} className="rounded-xl border border-slate-200 px-3 py-2 font-semibold text-slate-700">Mark complete</button>
                  </div>
                </Card>

                <Card className="rounded-[1.5rem] border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Course info</p>
                  <p className="mt-3 text-lg font-bold text-slate-900">KES {Number(activeModule?.price || course.price || 0).toLocaleString()}</p>
                  <p className="mt-2 text-sm text-slate-600">{course.description}</p>
                  <Link to="/courses" className="mt-4 inline-flex text-sm font-semibold text-primary">Back to course catalog</Link>
                </Card>
              </aside>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
