import React, { useEffect, useState } from "react";
// 1. Import motion and useScroll from framer-motion
import { motion, useScroll } from "framer-motion";

import { PageLoader } from "../components/PageLoader";
import { Navbar } from "../components/Navbar";
import { Hero } from "../components/elevate/Hero";
import { LogoTicker } from "../components/elevate/LogoTicker";
import { About } from "../components/elevate/About";
import { Services } from "../components/elevate/Services";
import { Projects } from "../components/elevate/Projects";
import { Testimonials } from "../components/elevate/Testimonials";
import { FAQs } from "../components/elevate/FAQs";
import { CTASection } from "../components/elevate/CTASection";
import { Footer } from "../components/elevate/Footer";
import { ConsultationProvider } from "../context/ConsultationContext";

const MIN_LOADER_MS = 900;

export const Homepage = () => {
  const [pageLoading, setPageLoading] = useState(true);

  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const started = Date.now();
    let cancelled = false;

    const finish = () => {
      const wait = Math.max(0, MIN_LOADER_MS - (Date.now() - started));
      window.setTimeout(() => {
        if (!cancelled) setPageLoading(false);
      }, wait);
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("load", finish);
    };
  }, []);

  if (pageLoading) {
    return <PageLoader label="Loading homepage" />;
  }

  return (
    <ConsultationProvider>
      <div className="bg-white min-h-screen text-[#0c0407] overflow-x-hidden">
        {/* 3. Combined Navbar & Scroll Progress Container */}
        <div className="fixed top-0 left-0 w-full z-20">
          <Navbar />

          {/* The Scroll Progress Bar */}
          <motion.div
            style={{ scaleX: scrollYProgress, originX: 0 }}
            className="h-[3px] bg-gradient-to-r from-rose-500 via-[#fc362d] to-rose-600 w-full fixed top-0 left-0 z-20" // Change 'bg-blue-600' to your brand color
          />
        </div>

        <main className="relative z-10 pt-16">
          {/* Note: Added pt-16 (padding-top) to main so the Hero content 
              doesn't get hidden behind your fixed Navbar */}
          <Hero />
          <LogoTicker />
          <About />
          <Services />
          <Projects />
          <Testimonials />
          <FAQs />
          <CTASection />
        </main>

        <Footer />
      </div>
    </ConsultationProvider>
  );
};
