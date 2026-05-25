import React from "react";
import { BookOpen, TrendingUp, Award } from "lucide-react";
import logo from "../assets/logo.png";
import background from "../assets/background.png";

const FeatureCard = ({ icon: Icon, title, subtext, accentColor, animationClass }) => {
  // Define light glow and styles based on the accent
  const glowStyles = {
    cyan: "hover:shadow-[0_0_30px_5px_rgba(6,182,212,0.15)] hover:border-cyan-400/40 hover:bg-white/90",
    emerald: "hover:shadow-[0_0_30px_5px_rgba(16,185,129,0.15)] hover:border-emerald-400/40 hover:bg-white/90",
    amber: "hover:shadow-[0_0_30px_5px_rgba(245,158,11,0.15)] hover:border-amber-400/40 hover:bg-white/90",
  };

  const iconBgStyles = {
    cyan: "bg-cyan-50 text-cyan-600 border-cyan-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
  };

  return (
    <div 
      className={`w-full transition-transform duration-500 ease-out ${animationClass} hover:[animation-play-state:paused]`}
    >
      <div 
        className={`flex items-start gap-4 p-5 rounded-2xl border border-white/60 bg-white/45 backdrop-blur-md transition-all duration-500 ease-out hover:-translate-y-2 hover:scale-[1.02] ${glowStyles[accentColor]} group cursor-pointer shadow-[0_8px_30px_rgb(0,0,0,0.02)]`}
      >
        {/* Glow behind the icon on hover */}
        <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-all duration-500 ease-out ${iconBgStyles[accentColor]} group-hover:scale-110`}>
          <Icon className="h-6 w-6 transition-transform duration-500 group-hover:rotate-6" strokeWidth={1.8} />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-bold text-neutral-800 transition-colors duration-300">
            {title}
          </h3>
          <p className="text-sm text-neutral-600 leading-relaxed font-medium transition-colors duration-300 group-hover:text-neutral-800">
            {subtext}
          </p>
        </div>
      </div>
    </div>
  );
};

export const AuthLayout = ({ children }) => {
  return (
    <main 
      className="min-h-screen w-full relative text-neutral-800 flex overflow-x-hidden selection:bg-cyan-500/20 select-none font-sans bg-cover bg-center bg-no-repeat bg-[#dbf5ec]"
      style={{ 
        backgroundImage: `url(${background})`
      }}
    >
      {/* Premium light glass overlay and grid texture */}
      <div className="absolute inset-0 bg-white/10 pointer-events-none" />

      <div className="grid w-full grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] min-h-screen relative z-10">
        
        {/* Left Side: Anti-Gravity Marketing Panel */}
        <section className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-white/5">
          
          {/* Organic glowing background blobs overlay matching the theme */}
          <div className="absolute top-[10%] left-[-10%] h-[350px] w-[350px] rounded-full bg-cyan-400/10 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[10%] right-[-10%] h-[400px] w-[400px] rounded-full bg-teal-400/10 blur-[120px] pointer-events-none" />
          
          {/* Left panel header */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 p-[1px] shadow-sm">
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-white">
                <img
                  src={logo}
                  alt="TIMS"
                  className="h-6 w-6 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-wider bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-900 bg-clip-text text-transparent">
                TIMS
              </span>
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                Management System
              </span>
            </div>
          </div>

          {/* Core Feature Section (Anti-Gravity Floating Cards) */}
          <div className="relative z-10 max-w-[500px] my-auto flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-neutral-800 xl:text-5xl">
                Learn. Grow. <br />
                <span className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent drop-shadow-sm">
                  Build Your Future.
                </span>
              </h1>
              <p className="text-sm text-neutral-600 leading-relaxed font-medium">
                Welcome to TIMS. Access high-grade training pipelines, track learning metrics, and unlock recognized certifications — all powered by a premium design framework.
              </p>
            </div>

            {/* Float Cards Vertical Stack */}
            <div className="flex flex-col gap-5 mt-4">
              <FeatureCard
                icon={BookOpen}
                title="Expert - Curated Courses"
                subtext="High-quality, specialized industrial training pipelines built for scaling modern technology stacks."
                accentColor="cyan"
                animationClass="animate-float-slow"
              />
              <FeatureCard
                icon={TrendingUp}
                title="Track your Progress"
                subtext="Monitor real-time course completions, direct evaluation remarks, and comprehensive attendance analytics."
                accentColor="emerald"
                animationClass="animate-float-medium"
              />
              <FeatureCard
                icon={Award}
                title="Earn Certificates"
                subtext="Receive verifiable completion metrics and automated documentation upon clearing course criteria."
                accentColor="amber"
                animationClass="animate-float-fast"
              />
            </div>
          </div>

          {/* Left panel footer */}
          <div className="relative z-10 flex items-center justify-between border-t border-white/40 pt-6 text-xs text-neutral-500 font-semibold">
            <span>Empowering learners. Building futures.</span>
          </div>

        </section>

        {/* Right Side: Reusable Form Container */}
        <section className="relative flex flex-col justify-center items-center p-4 sm:p-8 md:p-12 lg:p-16 bg-white/5">
          
          <div className="w-full max-w-[440px] z-10">
            {/* Header for mobile view only */}
            <div className="flex flex-col items-center gap-2 mb-8 lg:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 p-[1px]">
                <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-white">
                  <img src={logo} alt="TIMS Logo" className="h-6 w-6 object-contain" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-neutral-800 tracking-wide">TIMS</h2>
              <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider text-center">Training & Internship Management</p>
            </div>

            {/* Glassmorphic box for forms */}
            <div className="rounded-3xl border border-white/60 bg-white/55 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative overflow-hidden group">
              {/* Refined gradient border line at the top of the form box */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
              
              {children}
            </div>
          </div>
        </section>

      </div>
    </main>
  );
};
