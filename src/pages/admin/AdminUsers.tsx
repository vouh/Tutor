import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { getUsers, type UserRecord } from "@/lib/adminData";

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = useMemo(() => {
    const search = query.toLowerCase();
    return users.filter((user) => [user.displayName, user.name, user.email, user.phone].filter(Boolean).join(" ").toLowerCase().includes(search));
  }, [query, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Registered users</h2>
          <p className="mt-1 text-sm text-slate-500">Browse user accounts and spending history.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search users" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
        </div>
      </div>

      <Card className="overflow-hidden rounded-[1.5rem] border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Phone</th>
                <th className="px-5 py-4">Total spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? <tr><td className="px-5 py-8 text-sm text-slate-500" colSpan={4}>Loading users...</td></tr> : null}
              {!loading && paginatedUsers.length === 0 ? <tr><td className="px-5 py-8 text-sm text-slate-500" colSpan={4}>No users found.</td></tr> : null}
              {!loading && paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4 font-medium text-slate-900">{user.displayName || user.name || user.email || user.id}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{user.email || "—"}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{user.phone || "—"}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">KES {Number(user.totalSpent || 0).toLocaleString()}</td>
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
    </div>
  );
}
