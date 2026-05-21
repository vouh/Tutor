import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Bell, Clock3, ShieldAlert } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  audience: "all" | "selected";
  createdAt?: { toDate: () => Date } | null;
  createdByEmail?: string;
};

const Notifications = () => {
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const notificationCollection = useMemo(() => collection(db, "notifications"), []);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const broadcastQuery = query(notificationCollection, where("audience", "==", "all"));
    const targetedQuery = query(notificationCollection, where("targetUserIds", "array-contains", user.uid));

    const broadcastUnsubscribe = onSnapshot(broadcastQuery, (snapshot) => {
      const items = snapshot.docs.map((document) => ({ id: document.id, ...document.data() } as NotificationItem));
      setNotifications((current) => mergeNotifications(items, current));
      setLoading(false);
    });

    const targetedUnsubscribe = onSnapshot(targetedQuery, (snapshot) => {
      const items = snapshot.docs.map((document) => ({ id: document.id, ...document.data() } as NotificationItem));
      setNotifications((current) => mergeNotifications(items, current));
      setLoading(false);
    });

    return () => {
      broadcastUnsubscribe();
      targetedUnsubscribe();
    };
  }, [notificationCollection, user]);

  function mergeNotifications(nextItems: NotificationItem[], currentItems: NotificationItem[]) {
    const map = new Map<string, NotificationItem>();
    [...currentItems, ...nextItems].forEach((item) => map.set(item.id, item));

    return Array.from(map.values()).sort((left, right) => {
      const leftTime = left.createdAt?.toDate?.().getTime() || 0;
      const rightTime = right.createdAt?.toDate?.().getTime() || 0;
      return rightTime - leftTime;
    });
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-muted/10">
        <Header />
        <main className="container mx-auto px-4 py-28">
          <Card className="mx-auto max-w-2xl border-slate-200 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center px-6 py-14 text-center">
              <Bell className="h-12 w-12 text-primary" />
              <h1 className="mt-5 text-3xl font-bold text-slate-900">Sign in to see notifications</h1>
              <p className="mt-3 text-sm text-slate-600">Admin announcements and course updates will appear here after you log in.</p>
              <Link to="/dashboard" className="mt-6 text-sm font-medium text-primary hover:underline">Go to dashboard</Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Account</p>
              <h1 className="text-3xl font-bold text-slate-900">Messages</h1>
              <p className="mt-2 text-sm text-slate-600">Compact announcements and alerts for {profile?.displayName || user.email}.</p>
            </div>
            <Link to="/dashboard" className="text-sm font-medium text-primary hover:underline">Back to dashboard</Link>
          </div>

          <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-slate-900">Inbox</h2>
              </div>
            </div>
            <CardContent className="space-y-3 p-5">
              {loading ? (
                <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">Loading notifications...</div>
              ) : notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div key={notification.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Message</p>
                        <h3 className="mt-2 text-lg font-semibold text-slate-900">{notification.title}</h3>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${notification.audience === "all" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>
                        {notification.audience === "all" ? "All users" : "Selected users"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{notification.message}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{notification.createdAt?.toDate ? notification.createdAt.toDate().toLocaleString() : "Just now"}</span>
                      {notification.createdByEmail ? <span className="inline-flex items-center gap-1.5"><ShieldAlert className="h-3.5 w-3.5" />{notification.createdByEmail}</span> : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center py-14 text-center">
                  <Bell className="h-12 w-12 text-slate-300" />
                  <h2 className="mt-4 text-xl font-semibold text-slate-900">No notifications yet</h2>
                  <p className="mt-2 max-w-xl text-sm text-slate-500">When the admin sends course updates or announcements, they will appear here in real time.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Notifications;