import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, BookOpen, CheckCircle2, ChevronLeft, ChevronRight, FileText, Loader2, Menu, PlayCircle, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getCourse, getModules, type CourseRecord, type ModuleRecord } from "@/lib/adminData";
import { getCompletedModuleIds, getEnrollmentStatus, markModuleComplete, verifySession, type LearnerRecord } from "@/lib/learnerData";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function RichContent({ html }: { html?: string }) {
  return (
    <div
      className="rich-content ql-editor prose prose-slate max-w-none dark:prose-invert prose-headings:text-slate-950 dark:prose-headings:text-white prose-p:leading-7 dark:text-slate-200"
      dangerouslySetInnerHTML={{ __html: html || "<p>No lesson content has been added yet.</p>" }}
    />
  );
}

export default function CourseViewer() {
  const { id, moduleId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseRecord | null>(null);
  const [modules, setModules] = useState<ModuleRecord[]>([]);
  const [learner, setLearner] = useState<LearnerRecord | null>(null);
  const [activeModule, setActiveModule] = useState<ModuleRecord | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadCourse = async () => {
      setLoading(true);
      try {
        const [courseData, learnerData] = await Promise.all([getCourse(id), verifySession()]);
        if (!learnerData) {
          navigate("/login", { replace: true, state: { redirectTo: `/courses/${id}` } });
          return;
        }
        const enrollmentStatus = await getEnrollmentStatus(learnerData.uid, id);
        if (enrollmentStatus !== "active") {
          toast.error(enrollmentStatus === "pending" ? "Your course access is pending admin approval." : "You do not have access to this course.");
          navigate("/dashboard", { replace: true });
          return;
        }
        const moduleData = await getModules(id);

        const sortedModules = [...moduleData].sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
        const selectedModule = moduleId ? sortedModules.find((module) => module.id === moduleId) : sortedModules[0];
        setCourse(courseData);
        setModules(sortedModules);
        setLearner(learnerData);
        setActiveModule(selectedModule || sortedModules[0] || null);
        setCompletedIds(await getCompletedModuleIds(learnerData.email, id));
      } catch {
        toast.error("Unable to load course");
      } finally {
        setLoading(false);
      }
    };

    void loadCourse();
  }, [id, moduleId, navigate]);

  const activeIndex = useMemo(
    () => modules.findIndex((module) => module.id === activeModule?.id),
    [activeModule?.id, modules]
  );

  const progress = modules.length > 0 ? Math.round((completedIds.length / modules.length) * 100) : 0;
  const isCompleted = activeModule?.id ? completedIds.includes(activeModule.id) : false;
  const navItems = [
    { label: "Home", path: "/", icon: BookOpen },
    { label: "Dashboard", path: "/dashboard", icon: BookOpen },
    { label: "Courses", path: "/courses", icon: BookOpen },
  ];

  const openModule = (module: ModuleRecord) => {
    if (!id || !module.id) return;
    navigate(`/courses/${id}/${module.id}`);
    setMobileSidebarOpen(false);
  };

  const moveModule = (direction: "previous" | "next") => {
    const nextIndex = direction === "previous" ? activeIndex - 1 : activeIndex + 1;
    const nextModule = modules[nextIndex];
    if (nextModule) openModule(nextModule);
  };

  const handleComplete = async () => {
    if (!id || !activeModule?.id || !learner) return;
    try {
      await markModuleComplete(learner.email, id, activeModule.id);
      setCompletedIds(prev => Array.from(new Set([...prev, activeModule.id!])));
      toast.success("Module marked complete");
    } catch (err) {
      console.error("Failed to mark module complete:", err);
      toast.error("Failed to mark module complete. Please try again.");
    }
  };

  const contentType = activeModule?.type === "video" ? "video" : activeModule?.type === "pdf" ? "pdf" : "text";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Loader2 className="h-5 w-5 animate-spin text-primary" /> Loading course
        </div>
      </div>
    );
  }

  if (!course) {
    return <div className="min-h-screen bg-slate-50 p-8 text-slate-600 dark:bg-slate-950 dark:text-slate-300">Course not found.</div>;
  }

  const sidebar = (
    <aside className="flex h-full flex-col border-r border-border bg-card/95 text-card-foreground backdrop-blur">
      <div className="border-b border-border p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Course</p>
            <h1 className="mt-2 text-xl font-bold leading-tight text-foreground">{course.title}</h1>
            <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">{course.description}</p>
          </div>
          <button onClick={() => setMobileSidebarOpen(false)} className="rounded-md p-2 text-muted-foreground hover:bg-muted lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-red-400 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{completedIds.length} of {modules.length} modules completed</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {modules.map((module) => {
          const active = module.id === activeModule?.id;
          const done = completedIds.includes(module.id || "");
          return (
            <button
              key={module.id}
              onClick={() => openModule(module)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition ${
                active
                    ? "bg-primary/10 text-primary ring-1 ring-primary/15"
                    : "text-foreground hover:bg-muted"
              }`}
            >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${active ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                {done ? <CheckCircle2 className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">Module {module.order}: {module.title}</span>
                  <span className="block text-xs text-muted-foreground">{module.type.toUpperCase()}</span>
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );

  return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />

        <div className="flex min-h-screen flex-col pt-16">
          <div className="flex flex-1">
            <div className="hidden w-84 shrink-0 lg:block lg:w-[22rem]">{sidebar}</div>
            {mobileSidebarOpen ? <div className="fixed inset-0 z-40 lg:hidden"><div className="absolute inset-0 bg-black/40" onClick={() => setMobileSidebarOpen(false)} /><div className="absolute inset-y-0 left-0 w-80 max-w-[86vw]">{sidebar}</div></div> : null}

          <main className="flex-1 bg-[linear-gradient(180deg,_rgba(255,255,255,0.85),_rgba(247,248,250,1))] px-4 py-6 sm:px-6 dark:bg-[linear-gradient(180deg,_rgba(2,6,23,1),_rgba(15,23,42,1))]">
            <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[minmax(0,1fr),320px]">
              <section className="overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-sm">
                <div className="border-b border-border px-6 py-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Module {activeModule?.order || "-"}</p>
                      <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">{activeModule?.title || "Select a module"}</h1>
                      {activeModule?.description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{activeModule.description}</p> : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button variant="outline" onClick={() => setMobileSidebarOpen(true)} className="gap-2 rounded-full lg:hidden">
                        <Menu className="h-4 w-4" /> Modules
                      </Button>
                      <Button onClick={() => void handleComplete()} disabled={isCompleted || !activeModule} className="rounded-full px-5">
                        {isCompleted ? "Completed" : "Mark complete"}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="min-h-[62vh] px-6 py-6">
                  {contentType === "pdf" && activeModule?.pdfUrl ? (
                    <div className="space-y-6">
                      <iframe title={activeModule.title} src={activeModule.pdfUrl} className="h-[70vh] w-full rounded-2xl border border-border bg-muted" />
                      {activeModule.content ? <RichContent html={activeModule.content} /> : null}
                    </div>
                  ) : contentType === "video" && activeModule?.pdfUrl ? (
                    <div className="space-y-6">
                      <iframe title={activeModule.title} src={activeModule.pdfUrl} allowFullScreen className="aspect-video w-full rounded-2xl border border-border bg-black" />
                      {activeModule.content ? <RichContent html={activeModule.content} /> : null}
                    </div>
                  ) : activeModule ? (
                    <RichContent html={activeModule.content} />
                  ) : (
                    <div className="flex min-h-[50vh] items-center justify-center rounded-2xl border border-dashed border-border bg-muted text-muted-foreground">Select a module to begin.</div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-5">
                  <Button variant="outline" onClick={() => moveModule("previous")} disabled={activeIndex <= 0} className="gap-2 rounded-full">
                    <ChevronLeft className="h-4 w-4" /> Previous Module
                  </Button>
                  <Button onClick={() => moveModule("next")} disabled={activeIndex < 0 || activeIndex >= modules.length - 1} className="gap-2 rounded-full">
                    Next Module <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </section>

              <aside className="space-y-4">
                <div className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Status</p>
                  <p className="mt-3 text-3xl font-bold text-foreground">{progress}% complete</p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-red-400" style={{ width: `${progress}%` }} />
                  </div>
                  <Button onClick={() => void handleComplete()} disabled={isCompleted || !activeModule} className="mt-4 w-full rounded-full">
                    {isCompleted ? "Completed" : "Mark as Complete"}
                  </Button>
                </div>

                <div className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Content</p>
                  <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
                    <PlayCircle className="h-5 w-5 text-primary" />
                    <span>{modules.length} modules available</span>
                  </div>
                  {activeModule?.assignment ? (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                      <span className="font-semibold">Assignment: </span>{activeModule.assignment}
                    </div>
                  ) : null}
                  {activeModule?.pdfUrl ? (
                    <a href={activeModule.pdfUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                      Open resource <ArrowRight className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>

                <div className="grid grid-cols-3 gap-2 rounded-[1.5rem] border border-border bg-card p-2 shadow-sm md:hidden">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.path} to={item.path} className="flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground">
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </aside>
            </div>
          </main>
        </div>

        <Footer />
    </div>
  );
}
