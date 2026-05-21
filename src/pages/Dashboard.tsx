import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowRight, Bell, BookOpen, ChevronRight, Eye, Home, LogOut, Mail, MapPin, Settings2, User } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { asDate, getUserDetails, updateUserProfileRecord, type LearnerPaymentEntry, type NotificationRecord, type UserCourseRecord, type UserDetailsRecord } from "@/lib/adminData";
import { getCourseById, type Course } from "@/lib/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

type DashboardNotification = NotificationRecord & { id: string };

type ProfileFormState = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  age: string;
};

const Dashboard = () => {
  const { user, profile, logout } = useAuth();
  const [courses, setCourses] = useState<Array<UserCourseRecord & { course?: Course | null }>>([]);
  const [details, setDetails] = useState<UserDetailsRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<(UserCourseRecord & { course?: Course | null }) | null>(null);
  const [notificationItems, setNotificationItems] = useState<DashboardNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
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
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow px-4 py-6">
        <div className="mx-auto grid w-full max-w-[1440px] gap-6 lg:grid-cols-[280px,minmax(0,1fr)]">
          <aside className="sticky top-24 h-fit rounded-[2rem] bg-primary p-6 text-primary-foreground shadow-lg shadow-primary/15">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-white/15 text-xl font-bold text-white">
                  {displayName.slice(0, 2).toUpperCase() || "TU"}
                </div>
              </div>
              <Button type="button" variant="outline" size="icon" onClick={() => setSettingsOpen(true)} className="shrink-0 rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                <Settings2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-6 space-y-2">
              <Link
                to="/dashboard"
                className="flex w-full items-center justify-between rounded-2xl bg-white/12 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-white/18"
              >
                <span className="inline-flex items-center gap-3"><Home className="h-4 w-4 text-white" /> Dashboard</span>
                <ChevronRight className="h-4 w-4 text-white/70" />
              </Link>
              <Link
                to="/courses"
                className="flex w-full items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/18 hover:shadow-sm"
              >
                <span className="inline-flex items-center gap-3"><BookOpen className="h-4 w-4 text-white" /> Courses</span>
                <ArrowRight className="h-4 w-4 text-white/70" />
              </Link>
              <button
                type="button"
                onClick={() => setNotificationsOpen(true)}
                className="flex w-full items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-white/18 hover:shadow-sm"
              >
                <span className="inline-flex items-center gap-3"><Bell className="h-4 w-4 text-white" /> Messages</span>
                <ChevronRight className="h-4 w-4 text-white/70" />
              </button>
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="flex w-full items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-white/18 hover:shadow-sm"
              >
                <span className="inline-flex items-center gap-3"><Settings2 className="h-4 w-4 text-white" /> Settings</span>
                <ChevronRight className="h-4 w-4 text-white/70" />
              </button>
            </div>

            <div className="mt-6 rounded-[1.5rem] bg-white/10 p-4 text-sm text-white/85">
              <p className="text-xs uppercase tracking-[0.25em] text-white/60">Account</p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-white" /><span className="truncate">{displayEmail}</span></div>
                <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-white" /><span className="truncate">{details?.location || "Location not set"}</span></div>
                <div className="flex items-center gap-3"><User className="h-4 w-4 text-white" /><span>{profile?.role || "student"}</span></div>
              </div>
            </div>

            <Button onClick={() => void logout()} variant="outline" className="mt-6 w-full justify-start gap-2 rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white">
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </aside>

          <section className="space-y-6">
            <Card className="overflow-hidden border-primary/10 bg-primary text-primary-foreground shadow-lg shadow-primary/10">
              <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-white/65">Dashboard</p>
                  <h1 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">Welcome back, {displayName}</h1>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button type="button" onClick={() => setSettingsOpen(true)} className="rounded-2xl bg-white text-primary hover:bg-white/90">
                    <Settings2 className="h-4 w-4" /> Settings
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setNotificationsOpen(true)} className="rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                    <Bell className="h-4 w-4" /> Messages
                  </Button>
                </div>
              </CardContent>
            </Card>

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
                        <button
                          type="button"
                          onClick={() => setSelectedCourse(item)}
                          className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-lg transition hover:bg-muted"
                          aria-label={`View details for ${item.courseName}`}
                        >
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
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                            item.status === "active"
                              ? "bg-primary/10 text-primary"
                              : item.status === "revoked"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-secondary/10 text-secondary"
                          }`}>
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
                            <span className="text-sm font-medium text-muted-foreground">
                              {item.status === "revoked" ? "Access disabled" : "Waiting for approval"}
                            </span>
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
              <DialogDescription>Announcements and alerts are shown here as compact messages instead of a separate page.</DialogDescription>
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
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Message</p>
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

      <Dialog open={Boolean(selectedCourse)} onOpenChange={(open) => !open && setSelectedCourse(null)}>
        <DialogContent className="max-w-2xl rounded-[1.75rem] border-slate-200 bg-white p-0 shadow-2xl">
          {selectedCourse ? (
            <>
              <div className="h-56 bg-muted">
                <img
                  src={selectedCourse.course?.thumbnailUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"}
                  alt={selectedCourse.courseName}
                  className="h-full w-full object-cover"
                />
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
                  <Button type="button" variant="outline" onClick={() => setSelectedCourse(null)} className="rounded-2xl border-slate-200">
                    Close
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
