import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Star, ArrowRight, Users, BookOpen, Award } from "lucide-react";
import landingimage from "../../assets/landing.jpg";
import { useConsultation } from "../../context/ConsultationContext";
import { INSTITUTE_NAME } from "../../constants";

const TRUST_PILLS = [
  { icon: Users,    text: "Professional Instructors" },
  { icon: BookOpen, text: "20+ Programs" },
  { icon: Award,    text: "Certified Outcomes" },
];

export const Hero = () => {
  const { openConsultation } = useConsultation();
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Parallax: image moves up slower than scroll
  const rawY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const imageY = useSpring(rawY, { stiffness: 80, damping: 20 });

  // Fade + scale hero text out as user scrolls
  const textOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const textY       = useTransform(scrollYProgress, [0, 0.35], [0, -40]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100vh] flex flex-col items-center justify-center text-center px-4 md:px-8 lg:px-16 pt-32 pb-8 overflow-hidden bg-white"
    >
      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-rose-500/[0.04] blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[350px] h-[350px] rounded-full bg-indigo-500/[0.03] blur-[100px] pointer-events-none" />

      {/* Content */}
      <motion.div
        style={{ opacity: textOpacity, y: textY }}
        className="relative z-10 max-w-4xl mx-auto flex flex-col items-center"
      >
       

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-[2.75rem] md:text-6xl lg:text-[5rem] font-black tracking-tight leading-[1.06] mb-7"
        >
          Launch your career{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-[#fc362d] to-rose-600">
            the right way
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="text-base md:text-lg lg:text-xl text-[#636363] max-w-2xl leading-relaxed mb-10 font-medium"
        >
          {INSTITUTE_NAME} partners with ambitious individuals to close the gap between classroom theory and enterprise-level execution — through structured programs, live projects, and dedicated mentorship.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-center gap-3 mb-12"
        >
          <Link
            to="/all-courses"
            className="relative group px-8 py-4 rounded-full font-bold text-white bg-[#fc362d] hover:bg-[#e02d25] transition-all duration-300 shadow-[0_4px_28px_rgba(252,54,45,0.3)] hover:shadow-[0_6px_36px_rgba(252,54,45,0.5)] flex items-center gap-2 no-underline overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Explore Courses
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-[#fc362d] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
          </Link>
          <button
            type="button"
            onClick={openConsultation}
            className="px-8 py-4 rounded-full font-bold text-[#0c0407] border border-black/12 hover:border-[#fc362d] hover:bg-[#fc362d]/5 transition-all duration-300 shadow-sm cursor-pointer"
          >
            Schedule a Consultation
          </button>
        </motion.div>

        {/* Trust pills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.44 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {TRUST_PILLS.map(({ icon: Icon, text }) => (
            <span key={text} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/[0.03] border border-black/[0.06] text-xs font-semibold text-[#636363]">
              <Icon className="w-3.5 h-3.5 text-[#fc362d]" />
              {text}
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* Hero image with parallax */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-[90%] max-w-5xl mt-14 rounded-[32px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.14)] border border-black/[0.06]"
        style={{ height: "clamp(260px, 36vw, 520px)" }}
      >
        <motion.div
          style={{ y: imageY }}
          className="absolute inset-[-10%] bg-cover bg-center"
          aria-hidden="true"
          data-image-parallax
        >
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${landingimage})` }}
          />
        </motion.div>
        {/* subtle vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
      </motion.div>
    </section>
  );
};
