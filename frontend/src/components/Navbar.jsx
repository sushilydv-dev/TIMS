import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { useAuth } from "../app/AuthContext";

const NAV_LINKS = [
  { label: "Home", hasDropdown: false },
  { label: "About us", hasDropdown: false },
  { label: "Courses", hasDropdown: true },
  { label: "Resources", hasDropdown: true },
  { label: "Pricing", hasDropdown: false },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const navRef = useRef(null);
  const { user, logout } = useAuth();

  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  
  useEffect(() => {
    const handleClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveDropdown(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggleDropdown = (label) =>
    setActiveDropdown((prev) => (prev === label ? null : label));

  return (
    <div className="sticky top-0 z-[1000] flex justify-center p-0 md:p-3 bg-transparent pointer-events-none font-['Inter',_system-ui,_sans-serif]">
      <nav
        ref={navRef}
        className={`pointer-events-auto flex items-center gap-2 w-full max-w-[1200px] transition-all duration-300
          ${
            scrolled
              ? "bg-white/90 shadow-[0_6px_30px_rgba(28,92,85,0.08),_0_2px_6px_rgba(28,92,85,0.04)] py-2 px-6"
              : "bg-white/75 shadow-[0_2px_12px_rgba(28,92,85,0.05),_0_1px_2px_rgba(28,92,85,0.02)] py-2.5 px-6"
          } 
          backdrop-blur-[18px] backdrop-saturate-[180%] border border-white/95
          max-md:w-full max-md:rounded-b-3xl max-md:px-5 md:rounded-full
        `}
      >
        
        <a
          href="/"
          className="flex items-center gap-2 no-underline"
          aria-label="Home"
        >
          
          <div className="flex items-center justify-center">
            <img
              src={logo}
              alt="MSAI India Logo"
              className="h-[50px] w-[70px] "
            />
            <span className="text-[1.05rem] font-bold text-[#0d463e] ">
              TIMS
            </span>
          </div>
        </a>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-[2px] list-none m-0 mx-auto p-0">
          {NAV_LINKS.map(({ label, hasDropdown }) => (
            <li key={label} className="relative">
              <button
                className={`flex items-center gap-1 padding px-3 py-1.5 bg-none border-none cursor-pointer text-[0.88rem] font-medium rounded-full whitespace-nowrap transition-all duration-200
                  ${
                    activeDropdown === label
                      ? "bg-[#cd1a09]/10 text-[#cd1a09]"
                      : "text-[#4a5553] hover:bg-[#ec3d2d]/10 hover:text-[#cd1a09]"
                  }
                `}
                onClick={() => hasDropdown && toggleDropdown(label)}
                aria-expanded={activeDropdown === label}
              >
                {label}
                {hasDropdown && (
                  <svg
                    className={`w-3.5 h-3.5 text-current shrink-0 transition-transform duration-250 ${activeDropdown === label ? "rotate-180" : ""}`}
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 6l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>

              {/* Desktop Dropdown Menu */}
              {hasDropdown && activeDropdown === label && (
                <div className="absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 bg-white/96 backdrop-blur-[20px] border border-[#d2f5eb]/50 rounded-2xl p-4 min-width min-w-[180px] shadow-[0_8px_32px_rgba(16,163,127,0.06)] z-10 animate-[dropIn_0.2s_ease]">
                  <p className="text-[0.82rem] text-[#8da19c] m-0 whitespace-nowrap">
                    {label} options coming soon…
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="text-[#4a5553] hover:text-[#cd1a09] text-[0.88rem] font-semibold transition-colors duration-200"
              >
                Dashboard
              </Link>
              <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 uppercase tracking-wider">
                  {user.role?.replace("_", " ")}
                </span>
                <span className="text-gray-600 text-sm font-medium hidden lg:inline">
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm rounded-xl font-semibold text-white bg-red-600/90 hover:bg-red-700 transition-all duration-300 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-[0.88rem] font-medium text-[#4a5553] no-underline px-3 py-1.5 rounded-full hover:text-[#cd1a09] hover:bg-[#ec3d2d]/10 transition-all duration-200 whitespace-nowrap"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-[0.88rem] font-semibold text-white no-underline px-4 py-[7px] rounded-full bg-gradient-to-r from-rose-500 to-[#fc362d] shadow-[0_2px_10px_rgba(27,210,164,0.25)] hover:shadow-[0_4px_18px_rgba(27,210,164,0.4)] hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="md:hidden flex flex-col gap-[5px] bg-none border-none cursor-pointer p-1.5 ml-auto rounded-lg hover:bg-black/5 transition-colors duration-200"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <span
            className={`block w-[22px] h-0.5 bg-[#4a5553] rounded-sm transition-all duration-300 origin-center ${mobileOpen ? "translate-y-[7px] rotate-45" : ""}`}
          />
          <span
            className={`block w-[22px] h-0.5 bg-[#4a5553] rounded-sm transition-all duration-300 origin-center ${mobileOpen ? "opacity-0 scale-x-0" : ""}`}
          />
          <span
            className={`block w-[22px] h-0.5 bg-[#4a5553] rounded-sm transition-all duration-300 origin-center ${mobileOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
          />
        </button>
      </nav>
      <div
        className={`md:hidden fixed top-0 left-0 right-0 p-5 pt-20 pb-6 bg-white/98 backdrop-blur-[20px] border-b border-[#d2f5eb]/40 shadow-[0_8px_32px_rgba(16,163,127,0.04)] z-[999] transition-transform duration-[350ms] cubic-bezier(0.4,0,0.2,1)
          ${mobileOpen ? "translate-y-0" : "-translate-y-[110%]"}
        `}
      >
        <ul className="list-none p-0 m-0 mb-6 flex flex-col gap-1">
          {NAV_LINKS.map(({ label, hasDropdown }) => (
            <li key={label}>
              <button
                className="flex items-center justify-between w-full p-3 text-[1rem] font-medium text-[#4a5553] bg-none border-none rounded-xl cursor-pointer hover:bg-[#2ed492]/08 hover:text-[#cd1a09] transition-all duration-200"
                onClick={() => hasDropdown && toggleDropdown(label)}
              >
                {label}
                {hasDropdown && (
                  <svg
                    className={`w-3.5 h-3.5 text-current shrink-0 transition-transform duration-250 ${activeDropdown === label ? "rotate-180" : ""}`}
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M4 6l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-3 pt-4 border-t border-black/5">
          {user ? (
            <>
              <div className="flex flex-col items-center gap-1.5 pb-3 mb-1 border-b border-black/5 text-center">
                <span className="text-[#4a5553] font-semibold">
                  {user.name}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 uppercase">
                  {user.role?.replace("_", " ")}
                </span>
              </div>
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="text-center py-2.5 text-[#4a5553] font-semibold hover:text-[#cd1a09]"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
                className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 transition-all cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="text-center py-3 text-[0.95rem] font-medium text-[#4a5553] rounded-full hover:text-[#cd1a09] hover:bg-[#ec3d2d]/10 transition-all duration-200"
              >
                Login
              </Link>
              <Link
                to="/demo"
                onClick={() => setMobileOpen(false)}
                className="text-center py-3 text-[0.95rem] font-medium text-[#cd1a09] rounded-full border-1.5 border-[#cd1a09]/35 hover:bg-[#cd1a09]/5 hover:border-[#cd1a09] transition-all duration-200"
              >
                Request demo
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileOpen(false)}
                className="text-center py-3 text-[0.95rem] font-semibold text-white rounded-full bg-gradient-to-r from-rose-500 to-[#fc362d] shadow-[0_2px_10px_rgba(27,210,164,0.25)] transition-all duration-200"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
