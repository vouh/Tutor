import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, FileText, Loader2, Menu, PlayCircle, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getCourse, getModules, type CourseRecord, type ModuleRecord } from "@/lib/adminData";
import { getCompletedModuleIds, markModuleComplete, verifySession, type LearnerRecord } from "@/lib/learnerData";

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
        const [courseData, moduleData, learnerData] = await Promise.all([getCourse(id), getModules(id), verifySession()]);
        if (!learnerData) {
          navigate("/login", { replace: true, state: { redirectTo: `/courses/${id}` } });
          return;
        }
        if (!learnerData.enrolledCourses.includes(id)) {
          toast.error("You are not enrolled in this course.");
          navigate("/dashboard", { replace: true });
          return;
        }

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
    await markModuleComplete(learner.email, id, activeModule.id);
    setCompletedIds(await getCompletedModuleIds(learner.email, id));
    toast.success("Module marked complete");
  };

  const contentType = activeModule?.type === "video" ? "video" : activeModule?.type === "pdf" ? "pdf" : "text";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" /> Loading course
      </div>
    );
  }

  if (!course) {
    return <div className="min-h-screen bg-slate-50 p-8 text-slate-600">Course not found.</div>;
  }

  const sidebar = (
    <aside className="flex h-full flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Course</p>
            <h1 className="mt-2 text-xl font-bold leading-tight text-slate-900">{course.title}</h1>
          </div>
          <button onClick={() => setMobileSidebarOpen(false)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-xs text-slate-500">{completedIds.length} of {modules.length} modules completed</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {modules.map((module) => {
          const active = module.id === activeModule?.id;
          const done = completedIds.includes(module.id || "");
          return (
            <button
              key={module.id}
              onClick={() => openModule(module)}
              className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${active ? "bg-primary/10 text-primary" : "text-slate-700 hover:bg-slate-50"}`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${active ? "bg-primary text-white" : "bg-slate-100 text-slate-500"}`}>
                {done ? <CheckCircle2 className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">Module {module.order}: {module.title}</span>
                <span className="block text-xs text-slate-500">{module.type.toUpperCase()}</span>
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <div className="hidden w-80 shrink-0 lg:block">{sidebar}</div>
        {mobileSidebarOpen ? <div className="fixed inset-0 z-40 lg:hidden"><div className="absolute inset-0 bg-black/40" onClick={() => setMobileSidebarOpen(false)} /><div className="absolute inset-y-0 left-0 w-80 max-w-[86vw]">{sidebar}</div></div> : null}

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <button onClick={() => setMobileSidebarOpen(true)} className="rounded-2xl border border-slate-200 p-2 lg:hidden">
                  <Menu className="h-5 w-5" />
                </button>
                <div className="min-w-0">
                  <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 hover:text-primary">
                    <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
                  </Link>
                  <h2 className="mt-1 truncate text-lg font-bold text-slate-900">{activeModule?.title || course.title}</h2>
                </div>
              </div>
              <Button onClick={() => void handleComplete()} disabled={isCompleted || !activeModule} className="hidden rounded-2xl sm:inline-flex">
                {isCompleted ? "Completed" : "Mark complete"}
              </Button>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6">
            <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[1fr,300px]">
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Module {activeModule?.order || "-"}</p>
                  <h1 className="mt-2 text-2xl font-bold text-slate-900">{activeModule?.title || "Select a module"}</h1>
                  {activeModule?.description ? <p className="mt-2 text-sm leading-6 text-slate-600">{activeModule.description}</p> : null}
                </div>

                <div className="min-h-[62vh] p-5">
                  {contentType === "pdf" && activeModule?.pdfUrl ? (
                    <iframe title={activeModule.title} src={activeModule.pdfUrl} className="h-[70vh] w-full rounded-2xl border border-slate-200 bg-slate-50" />
                  ) : contentType === "video" && activeModule?.pdfUrl ? (
                    <iframe title={activeModule.title} src={activeModule.pdfUrl} allowFullScreen className="aspect-video w-full rounded-2xl border border-slate-200 bg-black" />
                  ) : activeModule ? (
                    <article className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-primary">
                      <div dangerouslySetInnerHTML={{ __html: activeModule.content || "<p>No lesson content has been added yet.</p>" }} />
                    </article>
                  ) : (
                    <div className="flex min-h-[50vh] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-500">Select a module to begin.</div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-5">
                  <Button variant="outline" onClick={() => moveModule("previous")} disabled={activeIndex <= 0} className="gap-2 rounded-2xl">
                    <ChevronLeft className="h-4 w-4" /> Previous Module
                  </Button>
                  <Button onClick={() => moveModule("next")} disabled={activeIndex < 0 || activeIndex >= modules.length - 1} className="gap-2 rounded-2xl">
                    Next Module <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </section>

              <aside className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Status</p>
                  <p className="mt-3 text-2xl font-bold text-slate-900">{progress}% complete</p>
                  <Button onClick={() => void handleComplete()} disabled={isCompleted || !activeModule} className="mt-4 w-full rounded-2xl">
                    {isCompleted ? "Completed" : "Mark as Complete"}
                  </Button>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Content</p>
                  <div className="mt-3 flex items-center gap-3 text-sm text-slate-600">
                    <PlayCircle className="h-5 w-5 text-primary" />
                    <span>{modules.length} modules available</span>
                  </div>
                  {activeModule?.assignment ? (
                    <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                      <span className="font-semibold">Assignment: </span>{activeModule.assignment}
                    </div>
                  ) : null}
                  {activeModule?.pdfUrl ? (
                    <a href={activeModule.pdfUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                      Open resource <ArrowRight className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>
              </aside>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
