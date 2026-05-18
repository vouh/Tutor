import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Bell, CreditCard, LogOut, User } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { asDate, getUserDetails, type LearnerPaymentEntry, type UserCourseRecord, type UserDetailsRecord } from "@/lib/adminData";
import { getCourseById, type Course } from "@/lib/firestore";
import { toast } from "sonner";

const Dashboard = () => {
  const { user, profile, logout } = useAuth();
  const [courses, setCourses] = useState<Array<UserCourseRecord & { course?: Course | null }>>([]);
  const [details, setDetails] = useState<UserDetailsRecord | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="w-full space-y-4 lg:w-80">
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">
                    {profile?.displayName?.slice(0, 2).toUpperCase() || "TU"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{profile?.displayName || user?.email || "Student"}</h3>
                    <p className="text-xs text-slate-500">{profile?.role || "student"}</p>
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                    <User className="h-4 w-4 text-primary" />
                    <span>{profile?.email || user?.email || "No email available"}</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>{courses.length} enrolled course{courses.length === 1 ? "" : "s"}</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                    <Bell className="h-4 w-4 text-primary" />
                    <Link to="/notifications" className="font-medium text-primary hover:underline">
                      View notifications
                    </Link>
                  </div>
                </div>

                <Button onClick={() => void logout()} variant="outline" className="mt-5 w-full justify-start gap-2 text-red-600 hover:bg-red-50 hover:text-red-700">
                  <LogOut className="h-4 w-4" /> Logout
                </Button>
              </CardContent>
            </Card>
          </aside>

          <div className="flex-1 space-y-6">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-slate-900">Welcome back, {details?.fullName || profile?.displayName || "Learner"}</h1>
              <p className="text-slate-600">Track your enrolled courses, payments, profile, and admin announcements.</p>
            </div>

            <section className="grid gap-4 md:grid-cols-3">
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardContent className="p-5">
                  <p className="text-sm text-slate-500">Profile</p>
                  <p className="mt-2 text-xl font-bold text-slate-900">{profile?.displayName || "Student"}</p>
                </CardContent>
              </Card>
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardContent className="p-5">
                  <p className="text-sm text-slate-500">Courses</p>
                  <p className="mt-2 text-xl font-bold text-slate-900">{courses.length}</p>
                </CardContent>
              </Card>
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardContent className="p-5">
                  <p className="text-sm text-slate-500">Notifications</p>
                  <p className="mt-2 text-xl font-bold text-slate-900">Live</p>
                </CardContent>
              </Card>
            </section>

            <section>
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Enrolled courses</h2>
                  <p className="text-sm text-slate-500">Courses linked to your account.</p>
                </div>
                <Link to="/courses" className="text-sm font-medium text-primary hover:underline">Browse more</Link>
              </div>

              {loading ? (
                <Card className="border-slate-200 bg-white shadow-sm">
                  <CardContent className="p-6 text-sm text-slate-500">Loading your learning dashboard...</CardContent>
                </Card>
              ) : courses.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {courses.map((item) => (
                    <Card key={item.courseId} className="overflow-hidden border-slate-200 bg-white shadow-sm">
                      <div className="h-40 bg-slate-100">
                        <img
                          src={item.course?.thumbnailUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"}
                          alt={item.courseName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-semibold text-slate-900">{item.courseName}</h3>
                        <p className="mt-1 text-sm text-slate-500">{item.course?.category || "Course access"}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</span>
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Active</span>
                        </div>
                        <Link to={`/courses/${item.courseId}`} className="mt-4 inline-flex text-sm font-medium text-primary hover:underline">
                          Open course
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed border-slate-300 bg-white shadow-sm">
                  <CardContent className="flex flex-col items-center justify-center py-14 text-center">
                    <BookOpen className="mb-4 h-12 w-12 text-slate-300" />
                    <h3 className="text-lg font-semibold text-slate-900">No enrolled courses yet</h3>
                    <p className="mt-2 max-w-md text-sm text-slate-500">When you purchase or enroll in a course, it will appear here automatically.</p>
                    <Link to="/courses" className="mt-5">
                      <Button>Browse courses</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardContent className="p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold text-slate-900">My Payments</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 text-sm">
                      <thead className="text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                        <tr>
                          <th className="py-3 pr-4">Date</th>
                          <th className="py-3 pr-4">Amount</th>
                          <th className="py-3 pr-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(details?.paymentsLog || []).length > 0 ? (details?.paymentsLog || []).map((payment: LearnerPaymentEntry) => (
                          <tr key={payment.id}>
                            <td className="py-3 pr-4 text-slate-600">{asDate(payment.date)?.toLocaleDateString() || "—"}</td>
                            <td className="py-3 pr-4 font-medium text-slate-900">KES {Number(payment.amount || 0).toLocaleString()}</td>
                            <td className="py-3 pr-4">
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">{payment.status}</span>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan={3} className="py-6 text-sm text-slate-500">No payment entries yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-sm">
                <CardContent className="p-5">
                  <h2 className="text-xl font-bold text-slate-900">My Details</h2>
                  <div className="mt-4 grid gap-3 text-sm text-slate-600">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3"><span className="font-semibold text-slate-900">Name: </span>{details?.fullName || details?.displayName || profile?.displayName || "—"}</div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3"><span className="font-semibold text-slate-900">Email: </span>{details?.email || profile?.email || user?.email || "—"}</div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3"><span className="font-semibold text-slate-900">Age: </span>{details?.age || "—"}</div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3"><span className="font-semibold text-slate-900">Laptop: </span>{details?.hasLaptop === undefined ? "—" : details.hasLaptop ? "Yes" : "No"}</div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3"><span className="font-semibold text-slate-900">Enrolled: </span>{asDate(details?.enrolledAt || details?.createdAt)?.toLocaleDateString() || "—"}</div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
