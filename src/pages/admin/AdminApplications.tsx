import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Eye, Loader2, ShieldX } from "lucide-react";
import { toast } from "sonner";
import { Timestamp } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getApplications, updateApplicationStatus, type ApplicationRecord } from "@/lib/adminData";

function formatDate(value?: Timestamp | null) {
  if (!value) return "-";
  try {
    return value.toDate().toLocaleDateString();
  } catch {
    return "-";
  }
}

export default function AdminApplications() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationRecord | null>(null);

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

  const visibleApplications = useMemo(() => applications, [applications]);

  const handleReview = async (application: ApplicationRecord, status: "active" | "revoked") => {
    setSavingId(application.id);
    try {
      await updateApplicationStatus(application, status);
      toast.success(status === "active" ? "Application approved" : "Application denied");
      await loadApplications();
      setSelectedApplication((current) => (current?.id === application.id ? null : current));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update application");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-[1.5rem] border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4 text-right">Open</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-5 py-10 text-sm text-slate-500" colSpan={3}>
                    <Loader2 className="mb-3 h-5 w-5 animate-spin text-primary" />
                    Loading applications...
                  </td>
                </tr>
              ) : visibleApplications.length > 0 ? (
                visibleApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4 font-medium text-slate-900">{application.fullName}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{formatDate(application.appliedAt || application.enrolledAt || application.updatedAt)}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedApplication(application)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-primary hover:text-primary"
                        aria-label={`View details for ${application.fullName}`}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-5 py-10 text-center text-sm text-slate-500" colSpan={3}>
                    No applications match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={Boolean(selectedApplication)} onOpenChange={(open) => !open && setSelectedApplication(null)}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-2xl overflow-hidden rounded-[1.75rem] border-slate-200 bg-white p-0 shadow-2xl sm:w-full">
          {selectedApplication ? (
            <div className="flex max-h-[90dvh] flex-col">
              <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
                <DialogHeader className="text-left">
                  <DialogTitle className="text-xl font-bold text-slate-900 sm:text-2xl">Application details</DialogTitle>
                  <DialogDescription>Review the learner submission before approving or denying.</DialogDescription>
                </DialogHeader>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
                <div className="grid gap-4 text-sm text-slate-600">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3"><span className="font-semibold text-slate-900">Name: </span>{selectedApplication.fullName}</div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3"><span className="font-semibold text-slate-900">Email: </span>{selectedApplication.userEmail}</div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3"><span className="font-semibold text-slate-900">Course: </span>{selectedApplication.courseName}</div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3"><span className="font-semibold text-slate-900">Date: </span>{formatDate(selectedApplication.appliedAt || selectedApplication.enrolledAt || selectedApplication.updatedAt)}</div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3"><span className="font-semibold text-slate-900">Age: </span>{selectedApplication.age || "-"} | <span className="font-semibold text-slate-900">Laptop: </span>{selectedApplication.hasLaptop ? "Yes" : "No"} | <span className="font-semibold text-slate-900">Location: </span>{selectedApplication.location || "-"}</div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3"><span className="font-semibold text-slate-900">Reason: </span>{selectedApplication.interestReason || "-"}</div>
                  {selectedApplication.relevantDetails ? <div className="rounded-2xl bg-slate-50 px-4 py-3"><span className="font-semibold text-slate-900">Details: </span>{selectedApplication.relevantDetails}</div> : null}
                </div>
              </div>

              <div className="sticky bottom-0 border-t border-slate-100 bg-white px-4 py-4 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    onClick={() => void handleReview(selectedApplication, "revoked")}
                    disabled={savingId === selectedApplication.id || selectedApplication.status === "revoked"}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <ShieldX className="h-4 w-4" />
                    Deny
                  </button>
                  <button
                    onClick={() => void handleReview(selectedApplication, "active")}
                    disabled={savingId === selectedApplication.id || selectedApplication.status === "active"}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingId === selectedApplication.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Approve
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
