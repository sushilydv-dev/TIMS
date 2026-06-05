import React from "react";
import { useAuth } from "../app/AuthContext";
import { AdminDashboard } from "../components/dashboard/admin/AdminDashboard";
import { HrDashboard } from "../components/dashboard/hr/HrDashboard";
import { StudentDashboard } from "../components/dashboard/student/StudentDashboard";
import { TrainerDashboard } from "../components/dashboard/trainer/TrainerDashboard";

const DashboardIndex = () => {
  const { user } = useAuth();
  const role = user?.role;

  switch (role) {
    case "ADMIN":
      return <AdminDashboard user={user} />;
    case "TRAINER":
      return <TrainerDashboard user={user} />;
    case "HR_COORDINATOR":
    case "HR":
      return <HrDashboard user={user} />;
    case "STUDENT":
      return <StudentDashboard user={user} />;
    default:
      return (
        <div className="text-center p-8 rounded-2xl bg-white border border-black/[0.08] max-w-md mx-auto shadow-[0_4px_24px_rgba(0,0,0,0.06)] mt-12">
          <h2 className="text-2xl font-bold text-[#fc362d] mb-2">Access Denied</h2>
          <p className="text-[#636363] text-sm">
            Unauthorized role or missing credentials.
          </p>
        </div>
      );
  }
};

export default DashboardIndex;
