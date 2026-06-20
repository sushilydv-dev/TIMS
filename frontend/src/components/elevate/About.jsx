import { useEffect, useState, useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useConsultation } from "../../context/ConsultationContext";

/* ── Animated counter ────────────────────────────────── */
function Counter({ value, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const total = 72;
    const inc = value / total;
    const t = setInterval(() => {
      frame++;
      if (frame >= total) { clearInterval(t); setCount(value); }
      else setCount(Math.round(inc * frame));
    }, 1400 / total);
    return () => clearInterval(t);
  }, [inView, value]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const STATS = [
  { value: 50,  suffix: "K+", label: "Students Trained",    desc: "Across all programs since 2014",        glow: "bg-[#fc362d]/5" },
  { value: 10,  suffix: "+",  label: "Years of Excellence", desc: "A decade of industry-aligned education", glow: "bg-indigo-500/5" },
  { value: 98,  suffix: "%",  label: "Placement Rate",      desc: "Of graduates enter their chosen field",  glow: "bg-rose-500/5" },
  { value: 120, suffix: "+",  label: "Industry Partners",   desc: "Companies that hire TIMS graduates",     glow: "bg-emerald-500/5" },
];

const POINTS = [
  "Industry-aligned curriculum built with practitioners",
  "Live project experience in every program",
  "Dedicated placement and career support team",
  "Certified outcomes recognised by top employers",
];

/* ── Stagger container ────────────────────────────────── */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export const About = () => {
  const { openConsultation } = useConsultation();
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  const leftRef  = useRef(null);
  const rightRef = useRef(null);
  const leftInView  = useInView(leftRef,  { once: true, margin: "-80px" });
  const rightInView = useInView(rightRef, { once: true, margin: "-80px" });

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32 px-4 md:px-8 lg:px-16 overflow-hidden bg-white">
      {/* Parallax ambient blob */}
      <motion.div
        style={{ y: bgY }}
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-indigo-500/[0.03] blur-[130px] pointer-events-none"
      />
      <motion.div
        style={{ y: bgY }}
        className="absolute -left-20 bottom-0 w-[300px] h-[300px] rounded-full bg-rose-500/[0.02] blur-[120px] pointer-events-none"
      />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

        {/* ── Left ── */}
        <motion.div
          ref={leftRef}
          variants={stagger}
          initial="hidden"
          animate={leftInView ? "show" : "hidden"}
          className="lg:col-span-6 flex flex-col items-start"
        >
          <motion.span variants={item} className="px-3 py-1.5 rounded-full text-xs font-bold tracking-[0.2em] uppercase text-[#fc362d] bg-[#fc362d]/10 border border-[#fc362d]/20 mb-6">
            About TIMS
          </motion.span>

          <motion.h2 variants={item} className="text-3xl md:text-5xl font-extrabold text-[#0c0407] tracking-tight leading-tight mb-6">
            We bridge the gap between education and{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-[#fc362d]">
              professional excellence
            </span>
          </motion.h2>

          <motion.p variants={item} className="text-[#636363] text-base md:text-lg leading-relaxed mb-8 font-medium">
            Founded in 2014, TIMS combines industrial technical training with modern business administration systems — delivering comprehensive programs in engineering, management, and human resources through a centralised, outcome-focused management ecosystem.
          </motion.p>

          <motion.div variants={stagger} className="flex flex-col gap-3 mb-10">
            {POINTS.map((pt) => (
              <motion.div key={pt} variants={item} className="flex items-start gap-2.5 text-sm text-[#3a3b50]">
                <CheckCircle className="w-4 h-4 text-[#fc362d] shrink-0 mt-0.5" />
                <span className="font-medium">{pt}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.button
            variants={item}
            type="button"
            onClick={openConsultation}
            className="px-6 py-3.5 rounded-full font-bold text-[#0c0407] border border-black/15 hover:border-[#fc362d] hover:bg-[#fc362d]/5 transition-all duration-300 shadow-sm cursor-pointer"
          >
            Get Started Today
          </motion.button>
        </motion.div>

        {/* ── Right — stat cards ── */}
        <motion.div
          ref={rightRef}
          variants={stagger}
          initial="hidden"
          animate={rightInView ? "show" : "hidden"}
          className="lg:col-span-6 grid grid-cols-2 gap-5"
        >
          {STATS.map(({ value, suffix, label, desc, glow }) => (
            <motion.div
              key={label}
              variants={item}
              className={`relative overflow-hidden group bg-white border border-black/[0.06] hover:border-[#fc362d]/20 rounded-3xl p-6 md:p-7 flex flex-col items-start shadow-sm hover:shadow-md transition-all duration-300`}
            >
              <div className={`absolute -right-6 -top-6 w-20 h-20 rounded-full ${glow} blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <span className="text-4xl md:text-5xl font-extrabold text-[#0c0407] tracking-tight leading-none mb-2">
                <Counter value={value} suffix={suffix} />
              </span>
              <span className="text-sm font-bold text-[#0c0407] mb-1">{label}</span>
              <span className="text-xs text-[#94a3b8] font-medium leading-snug">{desc}</span>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};
