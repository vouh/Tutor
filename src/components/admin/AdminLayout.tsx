import { NavLink, Outlet, useLocation } from "react-router-dom";
import { BarChart3, Bell, BookOpen, Calendar, CreditCard, LayoutDashboard, Menu, MoonStar, SunMedium, Users, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useTheme } from "next-themes";
import tutorLogo from "@/assets/tutor_logo.png";
import tutorLogoLight from "@/assets/tutor_logo_light.png";

const navItems = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Courses", to: "/admin/courses", icon: BookOpen },
  { label: "Modules", to: "/admin/modules", icon: BarChart3 },
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Notifications", to: "/admin/notifications", icon: Bell },
  { label: "Payments", to: "/admin/payments", icon: CreditCard },
  { label: "Activities", to: "/admin/activities", icon: Calendar },
];

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout, user } = useAdminAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const isDark = theme === "dark";
  const activeLogo = isDark ? tutorLogoLight : tutorLogo;

  const currentTitle = useMemo(() => {
    if (location.pathname.includes("/payments")) return "Payments";
    if (location.pathname.includes("/notifications")) return "Notifications";
    if (location.pathname.includes("/users")) return "Users";
    if (location.pathname.includes("/modules")) return "Modules";
    if (location.pathname.includes("/courses")) return "Courses";
    if (location.pathname.includes("/activities")) return "Activities";
    return "Dashboard";
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 text-foreground dark:bg-slate-950 lg:flex">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card/95 shadow-sm lg:flex lg:flex-col">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <img src={activeLogo} alt="Tutor" className="h-10 w-10 rounded-md object-cover" />
          <div>
            <p className="text-sm font-semibold text-foreground">Tutor Admin</p>
            <p className="max-w-40 truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="border-t border-border p-4">
          <button
            onClick={() => void logout()}
            className="w-full rounded-md border border-border px-3 py-2 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
          >
            Sign out
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button aria-label="Close menu" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-black/50" />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-3">
                <img src={activeLogo} alt="Tutor" className="h-10 w-10 rounded-2xl object-cover" />
                <div>
                  <p className="text-sm font-semibold">Tutor Admin</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
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
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/90 px-4 py-3 backdrop-blur sm:px-5 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-md border border-border p-2 text-foreground lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Admin console</p>
              <h1 className="text-xl font-bold text-foreground">{currentTitle}</h1>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary"
            >
              {isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
              {isDark ? "Light theme" : "Dark theme"}
            </button>
            <div className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
              Signed in as <span className="font-semibold text-foreground">{user?.email}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 px-3 py-4 sm:px-5 lg:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
