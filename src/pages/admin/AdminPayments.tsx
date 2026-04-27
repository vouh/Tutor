import { useEffect, useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { getPayments, type PaymentRecord } from "@/lib/adminData";

export default function AdminPayments() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    getPayments()
      .then(setPayments)
      .catch(() => toast.error("Failed to load payments"))
      .finally(() => setLoading(false));
  }, []);

  const filteredPayments = useMemo(() => {
    const search = query.toLowerCase();
    return payments.filter((payment) => [payment.mpesaReceiptNumber, payment.userEmail, payment.userId, payment.courseId, payment.moduleId].filter(Boolean).join(" ").toLowerCase().includes(search));
  }, [payments, query]);

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / pageSize));
  const paginatedPayments = filteredPayments.slice((page - 1) * pageSize, page * pageSize);

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
      <div className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Payments</h2>
          <p className="mt-1 text-sm text-slate-500">Track M-Pesa receipts, amounts, and payment status.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search payments" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </div>
          <button onClick={exportCsv} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/15">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      <Card className="overflow-hidden rounded-[1.5rem] border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-5 py-4">Receipt</th>
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Paid at</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? <tr><td className="px-5 py-8 text-sm text-slate-500" colSpan={5}>Loading payments...</td></tr> : null}
              {!loading && paginatedPayments.length === 0 ? <tr><td className="px-5 py-8 text-sm text-slate-500" colSpan={5}>No payments found.</td></tr> : null}
              {!loading && paginatedPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4 font-mono text-sm text-slate-700">{payment.mpesaReceiptNumber}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{payment.userEmail || payment.userId}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">KES {Number(payment.amount || 0).toLocaleString()}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{payment.status}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{payment.paidAt ? payment.paidAt.toDate().toLocaleString() : "—"}</td>
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
