import React from "react";
import { motion } from "framer-motion";
import { Monitor, Code, Layers, Sparkles, Database } from "lucide-react";

const SERVICES = [
  {
    icon: Code,
    title: "Full-Stack Web Development",
    description: "Master both ends of the architecture. Build ultra-responsive frontends combined with highly secure cloud-hosted server applications.",
    glow: "group-hover:bg-[#fc362d]/5",
    border: "group-hover:border-[#fc362d]/20",
  },
  {
    icon: Layers,
    title: "UI/UX Architecture & Interaction",
    description: "Learn to draft modern, intuitive digital layouts focused entirely on driving engagement and crisp structural aesthetics.",
    glow: "group-hover:bg-indigo-500/5",
    border: "group-hover:border-indigo-500/20",
  },
  {
    icon: Database,
    title: "Cloud Infrastructure & Database Services",
    description: "Dive deep into relational database design, efficient backend scaling pipelines, and stateful caching layers.",
    glow: "group-hover:bg-rose-500/5",
    border: "group-hover:border-rose-500/20",
  },
   {
    icon: Layers,
    title: "UI/UX Architecture & Interaction",
    description: "Learn to draft modern, intuitive digital layouts focused entirely on driving engagement and crisp structural aesthetics.",
    glow: "group-hover:bg-indigo-500/5",
    border: "group-hover:border-indigo-500/20",
  },
  {
    icon: Database,
    title: "Cloud Infrastructure & Database Services",
    description: "Dive deep into relational database design, efficient backend scaling pipelines, and stateful caching layers.",
    glow: "group-hover:bg-rose-500/5",
    border: "group-hover:border-rose-500/20",
  },
];

export const Services = () => {
  return (
    <section className="relative py-24 md:py-32 px-4 md:px-8 lg:px-16 overflow-hidden bg-white">
      
      <div className="absolute left-1/4 bottom-0 w-[400px] h-[400px] rounded-full bg-rose-500/[0.02] blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Section Header */}
        <div className="text-center max-w-3xl mb-20 flex flex-col items-center">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="px-3 py-1.5 rounded-full text-xs font-bold tracking-[0.2em] uppercase text-[#fc362d] bg-[#fc362d]/10 border border-[#fc362d]/20 mb-6"
          >
            Our Services
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold text-[#0c0407] tracking-tight leading-tight mb-6"
          >
            Designing Unique Career Pathways
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[#636363] text-base md:text-lg leading-relaxed font-medium"
          >
            Our specialized domain tracks offer a comprehensive environment to launch your professional portfolio, covering everything 
          </motion.p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {SERVICES.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className={`relative group bg-white border border-black/5 ${srv.border} rounded-3xl p-8 md:p-10 flex flex-col items-start shadow-md shadow-black/[0.01] hover:shadow-xl transition-all duration-500 overflow-hidden cursor-default`}
              >
                {/* Accent Glow Backing */}
                <div className={`absolute -right-16 -top-16 w-36 h-36 rounded-full bg-transparent ${srv.glow} blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700`} />

                {/* Service Icon Container */}
                <div className="w-14 h-14 rounded-2xl bg-black/[0.02] border border-black/[0.06] group-hover:border-transparent group-hover:bg-[#fc362d]/10 group-hover:text-[#fc362d] text-[#0c0407] flex items-center justify-center mb-8 transition-all duration-500">
                  <Icon className="w-6 h-6 stroke-[1.8]" />
                </div>

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-bold text-[#0c0407] mb-4 tracking-wide group-hover:text-black transition-colors duration-300">
                  {srv.title}
                </h3>

                {/* Description */}
                <p className="text-[#636363] group-hover:text-black/75 text-sm md:text-base leading-relaxed transition-colors duration-300 font-medium">
                  {srv.description}
                </p>

                {/* Hover indicator (underlined arrow) */}
                <div className="mt-8 flex items-center gap-2 text-black/40 group-hover:text-[#fc362d] text-sm font-semibold tracking-wider uppercase transition-all duration-300">
                  <span>Learn More</span>
                  <svg
                    className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
