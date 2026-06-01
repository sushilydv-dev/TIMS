import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const backgroundImages = [
  "https://images.unsplash.com/photo-1506744626753-df839db10cd9?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=2000&auto=format&fit=crop"
];

const AuthLayout = ({ children }) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#1e1e2e] flex items-center justify-center p-4 font-sans text-gray-400">
      <div className="flex flex-col md:flex-row w-full max-w-[1200px] bg-[#252535] rounded-2xl overflow-hidden shadow-2xl min-h-[800px]">
        
        {/* Left Panel */}
        <div className="relative w-full md:w-1/2 bg-gray-900 flex flex-col justify-between p-8 md:p-12 overflow-hidden">
          
          {/* Background Image Overlay */}
          {backgroundImages.map((img, index) => (
            <div 
              key={index}
              className={`absolute inset-0 bg-cover bg-center mix-blend-overlay transition-opacity duration-1000 ${index === currentImgIndex ? 'opacity-40' : 'opacity-0'}`}
              style={{ backgroundImage: `url('${img}')` }}
            ></div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-black/20 to-transparent"></div>
          
          {/* Top Nav */}
          <div className="relative z-10 flex justify-between items-center w-full">
            <h1 className="text-3xl font-black text-white tracking-tighter">
              AMU<span className="text-brand">.</span>
            </h1>
            <Link to="/" className="px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-sm font-medium rounded-full transition-colors border border-white/10 cursor-pointer">
              Back to website &rarr;
            </Link>
          </div>
          
          {/* Bottom Content */}
          <div className="relative z-10 mt-auto pb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 italic leading-tight" style={{ fontFamily: "'Syne', 'Plus Jakarta Sans', sans-serif" }}>
              Capturing Moments,<br />Creating Memories
            </h2>
            
            {/* Carousel Indicators */}
            <div className="flex gap-2 items-center">
              {backgroundImages.map((_, index) => (
                <div 
                  key={index} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${index === currentImgIndex ? 'w-8 bg-brand' : 'w-2 bg-white/30'}`}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Form Area */}
        <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center relative">
          <div className="w-full max-w-md mx-auto relative z-10">
            {children}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AuthLayout;
