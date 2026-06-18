import React, { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import axios from "axios";
import {
  cardClass,
  inputClass,
  primaryBtnClass,
  secondaryBtnClass,
} from "../dashboardTheme";

export function BatchFormModal({ open, onClose, onSuccess, courseId, courseTitle, courseDuration }) {
  const [batchName, setBatchName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [trainerId, setTrainerId] = useState("");
  const [trainers, setTrainers] = useState([]);
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
      setBatchName("");
      setStartDate("");
      setEndDate("");
      setTrainerId("");
      setError("");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const trainersRes = await axios.get("/api/admin/trainers");
        setTrainers(trainersRes.data || []);
      } catch {
        setTrainers([]);
      }
    };

    load();
  }, [open]);

  if (!open) return null;

  const handleStartDateChange = (val) => {
    setStartDate(val);
    if (val && courseDuration) {
      const date = new Date(val);
      if (!isNaN(date.getTime())) {
        date.setMonth(date.getMonth() + Number(courseDuration));
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        setEndDate(`${year}-${month}-${day}`);
      }
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post("/api/admin/batches", {
        course_id: courseId,
        batch_name: batchName,
        trainer_id: trainerId,
        start_date: startDate,
        end_date: endDate,
        student_ids: [],
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create batch");
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
        className={`relative w-full max-w-lg max-h-[90vh] overflow-y-auto ${cardClass} p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.15)]`}
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
          New batch
        </span>
        <h2 className="text-xl font-bold text-[#0c0407] mt-2 pr-10 tracking-tight">
          Create batch
        </h2>
        <p className="text-sm text-[#636363] mt-1.5 mb-6 font-medium">
          For <strong className="text-[#0c0407]">{courseTitle}</strong> — assign a trainer.

        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#475569] mb-1.5">Batch name</label>
            <input
              required
              className={inputClass}
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              placeholder="e.g. FS-2026-B1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1.5">Start date</label>
              <input
                type="date"
                required
                className={inputClass}
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
              />

            </div>
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1.5">End date</label>
              <input
                type="date"
                required
                className={inputClass}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#475569] mb-1.5">Assign trainer</label>
            <select
              required
              className={inputClass}
              value={trainerId}
              onChange={(e) => setTrainerId(e.target.value)}
            >
              <option value="">Select trainer</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {t.specialization}
                </option>
              ))}
            </select>
            {trainers.length === 0 && (
              <p className="text-[10px] text-[#d97706] font-semibold mt-1.5">
                No trainer profiles found. Invite users with the Trainer role first.
              </p>
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
              disabled={loading || trainers.length === 0}
              className={`${primaryBtnClass} flex-1 min-w-[140px] disabled:opacity-50`}
            >
              {loading ? "Creating…" : "Create batch"}
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

export default BatchFormModal;
