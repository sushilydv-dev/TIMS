import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "../components/dashboard/Sidebar";
import { Header } from "../components/dashboard/Header";
import { Footer } from "../components/dashboard/Footer";
import { useAuth } from "../app/AuthContext";
import { FiMenu, FiX, FiBell, FiLogOut } from "react-icons/fi";
import logo from "../assets/logo.png";
import axios from "axios";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    if (user?.role) {
      setActiveRole(user.role);
    }
  }, [user]);

  // Fetch profile image based on user role
  useEffect(() => {
    const fetchProfileImage = async () => {
      if (!user) return;
      
      try {
        let imageUrl = null;
        
        if (user.role === "TRAINER") {
          const { data } = await axios.get("/api/trainer/profile");
          imageUrl = data.profile_img;
        } else if (user.role === "STUDENT") {
          const { data } = await axios.get("/api/student/profile");
          imageUrl = data.profile_img;
        } else if (user.role === "ADMIN") {
          const { data } = await axios.get("/api/auth/profile");
          imageUrl = data.profile_img;
        }
        
        setProfileImage(imageUrl);
      } catch (err) {
        console.error("Failed to fetch profile image:", err);
      }
    };

    fetchProfileImage();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getProfileRoute = () => {
    if (user?.role === "TRAINER") return "/dashboard/trainer/profile";
    if (user?.role === "STUDENT") return "/dashboard/student/profile";
    if (user?.role === "ADMIN") return "/dashboard/admin/profile";
    return "/dashboard";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] flex relative overflow-x-hidden font-sans text-[#0c0407]">
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
        className={`fixed top-0 left-0 w-72 h-screen bg-white z-50 shadow-2xl xl:hidden transition-transform duration-300 border-r border-black/[0.08] flex flex-col ${
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
        <div className="flex-1 overflow-y-auto">
          <Sidebar activeRole={activeRole} />
        </div>
        
        {/* Logout section at bottom */}
        <div className="p-4 border-t border-black/[0.08]">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#b91c1c] hover:bg-[#fef2f2] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border border-black/[0.08]"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#f1f5f9] flex items-center justify-center border border-black/[0.08]">
                  <span className="text-xs font-bold text-[#475569]">
                    {(user?.name || "U").slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
              <span>Logout</span>
            </div>
            <FiLogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      <main className="flex-1 xl:ml-72 flex flex-col min-h-screen p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto w-full">
        <div className="xl:hidden flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-black/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.05)] mb-4">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="TIMS" className="h-8 w-8 object-contain" />
            <span className="font-bold text-sm text-[#0c0407]">TIMS</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="relative w-10 h-10 rounded-xl flex items-center justify-center text-[#94a3b8] hover:bg-[#f8fafc] hover:text-[#0c0407] transition-all cursor-pointer shrink-0"
            >
              <FiBell className="w-[18px] h-[18px]" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#fc362d] ring-2 ring-white" />
            </button>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="w-10 h-10 rounded-xl bg-[#fafafa] border border-black/[0.08] text-[#0c0407] flex items-center justify-center cursor-pointer hover:bg-[#f1f5f9] transition-all"
            >
              <FiMenu className="w-5 h-5" />
            </button>
          </div>
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
