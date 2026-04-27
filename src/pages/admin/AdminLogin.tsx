import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import tutorLogo from "@/assets/tutor_logo.png";

export default function AdminLogin() {
  const { user, login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || "/admin/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      toast.success("Admin login successful");
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.14),_transparent_42%),linear-gradient(180deg,_#fff,_#fafafa)] px-4 py-8 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.08)] lg:grid-cols-[1.1fr,0.9fr]">
          <div className="hidden flex-col justify-between bg-slate-950 p-10 text-white lg:flex">
            <div className="flex items-center gap-4">
              <img src={tutorLogo} alt="Tutor" className="h-14 w-14 rounded-2xl object-cover" />
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">Tutor Admin</p>
                <h1 className="text-2xl font-bold">Learning platform control room</h1>
              </div>
            </div>
            <div className="space-y-4">
              <p className="max-w-md text-lg leading-relaxed text-white/75">
                Manage courses, modules, payments, and student access from one secure workspace built on Firebase Authentication.
              </p>
              <div className="grid gap-3 text-sm text-white/70">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Protected admin session</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">Firestore-backed content management</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">M-Pesa payment oversight</div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <img src={tutorLogo} alt="Tutor" className="h-12 w-12 rounded-2xl object-cover" />
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Tutor Admin</p>
                <h1 className="text-xl font-bold">Admin login</h1>
              </div>
            </div>

            <div className="mb-8 rounded-[1.75rem] bg-slate-50 p-5">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Shield className="h-3.5 w-3.5" /> Secure access
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Sign in to the admin dashboard</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Use your Firebase email and password to access Tutor administration.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  required
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="admin@tutor.co.ke"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 pr-12 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-500"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? "Signing in" : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
