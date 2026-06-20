import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Code, Layers, Database, Cpu, BarChart2, ShieldCheck } from "lucide-react";

const SERVICES = [
  {
    icon: Code,
    title: "Full-Stack Web Development",
    description: "Master both ends of the architecture. Build ultra-responsive frontends with highly secure, cloud-hosted backend systems deployed to production.",
    accent: "group-hover:bg-[#fc362d]/5",
    border: "group-hover:border-[#fc362d]/25",
    iconHover: "group-hover:bg-[#fc362d]/10 group-hover:text-[#fc362d]",
  },
  {
    icon: Layers,
    title: "UI/UX Architecture & Interaction",
    description: "Learn to design modern, intuitive digital layouts focused entirely on driving engagement — from wireframes to pixel-perfect production interfaces.",
    accent: "group-hover:bg-indigo-500/5",
    border: "group-hover:border-indigo-500/25",
    iconHover: "group-hover:bg-indigo-500/10 group-hover:text-indigo-500",
  },
  {
    icon: Database,
    title: "Cloud Infrastructure & Database",
    description: "Dive deep into relational database design, efficient backend scaling pipelines, stateful caching layers, and cloud deployment strategies.",
    accent: "group-hover:bg-rose-500/5",
    border: "group-hover:border-rose-500/25",
    iconHover: "group-hover:bg-rose-500/10 group-hover:text-rose-500",
  },
  {
    icon: Cpu,
    title: "AI & Machine Learning Fundamentals",
    description: "Understand model building, data pipelines, and practical ML workflows. Build projects that integrate intelligent features into real-world applications.",
    accent: "group-hover:bg-violet-500/5",
    border: "group-hover:border-violet-500/25",
    iconHover: "group-hover:bg-violet-500/10 group-hover:text-violet-500",
  },
  {
    icon: BarChart2,
    title: "Business & HR Management",
    description: "Structured programs in operations, talent acquisition, and business administration for aspiring management professionals entering corporates.",
    accent: "group-hover:bg-amber-500/5",
    border: "group-hover:border-amber-500/25",
    iconHover: "group-hover:bg-amber-500/10 group-hover:text-amber-500",
  },
  {
    icon: ShieldCheck,
    title: "Cybersecurity & DevSecOps",
    description: "Learn security-first development, ethical hacking fundamentals, CI/CD hardening, and compliance practices for modern software teams.",
    accent: "group-hover:bg-emerald-500/5",
    border: "group-hover:border-emerald-500/25",
    iconHover: "group-hover:bg-emerald-500/10 group-hover:text-emerald-500",
  },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const cardItem = {
  hidden: { opacity: 0, y: 36 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

export const Services = () => {
  const sectionRef = useRef(null);
  const headRef    = useRef(null);
  const gridRef    = useRef(null);

  const headInView = useInView(headRef, { once: true, margin: "-80px" });
  const gridInView = useInView(gridRef, { once: true, margin: "-60px" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32 px-4 md:px-8 lg:px-16 overflow-hidden bg-[#fafafa]">
      <motion.div
        style={{ y: bgY }}
        className="absolute left-1/4 bottom-0 w-[500px] h-[500px] rounded-full bg-rose-500/[0.025] blur-[160px] pointer-events-none"
      />
      <motion.div
        style={{ y: bgY }}
        className="absolute right-0 top-0 w-[350px] h-[350px] rounded-full bg-indigo-500/[0.02] blur-[120px] pointer-events-none"
      />

      <div className="max-w-7xl mx-auto flex flex-col items-center">

        {/* Header */}
        <motion.div
          ref={headRef}
          variants={stagger}
          initial="hidden"
          animate={headInView ? "show" : "hidden"}
          className="text-center max-w-3xl mb-16 flex flex-col items-center"
        >
          <motion.span variants={cardItem} className="px-3 py-1.5 rounded-full text-xs font-bold tracking-[0.2em] uppercase text-[#fc362d] bg-[#fc362d]/10 border border-[#fc362d]/20 mb-6">
            Our Programs
          </motion.span>
          <motion.h2 variants={cardItem} className="text-3xl md:text-5xl font-extrabold text-[#0c0407] tracking-tight leading-tight mb-6">
            Designing unique career pathways
          </motion.h2>
          <motion.p variants={cardItem} className="text-[#636363] text-base md:text-lg leading-relaxed font-medium">
            Six specialised domain tracks — each built with industry practitioners to ensure graduates are immediately productive contributors in modern teams.
          </motion.p>
        </motion.div>

        {/* Grid */}
        <motion.div
          ref={gridRef}
          variants={stagger}
          initial="hidden"
          animate={gridInView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
        >
          {SERVICES.map((srv) => {
            const Icon = srv.icon;
            return (
              <motion.div
                key={srv.title}
                variants={cardItem}
                className={`relative group bg-white border border-black/[0.06] ${srv.border} rounded-3xl p-8 flex flex-col items-start shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden cursor-default`}
              >
                <div className={`absolute -right-14 -top-14 w-32 h-32 rounded-full bg-transparent ${srv.accent} blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700`} />

                <div className={`w-12 h-12 rounded-2xl bg-black/[0.03] border border-black/[0.07] ${srv.iconHover} text-[#0c0407] flex items-center justify-center mb-7 transition-all duration-400`}>
                  <Icon className="w-5 h-5 stroke-[1.8]" />
                </div>

                <h3 className="text-lg font-bold text-[#0c0407] mb-3 tracking-wide leading-snug">
                  {srv.title}
                </h3>

                <p className="text-[#636363] group-hover:text-black/75 text-sm leading-relaxed transition-colors duration-300 font-medium flex-1">
                  {srv.description}
                </p>

                <div className="mt-7 flex items-center gap-2 text-black/35 group-hover:text-[#fc362d] text-xs font-bold tracking-wider uppercase transition-all duration-300">
                  <span>Learn More</span>
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
};
