import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Loader2, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getCourseById, type Course } from "@/lib/firestore";
import { enrollCurrentLearner, enrollLearner } from "@/lib/learnerData";

type EnrollFormState = {
  fullName: string;
  email: string;
  password: string;
  age: string;
  location: string;
  guardianContact: string;
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
  const [form, setForm] = useState<EnrollFormState>({
    fullName: "",
    email: "",
    password: "",
    age: "",
    location: "",
    guardianContact: "",
    hasLaptop: "yes",
    interestReason: "",
    relevantDetails: "",
  });

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
      email: current.email || profile?.email || user?.email || "",
    }));
  }, [profile?.displayName, profile?.email, user?.displayName, user?.email]);

  const ageNumber = useMemo(() => Number(form.age || 0), [form.age]);
  const needsGuardianDetails = ageNumber > 0 && ageNumber < 18;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!course?.id) return;

    if (!user && form.password.length < 6) {
      toast.error("Use a password with at least 6 characters");
      return;
    }

    if (needsGuardianDetails && !form.guardianContact.trim()) {
      toast.error("Add a parent or guardian contact for applicants under 18.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        courseId: course.id,
        fullName: form.fullName,
        email: form.email,
        age: ageNumber,
        location: form.location,
        guardianContact: form.guardianContact.trim(),
        hasLaptop: form.hasLaptop === "yes",
        interestReason: form.interestReason,
        relevantDetails: form.relevantDetails,
      };

      if (user) {
        await enrollCurrentLearner(payload);
      } else {
        await enrollLearner({ ...payload, password: form.password });
      }

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(220,38,38,0.09),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_100%)] text-slate-900">
      <Header />
      <main className="mx-auto w-full max-w-4xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <div className="grid lg:grid-cols-[0.9fr,1.1fr]">
            <section className="bg-gradient-to-br from-primary to-accent p-8 text-white sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">Course application</p>
              <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">Apply for {course.title}</h1>
              <p className="mt-4 max-w-md text-sm leading-7 text-white/80">
                Submit your details here. If you are under 18, a parent or guardian contact is required so they know you have enrolled.
              </p>

              <div className="mt-8 space-y-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <div className="flex items-start gap-3 text-sm text-white/90">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Applications are reviewed before access is granted.</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-white/90">
                  <UserRound className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>New learners create an account during submission.</span>
                </div>
              </div>
            </section>

            <section className="p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Learner details</h2>
                <p className="mt-2 text-sm text-slate-500">Your dashboard will show this course as pending until admin approval.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 sm:col-span-2">
                    <span className="text-sm font-medium text-slate-700">Full name</span>
                    <input required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Email address</span>
                    <input required type="email" disabled={Boolean(user?.email)} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:bg-slate-100" />
                  </label>

                  {!user ? (
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">Access password</span>
                      <input required type="password" minLength={6} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
                    </label>
                  ) : null}

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Age</span>
                    <input required type="number" min={13} value={form.age} onChange={(event) => setForm({ ...form, age: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
                  </label>

                  {needsGuardianDetails ? (
                    <label className="space-y-2 sm:col-span-2">
                      <span className="text-sm font-medium text-slate-700">Parent or guardian contact</span>
                      <input required value={form.guardianContact} onChange={(event) => setForm({ ...form, guardianContact: event.target.value })} placeholder="Phone number or email" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" />
                    </label>
                  ) : null}

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
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
