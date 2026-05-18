import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Laptop, UserRound } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getCourse, type CourseRecord } from "@/lib/adminData";
import { enrollLearner } from "@/lib/learnerData";

export default function Enroll() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    age: "",
    hasLaptop: "yes",
    interestReason: "",
  });

  useEffect(() => {
    if (!id) return;
    getCourse(id)
      .then(setCourse)
      .catch(() => toast.error("Unable to load course"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id) return;
    if (form.password.length < 6) {
      toast.error("Use a password with at least 6 characters");
      return;
    }
    setSaving(true);
    try {
      await enrollLearner({
        courseId: id,
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        age: Number(form.age),
        hasLaptop: form.hasLaptop === "yes",
        interestReason: form.interestReason,
      });
      toast.success("Enrollment complete. Welcome in.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code) : "";
      const message =
        code === "auth/email-already-in-use"
          ? "An account with this email already exists. Please log in."
          : error instanceof Error
            ? error.message
            : "Unable to enroll right now.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr,1.1fr]">
          <section className="space-y-5">
            <Link to={id ? `/course/${id}` : "/courses"} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary">
              <ArrowLeft className="h-4 w-4" /> Back to course
            </Link>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {loading ? (
                <div className="flex h-72 items-center justify-center text-slate-500">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading course
                </div>
              ) : (
                <>
                  <img
                    src={course?.thumbnailUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"}
                    alt={course?.title || "Course"}
                    className="h-72 w-full object-cover"
                  />
                  <div className="space-y-4 p-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Enrollment</p>
                      <h1 className="mt-2 text-3xl font-bold">{course?.title || "Course enrollment"}</h1>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{course?.description}</p>
                    </div>
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                      This course costs KES {Number(course?.price || 0).toLocaleString()}. You may pay partially now and complete payment later. Our team will follow up with payment instructions.
                    </div>
                    <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                      <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Account created first
                      </div>
                      <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3">
                        <Laptop className="h-4 w-4 text-primary" /> Access after enrollment
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Create learner account</h2>
                <p className="text-sm text-slate-500">Use your email and password to access your dashboard later.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">Full name</span>
                <input required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Email address</span>
                <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Password</span>
                <input required type="password" minLength={6} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Age</span>
                <input required type="number" min={1} value={form.age} onChange={(event) => setForm({ ...form, age: event.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Do you have a laptop?</span>
                <select value={form.hasLaptop} onChange={(event) => setForm({ ...form, hasLaptop: event.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary">
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </label>
              <label className="space-y-2 sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">Why are you interested in this course?</span>
                <textarea required rows={5} value={form.interestReason} onChange={(event) => setForm({ ...form, interestReason: event.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary" />
              </label>
              <div className="sm:col-span-2">
                <Button disabled={saving} className="w-full gap-2 rounded-2xl py-6 text-base">
                  {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                  {saving ? "Creating account" : "Enroll and go to dashboard"}
                  {!saving ? <ArrowRight className="h-5 w-5" /> : null}
                </Button>
                <p className="mt-4 text-center text-sm text-slate-500">
                  Already have an account? <Link to="/login" className="font-semibold text-primary hover:underline">Log in</Link>
                </p>
              </div>
            </form>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
