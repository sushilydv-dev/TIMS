import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaInstagram,
  FaXTwitter,
  FaLinkedin,
} from "react-icons/fa6";
import productlogo from "../../assets/logo.png"
import { INSTITUTE_NAME } from "../../constants";
export const Footer = () => {
  return (
    <footer className="relative bg-[#fbfbfc] border-t border-black/[0.04] pt-20 pb-12 px-4 md:px-8 lg:px-16 overflow-hidden">
      {/* Background soft lighting */}
      <div className="absolute right-0 bottom-0 w-[300px] h-[300px] rounded-full bg-indigo-500/[0.01] blur-[120px] pointer-events-none" />
      <div className="absolute left-0 bottom-0 w-[300px] h-[300px] rounded-full bg-[#fc362d]/[0.01] blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Top footer row: columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 pb-16 border-b border-black/[0.04]">
          {/* Col 1: Branding and description */}
          <div className="lg:col-span-5 flex flex-col items-start pr-0 lg:pr-12">
            <a href="/" className="inline-flex items-center gap-2 mb-6 group">
             
             
                       
                        <div className="flex items-center justify-center ">
                          <img
                            src={productlogo}
                            alt="MSAI India Logo"
                            className="h-[30px] w-[40px] "
                          />
                        </div>
                        
                      
              <span className="text-2xl font-black tracking-tight text-[#0c0407] group-hover:text-black/80 transition-colors duration-200">
                {INSTITUTE_NAME}
              </span>
            </a>
            <p className="text-[#636363] text-sm md:text-base leading-relaxed mb-6 font-medium">
              {INSTITUTE_NAME} — Automating the future of technical education and industrial
              internship management.
            </p>
            {/* Social Icons Row */}
            <div className="flex gap-4">
              {[
                { icon: FaFacebook, href: "#", name: "Facebook" },
                { icon: FaInstagram, href: "#", name: "Instagram" },
                { icon: FaXTwitter, href: "#", name: "Twitter/X" },
                { icon: FaLinkedin, href: "#", name: "Linkedin" },
              ].map((s, idx) => {
                const Icon = s.icon;
                return (
                  <a
                    key={idx}
                    href={s.href}
                    aria-label={s.name}
                    className="w-10 h-10 rounded-full bg-black/[0.02] hover:bg-[#fc362d] border border-black/5 hover:border-transparent text-black/55 hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Col 2: Legal list */}
          <div className="lg:col-span-3 flex flex-col items-start md:pl-0 lg:pl-12">
            <h4 className="text-sm font-bold tracking-[0.2em] uppercase text-[#0c0407] mb-6">
              Legal
            </h4>
            <ul className="flex flex-col gap-4">
              {[
                { label: "Terms of Service", href: "#" },
                { label: "Privacy Policy", href: "/privacy-policy" },
                { label: "Cancellation Policy", href: "/cancellation-policy" },
                { label: "Refund Policy", href: "#" },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.href}
                    className="text-black/50 hover:text-[#fc362d] text-sm md:text-base transition-colors duration-200 font-semibold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          

          {/* Col 3: Portals Links */}
          <div className="lg:col-span-4 flex flex-col items-start">
            <h4 className="text-sm font-bold tracking-[0.2em] uppercase text-[#0c0407] mb-6">
              Portals
            </h4>
            <div className="flex flex-col gap-4 w-full">
              {["Admin Portal Login", "Trainer Access"].map((link, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="text-black/50 hover:text-[#fc362d] text-sm md:text-base transition-colors duration-200 font-semibold"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom footer row: Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 gap-4">
          <p className="text-xs md:text-sm text-gray-400 font-semibold">
            &copy; {new Date().getFullYear()} {INSTITUTE_NAME}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              to="/privacy-policy"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors font-medium"
            >
              Privacy Policy
            </Link>
            <a
              href="#"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors font-medium"
            >
              Terms of Use
            </a>

          </div>
        </div>
      </div>
    </footer>
  );
};
