import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, BadgeCheck, BookOpen, CheckCircle2, Clock3, Info, Layers3, Loader2, MapPin, Sparkles, Star, ShieldCheck, UserRound, UsersRound } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getActiveCourses, type Course } from "@/lib/firestore";
import { enrollCurrentLearner, enrollLearner } from "@/lib/learnerData";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const applicationRef = useRef<HTMLElement | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingApplication, setSavingApplication] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    fullName: "",
    email: "",
    password: "",
    age: "",
    location: "",
    hasLaptop: "yes",
    interestReason: "",
    relevantDetails: "",
  });

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setCourses(await getActiveCourses());
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
  const isEnrolled = Boolean(course?.id && profile?.enrolledCourses?.includes(course.id));
  const priceLabel = course?.isFree || Number(course?.price || 0) <= 0 ? "Free" : `KES ${Number(course?.price || 0).toLocaleString()}`;
  const courseSummary = course?.summary?.trim() || course?.description || "";
  const fallbackImage = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80";

  const courseStats = [
    { label: "Students", value: course ? course.students.toLocaleString() : "0" },
    { label: "Rating", value: course ? course.rating.toFixed(1) : "4.9" },
    { label: "Duration", value: course?.duration || "Flexible" },
  ];

  const courseHighlights = [
    course?.moduleCount ? `${course.moduleCount} module${course.moduleCount === 1 ? "" : "s"}` : "Structured learning path",
    course?.contentType === "pdf" ? "PDF learning materials" : "Flexible learning materials",
    course?.level || "All levels welcome",
  ];

  useEffect(() => {
    setApplicationForm((current) => ({
      ...current,
      fullName: current.fullName || profile?.displayName || user?.displayName || "",
      email: current.email || profile?.email || user?.email || "",
    }));
  }, [profile?.displayName, profile?.email, user?.displayName, user?.email]);

  useEffect(() => {
    if (window.location.hash === "#apply") {
      applicationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [course?.id]);

  const handleEnroll = () => {
    if (!course) return;

    if (isEnrolled) {
      navigate(`/courses/${course.id}`);
      return;
    }

    applicationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleApplicationSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!course?.id) return;

    if (!user && applicationForm.password.length < 6) {
      toast.error("Use a password with at least 6 characters");
      return;
    }

    setSavingApplication(true);
    try {
      const payload = {
        courseId: course.id,
        fullName: applicationForm.fullName,
        email: applicationForm.email,
        age: Number(applicationForm.age),
        location: applicationForm.location,
        hasLaptop: applicationForm.hasLaptop === "yes",
        interestReason: applicationForm.interestReason,
        relevantDetails: applicationForm.relevantDetails,
      };

      if (user) {
        await enrollCurrentLearner(payload);
      } else {
        await enrollLearner({ ...payload, password: applicationForm.password });
      }

      toast.success("Application submitted. Your course is pending admin approval.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code) : "";
      const message =
        code === "auth/email-already-in-use"
          ? "This email already has an account. Log in first, then apply from this page."
          : error instanceof Error
            ? error.message
            : "Unable to save your application right now.";
      toast.error(message);
    } finally {
      setSavingApplication(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.12),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-900">
        <Header />
        <main className="flex min-h-[70vh] items-center justify-center px-4 pt-24">
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/70 bg-white/90 px-8 py-10 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
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
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.12),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-900">
        <Header />
        <main className="flex min-h-[70vh] items-center justify-center px-4 pt-24">
          <div className="max-w-lg rounded-3xl border border-white/70 bg-white/90 p-8 text-center shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
            <h1 className="mt-4 text-2xl font-bold text-slate-900">Course not found</h1>
            <p className="mt-2 text-sm text-slate-500">The course link may be outdated or the course is still unpublished.</p>
            <button onClick={() => navigate("/courses")} className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white">
              Back to courses <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.12),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-900">
      <Header />

      <main className="relative pt-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-0 top-96 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" />
        </div>

        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img src={course.thumbnailUrl || fallbackImage} alt={course.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.94)_0%,rgba(15,23,42,0.82)_35%,rgba(15,23,42,0.58)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-50 to-transparent" />
          </div>

          <div className="relative mx-auto grid min-h-[82vh] max-w-7xl gap-10 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-[1.15fr,0.85fr] lg:px-8 lg:pt-16">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col justify-end">
              <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/80 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                {course.category}
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">
                {course.level || "Course"} · {course.contentType === "pdf" ? "PDF learning" : "Flexible learning"}
              </p>

              <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">{course.title}</h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-white/82 sm:text-lg">{course.description}</p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleEnroll}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_rgba(255,255,255,0.15)] transition hover:-translate-y-0.5 hover:bg-slate-100"
                >
                  {isEnrolled ? "Open Course" : "Enroll Now"}
                  <ArrowRight className="h-4 w-4" />
                </button>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur">
                  <BadgeCheck className="h-4 w-4 text-emerald-300" /> {priceLabel}
                </span>
              </div>

              <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3 sm:gap-4">
                {courseStats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/8 px-4 py-4 text-white backdrop-blur-xl">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/55">{stat.label}</p>
                    <p className="mt-2 text-xl font-bold sm:text-2xl">{stat.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.aside
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="lg:sticky lg:top-24 lg:self-start"
            >
              <div className="overflow-hidden rounded-[28px] border border-white/15 bg-white/10 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.28)] backdrop-blur-2xl sm:p-5">
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <img src={course.thumbnailUrl || fallbackImage} alt={course.title} className="h-60 w-full object-cover" />
                </div>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl bg-white/90 p-4 text-slate-900 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Course snapshot</p>
                    <div className="mt-4 grid gap-3 text-sm">
                      <div className="flex items-center justify-between gap-4">
                        <span className="inline-flex items-center gap-2 text-slate-500"><UsersRound className="h-4 w-4" /> Learners</span>
                        <span className="font-semibold text-slate-900">{course.students.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="inline-flex items-center gap-2 text-slate-500"><Star className="h-4 w-4" /> Rating</span>
                        <span className="font-semibold text-slate-900">{course.rating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="inline-flex items-center gap-2 text-slate-500"><Clock3 className="h-4 w-4" /> Duration</span>
                        <span className="font-semibold text-slate-900">{course.duration}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="inline-flex items-center gap-2 text-slate-500"><Layers3 className="h-4 w-4" /> Modules</span>
                        <span className="font-semibold text-slate-900">{course.moduleCount || "Flexible"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                    <div className="flex items-start gap-3">
                      <Info className="mt-0.5 h-5 w-5 shrink-0" />
                      <p>Submit the form below to apply. The course will appear in your dashboard as pending until admin approval.</p>
                    </div>
                  </div>

                  <button
                    onClick={handleEnroll}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5"
                  >
                    {isEnrolled ? "Open Course" : "Enroll Now"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.aside>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.15fr,0.85fr]">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-6">
              <div className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <BookOpen className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Overview</p>
                    <h2 className="text-2xl font-bold text-slate-900">Course Description</h2>
                  </div>
                </div>
                <p className="mt-4 whitespace-pre-line text-sm leading-8 text-slate-600">{course.description}</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                  <h2 className="text-xl font-bold text-slate-900">What this course covers</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {courseSummary || "A focused learning program built from the course materials prepared by the instructor."}
                  </p>
                </div>

                <div className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                  <h2 className="text-xl font-bold text-slate-900">Key highlights</h2>
                  <div className="mt-4 space-y-3">
                    {courseHighlights.map((item) => (
                      <div key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-8">
                <h2 className="text-2xl font-bold text-slate-900">Instructions</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-8 text-slate-600">
                  {course.instructions || "No extra instructions have been added for this course yet."}
                </p>
              </div>
            </motion.div>

            <aside className="space-y-6">
              <div className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Course details</p>
                <div className="mt-5 space-y-4 text-sm text-slate-600">
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-2 text-slate-500"><BookOpen className="h-4 w-4" />Category</span>
                    <span className="font-semibold text-slate-900">{course.category}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-2 text-slate-500"><ShieldCheck className="h-4 w-4" />Level</span>
                    <span className="font-semibold text-slate-900">{course.level || "Course"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-2 text-slate-500"><CheckCircle2 className="h-4 w-4" />Fee</span>
                    <span className="font-semibold text-slate-900">{priceLabel}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-2 text-slate-500"><MapPin className="h-4 w-4" />Access</span>
                    <span className="font-semibold text-slate-900">After approval</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-sm leading-6 text-slate-100 shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                  <p>Once approved, the course unlocks on your dashboard and any attached materials can be accessed from there.</p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {!isEnrolled ? (
          <section ref={applicationRef} id="apply" className="border-t border-white/70 bg-white/75 px-4 py-12 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr,1.15fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Enrollment form</p>
                <h2 className="mt-3 text-3xl font-bold text-slate-900">Apply for {course.title}</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                  Submit your learner details. Your dashboard will show this course as pending until admin approval is completed.
                </p>
              </div>

              <form onSubmit={handleApplicationSubmit} className="rounded-[28px] border border-white/70 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <UserRound className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Learner information</h3>
                    <p className="text-sm text-slate-500">{user ? "Signed-in application" : "New learner application"}</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 sm:col-span-2">
                    <span className="text-sm font-medium text-slate-700">Full name</span>
                    <input required value={applicationForm.fullName} onChange={(event) => setApplicationForm({ ...applicationForm, fullName: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Email address</span>
                    <input required type="email" disabled={Boolean(user?.email)} value={applicationForm.email} onChange={(event) => setApplicationForm({ ...applicationForm, email: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-slate-100" />
                  </label>
                  {!user ? (
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">Access password</span>
                      <input required type="password" minLength={6} value={applicationForm.password} onChange={(event) => setApplicationForm({ ...applicationForm, password: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
                    </label>
                  ) : null}
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Age</span>
                    <input required type="number" min={1} value={applicationForm.age} onChange={(event) => setApplicationForm({ ...applicationForm, age: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Location</span>
                    <input required value={applicationForm.location} onChange={(event) => setApplicationForm({ ...applicationForm, location: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="Town or county" />
                  </label>
                  <label className="space-y-2 sm:col-span-2">
                    <span className="text-sm font-medium text-slate-700">Do you have a laptop?</span>
                    <select value={applicationForm.hasLaptop} onChange={(event) => setApplicationForm({ ...applicationForm, hasLaptop: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </label>
                  <label className="space-y-2 sm:col-span-2">
                    <span className="text-sm font-medium text-slate-700">Why are you choosing this course?</span>
                    <textarea required rows={4} value={applicationForm.interestReason} onChange={(event) => setApplicationForm({ ...applicationForm, interestReason: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
                  </label>
                  <label className="space-y-2 sm:col-span-2">
                    <span className="text-sm font-medium text-slate-700">Any relevant details</span>
                    <textarea rows={3} value={applicationForm.relevantDetails} onChange={(event) => setApplicationForm({ ...applicationForm, relevantDetails: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="Your availability, learning goals, or anything the instructor should know" />
                  </label>
                </div>

                <Button disabled={savingApplication} className="mt-5 w-full gap-2 rounded-full py-6 text-base shadow-lg shadow-primary/15">
                  {savingApplication ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                  {savingApplication ? "Submitting application" : "Submit application"}
                  {!savingApplication ? <ArrowRight className="h-5 w-5" /> : null}
                </Button>
              </form>
            </div>
          </section>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
