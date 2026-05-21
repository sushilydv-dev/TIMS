import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
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
    <div className="navbar-wrapper ">
      <nav
        ref={navRef}
        className={`navbar backdrop-blur-3xl backdrop-brightness-50 scrolled ? "navbar--scrolled" : ""} ${mobileOpen ? "navbar--mobile-open" : ""}`}
      >
        <a href="/" className="navbar__logo" aria-label="Home">
          <span className="navbar__logo-icon">
            <img
              src={logo}
              alt="MSAI India Logo"
              className="h-10 w-10 object-contain"
            />
          </span>
          <span className="navbar__logo-text">TIMS</span>
        </a>

        <ul className="navbar__links">
          {NAV_LINKS.map(({ label, hasDropdown }) => (
            <li key={label} className="navbar__item">
              <button
                className={`navbar__link ${activeDropdown === label ? "navbar__link--active" : ""}`}
                onClick={() => hasDropdown && toggleDropdown(label)}
                aria-expanded={activeDropdown === label}
              >
                {label}
                {hasDropdown && (
                  <svg
                    className={`navbar__chevron ${activeDropdown === label ? "navbar__chevron--up" : ""}`}
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

              {/* Dropdown placeholder */}
              {hasDropdown && activeDropdown === label && (
                <div className="navbar__dropdown">
                  <p className="navbar__dropdown-placeholder">
                    {label} options coming soon…
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>

      
        <div className="navbar__actions flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard" className="text-white/90 hover:text-indigo-400 font-semibold transition-colors duration-200">
                Dashboard
              </Link>
              <div className="flex items-center gap-3 pl-2 border-l border-white/20">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                  {user.role?.replace("_", " ")}
                </span>
                <span className="text-gray-300 text-sm font-medium hidden lg:inline">
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm rounded-xl font-semibold text-white bg-red-600/85 hover:bg-red-700 focus:outline-none transition-all duration-300 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar__action-login">
                Login
              </Link>
              <Link to="/signup" className="navbar__action-cta">
                Get started
              </Link>
            </>
          )}
        </div>

      
        <button
          className={`navbar__hamburger ${mobileOpen ? "navbar__hamburger--open" : ""}`}
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* ── Mobile Drawer ── */}
      <div
        className={`navbar__mobile-drawer ${mobileOpen ? "navbar__mobile-drawer--open" : ""}`}
      >
        <ul className="navbar__mobile-links">
          {NAV_LINKS.map(({ label, hasDropdown }) => (
            <li key={label}>
              <button
                className="navbar__mobile-link"
                onClick={() => hasDropdown && toggleDropdown(label)}
              >
                {label}
                {hasDropdown && (
                  <svg
                    className={`navbar__chevron ${activeDropdown === label ? "navbar__chevron--up" : ""}`}
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
            </li>
          ))}
        </ul>
        <div className="navbar__mobile-actions flex flex-col gap-3">
          {user ? (
            <>
              <div className="flex flex-col items-center gap-2 pb-3 mb-2 border-b border-white/10 text-center">
                <span className="text-white font-semibold">{user.name}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                  {user.role?.replace("_", " ")}
                </span>
              </div>
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="text-center py-2 text-white font-semibold hover:text-indigo-400">
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
              <Link to="/login" onClick={() => setMobileOpen(false)} className="navbar__action-login">
                Login
              </Link>
              <Link to="/demo" onClick={() => setMobileOpen(false)} className="navbar__action-demo">
                Request demo
              </Link>
              <Link to="/signup" onClick={() => setMobileOpen(false)} className="navbar__action-cta">
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
