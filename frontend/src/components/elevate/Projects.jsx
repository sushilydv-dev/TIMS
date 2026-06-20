import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";

const PROJECTS = [
  {
    title: "FinTrack Pro — Enterprise Finance Dashboard",
    category: "React · Node.js · PostgreSQL",
    image: "https://framerusercontent.com/images/aBLtU3JBT9i1aByojRBIr7a9ko4.jpg",
    description: "A real-time financial analytics platform built during the Full-Stack program. Live data visualisation, role-based access control, and audit logging deployed on AWS.",
  },
  {
    title: "NeuroVault — AI Knowledge Portal",
    category: "Next.js · Python · Vector Search",
    image: "https://framerusercontent.com/images/DVkVo3ZjfsNK9xfMChlkzmq3fW8.png",
    description: "Semantic document search portal with AI-powered retrieval built by Cloud & AI track graduates. Handles 10K+ queries/day in production.",
  },
  {
    title: "ShiftOS — HR Management System",
    category: "React · Express · MySQL",
    image: "https://framerusercontent.com/images/aBLtU3JBT9i1aByojRBIr7a9ko4.jpg",
    description: "End-to-end HR workflow automation including recruitment pipelines, attendance tracking, and payroll — delivered by Management track trainees.",
  },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13 } },
};
const cardItem = {
  hidden: { opacity: 0, y: 40 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export const Projects = () => {
  const sectionRef = useRef(null);
  const headRef    = useRef(null);
  const gridRef    = useRef(null);

  const headInView = useInView(headRef, { once: true, margin: "-80px" });
  const gridInView = useInView(gridRef, { once: true, margin: "-60px" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <section ref={sectionRef} className="relative py-24 md:py-32 px-4 md:px-8 lg:px-16 overflow-hidden bg-white">
      <motion.div
        style={{ y: bgY }}
        className="absolute right-1/4 top-1/3 w-[400px] h-[400px] rounded-full bg-indigo-500/[0.025] blur-[150px] pointer-events-none"
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
            Trainee Projects
          </motion.span>
          <motion.h2 variants={cardItem} className="text-3xl md:text-5xl font-extrabold text-[#0c0407] tracking-tight leading-tight mb-6">
            Portfolios built in the ecosystem
          </motion.h2>
          <motion.p variants={cardItem} className="text-[#636363] text-base md:text-lg leading-relaxed font-medium">
            Real, high-performance products authored and deployed by our active trainees — every project ships to production.
          </motion.p>
        </motion.div>

        {/* Grid */}
        <motion.div
          ref={gridRef}
          variants={stagger}
          initial="hidden"
          animate={gridInView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full mb-14"
        >
          {PROJECTS.map((proj) => (
            <motion.div
              key={proj.title}
              variants={cardItem}
              className="group cursor-pointer flex flex-col"
            >
              {/* Image card */}
              <div className="relative aspect-[4/3] rounded-[28px] overflow-hidden border border-black/[0.06] mb-5 shadow-sm hover:shadow-xl transition-shadow duration-500">
                <img
                  src={proj.image}
                  alt={proj.title}
                  loading="lazy"
                  className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-70 group-hover:opacity-10 transition-opacity duration-500" />

                {/* Hover overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 bg-white/96 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-[0.65rem] font-bold text-[#fc362d] uppercase tracking-[0.18em] mb-2">{proj.category}</span>
                  <h3 className="text-base font-bold text-[#0c0407] mb-2 leading-snug">{proj.title}</h3>
                  <p className="text-xs text-[#636363] leading-relaxed font-medium">{proj.description}</p>
                </div>
              </div>

              {/* Title row */}
              <div className="flex items-start justify-between gap-3 px-1 group-hover:translate-x-1 transition-transform duration-300">
                <div className="min-w-0">
                  <h4 className="text-base font-bold text-[#0c0407] leading-snug truncate">{proj.title}</h4>
                  <span className="text-[0.65rem] font-semibold text-[#94a3b8] tracking-wider uppercase">{proj.category}</span>
                </div>
                <div className="w-9 h-9 rounded-full border border-black/[0.08] group-hover:border-[#fc362d] group-hover:bg-[#fc362d] group-hover:text-white text-black/50 flex items-center justify-center transition-all duration-300 shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <Link
            to="/all-courses"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-white bg-[#fc362d] hover:bg-[#e02d25] transition-all duration-300 shadow-[0_4px_20px_rgba(252,54,45,0.2)] hover:shadow-[0_4px_30px_rgba(252,54,45,0.35)] no-underline group"
          >
            Explore All Programs
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
};
