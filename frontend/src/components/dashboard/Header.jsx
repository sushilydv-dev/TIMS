import React, { useState, useEffect } from "react";
import {
  FiBell,
  FiUser,
  FiLogOut,
} from "react-icons/fi";
import { useAuth } from "../../app/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

export const Header = ({ activeRole, onRoleChange }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const rolesList = [
    { key: "ADMIN", label: "Admin" },
    { key: "HR_COORDINATOR", label: "HR Coordinator" },
    { key: "HR", label: "HR" },
    { key: "TRAINER", label: "Trainer Desk" },
    { key: "STUDENT", label: "Student Panel" },
  ];

  const currentRoleLabel =
    rolesList.find((r) => r.key === activeRole)?.label || activeRole;

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
          const { data } = await axios.get("/api/students/me/profile");
          imageUrl = data.profile_img;
        }
        
        setProfileImage(imageUrl);
      } catch (err) {
        console.error("Failed to fetch profile image:", err);
      }
    };

    fetchProfileImage();
  }, [user]);

  // Fetch unread notifications count
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    
    const fetchUnreadCount = async () => {
      try {
        const { data } = await axios.get("/api/notifications/unread-count");
        setUnreadCount(data.count);
      } catch (err) {
        console.error("Failed to fetch unread count:", err);
      }
    };

    fetchUnreadCount();
  }, [user, location.pathname]);

  useEffect(() => {
    if (!user) return;

    console.log("Header connecting to Socket.IO for notifications...");
    const socket = io({
      path: "/socket.io",
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("Header connected to Socket.IO");
      socket.emit("join", user.id);
    });

    socket.on("new_notification", () => {
      console.log("Header received new notification, incrementing unread count...");
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const getProfileRoute = () => {
    if (user?.role === "TRAINER") return "/dashboard/trainer/profile";
    if (user?.role === "STUDENT") return "/dashboard/student/profile";
    if (user?.role === "ADMIN") return "/dashboard/users";
    return "/dashboard";
  };

  return (
    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full">
      <div className="hidden md:block">
        <nav className="text-xs font-semibold text-[#94a3b8] flex items-center gap-1.5">
          <span>Pages</span>
          <span>/</span>
          <span className="text-[#0c0407] font-bold">{currentRoleLabel}</span>
        </nav>
        <h1 className="text-2xl sm:text-[28px] font-bold text-[#0c0407] tracking-tight mt-0.5">
          {activeRole === "ADMIN" ? "Overview" : currentRoleLabel}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => navigate("/dashboard/notifications")}
          className="hidden lg:flex relative w-10 h-10 rounded-xl items-center justify-center text-[#94a3b8] hover:bg-[#f8fafc] hover:text-[#0c0407] transition-all cursor-pointer shrink-0"
        >
          <FiBell className="w-[18px] h-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#fc362d] px-1 text-[8px] font-extrabold text-white ring-2 ring-white">
              {unreadCount}
            </span>
          )}
        </button>

        <div className="relative shrink-0 hidden lg:block">
          <button
            type="button"
            onClick={handleProfileClick}
            className="w-10 h-10 rounded-xl overflow-hidden border border-black/[0.08] shrink-0 cursor-pointer hover:border-[#fc362d]/30 transition-all"
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#f1f5f9] flex items-center justify-center">
                <span className="text-xs font-bold text-[#475569]">
                  {(user?.name || "U").slice(0, 2).toUpperCase()}
                </span>
              </div>
            )}
          </button>

          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowProfileMenu(false)}
                aria-hidden
              />
              <div className="absolute right-0 mt-2 w-56 bg-white border border-black/[0.08] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.1)] p-3 z-40">
                {/* Enlarged profile picture section */}
                <div className="flex flex-col items-center pb-3 border-b border-black/[0.06] mb-2">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-black/[0.08] mb-2">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#f1f5f9] flex items-center justify-center">
                        <span className="text-lg font-bold text-[#475569]">
                          {(user?.name || "U").slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-bold text-[#0c0407]">{user?.name || "User"}</p>
                  <p className="text-xs text-[#94a3b8]">{user?.email || ""}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigate(getProfileRoute());
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-[#475569] hover:bg-[#f8fafc] transition-all cursor-pointer text-left"
                >
                  <FiUser className="w-4 h-4" />
                  Profile
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-[#b91c1c] hover:bg-[#fef2f2] transition-all cursor-pointer text-left"
                >
                  <FiLogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
