import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/dashboard/Sidebar";
import { Header } from "../components/dashboard/Header";
import { Footer } from "../components/dashboard/Footer";
import { useAuth } from "../app/AuthContext";
import { FiMenu, FiX } from "react-icons/fi";
import logo from "../assets/logo.png";

const Dashboard = () => {
  const { user } = useAuth();
  const [activeRole, setActiveRole] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (user?.role) {
      setActiveRole(user.role);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-[#fafafa] flex relative overflow-x-hidden font-sans text-[#0c0407]">
      <aside className="hidden xl:block w-72 h-screen fixed left-0 top-0 z-30">
        <Sidebar activeRole={activeRole} />
      </aside>

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-[#0c0407]/20 backdrop-blur-sm z-40 xl:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`fixed top-0 left-0 w-72 h-screen bg-white z-50 shadow-2xl xl:hidden transition-transform duration-300 border-r border-black/[0.08] ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute top-4 right-4 z-50">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="w-8 h-8 rounded-xl bg-[#fafafa] text-[#0c0407] flex items-center justify-center cursor-pointer border border-black/[0.08]"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
        <Sidebar activeRole={activeRole} />
      </aside>

      <main className="flex-1 xl:ml-72 flex flex-col min-h-screen p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto w-full">
        <div className="xl:hidden flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-black/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.05)] mb-4">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="TIMS" className="h-8 w-8 object-contain" />
            <span className="font-bold text-sm text-[#0c0407]">TIMS</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="w-10 h-10 rounded-xl bg-[#fafafa] border border-black/[0.08] text-[#0c0407] flex items-center justify-center cursor-pointer hover:bg-[#f1f5f9] transition-all"
          >
            <FiMenu className="w-5 h-5" />
          </button>
        </div>

        <Header
          activeRole={activeRole}
          onRoleChange={(role) => setActiveRole(role)}
        />

        <div className="mt-6 flex-1 flex flex-col">
          <Outlet />
        </div>

        <Footer />
      </main>
    </div>
  );
};

export default Dashboard;
