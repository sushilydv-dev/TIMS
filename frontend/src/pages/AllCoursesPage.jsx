import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ReactLenis } from "lenis/react";
import axios from "axios";
import {
  Search, Clock, BookOpen, ArrowRight, X,
  GraduationCap, SlidersHorizontal,
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/elevate/Footer";
import { ConsultationProvider, useConsultation } from "../context/ConsultationContext";
import consultationImage from "../assets/consultation.jpg";


const formatINR = (v) => {
  const n = Number(v || 0);
  if (!n) return "Free";
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(n);
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

const cardAnim = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -10 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
};

/* ── Skeleton card ───────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-black/[0.06] bg-white overflow-hidden animate-pulse">
      <div className="aspect-video bg-[#f0eef4]" />
      <div className="p-6 space-y-3">
        <div className="h-3 w-20 bg-black/[0.06] rounded-full" />
        <div className="h-5 w-3/4 bg-black/[0.08] rounded-full" />
        <div className="h-3 w-1/2 bg-black/[0.05] rounded-full" />
        <div className="h-10 w-full bg-black/[0.04] rounded-2xl mt-4" />
      </div>
    </div>
  );
}

/* ── Video thumbnail extractor ───────────────────────── */
function getVideoThumbnail(url) {
  if (!url) return null;

  const ytEmbed = url.match(/youtube\.com\/embed\/([^?&/]+)/);
  const ytWatch = url.match(/[?&]v=([^&]+)/);
  const ytShort = url.match(/youtu\.be\/([^?]+)/);
  const ytId = (ytEmbed || ytWatch || ytShort)?.[1];
  if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) {
    return null;
  }

  return null;
}

/* ── Course card ─────────────────────────────────────── */
function CourseCard({ course }) {
  // Resolve what image to show:
  // 1. Uploaded thumbnail  2. Video screenshot (YouTube)  3. Placeholder
  const videoThumb = !course.thumbnail_url ? getVideoThumbnail(course.demo_video_url) : null;
  
  // Handle file paths vs base64 URLs
  const thumbUrl = course.thumbnail_url?.startsWith("data:") ? course.thumbnail_url : (course.thumbnail_url ? `http://localhost:3000${course.thumbnail_url}` : null);
  const imgSrc = thumbUrl || videoThumb;
  const isVideoThumb = !thumbUrl && Boolean(videoThumb);

  const isDirectVideo = course.thumbnail_url && (
    course.thumbnail_url.startsWith("data:video/") ||
    course.thumbnail_url.endsWith(".mp4") ||
    course.thumbnail_url.endsWith(".mov") ||
    course.thumbnail_url.endsWith(".webm") ||
    course.thumbnail_url.endsWith(".ogg") ||
    (course.thumbnail_url.includes("/uploads/") &&
      (course.thumbnail_url.endsWith(".mp4") ||
        course.thumbnail_url.endsWith(".mov") ||
        course.thumbnail_url.endsWith(".webm") ||
        course.thumbnail_url.endsWith(".ogg")))
  );

  return (
    <motion.div {...cardAnim} layout>
      <Link
        to={`/course/${course.id}`}
        className="group flex flex-col h-full rounded-3xl border border-black/[0.06] bg-white overflow-hidden hover:border-[#fc362d]/25 hover:shadow-[0_12px_40px_rgba(252,54,45,0.1)] transition-all duration-400 no-underline"
      >
        {/* Thumbnail */}
        <div className="relative w-full aspect-video bg-[#f0eef4] overflow-hidden">
          {isDirectVideo ? (
            <video
              src={thumbUrl}
              muted
              playsInline
              loop
              autoPlay
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : imgSrc ? (
            <>
              <img
                src={imgSrc}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Play icon overlay for video thumbnails */}
              {isVideoThumb && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center group-hover:bg-[#fc362d]/80 transition-colors duration-300">
                    <svg className="w-5 h-5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#c0bccf]">
              <GraduationCap className="w-10 h-10" />
              <span className="text-xs font-medium">No preview</span>
            </div>
          )}
          {/* Department badge over image */}
          {course.department && (
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[0.65rem] font-bold tracking-wider uppercase bg-white/90 backdrop-blur-sm text-[#fc362d] border border-[#fc362d]/20">
              {course.department.name}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-5">
          <h3 className="text-[0.95rem] font-bold text-[#0c0407] leading-snug mb-3 group-hover:text-[#fc362d] transition-colors duration-200 line-clamp-2">
            {course.title}
          </h3>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="flex items-center gap-1 text-xs font-medium text-[#636363]">
              <Clock className="w-3.5 h-3.5 text-[#fc362d]" />
              {course.duration_month} mo
            </span>
            {course.module_count > 0 && (
              <span className="flex items-center gap-1 text-xs font-medium text-[#636363]">
                <BookOpen className="w-3.5 h-3.5 text-[#fc362d]" />
                {course.module_count} modules
              </span>
            )}
          </div>

          {/* Fee */}
          <div className="mt-auto pt-3 border-t border-black/[0.05] flex items-center justify-between">
            <span className="text-lg font-extrabold text-[#0c0407]">
              {formatINR(course.fees)}
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-[#fc362d] uppercase tracking-wider group-hover:gap-2 transition-all duration-200">
              View Course
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Inner page ──────────────────────────────────────── */
function AllCoursesInner() {
  const { openConsultation } = useConsultation();

  const [departments, setDepartments] = useState([]);
  const [allCourses, setAllCourses]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [search, setSearch]           = useState("");
  const [activeDept, setActiveDept]   = useState("all");

  useEffect(() => {
    setLoading(true);
    axios.get("/api/public/curriculum")
      .then(({ data }) => {
        const depts = data?.departments ?? [];
        setDepartments(depts);
        // Flatten all courses, attaching their department
        const flat = [];
        depts.forEach((dept) => {
          (dept.courses ?? []).forEach((c) => {
            flat.push({ ...c, department: { id: dept.id, name: dept.name, code: dept.code } });
          });
        });
        setAllCourses(flat);
      })
      .catch(() => setError("Unable to load courses right now."))
      .finally(() => setLoading(false));
  }, []);

  /* Derived filtered list */
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return allCourses.filter((c) => {
      const matchesDept = activeDept === "all" || c.department?.id === activeDept;
      if (!matchesDept) return false;
      if (!term) return true;
      return (
        c.title?.toLowerCase().includes(term) ||
        c.department?.name?.toLowerCase().includes(term) ||
        c.department?.code?.toLowerCase().includes(term)
      );
    });
  }, [allCourses, search, activeDept]);

  const totalCourses = allCourses.length;

  return (
    <div className="bg-white min-h-screen font-['Inter',system-ui,sans-serif] text-[#0c0407] overflow-x-hidden">
      <div className="fixed top-0 left-0 w-full z-20"><Navbar /></div>

      {/* ── HERO with search ─────────────────────────────── */}
      <section className="relative pt-36 pb-20 px-4 md:px-8 lg:px-16 overflow-hidden bg-white text-center">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] rounded-full bg-rose-500/[0.03] blur-[150px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-indigo-500/[0.02] blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.span {...fadeUp(0)} className="inline-block px-3 py-1.5 rounded-full text-xs font-bold tracking-[0.2em] uppercase text-[#fc362d] bg-[#fc362d]/10 border border-[#fc362d]/20 mb-6">
            All Programs
          </motion.span>

          <motion.h1 {...fadeUp(0.07)} className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.08] mb-6">
            Explore{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-[#fc362d]">
              every course
            </span>
            {" "}we offer
          </motion.h1>

          <motion.p {...fadeUp(0.13)} className="text-base md:text-lg text-[#636363] leading-relaxed mb-10 font-medium">
            {loading ? "Loading programs…" : `${totalCourses} program${totalCourses !== 1 ? "s" : ""} across ${departments.length} department${departments.length !== 1 ? "s" : ""} — find the one that fits your goals.`}
          </motion.p>

          {/* Search bar */}
          <motion.div {...fadeUp(0.18)} className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8] pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by course name or department…"
              className="w-full pl-12 pr-10 py-4 rounded-2xl border border-black/[0.1] bg-white shadow-sm text-sm font-medium text-[#0c0407] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#fc362d]/40 focus:shadow-[0_0_0_3px_rgba(252,54,45,0.08)] transition-all duration-200"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#94a3b8] hover:text-[#0c0407] hover:bg-black/[0.04] transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── DEPARTMENT FILTER TABS ───────────────────────── */}
      {!loading && departments.length > 0 && (
        <div className="sticky top-[72px] z-10 bg-white/90 backdrop-blur-md border-b border-black/[0.05] px-4 md:px-8 lg:px-16">
          <div className="max-w-7xl mx-auto overflow-x-auto">
            <div className="flex items-center gap-2 py-3 w-max min-w-full">
              <SlidersHorizontal className="w-4 h-4 text-[#94a3b8] shrink-0 mr-1" />
              {/* All tab */}
              <button
                type="button"
                onClick={() => setActiveDept("all")}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                  activeDept === "all"
                    ? "bg-[#fc362d] text-white shadow-[0_2px_12px_rgba(252,54,45,0.3)]"
                    : "bg-black/[0.04] text-[#636363] hover:bg-black/[0.07] hover:text-[#0c0407]"
                }`}
              >
                All departments
              </button>
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => setActiveDept(dept.id)}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                    activeDept === dept.id
                      ? "bg-[#fc362d] text-white shadow-[0_2px_12px_rgba(252,54,45,0.3)]"
                      : "bg-black/[0.04] text-[#636363] hover:bg-black/[0.07] hover:text-[#0c0407]"
                  }`}
                >
                  {dept.name}
                  <span className={`ml-1.5 text-[0.65rem] font-extrabold ${activeDept === dept.id ? "text-white/70" : "text-[#94a3b8]"}`}>
                    {dept.courses?.length ?? 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/*  COURSE list grid  */}
      <section className="relative px-4 md:px-8 lg:px-16 py-12 md:py-16 min-h-[40vh]">
        <div className="max-w-7xl mx-auto">

          {/* Results */}
          {!loading && !error && (
            <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
              <p className="text-sm font-semibold text-[#636363]">
                {filtered.length === 0
                  ? "No courses found"
                  : `Showing ${filtered.length} course${filtered.length !== 1 ? "s" : ""}${search ? ` for "${search}"` : ""}${activeDept !== "all" ? ` in ${departments.find(d => d.id === activeDept)?.name ?? ""}` : ""}`
                }
              </p>
              {(search || activeDept !== "all") && (
                <button
                  type="button"
                  onClick={() => { setSearch(""); setActiveDept("all"); }}
                  className="text-xs font-bold text-[#fc362d] hover:underline flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Clear filters
                </button>
              )}
            </div>
          )}

          {/* Loading  */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Error mesg*/}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-[#fc362d]" />
              </div>
              <p className="text-base font-semibold text-[#636363]">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 rounded-full bg-[#fc362d] text-white text-sm font-bold hover:bg-[#e02d25] transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty label */}
          {!loading && !error && filtered.length === 0 && (
            <motion.div {...cardAnim}
              className="flex flex-col items-center justify-center py-24 gap-4 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#fafafa] border border-black/[0.06] flex items-center justify-center">
                <Search className="w-7 h-7 text-[#94a3b8]" />
              </div>
              <h3 className="text-lg font-bold text-[#0c0407]">No courses found</h3>
              <p className="text-sm text-[#636363] font-medium max-w-xs">
                Try a different search term or browse all departments.
              </p>
              <button
                onClick={() => { setSearch(""); setActiveDept("all"); }}
                className="px-5 py-2.5 rounded-full border border-[#fc362d]/30 text-[#fc362d] text-sm font-bold hover:bg-[#fc362d]/5 transition-colors"
              >
                Show all courses
              </button>
            </motion.div>
          )}

          {/* Course cards list */}
          {!loading && !error && filtered.length > 0 && (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/*  CTA*/}
      <section className="relative py-24 px-4 md:px-8 lg:px-16 overflow-hidden bg-white">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-red-100 blur-[150px] pointer-events-none" />
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden bg-cover bg-center bg-no-repeat border border-white/[0.08] rounded-[40px] p-12 md:p-20 flex flex-col items-center text-center shadow-2xl"
            style={{ backgroundImage: `url(${consultationImage})` }}
          >
            <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />
            <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-[#fc362d]/10 blur-[80px] pointer-events-none" />

            <span className="px-3 py-1.5 rounded-full text-xs font-bold tracking-[0.2em] uppercase text-[#fc362d] bg-[#fc362d]/10 border border-[#fc362d]/20 mb-6 relative z-10">
              Get Started
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-8 max-w-2xl relative z-10">
              Can't find what you're{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-indigo-300">
                looking for?
              </span>
            </h2>
            <p className="text-gray-300 text-sm md:text-base lg:text-lg max-w-xl mb-12 leading-relaxed font-medium relative z-10">
              Talk to our team. We'll help you find the right program or put you on the list when a new course launches.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="relative z-10">
              <button
                type="button"
                onClick={openConsultation}
                className="relative group px-8 py-4 rounded-full font-bold text-white bg-[#fc362d] hover:bg-[#e02d25] transition-all duration-300 shadow-[0_4px_25px_rgba(252,54,45,0.35)] hover:shadow-[0_4px_35px_rgba(252,54,45,0.55)] cursor-pointer flex items-center gap-2"
              >
                Schedule A Consultation
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function AllCoursesPage() {
  return (
    <ConsultationProvider>
      <ReactLenis
        root
        options={{
          duration: 1.25,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          wheelMultiplier: 0.85,
          touchMultiplier: 1.2,
        }}
      >
        <AllCoursesInner />
      </ReactLenis>
    </ConsultationProvider>
  );
}
