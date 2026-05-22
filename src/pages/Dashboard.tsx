import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowRight, Bell, BookOpen, ChevronRight, CreditCard, Eye, Home, LogOut, Mail, MapPin, Settings2, User, Calendar, Video, Tv } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PaymentModal from "@/components/PaymentModal";
import { useAuth } from "@/contexts/AuthContext";
import { asDate, getUserDetails, updateUserProfileRecord, type NotificationRecord, type PaymentRecord, type PaymentRequestRecord, type UserCourseRecord, type UserDetailsRecord, type ActivityRecord } from "@/lib/adminData";
import { getCourseById, type Course } from "@/lib/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

type DashboardNotification = NotificationRecord & { id: string };
type DashboardPaymentRequest = PaymentRequestRecord & { id: string };
type DashboardActivity = ActivityRecord & { id: string };

type ProfileFormState = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  age: string;
};

function getEmbedUrl(url: string | undefined): { type: "youtube" | "vimeo" | "other" | null; embedUrl: string | null } {
  if (!url) return { type: null, embedUrl: null };
  const trimmed = url.trim();

  // YouTube match
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      type: "youtube",
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`
    };
  }

  // Vimeo match
  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`
    };
  }

  return { type: "other", embedUrl: trimmed };
}

const Dashboard = () => {
  const { user, profile, logout } = useAuth();
  const [courses, setCourses] = useState<Array<UserCourseRecord & { course?: Course | null }>>([]);
  const [details, setDetails] = useState<UserDetailsRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [paymentsOpen, setPaymentsOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<(UserCourseRecord & { course?: Course | null }) | null>(null);
  const [selectedPaymentRequest, setSelectedPaymentRequest] = useState<DashboardPaymentRequest | null>(null);
  const [notificationItems, setNotificationItems] = useState<DashboardNotification[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<DashboardPaymentRequest[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentHistoryLoading, setPaymentHistoryLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [activities, setActivities] = useState<DashboardActivity[]>([]);
  const [activitiesOpen, setActivitiesOpen] = useState(false);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    age: "",
  });

  const displayName = details?.fullName || details?.displayName || profile?.displayName || "Learner";
  const displayEmail = details?.email || profile?.email || user?.email || "No email available";

  const visibleNotifications = useMemo(() => notificationItems.slice(0, 5), [notificationItems]);
  const visiblePaymentRequests = useMemo(() => paymentRequests.filter((request) => request.isActive).slice(0, 5), [paymentRequests]);
  const completedPayments = useMemo(() => paymentHistory.filter((payment) => ["completed", "confirmed"].includes(payment.status as PaymentRecord["status"])), [paymentHistory]);

  const getPaymentSummary = (request: DashboardPaymentRequest) => {
    const matchedPayments = completedPayments.filter((payment) => {
      if (request.id && payment.requestId) {
        return payment.requestId === request.id;
      }

      if (request.courseId && payment.courseId !== request.courseId) {
        return false;
      }

      if (request.moduleId && payment.moduleId !== request.moduleId) {
        return false;
      }

      if (payment.requestTitle && payment.requestTitle !== request.title) {
        return false;
      }

      return true;
    });

    const paidAmount = matchedPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const remainingAmount = Math.max(0, Number(request.amount || 0) - paidAmount);
    const paidPercentage = Number(request.amount || 0) > 0 ? Math.min(100, Math.round((paidAmount / Number(request.amount || 0)) * 100)) : 0;

    return {
      paidAmount,
      remainingAmount,
      paidPercentage,
      totalPayments: matchedPayments.length,
    };
  };

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user) {
        setCourses([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const details = await getUserDetails(user.uid);
        setDetails(details);
        const mappedCourses = await Promise.all((details?.enrolledCourses || []).map(async (item) => ({
          ...item,
          course: await getCourseById(item.courseId),
        })));
        setCourses(mappedCourses);
      } catch {
        toast.error("Unable to load your dashboard");
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setPaymentRequests([]);
      setPaymentsLoading(false);
      return;
    }

    const paymentRequestCollection = collection(db, "paymentRequests");
    const broadcastQuery = query(paymentRequestCollection, where("audience", "==", "all"), where("isActive", "==", true));
    const targetedQuery = query(paymentRequestCollection, where("targetUserIds", "array-contains", user.uid), where("isActive", "==", true));

    const mergeRequests = (nextItems: DashboardPaymentRequest[], currentItems: DashboardPaymentRequest[]) => {
      const map = new Map<string, DashboardPaymentRequest>();
      [...currentItems, ...nextItems].forEach((item) => map.set(item.id, item));

      return Array.from(map.values()).sort((left, right) => {
        const leftTime = left.createdAt?.toDate?.().getTime() || 0;
        const rightTime = right.createdAt?.toDate?.().getTime() || 0;
        return rightTime - leftTime;
      });
    };

    const broadcastUnsubscribe = onSnapshot(broadcastQuery, (snapshot) => {
      const items = snapshot.docs.map((document) => ({ id: document.id, ...document.data() } as DashboardPaymentRequest));
      setPaymentRequests((current) => mergeRequests(items, current.filter((item) => item.audience !== "all")));
      setPaymentsLoading(false);
    });

    const targetedUnsubscribe = onSnapshot(targetedQuery, (snapshot) => {
      const items = snapshot.docs.map((document) => ({ id: document.id, ...document.data() } as DashboardPaymentRequest));
      setPaymentRequests((current) => mergeRequests(items, current.filter((item) => item.audience !== "selected")));
      setPaymentsLoading(false);
    });

    return () => {
      broadcastUnsubscribe();
      targetedUnsubscribe();
    };
  }, [user]);

  useEffect(() => {
    if (!user) {
      setPaymentHistory([]);
      setPaymentHistoryLoading(false);
      return;
    }

    const paymentCollection = collection(db, "payments");
    const userPaymentsQuery = query(paymentCollection, where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(userPaymentsQuery, (snapshot) => {
      const items = snapshot.docs
        .map((document) => ({ id: document.id, ...document.data() } as PaymentRecord))
        .sort((left, right) => {
          const leftTime = left.paidAt?.toDate?.().getTime() || 0;
          const rightTime = right.paidAt?.toDate?.().getTime() || 0;
          return rightTime - leftTime;
        });

      setPaymentHistory(items);
      setPaymentHistoryLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setActivities([]);
      setActivitiesLoading(false);
      return;
    }

    const activitiesCollection = collection(db, "activities");
    const activitiesQuery = query(activitiesCollection, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      activitiesQuery,
      (snapshot) => {
        const items = snapshot.docs.map((document) => ({ id: document.id, ...document.data() } as DashboardActivity));
        setActivities(items);
        setActivitiesLoading(false);
      },
      (error) => {
        console.error("Error fetching activities:", error);
        setActivitiesLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    if (!settingsOpen) return;

    setProfileForm({
      fullName: details?.fullName || details?.displayName || profile?.displayName || user?.displayName || "",
      email: details?.email || profile?.email || user?.email || "",
      phone: details?.phone || profile?.phone || "",
      location: details?.location || "",
      age: details?.age ? String(details.age) : "",
    });
  }, [details, profile, settingsOpen, user]);

  useEffect(() => {
    if (!user) {
      setNotificationItems([]);
      setNotificationsLoading(false);
      return;
    }

    const notificationCollection = collection(db, "notifications");
    const broadcastQuery = query(notificationCollection, where("audience", "==", "all"));
    const targetedQuery = query(notificationCollection, where("targetUserIds", "array-contains", user.uid));

    const mergeNotifications = (nextItems: DashboardNotification[], currentItems: DashboardNotification[]) => {
      const map = new Map<string, DashboardNotification>();
      [...currentItems, ...nextItems].forEach((item) => map.set(item.id, item));

      return Array.from(map.values()).sort((left, right) => {
        const leftTime = left.createdAt?.toDate?.().getTime() || 0;
        const rightTime = right.createdAt?.toDate?.().getTime() || 0;
        return rightTime - leftTime;
      });
    };

    const broadcastUnsubscribe = onSnapshot(broadcastQuery, (snapshot) => {
      const items = snapshot.docs.map((document) => ({ id: document.id, ...document.data() } as DashboardNotification));
      setNotificationItems((current) => mergeNotifications(items, current));
      setNotificationsLoading(false);
    });

    const targetedUnsubscribe = onSnapshot(targetedQuery, (snapshot) => {
      const items = snapshot.docs.map((document) => ({ id: document.id, ...document.data() } as DashboardNotification));
      setNotificationItems((current) => mergeNotifications(items, current));
      setNotificationsLoading(false);
    });

    return () => {
      broadcastUnsubscribe();
      targetedUnsubscribe();
    };
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;

    const nextName = profileForm.fullName.trim();
    const nextEmail = profileForm.email.trim();
    const nextPhone = profileForm.phone.trim();
    const nextLocation = profileForm.location.trim();
    const nextAge = Number(profileForm.age || 0);

    if (!nextName) {
      toast.error("Name is required");
      return;
    }

    setSavingProfile(true);
    try {
      await updateUserProfileRecord(user.uid, {
        displayName: nextName,
        fullName: nextName,
        name: nextName,
        email: nextEmail,
        phone: nextPhone,
        location: nextLocation,
        age: Number.isFinite(nextAge) && nextAge > 0 ? nextAge : undefined,
      });
      setDetails((current) => current ? { ...current, fullName: nextName, displayName: nextName, email: nextEmail, phone: nextPhone, location: nextLocation, age: Number.isFinite(nextAge) && nextAge > 0 ? nextAge : current.age } : current);
      toast.success("Profile updated");
      setSettingsOpen(false);
    } catch {
      toast.error("Unable to update your profile");
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 px-4 pb-6 pt-24 sm:px-6">
        <div className="mx-auto grid w-full max-w-[1440px] gap-6 lg:grid-cols-[280px,minmax(0,1fr)]">
          <aside className="sticky top-24 h-fit rounded-[2rem] border border-primary/20 bg-gradient-to-b from-primary to-red-700 p-6 text-primary-foreground shadow-lg shadow-primary/20">
            <div className="space-y-2">
              <Link to="/dashboard" className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-left text-sm font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:bg-white/20 hover:shadow-md">
                <span className="inline-flex items-center gap-3"><Home className="h-4 w-4 text-white/90" /> Dashboard</span>
                <ChevronRight className="h-4 w-4 text-white/70 transition group-hover:translate-x-0.5" />
              </Link>
              <Link to="/courses" className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:bg-white/20 hover:shadow-md">
                <span className="inline-flex items-center gap-3"><BookOpen className="h-4 w-4 text-white/90" /> Courses</span>
                <ArrowRight className="h-4 w-4 text-white/70" />
              </Link>
              <button type="button" onClick={() => setNotificationsOpen(true)} className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-left text-sm font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:bg-white/20 hover:shadow-md">
                <span className="inline-flex items-center gap-3"><Bell className="h-4 w-4 text-white/90 transition group-hover:scale-110" /> Notifications</span>
                <ChevronRight className="h-4 w-4 text-white/70 transition group-hover:translate-x-0.5" />
              </button>
              <button type="button" onClick={() => setPaymentsOpen(true)} className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-left text-sm font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:bg-white/20 hover:shadow-md">
                <span className="inline-flex items-center gap-3"><CreditCard className="h-4 w-4 text-white/90 transition group-hover:scale-110" /> Payments</span>
                <span className="inline-flex items-center gap-2">
                  {visiblePaymentRequests.length > 0 ? <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-primary">{visiblePaymentRequests.length}</span> : null}
                  <ChevronRight className="h-4 w-4 text-white/70 transition group-hover:translate-x-0.5" />
                </span>
              </button>
              <button type="button" onClick={() => setActivitiesOpen(true)} className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-left text-sm font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:bg-white/20 hover:shadow-md">
                <span className="inline-flex items-center gap-3"><Calendar className="h-4 w-4 text-white/90 transition group-hover:scale-110" /> Activities</span>
                <span className="inline-flex items-center gap-2">
                  {activities.length > 0 ? <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-primary">{activities.length}</span> : null}
                  <ChevronRight className="h-4 w-4 text-white/70 transition group-hover:translate-x-0.5" />
                </span>
              </button>
              <button type="button" onClick={() => setSettingsOpen(true)} className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-left text-sm font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:bg-white/20 hover:shadow-md">
                <span className="inline-flex items-center gap-3"><Settings2 className="h-4 w-4 text-white/90 transition group-hover:scale-110" /> Settings</span>
                <ChevronRight className="h-4 w-4 text-white/70 transition group-hover:translate-x-0.5" />
              </button>
            </div>

            <Button onClick={() => void logout()} variant="outline" className="mt-6 w-full justify-start gap-2 rounded-2xl border-white/20 bg-white/10 text-white transition hover:bg-white/20 hover:text-white">
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </aside>

          <section className="space-y-6">
            <Card className="overflow-hidden border border-primary/15 bg-primary shadow-sm">
              <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-primary-foreground/80">Dashboard</p>
                  <h1 className="mt-3 text-3xl font-semibold leading-tight text-primary-foreground sm:text-4xl">Welcome back, {displayName}</h1>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button type="button" onClick={() => setSettingsOpen(true)} className="rounded-2xl border border-white/20 bg-white text-primary hover:bg-white/90">
                    <Settings2 className="h-4 w-4" /> Settings
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setActivitiesOpen(true)} className="rounded-2xl border-white/20 bg-white/10 text-white transition hover:bg-white/20 hover:text-white">
                    <Calendar className="h-4 w-4" /> Activities
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setNotificationsOpen(true)} className="rounded-2xl border-white/20 bg-white/10 text-white transition hover:bg-white/20 hover:text-white">
                    <Bell className="h-4 w-4" /> Notifications
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setPaymentsOpen(true)} className="rounded-2xl border-white/20 bg-white/10 text-white transition hover:bg-white/20 hover:text-white">
                    <CreditCard className="h-4 w-4" /> Payments
                  </Button>
                </div>
              </CardContent>
            </Card>

            {visiblePaymentRequests.length > 0 ? (
              <Card className="border-primary/20 bg-primary/5 shadow-sm dark:border-primary/30 dark:bg-primary/10">
                <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Payment request</p>
                    <h2 className="mt-2 text-xl font-semibold text-foreground">{visiblePaymentRequests[0].title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{visiblePaymentRequests[0].message || "You have a payment request from Tutor."}</p>
                  </div>
                  <Button type="button" onClick={() => { setSelectedPaymentRequest(visiblePaymentRequests[0]); setPaymentsOpen(true); }} className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90">
                    Pay KES {getPaymentSummary(visiblePaymentRequests[0]).remainingAmount.toLocaleString()}
                  </Button>
                </CardContent>
              </Card>
            ) : null}

            {activities.length > 0 ? (
              <section className="space-y-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Recent</p>
                    <h2 className="text-2xl font-semibold text-foreground">Latest Activities</h2>
                  </div>
                  <button type="button" onClick={() => setActivitiesOpen(true)} className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                    View all ({activities.length}) <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {activities.slice(0, 2).map((act) => (
                    <Card key={act.id} className="flex flex-col justify-between overflow-hidden border-border bg-card shadow-sm transition hover:shadow-md">
                      <CardContent className="flex h-full flex-col justify-between gap-4 p-5">
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="line-clamp-1 text-lg font-semibold leading-snug text-foreground">{act.title}</h3>
                            <span className="mt-0.5 shrink-0 text-xs text-muted-foreground">
                              {act.createdAt?.toDate ? act.createdAt.toDate().toLocaleDateString() : "Just now"}
                            </span>
                          </div>
                          <p className="mt-2 line-clamp-3 whitespace-pre-wrap leading-relaxed text-muted-foreground text-sm">
                            {act.description}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {act.videoUrl && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100/60 px-2.5 py-1 text-[11px] font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-300">
                              <Tv className="h-3 w-3" /> Video Link
                            </span>
                          )}
                          {act.meetUrl && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100/60 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                              <Video className="h-3 w-3" /> Google Meet Live
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex items-center gap-2 border-t border-border pt-2">
                          {act.videoUrl && (
                            <a href={act.videoUrl} target="_blank" rel="noopener noreferrer" className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-950/30 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/35">
                              <Tv className="h-3.5 w-3.5" /> Watch Video
                            </a>
                          )}
                          {act.meetUrl && (
                            <a href={act.meetUrl} target="_blank" rel="noopener noreferrer" className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 dark:border-blue-950/30 dark:bg-blue-950/20 dark:text-blue-400 dark:hover:bg-blue-950/35">
                              <Video className="h-3.5 w-3.5" /> Join Meet
                            </a>
                          )}
                          {!act.videoUrl && !act.meetUrl && (
                            <button type="button" onClick={() => setActivitiesOpen(true)} className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted">
                              View Details
                            </button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ) : null}

            <section>
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Courses</p>
                  <h2 className="text-2xl font-semibold text-foreground">Enrolled courses</h2>
                </div>
                <Link to="/courses" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                  Browse more <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {loading ? (
                <Card className="border-border bg-card shadow-sm">
                  <CardContent className="p-6 text-sm text-muted-foreground">Loading your learning dashboard...</CardContent>
                </Card>
              ) : courses.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {courses.map((item) => (
                    <Card key={item.courseId} className="overflow-hidden border-border bg-card shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                      <div className="relative h-44 bg-muted">
                        <img
                          src={item.course?.thumbnailUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"}
                          alt={item.courseName}
                          className="h-full w-full object-cover"
                        />
                        <button type="button" onClick={() => setSelectedCourse(item)} className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-lg transition hover:bg-muted" aria-label={`View details for ${item.courseName}`}>
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                      <CardContent className="space-y-4 p-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Course</p>
                          <h3 className="mt-2 truncate text-lg font-semibold text-foreground">{item.courseName}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{item.course?.category || "Course access"}</p>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl bg-muted px-4 py-3 text-sm">
                          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Status</span>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${item.status === "active" ? "bg-primary/10 text-primary" : item.status === "revoked" ? "bg-destructive/10 text-destructive" : "bg-secondary/10 text-secondary"}`}>
                            {item.status || "pending"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{asDate(item.enrolledAt)?.toLocaleDateString() || "Recently added"}</span>
                          {item.status === "active" ? (
                            <Link to={`/courses/${item.courseId}`} className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                              Open course <ArrowRight className="h-4 w-4" />
                            </Link>
                          ) : (
                            <span className="text-sm font-medium text-muted-foreground">{item.status === "revoked" ? "Access disabled" : "Waiting for approval"}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed border-border bg-card shadow-sm">
                  <CardContent className="flex flex-col items-center justify-center py-14 text-center">
                    <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="text-lg font-semibold text-foreground">No enrolled courses yet</h3>
                    <p className="mt-2 max-w-md text-sm text-muted-foreground">When you purchase or enroll in a course, it will appear here automatically.</p>
                    <Link to="/courses" className="mt-5">
                      <Button>Browse courses</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </section>
          </section>
        </div>
      </main>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-2xl rounded-[1.75rem] border-border bg-card p-0 shadow-2xl">
          <div className="border-b border-border px-6 py-5">
            <DialogHeader className="space-y-2 text-left">
              <DialogTitle className="text-2xl font-bold text-foreground">Profile settings</DialogTitle>
              <DialogDescription>Update only the fields shown here. Course access and account permissions stay unchanged.</DialogDescription>
            </DialogHeader>
          </div>
          <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
            <label className="space-y-2 text-sm text-muted-foreground md:col-span-2">
              <span className="font-medium text-foreground">Full name</span>
              <input value={profileForm.fullName} onChange={(event) => setProfileForm((current) => ({ ...current, fullName: event.target.value }))} className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
            </label>
            <label className="space-y-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Email</span>
              <input value={profileForm.email} onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))} className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
            </label>
            <label className="space-y-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Phone</span>
              <input value={profileForm.phone} onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))} className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
            </label>
            <label className="space-y-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Location</span>
              <input value={profileForm.location} onChange={(event) => setProfileForm((current) => ({ ...current, location: event.target.value }))} className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
            </label>
            <label className="space-y-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Age</span>
              <input type="number" min="0" value={profileForm.age} onChange={(event) => setProfileForm((current) => ({ ...current, age: event.target.value }))} className="w-full rounded-2xl border border-border bg-background px-4 py-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
            </label>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-5">
            <Button type="button" variant="outline" onClick={() => setSettingsOpen(false)} className="rounded-2xl border-border">Cancel</Button>
            <Button type="button" onClick={() => void saveProfile()} disabled={savingProfile} className="rounded-2xl px-6">{savingProfile ? "Saving..." : "Save changes"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-hidden rounded-[1.75rem] border-border bg-card p-0 shadow-2xl">
          <div className="border-b border-border px-6 py-5">
            <DialogHeader className="space-y-2 text-left">
              <DialogTitle className="text-2xl font-bold text-foreground">Notifications</DialogTitle>
              <DialogDescription>Announcements and alerts are shown here as compact notifications instead of a separate page.</DialogDescription>
            </DialogHeader>
          </div>
          <div className="max-h-[68vh] space-y-3 overflow-auto px-6 py-5">
            {notificationsLoading ? (
              <Card className="border-border bg-muted">
                <CardContent className="p-5 text-sm text-muted-foreground">Loading notifications...</CardContent>
              </Card>
            ) : visibleNotifications.length > 0 ? (
              visibleNotifications.map((notification) => (
                <div key={notification.id} className="rounded-[1.5rem] border border-border bg-muted px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Notification</p>
                      <h3 className="mt-2 text-lg font-semibold text-foreground">{notification.title}</h3>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${notification.audience === "all" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}`}>
                      {notification.audience === "all" ? "All users" : "Selected users"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{notification.message}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5"><Bell className="h-3.5 w-3.5" />{notification.createdAt?.toDate ? notification.createdAt.toDate().toLocaleString() : "Just now"}</span>
                    {notification.createdByEmail ? <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{notification.createdByEmail}</span> : null}
                  </div>
                </div>
              ))
            ) : (
              <Card className="border-dashed border-border bg-card">
                <CardContent className="flex flex-col items-center py-14 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-xl font-semibold text-foreground">No notifications yet</h3>
                  <p className="mt-2 max-w-xl text-sm text-muted-foreground">When the admin sends updates, they will appear here in a compact message feed.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentsOpen} onOpenChange={setPaymentsOpen}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-hidden rounded-[1.75rem] border-border bg-card p-0 shadow-2xl">
          <div className="border-b border-border px-6 py-5">
            <DialogHeader className="space-y-2 text-left">
              <DialogTitle className="text-2xl font-bold text-foreground">Payments</DialogTitle>
              <DialogDescription>Payment requests sent by Tutor appear here.</DialogDescription>
            </DialogHeader>
          </div>
          <div className="max-h-[68vh] space-y-3 overflow-auto px-6 py-5">
            {paymentsLoading ? (
              <Card className="border-border bg-muted">
                <CardContent className="p-5 text-sm text-muted-foreground">Loading payment requests...</CardContent>
              </Card>
            ) : visiblePaymentRequests.length > 0 ? (
              visiblePaymentRequests.map((request) => (
                <div key={request.id} className="rounded-[1.5rem] border border-primary/15 bg-primary/5 px-5 py-4 shadow-sm">
                  {(() => {
                    const summary = getPaymentSummary(request);

                    return (
                      <>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.24em] text-primary">{request.purpose}</p>
                            <h3 className="mt-2 text-lg font-semibold text-foreground">{request.title}</h3>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">{request.message || "Payment is required to continue."}</p>
                          </div>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary shadow-sm dark:bg-slate-900">
                            Due KES {Number(request.amount || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                          <span>Course: {request.courseName || "General"}</span>
                          <span>Module: {request.moduleName || "Not specified"}</span>
                          <span>Audience: {request.audience === "all" ? "All learners" : "Selected learners"}</span>
                          <span>Due: {asDate(request.dueDate)?.toLocaleDateString() || "No due date"}</span>
                          <span>Paid: KES {summary.paidAmount.toLocaleString()}</span>
                          <span>Remaining: KES {summary.remainingAmount.toLocaleString()}</span>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          {(request.allowedPercentages?.length ? request.allowedPercentages : [25, 50, 75, 100]).map((percentage) => (
                            <span key={percentage} className="rounded-full border border-primary/20 bg-white px-3 py-1 font-medium text-primary dark:bg-slate-900">
                              {percentage}%
                            </span>
                          ))}
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Button type="button" onClick={() => setSelectedPaymentRequest(request)} className="rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90">
                            Pay now
                          </Button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ))
            ) : (
              <Card className="border-dashed border-border bg-card">
                <CardContent className="flex flex-col items-center py-14 text-center">
                  <CreditCard className="h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-xl font-semibold text-foreground">No payment requests</h3>
                  <p className="mt-2 max-w-xl text-sm text-muted-foreground">When Tutor sends a payment request for a module, week, or course, it will appear here.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedCourse)} onOpenChange={(open) => !open && setSelectedCourse(null)}>
        <DialogContent className="max-w-2xl rounded-[1.75rem] border-border bg-card p-0 shadow-2xl">
          {selectedCourse ? (
            <>
              <div className="h-56 bg-muted">
                <img src={selectedCourse.course?.thumbnailUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"} alt={selectedCourse.courseName} className="h-full w-full object-cover" />
              </div>
              <div className="px-6 py-5">
                <DialogHeader className="text-left">
                  <DialogTitle className="text-2xl font-bold text-foreground">{selectedCourse.courseName}</DialogTitle>
                  <DialogDescription>{selectedCourse.course?.category || "Course access"}</DialogDescription>
                </DialogHeader>
                <div className="mt-5 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                  <div className="rounded-2xl bg-muted px-4 py-3"><span className="font-semibold text-foreground">Status: </span>{selectedCourse.status || "pending"}</div>
                  <div className="rounded-2xl bg-muted px-4 py-3"><span className="font-semibold text-foreground">Enrolled: </span>{asDate(selectedCourse.enrolledAt)?.toLocaleDateString() || "—"}</div>
                  <div className="rounded-2xl bg-muted px-4 py-3 sm:col-span-2"><span className="font-semibold text-foreground">Category: </span>{selectedCourse.course?.category || "—"}</div>
                </div>
                <div className="mt-5 flex items-center justify-end gap-3">
                  {selectedCourse.status === "active" ? (
                    <Link to={`/courses/${selectedCourse.courseId}`} className="inline-flex rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90">
                      Open course
                    </Link>
                  ) : null}
                  <Button type="button" variant="outline" onClick={() => setSelectedCourse(null)} className="rounded-2xl border-border">
                    Close
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <PaymentModal
        isOpen={Boolean(selectedPaymentRequest)}
        onClose={() => setSelectedPaymentRequest(null)}
        courseId={selectedPaymentRequest?.courseId || selectedPaymentRequest?.id || "payment-request"}
        courseName={selectedPaymentRequest?.title || "Tutor payment"}
        price={Number(selectedPaymentRequest?.amount || 0)}
        requestId={selectedPaymentRequest?.id}
        requestTitle={selectedPaymentRequest?.title}
        requestMessage={selectedPaymentRequest?.message}
        allowedPercentages={selectedPaymentRequest?.allowedPercentages}
        paidAmount={selectedPaymentRequest ? getPaymentSummary(selectedPaymentRequest).paidAmount : 0}
        remainingAmount={selectedPaymentRequest ? getPaymentSummary(selectedPaymentRequest).remainingAmount : 0}
        onSuccess={() => {
          toast.success("Payment submitted. Tutor will confirm your access.");
          setSelectedPaymentRequest(null);
        }}
      />

      <Dialog open={activitiesOpen} onOpenChange={setActivitiesOpen}>
        <DialogContent className="max-h-[85vh] max-w-4xl overflow-hidden rounded-[1.75rem] border-border bg-card p-0 shadow-2xl">
          <div className="border-b border-border px-6 py-5">
            <DialogHeader className="space-y-2 text-left">
              <DialogTitle className="text-2xl font-bold text-foreground">Activities</DialogTitle>
              <DialogDescription>Recent updates, links, and class activity.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="max-h-[68vh] space-y-4 overflow-auto px-6 py-5">
            {activitiesLoading ? (
              <Card className="border-border bg-muted"><CardContent className="p-5 text-sm text-muted-foreground">Loading activities...</CardContent></Card>
            ) : activities.length > 0 ? (
              activities.map((act) => (
                <div key={act.id} className="rounded-[1.5rem] border border-border bg-muted px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Activity</p>
                      <h3 className="mt-2 text-lg font-semibold text-foreground">{act.title}</h3>
                    </div>
                    <span className="text-xs text-muted-foreground">{act.createdAt?.toDate ? act.createdAt.toDate().toLocaleString() : "Just now"}</span>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{act.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {act.videoUrl ? <a href={act.videoUrl} target="_blank" rel="noreferrer" className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted">Video</a> : null}
                    {act.meetUrl ? <a href={act.meetUrl} target="_blank" rel="noreferrer" className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted">Meet</a> : null}
                  </div>
                </div>
              ))
            ) : (
              <Card className="border-dashed border-border bg-card">
                <CardContent className="flex flex-col items-center py-14 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-xl font-semibold text-foreground">No activities yet</h3>
                  <p className="mt-2 max-w-xl text-sm text-muted-foreground">Updates from the admin and course activity will appear here.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Dashboard;
