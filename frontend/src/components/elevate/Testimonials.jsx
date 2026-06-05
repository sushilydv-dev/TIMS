import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Alumni Software Engineer",
    role: "Full-Stack Web Graduate",
    avatar: "https://framerusercontent.com/images/SGBVLdHSw2BsdL7hyXRyapVb8js.png",
    quote: "The tracking system at xox changed how I viewed software development. Every assignment had clear milestones, the trainers gave precise repository feedback, and my final code portfolio directly landed me my full-time role.",
    rating: 5,
  },
  {
    name: "Alumni UI/UX Architect",
    role: "UI/UX Design Graduate",
    avatar: "https://framerusercontent.com/images/Qim8xH67hjKAmd5sM3sdqrE.png",
    quote: "Designing intuitive user journeys and modern digital layouts at xox gave me the exact tools needed to build crisp, structural aesthetics that companies look for.",
    rating: 5,
  },
  {
    name: "Alumni Cloud Engineer",
    role: "Cloud Infrastructure Graduate",
    avatar: "https://framerusercontent.com/images/tAH3RUa9yvw33f6QnXubJ3aqQrE.png",
    quote: "The database scale and cloud deployment milestones pushed me to master serverless architecture, caching layers, and CI/CD pipelines under expert developer guidance.",
    rating: 5,
  },
  {
    name: "Alumni DevOps Specialist",
    role: "Systems Graduate",
    avatar: "https://framerusercontent.com/images/nQ7ZlW3LUqX2WBlLbzTadqZ2uo.png",
    quote: "Having a centralized, practical workspace where every single repository push was evaluated gave me the discipline to meet enterprise-level standards.",
    rating: 5,
  },
];

export const Testimonials = () => {
  return (
    <section className="relative py-24 md:py-32 px-4 md:px-8 lg:px-16 overflow-hidden bg-white">
      {/* Background glow sphere */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[450px] h-[450px] rounded-full bg-indigo-500/[0.02] blur-[150px] pointer-events-none" />

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
            Clients Testimonial
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold text-[#0c0407] tracking-tight leading-tight mb-6"
          >
            Voices of Success
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[#636363] text-base md:text-lg leading-relaxed font-medium"
          >
            Read how our comprehensive operational environment helped interns break into corporate engineering systems.
          </motion.p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="relative group bg-white border border-black/5 hover:border-black/10 rounded-3xl p-8 flex flex-col justify-between shadow-md shadow-black/[0.01] hover:shadow-xl transition-all duration-300 cursor-default"
            >
              {/* Top rating stars */}
              <div className="flex gap-0.5 mb-6">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#fc362d] stroke-[#fc362d]" />
                ))}
              </div>

              {/* Quote Text */}
              <p className="text-black/85 text-sm md:text-base leading-relaxed italic mb-8 flex-grow font-medium">
                "{t.quote}"
              </p>

              {/* Author Row */}
              <div className="flex items-center gap-4 mt-auto pt-6 border-t border-black/[0.04]">
                {/* Avatar Frame */}
                <div className="w-12 h-12 rounded-full overflow-hidden border border-black/10 bg-black/[0.02]">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    loading="lazy"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Profile info */}
                <div>
                  <h4 className="text-base font-bold text-[#0c0407] tracking-wide">
                    {t.name}
                  </h4>
                  <span className="text-xs text-black/45 font-semibold uppercase tracking-wider">
                    {t.role}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
