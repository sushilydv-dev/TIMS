import React, { useEffect, useState } from "react";
import launchcareer from "../../assets/launchcareer.jpg";
import industryexpert from "../../assets/industryexpert.jpg";
import track from "../../assets/track.jpg";
import tailored from "../../assets/tailored.jpeg";
const SLIDES = [
  {
    image: launchcareer,
    title: "Launch your tech career",
    description:
      "Bridge classroom theory with real-world skills through structured training programs.",
  },
  {
    image: industryexpert,
    title: "Learn from industry experts",
    description:
      "Get guided mentorship, live cohorts, and practical projects that employers value.",
  },
  {
    image: track,
    title: "One platform for your growth",
    description:
      "Track courses, attendance, and progress — all in the TIMS training ecosystem.",
  },
  {
    image: tailored,
    title: "One platform for your growth",
    description:
      "Track courses, attendance, and progress — all in the TIMS training ecosystem.",
  },
];

const INTERVAL_MS = 3000;

export function AuthImageSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0c0407]">
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {SLIDES.map((slide, index) => (
          <div
            key={slide.title}
            className="relative min-w-full h-full shrink-0"
            aria-hidden={index !== activeIndex}
          >
            <img
              src={slide.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0407]/95 via-[#0c0407]/35 to-[#0c0407]/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0c0407]/50 to-transparent" />
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 p-10 xl:p-14 pointer-events-none">
        <div
          key={activeIndex}
          className="max-w-lg animate-[fadeSlide_0.6s_ease-out]"
        >
          <h2 className="text-2xl xl:text-3xl font-bold text-white leading-tight tracking-tight">
            {SLIDES[activeIndex].title}
          </h2>
          <p className="mt-2 text-sm xl:text-base text-white/75 leading-relaxed max-w-md">
            {SLIDES[activeIndex].description}
          </p>
        </div>

        <div className="flex gap-2 mt-8">
          {SLIDES.map((_, index) => (
            <span
              key={index}
              className={`h-1 rounded-full transition-all duration-500 ${
                index === activeIndex ? "w-8 bg-[#fc362d]" : "w-2 bg-white/35"
              }`}
            />
          ))}
        </div>
      </div>

      <p className="absolute bottom-6 right-10 xl:right-14 z-10 text-[10px] text-white/30 pointer-events-none">
        © {new Date().getFullYear()} TIMS
      </p>
    </div>
  );
}
