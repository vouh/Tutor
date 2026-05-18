import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, BookOpen, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import {
  addLearnerPayment,
  asDate,
  deleteUserRecord,
  getCourses,
  getUserDetails,
  getUsers,
  grantLearnerCourse,
  revokeLearnerCourse,
  type CourseRecord,
  type UserDetailsRecord,
  type UserRecord,
} from "@/lib/adminData";

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserDetailsRecord | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: "", status: "pending", note: "" });
  const [grantCourseId, setGrantCourseId] = useState("");
  const pageSize = 10;

  const loadUsers = async () => {
    const [userData, courseData] = await Promise.all([getUsers(), getCourses()]);
    setUsers(userData);
    setCourses(courseData);
  };

  useEffect(() => {
    loadUsers()
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedUserId) {
      setSelectedUser(null);
      return;
    }

    setDetailsLoading(true);
    getUserDetails(selectedUserId)
      .then(setSelectedUser)
      .catch(() => toast.error("Failed to load user details"))
      .finally(() => setDetailsLoading(false));
  }, [selectedUserId]);

  const refreshSelected = async () => {
    await loadUsers();
    if (selectedUserId) {
      setSelectedUser(await getUserDetails(selectedUserId));
    }
  };

  const filteredUsers = useMemo(() => {
    const search = query.toLowerCase();
    return users.filter((user) =>
      [user.fullName, user.displayName, user.name, user.email, user.phone]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [query, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  const handleAddPayment = async () => {
    if (!selectedUser?.email) return;
    if (Number(paymentForm.amount || 0) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    try {
      await addLearnerPayment(selectedUser.email, {
        amount: Number(paymentForm.amount),
        status: paymentForm.status as "paid" | "pending" | "failed",
        note: paymentForm.note,
      });
      setPaymentForm({ amount: "", status: "pending", note: "" });
      toast.success("Payment entry added");
      await refreshSelected();
    } catch {
      toast.error("Failed to add payment entry");
    }
  };

  const handleGrantCourse = async () => {
    if (!selectedUser || !grantCourseId) return;
    try {
      await grantLearnerCourse(selectedUser, grantCourseId);
      setGrantCourseId("");
      toast.success("Course access granted");
      await refreshSelected();
    } catch {
      toast.error("Failed to grant access");
    }
  };

  const handleRevokeCourse = async (courseId: string) => {
    if (!selectedUser || !window.confirm("Are you sure?")) return;
    try {
      await revokeLearnerCourse(selectedUser, courseId);
      toast.success("Course access revoked");
      await refreshSelected();
    } catch {
      toast.error("Failed to revoke access");
    }
  };

  const handleDeleteUser = async (user: UserRecord) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteUserRecord(user);
      toast.success("Learner deleted");
      if (selectedUserId === user.id) setSelectedUserId(null);
      await refreshSelected();
    } catch {
      toast.error("Failed to delete learner");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Learners</h2>
          <p className="mt-1 text-sm text-slate-500">Manage learner records, payments, course access, and sessions.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search learners" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr,0.75fr]">
        <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                <tr>
                  <th className="px-5 py-4">Learner</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Age</th>
                  <th className="px-5 py-4">Laptop</th>
                  <th className="px-5 py-4">Courses</th>
                  <th className="px-5 py-4">Session</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? <tr><td className="px-5 py-8 text-sm text-slate-500" colSpan={7}>Loading learners...</td></tr> : null}
                {!loading && paginatedUsers.length === 0 ? <tr><td className="px-5 py-8 text-sm text-slate-500" colSpan={7}>No learners found.</td></tr> : null}
                {!loading && paginatedUsers.map((user) => (
                  <tr key={user.id || user.email} onClick={() => setSelectedUserId(user.id || null)} className="cursor-pointer hover:bg-slate-50/70">
                    <td className="px-5 py-4 font-medium text-slate-900">{user.fullName || user.displayName || user.name || user.email || user.id}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{user.email || "-"}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{user.age || "-"}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{user.hasLaptop === undefined ? "-" : user.hasLaptop ? "Yes" : "No"}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{Array.isArray(user.enrolledCourses) ? user.enrolledCourses.length : 0}</td>
                    <td className="px-5 py-4 text-sm">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.sessionToken ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {user.sessionToken ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleDeleteUser(user);
                        }}
                        className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-3 py-2 font-medium text-red-600"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-sm text-slate-600">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-xl border border-slate-200 px-3 py-2 disabled:opacity-50">Previous</button>
              <button disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="rounded-xl border border-slate-200 px-3 py-2 disabled:opacity-50">Next</button>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-slate-900">Learner details</h3>
            <p className="mt-1 text-sm text-slate-500">Select a learner to manage courses and payments.</p>
          </div>

          {detailsLoading ? <p className="text-sm text-slate-500">Loading learner details...</p> : null}

          {!detailsLoading && selectedUser ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">{selectedUser.fullName || selectedUser.displayName || selectedUser.email || selectedUser.id}</p>
                <p className="mt-1">{selectedUser.email || "-"}</p>
                <p className="mt-1">Age: {selectedUser.age || "-"} | Laptop: {selectedUser.hasLaptop === undefined ? "-" : selectedUser.hasLaptop ? "Yes" : "No"}</p>
                <p className="mt-1">Enrolled: {asDate(selectedUser.enrolledAt || selectedUser.createdAt)?.toLocaleDateString() || "-"}</p>
                <p className="mt-1">Session: {selectedUser.sessionToken ? "Active" : "Inactive"}</p>
                <p className="mt-1 text-xs text-slate-500">UID: {selectedUser.uid || selectedUser.id}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><BookOpen className="h-4 w-4 text-primary" /> Courses enrolled</div>
                <div className="mt-3 space-y-3">
                  {selectedUser.enrolledCourses.length > 0 ? selectedUser.enrolledCourses.map((course) => (
                    <div key={course.courseId} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      <p className="font-medium text-slate-900">{course.courseName}</p>
                      <div className="mt-1 flex items-center justify-between gap-3">
                        <p className="text-xs text-slate-500">{course.courseId}</p>
                        <button onClick={() => void handleRevokeCourse(course.courseId)} className="text-xs font-semibold text-red-600">Revoke</button>
                      </div>
                    </div>
                  )) : <p className="text-sm text-slate-500">No active enrollments.</p>}
                </div>
                <div className="mt-4 flex gap-2">
                  <select value={grantCourseId} onChange={(event) => setGrantCourseId(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm">
                    <option value="">Select course</option>
                    {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
                  </select>
                  <button onClick={() => void handleGrantCourse()} className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white">Grant</button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><BadgeCheck className="h-4 w-4 text-primary" /> Payment log</div>
                <div className="mt-3 space-y-2">
                  {(selectedUser.paymentsLog || []).length > 0 ? selectedUser.paymentsLog?.map((payment) => (
                    <div key={payment.id} className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                      KES {Number(payment.amount || 0).toLocaleString()} | {payment.status} | {asDate(payment.date)?.toLocaleDateString() || "-"}
                    </div>
                  )) : <p className="text-sm text-slate-500">No payment entries.</p>}
                </div>
                <div className="mt-4 grid gap-2">
                  <input value={paymentForm.amount} onChange={(event) => setPaymentForm({ ...paymentForm, amount: event.target.value })} type="number" min="1" placeholder="Amount" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                  <select value={paymentForm.status} onChange={(event) => setPaymentForm({ ...paymentForm, status: event.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                  </select>
                  <input value={paymentForm.note} onChange={(event) => setPaymentForm({ ...paymentForm, note: event.target.value })} placeholder="Note" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                  <button onClick={() => void handleAddPayment()} className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Add payment</button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No learner selected.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
