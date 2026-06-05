import React from "react";

export function PageLoader({ label = "Loading" }) {
  return (
    <div
      className="fixed inset-0 z-[9999] min-h-screen min-h-[100dvh] bg-white flex flex-col items-center justify-center gap-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="tims-hash-loader" aria-hidden />
      {label ? (
        <span className="sr-only">{label}</span>
      ) : null}
    </div>
  );
}
