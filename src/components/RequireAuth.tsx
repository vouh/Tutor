import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-700">
        <div className="flex items-center gap-3 rounded-2xl border bg-white px-5 py-4 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm font-medium">Checking session</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          redirectTo: `${location.pathname}${location.search}`,
        }}
      />
    );
  }

  return <>{children}</>;
}
