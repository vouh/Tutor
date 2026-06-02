import { type FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, BookOpen, CheckCircle2, Loader2, Sparkles, ShieldCheck, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getCourseById, type Course } from "@/lib/firestore";
import { enrollCurrentLearner } from "@/lib/learnerData";

type EnrollFormState = {
  fullName: string;
  age: string;
  location: string;
  hasLaptop: string;
  interestReason: string;
  relevantDetails: string;
};

export default function Enroll() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('signup');
  const [form, setForm] = useState<EnrollFormState>({
    fullName: "",
    age: "",
    location: "",
    hasLaptop: "yes",
    interestReason: "",
    relevantDetails: "",
  });

  const openAuth = (tab: 'login' | 'signup') => {
    setAuthTab(tab);
    setAuthModalOpen(true);
  };

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const loadedCourse = await getCourseById(id);
        setCourse(loadedCourse);
      } catch (error) {
        console.error("Unable to load course", error);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      fullName: current.fullName || profile?.displayName || user?.displayName || "",
    }));
  }, [profile?.displayName, profile?.email, user?.displayName, user?.email]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!course?.id) return;

    if (!user) {
      toast.error("Please sign in or create an account before enrolling.");
      openAuth('signup');
      return;
    }

    if (!user.email) {
      toast.error("Your account email is missing. Please sign in again.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        courseId: course.id,
        fullName: form.fullName,
        email: user.email,
        age: Number(form.age || 0),
        location: form.location,
        hasLaptop: form.hasLaptop === "yes",
        interestReason: form.interestReason,
        relevantDetails: form.relevantDetails,
      };

      await enrollCurrentLearner(payload);

      toast.success("Application submitted. Your course is pending admin approval.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Unable to submit application");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Header />
        <main className="flex min-h-[60vh] items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Header />
        <main className="flex min-h-[60vh] items-center justify-center p-6">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm text-slate-600 shadow-sm">Course not found.</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.06),_transparent_24%),linear-gradient(180deg,_#f8fafc_0%,_#fff7f7_100%)] text-slate-900">
      <Header />
      <main className="pt-24">
        <section className="border-b border-slate-200/70">
          <div className="mx-auto grid w-full max-w-[1600px] gap-8 px-4 pb-10 sm:px-6 lg:grid-cols-[0.96fr,1.04fr] lg:px-8">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col justify-between overflow-hidden rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8"
            >
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                  
                  Course application
                </span>
                <h1 className="mt-5 max-w-2xl text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
                  Apply for {course.title} today.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  Create an account or sign in first, then submit your learner details. We keep the enrollment experience focused and avoid asking for a separate access email.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {[
                    { label: 'Secure access', value: 'Account required' },
                    { label: 'Processing', value: 'Admin review' },
                    { label: 'Outcome', value: 'Dashboard access' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-3xl border border-slate-200 bg-slate-50/90 px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button type="button" onClick={() => openAuth('signup')} className="rounded-full bg-gradient-to-r from-primary to-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20">
                  Create account
                </Button>
                <Button type="button" variant="outline" onClick={() => openAuth('login')} className="rounded-full px-6 py-3 text-sm font-semibold">
                  Sign in
                </Button>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-xs font-medium text-slate-500">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Your learner account controls access.
                </span>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-slate-950 shadow-[0_28px_80px_rgba(15,23,42,0.22)]"
            >
              <img
                src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80'}
                alt={course.title}
                className="h-full min-h-[24rem] w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.05)_0%,rgba(15,23,42,0.28)_42%,rgba(15,23,42,0.78)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <div className="max-w-xl rounded-[28px] border border-white/15 bg-white/12 p-5 text-white backdrop-blur-xl sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/65">Course preview</p>
                  <h2 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">{course.title}</h2>
                  <p className="mt-3 max-w-lg text-sm leading-7 text-white/78">{course.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/12 px-3 py-1.5 text-xs font-medium text-white/85">{course.category}</span>
                    <span className="rounded-full bg-white/12 px-3 py-1.5 text-xs font-medium text-white/85">{course.level || 'All levels'}</span>
                    <span className="rounded-full bg-white/12 px-3 py-1.5 text-xs font-medium text-white/85">{course.duration || 'Flexible schedule'}</span>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-[1600px] gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr,1.1fr] lg:px-8 lg:py-16">
          <aside className="space-y-6">
            <div className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">What happens next</p>
              <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
                {[
                  'Sign in or create an account first.',
                  'Complete the learner details below.',
                  'We review the application and activate access once approved.',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-sm leading-7 text-slate-100 shadow-[0_24px_60px_rgba(15,23,42,0.16)] sm:p-8">
              <div className="flex items-start gap-3">
                <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                <p>
                  {user
                    ? `You are signed in as ${user.email}. Submit the form when you're ready.`
                    : 'You need an account before submitting enrollment details. Use the buttons above to continue.'}
                </p>
              </div>
            </div>
          </aside>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Learner details</h2>
                <p className="mt-2 text-sm text-slate-500">This form uses the account you are signed in with. No separate access email is required.</p>
              </div>
              {user?.email ? (
                <span className="rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold text-primary">{user.email}</span>
              ) : null}
            </div>

            {!user ? (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <UserRound className="mx-auto h-10 w-10 text-slate-300" />
                <h3 className="mt-4 text-xl font-semibold text-slate-900">Sign in to continue</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">Create your account or sign in, then come back here to complete the enrollment form.</p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Button type="button" onClick={() => openAuth('signup')} className="rounded-full bg-gradient-to-r from-primary to-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20">
                    Create account
                  </Button>
                  <Button type="button" variant="outline" onClick={() => openAuth('login')} className="rounded-full px-6 py-3 text-sm font-semibold">
                    Sign in
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 sm:col-span-2">
                    <span className="text-sm font-medium text-slate-700">Full name</span>
                    <input required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Age</span>
                    <input required type="number" min={13} value={form.age} onChange={(event) => setForm({ ...form, age: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Location</span>
                    <input required value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Do you have a laptop?</span>
                    <select value={form.hasLaptop} onChange={(event) => setForm({ ...form, hasLaptop: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10">
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </label>

                  <label className="space-y-2 sm:col-span-2">
                    <span className="text-sm font-medium text-slate-700">Why are you choosing this course?</span>
                    <textarea required rows={4} value={form.interestReason} onChange={(event) => setForm({ ...form, interestReason: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
                  </label>

                  <label className="space-y-2 sm:col-span-2">
                    <span className="text-sm font-medium text-slate-700">Any relevant details</span>
                    <textarea rows={3} value={form.relevantDetails} onChange={(event) => setForm({ ...form, relevantDetails: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="Your availability, learning goals, or anything the instructor should know" />
                  </label>
                </div>

                <Button disabled={saving} className="mt-2 w-full gap-2 rounded-full py-6 text-base shadow-lg shadow-primary/15">
                  {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                  {saving ? "Submitting application" : "Submit application"}
                  {!saving ? <ArrowRight className="h-5 w-5" /> : null}
                </Button>
              </form>
            )}
          </motion.section>
        </section>
      </main>
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultTab={authTab} />
      <Footer />
    </div>
  );
}
