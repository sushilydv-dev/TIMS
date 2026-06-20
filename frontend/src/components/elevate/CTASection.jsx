import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import consultationImage from "../../assets/consultation.jpg";
import { useConsultation } from "../../context/ConsultationContext";

export const CTASection = () => {
  const { openConsultation } = useConsultation();
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  // The background image moves slightly on scroll for depth
  const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section ref={sectionRef} className="relative py-20 md:py-24 px-4 md:px-8 lg:px-16 overflow-hidden bg-white">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-red-100/60 blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 32 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[36px] md:rounded-[48px] shadow-2xl border border-white/[0.08]"
          style={{ minHeight: "420px" }}
        >
          {/* Parallax background image */}
          <motion.div
            style={{ y: bgY }}
            className="absolute inset-[-10%] bg-cover bg-center"
            aria-hidden="true"
          >
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${consultationImage})` }}
            />
          </motion.div>

          {/* Dark overlay for legibility */}
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />

          {/* Glows */}
          <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-indigo-500/15 blur-[80px] pointer-events-none" />
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-[#fc362d]/15 blur-[80px] pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center px-6 md:px-16 py-16 md:py-20">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="px-3 py-1.5 rounded-full text-xs font-bold tracking-[0.2em] uppercase text-[#fc362d] bg-[#fc362d]/15 border border-[#fc362d]/30 mb-6"
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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-indigo-300">
                next career chapter?
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.22 }}
              className="text-white/70 text-sm md:text-base lg:text-lg max-w-xl mb-10 leading-relaxed font-medium"
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
                className="relative group px-8 py-4 rounded-full font-bold text-white bg-[#fc362d] hover:bg-[#e02d25] transition-all duration-300 shadow-[0_4px_28px_rgba(252,54,45,0.4)] hover:shadow-[0_4px_38px_rgba(252,54,45,0.6)] cursor-pointer flex items-center gap-2"
              >
                Schedule a Consultation
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.a
                whileHover={{ scale: 1.02 }}
                href="/all-courses"
                className="px-8 py-4 rounded-full font-bold text-white border border-white/25 hover:border-white/60 hover:bg-white/10 transition-all duration-300 no-underline text-sm"
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
