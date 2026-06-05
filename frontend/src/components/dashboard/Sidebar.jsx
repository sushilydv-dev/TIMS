import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiBookOpen,
  FiUsers,
  FiLayers,
  FiDollarSign,
  FiActivity,
  FiLogOut,
  FiAward,
  FiCalendar,
} from "react-icons/fi";
import { useAuth } from "../../app/AuthContext";
import logo from "../../assets/logo.png";
import { navActiveClass, navInactiveClass } from "./dashboardTheme";

export const Sidebar = ({ activeRole }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getNavLinks = () => {
    const baseLinks = [
      {
        label: "Dashboard",
        icon: <FiHome className="w-5 h-5" />,
        path: "/dashboard",
        end: true,
      },
    ];

    switch (activeRole) {
      case "ADMIN":
        return [
          ...baseLinks,
          { label: "User Control", icon: <FiUsers className="w-5 h-5" />, path: "/dashboard/users" },
          { label: "Manage Departments", icon: <FiLayers className="w-5 h-5" />, path: "/dashboard/departments" },
          { label: "Courses", icon: <FiBookOpen className="w-5 h-5" />, path: "/dashboard/courses" },
          { label: "Batches", icon: <FiCalendar className="w-5 h-5" />, path: "/dashboard/batches" },
         
          { label: "Fee Status", icon: <FiActivity className="w-5 h-5" />, path: "/dashboard/health" },
          { label: "Billing Ledger", icon: <FiDollarSign className="w-5 h-5" />, path: "/dashboard/billing" },
        ];
      case "HR_COORDINATOR":
      case "HR":
        return [
          ...baseLinks,
          { label: "Onboard Student", icon: <FiUsers className="w-5 h-5" />, path: "#" },
          { label: "Batches Grid", icon: <FiLayers className="w-5 h-5" />, path: "#" },
          { label: "Recruiters Stream", icon: <FiActivity className="w-5 h-5" />, path: "#" },
        ];
      case "TRAINER":
        return [
          ...baseLinks,
          { label: "Active Cohorts", icon: <FiLayers className="w-5 h-5" />, path: "#" },
          { label: "Curriculum Edit", icon: <FiBookOpen className="w-5 h-5" />, path: "#" },
          { label: "Submissions Grade", icon: <FiAward className="w-5 h-5" />, path: "#" },
        ];
      case "STUDENT":
        return [
          ...baseLinks,
          { label: "Syllabus Track", icon: <FiBookOpen className="w-5 h-5" />, path: "#" },
          { label: "Projects Panel", icon: <FiAward className="w-5 h-5" />, path: "#" },
          { label: "Receipts Locker", icon: <FiDollarSign className="w-5 h-5" />, path: "#" },
        ];
      default:
        return baseLinks;
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="w-72 bg-white min-h-screen h-full border-r border-black/[0.08] flex flex-col justify-between py-6 px-5">
      <div>
        <Link to="/" className="flex items-center gap-3 px-2 py-2 mb-8">
          <img src={logo} alt="TIMS" className="h-9 w-9 object-contain" />
          <span className="text-xl font-bold text-[#0c0407] tracking-tight">
            TIMS
          </span>
        </Link>

        <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider px-2 mb-3">
          Main menu
        </p>

        <nav className="space-y-0.5">
          {navLinks.map((link, idx) =>
            link.path.startsWith("/") ? (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-3 pr-4 font-semibold transition-all text-sm ${
                    isActive ? navActiveClass : navInactiveClass
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={isActive ? "text-[#475569]" : "text-[#94a3b8]"}>
                      {link.icon}
                    </span>
                    <span>{link.label}</span>
                  </>
                )}
              </NavLink>
            ) : (
              <span
                key={idx}
                className={`flex items-center gap-3 py-3 pr-4 font-semibold text-sm ${navInactiveClass} opacity-60 cursor-not-allowed`}
              >
                <span className="text-[#94a3b8]">{link.icon}</span>
                <span>{link.label}</span>
              </span>
            )
          )}
        </nav>
      </div>

      <div className="space-y-5">
        <div className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-2 text-[#64748b] mb-2">
            <FiCalendar className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Schedule
            </span>
          </div>
          <h4 className="text-sm font-bold text-[#0c0407]">Daily training blocks</h4>
          <p className="text-[11px] text-[#636363] mt-1 leading-relaxed">
            View cohorts and upcoming sessions.
          </p>
          <button
            type="button"
            className="mt-3 w-full py-2 text-[11px] font-bold rounded-lg text-[#475569] border border-black/10 bg-[#fafafa] hover:bg-[#f1f5f9] hover:text-[#0c0407] transition-colors cursor-pointer"
          >
            View schedule
          </button>
        </div>

        <div className="flex items-center gap-3 bg-[#fafafa] rounded-2xl p-3 border border-black/[0.08]">
          <img
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "Demo"}&backgroundColor=fafafa`}
            alt=""
            className="w-10 h-10 rounded-xl object-cover"
          />
          <div className="flex-1 min-w-0">
            <h5 className="text-xs font-bold text-[#0c0407] truncate">
              {user?.name || "User"}
            </h5>
            <p className="text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider mt-0.5 truncate">
              {activeRole?.replace("_", " ")}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Sign out"
            className="w-9 h-9 rounded-xl bg-white border border-black/[0.08] flex items-center justify-center text-[#94a3b8] hover:text-[#0c0407] transition-all cursor-pointer"
          >
            <FiLogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

