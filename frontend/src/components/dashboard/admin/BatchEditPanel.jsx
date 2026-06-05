import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiUsers, FiX } from "react-icons/fi";
import axios from "axios";
import { inputClass, primaryBtnClass, secondaryBtnClass } from "../dashboardTheme";
import { BatchStudentPickerPanel } from "./BatchStudentPickerPanel";
import { StudentDetailPanel } from "./StudentDetailPanel";

export function BatchEditPanel({ open, batch, courseTitle, onClose, onSuccess }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const studentIdParam = searchParams.get("studentId");

  const [batchName, setBatchName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [trainerId, setTrainerId] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [enrolledPreview, setEnrolledPreview] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (studentIdParam) {
      setSelectedStudentId(studentIdParam);
    } else {
      setSelectedStudentId(null);
    }
  }, [studentIdParam]);

  const handleSelectStudent = (id) => {
    setSelectedStudentId(id);
    setSearchParams((prev) => {
      prev.set("studentId", id);
      return prev;
    });
  };

  const handleCloseStudent = () => {
    setSelectedStudentId(null);
    setSearchParams((prev) => {
      prev.delete("studentId");
      return prev;
    });
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (selectedStudentId) handleCloseStudent();
        else if (pickerOpen) setPickerOpen(false);
        else onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, pickerOpen, selectedStudentId]);

  useEffect(() => {
    if (!open || !batch) {
      setError("");
      setLoading(false);
      setPickerOpen(false);
      setSelectedStudentId(null);
      return;
    }

    const initial = batch.students || [];
    setBatchName(batch.batch_name || "");
    setStartDate(batch.start_date || "");
    setEndDate(batch.end_date || "");
    setTrainerId(batch.trainer?.id || "");
    setSelectedStudents(initial.map((s) => s.id));
    setEnrolledPreview(initial);

    const loadTrainers = async () => {
      try {
        const { data } = await axios.get("/api/admin/trainers");
        setTrainers(data || []);
      } catch {
        setTrainers([]);
      }
    };

    loadTrainers();
  }, [open, batch]);

  const handleSelectionChange = (ids, toggledStudent) => {
    setSelectedStudents(ids);
    setEnrolledPreview((prev) => {
      const byId = new Map(prev.map((s) => [s.id, s]));

      if (toggledStudent) {
        if (ids.includes(toggledStudent.id)) {
          byId.set(toggledStudent.id, {
            id: toggledStudent.id,
            name: toggledStudent.name,
            email: toggledStudent.email,
            fees: toggledStudent.fees,
          });
        } else {
          byId.delete(toggledStudent.id);
        }
      }

      return ids.map((id) => byId.get(id)).filter(Boolean);
    });
  };

  const handlePickerClose = () => {
    setPickerOpen(false);
  };

  if (!open || !batch) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.put(`/api/admin/batches/${batch.id}`, {
        batch_name: batchName,
        trainer_id: trainerId,
        start_date: startDate,
        end_date: endDate,
        student_ids: selectedStudents,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update batch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <BatchStudentPickerPanel
        open={pickerOpen}
        batchId={batch.id}
        selectedIds={selectedStudents}
        onSelectionChange={handleSelectionChange}
        onClose={handlePickerClose}
      />

      <StudentDetailPanel
        open={Boolean(selectedStudentId)}
        studentId={selectedStudentId}
        onClose={handleCloseStudent}
      />

      <div className="fixed inset-0 z-[100] flex justify-end" role="dialog" aria-modal="true">
        <button
          type="button"
          className="absolute inset-0 bg-[#0c0407]/40 backdrop-blur-sm cursor-default"
          aria-label="Close"
          onClick={onClose}
        />

        <div
          className="relative w-full max-w-md h-full bg-white border-l border-black/[0.08] shadow-[-12px_0_40px_rgba(0,0,0,0.08)] flex flex-col animate-[slideInRight_0.25s_ease-out]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3 p-5 sm:p-6 border-b border-black/[0.06] shrink-0">
            <div className="min-w-0 pr-2">
              <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">
                Edit batch
              </span>
              <h2 className="text-xl font-bold text-[#0c0407] mt-1 tracking-tight truncate">
                {batch.batch_name}
              </h2>
              {courseTitle && (
                <p className="text-xs text-[#636363] font-medium mt-1 truncate">{courseTitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl border border-black/10 bg-[#fafafa] text-[#475569] flex items-center justify-center hover:bg-[#f1f5f9] cursor-pointer shrink-0"
              aria-label="Close"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          <form
            id="batch-edit-form"
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1.5">Batch name</label>
              <input
                required
                className={inputClass}
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
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
                  onChange={(e) => setStartDate(e.target.value)}
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
              <label className="block text-xs font-bold text-[#475569] mb-1.5">Trainer</label>
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
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <label className="block text-xs font-bold text-[#475569]">
                  Enrolled students ({selectedStudents.length})
                </label>
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className={`${secondaryBtnClass} inline-flex items-center gap-1.5 text-xs py-2 px-3`}
                >
                  <FiUsers className="w-3.5 h-3.5" />
                  Manage enrollment
                </button>
              </div>

              {enrolledPreview.length === 0 ? (
                <p className="text-xs text-[#94a3b8] font-semibold py-4 text-center rounded-xl bg-[#fafafa] border border-dashed border-black/[0.08]">
                  No students enrolled. Open enrollment to add students.
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {enrolledPreview.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => handleSelectStudent(s.id)}
                      className="flex items-center justify-between p-3 rounded-xl border border-black/[0.06] bg-[#fafafa] hover:bg-white hover:border-black/15 transition-all cursor-pointer group"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#0c0407] group-hover:text-[#3b82f6] transition-colors truncate">
                          {s.name}
                        </p>
                        <p className="text-[10px] text-[#636363] truncate mt-0.5">{s.email}</p>
                      </div>
                      <span className="text-[10px] font-bold text-[#3b82f6] bg-[#eff6ff] border border-[#bfdbfe] px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        Details
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <p className="text-xs font-semibold text-[#b91c1c] bg-[#fef2f2] border border-[#b91c1c]/20 rounded-xl px-3 py-2">
                {error}
              </p>
            )}
          </form>

          <div className="flex flex-wrap gap-3 p-5 sm:p-6 border-t border-black/[0.06] shrink-0 bg-white">
            <button
              type="submit"
              form="batch-edit-form"
              disabled={loading || trainers.length === 0}
              className={`${primaryBtnClass} flex-1 min-w-[140px] disabled:opacity-50`}
            >
              {loading ? "Saving…" : "Save changes"}
            </button>
            <button type="button" onClick={onClose} disabled={loading} className={secondaryBtnClass}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default BatchEditPanel;
