import React from "react";
import { motion } from "framer-motion";
import consultationImage from "../../assets/consultation.jpg";
import { useConsultation } from "../../context/ConsultationContext";

export const CTASection = () => {
  const { openConsultation } = useConsultation();
  return (
    <section className="relative py-24 px-4 md:px-8 lg:px-16 overflow-hidden bg-white">
      {/* Background glow layers */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-red-100 blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full ">
        {/* Banner Contrast Card - Elegant Dark Box inside a Light Page */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden bg-cover bg-center bg-no-repeat border border-white/[0.08] rounded-[40px] p-12 md:p-20 flex flex-col items-center  text-center    hover:bg-black/40  shadow-2xl" style={{ backgroundImage: `url(${consultationImage})` }}
        > 
          {/* Inner Glowing spheres */}
          <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-[#fc362d]/10 blur-[80px] pointer-events-none" />

          {/* Subtitle Badge */}
          <span className="px-3 py-1.5 rounded-full text-xs font-bold tracking-[0.2em] uppercase text-[#fc362d] bg-[#fc362d]/10 border border-[#fc362d]/20 mb-6 relative z-10">
            Get Started
          </span>

          {/* Large Headline */}
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-8 max-w-2xl relative z-10">
            
Ready to Maximize your {" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-indigo-300">
              Internship Program?
            </span>
          </h2>

          {/* Description */}
          <p className="text-gray-300 text-sm md:text-base lg:text-lg max-w-xl mb-12 leading-relaxed relative z-10 font-medium">
            Explore Registered Apprenticeships or Other Work-Based Learning Initiatives
          </p>

          {/* Action CTA Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="relative z-10"
          >
            <button
              type="button"
              onClick={openConsultation}
              className="relative group px-8 py-4 rounded-full font-bold text-white bg-[#fc362d] hover:bg-[#e02d25] transition-all duration-300 shadow-[0_4px_25px_rgba(252,54,45,0.35)] hover:shadow-[0_4px_35px_rgba(252,54,45,0.55)] cursor-pointer overflow-hidden flex items-center gap-2"
            >
              <span>Schedule A Consultation</span>
              <svg
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
