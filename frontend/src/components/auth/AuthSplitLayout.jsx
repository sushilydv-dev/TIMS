import React from "react";
import { Link } from "react-router-dom";
import { FiUser } from "react-icons/fi";
import { LOGO_PATH } from "../../constants";
import { AuthImageSlider } from "./AuthImageSlider";
import { AuthSwitchLink } from "./AuthSwitchLink";

const inputClass =
  "w-full rounded-full border border-black/10 bg-white px-5 py-3.5 text-sm text-[#0c0407] placeholder:text-[#9ca3af] outline-none transition focus:border-[#fc362d]/40 focus:ring-2 focus:ring-[#fc362d]/15";

const labelClass = "sr-only";

const buttonPrimaryClass =
  "w-full rounded-full py-3.5 px-6 font-bold text-white bg-gradient-to-r from-[#fc362d] via-[#f04035] to-[#e02d25] hover:from-[#e02d25] hover:to-[#c92820] shadow-[0_4px_20px_rgba(252,54,45,0.35)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2";

const buttonSecondaryClass =
  "w-full rounded-full py-3.5 px-6 font-semibold text-[#0c0407] border border-black/15 bg-white hover:border-[#fc362d]/30 hover:bg-[#fc362d]/5 transition-all duration-300 cursor-pointer";

export function AuthSplitLayout({
  pageTitle,
  pageSubtitle,
  alternateLink,
  topAction,
  children,
  footerNote,
  /** "left" = image on left; "right" = image on right (login) */
  imagePosition = "left",
}) {
  const imageAside = (
    <aside className="hidden lg:block lg:w-1/2 relative min-h-screen min-h-[100dvh]">
      <AuthImageSlider />
    </aside>
  );

  const formPanel = (
    <div className="flex-1 flex flex-col min-h-screen min-h-[100dvh] w-full lg:w-1/2 bg-white">
      <header className="flex items-center justify-between px-6 sm:px-10 pt-6 sm:pt-8 shrink-0">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={LOGO_PATH} alt="TIMS" className="h-9 w-9 object-contain" />
          <span className="text-lg font-extrabold text-[#0c0407] tracking-tight">
            TIMS
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {topAction}
          {alternateLink && (
            <AuthSwitchLink
              to={alternateLink.to}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0c0407] hover:text-[#fc362d] transition-colors"
            >
              <FiUser className="w-4 h-4" />
              {alternateLink.label}
            </AuthSwitchLink>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center px-6 sm:px-10 md:px-16 py-8 w-full max-w-[480px] mx-auto lg:max-w-none lg:mx-0 lg:px-16 xl:px-20">
        <div className="w-full max-w-[420px] mx-auto">
          {pageTitle && (
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0c0407] tracking-tight mb-2">
              {pageTitle}
            </h2>
          )}
          {pageSubtitle && (
            <p className="text-sm text-[#636363] mb-8">{pageSubtitle}</p>
          )}
          {children}
        </div>
      </main>

      <footer className="shrink-0 px-6 sm:px-10 pb-6 sm:pb-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#9ca3af]">
        <span>© {new Date().getFullYear()} TIMS</span>
        {footerNote ?? (
          <span className="text-[#636363]">
            Training & Internship Management
          </span>
        )}
      </footer>
    </div>
  );

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col lg:flex-row bg-white font-sans">
      {imagePosition === "right" ? (
        <>
          {formPanel}
          {imageAside}
        </>
      ) : (
        <>
          {imageAside}
          {formPanel}
        </>
      )}
    </div>
  );
}

export { inputClass, labelClass, buttonPrimaryClass, buttonSecondaryClass };
