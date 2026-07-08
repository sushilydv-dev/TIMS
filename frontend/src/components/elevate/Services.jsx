import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Code, Layers, Database, Cpu, BarChart2, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import fullstack from "../../assets/fullstack.jpg";
import uiux from "../../assets/uiux.jpg";
import cloud from "../../assets/cloud.png";
import ai from "../../assets/ai.jpg"
import management from "../../assets/management.png";
import cybersecurity from "../../assets/cybersecurity.jpg"
const SERVICES = [
  {
    icon: Code,
    title: "Full-Stack Web Development",
    description: "Master both ends of the architecture. Build ultra-responsive frontends with highly secure, cloud-hosted backend systems deployed to production.",
    image: fullstack,
    trackId: "full-stack-web-development",
  },
  {
    icon: Layers,
    title: "UI/UX Architecture & Interaction",
    description: "Learn to design modern, intuitive digital layouts focused entirely on driving engagement — from wireframes to pixel-perfect production interfaces.",
    image: uiux,
    trackId: "ui-ux-architecture",
  },
  {
    icon: Database,
    title: "Cloud Infrastructure & Database",
    description: "Dive deep into relational database design, efficient backend scaling pipelines, stateful caching layers, and cloud deployment strategies.",
    image: cloud,
    trackId: "cloud-infrastructure",
  },
  {
    icon: Cpu,
    title: "AI & Machine Learning",
    description: "Understand model building, data pipelines, and practical ML workflows. Build projects that integrate intelligent features into real-world applications.",
    image: ai,
    trackId: "ai-machine-learning",
  },
  {
    icon: BarChart2,
    title: "Business & HR Management",
    description: "Structured programs in operations, talent acquisition, and business administration for aspiring management professionals entering corporates.",
    image: management,
    trackId: "business-hr-management",
  },
  {
    icon: ShieldCheck,
    title: "Cybersecurity & DevSecOps",
    description: "Learn security-first development, ethical hacking fundamentals, CI/CD hardening, and compliance practices for modern software teams.",
    image: cybersecurity,
    trackId: "cybersecurity-devsecops",
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
                className="relative group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer h-[420px]"
              >
                {/* Image Section - 75% height in static, 50% on hover */}
                <div className="absolute top-0 left-0 right-0 h-[75%] overflow-hidden transition-all duration-500 group-hover:h-[50%] z-0">
                  <img
                    src={srv.image}
                    alt={srv.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>

                {/* Icon overlay */}
                <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg z-20">
                  <Icon className="w-5 h-5 text-[#0c0407]" />
                </div>

                {/* Content Section - 25% height in static, 50% on hover */}
                <div className="absolute bottom-0 left-0 right-0 h-[25%] bg-white p-6 flex flex-col justify-between transition-all duration-500 group-hover:h-[50%] z-10">
                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-[#0c0407] mb-2 group-hover:text-black transition-colors duration-300">
                      {srv.title}
                    </h3>
                    <p className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:text-gray-600 line-clamp-3">
                      {srv.description}
                    </p>
                  </div>

                  {/* Footer with Learn More link */}
                  <div className="relative z-10 flex items-center justify-end mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    <Link
                      to={`/learn-more/${srv.trackId}`}
                      className="flex items-center gap-2 text-sm font-semibold text-[#fc362d] transition-colors duration-300 no-underline"
                    >
                      <span>Learn More</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
};
