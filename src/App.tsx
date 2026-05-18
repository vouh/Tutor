import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import Courses from "./pages/Courses";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import CourseDetail from "./pages/CourseDetail";
import Dashboard from "./pages/Dashboard";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import SearchResults from "./pages/SearchResults";
import CourseViewer from "./pages/CourseViewer";
import Auth from "./pages/Auth";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminCourseModules from "./pages/admin/AdminCourseModules";
import AdminModules from "./pages/admin/AdminModules";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminNotifications from "./pages/admin/AdminNotifications";
import Notifications from "./pages/Notifications";
import Enroll from "./pages/Enroll";

import { AuthProvider } from "./contexts/AuthContext";
import { RequireAuth } from "./components/RequireAuth";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { RequireAdmin } from "./components/admin/RequireAdmin";
import { AdminLayout } from "./components/admin/AdminLayout";
import { ThemeProvider } from "./components/theme-provider";

const queryClient = new QueryClient();

const App = () => {
  return (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <AdminAuthProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/courses" element={<Courses />} />
                  <Route path="/course/:id" element={<CourseDetail />} />
                  <Route path="/enroll/:id" element={<Enroll />} />
                  <Route path="/login" element={<Auth />} />
                  <Route
                    path="/courses/:id"
                    element={
                      <RequireAuth>
                        <CourseViewer />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/courses/:id/:moduleId"
                    element={
                      <RequireAuth>
                        <CourseViewer />
                      </RequireAuth>
                    }
                  />
                  <Route path="/contact" element={<Contact />} />
                  <Route
                    path="/dashboard"
                    element={
                      <RequireAuth>
                        <Dashboard />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <RequireAuth>
                        <Notifications />
                      </RequireAuth>
                    }
                  />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route
                    path="/admin"
                    element={
                      <RequireAdmin>
                        <AdminLayout />
                      </RequireAdmin>
                    }
                  >
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="courses" element={<AdminCourses />} />
                    <Route path="modules" element={<AdminModules />} />
                    <Route path="courses/:id/modules" element={<AdminCourseModules />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="notifications" element={<AdminNotifications />} />
                    <Route path="payments" element={<AdminPayments />} />
                  </Route>
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </AdminAuthProvider>
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
  );
};

export default App;
