import React from "react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="flex flex-col md:flex-row md:items-center justify-between text-xs font-semibold text-[#9ca3af] py-6 px-1 w-full border-t border-black/[0.08] mt-10">
      <p>© {new Date().getFullYear()} TIMS. Training & Internship Management.</p>
      <div className="flex gap-6 mt-3 md:mt-0">
        <Link to="/" className="hover:text-[#0c0407] transition-colors">
          Home
        </Link>
        <a href="#" className="hover:text-[#0c0407] transition-colors">
          Support
        </a>
        <a href="#" className="hover:text-[#0c0407] transition-colors">
          Privacy
        </a>
      </div>
    </footer>
  );
};

export default Footer;
