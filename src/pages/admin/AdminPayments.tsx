import { useEffect, useMemo, useState } from "react";
import { Download, Plus, Search, Send, Trash2 } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import {
  createPaymentRequest,
  deletePaymentRequest,
  getCourses,
  getModules,
  getPaymentRequests,
  getPayments,
  getUsers,
  updatePaymentRequestStatus,
  type CourseRecord,
  type ModuleRecord,
  type PaymentRecord,
  type PaymentRequestPurpose,
  type PaymentRequestRecord,
  type UserRecord,
} from "@/lib/adminData";

type PaymentRequestFormState = {
  title: string;
  message: string;
  amount: string;
  audience: "all" | "selected";
  targetUserIds: string;
  courseId: string;
  moduleId: string;
  purpose: PaymentRequestPurpose;
  dueDate: string;
};

const emptyForm: PaymentRequestFormState = {
  title: "",
  message: "",
  amount: "",
  audience: "all",
  targetUserIds: "",
  courseId: "",
  moduleId: "",
  purpose: "course",
  dueDate: "",
};

export default function AdminPayments() {
  const { user } = useAdminAuth();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [requests, setRequests] = useState<PaymentRequestRecord[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [modules, setModules] = useState<ModuleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<PaymentRequestFormState>(emptyForm);
  const pageSize = 10;

  const loadData = async () => {
    const [paymentData, requestData, userData, courseData, moduleData] = await Promise.all([
      getPayments(),
      getPaymentRequests(),
      getUsers(),
      getCourses(),
      getModules(),
    ]);
    setPayments(paymentData);
    setRequests(requestData);
    setUsers(userData);
    setCourses(courseData);
    setModules(moduleData);
  };

  useEffect(() => {
    loadData()
      .catch(() => toast.error("Failed to load payment management"))
      .finally(() => setLoading(false));
  }, []);

  const selectedTargetIds = useMemo(
    () => form.targetUserIds.split(",").map((value) => value.trim()).filter(Boolean),
    [form.targetUserIds]
  );

  const selectedCourse = useMemo(() => courses.find((course) => course.id === form.courseId), [courses, form.courseId]);
  const availableModules = useMemo(() => modules.filter((module) => module.courseId === form.courseId), [form.courseId, modules]);
  const selectedModule = useMemo(() => modules.find((module) => module.id === form.moduleId), [form.moduleId, modules]);

  const filteredUsers = useMemo(() => {
    const search = userQuery.toLowerCase();
    return users
      .filter((nextUser) => [nextUser.displayName, nextUser.fullName, nextUser.name, nextUser.email, nextUser.id]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search))
      .slice(0, 8);
  }, [userQuery, users]);

  const filteredPayments = useMemo(() => {
    const search = query.toLowerCase();
    return payments.filter((payment) => [payment.mpesaReceiptNumber, payment.userEmail, payment.userId, payment.courseId, payment.moduleId].filter(Boolean).join(" ").toLowerCase().includes(search));
  }, [payments, query]);

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / pageSize));
  const paginatedPayments = filteredPayments.slice((page - 1) * pageSize, page * pageSize);

  const activeRequests = requests.filter((request) => request.isActive).length;
  const completedPayments = payments.filter((payment) => payment.status === "completed");
  const totalRevenue = completedPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const addTargetUser = (nextUser: UserRecord) => {
    const userId = nextUser.uid || nextUser.id;
    if (!userId) return;
    const nextIds = Array.from(new Set([...selectedTargetIds, userId]));
    setForm((current) => ({ ...current, audience: "selected", targetUserIds: nextIds.join(", ") }));
  };

  const submitRequest = async () => {
    if (!form.title.trim() || Number(form.amount || 0) <= 0) {
      toast.error("Title and amount are required");
      return;
    }

    if (form.audience === "selected" && selectedTargetIds.length === 0) {
      toast.error("Choose at least one learner or switch audience to all");
      return;
    }

    setSaving(true);
    try {
      await createPaymentRequest({
        title: form.title.trim(),
        message: form.message.trim(),
        amount: Number(form.amount || 0),
        audience: form.audience,
        targetUserIds: selectedTargetIds,
        courseId: form.courseId,
        courseName: selectedCourse?.title || "",
        moduleId: form.moduleId,
        moduleName: selectedModule?.title || "",
        purpose: form.purpose,
        dueDate: form.dueDate ? Timestamp.fromDate(new Date(form.dueDate)) : null,
        isActive: true,
        createdBy: user?.uid || "",
        createdByEmail: user?.email || "",
      });
      toast.success("Payment request sent");
      setForm(emptyForm);
      setRequests(await getPaymentRequests());
    } catch {
      toast.error("Unable to send payment request");
    } finally {
      setSaving(false);
    }
  };

  const toggleRequest = async (request: PaymentRequestRecord) => {
    if (!request.id) return;
    try {
      await updatePaymentRequestStatus(request.id, !request.isActive);
      toast.success(request.isActive ? "Payment request disabled" : "Payment request enabled");
      setRequests(await getPaymentRequests());
    } catch {
      toast.error("Unable to update request");
    }
  };

  const removeRequest = async (request: PaymentRequestRecord) => {
    if (!request.id || !window.confirm("Delete this payment request?")) return;
    try {
      await deletePaymentRequest(request.id);
      setRequests((current) => current.filter((item) => item.id !== request.id));
      toast.success("Payment request deleted");
    } catch {
      toast.error("Unable to delete request");
    }
  };

  const exportCsv = () => {
    const rows = [
      ["userId", "userEmail", "courseId", "moduleId", "amount", "mpesaReceiptNumber", "status", "paidAt"],
      ...filteredPayments.map((payment) => [
        payment.userId,
        payment.userEmail || "",
        payment.courseId,
        payment.moduleId,
        String(payment.amount),
        payment.mpesaReceiptNumber,
        payment.status,
        payment.paidAt ? payment.paidAt.toDate().toISOString() : "",
      ]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "tutor-payments.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Payment requests", value: requests.length.toLocaleString() },
          { label: "Active requests", value: activeRequests.toLocaleString() },
          { label: "Confirmed revenue", value: `KES ${totalRevenue.toLocaleString()}` },
        ].map((item) => (
          <Card key={item.label} className="rounded-lg border-border bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{item.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <Card className="rounded-lg border-border bg-card p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-foreground">Push payment request</h2>
            <p className="mt-1 text-sm text-muted-foreground">Send a payment prompt to all learners or selected learner ids.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-foreground">Title</span>
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Week 2 access payment" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Amount (KES)</span>
              <input value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} type="number" min="1" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Purpose</span>
              <select value={form.purpose} onChange={(event) => setForm({ ...form, purpose: event.target.value as PaymentRequestPurpose })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="course">Course access</option>
                <option value="module">Next module</option>
                <option value="week">Next week</option>
                <option value="custom">Custom</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Course</span>
              <select value={form.courseId} onChange={(event) => setForm({ ...form, courseId: event.target.value, moduleId: "" })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="">No specific course</option>
                {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Module</span>
              <select value={form.moduleId} onChange={(event) => setForm({ ...form, moduleId: event.target.value })} disabled={!form.courseId} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm disabled:opacity-60">
                <option value="">No specific module</option>
                {availableModules.map((module) => <option key={module.id} value={module.id}>{module.order}. {module.title}</option>)}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Due date</span>
              <input value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} type="date" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Audience</span>
              <select value={form.audience} onChange={(event) => setForm({ ...form, audience: event.target.value as PaymentRequestFormState["audience"] })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="all">All learners</option>
                <option value="selected">Selected learners</option>
              </select>
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-foreground">Message</span>
              <textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} rows={3} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Explain what this payment unlocks." />
            </label>
            {form.audience === "selected" ? (
              <div className="space-y-3 md:col-span-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">Target learner ids</span>
                  <textarea value={form.targetUserIds} onChange={(event) => setForm({ ...form, targetUserIds: event.target.value })} rows={3} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="uid-1, uid-2" />
                </label>
                <div className="rounded-lg border border-border bg-muted/40 p-3">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input value={userQuery} onChange={(event) => setUserQuery(event.target.value)} placeholder="Search learners to add" className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm" />
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {filteredUsers.map((nextUser) => (
                      <button key={nextUser.id || nextUser.email} onClick={() => addTargetUser(nextUser)} className="rounded-md border border-border bg-background px-3 py-2 text-left text-xs hover:border-primary">
                        <span className="block truncate font-semibold text-foreground">{nextUser.displayName || nextUser.fullName || nextUser.email || nextUser.id}</span>
                        <span className="block truncate text-muted-foreground">{nextUser.uid || nextUser.id}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <button disabled={saving} onClick={() => void submitRequest()} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-70">
            <Send className="h-4 w-4" /> {saving ? "Sending request..." : "Send payment request"}
          </button>
        </Card>

        <Card className="rounded-lg border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Payment requests</h2>
              <p className="mt-1 text-sm text-muted-foreground">Enable, disable, or remove learner payment prompts.</p>
            </div>
            <Plus className="h-5 w-5 text-primary" />
          </div>

          <div className="max-h-[620px] space-y-3 overflow-auto pr-1">
            {requests.map((request) => (
              <div key={request.id} className="rounded-lg border border-border bg-muted/40 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{request.purpose}</p>
                    <h3 className="mt-1 font-semibold text-foreground">{request.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{request.message || "No message"}</p>
                  </div>
                  <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${request.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}>
                    {request.isActive ? "Active" : "Disabled"}
                  </span>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                  <span>KES {Number(request.amount || 0).toLocaleString()}</span>
                  <span>{request.audience === "all" ? "All learners" : `${request.targetUserIds.length} selected`}</span>
                  <span>{request.courseName || "No course selected"}</span>
                  <span>{request.moduleName || "No module selected"}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => void toggleRequest(request)} className="rounded-md border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-background">
                    {request.isActive ? "Disable" : "Enable"}
                  </button>
                  <button onClick={() => void removeRequest(request)} className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
            {!loading && requests.length === 0 ? <p className="rounded-lg border border-dashed border-border p-5 text-sm text-muted-foreground">No payment requests yet.</p> : null}
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden rounded-lg border-border bg-card shadow-sm">
        <div className="flex flex-col gap-4 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Payment receipts</h2>
            <p className="mt-1 text-sm text-muted-foreground">Track M-Pesa receipts, amounts, and confirmation status.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search receipts" className="w-full rounded-md border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
            </div>
            <button onClick={exportCsv} className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-4">Receipt</th>
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Paid at</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? <tr><td className="px-5 py-8 text-sm text-muted-foreground" colSpan={5}>Loading payments...</td></tr> : null}
              {!loading && paginatedPayments.length === 0 ? <tr><td className="px-5 py-8 text-sm text-muted-foreground" colSpan={5}>No payments found.</td></tr> : null}
              {!loading && paginatedPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-muted/40">
                  <td className="px-5 py-4 font-mono text-sm text-foreground">{payment.mpesaReceiptNumber}</td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{payment.userEmail || payment.userId}</td>
                  <td className="px-5 py-4 text-sm text-foreground">KES {Number(payment.amount || 0).toLocaleString()}</td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{payment.status}</td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{payment.paidAt ? payment.paidAt.toDate().toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border px-5 py-4 text-sm text-muted-foreground">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-md border border-border px-3 py-2 disabled:opacity-50">Previous</button>
            <button disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="rounded-md border border-border px-3 py-2 disabled:opacity-50">Next</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
