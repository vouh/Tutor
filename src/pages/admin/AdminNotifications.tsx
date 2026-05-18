import { useEffect, useMemo, useState } from "react";
import { Send, Search } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { createNotification, getNotifications, getUsers, type NotificationRecord, type UserRecord } from "@/lib/adminData";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

type NotificationFormState = {
  title: string;
  message: string;
  audience: "all" | "selected";
  targetUserIds: string;
};

const emptyForm: NotificationFormState = {
  title: "",
  message: "",
  audience: "all",
  targetUserIds: "",
};

export default function AdminNotifications() {
  const { user } = useAdminAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<NotificationFormState>(emptyForm);

  useEffect(() => {
    const load = async () => {
      try {
        const [userData, notificationData] = await Promise.all([getUsers(), getNotifications()]);
        setUsers(userData);
        setNotifications(notificationData);
      } catch {
        toast.error("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const filteredUsers = useMemo(() => {
    const search = query.toLowerCase();
    return users.filter((user) => [user.displayName, user.name, user.email, user.phone].filter(Boolean).join(" ").toLowerCase().includes(search));
  }, [query, users]);

  const submitNotification = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast.error("Title and message are required");
      return;
    }

    const targetUserIds = form.audience === "selected"
      ? form.targetUserIds.split(",").map((value) => value.trim()).filter(Boolean)
      : [];

    if (form.audience === "selected" && targetUserIds.length === 0) {
      toast.error("Add at least one user id or switch to all users");
      return;
    }

    setSaving(true);
    try {
      await createNotification({
        title: form.title.trim(),
        message: form.message.trim(),
        audience: form.audience,
        targetUserIds,
        createdBy: user?.uid || "",
        createdByEmail: user?.email || "",
        expiresAt: null,
      });
      toast.success("Notification sent");
      setForm(emptyForm);
      setNotifications(await getNotifications());
    } catch {
      toast.error("Unable to send notification");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <Card className="rounded-[1.5rem] border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-slate-900">Send notification</h2>
            <p className="mt-1 text-sm text-slate-500">Broadcast to everyone or target specific user ids.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
              <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="New course update" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Message</label>
              <textarea value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} rows={5} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="Tell students what changed..." />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Audience</label>
              <select value={form.audience} onChange={(event) => setForm((current) => ({ ...current, audience: event.target.value as NotificationFormState["audience"] }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10">
                <option value="all">All users</option>
                <option value="selected">Selected users</option>
              </select>
            </div>
            {form.audience === "selected" ? (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Target user ids</label>
                <textarea value={form.targetUserIds} onChange={(event) => setForm((current) => ({ ...current, targetUserIds: event.target.value }))} rows={4} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="uid-1, uid-2, uid-3" />
              </div>
            ) : null}
            <button disabled={saving} onClick={() => void submitNotification()} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/15 disabled:cursor-not-allowed disabled:opacity-70">
              <Send className="h-4 w-4" /> {saving ? "Sending..." : "Send notification"}
            </button>
          </div>
        </Card>

        <Card className="rounded-[1.5rem] border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Registered users</h2>
              <p className="mt-1 text-sm text-slate-500">Use these ids when targeting selected notifications.</p>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search users" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
            </div>
          </div>

          <div className="max-h-[520px] space-y-3 overflow-auto pr-1">
            {filteredUsers.map((user) => (
              <div key={user.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="font-medium text-slate-900">{user.displayName || user.name || user.email || user.id}</p>
                <p className="text-sm text-slate-500">{user.email || "No email"}</p>
                <p className="mt-2 text-xs font-mono text-slate-400">{user.id}</p>
              </div>
            ))}
            {!loading && filteredUsers.length === 0 ? <p className="text-sm text-slate-500">No users found.</p> : null}
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden rounded-[1.5rem] border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-900">Sent notifications</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {notifications.map((notification) => (
            <CardContent key={notification.id} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{notification.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{notification.audience}</span>
              </div>
            </CardContent>
          ))}
          {!loading && notifications.length === 0 ? <CardContent className="px-5 py-6 text-sm text-slate-500">No notifications sent yet.</CardContent> : null}
        </div>
      </Card>
    </div>
  );
}