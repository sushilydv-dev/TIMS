import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { ReactLenis } from "lenis/react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/elevate/Footer";
import {
  ConsultationProvider,
  useConsultation,
} from "../context/ConsultationContext";
import {
  Clock,
  BookOpen,
  BarChart2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Award,
  Users,
  Star,
  Layers,
  CalendarCheck,
} from "lucide-react";

/* ── helpers ─────────────────────────────────────────── */
const formatINR = (v) => {
  const n = Number(v || 0);
  if (!n) return "Fee on request";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

const viewFadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

/* ── static "what you'll learn" bullets (used when none from API) ── */
const DEFAULT_OUTCOMES = [
  "Build real-world projects from scratch with industry-level standards",
  "Understand the full lifecycle of professional software development",
  "Develop problem-solving skills applied to domain-specific challenges",
  "Work with modern tools, frameworks and methodologies used in practice",
  "Gain confidence for placements, interviews and professional roles",
  "Receive hands-on mentorship and structured project feedback",
];

/* ── static highlight cards ─────────────────────────── */
const HIGHLIGHTS = [
  {
    icon: Award,
    label: "Certificate of Completion",
    sub: "Industry-recognised credential",
  },
  { icon: Users, label: "Expert Mentors", sub: "Practitioner-led guidance" },
  {
    icon: Star,
    label: "Live Project Work",
    sub: "Build a production-grade portfolio",
  },
  {
    icon: Layers,
    label: "Structured Curriculum",
    sub: "Module-by-module progression",
  },
];

/* ── AccordionModule ─────────────────────────────────── */
function AccordionModule({ module, index }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className="border border-black/[0.07] rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 bg-white hover:bg-[#fff8f7] transition-colors duration-150 text-left gap-4"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="shrink-0 w-7 h-7 rounded-full bg-[#fc362d]/10 text-[#fc362d] text-xs font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <span className="font-semibold text-[#0c0407] text-sm md:text-base truncate">
            {module.title}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {module.learning_items?.length > 0 && (
            <span className="hidden sm:inline text-xs font-medium text-[#636363] bg-black/5 rounded-full px-2.5 py-1">
              {module.learning_items.length} topic
              {module.learning_items.length !== 1 ? "s" : ""}
            </span>
          )}
          {open ? (
            <ChevronUp className="w-4 h-4 text-[#636363]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#636363]" />
          )}
        </div>
      </button>

      {open && module.learning_items?.length > 0 && (
        <div className="border-t border-black/[0.06] bg-[#fafafa] px-6 py-4">
          <ul className="flex flex-col gap-2.5">
            {module.learning_items.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm text-[#3a3b50]"
              >
                <CheckCircle className="w-4 h-4 text-[#fc362d] shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ── BookAppointmentButton — needs ConsultationContext ── */
function BookAppointmentButton({ className }) {
  const { openConsultation } = useConsultation();
  return (
    <button type="button" onClick={openConsultation} className={className}>
      <span className="flex items-center justify-center gap-2">
        <CalendarCheck className="w-4 h-4" />
        Book a Appointment
      </span>
    </button>
  );
}

/* ── Skeleton loader ─────────────────────────────────── */
function CourseSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-[#0c0407] pt-28 pb-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[1fr_360px] gap-10">
          <div className="space-y-4">
            <div className="h-4 w-24 bg-white/10 rounded-full" />
            <div className="h-10 w-3/4 bg-white/10 rounded-xl" />
            <div className="h-4 w-full bg-white/10 rounded-full" />
            <div className="h-4 w-2/3 bg-white/10 rounded-full" />
            <div className="flex gap-4 mt-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 w-24 bg-white/10 rounded-full" />
              ))}
            </div>
          </div>
          <div className="hidden md:block h-64 bg-white/5 rounded-3xl" />
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 grid md:grid-cols-[1fr_360px] gap-10">
        <div className="space-y-6">
          <div className="h-6 w-40 bg-black/10 rounded-full" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-black/[0.04] rounded-2xl" />
          ))}
        </div>
        <div className="hidden md:block h-80 bg-black/[0.04] rounded-3xl" />
      </div>
    </div>
  );
}

/* ── Main CoursePage ─────────────────────────────────── */
function CoursePageInner() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAllModules, setShowAllModules] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    setError("");
    axios
      .get(`/api/public/courses/${courseId}`)
      .then(({ data }) => setCourse(data))
      .catch(() => setError("Course not found or unavailable."))
      .finally(() => setLoading(false));
  }, [courseId]);

  const totalModules = course?.modules?.length ?? 0;
  const MODULES_PREVIEW = 5;
  const visibleModules = showAllModules
    ? (course?.modules ?? [])
    : (course?.modules ?? []).slice(0, MODULES_PREVIEW);

  if (loading)
    return (
      <div className="bg-white min-h-screen font-['Inter',system-ui,sans-serif]">
        <div className="fixed top-0 left-0 w-full z-20">
          <Navbar />
        </div>
        <CourseSkeleton />
      </div>
    );

  if (error || !course)
    return (
      <div className="bg-white min-h-screen font-['Inter',system-ui,sans-serif]">
        <div className="fixed top-0 left-0 w-full z-20">
          <Navbar />
        </div>
        <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6 px-4">
          <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-[#fc362d]" />
          </div>
          <h2 className="text-2xl font-bold text-[#0c0407]">
            Course Not Found
          </h2>
          <p className="text-[#636363] text-center max-w-xs">
            {error || "This course doesn't exist or has been removed."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#fc362d] text-white font-semibold hover:bg-[#e02d25] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    );

  const totalLearningItems =
    course.modules?.reduce(
      (acc, m) => acc + (m.learning_items?.length ?? 0),
      0,
    ) ?? 0;

  return (
    <div className="bg-white min-h-screen font-['Inter',system-ui,sans-serif] text-[#0c0407]">
      {/* Fixed navbar */}
      <div className="fixed top-0 left-0 w-full z-20">
        <Navbar />
      </div>

      <section className="bg-[#0c0407] pt-28 pb-16 md:pb-20 px-4 md:px-8 relative">
        {/* Blurry cover media background */}
        {course.thumbnail_url && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {course.thumbnail_url.startsWith("data:video/") ||
            course.thumbnail_url.endsWith(".mp4") ||
            course.thumbnail_url.endsWith(".mov") ||
            course.thumbnail_url.endsWith(".webm") ||
            course.thumbnail_url.endsWith(".ogg") ||
            (course.thumbnail_url.includes("/uploads/") &&
              (course.thumbnail_url.endsWith(".mp4") ||
                course.thumbnail_url.endsWith(".mov") ||
                course.thumbnail_url.endsWith(".webm") ||
                course.thumbnail_url.endsWith(".ogg"))) ? (
              <video
                src={course.thumbnail_url.startsWith("data:") ? course.thumbnail_url : `http://localhost:3000${course.thumbnail_url}`}
                muted
                playsInline
                loop
                autoPlay
                className="w-full h-full object-cover blur-[50px] scale-110 opacity-80"
              />
            ) : (
              <img
                src={course.thumbnail_url.startsWith("data:") ? course.thumbnail_url : `http://localhost:3000${course.thumbnail_url}`}
                alt=""
                className="w-full h-full object-cover blur-[50px] scale-110 opacity-80"
              />
            )}
            {/* Dark vignette overlay for contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0c0407] via-[#0c0407]/65 to-transparent" />
          </div>
        )}

        {/* Subtle red glow — contained */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 left-1/3 w-[500px] h-[300px] rounded-full bg-rose-600/[0.08] blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[200px] rounded-full bg-rose-600/[0.05] blur-[100px]" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Left: info — reserves space so card doesn't overlap text */}
          <div className="md:pr-[380px]">
            {/* Breadcrumb */}
            <motion.div {...fadeUp(0)} className="flex items-center gap-2 mb-6">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-white/50 hover:text-white text-xs font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
              {course.department && (
                <>
                  <span className="text-white/20">·</span>
                  <span className="text-[#fc362d] text-xs font-semibold uppercase tracking-wider">
                    {course.department.name}
                  </span>
                </>
              )}
            </motion.div>

            {/* Title */}
            <motion.h1
              {...fadeUp(0.05)}
              className="text-2xl md:text-4xl font-bold text-white leading-tight mb-4"
            >
              {course.title}
            </motion.h1>

            {/* Description */}
            {course.description && (
              <motion.p
                {...fadeUp(0.1)}
                className="text-white/60 text-sm md:text-base leading-relaxed mb-6 max-w-2xl"
              >
                {course.description}
              </motion.p>
            )}

            {/* Meta pills */}
            <motion.div
              {...fadeUp(0.15)}
              className="flex flex-wrap items-center gap-3"
            >
              <span className="flex items-center gap-1.5 bg-white/10 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full">
                <Clock className="w-3.5 h-3.5" />
                {course.duration_month} Month
                {course.duration_month !== 1 ? "s" : ""}
              </span>
              {totalModules > 0 && (
                <span className="flex items-center gap-1.5 bg-white/10 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full">
                  <BookOpen className="w-3.5 h-3.5" />
                  {totalModules} Module{totalModules !== 1 ? "s" : ""}
                </span>
              )}
              {totalLearningItems > 0 && (
                <span className="flex items-center gap-1.5 bg-white/10 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full">
                  <BarChart2 className="w-3.5 h-3.5" />
                  {totalLearningItems} Topics
                </span>
              )}
              {course.department?.code && (
                <span className="text-xs font-bold uppercase tracking-widest text-[#fc362d] bg-[#fc362d]/10 border border-[#fc362d]/20 px-3 py-1.5 rounded-full">
                  {course.department.code}
                </span>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── BODY: relative wrapper so the card can overlap hero bottom ── */}
      <div className="relative max-w-6xl mx-auto px-4 md:px-8">
        {/* ── Right sticky column — floats over hero/content boundary ── */}
        <aside className="hidden md:block absolute -top-20 right-8 w-[340px] z-10">
          <div className="sticky top-28">
            <motion.div
              {...fadeUp(0.2)}
              className="rounded-3xl border border-black/[0.07] overflow-hidden bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
            >
              {/* Thumbnail or video or placeholder */}
              {course.demo_video_url ? (
                <div className="w-full aspect-video bg-black">
                  {course.demo_video_url.startsWith("/uploads/") || course.demo_video_url.startsWith("data:") ? (
                    <video
                      src={course.demo_video_url.startsWith("data:") ? course.demo_video_url : `http://localhost:3000${course.demo_video_url}`}
                      controls
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <iframe
                      src={course.demo_video_url}
                      title="Course demo"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
              ) : course.thumbnail_url ? (
                (() => {
                  const thumbUrl = course.thumbnail_url?.startsWith("data:") ? course.thumbnail_url : `http://localhost:3000${course.thumbnail_url}`;
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
                    <div className="w-full aspect-video bg-[#f0eef4]">
                      {isDirectVideo ? (
                        <video
                          src={thumbUrl}
                          controls
                          className="w-full h-full object-contain bg-black"
                        />
                      ) : (
                        <img
                          src={thumbUrl}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="w-full aspect-video bg-[#f0eef4] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-[#c0bccf]">
                    <svg
                      className="w-10 h-10"
                      viewBox="0 0 40 40"
                      fill="none"
                      aria-hidden="true"
                    >
                      <rect
                        x="4"
                        y="8"
                        width="32"
                        height="24"
                        rx="3"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                      <circle
                        cx="14"
                        cy="17"
                        r="3"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                      <path
                        d="M4 28l8-6 6 5 5-4 9 7"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-xs font-medium">Course preview</span>
                  </div>
                </div>
              )}

              <div className="p-6">
                {/* Fee */}
                <div className="flex items-baseline gap-2 mb-5">
                  <span className="text-2xl font-extrabold text-[#0c0407]">
                    {formatINR(course.fees)}
                  </span>
                </div>

                {/* Book appointment */}
                <BookAppointmentButton className="block w-full text-center py-3.5 rounded-2xl font-bold text-white bg-[#fc362d] hover:bg-[#e02d25] shadow-[0_4px_20px_rgba(252,54,45,0.25)] transition-all duration-200 mb-2.5 cursor-pointer" />

                {/* Bullet points */}
                <div className="mt-5 pt-4 border-t border-black/[0.06] flex flex-col gap-2.5">
                  {[
                    `${course.duration_month} Month${course.duration_month !== 1 ? "s" : ""} duration`,
                    totalModules > 0
                      ? `${totalModules} structured module${totalModules !== 1 ? "s" : ""}`
                      : null,
                    "Certificate on completion",
                    "Lifetime access to materials",
                  ]
                    .filter(Boolean)
                    .map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 text-sm text-[#3a3b50]"
                      >
                        <CheckCircle className="w-4 h-4 text-[#fc362d] shrink-0" />
                        {item}
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ────────────────────────────────── */}
        <div className="py-12 md:py-16 md:pr-[380px]">
          <div className="space-y-14">
            {/* Highlight cards */}
            <motion.section {...viewFadeUp(0)}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {HIGHLIGHTS.map(({ icon: Icon, label, sub }) => (
                  <div
                    key={label}
                    className="flex flex-col items-start gap-2 p-4 rounded-2xl border border-black/[0.06] bg-[#fafafa] hover:border-[#fc362d]/20 hover:bg-[#fc362d]/[0.02] transition-all duration-200"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#fc362d]/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-[#fc362d]" />
                    </div>
                    <span className="text-xs font-bold text-[#0c0407] leading-snug">
                      {label}
                    </span>
                    <span className="text-[0.7rem] text-[#636363] leading-snug">
                      {sub}
                    </span>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* What you'll learn — dynamic from API, falls back to defaults */}
            {(course.outcomes?.length > 0 || DEFAULT_OUTCOMES.length > 0) && (
              <motion.section {...viewFadeUp(0.05)}>
                <span className="inline-block px-3 py-1.5 rounded-full text-[0.68rem] font-bold tracking-[0.18em] uppercase text-[#fc362d] bg-[#fc362d]/10 border border-[#fc362d]/20 mb-4">
                  What You'll Learn
                </span>
                <h2 className="text-xl md:text-2xl font-bold mb-6 text-[#0c0407]">
                  Skills & Outcomes
                </h2>
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3.5 p-6 border border-black/[0.07] rounded-2xl bg-[#fafafa]">
                  {(course.outcomes?.length > 0
                    ? course.outcomes
                    : DEFAULT_OUTCOMES
                  ).map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 text-sm text-[#3a3b50]"
                    >
                      <CheckCircle className="w-4 h-4 text-[#fc362d] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Course curriculum */}
            {totalModules > 0 && (
              <motion.section {...viewFadeUp(0.05)}>
                <span className="inline-block px-3 py-1.5 rounded-full text-[0.68rem] font-bold tracking-[0.18em] uppercase text-[#fc362d] bg-[#fc362d]/10 border border-[#fc362d]/20 mb-4">
                  Curriculum
                </span>
                <div className="flex items-end justify-between gap-4 mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-[#0c0407]">
                    Course Content
                  </h2>
                  <span className="text-sm text-[#636363] shrink-0">
                    {totalModules} module{totalModules !== 1 ? "s" : ""}
                    {totalLearningItems > 0 &&
                      ` · ${totalLearningItems} topics`}
                  </span>
                </div>
                <div className="flex flex-col gap-2.5">
                  {visibleModules.map((mod, i) => (
                    <motion.div key={mod.id} {...viewFadeUp(i * 0.04)}>
                      <AccordionModule module={mod} index={i} />
                    </motion.div>
                  ))}
                </div>
                {totalModules > MODULES_PREVIEW && (
                  <button
                    type="button"
                    onClick={() => setShowAllModules((s) => !s)}
                    className="mt-4 flex items-center gap-2 text-[0.875rem] font-semibold text-[#fc362d] hover:underline"
                  >
                    {showAllModules ? (
                      <>
                        Show less <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Show all {totalModules} modules{" "}
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </motion.section>
            )}

            
          </div>
        </div>
        {/* end md:pr-[380px] content */}
      </div>
      {/* end relative max-w-6xl wrapper */}

      {/* ── Mobile sticky enroll bar ─────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-black/[0.07] px-4 py-3 flex items-center gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex-1 min-w-0">
          <div className="text-[0.68rem] font-bold uppercase tracking-wider text-[#636363]">
            Total Fee
          </div>
          <div className="text-lg font-extrabold text-[#fc362d]">
            {formatINR(course.fees)}
          </div>
        </div>
        <BookAppointmentButton className="block  text-center px-2 py-3.5 rounded-2xl font-bold text-white bg-[#fc362d] hover:bg-[#e02d25] shadow-[0_4px_20px_rgba(252,54,45,0.25)] transition-all duration-200 mb-2.5 cursor-pointer" />
      </div>

      {/* Bottom padding for mobile bar */}
      <div className="md:hidden h-20" />

      <Footer />
    </div>
  );
}

export default function CoursePage() {
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
        <CoursePageInner />
      </ReactLenis>
    </ConsultationProvider>
  );
}
