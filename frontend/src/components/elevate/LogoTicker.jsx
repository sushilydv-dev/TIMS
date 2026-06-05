import React from "react";
import { motion } from "framer-motion";

const LOGOS = [
  // Logo 1
  (props) => (
    <svg viewBox="0 0 160 40" fill="none" {...props}>
      <rect width="32" height="32" rx="6" fill="currentColor" fillOpacity="0.08" />
      <circle cx="16" cy="16" r="8" fill="currentColor" />
      <text x="44" y="24" fontFamily="sans-serif" fontWeight="bold" fontSize="16" fill="currentColor">
        Tech & Development
      </text>
    </svg>
  ),
  // Logo 2
  (props) => (
    <svg viewBox="0 0 160 40" fill="none" {...props}>
      <rect width="32" height="32" rx="16" fill="currentColor" fillOpacity="0.08" />
      <polygon points="16,6 26,24 6,24" fill="currentColor" />
      <text x="44" y="24" fontFamily="sans-serif" fontWeight="bold" fontSize="16" fill="currentColor">
        ApexLabs
      </text>
    </svg>
  ),
  // Logo 3
  (props) => (
    <svg viewBox="0 0 160 40" fill="none" {...props}>
      <rect width="32" height="32" rx="6" fill="currentColor" fillOpacity="0.08" />
      <rect x="8" y="8" width="16" height="16" rx="3" fill="currentColor" />
      <text x="44" y="24" fontFamily="sans-serif" fontWeight="bold" fontSize="16" fill="currentColor">
        Quantum
      </text>
    </svg>
  ),
  // Logo 4
  (props) => (
    <svg viewBox="0 0 160 40" fill="none" {...props}>
      <rect width="32" height="32" rx="6" fill="currentColor" fillOpacity="0.08" />
      <path d="M8,16 L16,8 L24,16 L16,24 Z" fill="currentColor" />
      <text x="44" y="24" fontFamily="sans-serif" fontWeight="bold" fontSize="16" fill="currentColor">
        EchoInc
      </text>
    </svg>
  ),
  // Logo 5
  (props) => (
    <svg viewBox="0 0 160 40" fill="none" {...props}>
      <rect width="32" height="32" rx="6" fill="currentColor" fillOpacity="0.08" />
      <circle cx="12" cy="16" r="5" fill="currentColor" />
      <circle cx="20" cy="16" r="5" fill="currentColor" fillOpacity="0.5" />
      <text x="44" y="24" fontFamily="sans-serif" fontWeight="bold" fontSize="16" fill="currentColor">
        Synapse
      </text>
    </svg>
  ),
  // Logo 6
  (props) => (
    <svg viewBox="0 0 160 40" fill="none" {...props}>
      <rect width="32" height="32" rx="6" fill="currentColor" fillOpacity="0.08" />
      <path d="M16,6 L26,16 L16,26 L6,16 Z" fill="currentColor" />
      <circle cx="16" cy="16" r="3" fill="#fc362d" />
      <text x="44" y="24" fontFamily="sans-serif" fontWeight="bold" fontSize="16" fill="currentColor">
        Vortex
      </text>
    </svg>
  ),
];

export const LogoTicker = () => {
  const marqueeLogos = [...LOGOS, ...LOGOS, ...LOGOS];

  return (
    <section className="py-12 border-y border-black/[0.04] bg-[#fbfbfc] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
        <p className="text-xs md:text-sm font-bold tracking-[0.2em] text-black/40 uppercase">
          Trusted by leading organisations worldwide
        </p>
      </div>

      {/* Marquee Wrapper */}
      <div className="relative w-full flex items-center justify-center overflow-hidden">
        {/* Left Gradient Cover */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#fbfbfc] to-transparent z-10 pointer-events-none" />
        
        {/* Right Gradient Cover */}
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#fbfbfc] to-transparent z-10 pointer-events-none" />

        {/* Endless Marquee Loop */}
        <motion.div
          animate={{ x: ["0%", "-33.33%"] }}
          transition={{
            ease: "linear",
            duration: 25,
            repeat: Infinity,
          }}
          className="flex gap-16 min-w-max items-center px-4"
        >
          {marqueeLogos.map((LogoComponent, idx) => (
            <div
              key={idx}
              className="w-36 h-10 text-black/30 hover:text-black/60 transition-colors duration-300 flex-shrink-0"
            >
              <LogoComponent className="w-full h-full" />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
