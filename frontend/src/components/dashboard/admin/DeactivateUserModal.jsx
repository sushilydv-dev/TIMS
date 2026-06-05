import React, { useEffect, useState } from "react";
import { FiX, FiAlertTriangle } from "react-icons/fi";
import axios from "axios";
import { cardClass, primaryBtnClass, secondaryBtnClass } from "../dashboardTheme";

export function DeactivateUserModal({ open, user, mode = "deactivate", onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isReactivate = mode === "reactivate";

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setError("");
      setLoading(false);
    }
  }, [open]);

  if (!open || !user) return null;

  const handleConfirm = async () => {
    setLoading(true);
    setError("");

    try {
      const status = isReactivate ? "active" : "suspended";
      await axios.patch(`/api/admin/users/${user.id}/status`, { status });
      onSuccess?.(isReactivate ? "reactivate" : "deactivate");
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update user status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deactivate-user-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#0c0407]/40 backdrop-blur-sm cursor-default"
        aria-label="Close dialog"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-md ${cardClass} p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.15)]`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-xl border border-black/10 bg-[#fafafa] text-[#475569] flex items-center justify-center hover:bg-[#f1f5f9] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <FiX className="w-4 h-4" />
        </button>

        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${
            isReactivate ? "bg-[#ecfdf5] text-[#059669]" : "bg-[#fef2f2] text-[#b91c1c]"
          }`}
        >
          <FiAlertTriangle className="w-5 h-5" />
        </div>

        <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">
          {isReactivate ? "Restore access" : "Account control"}
        </span>
        <h2
          id="deactivate-user-title"
          className="text-xl font-bold text-[#0c0407] mt-2 pr-8 tracking-tight"
        >
          {isReactivate ? "Reactivate user?" : "Deactivate user?"}
        </h2>
        <p className="text-sm text-[#636363] mt-2 mb-6 font-medium leading-relaxed">
          {isReactivate ? (
            <>
              <strong className="text-[#0c0407]">{user.name}</strong> ({user.email}) will be
              able to sign in again with an <strong className="text-[#0c0407]">active</strong>{" "}
              account.
            </>
          ) : (
            <>
              <strong className="text-[#0c0407]">{user.name}</strong> ({user.email}) will be
              marked as <strong className="text-[#0c0407]">suspended</strong> and will not be
              able to log in until reactivated.
            </>
          )}
        </p>

        {error && (
          <p className="text-xs font-semibold text-[#b91c1c] bg-[#fef2f2] border border-[#b91c1c]/20 rounded-xl px-3 py-2 mb-4">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`${primaryBtnClass} flex-1 min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed ${
              !isReactivate
                ? "bg-gradient-to-r from-rose-500 to-[#fc362d] hover:bg-gradient-to-r from-rose-500 to-[#fc362d]"
                : ""
            }`}
          >
            {loading
              ? "Saving…"
              : isReactivate
                ? "Reactivate user"
                : "Deactivate user"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={secondaryBtnClass}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeactivateUserModal;
