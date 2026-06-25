import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useConsultation } from "../../context/ConsultationContext";

export const CTASection = () => {
  const { openConsultation } = useConsultation();
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Smoothly subtle parallax movement for the internal glow blobs
  const glowY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <section ref={sectionRef} className="relative py-20 md:py-24 px-4 md:px-8 lg:px-16 overflow-hidden bg-white">
      {/* Light background subtle decorative ambient blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-red-100/40 blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 32 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[36px] md:rounded-[48px] shadow-2xl bg-[#0c0509] border border-white/5"
          style={{ minHeight: "420px" }}
        >
          {/* Obsidian Style Glow Layers instead of a photo */}
          <motion.div
            style={{ y: glowY }}
            className="absolute inset-0 pointer-events-none overflow-hidden"
            aria-hidden="true"
          >
            {/* Top-left ambient glow */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-rose-500/10 rounded-full blur-[100px]" />
            {/* Bottom-right ambient glow */}
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#fc362d]/10 rounded-full blur-[100px]" />
          </motion.div>

          {/* Premium Fine Grid Mesh Texture Layer */}
          <div 
            className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }}
            aria-hidden="true"
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center px-6 md:px-16 py-16 md:py-20">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="px-3 py-1.5 rounded-full text-xs font-bold tracking-[0.2em] uppercase text-rose-400 bg-rose-500/10 border border-rose-500/20 mb-6"
            >
              Get Started
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6 max-w-2xl"
            >
              Ready to launch your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-[#fc362d] to-rose-600">
                next career chapter?
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.22 }}
              className="text-zinc-400 text-sm md:text-base lg:text-lg max-w-xl mb-10 leading-relaxed font-medium"
            >
              Explore registered apprenticeships, live project programs, or schedule a one-on-one consultation with our team today.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.28 }}
              className="flex flex-col sm:flex-row items-center gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={openConsultation}
                className="relative group px-8 py-4 rounded-full font-bold text-white bg-[#fc362d] hover:bg-[#e02d25] transition-all duration-300 shadow-[0_4px_28px_rgba(252,54,45,0.3)] hover:shadow-[0_4px_38px_rgba(252,54,45,0.5)] cursor-pointer flex items-center gap-2 text-sm"
              >
                Schedule a Consultation
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.a
                whileHover={{ scale: 1.02 }}
                href="/all-courses"
                className="px-8 py-4 rounded-full font-bold text-zinc-300 border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-300 no-underline text-sm"
              >
                Browse Programs
              </motion.a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};