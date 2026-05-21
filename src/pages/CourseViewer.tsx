import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ChevronLeft, ChevronRight, FileText, Home, LayoutDashboard, Loader2, Menu, MoonStar, PlayCircle, SunMedium, X } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getCourse, getModules, type CourseRecord, type ModuleRecord } from "@/lib/adminData";
import { getCompletedModuleIds, getEnrollmentStatus, markModuleComplete, verifySession, type LearnerRecord } from "@/lib/learnerData";

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
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

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

  const navItems = [
    { label: "Home", path: "/", icon: Home },
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Courses", path: "/courses", icon: BookOpen },
  ];

  const sidebar = (
    <aside className="flex h-full flex-col border-r border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="border-b border-slate-100 p-5 dark:border-slate-800">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Course</p>
            <h1 className="mt-2 text-xl font-bold leading-tight text-slate-950 dark:text-white">{course.title}</h1>
            <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-500 dark:text-slate-400">{course.description}</p>
          </div>
          <button onClick={() => setMobileSidebarOpen(false)} className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-red-400 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{completedIds.length} of {modules.length} modules completed</p>
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
                  ? "bg-primary/10 text-primary ring-1 ring-primary/15 dark:bg-primary/15 dark:ring-primary/25"
                  : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900"
              }`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${active ? "bg-primary text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"}`}>
                {done ? <CheckCircle2 className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">Module {module.order}: {module.title}</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">{module.type.toUpperCase()}</span>
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="flex min-h-screen">
        <div className="hidden w-84 shrink-0 lg:block lg:w-[22rem]">{sidebar}</div>
        {mobileSidebarOpen ? <div className="fixed inset-0 z-40 lg:hidden"><div className="absolute inset-0 bg-black/40" onClick={() => setMobileSidebarOpen(false)} /><div className="absolute inset-y-0 left-0 w-80 max-w-[86vw]">{sidebar}</div></div> : null}

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 sm:px-6">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <button onClick={() => setMobileSidebarOpen(true)} className="rounded-md border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900 lg:hidden">
                  <Menu className="h-5 w-5" />
                </button>
                <div className="min-w-0">
                  <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 hover:text-primary dark:text-slate-400">
                    <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
                  </Link>
                  <h2 className="mt-1 truncate text-lg font-bold text-slate-950 dark:text-white">{activeModule?.title || course.title}</h2>
                </div>
              </div>
              <div className="hidden items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900 md:flex">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.path} to={item.path} className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-primary dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  aria-label="Toggle theme"
                >
                  {isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
                </button>
                <Button onClick={() => void handleComplete()} disabled={isCompleted || !activeModule} className="hidden rounded-md sm:inline-flex">
                  {isCompleted ? "Completed" : "Mark complete"}
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 bg-[radial-gradient(circle_at_top_left,_rgba(220,38,38,0.08),_transparent_32%),linear-gradient(180deg,_rgba(248,250,252,1),_rgba(241,245,249,1))] px-4 py-6 dark:bg-[radial-gradient(circle_at_top_left,_rgba(220,38,38,0.18),_transparent_34%),linear-gradient(180deg,_rgba(2,6,23,1),_rgba(15,23,42,1))] sm:px-6">
            <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[minmax(0,1fr),320px]">
              <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
                <div className="border-b border-slate-100 p-6 dark:border-slate-800">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Module {activeModule?.order || "-"}</p>
                  <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">{activeModule?.title || "Select a module"}</h1>
                  {activeModule?.description ? <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{activeModule.description}</p> : null}
                </div>

                <div className="min-h-[62vh] p-6">
                  {contentType === "pdf" && activeModule?.pdfUrl ? (
                    <div className="space-y-6">
                      <iframe title={activeModule.title} src={activeModule.pdfUrl} className="h-[70vh] w-full rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950" />
                      {activeModule.content ? <RichContent html={activeModule.content} /> : null}
                    </div>
                  ) : contentType === "video" && activeModule?.pdfUrl ? (
                    <div className="space-y-6">
                      <iframe title={activeModule.title} src={activeModule.pdfUrl} allowFullScreen className="aspect-video w-full rounded-lg border border-slate-200 bg-black dark:border-slate-800" />
                      {activeModule.content ? <RichContent html={activeModule.content} /> : null}
                    </div>
                  ) : activeModule ? (
                    <RichContent html={activeModule.content} />
                  ) : (
                    <div className="flex min-h-[50vh] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">Select a module to begin.</div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-5 dark:border-slate-800">
                  <Button variant="outline" onClick={() => moveModule("previous")} disabled={activeIndex <= 0} className="gap-2 rounded-md">
                    <ChevronLeft className="h-4 w-4" /> Previous Module
                  </Button>
                  <Button onClick={() => moveModule("next")} disabled={activeIndex < 0 || activeIndex >= modules.length - 1} className="gap-2 rounded-md">
                    Next Module <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </section>

              <aside className="space-y-4">
                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Status</p>
                  <p className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">{progress}% complete</p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-red-400" style={{ width: `${progress}%` }} />
                  </div>
                  <Button onClick={() => void handleComplete()} disabled={isCompleted || !activeModule} className="mt-4 w-full rounded-md">
                    {isCompleted ? "Completed" : "Mark as Complete"}
                  </Button>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Content</p>
                  <div className="mt-3 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <PlayCircle className="h-5 w-5 text-primary" />
                    <span>{modules.length} modules available</span>
                  </div>
                  {activeModule?.assignment ? (
                    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
                      <span className="font-semibold">Assignment: </span>{activeModule.assignment}
                    </div>
                  ) : null}
                  {activeModule?.pdfUrl ? (
                    <a href={activeModule.pdfUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                      Open resource <ArrowRight className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>

                <div className="grid grid-cols-3 gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 md:hidden">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.path} to={item.path} className="flex flex-col items-center gap-1 rounded-md px-2 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-primary dark:text-slate-300 dark:hover:bg-slate-800">
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
      </div>
    </div>
  );
}
