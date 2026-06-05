import React from "react";
import {
  badgeClass,
  cardClass,
  cardPadding,
  headingClass,
  labelMutedClass,
  primaryBtnClass,
  secondaryBtnClass,
  statIconWells,
  trendDownClass,
  trendUpClass,
} from "./dashboardTheme";

export function WelcomeBanner({ badge, title, description, actions }) {
  return (
    <div
      className={`relative overflow-hidden ${cardClass} ${cardPadding} sm:p-8`}
    >
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className={badgeClass}>{badge}</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0c0407] mt-3 tracking-tight">
            {title}
          </h1>
          <p className="text-[#636363] text-sm mt-2 max-w-xl font-medium">
            {description}
          </p>
        </div>
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>
    </div>
  );
}

export function StatCards({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat, idx) => {
        const trendClass =
          stat.trendType === "down" ? trendDownClass : trendUpClass;

        return (
          <div
            key={idx}
            className={`flex items-center gap-4 ${cardClass} p-5 hover:shadow-[0_6px_28px_rgba(0,0,0,0.06)] transition-all duration-200`}
          >
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${stat.color || statIconWells}`}
            >
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className={labelMutedClass}>{stat.label}</p>
              <h3 className="text-xl sm:text-2xl font-bold text-[#0c0407] tracking-tight mt-1">
                {stat.value}
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-lg mt-1.5 inline-block ${trendClass}`}
              >
                {stat.change}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Panel({ children, className = "" }) {
  return (
    <div className={`${cardClass} ${cardPadding} ${className}`}>{children}</div>
  );
}

export function PanelHeader({ eyebrow, title, action }) {
  return (
    <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
      <div>
        {eyebrow && <span className={labelMutedClass}>{eyebrow}</span>}
        <h3 className={`${headingClass} ${eyebrow ? "mt-0.5" : ""}`}>{title}</h3>
      </div>
      {action}
    </div>
  );
}

export function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button type="button" className={`${primaryBtnClass} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = "", ...props }) {
  return (
    <button type="button" className={`${secondaryBtnClass} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-[#0c0407] text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg flex items-center gap-2.5">
      {message}
    </div>
  );
}

export function StatusBadge({ children, variant = "info" }) {
  const styles = {
    ok: "bg-[#ecfdf5] text-[#059669] border-[#059669]/20",
    warn: "bg-[#fffbeb] text-[#d97706] border-[#d97706]/20",
    info: "bg-[#f1f5f9] text-[#475569] border-[#e2e8f0]",
    danger: "bg-[#fef2f2] text-[#b91c1c] border-[#b91c1c]/20",
  };
  return (
    <span
      className={`inline-block px-2.5 py-1 text-[9px] font-bold rounded-lg border ${styles[variant] || styles.info}`}
    >
      {children}
    </span>
  );
}
