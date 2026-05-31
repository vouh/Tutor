import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Filter, Loader2, Search, ShieldX, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getApplications, updateApplicationStatus, type ApplicationRecord } from "@/lib/adminData";

export default function AdminApplications() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "active" | "revoked">("pending");

  const loadApplications = async () => {
    setLoading(true);
    try {
      setApplications(await getApplications());
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadApplications();
  }, []);

  const visibleApplications = useMemo(() => {
    const search = query.toLowerCase();
    return applications.filter((application) => {
      const matchesStatus = statusFilter === "all" ? true : application.status === statusFilter;
      const haystack = [
        application.fullName,
        application.userEmail,
        application.courseName,
        application.courseId,
        application.location,
        application.interestReason,
      ]
        .join(" ")
        .toLowerCase();

      return matchesStatus && haystack.includes(search);
    });
  }, [applications, query, statusFilter]);

  const pendingCount = applications.filter((application) => application.status === "pending").length;
  const activeCount = applications.filter((application) => application.status === "active").length;
  const revokedCount = applications.filter((application) => application.status === "revoked").length;

  const handleReview = async (application: ApplicationRecord, status: "active" | "revoked") => {
    setSavingId(application.id);
    try {
      await updateApplicationStatus(application, status);
      toast.success(status === "active" ? "Application approved" : "Application denied");
      await loadApplications();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update application");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[1.5rem] border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pending applications</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{loading ? "—" : pendingCount}</p>
        </Card>
        <Card className="rounded-[1.5rem] border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Approved</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{loading ? "—" : activeCount}</p>
        </Card>
        <Card className="rounded-[1.5rem] border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Denied</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{loading ? "—" : revokedCount}</p>
        </Card>
      </section>

      <Card className="rounded-[1.5rem] border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Applications</h2>
            <p className="mt-1 text-sm text-slate-500">Approve or deny learner applications from course enrollment forms.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search applications"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>
            <div className="relative">
              <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
                <option value="pending">Pending</option>
                <option value="active">Approved</option>
                <option value="revoked">Denied</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-4">
          {loading ? (
            <Card className="rounded-[1.5rem] border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
              <Loader2 className="mb-3 h-5 w-5 animate-spin text-primary" />
              Loading applications...
            </Card>
          ) : visibleApplications.length > 0 ? (
            visibleApplications.map((application) => (
              <Card key={application.id} className="rounded-[1.5rem] border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">{application.fullName}</h3>
                      <Badge className={application.status === "active" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : application.status === "revoked" ? "bg-red-100 text-red-700 hover:bg-red-100" : "bg-amber-100 text-amber-700 hover:bg-amber-100"}>
                        {application.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500">{application.userEmail} · {application.courseName}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5"><Clock3 className="h-4 w-4 text-slate-400" /> Age {application.age || "-"}</span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5"><Sparkles className="h-4 w-4 text-slate-400" /> Laptop {application.hasLaptop ? "Yes" : "No"}</span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5"><ShieldX className="h-4 w-4 text-slate-400" /> {application.location || "No location"}</span>
                    </div>
                    <p className="max-w-3xl text-sm leading-6 text-slate-600">{application.interestReason || "No application note provided."}</p>
                    {application.relevantDetails ? <p className="max-w-3xl text-sm leading-6 text-slate-500">Details: {application.relevantDetails}</p> : null}
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                    <button
                      onClick={() => void handleReview(application, "active")}
                      disabled={savingId === application.id || application.status === "active"}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingId === application.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      Approve
                    </button>
                    <button
                      onClick={() => void handleReview(application, "revoked")}
                      disabled={savingId === application.id || application.status === "revoked"}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <ShieldX className="h-4 w-4" />
                      Deny
                    </button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="rounded-[1.5rem] border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
              <p className="text-sm text-slate-500">No applications match the current filter.</p>
            </Card>
          )}
        </div>

        <Card className="rounded-[1.5rem] border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">How it works</h3>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <p>1. Learners submit the course application form on the course detail page.</p>
            <p>2. Pending applications appear here for review.</p>
            <p>3. Approve to grant access or deny to revoke the request.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
