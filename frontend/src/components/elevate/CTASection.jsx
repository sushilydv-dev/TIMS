import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, BriefcaseBusiness, CalendarCheck, GraduationCap } from "lucide-react";
import { useConsultation } from "../../context/ConsultationContext";
import cta_background from "../../assets/cta_background.png";
const PATHWAYS = [
  { icon: GraduationCap, label: "Registered apprenticeships" },
  { icon: BriefcaseBusiness, label: "Live project programs" },
  { icon: CalendarCheck, label: "One-on-one consultation" },
];

export const CTASection = () => {
  const { openConsultation } = useConsultation();
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const accentY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section  ref={sectionRef} className="relative overflow-hidden bg-white px-4 py-20 md:px-8 md:py-28 lg:px-16">
      <motion.div
        style={{ y: accentY }}
        className="absolute inset-x-0 top-0 h-24 border-y border-[#fc362d]/10 opacity-70"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl ">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[28px] border border-black/[0.06] bg-rose-100
        shadow-[0_24px_80px_rgba(12,4,7,0.08)] "
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-70"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(252,54,45,0.12), transparent 34%), linear-gradient(90deg, rgba(255,255,255,0.88), rgba(255,255,255,0.42))",
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 grid gap-10 px-6 py-12 md:px-10 md:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-14">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-6 inline-flex rounded-full border border-[#fc362d]/20 bg-[#fc362d]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#fc362d]"
              >
                Start Today
              </motion.span>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
                className="mb-6 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-[#0c0407] md:text-5xl lg:text-6xl"
              >
                Ready to launch your next career chapter?
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.22 }}
                className="max-w-2xl text-base font-medium leading-relaxed text-[#636363] md:text-lg"
              >
                Explore registered apprenticeships, live project programs, or schedule a one-on-one consultation with our team today.
              </motion.p>
            </div>

            <div className="flex flex-col gap-6">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.26 }}
                className="grid gap-3"
              >
                {PATHWAYS.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-white/80 px-4 py-3 text-sm font-bold text-[#140d0f] shadow-sm"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fc362d]/10 text-[#fc362d]">
                      <Icon className="h-4 w-4" />
                    </span>
                    {label}
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.32 }}
                className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row"
              >
                <button
                  type="button"
                  onClick={openConsultation}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#fc362d] px-7 py-4 text-sm font-bold text-white shadow-[0_4px_28px_rgba(252,54,45,0.3)] transition-all duration-300 hover:bg-[#e02d25] hover:shadow-[0_6px_36px_rgba(252,54,45,0.45)]"
                >
                  Schedule a Consultation
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>

                <a
                  href="/all-courses"
                  className="inline-flex items-center justify-center rounded-full border border-black/12 px-7 py-4 text-sm font-bold text-[#0c0407] no-underline shadow-sm transition-all duration-300 hover:border-[#fc362d] hover:bg-white"
                >
                  Browse Programs
                </a>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
