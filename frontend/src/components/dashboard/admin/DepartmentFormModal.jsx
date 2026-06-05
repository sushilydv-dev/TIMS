import React, { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import axios from "axios";
import {
  cardClass,
  inputClass,
  primaryBtnClass,
  secondaryBtnClass,
} from "../dashboardTheme";

export function DepartmentFormModal({ open, onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
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
      setName("");
      setCode("");
      setDescription("");
      setError("");
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post("/api/admin/departments", {
        name,
        code,
        description,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create department");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-[#0c0407]/40 backdrop-blur-sm cursor-default"
        aria-label="Close"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-md ${cardClass} p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.15)]`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-xl border border-black/10 bg-[#fafafa] text-[#475569] flex items-center justify-center hover:bg-[#f1f5f9] cursor-pointer"
          aria-label="Close"
        >
          <FiX className="w-4 h-4" />
        </button>

        <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">
          Department
        </span>
        <h2 className="text-xl font-bold text-[#0c0407] mt-2 pr-10 tracking-tight">
          New department
        </h2>
        <p className="text-sm text-[#636363] mt-1.5 mb-6 font-medium">
          Group courses under a company division or training track.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#475569] mb-1.5">Name</label>
            <input
              required
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Engineering"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#475569] mb-1.5">Code</label>
            <input
              required
              className={inputClass}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. ENG"
              maxLength={12}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#475569] mb-1.5">
              Description (optional)
            </label>
            <textarea
              className={`${inputClass} min-h-[80px] resize-y`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short summary for admins"
            />
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
              className={`${primaryBtnClass} flex-1 min-w-[140px] disabled:opacity-50`}
            >
              {loading ? "Creating…" : "Create department"}
            </button>
            <button type="button" onClick={onClose} disabled={loading} className={secondaryBtnClass}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DepartmentFormModal;
