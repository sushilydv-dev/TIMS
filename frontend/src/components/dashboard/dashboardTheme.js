
export const tims = {
  accent: "#fc362d",
  accentFrom: "#f43f5e", /* rose-500 */
  accentHoverTo: "#e02d25",
  accentLight: "#fef2f2",
  ink: "#0c0407",
  slate: "#475569",
  slateLight: "#64748b",
  body: "#636363",
  muted: "#94a3b8",
  pageBg: "#f8fafc",
  pageBgGradient: "from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]",
  cardBg: "#ffffff",
  cardBgLight: "#f8fafc",
  border: "rgba(0, 0, 0, 0.08)",
  borderLight: "rgba(0, 0, 0, 0.05)",
  success: "#059669",
  successBg: "#ecfdf5",
  warning: "#d97706",
  warningBg: "#fffbeb",
  danger: "#b91c1c",
  dangerBg: "#fef2f2",
  chartLine: "#334155",
  chartLineMuted: "#94a3b8",
  chartFill: "rgba(51, 65, 85, 0.04)",
  slateCard: "#1a1a1f",
  slateCardEnd: "#0c0407",
};

/** Brand accent gradient (landing CTA alignment) */
export const accentGradientClass =
  "bg-gradient-to-r from-rose-500 to-[#fc362d]";

export const accentGradientHoverClass =
  "hover:from-rose-600 hover:to-[#e02d25]";

/** Monochromatic icon wells for metric cards */
export const statIconWells = "bg-[#f1f5f9] text-[#475569]";

export const cardClass =
  "bg-white border border-black/[0.08] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-shadow";

export const cardLightClass =
  "bg-[#f8fafc] border border-black/[0.05] rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.03)]";

export const cardPadding = "p-5 sm:p-6";

export const pageWrapClass =
  "space-y-6 font-sans animate-fade-in text-[#0c0407]";

export const labelMutedClass =
  "text-xs font-bold text-[#94a3b8] uppercase tracking-wider";

export const headingClass = "text-lg font-bold text-[#0c0407] tracking-tight";

export const primaryBtnClass = `px-5 py-2.5 text-xs font-bold rounded-xl text-white ${accentGradientClass} ${accentGradientHoverClass} active:scale-[0.99] transition-all cursor-pointer`;

export const secondaryBtnClass =
  "px-5 py-2.5 text-xs font-bold rounded-xl text-[#475569] border border-black/10 bg-white hover:bg-[#f8fafc] hover:text-[#0c0407] active:scale-[0.99] transition-colors cursor-pointer";

export const badgeClass =
  "px-3 py-1 text-[10px] font-bold rounded-lg bg-[#f1f5f9] text-[#475569] uppercase tracking-widest";

export const inputClass =
  "w-full text-xs font-semibold p-3 border border-black/10 rounded-xl bg-white text-[#0c0407] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#94a3b8] focus:ring-2 focus:ring-[#e2e8f0]";

export const trendUpClass = "text-[#059669] bg-[#ecfdf5]";
export const trendDownClass = "text-[#b91c1c] bg-[#fef2f2]";

export const chartPrimary = tims.chartLine;
export const chartSecondary = tims.chartLineMuted;

export const darkCardClass =
  "bg-gradient-to-br from-[#1a1a1f] via-[#141418] to-[#0c0407]";

export const navActiveClass =
  "text-[#0c0407] font-bold bg-transparent border-l-[3px] border-[#fc362d] border-y-0 border-r-0 rounded-none pl-[13px]";

export const navInactiveClass =
  "text-[#64748b] border-l-[3px] border-transparent hover:text-[#0c0407] hover:bg-black/[0.02] rounded-none pl-[13px]";
