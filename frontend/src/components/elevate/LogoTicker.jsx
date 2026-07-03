import { motion } from "framer-motion";

const CORE_PILLARS = [
  "Industrial Training", "Live Projects", "Practical Learning", 
  "Code Evaluation", "Syllabus Modules", "Technical Mentorship", 
  "Performance Tracking", "Assessment Quizzes", "Industry Standards", 
  "Project Delivery", "Hands-On Coding", "Internal Onboarding"
];

function TickerRow({ items, direction = 1, duration = 28 }) {
  const doubled = [...items, ...items];
  return (
    <div className="relative overflow-hidden w-full flex items-center">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-[#f9f9fb] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-[#f9f9fb] to-transparent z-10 pointer-events-none" />

      <motion.div
        animate={{ x: direction > 0 ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{ ease: "linear", duration, repeat: Infinity }}
        className="flex items-center gap-12 min-w-max px-8"
      >
        {doubled.map((name, i) => (
          <span
            key={i}
            className="text-sm md:text-base font-black tracking-tight text-black/20 hover:text-black/50 transition-colors duration-300 whitespace-nowrap uppercase select-none"
          >
            {name}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export const LogoTicker = () => (
  <section className="py-12 border-y border-black/[0.04] bg-[#f9f9fb] overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
      <p className="text-[0.65rem] md:text-xs font-black tracking-[0.25em] text-black/30 uppercase">
       Start your professional journey with
      </p>
    </div>
    <TickerRow items={CORE_PILLARS} direction={1}  duration={28} />
  </section>
);
