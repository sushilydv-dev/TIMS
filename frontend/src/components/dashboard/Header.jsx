import React, { useState } from "react";
import {
  FiSearch,
  FiBell,
  FiSettings,
  FiChevronDown,
  FiLayers,
} from "react-icons/fi";
import { useAuth } from "../../app/AuthContext";
import { accentGradientClass, accentGradientHoverClass } from "./dashboardTheme";

export const Header = ({ activeRole, onRoleChange }) => {
  const { user } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const rolesList = [
    { key: "ADMIN", label: "Admin" },
    { key: "HR_COORDINATOR", label: "HR Coordinator" },
    { key: "HR", label: "HR" },
    { key: "TRAINER", label: "Trainer Desk" },
    { key: "STUDENT", label: "Student Panel" },
  ];

  const currentRoleLabel =
    rolesList.find((r) => r.key === activeRole)?.label || activeRole;

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

      <div className="flex flex-1 lg:flex-none items-center gap-2 sm:gap-3 bg-white border border-black/[0.08] p-2 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] max-w-full">
        <div className="relative flex flex-1 items-center bg-[#fafafa] rounded-xl border border-black/[0.06] px-3 py-2.5 min-w-0 focus-within:border-[#cbd5e1] focus-within:ring-2 focus-within:ring-[#e2e8f0] transition-all">
          <FiSearch className="text-[#94a3b8] mr-2 w-4 h-4 shrink-0" />
          <input
            type="text"
            placeholder="Type in to search..."
            className="bg-transparent text-[#0c0407] placeholder-[#94a3b8] text-sm font-medium w-full focus:outline-none min-w-0"
          />
        </div>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#475569] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-black/[0.08] rounded-xl transition-all cursor-pointer"
          >
            <FiLayers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{currentRoleLabel}</span>
            <FiChevronDown
              className={`w-3.5 h-3.5 transition-transform ${showRoleMenu ? "rotate-180" : ""}`}
            />
          </button>

          {showRoleMenu && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowRoleMenu(false)}
                aria-hidden
              />
              <div className="absolute right-0 mt-2 w-52 bg-white border border-black/[0.08] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.1)] p-2 z-40">
                <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider px-3 py-2">
                  Switch view
                </p>
                {rolesList.map((role) => (
                  <button
                    key={role.key}
                    type="button"
                    onClick={() => {
                      onRoleChange(role.key);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeRole === role.key
                        ? `text-white ${accentGradientClass} ${accentGradientHoverClass}`
                        : "text-[#475569] hover:bg-[#f8fafc]"
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          className="relative w-10 h-10 rounded-xl flex items-center justify-center text-[#94a3b8] hover:bg-[#f8fafc] hover:text-[#0c0407] transition-all cursor-pointer shrink-0"
        >
          <FiBell className="w-[18px] h-[18px]" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#fc362d] ring-2 ring-white" />
        </button>

        <button
          type="button"
          className="w-10 h-10 rounded-xl hidden sm:flex items-center justify-center text-[#94a3b8] hover:bg-[#f8fafc] hover:text-[#0c0407] transition-all cursor-pointer shrink-0"
        >
          <FiSettings className="w-[18px] h-[18px]" />
        </button>

        <img
          src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "Demo"}&backgroundColor=f1f5f9`}
          alt=""
          className="w-10 h-10 rounded-xl border border-black/[0.08] shrink-0"
        />
      </div>
    </header>
  );
};

export default Header;
