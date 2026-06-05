import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import landingimage from "../../assets/landing.jpg";
import { useConsultation } from "../../context/ConsultationContext";

export const Hero = () => {
  const { openConsultation } = useConsultation();
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 md:px-8 lg:px-16 pt-32 pb-20 overflow-hidden bg-red-500border-amber-50">
      
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full bg-rose-500/[0.03] blur-[100px] md:blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-indigo-500/[0.02] blur-[100px] pointer-events-none z-0" />

      {/* Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        {/* Rating Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/[0.03] border border-black/5 shadow-md mb-8"
        >
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-4 h-4 fill-[#fc362d] stroke-[#fc362d]"
              />
            ))}
          </div>
          <span className="text-black/60 text-xs md:text-sm font-medium tracking-wide">
            4.5/5 Stars
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-black/10 mx-1" />
          <span className="text-black/85 text-xs md:text-sm font-semibold tracking-wide">
            Trusted by 50K+ Happy Clients & Alumni
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] md:leading-[1.05] mb-8  w-[80vw]"
        >
          <span className="text-bold">
            Elevate Your Professional Career with TIMS
          </span>
        </motion.h1>

        {/* Subdescription */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-base md:text-lg lg:text-xl text-[#636363] max-w-2xl leading-relaxed mb-12 font-medium"
        >
          We partner with ambitious individuals to bridge the gap between classroom theory and enterprise-level execution. Access a centralized, practical ecosystem designed to launch you directly into the digital tech landscape.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <button className="relative group px-8 py-4 rounded-full font-bold text-white bg-[#fc362d] hover:bg-[#e02d25] transition-all duration-300 shadow-[0_4px_25px_rgba(252,54,45,0.25)] hover:shadow-[0_4px_35px_rgba(252,54,45,0.45)] cursor-pointer flex items-center justify-center overflow-hidden">
            <span className="relative z-10 flex items-center gap-2">
              Explore Courses
              <svg
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </span>
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-rose-500 to-[#fc362d] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0 "></div>
          </button>
          <button
            type="button"
            onClick={openConsultation}
            className="px-8 py-4 rounded-full font-bold text-[#0c0407] border border-black/15 hover:border-[#fc362d] hover:bg-[#fc362d]/5 transition-all duration-300 shadow-md cursor-pointer"
          >
            Schedule a Consultation
          </button>
        </motion.div>
      </div>
      <div className="h-[30rem] w-[80%] relative top-12 rounded-[40px] overflow-hidden group">
  {/* The Background Image Layer */}
  <div
    className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out group-hover:scale-[1.3]"
    style={{ backgroundImage: `url(${landingimage})` }}
  />

  {/* The Darkening Layer (Applies a dark overlay on hover) */}
  <div className="absolute inset-0 bg-black/0 transition-all duration-500 ease-out group-hover:bg-black/40 pointer-events-none" />

  {/* Your content goes here (Guaranteed to stay on top of the dark layer) */}
  <div className="relative z-10 h-full w-full flex items-center justify-center">
    {/* e.g., <YourCardContent /> */}
  </div>
</div>
    </section>
  );
};
