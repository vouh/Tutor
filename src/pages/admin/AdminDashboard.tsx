import { useEffect, useState } from "react";
import { BookOpen, CreditCard, Layers3, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getDashboardSummary, type ActivityItem } from "@/lib/adminData";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalCourses: 0, totalModules: 0, totalUsers: 0, totalRevenue: 0, activities: [] as ActivityItem[] });

  useEffect(() => {
    let mounted = true;
    getDashboardSummary()
      .then((data) => {
        if (mounted) setSummary(data);
      })
      .catch(() => toast.error("Failed to load dashboard summary"))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const stats = [
    { label: "Published courses", value: summary.totalCourses, icon: BookOpen },
    { label: "Uploaded modules", value: summary.totalModules, icon: Layers3 },
    { label: "Registered users", value: summary.totalUsers, icon: Users },
    { label: "Total revenue", value: `KES ${summary.totalRevenue.toLocaleString()}`, icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="rounded-[1.5rem] border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{loading ? "—" : stat.value}</p>
                </div>
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </section>

      <section>
        <Card className="rounded-[1.5rem] border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent activity</h2>
              <p className="text-sm text-slate-500">Latest uploads, users, and payments</p>
            </div>
          </div>

          <div className="space-y-3">
            {summary.activities.map((item) => (
              <div key={item.id} className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <span className="text-xs text-slate-500">{item.timestamp}</span>
                  </div>
                  <p className="text-sm text-slate-600">{item.subtitle}</p>
                </div>
              </div>
            ))}
            {summary.activities.length === 0 ? <p className="text-sm text-slate-500">No activity yet.</p> : null}
          </div>
        </Card>
      </section>
    </div>
  );
}
