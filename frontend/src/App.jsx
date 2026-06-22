import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Homepage } from "./pages/Homepage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { AuthPresenceWrapper } from "./components/auth/AuthPresenceWrapper";
import Dashboard from "./pages/Dashboard";
import DashboardIndex from "./pages/DashboardIndex";
import { RequireAdmin } from "./components/dashboard/admin/RequireAdmin";
import { UserControl } from "./components/dashboard/admin/UserControl";
import { CourseSetup } from "./components/dashboard/admin/CourseSetup";
import { CoursesList } from "./components/dashboard/admin/CoursesList";
import { BatchesList } from "./components/dashboard/admin/BatchesList";
import CourseDetail from "./pages/admin/CourseDetail";
import { SystemHealth } from "./components/dashboard/admin/SystemHealth";
import { BillingLedger } from "./components/dashboard/admin/BillingLedger";
import { RequireAdminOrHR } from "./components/dashboard/admin/RequireAdminOrHR";
import { StudentControl } from "./components/dashboard/admin/StudentControl";
import { TrainerControl } from "./components/dashboard/admin/TrainerControl";
import { HrControl } from "./components/dashboard/admin/HrControl";
import ActivateAccount from "./pages/ActivateAccount";
import { AuthProvider } from "./app/AuthContext";
import { PrivateRoutes } from "./Routes/PrivateRoutes";
import { PublicRoutes } from "./Routes/PublicRoutes";
import CoursePage from "./pages/CoursePage";
import AboutPage from "./pages/AboutPage";
import AllCoursesPage from "./pages/AllCoursesPage";
import { TrainerBatches } from "./components/dashboard/trainer/TrainerBatches";
import { TrainerAttendance } from "./components/dashboard/trainer/TrainerAttendance";
import StudentProjects from "./components/dashboard/student/StudentProjects";
import StudentMaterials from "./components/dashboard/student/StudentMaterials";
import StudentProfile from "./components/dashboard/student/StudentProfile";

export const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/activate-account" element={<ActivateAccount />} />

          <Route element={<PublicRoutes />}>
            <Route path="/" element={<Homepage />} />
            <Route path="/about-us" element={<AboutPage />} />
            <Route path="/all-courses" element={<AllCoursesPage />} />
            <Route path="/course/:courseId" element={<CoursePage />} />
            <Route element={<AuthPresenceWrapper />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Route>
          </Route>

     
          <Route element={<PrivateRoutes />}>
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<DashboardIndex />} />

              {/* ── Trainer routes ── */}
              <Route path="trainer/batches" element={<TrainerBatches />} />
              <Route path="trainer/batches/:batchId" element={<TrainerBatches />} />
              <Route path="trainer/attendance" element={<TrainerAttendance />} />

              {/* ── Student routes ── */}
              <Route path="student/profile"   element={<StudentProfile />} />
              <Route path="student/projects"  element={<StudentProjects />} />
              <Route path="student/materials" element={<StudentMaterials />} />
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
                  <RequireAdmin>
                    <HrControl />
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
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

