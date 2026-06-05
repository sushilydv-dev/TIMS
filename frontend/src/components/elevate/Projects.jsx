import React from "react";
import { motion } from "framer-motion";

const PROJECTS = [
  {
    title: "Enterprise Training & Internship Management System (TIMS)",
    category: "Next.js / Node.js / PostgreSQL",
    image: "https://framerusercontent.com/images/aBLtU3JBT9i1aByojRBIr7a9ko4.jpg",
    description: "Production-ready tracking and collaboration ecosystem designed to launch you directly into the digital tech landscape.",
  },
  {
    title: "NeuroVault — AI-Powered Knowledge Management Portal",
    category: "React / Tailwind CSS / Vector Indexes",
    image: "https://framerusercontent.com/images/DVkVo3ZjfsNK9xfMChlkzmq3fW8.png",
    description: "A secure repository featuring semantic search capabilities and high-performance interactive dashboard layouts.",
  },
];

export const Projects = () => {
  return (
    <section className="relative py-24 md:py-32 px-4 md:px-8 lg:px-16 overflow-hidden bg-white">
      {/* Ambient background light */}
      <div className="absolute right-1/4 top-1/3 w-[350px] h-[350px] rounded-full bg-indigo-500/[0.02] blur-[150px] pointer-events-none" />

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
            Recent Projects
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold text-[#0c0407] tracking-tight leading-tight mb-6"
          >
            Portfolios built in the Ecosystem
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[#636363] text-base md:text-lg leading-relaxed font-medium"
          >
            Your vision, our infrastructure. Look through real, high-performance web products fully authored and launched by our recent active trainees.
          </motion.p>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full mb-16">
          {PROJECTS.map((proj, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 45 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: idx * 0.15 }}
              className="group cursor-pointer flex flex-col"
            >
              {/* Image Frame with overflow hidden */}
              <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden bg-black/[0.01] border border-black/5 mb-6 shadow-md shadow-black/[0.01] transition-all duration-500">
                {/* Image */}
                <img
                  src={proj.image}
                  alt={proj.title}
                  loading="lazy"
                  className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Soft gradient filter */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-65 group-hover:opacity-10 transition-opacity duration-500" />

                {/* Info Overlay (visible on hover) - Clean Light Glassmorphic Style */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 bg-white/95 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-xs font-semibold text-[#fc362d] uppercase tracking-[0.2em] mb-2">
                    {proj.category}
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold text-[#0c0407] mb-2">
                    {proj.title}
                  </h3>
                  <p className="text-xs md:text-sm text-[#636363] leading-relaxed max-w-sm font-medium">
                    {proj.description}
                  </p>
                </div>
              </div>

              {/* Standard text visible when not hovered */}
              <div className="flex items-center justify-between px-2 group-hover:translate-x-1 transition-transform duration-300">
                <div>
                  <h4 className="text-xl font-bold text-[#0c0407] tracking-wide">
                    {proj.title}
                  </h4>
                  <span className="text-xs font-semibold text-black/45 tracking-wider uppercase font-mono">
                    {proj.category}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full border border-black/10 group-hover:border-[#fc362d] group-hover:bg-[#fc362d] group-hover:text-white text-black/60 flex items-center justify-center transition-all duration-300 shadow-sm">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <button className="px-8 py-3.5 rounded-full font-bold text-white bg-[#fc362d] hover:bg-[#e02d25] transition-all duration-300 shadow-[0_4px_25px_rgba(252,54,45,0.2)] cursor-pointer">
            All Projects
          </button>
        </motion.div>
      </div>
    </section>
  );
};
