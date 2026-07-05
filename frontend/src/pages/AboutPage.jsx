import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { ReactLenis } from "lenis/react";
import {
  Target, Eye, Heart, Users, Award, Lightbulb,
  BookOpen, Briefcase, Globe, ArrowRight, CheckCircle,
  GraduationCap, Building2, Handshake,
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/elevate/Footer";
import { ConsultationProvider, useConsultation } from "../context/ConsultationContext";
import consultationImage from "../assets/consultation.jpg";

/* ── helpers ─────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

function Counter({ value, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const frames = 60;
    const inc = value / frames;
    const t = setInterval(() => {
      frame++;
      if (frame >= frames) { clearInterval(t); setCount(value); }
      else setCount(Math.round(inc * frame));
    }, (1500 / frames));
    return () => clearInterval(t);
  }, [inView, value]);
  return <span ref={ref}>{count}{suffix}</span>;
}

/* ── Data ────────────────────────────────────────────── */
const STATS = [
  { value: 50, suffix: "K+", label: "Students Trained", glow: "bg-[#fc362d]/5" },
  { value: 10, suffix: "+",  label: "Years of Excellence", glow: "bg-indigo-500/5" },
  { value: 250, suffix: "+", label: "Projects Delivered", glow: "bg-rose-500/5" },
  { value: 99, suffix: "%",  label: "Student Satisfaction", glow: "bg-emerald-500/5" },
];

const VALUES = [
  { icon: Target,   title: "Mission-Driven",  desc: "Every program we build is anchored to a single goal — closing the gap between academic learning and real-world industry demands." },
  { icon: Eye,      title: "Transparent",     desc: "We believe in open, honest communication with students, trainers, and partners at every stage of the learning journey." },
  { icon: Heart,    title: "Student-First",   desc: "Decisions are made with the learner at the centre — from curriculum design to mentorship structures and career support." },
  { icon: Lightbulb,title: "Innovation",      desc: "We continuously evolve our methods, tools, and content to stay ahead of the technology and management landscape." },
  { icon: Handshake,title: "Industry Aligned",desc: "Our curriculum is co-designed with industry practitioners to ensure graduates are immediately productive contributors." },
  { icon: Globe,    title: "Inclusive Access",desc: "We design programs accessible to learners from diverse backgrounds, ensuring quality education is never gatekept." },
];

const OFFERINGS = [
  { icon: GraduationCap, title: "Technical Training", desc: "Structured programs in full-stack development, cloud infrastructure, UI/UX, and data engineering." },
  { icon: Briefcase,     title: "Industrial Internships", desc: "Live project placements with partner companies where students build real production systems." },
  { icon: Building2,     title: "Management Programs", desc: "HR, operations, and business administration tracks for aspiring management professionals." },
  { icon: Award,         title: "Certification & Placement", desc: "Industry-recognised certificates backed by a strong alumni network and placement support team." },
];

const TIMELINE = [
  { year: "2014", title: "Founded", desc: "TIMS was established with a vision to modernise technical internship management in India." },
  { year: "2017", title: "First 1,000 Graduates", desc: "Our first cohorts completed programs and entered the workforce — with a 94% placement rate." },
  { year: "2019", title: "Digital Platform Launch", desc: "Launched our centralised TIMS management ecosystem for seamless student and trainer operations." },
  { year: "2021", title: "National Expansion", desc: "Extended programs to 12 cities, partnering with 50+ industry organisations across verticals." },
  { year: "2024", title: "50,000 Alumni", desc: "Crossed a landmark milestone with over 50,000 trained professionals across our programs." },
];

/* ── Inner page (needs ConsultationContext) ─────────── */
function AboutPageInner() {
  const { openConsultation } = useConsultation();

  return (
    <div className="bg-white min-h-screen font-['Inter',system-ui,sans-serif] text-[#0c0407] overflow-x-hidden">
      {/* Fixed navbar */}
      <div className="fixed top-0 left-0 w-full z-20">
        <Navbar />
      </div>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-[72vh] flex flex-col items-center justify-center text-center px-4 md:px-8 lg:px-16 pt-36 pb-24 overflow-hidden bg-white">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-rose-500/[0.03] blur-[150px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-indigo-500/[0.02] blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <motion.span {...fadeUp(0)} className="px-3 py-1.5 rounded-full text-xs font-bold tracking-[0.2em] uppercase text-[#fc362d] bg-[#fc362d]/10 border border-[#fc362d]/20 mb-6">
            About Us
          </motion.span>

          <motion.h1 {...fadeUp(0.08)} className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-8">
            Built to bridge{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-[#fc362d]">
              education
            </span>
            {" "}and industry
          </motion.h1>

          <motion.p {...fadeUp(0.15)} className="text-base md:text-lg lg:text-xl text-[#636363] max-w-2xl leading-relaxed mb-12 font-medium">
            TIMS is India's leading technical internship and training management platform, combining hands-on industry programs with a centralised digital ecosystem to launch careers that matter.
          </motion.p>

          <motion.div {...fadeUp(0.22)} className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={openConsultation}
              className="relative group px-8 py-4 rounded-full font-bold text-white bg-[#fc362d] hover:bg-[#e02d25] transition-all duration-300 shadow-[0_4px_25px_rgba(252,54,45,0.25)] hover:shadow-[0_4px_35px_rgba(252,54,45,0.45)] cursor-pointer flex items-center gap-2 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Schedule a Consultation
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-[#fc362d] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
            </button>
            <Link
              to="/all-courses"
              className="px-8 py-4 rounded-full font-bold text-[#0c0407] border border-black/15 hover:border-[#fc362d] hover:bg-[#fc362d]/5 transition-all duration-300 shadow-md no-underline"
            >
              Explore Courses
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── STATS BAND ───────────────────────────────────── */}
      <section className="relative py-16 md:py-20 px-4 md:px-8 lg:px-16 bg-[#0c0407] overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[400px] h-[200px] rounded-full bg-rose-600/[0.06] blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
          {STATS.map(({ value, suffix, label, glow }, i) => (
            <motion.div key={label} {...fadeUp(i * 0.07)}
              className="flex flex-col items-center text-center"
            >
              <span className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-none mb-2">
                <Counter value={value} suffix={suffix} />
              </span>
              <span className="text-sm font-semibold text-white/50 uppercase tracking-widest">{label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── MISSION / VISION ─────────────────────────────── */}
      <section className="relative py-24 md:py-32 px-4 md:px-8 lg:px-16 bg-white overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-indigo-500/[0.03] blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <motion.span {...fadeUp(0)} className="inline-block px-3 py-1.5 rounded-full text-xs font-bold tracking-[0.2em] uppercase text-[#fc362d] bg-[#fc362d]/10 border border-[#fc362d]/20 mb-6">
              Who We Are
            </motion.span>
            <motion.h2 {...fadeUp(0.07)} className="text-3xl md:text-5xl font-extrabold text-[#0c0407] tracking-tight leading-tight mb-6">
              We bridge the gap between education and{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-[#fc362d]">
                professional excellence
              </span>
            </motion.h2>
            <motion.p {...fadeUp(0.12)} className="text-[#636363] text-base md:text-lg leading-relaxed mb-8 font-medium">
              Founded in 2014, TIMS combines industrial technical training with modern business administration systems. We utilise a centralised, state-of-the-art management ecosystem to deliver comprehensive programs in engineering, management, and human resources.
            </motion.p>
            <motion.p {...fadeUp(0.16)} className="text-[#636363] text-base leading-relaxed mb-10 font-medium">
              Our platform serves students, trainers, HR teams, and administrators through a single integrated system — enabling smarter scheduling, transparent progress tracking, and outcome-driven learning.
            </motion.p>
            <motion.div {...fadeUp(0.2)} className="flex flex-col gap-3">
              {["Industry-aligned curriculum built with practitioners", "Live project experience in every program", "Dedicated placement and career support team"].map((pt) => (
                <div key={pt} className="flex items-start gap-2.5 text-sm text-[#3a3b50]">
                  <CheckCircle className="w-4 h-4 text-[#fc362d] shrink-0 mt-0.5" />
                  <span className="font-medium">{pt}</span>
                </div>
              ))}
            </motion.div>
          </div>
          {/* Right — Mission + Vision cards */}
          <div className="flex flex-col gap-6">
            {[
              { icon: Target, label: "Our Mission", color: "text-[#fc362d]", bg: "bg-[#fc362d]/10",
                text: "To empower every student with practical, industry-ready skills by delivering structured training programs that bridge classroom theory and real enterprise execution." },
              { icon: Eye, label: "Our Vision", color: "text-indigo-500", bg: "bg-indigo-500/10",
                text: "To become India's most trusted technical training institution — where every graduate leaves with the confidence, skills, and portfolio to lead in their chosen domain." },
              { icon: Heart, label: "Our Promise", color: "text-rose-500", bg: "bg-rose-500/10",
                text: "We commit to continuous improvement, transparent outcomes, and unwavering support for every learner throughout their journey with TIMS." },
            ].map(({ icon: Icon, label, color, bg, text }, i) => (
              <motion.div key={label} {...fadeUp(i * 0.08)}
                className="relative group bg-white border border-black/[0.06] hover:border-[#fc362d]/20 rounded-3xl p-7 flex gap-5 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <div className="absolute -right-10 -top-10 w-28 h-28 rounded-full bg-transparent group-hover:bg-[#fc362d]/[0.03] blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <div className={`shrink-0 w-11 h-11 rounded-2xl ${bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0c0407] mb-2">{label}</h3>
                  <p className="text-sm text-[#636363] leading-relaxed font-medium">{text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT WE OFFER ────────────────────────────────── */}
      <section className="relative py-24 md:py-32 px-4 md:px-8 lg:px-16 overflow-hidden bg-[#fafafa]">
        <div className="absolute left-1/4 bottom-0 w-[400px] h-[400px] rounded-full bg-rose-500/[0.02] blur-[150px] pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.span {...fadeUp(0)} className="inline-block px-3 py-1.5 rounded-full text-xs font-bold tracking-[0.2em] uppercase text-[#fc362d] bg-[#fc362d]/10 border border-[#fc362d]/20 mb-6">
              What We Offer
            </motion.span>
            <motion.h2 {...fadeUp(0.07)} className="text-3xl md:text-5xl font-extrabold text-[#0c0407] tracking-tight leading-tight mb-6">
              Designing unique career pathways
            </motion.h2>
            <motion.p {...fadeUp(0.12)} className="text-[#636363] text-base md:text-lg leading-relaxed font-medium">
              Our specialised domain tracks offer a comprehensive environment to launch your professional portfolio, covering engineering, management, and beyond.
            </motion.p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {OFFERINGS.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} {...fadeUp(i * 0.08)}
                className="relative group bg-white border border-black/[0.05] hover:border-[#fc362d]/20 rounded-3xl p-8 md:p-10 flex flex-col items-start shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden cursor-default"
              >
                <div className="absolute -right-16 -top-16 w-36 h-36 rounded-full bg-transparent group-hover:bg-[#fc362d]/5 blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
                <div className="w-14 h-14 rounded-2xl bg-black/[0.02] border border-black/[0.06] group-hover:border-transparent group-hover:bg-[#fc362d]/10 text-[#0c0407] group-hover:text-[#fc362d] flex items-center justify-center mb-8 transition-all duration-500">
                  <Icon className="w-6 h-6 stroke-[1.8]" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-[#0c0407] mb-4 tracking-wide">{title}</h3>
                <p className="text-[#636363] group-hover:text-black/75 text-sm md:text-base leading-relaxed font-medium transition-colors duration-300 flex-1">{desc}</p>
                <div className="mt-8 flex items-center gap-2 text-black/40 group-hover:text-[#fc362d] text-sm font-semibold tracking-wider uppercase transition-all duration-300">
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────────── */}
      <section className="relative py-24 md:py-32 px-4 md:px-8 lg:px-16 bg-white overflow-hidden">
        <div className="absolute right-0 top-0 w-[350px] h-[350px] rounded-full bg-rose-500/[0.02] blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.span {...fadeUp(0)} className="inline-block px-3 py-1.5 rounded-full text-xs font-bold tracking-[0.2em] uppercase text-[#fc362d] bg-[#fc362d]/10 border border-[#fc362d]/20 mb-6">
              Our Values
            </motion.span>
            <motion.h2 {...fadeUp(0.07)} className="text-3xl md:text-5xl font-extrabold text-[#0c0407] tracking-tight leading-tight mb-6">
              The principles we build on
            </motion.h2>
            <motion.p {...fadeUp(0.12)} className="text-[#636363] text-base md:text-lg leading-relaxed font-medium">
              Six core beliefs that shape every decision, every program, and every interaction at TIMS.
            </motion.p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} {...fadeUp(i * 0.06)}
                className="relative group bg-white border border-black/[0.06] hover:border-[#fc362d]/20 hover:bg-[#fc362d]/[0.015] rounded-3xl p-7 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <div className="w-10 h-10 rounded-xl bg-[#fc362d]/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#fc362d]" />
                </div>
                <h3 className="text-base font-bold text-[#0c0407]">{title}</h3>
                <p className="text-sm text-[#636363] leading-relaxed font-medium">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ─────────────────────────────────────── */}
      <section className="relative py-24 md:py-32 px-4 md:px-8 lg:px-16 bg-[#fafafa] overflow-hidden">
        <div className="absolute left-0 bottom-0 w-[300px] h-[300px] rounded-full bg-indigo-500/[0.02] blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <motion.span {...fadeUp(0)} className="inline-block px-3 py-1.5 rounded-full text-xs font-bold tracking-[0.2em] uppercase text-[#fc362d] bg-[#fc362d]/10 border border-[#fc362d]/20 mb-6">
              Our Journey
            </motion.span>
            <motion.h2 {...fadeUp(0.07)} className="text-3xl md:text-5xl font-extrabold text-[#0c0407] tracking-tight leading-tight">
              A decade of impact
            </motion.h2>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-px bg-black/[0.06] md:-translate-x-px" />

            <div className="flex flex-col gap-10">
              {TIMELINE.map(({ year, title, desc }, i) => {
                const isRight = i % 2 === 0;
                return (
                  <motion.div key={year} {...fadeUp(i * 0.07)}
                    className={`relative flex items-start gap-6 md:gap-0 ${isRight ? "md:flex-row" : "md:flex-row-reverse"}`}
                  >
                    {/* Mobile / desktop dot */}
                    <div className="shrink-0 w-10 h-10 rounded-full bg-white border-2 border-[#fc362d] flex items-center justify-center z-10 shadow-md md:absolute md:left-1/2 md:-translate-x-1/2">
                      <div className="w-3 h-3 rounded-full bg-[#fc362d]" />
                    </div>

                    {/* Card — alternates sides on desktop */}
                    <div className={`flex-1 md:w-[calc(50%-40px)] ${isRight ? "md:pr-12 md:text-right md:ml-0" : "md:pl-12 md:mr-0"} pl-0 md:pl-0`}>
                      <div className="bg-white border border-black/[0.06] hover:border-[#fc362d]/20 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
                        <span className="text-xs font-bold tracking-widest uppercase text-[#fc362d] mb-2 block">{year}</span>
                        <h3 className="text-base font-bold text-[#0c0407] mb-1.5 group-hover:text-[#fc362d] transition-colors duration-200">{title}</h3>
                        <p className="text-sm text-[#636363] leading-relaxed font-medium">{desc}</p>
                      </div>
                    </div>

                    {/* Spacer for opposite side on desktop */}
                    <div className="hidden md:block flex-1" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
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
              Ready to begin your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-indigo-300">
                career journey?
              </span>
            </h2>
            <p className="text-gray-300 text-sm md:text-base lg:text-lg max-w-xl mb-12 leading-relaxed font-medium relative z-10">
              Join thousands of professionals who launched their careers with TIMS. Explore programs or schedule a one-on-one consultation with our team.
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

/* ── Export wrapped in ConsultationProvider ─────────── */
export default function AboutPage() {
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
        <AboutPageInner />
      </ReactLenis>
    </ConsultationProvider>
  );
}
