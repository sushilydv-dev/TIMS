import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ReactLenis } from "lenis/react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/elevate/Footer";
import { ConsultationProvider, useConsultation } from "../context/ConsultationContext";

/* ── helpers ─────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

function ContactPageInner() {
  const { openConsultation } = useConsultation();

  return (
    <div className="bg-white min-h-screen font-['Inter',system-ui,sans-serif] text-[#0c0407] overflow-x-hidden">
      {/* Fixed navbar */}
      <div className="fixed top-0 left-0 w-full z-20">
        <Navbar />
      </div>

      {/* ── HERO HEADER ─────────────────────────────────────── */}
      <section className="relative min-h-[45vh] flex flex-col items-center justify-center text-center px-4 md:px-8 lg:px-16 pt-36 pb-16 overflow-hidden bg-white">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-rose-500/[0.03] blur-[150px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] rounded-full bg-indigo-500/[0.02] blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <motion.span
            {...fadeUp(0)}
            className="px-3 py-1.5 rounded-full text-xs font-bold tracking-[0.2em] uppercase text-[#fc362d] bg-[#fc362d]/10 border border-[#fc362d]/20 mb-6"
          >
            Get In Touch
          </motion.span>

          <motion.h1
            {...fadeUp(0.08)}
            className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.08] mb-6"
          >
            We'd love to hear{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-[#fc362d]">
              from you
            </span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.15)}
            className="text-base md:text-lg text-[#636363] max-w-xl leading-relaxed font-medium"
          >
            Have a question about our courses, partnerships, or internships? Reach out directly to our team or book a scheduled appointment.
          </motion.p>
        </div>
      </section>

      {/* ── CONTACT GRID ────────────────────────────────────── */}
      <section className="relative py-12 md:py-20 px-4 md:px-8 lg:px-16 bg-white overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-indigo-500/[0.03] blur-[120px] pointer-events-none" />
        <div className="absolute left-0 bottom-0 w-[300px] h-[300px] rounded-full bg-rose-500/[0.02] blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
          {/* Left Column: Contact Cards */}
          <div className="lg:col-span-5 flex flex-col justify-start space-y-6">
            <motion.h2
              {...fadeUp(0)}
              className="text-2xl md:text-3xl font-extrabold text-[#0c0407] tracking-tight mb-2"
            >
              Contact Information
            </motion.h2>
            <motion.p
              {...fadeUp(0.05)}
              className="text-[#636363] text-sm md:text-base leading-relaxed mb-6 font-medium"
            >
              Find us at our offices or contact us via email or phone. Our support team is ready to answer your questions during regular hours.
            </motion.p>

            <div className="space-y-4">
              {[
                {
                  icon: Phone,
                  title: "Call Us",
                  details: ["+91 98765 43210", "+91 98765 01234"],
                  color: "text-[#fc362d]",
                  bg: "bg-[#fc362d]/10",
                },
                {
                  icon: Mail,
                  title: "Email Us",
                  details: ["info@msai.in", "admissions@msai.in"],
                  color: "text-indigo-500",
                  bg: "bg-indigo-500/10",
                },
                {
                  icon: MapPin,
                  title: "Our Address",
                  details: [
                    "4th Floor, Innovation Hub, Outer Ring Road",
                    "Bengaluru, Karnataka 560103, India",
                  ],
                  color: "text-rose-500",
                  bg: "bg-rose-500/10",
                },
                {
                  icon: Clock,
                  title: "Working Hours",
                  details: [
                    "Mon – Sat: 9:00 AM – 6:00 PM",
                    "Sunday: Closed",
                  ],
                  color: "text-emerald-500",
                  bg: "bg-emerald-500/10",
                },
              ].map(({ icon: Icon, title, details, color, bg }, i) => (
                <motion.div
                  key={title}
                  {...fadeUp(i * 0.08)}
                  className="relative group bg-white border border-black/[0.06] hover:border-[#fc362d]/20 rounded-3xl p-6 flex gap-5 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute -right-10 -top-10 w-24 h-24 rounded-full bg-transparent group-hover:bg-[#fc362d]/[0.02] blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  <div className={`shrink-0 w-12 h-12 rounded-2xl ${bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0c0407] mb-1.5">{title}</h3>
                    {details.map((line, idx) => (
                      <p key={idx} className="text-sm text-[#636363] leading-relaxed font-semibold">
                        {line}
                      </p>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column: Book Appointment CTA */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <motion.div
              {...fadeUp(0.1)}
              className="relative overflow-hidden bg-[#0c0407] border border-white/[0.08] rounded-[32px] p-8 md:p-12 flex flex-col items-center md:items-start text-center md:text-left shadow-xl"
            >
              {/* Background soft glowing lights */}
              <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />
              <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-[#fc362d]/10 blur-[80px] pointer-events-none" />

              <span className="px-3 py-1.5 rounded-full text-xs font-bold tracking-[0.2em] uppercase text-[#fc362d] bg-[#fc362d]/10 border border-[#fc362d]/20 mb-6 relative z-10">
                Book a Slot
              </span>

              <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4 relative z-10 animate-pulse">
                Ready to speak with our{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-[#fc362d]">
                  advisors?
                </span>
              </h2>

              <p className="text-gray-300 text-sm md:text-base mb-8 leading-relaxed font-medium relative z-10 max-w-lg">
                Schedule a one-on-one consultation with our academic advisors and trainers. We can discuss your career goals, course details, syllabus modules, or placement procedures.
              </p>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative z-10 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={openConsultation}
                  className="w-full sm:w-auto relative group px-8 py-4 rounded-full font-bold text-white bg-[#fc362d] hover:bg-[#e02d25] transition-all duration-300 shadow-[0_4px_25px_rgba(252,54,45,0.35)] hover:shadow-[0_4px_35px_rgba(252,54,45,0.55)] cursor-pointer flex items-center justify-center gap-2"
                >
                  Book an Appointment
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function ContactPage() {
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
        <ContactPageInner />
      </ReactLenis>
    </ConsultationProvider>
  );
}
