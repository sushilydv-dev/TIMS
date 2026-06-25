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
  const [endDate, setEndDate]     = useState("");
  const [trainerId, setTrainerId] = useState("");
  const [trainers, setTrainers]   = useState([]);
  const [courses, setCourses]     = useState([]);           // for standalone mode
  const [selCourseId, setSelCourseId]   = useState(courseId || "");
  const [selCourseDur, setSelCourseDur] = useState(courseDuration || null);
  const [selCourseTitle, setSelCourseTitle] = useState(courseTitle || "");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  // standalone = no courseId passed in
  const standalone = !courseId;


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
      setBatchName(""); setStartDate(""); setEndDate("");
      setTrainerId(""); setError(""); setLoading(false);
      setSelCourseId(courseId || ""); setSelCourseDur(courseDuration || null);
      setSelCourseTitle(courseTitle || "");
      return;
    }

    const load = async () => {
      try {
        const [trainersRes, coursesRes] = await Promise.all([
          axios.get("/api/admin/trainers"),
          standalone ? axios.get("/api/admin/curriculum") : Promise.resolve({ data: { departments: [] } }),
        ]);
        setTrainers(trainersRes.data || []);
        if (standalone) {
          // flatten all courses from curriculum
          const all = [];
          (coursesRes.data?.departments || []).forEach(dept => {
            (dept.courses || []).forEach(c => all.push({ id: c.id, title: c.title, duration_month: c.duration_month, dept: dept.name }));
          });
          setCourses(all);
        }
      } catch {
        setTrainers([]); setCourses([]);
      }
    };
    load();
  }, [open, courseId, courseDuration, courseTitle, standalone]);

  if (!open) return null;

  const handleStartDateChange = (val) => {
    setStartDate(val);
    const dur = selCourseDur || courseDuration;
    if (val && dur) {
      const date = new Date(val);
      if (!isNaN(date.getTime())) {
        date.setMonth(date.getMonth() + Number(dur));
        setEndDate(`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`);
      }
    }
  };

  const handleCourseChange = (id) => {
    setSelCourseId(id);
    const found = courses.find(c => c.id === id);
    setSelCourseDur(found?.duration_month || null);
    setSelCourseTitle(found?.title || "");
    // re-apply auto end-date if start already set
    if (startDate && found?.duration_month) {
      const date = new Date(startDate);
      if (!isNaN(date.getTime())) {
        date.setMonth(date.getMonth() + Number(found.duration_month));
        setEndDate(`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selCourseId) { setError("Please select a course"); return; }
    if (!trainerId)   { setError("Please select a trainer"); return; }
    setLoading(true); setError("");
    try {
      await axios.post("/api/admin/batches", {
        course_id:   selCourseId,
        batch_name:  batchName,
        trainer_id:  trainerId,
        start_date:  startDate,
        end_date:    endDate,
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true">
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
          {standalone
            ? "Create a new batch — pick a course, assign a trainer, and set dates."
            : <>For <strong className="text-[#0c0407]">{selCourseTitle}</strong> — assign a trainer.</>}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Course picker — only in standalone mode */}
          {standalone && (
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1.5">Course <span className="text-[#b91c1c]">*</span></label>
              <select
                required
                className={inputClass}
                value={selCourseId}
                onChange={e => handleCourseChange(e.target.value)}
              >
                <option value="">Select course</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.title} {c.dept ? `(${c.dept})` : ""}
                  </option>
                ))}
              </select>
              {courses.length === 0 && (
                <p className="text-[10px] text-[#d97706] font-semibold mt-1.5">
                  No courses found. Create courses first.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#475569] mb-1.5">Batch name <span className="text-[#b91c1c]">*</span></label>
            <input
              required
              className={inputClass}
              value={batchName}
              onChange={e => setBatchName(e.target.value)}
              placeholder="e.g. FS-2026-B1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1.5">Start date <span className="text-[#b91c1c]">*</span></label>
              <input
                type="date" required
                className={inputClass}
                value={startDate}
                onChange={e => handleStartDateChange(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1.5">End date <span className="text-[#b91c1c]">*</span></label>
              <input
                type="date" required
                className={inputClass}
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
              {selCourseDur && (
                <p className="text-[10px] text-[#94a3b8] mt-1">
                  Auto-set from {selCourseDur}-month course duration
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#475569] mb-1.5">Assign trainer <span className="text-[#b91c1c]">*</span></label>
            <select
              required
              className={inputClass}
              value={trainerId}
              onChange={e => setTrainerId(e.target.value)}
            >
              <option value="">Select trainer</option>
              {trainers.map(t => (
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
              disabled={loading || trainers.length === 0 || (standalone && !selCourseId)}
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
