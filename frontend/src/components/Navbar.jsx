import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo.png";
import { useAuth } from "../app/AuthContext";
import { INSTITUTE_NAME } from "../constants";

const NAV_LINKS = [
  { label: "Home",       hasDropdown: false, to: "/" },
  { label: "About us",   hasDropdown: false, to: "/about-us" },
  { label: "Courses",    hasDropdown: true },
  { label: "Resources",  hasDropdown: true },
  { label: "Pricing",    hasDropdown: false },
];

const EMPTY_COURSE_DATA = {
  departments: [],
  loading: true,
  error: "",
};

export const Navbar = ({ courseData: externalCourseData }) => {
  const [internalCourseData, setInternalCourseData] = useState(EMPTY_COURSE_DATA);
  const courseData = externalCourseData ?? internalCourseData;

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [departments, setDepartments] = useState(courseData.departments || []);
  const [courseMenuState, setCourseMenuState] = useState({
    loading: courseData.loading,
    error: courseData.error,
  });
  const [activeDepartmentId, setActiveDepartmentId] = useState(null);
  const [mobilePanel, setMobilePanel] = useState("main");
  const [mobileDepartmentId, setMobileDepartmentId] = useState(null);
  const navRef = useRef(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    if (externalCourseData) return undefined;

    let cancelled = false;

    const fetchCurriculum = async () => {
      setInternalCourseData({ departments: [], loading: true, error: "" });

      try {
        const { data } = await axios.get("/api/public/curriculum");
        if (cancelled) return;

        setInternalCourseData({
          departments: Array.isArray(data?.departments) ? data.departments : [],
          loading: false,
          error: "",
        });
      } catch {
        if (cancelled) return;

        setInternalCourseData({
          departments: [],
          loading: false,
          error: "Unable to load courses right now.",
        });
      }
    };

    fetchCurriculum();

    return () => {
      cancelled = true;
    };
  }, [externalCourseData]);

  // Update departments and loading state when courseData changes
  useEffect(() => {
    setDepartments(courseData.departments || []);
    setCourseMenuState({
      loading: courseData.loading,
      error: courseData.error,
    });
    setActiveDepartmentId(courseData.departments?.[0]?.id ?? null);
  }, [courseData]);

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

  const closeMobileMenu = () => {
    setMobileOpen(false);
    setMobilePanel("main");
    setMobileDepartmentId(null);
    setActiveDropdown(null);
  };

  const activeDepartment =
    departments.find((department) => department.id === activeDepartmentId) ||
    departments[0] ||
    null;

  const mobileDepartment =
    departments.find((department) => department.id === mobileDepartmentId) ||
    null;

  const DEPT_LIMIT = 6;
  const COURSE_LIMIT = 7;

  const visibleDepartments = departments.slice(0, DEPT_LIMIT);
  const hasMoreDepartments = departments.length > DEPT_LIMIT;

  const activeCourses = activeDepartment?.courses ?? [];
  const visibleCourses = activeCourses.slice(0, COURSE_LIMIT);
  const hasMoreCourses = activeCourses.length > COURSE_LIMIT;

  const renderCoursesDropdown = () => (
    <div className="absolute top-[calc(100%+14px)] left-1/2 z-10 w-[min(820px,calc(100vw-56px))] -translate-x-1/2 overflow-hidden rounded-2xl border border-[#ebe8f2] bg-white shadow-[0_20px_56px_rgba(12,4,7,0.13)] animate-[dropIn_0.18s_ease]">
      <div className="grid grid-cols-[220px_1fr]">
        {/* Departments column */}
        <div className="border-r border-[#f0edf6] bg-[#fafafa] py-4">
          <p className="px-5 pb-2 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#a09cb0]">
            Departments
          </p>
          {courseMenuState.loading ? (
            <p className="px-5 py-4 text-sm text-[#a09cb0]">Loading…</p>
          ) : courseMenuState.error ? (
            <p className="px-5 py-4 text-sm text-[#b42318]">{courseMenuState.error}</p>
          ) : departments.length === 0 ? (
            <p className="px-5 py-4 text-sm text-[#a09cb0]">No departments yet.</p>
          ) : (
            <div className="flex flex-col">
              {visibleDepartments.map((department) => (
                <button
                  key={department.id}
                  type="button"
                  onMouseEnter={() => setActiveDepartmentId(department.id)}
                  onFocus={() => setActiveDepartmentId(department.id)}
                  className={`flex w-full items-center justify-between gap-2 px-5 py-2.5 text-left text-[0.875rem] font-medium transition-colors duration-100 rounded-none ${
                    activeDepartment?.id === department.id
                      ? "bg-white text-[#cd1a09]"
                      : "text-[#3a3b50] hover:bg-white hover:text-[#cd1a09]"
                  }`}
                >
                  <span className="truncate">{department.name}</span>
                  <svg className="w-3.5 h-3.5 shrink-0 text-[#c0bccf]" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              ))}
              {hasMoreDepartments && (
                <Link
                  to="/all-courses"
                  onClick={() => setActiveDropdown(null)}
                  className="flex items-center gap-1.5 px-5 py-2.5 text-[0.82rem] font-semibold text-[#cd1a09] no-underline hover:underline"
                >
                  Explore all departments
                  <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Courses column */}
        <div className="py-4 px-6">
          {activeDepartment ? (
            <>
              <p className="pb-2 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#a09cb0]">
                {activeDepartment.name}
              </p>
              {visibleCourses.length ? (
                <>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-0.5">
                    {visibleCourses.map((course) => (
                      <Link
                        key={course.id}
                        to={`/course/${course.id}`}
                        onClick={() => setActiveDropdown(null)}
                        className="group flex items-center gap-2 py-2.5 text-left no-underline"
                      >
                        <span className="text-[0.875rem] font-medium text-[#2c2d3f] group-hover:text-[#cd1a09] transition-colors duration-100 leading-snug">
                          {course.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                  {hasMoreCourses && (
                    <div className="mt-3 border-t border-[#f0edf6] pt-3">
                      <Link
                        to="/all-courses"
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center gap-1.5 text-[0.82rem] font-semibold text-[#cd1a09] no-underline hover:underline"
                      >
                        Explore more in {activeDepartment.name}
                        <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <p className="py-4 text-sm text-[#a09cb0]">
                  Courses for this department will appear here soon.
                </p>
              )}
            </>
          ) : (
            <p className="py-4 text-sm text-[#a09cb0]">
              Select a department to browse courses.
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div ref={navRef} className="sticky top-0 z-[1000] flex justify-center p-0 md:p-3 bg-transparent pointer-events-none font-['Inter',_system-ui,_sans-serif]">
      <nav
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
              className="h-[30px] w-[40px] px-1 "
            />
            <span className="text-[1.05rem] font-bold text-[#0d463e] ">
              {INSTITUTE_NAME}
            </span>
          </div>
        </a>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-[2px] list-none m-0 mx-auto p-0">
          {NAV_LINKS.map(({ label, hasDropdown, to }) => (
            <li key={label} className="relative">
              {to && !hasDropdown ? (
                <Link
                  to={to}
                  className={`flex items-center gap-1 px-3 py-1.5 text-[0.88rem] font-medium rounded-full whitespace-nowrap transition-all duration-200 no-underline
                    text-[#4a5553] hover:bg-[#ec3d2d]/10 hover:text-[#cd1a09]
                  `}
                >
                  {label}
                </Link>
              ) : (
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
              )}

              {/* Desktop Dropdown Menu */}
              {hasDropdown && activeDropdown === label && (
                label === "Courses" ? renderCoursesDropdown() : (
                <div className="absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 bg-white/96 backdrop-blur-[20px] border border-[#d2f5eb]/50 rounded-2xl p-4 min-width min-w-[180px] shadow-[0_8px_32px_rgba(16,163,127,0.06)] z-10 animate-[dropIn_0.2s_ease]">
                  <p className="text-[0.82rem] text-[#8da19c] m-0 whitespace-nowrap">
                    {label} options coming soon…
                  </p>
                </div>
                )
              )}
            </li>
          ))}
        </ul>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {user ? (
            <button
              onClick={logout}
              className="px-4 py-2 text-sm rounded-xl font-semibold text-white bg-red-600/90 hover:bg-red-700 transition-all duration-300 cursor-pointer"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="text-[0.88rem] font-semibold text-white no-underline px-4 py-[7px] rounded-full bg-gradient-to-r from-rose-500 to-[#fc362d] shadow-[0_2px_10px_rgba(27,210,164,0.25)] hover:shadow-[0_4px_18px_rgba(27,210,164,0.4)] hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="md:hidden flex flex-col gap-[5px] bg-none border-none cursor-pointer p-1.5 ml-auto rounded-lg hover:bg-black/5 transition-colors duration-200"
          onClick={() => {
            setMobileOpen((o) => !o);
            setMobilePanel("main");
            setMobileDepartmentId(null);
          }}
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
        className={`pointer-events-auto md:hidden fixed inset-0 z-[998] bg-[#0c0407]/35 transition-opacity duration-300 ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />
      <div
        className={`pointer-events-auto md:hidden fixed left-0 top-0 z-[999] h-[100dvh] w-[90vw] max-w-[420px] overflow-hidden bg-white shadow-[14px_0_40px_rgba(12,4,7,0.18)] transition-transform duration-300 ease-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div
          className={`flex h-full w-[300%] transition-transform duration-300 ease-out ${
            mobilePanel === "main"
              ? "translate-x-0"
              : mobilePanel === "departments"
                ? "-translate-x-1/3"
                : "-translate-x-2/3"
          }`}
        >
          <section className="h-full w-1/3 shrink-0 overflow-y-auto px-6 pb-8 pt-5">
            <div className="mb-8 flex items-center justify-between">
              <a href="/" className="flex items-center gap-2 no-underline" onClick={closeMobileMenu}>
                <img src={logo} alt="MSAI India Logo" className="h-[48px] w-[66px]" />
                <span className="text-[1.05rem] font-bold text-[#0d463e]">{INSTITUTE_NAME}</span>
              </a>
              <button
                type="button"
                onClick={closeMobileMenu}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ebe8f2] text-2xl leading-none text-[#2c2d3f]"
                aria-label="Close menu"
              >
                ×
              </button>
            </div>

            <ul className="m-0 flex list-none flex-col p-0">
              {NAV_LINKS.map(({ label, hasDropdown, to }) => (
                <li key={label} className="border-b border-[#ebe8f2]">
                  {to && !hasDropdown ? (
                    <Link
                      to={to}
                      onClick={closeMobileMenu}
                      className="flex min-h-[62px] w-full items-center bg-white px-0 py-4 text-left text-[1.08rem] font-medium text-[#2c2d3f] no-underline"
                    >
                      {label}
                    </Link>
                  ) : (
                  <button
                    type="button"
                    className="flex min-h-[62px] w-full items-center justify-between bg-white px-0 py-4 text-left text-[1.08rem] font-medium text-[#2c2d3f]"
                    onClick={() => {
                      if (label === "Courses") {
                        setMobilePanel("departments");
                        return;
                      }
                      if (hasDropdown) toggleDropdown(label);
                    }}
                  >
                    {label}
                    {hasDropdown && (
                      <span aria-hidden="true" className="text-3xl font-light leading-none">
                        ›
                      </span>
                    )}
                  </button>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 border-t border-[#ebe8f2] pt-5">
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    closeMobileMenu();
                  }}
                  className="w-full py-3 px-4 rounded-[8px] font-semibold text-white bg-red-600 hover:bg-red-700 transition-all cursor-pointer"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="text-center py-3 text-[0.95rem] font-semibold text-white rounded-[8px] bg-gradient-to-r from-rose-500 to-[#fc362d] shadow-[0_2px_10px_rgba(252,54,45,0.25)] transition-all duration-200"
                >
                  Login
                </Link>
              )}
            </div>
          </section>

          <section className="h-full w-1/3 shrink-0 overflow-y-auto bg-white px-6 pb-8 pt-5">
            <div className="mb-7 flex items-center gap-3 border-b border-[#ebe8f2] pb-4">
              <button
                type="button"
                onClick={() => setMobilePanel("main")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ebe8f2] text-2xl leading-none text-[#2c2d3f]"
                aria-label="Back to menu"
              >
                ‹
              </button>
              <h2 className="m-0 text-lg font-bold text-[#2c2d3f]">Courses</h2>
            </div>

            {courseMenuState.loading ? (
              <p className="text-sm text-[#a09cb0]">Loading departments…</p>
            ) : courseMenuState.error ? (
              <p className="text-sm text-[#b42318]">{courseMenuState.error}</p>
            ) : departments.length === 0 ? (
              <p className="text-sm text-[#a09cb0]">No departments available yet.</p>
            ) : (
              <div className="flex flex-col">
                {visibleDepartments.map((department) => (
                  <button
                    key={department.id}
                    type="button"
                    onClick={() => {
                      setMobileDepartmentId(department.id);
                      setMobilePanel("courses");
                    }}
                    className="flex min-h-[54px] w-full items-center justify-between border-b border-[#f0edf6] bg-white py-3 text-left text-[0.95rem] font-medium text-[#2c2d3f]"
                  >
                    <span className="truncate">{department.name}</span>
                    <svg className="w-3.5 h-3.5 shrink-0 text-[#c0bccf]" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                ))}
                {hasMoreDepartments && (
                  <Link
                    to="/all-courses"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-1.5 py-3 text-[0.875rem] font-semibold text-[#cd1a09] no-underline"
                  >
                    Explore all departments
                    <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                )}
              </div>
            )}
          </section>

          <section className="h-full w-1/3 shrink-0 overflow-y-auto bg-white px-6 pb-8 pt-5">
            <div className="mb-7 flex items-center gap-3 border-b border-[#ebe8f2] pb-4">
              <button
                type="button"
                onClick={() => setMobilePanel("departments")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ebe8f2] text-2xl leading-none text-[#2c2d3f]"
                aria-label="Back to departments"
              >
                ‹
              </button>
              <h2 className="m-0 min-w-0 truncate text-lg font-bold text-[#2c2d3f]">
                {mobileDepartment?.name || "Courses"}
              </h2>
            </div>

            {mobileDepartment?.courses?.length ? (
              <div className="flex flex-col">
                {mobileDepartment.courses.slice(0, COURSE_LIMIT).map((course) => (
                  <Link
                    key={course.id}
                    to={`/course/${course.id}`}
                    onClick={closeMobileMenu}
                    className="flex items-center border-b border-[#f0edf6] py-3 text-left no-underline"
                  >
                    <span className="text-[0.95rem] font-medium text-[#2c2d3f] leading-snug">
                      {course.title}
                    </span>
                  </Link>
                ))}
                {mobileDepartment.courses.length > COURSE_LIMIT && (
                  <Link
                    to="/all-courses"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-1.5 py-3 text-[0.875rem] font-semibold text-[#cd1a09] no-underline"
                  >
                    Explore more
                    <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                )}
              </div>
            ) : (
              <p className="py-4 text-sm text-[#a09cb0]">
                Courses for this department will appear here soon.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
