import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
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

  // Add shadow / shrink effect on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
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

        {/* ── Desktop CTA Buttons ── */}
        <div className="navbar__actions">
          <Link to="/login" className="navbar__action-login">
            Login
          </Link>

          <Link to="/signup" className="navbar__action-cta">
            Get started
          </Link>
        </div>

        {/* ── Mobile Hamburger ── */}
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
        <div className="navbar__mobile-actions">
          <Link to="/login" className="navbar__action-login">
            Login
          </Link>
          <Link to="/demo" className="navbar__action-demo">
            Request demo
          </Link>
          <Link to="/signup" className="navbar__action-cta">
            Get started
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
