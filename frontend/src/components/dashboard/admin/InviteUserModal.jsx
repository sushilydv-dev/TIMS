import React, { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import axios from "axios";
import { cardClass, inputClass, primaryBtnClass, secondaryBtnClass } from "../dashboardTheme";

const ROLE_OPTIONS = [
  { value: "TRAINER", label: "Trainer" },
  { value: "HR", label: "HR Coordinator" },
  { value: "STUDENT", label: "Student" },
];

export function InviteUserModal({ open, onClose, onSuccess, fixedRole }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(fixedRole || "TRAINER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      setEmail("");
      setPassword("");
      setRole(fixedRole || "TRAINER");
      setError("");
      setLoading(false);
    }
  }, [open, fixedRole]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post("/api/admin/invite", { email, password, role });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-user-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#0c0407]/40 backdrop-blur-sm cursor-default"
        aria-label="Close dialog"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-md ${cardClass} p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-fade-in`}
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

        <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">
          Team invite
        </span>
        <h2
          id="invite-user-title"
          className="text-xl font-bold text-[#0c0407] mt-2 pr-8 tracking-tight"
        >
          Invite user
        </h2>
        <p className="text-sm text-[#636363] mt-1.5 mb-6 font-medium">
          An activation email will be sent. The account stays inactive until they set a password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="invite-email" className="block text-xs font-bold text-[#475569] mb-1.5">
              Invite email
            </label>
            <input
              id="invite-email"
              type="email"
              required
              autoComplete="off"
              placeholder="name@institute.com"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="invite-password" className="block text-xs font-bold text-[#475569] mb-1.5">
              Dummy password
            </label>
            <input
              id="invite-password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Temporary password (replaced on activation)"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="invite-role" className="block text-xs font-bold text-[#475569] mb-1.5">
              Assign role
            </label>
            {fixedRole ? (
              <div className="w-full px-4 py-3 rounded-xl border border-black/10 bg-slate-50 text-xs font-bold text-[#475569] flex items-center justify-between">
                <span>{ROLE_OPTIONS.find((opt) => opt.value === fixedRole)?.label || fixedRole}</span>
                <span className="text-[10px] text-gray-400 font-normal uppercase tracking-wider">Fixed</span>
              </div>
            ) : (
              <select
                id="invite-role"
                required
                className={inputClass}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {error && (
            <p className="text-xs font-semibold text-[#b91c1c] bg-[#fef2f2] border border-[#b91c1c]/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`${primaryBtnClass} flex-1 min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? "Sending…" : "Send invite link"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={secondaryBtnClass}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InviteUserModal;
