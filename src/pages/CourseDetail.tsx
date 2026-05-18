import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, BadgeCheck, BookOpen, CheckCircle2, Clock3, Layers3, Loader2, MapPin, ShieldCheck, Sparkles, Star } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getActiveCourses, type Course } from "@/lib/firestore";
import { getModules, type ModuleRecord } from "@/lib/adminData";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<ModuleRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await getActiveCourses();
        setCourses(data);
      } catch (error) {
        console.error("Unable to load course details", error);
      } finally {
        setLoading(false);
      }
    };

    void loadCourses();
  }, []);

  const course = useMemo(
    () => courses.find((item) => item.id === id || item.slug === id) || null,
    [courses, id]
  );

  useEffect(() => {
    if (!course?.id) return;

    const loadModules = async () => {
      try {
        const data = await getModules(course.id);
        setModules(data);
      } catch (error) {
        console.error("Unable to load course modules", error);
      }
    };

    void loadModules();
  }, [course?.id]);

  const highlights = [
    "Create your learner account before access",
    "Actual module titles and descriptions from Firestore",
    "Payment instructions are handled after enrollment",
    "Your course stays linked to your email account",
  ];

  const handleEnroll = () => {
    if (!course) return;

    navigate(`/enroll/${course.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Header />
        <main className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="flex flex-col items-center gap-3 rounded-[1.75rem] border border-slate-200 bg-white px-8 py-10 shadow-sm">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-slate-500">Loading course details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Header />
        <main className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="max-w-lg rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
            <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
            <h1 className="mt-4 text-2xl font-bold text-slate-900">Course not found</h1>
            <p className="mt-2 text-sm text-slate-500">The course link may be outdated or the course is still unpublished.</p>
            <button
              onClick={() => navigate("/courses")}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white"
            >
              Back to courses <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f3] text-slate-900">
      <Header />

      <main className="pt-24">
        <section className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.16),_transparent_24%),linear-gradient(135deg,_#0f172a_0%,_#172554_45%,_#0f766e_100%)] text-white">
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr,0.8fr] lg:px-8 lg:py-20">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/80 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-amber-300" />
                Course preview
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium text-white/70">{course.category} · {course.level}</p>
                <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                  {course.title}
                </h1>
                <p className="max-w-2xl text-base leading-7 text-white/82 sm:text-lg">
                  {course.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                  <Star className="h-4 w-4 text-amber-300" />
                  {course.rating || 4.9} rating
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                  <Layers3 className="h-4 w-4" />
                  {course.moduleCount || 1} modules
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                  <Clock3 className="h-4 w-4" />
                  {course.duration || "Self-paced"}
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="relative"
            >
              <div className="overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-xl">
                <img
                  src={course.thumbnailUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"}
                  alt={course.title}
                  className="h-72 w-full object-cover sm:h-80"
                />
                <div className="space-y-4 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-white/60">Enrollment</p>
                      <p className="mt-1 text-2xl font-bold text-white">
                        {course.isFree || Number(course.price || 0) <= 0 ? "Free" : `KES ${Number(course.price || 0).toLocaleString()}`}
                      </p>
                    </div>
                    <BadgeCheck className="h-10 w-10 text-emerald-300" />
                  </div>

                  <button
                    onClick={handleEnroll}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-semibold text-slate-900 transition-transform hover:scale-[1.01]"
                  >
                    {course.isFree || Number(course.price || 0) <= 0 ? "Start Learning" : "Enroll Now"}
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <p className="text-xs leading-5 text-white/65">
                    Create your learner account first. Our team will follow up with payment instructions after enrollment.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.15fr,0.85fr] lg:px-8 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900">What this course gives you</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                This page keeps the public preview focused on the course overview, instructions, and enrollment entry point. The outline below comes from the real course modules saved in Firestore.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {highlights.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                    <p className="text-sm font-medium text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900">Instructions</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                {course.instructions || "No extra instructions have been added for this course yet."}
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900">Course content</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                These are the actual modules linked to this course.
              </p>
              <div className="mt-6 space-y-4">
                {modules.length > 0 ? modules.map((module) => (
                  <div key={module.id || module.title} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Module {module.order}</p>
                        <h3 className="mt-1 text-lg font-semibold text-slate-900">{module.title}</h3>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-600">
                        {module.type}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{module.description}</p>
                    {module.assignment ? (
                      <div className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        <span className="font-semibold">Assignment: </span>
                        {module.assignment}
                      </div>
                    ) : null}
                  </div>
                )) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                    No modules have been added for this course yet.
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <aside className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Course details</p>
              <div className="mt-5 space-y-4 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-2 text-slate-500"><BookOpen className="h-4 w-4" />Category</span>
                  <span className="font-semibold text-slate-900">{course.category}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-2 text-slate-500"><ShieldCheck className="h-4 w-4" />Level</span>
                  <span className="font-semibold text-slate-900">{course.level}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-2 text-slate-500"><Layers3 className="h-4 w-4" />Modules</span>
                  <span className="font-semibold text-slate-900">{course.moduleCount || 1}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-2 text-slate-500"><MapPin className="h-4 w-4" />Access</span>
                  <span className="font-semibold text-slate-900">Learner account</span>
                </div>
              </div>
            </motion.div>

            <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Need help recovering access?</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enroll with your email and password, then return to your dashboard any time.
              </p>
            </div>
          </aside>
        </section>
      </main>

      <Footer />
    </div>
  );
}
