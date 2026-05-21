import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

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

  // Scroll handler for shadow effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown & drawer on outside click
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
    <div className="sticky top-0 z-[1000] flex justify-center p-3 md:p-[12px_16px] bg-transparent pointer-events-none font-sans antialiased">
      <nav
        ref={navRef}
        className={`pointer-events-auto flex items-center justify-between w-full max-w-[1200px] transition-all duration-300 ease-in-out
          ${scrolled 
            ? "md:w-[85%] bg-white/90 p-[6px_20px_6px_24px] shadow-[0_6px_30px_rgba(28,92,85,0.08),0_2px_6px_rgba(28,92,85,0.04)]" 
            : "md:w-[80%] bg-white/75 p-[8px_16px_8px_24px] shadow-[0_2px_12px_rgba(28,92,85,0.05),0_1px_2px_rgba(28,92,85,0.02)]"
          } 
          backdrop-blur-3xl backdrop-brightness-50 border border-white/95
          max-md:rounded-b-2xl max-md:p-[10px_20px] md:rounded-full`}
      >
        {/* ── Logo ── */}
        <a href="/" className="flex items-center gap-2 no-underline flex-shrink-0" aria-label="Home">
          <img
            src={logo}
            alt="MSAI India Logo"
            className="h-8 w-8 object-contain"
          />
          <span className="text-[1.05rem] font-bold text-[#0d463e] tracking-[-0.3px]">
            TIMS
          </span>
        </a>

        {/* ── Desktop Content Wrapper (Hidden on Mobile) ── */}
        <div className="hidden md:flex items-center justify-between flex-1 ml-10">
          <ul className="flex items-center gap-[4px] list-none m-0 p-0">
            {NAV_LINKS.map(({ label, hasDropdown }) => (
              <li key={label} className="relative">
                <button
                  className={`flex items-center gap-1 p-[6px_14px] bg-none border-none cursor-pointer text-[0.88rem] font-medium rounded-full whitespace-nowrap transition-all duration-200
                    ${activeDropdown === label 
                      ? "bg-[#2ed492]/10 text-[#10a37f]" 
                      : "text-[#4a5553] hover:bg-[#2ed492]/10 hover:text-[#10a37f]"
                    }`}
                  onClick={() => hasDropdown && toggleDropdown(label)}
                  aria-expanded={activeDropdown === label}
                >
                  {label}
                  {hasDropdown && (
                    <svg
                      className={`w-[14px] h-[14px] text-currentColor transition-transform duration-250 flex-shrink-0 ${
                        activeDropdown === label ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                {/* Dropdown Menu */}
                {hasDropdown && activeDropdown === label && (
                  <div className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 bg-white/96 backdrop-blur-md border border-[#d2f5eb]/50 rounded-2xl p-[16px_20px] min-w-[180px] shadow-[0_8px_32px_rgba(16,163,127,0.06)] z-10 animate-[dropIn_0.2s_ease]">
                    <p className="text-[0.82rem] text-[#8da19c] m-0 whitespace-nowrap">
                      {label} options coming soon…
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Link to="/login" className="text-[0.88rem] font-medium text-[#4a5553] no-underline p-[6px_16px] rounded-full transition-all duration-200 hover:text-[#10a37f] hover:bg-[#2ed492]/10 whitespace-nowrap">
              Login
            </Link>
            <Link to="/signup" className="text-[0.88rem] font-semibold text-white no-underline p-[8px_20px] rounded-full bg-gradient-to-br from-[#1bd2a4] to-[#0fa2cd] shadow-[0_2px_10px_rgba(27,210,164,0.25)] transition-all duration-200 hover:shadow-[0_4px_18px_rgba(27,210,164,0.4)] hover:-translate-y-[1px] whitespace-nowrap">
              Get started
            </Link>
          </div>
        </div>

        {/* ── Mobile Hamburger ── */}
        <button
          className="flex md:hidden flex-col gap-[5px] bg-none border-none cursor-pointer p-1.5 ml-auto rounded-lg transition-all duration-200 hover:bg-black/5"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <span className={`block w-[22px] h-[2px] bg-[#4a5553] rounded-[2px] transition-all duration-300 origin-center ${mobileOpen ? "translate-y-[7px] rotate-45" : ""}`} />
          <span className={`block w-[22px] h-[2px] bg-[#4a5553] rounded-[2px] transition-all duration-300 origin-center ${mobileOpen ? "opacity-0 scale-x-0" : ""}`} />
          <span className={`block w-[22px] h-[2px] bg-[#4a5553] rounded-[2px] transition-all duration-300 origin-center ${mobileOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
        </button>
      </nav>

      {/* ── Mobile Drawer (Fully Responsive & Functional) ── */}
      <div
        className={`md:hidden fixed top-0 left-0 right-0 max-h-screen overflow-y-auto p-[85px_20px_32px] bg-white/98 backdrop-blur-md border-b border-[#d2f5eb]/40 shadow-[0_12px_40px_rgba(16,163,127,0.08)] z-[999] transition-transform duration-350 cubic-bezier(0.4,0,0.2,1)
          ${mobileOpen ? "translate-y-0" : "-translate-y-[110%]"}`}
      >
        <ul className="list-none p-0 m-0 mb-6 flex flex-col gap-1">
          {NAV_LINKS.map(({ label, hasDropdown }) => (
            <li key={label} className="w-full">
              <button
                className={`flex items-center justify-between w-full p-[12px_16px] text-[1rem] font-medium rounded-xl cursor-pointer transition-all duration-200
                  ${activeDropdown === label ? "bg-[#2ed492]/8 text-[#10a37f]" : "text-[#4a5553] hover:bg-[#2ed492]/10 hover:text-[#10a37f]"}`}
                onClick={() => hasDropdown && toggleDropdown(label)}
              >
                <span>{label}</span>
                {hasDropdown && (
                  <svg
                    className={`w-[14px] h-[14px] text-currentColor transition-transform duration-250 flex-shrink-0 ${
                      activeDropdown === label ? "rotate-180 text-[#10a37f]" : ""
                    }`}
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              {/* Mobile Submenu Dropdown */}
              {hasDropdown && activeDropdown === label && (
                <div className="bg-[#2ed492]/4 border border-[#d2f5eb]/30 rounded-xl mt-1 mx-3 p-3 transition-all duration-200">
                  <p className="text-[0.85rem] text-[#8da19c] m-0">
                    {label} options coming soon…
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* Mobile Action Buttons */}
        <div className="flex flex-col gap-3 pt-5 border-t border-black/5">
          <Link 
            to="/login" 
            onClick={() => setMobileOpen(false)}
            className="text-center p-3 text-[0.95rem] font-medium text-[#4a5553] no-underline rounded-full transition-all duration-200 hover:text-[#10a37f] hover:bg-[#2ed492]/10"
          >
            Login
          </Link>
          <Link 
            to="/demo" 
            onClick={() => setMobileOpen(false)}
            className="text-center p-3 text-[0.95rem] font-medium text-[#10a37f] no-underline rounded-full border-1.5 border-[#10a37f]/35 transition-all duration-200 hover:bg-[#10a37f]/5 hover:border-[#10a37f]"
          >
            Request demo
          </Link>
          <Link 
            to="/signup" 
            onClick={() => setMobileOpen(false)}
            className="text-center p-3 text-[0.95rem] font-semibold text-white no-underline rounded-full bg-gradient-to-br from-[#1bd2a4] to-[#0fa2cd] shadow-[0_4px_12px_rgba(27,210,164,0.2)]"
          >
            Get started
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;