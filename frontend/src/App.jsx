import React, { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { ReactLenis, useLenis } from "lenis/react"; // ── Modern import format
import { AuthProvider } from "./app/AuthContext";
import { PrivateRoutes } from "./Routes/PrivateRoutes";
import { PublicRoutes } from "./Routes/PublicRoutes";
import { AuthPresenceWrapper } from "./components/auth/AuthPresenceWrapper";
import { PageLoader } from "./components/PageLoader";
import { RequireAdmin } from "./components/dashboard/admin/RequireAdmin";
import { RequireAdminOrHR } from "./components/dashboard/admin/RequireAdminOrHR";
import { RequireTrainerProfile } from "./components/dashboard/trainer/RequireTrainerProfile";

/* ── Eagerly loaded — shown on first paint ── */
import { Homepage } from "./pages/Homepage";
import ActivateAccount from "./pages/ActivateAccount";
import CompleteTrainerProfile from "./pages/CompleteTrainerProfile";

/* ── Lazily loaded — split into separate chunks ── */
const AboutPage = lazy(() => import("./pages/AboutPage"));
const AllCoursesPage = lazy(() => import("./pages/AllCoursesPage"));
const CoursePage = lazy(() => import("./pages/CoursePage"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const CancellationPolicy = lazy(() => import("./pages/CancellationPolicy"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const LearnMore = lazy(() => import("./pages/LearnMore"));

const Dashboard = lazy(() => import("./pages/Dashboard"));
const DashboardIndex = lazy(() => import("./pages/DashboardIndex"));

/* admin */
const AdminProfile = lazy(
  () => import("./components/dashboard/admin/AdminProfile"),
);
const UserControl = lazy(() =>
  import("./components/dashboard/admin/UserControl").then((m) => ({
    default: m.UserControl,
  })),
);
const CourseSetup = lazy(() =>
  import("./components/dashboard/admin/CourseSetup").then((m) => ({
    default: m.CourseSetup,
  })),
);
const CoursesList = lazy(() =>
  import("./components/dashboard/admin/CoursesList").then((m) => ({
    default: m.CoursesList,
  })),
);
const BatchesList = lazy(() =>
  import("./components/dashboard/admin/BatchesList").then((m) => ({
    default: m.BatchesList,
  })),
);
const CourseDetail = lazy(() => import("./pages/admin/CourseDetail"));
const SystemHealth = lazy(() =>
  import("./components/dashboard/admin/SystemHealth").then((m) => ({
    default: m.SystemHealth,
  })),
);
const BillingLedger = lazy(() =>
  import("./components/dashboard/admin/BillingLedger").then((m) => ({
    default: m.BillingLedger,
  })),
);
const StudentControl = lazy(() =>
  import("./components/dashboard/admin/StudentControl").then((m) => ({
    default: m.StudentControl,
  })),
);
const TrainerControl = lazy(() =>
  import("./components/dashboard/admin/TrainerControl").then((m) => ({
    default: m.TrainerControl,
  })),
);
const HrControl = lazy(() =>
  import("./components/dashboard/admin/HrControl").then((m) => ({
    default: m.HrControl,
  })),
);
const AppointmentRequests = lazy(() =>
  import("./components/dashboard/admin/AppointmentRequests").then((m) => ({
    default: m.AppointmentRequests,
  })),
);

/* trainer */
const TrainerProfile = lazy(
  () => import("./components/dashboard/trainer/TrainerProfile"),
);
const TrainerBatches = lazy(() =>
  import("./components/dashboard/trainer/TrainerBatches").then((m) => ({
    default: m.TrainerBatches,
  })),
);
const TrainerAttendance = lazy(() =>
  import("./components/dashboard/trainer/TrainerAttendance").then((m) => ({
    default: m.TrainerAttendance,
  })),
);

/* student */
const StudentProfile = lazy(
  () => import("./components/dashboard/student/StudentProfile"),
);
const StudentProjects = lazy(
  () => import("./components/dashboard/student/StudentProjects"),
);
const StudentMaterials = lazy(
  () => import("./components/dashboard/student/StudentMaterials"),
);

/* shared */
const NotificationCenter = lazy(
  () => import("./components/dashboard/NotificationCenter"),
);

// ── Companion component to handle route changes
const ScrollToTop = () => {
  const { pathname } = useLocation();
  const lenis = useLenis();

  useEffect(() => {
    if (lenis) {
      // Instantly resets scroll container to top without triggering standard smooth scroll lag on navigation
      lenis.scrollTo(0, { immediate: true });
    }
  }, [pathname, lenis]);

  return null;
};

export const App = () => {
  return (
    <AuthProvider>
     
     
        <Router>
          <ScrollToTop />
          <Suspense fallback={<PageLoader label="Loading page" />}>
            <Routes>
              <Route path="/activate-account" element={<ActivateAccount />} />
              <Route
                path="/complete-trainer-profile"
                element={<CompleteTrainerProfile />}
              />

              <Route element={<PublicRoutes />}>
                <Route path="/" element={<Homepage />} />
                <Route path="/about-us" element={<AboutPage />} />
                <Route path="/all-courses" element={<AllCoursesPage />} />
                <Route path="/course/:courseId" element={<CoursePage />} />
                <Route path="/learn-more/:trackId" element={<LearnMore />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route
                  path="/cancellation-policy"
                  element={<CancellationPolicy />}
                />
                <Route element={<AuthPresenceWrapper />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                </Route>
              </Route>

              <Route element={<PrivateRoutes />}>
                <Route path="/dashboard" element={<Dashboard />}>
                  <Route index element={<DashboardIndex />} />

                  {/* ── Trainer ── */}
                  <Route element={<RequireTrainerProfile />}>
                    <Route
                      path="trainer/profile"
                      element={<TrainerProfile />}
                    />
                    <Route
                      path="trainer/batches"
                      element={<TrainerBatches />}
                    />
                    <Route
                      path="trainer/batches/:batchId"
                      element={<TrainerBatches />}
                    />
                    <Route
                      path="trainer/attendance"
                      element={<TrainerAttendance />}
                    />
                    <Route
                      path="notifications"
                      element={<NotificationCenter />}
                    />
                  </Route>

                  {/* ── Student ── */}
                  <Route path="student/profile" element={<StudentProfile />} />
                  <Route
                    path="student/projects"
                    element={<StudentProjects />}
                  />
                  <Route
                    path="student/materials"
                    element={<StudentMaterials />}
                  />
                  <Route
                    path="notifications"
                    element={<NotificationCenter />}
                  />

                  {/* ── Admin ── */}
                  <Route
                    path="admin/profile"
                    element={
                      <RequireAdmin>
                        <AdminProfile />
                      </RequireAdmin>
                    }
                  />
                  <Route
                    path="users"
                    element={
                      <RequireAdmin>
                        <UserControl />
                      </RequireAdmin>
                    }
                  />
                  <Route
                    path="students"
                    element={
                      <RequireAdminOrHR>
                        <StudentControl />
                      </RequireAdminOrHR>
                    }
                  />
                  <Route
                    path="trainers"
                    element={
                      <RequireAdmin>
                        <TrainerControl />
                      </RequireAdmin>
                    }
                  />
                  <Route
                    path="hr"
                    element={
                      <RequireAdminOrHR>
                        <HrControl />
                      </RequireAdminOrHR>
                    }
                  />
                  <Route
                    path="appointment-requests"
                    element={
                      <RequireAdmin>
                        <AppointmentRequests />
                      </RequireAdmin>
                    }
                  />
                  <Route
                    path="departments"
                    element={
                      <RequireAdmin>
                        <CourseSetup />
                      </RequireAdmin>
                    }
                  />
                  <Route
                    path="courses"
                    element={
                      <RequireAdmin>
                        <CoursesList />
                      </RequireAdmin>
                    }
                  />
                  <Route
                    path="courses/:courseId"
                    element={
                      <RequireAdmin>
                        <CourseDetail />
                      </RequireAdmin>
                    }
                  />
                  <Route
                    path="batches"
                    element={
                      <RequireAdmin>
                        <BatchesList />
                      </RequireAdmin>
                    }
                  />
                  <Route
                    path="health"
                    element={
                      <RequireAdmin>
                        <SystemHealth />
                      </RequireAdmin>
                    }
                  />
                  <Route
                    path="billing"
                    element={
                      <RequireAdmin>
                        <BillingLedger />
                      </RequireAdmin>
                    }
                  />
                  <Route
                    path="notifications"
                    element={<NotificationCenter />}
                  />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </Router>
      
    </AuthProvider>
  );
};
