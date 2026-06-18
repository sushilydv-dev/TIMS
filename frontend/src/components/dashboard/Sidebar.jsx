import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
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
  FiChevronDown,
} from "react-icons/fi";
import { useAuth } from "../../app/AuthContext";
import logo from "../../assets/logo.png";
import { navActiveClass, navInactiveClass } from "./dashboardTheme";

export const Sidebar = ({ activeRole }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userControlOpen, setUserControlOpen] = useState(false);

  useEffect(() => {
    const paths = ["/dashboard/students", "/dashboard/trainers", "/dashboard/hr"];
    if (paths.includes(location.pathname)) {
      setUserControlOpen(true);
    }
  }, [location.pathname]);

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
          {
            label: "User Control",
            icon: <FiUsers className="w-5 h-5" />,
            path: "#user-control",
            isDropdown: true,
            subLinks: [
              { label: "Student Control", path: "/dashboard/students" },
              { label: "Trainer Control", path: "/dashboard/trainers" },
              { label: "HR Control", path: "/dashboard/hr" },
            ],
          },
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
          { label: "Student Control", icon: <FiUsers className="w-5 h-5" />, path: "/dashboard/students" },
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
          { label: "Syllabus Track", icon: <FiBookOpen className="w-5 h-5" />, path: "/dashboard?tab=syllabus" },
          { label: "Projects Panel", icon: <FiAward className="w-5 h-5" />, path: "/dashboard?tab=projects" },
          { label: "Receipts Locker", icon: <FiDollarSign className="w-5 h-5" />, path: "/dashboard?tab=fees" },
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
          {navLinks.map((link, idx) => {
            if (link.isDropdown) {
              return (
                <div key={idx} className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => setUserControlOpen(!userControlOpen)}
                    className={`flex items-center justify-between w-full py-3 pr-4 font-semibold transition-all text-sm cursor-pointer ${
                      userControlOpen ? "text-[#0c0407]" : "text-[#64748b] hover:text-[#0c0407]"
                    } border-l-[3px] border-transparent pl-[13px] hover:bg-black/[0.02]`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={userControlOpen ? "text-[#475569]" : "text-[#94a3b8]"}>
                        {link.icon}
                      </span>
                      <span>{link.label}</span>
                    </div>
                    <FiChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        userControlOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`pl-10 space-y-0.5 overflow-hidden transition-all duration-300 ${
                      userControlOpen ? "max-h-40 opacity-100 mt-1 mb-2" : "max-h-0 opacity-0"
                    }`}
                  >
                    {link.subLinks.map((subLink) => (
                      <NavLink
                        key={subLink.path}
                        to={subLink.path}
                        className={({ isActive }) =>
                          `flex items-center gap-3 py-2 pr-4 font-semibold transition-all text-xs ${
                            isActive
                              ? "text-[#0c0407] font-bold border-l-[3px] border-[#fc362d] pl-[10px]"
                              : "text-[#64748b] hover:text-[#0c0407] hover:bg-black/[0.02] border-l-[3px] border-transparent pl-[10px]"
                          }`
                        }
                      >
                        {subLink.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              );
            }

            return link.path.startsWith("/") ? (
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
            );
          })}
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

