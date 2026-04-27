import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, MoonStar, SunMedium } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useTheme } from "next-themes";
import tutorLogo from "@/assets/tutor_logo.png";
import tutorLogoLight from "@/assets/tutor_logo_light.png";

export default function AdminLogin() {
  const { user, login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const from = (location.state as { from?: string } | null)?.from || "/admin/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isDark = theme === "dark";
  const activeLogo = isDark ? tutorLogoLight : tutorLogo;

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
    <div className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_30px_90px_rgba(15,23,42,0.12)] lg:grid-cols-[1fr,0.95fr]">
          <div className="relative hidden flex-col justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-primary p-10 text-white lg:flex">
            <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_top_right,_white,_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.4),_transparent_24%)]" />
            <div className="relative flex items-center gap-4">
              <img src={activeLogo} alt="Tutor" className="h-14 w-14 rounded-2xl object-cover shadow-lg shadow-black/20" />
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">Tutor Admin</p>
                <h1 className="text-2xl font-bold">Admin login</h1>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="mb-8 flex items-center justify-between gap-4 lg:hidden">
              <div className="flex items-center gap-3">
                <img src={activeLogo} alt="Tutor" className="h-12 w-12 rounded-2xl object-cover" />
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Tutor Admin</p>
                  <h1 className="text-xl font-bold">Admin login</h1>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="inline-flex items-center gap-2 rounded-2xl border border-border px-3 py-2 text-sm font-medium text-foreground"
              >
                {isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
              </button>
            </div>

            <div className="mb-8 rounded-[1.75rem] border border-border bg-muted/30 p-5">
              <h2 className="text-3xl font-bold tracking-tight">Sign in</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Email and password only.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Email</label>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  required
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="admin@tutor.co.ke"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 pr-12 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error ? <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  className="hidden items-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm font-medium text-foreground sm:inline-flex"
                >
                  {isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
                  {isDark ? "Light theme" : "Dark theme"}
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70 sm:flex-none sm:px-6"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {loading ? "Signing in" : "Sign in"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
