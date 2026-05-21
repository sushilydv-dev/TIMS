import React from "react";
import { AdminDashboard } from "../components/dashboard/AdminDashboard";
import { HrDashboard } from "../components/dashboard/HrDashboard";
import { StudentDashboard } from "../components/dashboard/StudentDashboard";
import { TrainerDashboard } from "../components/dashboard/TrainerDashboard";
import { useAuth } from "../app/AuthContext";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  const { user } = useAuth();

  const renderRoleDashboard = () => {
    switch (user?.role) {
      case "SUPER_ADMIN":
        return <AdminDashboard user={user} />;
      case "TRAINER":
        return <TrainerDashboard user={user} />;
      case "HR_COORDINATOR":
        return <HrDashboard user={user} />;
      case "STUDENT":
        return <StudentDashboard user={user} />;
      default:
        return (
          <div className="text-center p-8 rounded-3xl backdrop-blur-2xl bg-white/5 border border-white/10 max-w-md mx-auto shadow-2xl mt-12">
            <h2 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h2>
            <p className="text-gray-300">Unauthorized role or missing credentials. Access denied.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white overflow-x-hidden">
      {/* Dynamic Navbar */}
      <div className="fixed top-0 left-0 w-full z-20">
        <Navbar />
      </div>

      {/* Main Core Dashboard Content Shell */}
      <div className="pt-28 px-4 sm:pt-32 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
        {renderRoleDashboard()}
      </div>
    </div>
  );
};

export default Dashboard;
