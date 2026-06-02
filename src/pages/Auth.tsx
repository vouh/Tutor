import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { loginLearner } from "@/lib/learnerData";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { redirectTo?: string } | null)?.redirectTo || "/dashboard";

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await loginLearner(email, password);
      toast.success("Signed in successfully");
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code) : "";
      const message =
        code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found"
          ? "Invalid email or password."
          : error instanceof Error
            ? error.message
            : "Unable to sign in right now.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-grow px-4 pb-16 pt-28">
        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[0.9fr,1.1fr]">
          <section className="bg-gradient-to-br from-primary to-accent p-8 text-white sm:p-10">
            <Link to="/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Courses
            </Link>
            <div className="mt-16 max-w-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/80">Learner login</p>
              <h1 className="mt-4 text-4xl font-bold leading-tight">Pick up exactly where you left off.</h1>
              <p className="mt-4 text-sm leading-6 text-white/70">
                Sign in with the email and password you used when enrolling. New learners should start from a course enrollment page.
              </p>
            </div>
          </section>

          <section className="p-6 sm:p-10">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
              <p className="mt-2 text-sm text-slate-500">Your dashboard, modules, and payment history are tied to this email.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Email address</span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    required
                    className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 outline-none focus:border-primary"
                    placeholder="name@example.com"
                  />
                </div>
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Password</span>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    required
                    className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 outline-none focus:border-primary"
                  />
                </div>
              </label>
              <Button disabled={isLoading} className="w-full gap-2 rounded-2xl py-6">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                {isLoading ? "Signing in" : "Log in"}
              </Button>

              <Button asChild variant="outline" className="w-full rounded-2xl py-6">
                <Link to="/courses">
                  Sign up
                </Link>
              </Button>

              <p className="text-center text-xs text-slate-500">
                New here? Sign up from a course page to create your learner account.
              </p>
            </form>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
