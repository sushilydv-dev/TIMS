import React, { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useConsultation } from "../../context/ConsultationContext";

const Counter = ({ value, duration = 1.5 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = value;
    if (start === end) return;

    const totalFrames = 60;
    const frameDuration = (duration * 1000) / totalFrames;
    const increment = end / totalFrames;

    let frame = 0;
    const timer = setInterval(() => {
      frame++;
      const current = Math.round(increment * frame);
      if (frame >= totalFrames) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(current);
      }
    }, frameDuration);

    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  return <span ref={ref}>{count}</span>;
};

export const About = () => {
  const { openConsultation } = useConsultation();

  return (
    <section className="relative py-24 md:py-32 px-4 md:px-8 lg:px-16 overflow-hidden bg-white">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-indigo-500/[0.03] blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 items-center">
        {/* Left Column: Context Info */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-6 flex flex-col items-start"
        >
          <span className="px-3 py-1.5 rounded-full text-xs font-bold tracking-[0.2em] uppercase text-[#fc362d] bg-[#fc362d]/10 border border-[#fc362d]/20 mb-6">
            About Us
          </span>

          <h2 className="text-3xl md:text-5xl font-extrabold text-[#0c0407] tracking-tight leading-tight mb-6">
            We bridge the gap between education and{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-[#fc362d] ">
              professional excellence
            </span>
          </h2>

          <p className="text-[#636363] text-base md:text-lg leading-relaxed mb-10 font-medium">
            We combine industrial technical training with modern business
            administration systems, utilizing a centralized, state-of-the-art
            management ecosystem to deliver comprehensive programs in
            engineering, management, and human resources. 
          </p>

          <button
            type="button"
            onClick={openConsultation}
            className="px-6 py-3.5 rounded-full font-bold text-[#0c0407] border border-black/15 hover:border-[#fc362d] hover:bg-[#fc362d]/5 transition-all duration-300 shadow-md cursor-pointer"
          >
            Get Started
          </button>
        </motion.div>

        {/* Right Column: Statistics Grid */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-6 w-full">
          {/* Projects Completed Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative overflow-hidden group bg-white hover:bg-[#fbfbfc] border border-black/5 hover:border-black/10 rounded-3xl p-8 flex flex-col items-start shadow-md shadow-black/[0.01] hover:shadow-lg transition-all duration-300"
          >
            <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-[#fc362d]/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="text-5xl md:text-6xl font-extrabold text-[#0c0407] tracking-tight leading-none mb-3">
              <Counter value={250} />+
            </span>
            <span className="text-sm font-bold tracking-wide text-black/45 group-hover:text-black/75 transition-colors duration-300 mb-2">
              Projects Completed
            </span>
           
          </motion.div>

          {/* Years of Experience Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative overflow-hidden group bg-white hover:bg-[#fbfbfc] border border-black/5 hover:border-black/10 rounded-3xl p-8 flex flex-col items-start shadow-md shadow-black/[0.01] hover:shadow-lg transition-all duration-300"
          >
            <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-indigo-500/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="text-5xl md:text-6xl font-extrabold text-[#0c0407] tracking-tight leading-none mb-3">
              <Counter value={10} />+
            </span>
            <span className="text-sm font-bold tracking-wide text-black/45 group-hover:text-black/75 transition-colors duration-300 mb-2">
              Years of Experience
            </span>
           
          </motion.div>

          {/* Client Satisfaction Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative overflow-hidden group bg-white hover:bg-[#fbfbfc] border border-black/5 hover:border-black/10 rounded-3xl p-8 flex flex-col items-start shadow-md shadow-black/[0.01] hover:shadow-lg transition-all duration-300"
          >
            <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-rose-500/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="text-5xl md:text-6xl font-extrabold text-[#0c0407] tracking-tight leading-none mb-3">
              <Counter value={99} />%
            </span>
            <span className="text-sm font-bold tracking-wide text-black/45 group-hover:text-black/75 transition-colors duration-300 mb-2">
              Student Satisfaction
            </span>
          
          </motion.div>
        </div>
      </div>
    </section>
  );
};
