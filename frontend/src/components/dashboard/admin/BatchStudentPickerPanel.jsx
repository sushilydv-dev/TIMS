import React, { useCallback, useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiSearch, FiUserMinus, FiUserPlus, FiX } from "react-icons/fi";
import axios from "axios";
import { StatusBadge } from "../DashboardUI";
import { inputClass, primaryBtnClass, secondaryBtnClass } from "../dashboardTheme";
import { ProfileAvatar } from "../ProfileAvatar";

const PAGE_SIZE = 10;

function formatInr(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

function feeStatusVariant(status) {
  const key = String(status || "").toUpperCase();
  if (key === "PAID") return "ok";
  if (key === "PARTIAL") return "warn";
  if (key === "OVERDUE") return "danger";
  if (key === "NONE") return "info";
  return "info";
}

function feeStatusLabel(status) {
  const key = String(status || "").toUpperCase();
  if (key === "NONE") return "No fees";
  return key.charAt(0) + key.slice(1).toLowerCase();
}

export function BatchStudentPickerPanel({
  open,
  batchId,
  selectedIds,
  onSelectionChange,
  onClose,
  onOpenStudentProfile,
}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search, open]);

  useEffect(() => {
    if (open) setOffset(0);
  }, [debouncedSearch, open]);

  const fetchPage = useCallback(async () => {
    if (!open) return;

    setLoading(true);
    setError("");

    try {
      const { data } = await axios.get("/api/admin/students/browse", {
        params: {
          offset,
          limit: PAGE_SIZE,
          search: debouncedSearch || undefined,
          batch_id: batchId || undefined,
          selected_ids: selectedIds.join(",") || undefined,
        },
      });

      setStudents(data.students || []);
      setTotal(data.total ?? 0);
    } catch (err) {
      setStudents([]);
      setTotal(0);
      setError(err.response?.data?.message || "Could not load students");
    } finally {
      setLoading(false);
    }
  }, [open, offset, debouncedSearch, batchId, selectedIds]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setDebouncedSearch("");
      setOffset(0);
      setError("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const enrolledCount = selectedIds.length;
  const pageStart = total === 0 ? 0 : offset + 1;
  const pageEnd = Math.min(offset + PAGE_SIZE, total);
  const canPrev = offset > 0;
  const canNext = offset + PAGE_SIZE < total;

  const toggleEnrollment = (student) => {
    const isEnrolled = selectedIds.includes(student.id);
    const nextIds = isEnrolled
      ? selectedIds.filter((id) => id !== student.id)
      : [...selectedIds, student.id];
    onSelectionChange(nextIds, student);
  };

  return (
    <div className="fixed inset-0 z-[110] flex justify-end" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-[#0c0407]/50 backdrop-blur-sm cursor-default"
        aria-label="Close"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-lg h-full bg-white border-l border-black/[0.08] shadow-[-16px_0_48px_rgba(0,0,0,0.12)] flex flex-col animate-[slideInRight_0.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 p-5 sm:p-6 border-b border-black/[0.06] shrink-0">
          <div className="min-w-0 pr-2">
            <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">
              Enrollment
            </span>
            <h2 className="text-xl font-bold text-[#0c0407] mt-1 tracking-tight">
              Manage students
            </h2>
            <p className="text-xs text-[#636363] font-medium mt-1">
              {enrolledCount} enrolled in this batch
            </p>
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

        <div className="p-5 sm:p-6 border-b border-black/[0.06] shrink-0 space-y-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <input
              className={`${inputClass} pl-9`}
              placeholder="Search by name, email, or student code"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">
            Showing {pageStart}–{pageEnd} of {total}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3">
          {error && (
            <p className="text-xs font-semibold text-[#b91c1c] bg-[#fef2f2] border border-[#b91c1c]/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          {loading ? (
            <p className="text-sm text-[#94a3b8] font-semibold py-8 text-center">Loading students…</p>
          ) : students.length === 0 ? (
            <p className="text-sm text-[#94a3b8] font-semibold py-8 text-center rounded-xl bg-[#fafafa] border border-dashed border-black/[0.08]">
              No students match your search.
            </p>
          ) : (
            students.map((student) => {
              const isEnrolled = selectedIds.includes(student.id);
              const fees = student.fees || {};
              const status = fees.payment_status || "NONE";

              return (
                <div
                  key={student.id}
                  className="rounded-2xl border border-black/[0.08] p-4 bg-[#fafafa] hover:bg-white transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <ProfileAvatar
                        src={student.profile_img}
                        name={student.name}
                        profileType="student"
                        onClick={() => onOpenStudentProfile?.(student.id)}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-extrabold text-[#0c0407] truncate">{student.name}</p>
                        <p className="text-[10px] text-[#94a3b8] font-semibold truncate mt-0.5">
                          {student.email}
                        </p>
                        {student.student_code && (
                          <p className="text-[10px] text-[#64748b] font-bold mt-1">{student.student_code}</p>
                        )}
                      </div>
                    </div>
                    <StatusBadge variant={isEnrolled ? "ok" : "info"}>
                      {isEnrolled ? "Enrolled" : "Not enrolled"}
                    </StatusBadge>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <StatusBadge variant={feeStatusVariant(status)}>
                      {feeStatusLabel(status)}
                    </StatusBadge>
                    {status !== "NONE" && (
                      <>
                        <span className="text-[10px] font-semibold text-[#64748b]">
                          Paid {formatInr(fees.paid_amount)}
                        </span>
                        <span className="text-[10px] font-semibold text-[#64748b]">
                          Due {formatInr(fees.due_amount)}
                        </span>
                        <span className="text-[10px] font-semibold text-[#94a3b8]">
                          Total {formatInr(fees.total_amount)}
                        </span>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleEnrollment(student)}
                    className={`mt-3 w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl border transition-colors cursor-pointer ${
                      isEnrolled
                        ? "border-[#b91c1c]/25 text-[#b91c1c] bg-[#fef2f2] hover:bg-[#fee2e2]"
                        : "border-[#059669]/25 text-[#059669] bg-[#ecfdf5] hover:bg-[#d1fae5]"
                    }`}
                  >
                    {isEnrolled ? (
                      <>
                        <FiUserMinus className="w-3.5 h-3.5" /> Remove from batch
                      </>
                    ) : (
                      <>
                        <FiUserPlus className="w-3.5 h-3.5" /> Enroll in batch
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="p-5 sm:p-6 border-t border-black/[0.06] shrink-0 bg-white space-y-3">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={!canPrev || loading}
              onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
              className={`${secondaryBtnClass} inline-flex items-center gap-1 disabled:opacity-40`}
            >
              <FiChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-[10px] font-bold text-[#94a3b8]">
              Page {Math.floor(offset / PAGE_SIZE) + 1} of {Math.max(1, Math.ceil(total / PAGE_SIZE))}
            </span>
            <button
              type="button"
              disabled={!canNext || loading}
              onClick={() => setOffset((o) => o + PAGE_SIZE)}
              className={`${secondaryBtnClass} inline-flex items-center gap-1 disabled:opacity-40`}
            >
              Next <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button type="button" onClick={onClose} className={`${primaryBtnClass} w-full`}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default BatchStudentPickerPanel;
