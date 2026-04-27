import { NavLink, Outlet, useLocation } from "react-router-dom";
import { BarChart3, BookOpen, CreditCard, LayoutDashboard, Menu, Users, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import tutorLogo from "@/assets/tutor_logo.png";

const navItems = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Courses", to: "/admin/courses", icon: BookOpen },
  { label: "Modules", to: "/admin/modules", icon: BarChart3 },
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Payments", to: "/admin/payments", icon: CreditCard },
];

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout, user } = useAdminAuth();
  const location = useLocation();

  const currentTitle = useMemo(() => {
    if (location.pathname.includes("/payments")) return "Payments";
    if (location.pathname.includes("/users")) return "Users";
    if (location.pathname.includes("/modules")) return "Modules";
    if (location.pathname.includes("/courses")) return "Courses";
    return "Dashboard";
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 lg:flex">
      <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
          <img src={tutorLogo} alt="Tutor" className="h-11 w-11 rounded-2xl object-cover" />
          <div>
            <p className="text-sm font-semibold text-slate-900">Tutor Admin</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-5">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                  active ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="border-t border-slate-100 p-4">
          <button
            onClick={() => void logout()}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary"
          >
            Sign out
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button aria-label="Close menu" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-black/50" />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-3">
                <img src={tutorLogo} alt="Tutor" className="h-10 w-10 rounded-2xl object-cover" />
                <div>
                  <p className="text-sm font-semibold">Tutor Admin</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1 p-4">
              {navItems.map((item) => {
                const active = location.pathname.startsWith(item.to);
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                      active ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-2xl border border-slate-200 p-2 text-slate-700 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Admin</p>
              <h1 className="text-xl font-bold text-slate-900">{currentTitle}</h1>
            </div>
          </div>
          <div className="hidden rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-600 sm:block">
            Signed in as <span className="font-semibold text-slate-900">{user?.email}</span>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
