import React, { useEffect, useState } from "react";
import { FiX, FiMail, FiPhone, FiMapPin, FiAward, FiBook, FiDollarSign, FiCalendar } from "react-icons/fi";
import axios from "axios";
import { StatusBadge } from "../DashboardUI";
import { secondaryBtnClass } from "../dashboardTheme";

function formatInr(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

function feeStatusVariant(status) {
  const key = String(status || "").toUpperCase();
  if (key === "PAID") return "ok";
  if (key === "PARTIAL") return "warn";
  if (key === "OVERDUE") return "danger";
  return "info";
}

function attendanceStatusVariant(status) {
  const key = String(status || "").toUpperCase();
  if (key === "PRESENT") return "ok";
  if (key === "ABSENT") return "danger";
  if (key === "LATE" || key === "LEAVE") return "warn";
  return "info";
}

export function StudentDetailPanel({ open, studentId, onClose }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !studentId) {
      setStudent(null);
      setError("");
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await axios.get(`/api/admin/students/${studentId}`);
        setStudent(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load student details");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [open, studentId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  // Calculate aggregates
  const attendances = student?.Attendances || [];
  const totalClasses = attendances.length;
  const presentClasses = attendances.filter((a) => String(a.status).toUpperCase() === "PRESENT").length;
  const attendanceRate = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

  const feesList = student?.Fees || [];
  const primaryFee = feesList[0] || null;

  const enrollments = student?.Enrollments || [];
  const primaryEnrollment = enrollments[0] || null;
  const batch = primaryEnrollment?.Batch || null;
  const course = batch?.Course || null;

  return (
    <div className="fixed inset-0 z-[120] flex justify-end" role="dialog" aria-modal="true">
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
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-5 sm:p-6 border-b border-black/[0.06] shrink-0">
          <div className="min-w-0 pr-2">
            <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">
              Student Profile
            </span>
            <h2 className="text-xl font-bold text-[#0c0407] mt-1 tracking-tight truncate">
              {loading ? "Loading…" : student?.User?.name || "Student Details"}
            </h2>
            {student?.student_code && (
              <p className="text-xs text-[#64748b] font-bold mt-1 tracking-wider">
                {student.student_code}
              </p>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {error && (
            <p className="text-xs font-semibold text-[#b91c1c] bg-[#fef2f2] border border-[#b91c1c]/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          {loading ? (
            <div className="py-12 text-center text-sm font-semibold text-[#94a3b8]">
              Loading profile details…
            </div>
          ) : !student ? (
            <div className="py-12 text-center text-sm font-semibold text-[#94a3b8]">
              No student data loaded.
            </div>
          ) : (
            <>
              {/* Basic Details Grid */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#475569] uppercase tracking-wider">
                  Information
                </h3>
                <div className="grid grid-cols-1 gap-3.5 bg-[#fafafa] border border-black/[0.05] rounded-2xl p-4">
                  <div className="flex items-center gap-3 text-xs">
                    <FiMail className="w-4 h-4 text-[#94a3b8] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-wider">Email</p>
                      <p className="font-semibold text-[#475569] truncate mt-0.5">{student.User?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <FiPhone className="w-4 h-4 text-[#94a3b8] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-wider">Phone</p>
                      <p className="font-semibold text-[#475569] mt-0.5">{student.phone || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <FiMapPin className="w-4 h-4 text-[#94a3b8] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-wider">Address</p>
                      <p className="font-semibold text-[#475569] mt-0.5">{student.address || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <FiAward className="w-4 h-4 text-[#94a3b8] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-wider">College</p>
                      <p className="font-semibold text-[#475569] mt-0.5">{student.college_name || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <FiBook className="w-4 h-4 text-[#94a3b8] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-wider">Qualification</p>
                      <p className="font-semibold text-[#475569] mt-0.5">{student.qualification || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <FiCalendar className="w-4 h-4 text-[#94a3b8] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-wider">Joining date</p>
                      <p className="font-semibold text-[#475569] mt-0.5">{student.joining_date || "Not specified"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course & Batch Information */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#475569] uppercase tracking-wider">
                  Course & Batch
                </h3>

                {!course && !batch ? (
                  <p className="text-xs text-[#94a3b8] font-semibold py-4 text-center rounded-xl bg-[#fafafa] border border-dashed border-black/[0.08]">
                    No course or batch assigned yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {course && (
                      <div className="bg-[#fafafa] border border-black/[0.05] rounded-xl p-4">
                        <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-wider mb-1">Course</p>
                        <p className="text-sm font-extrabold text-[#0c0407]">{course.title}</p>
                      </div>
                    )}
                    {batch && (
                      <div className="bg-[#fafafa] border border-black/[0.05] rounded-xl p-4">
                        <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-wider mb-1">Batch</p>
                        <p className="text-sm font-extrabold text-[#0c0407]">{batch.batch_name}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div>
                            <p className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-wider">Start Date</p>
                            <p className="text-xs font-semibold text-[#475569]">{batch.start_date}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-wider">End Date</p>
                            <p className="text-xs font-semibold text-[#475569]">{batch.end_date}</p>
                          </div>
                        </div>
                        {primaryEnrollment && (
                          <div className="mt-2 pt-2 border-t border-black/[0.05]">
                            <StatusBadge variant={primaryEnrollment.status === 'ACTIVE' ? 'ok' : 'warn'}>
                              {String(primaryEnrollment.status || 'PENDING').toUpperCase()}
                            </StatusBadge>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Fee Status */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#475569] uppercase tracking-wider">
                    Fees status
                  </h3>
                  {primaryFee && (
                    <StatusBadge variant={feeStatusVariant(primaryFee.payment_status)}>
                      {String(primaryFee.payment_status || "PENDING").toUpperCase()}
                    </StatusBadge>
                  )}
                </div>

                {!primaryFee ? (
                  <p className="text-xs text-[#94a3b8] font-semibold py-4 text-center rounded-xl bg-[#fafafa] border border-dashed border-black/[0.08]">
                    No fee record exists for this student.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#fafafa] border border-black/[0.05] rounded-xl p-3 text-center">
                      <p className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-wider">Total</p>
                      <p className="text-sm font-extrabold text-[#0c0407] mt-1">
                        {formatInr(primaryFee.total_amount)}
                      </p>
                    </div>
                    <div className="bg-[#fafafa] border border-black/[0.05] rounded-xl p-3 text-center">
                      <p className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-wider">Paid</p>
                      <p className="text-sm font-extrabold text-[#059669] mt-1">
                        {formatInr(primaryFee.paid_ammount || primaryFee.paid_amount)}
                      </p>
                    </div>
                    <div className="bg-[#fafafa] border border-black/[0.05] rounded-xl p-3 text-center">
                      <p className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-wider">Due</p>
                      <p className="text-sm font-extrabold text-[#d97706] mt-1">
                        {formatInr(primaryFee.due_amount)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Attendance Stats & Logs */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#475569] uppercase tracking-wider">
                    Attendance
                  </h3>
                  <span className="text-xs font-extrabold text-[#3b82f6] bg-[#eff6ff] border border-[#bfdbfe] px-2 py-0.5 rounded-lg">
                    {attendanceRate}% Present
                  </span>
                </div>

                <div className="bg-[#fafafa] border border-black/[0.05] rounded-2xl p-4">
                  <div className="flex items-center justify-around gap-2 mb-4 shrink-0 text-center border-b border-black/[0.05] pb-3">
                    <div>
                      <p className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-wider">Total days</p>
                      <p className="text-base font-extrabold text-[#475569] mt-0.5">{totalClasses}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-wider">Present</p>
                      <p className="text-base font-extrabold text-[#059669] mt-0.5">{presentClasses}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-wider">Absent</p>
                      <p className="text-base font-extrabold text-[#b91c1c] mt-0.5">
                        {attendances.filter((a) => String(a.status).toUpperCase() === "ABSENT").length}
                      </p>
                    </div>
                  </div>

                  {attendances.length === 0 ? (
                    <p className="text-xs text-[#94a3b8] font-semibold text-center py-4">
                      No attendance logs recorded.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {attendances.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center justify-between p-2 bg-white border border-black/[0.04] rounded-lg text-xs"
                        >
                          <span className="font-semibold text-[#475569]">{log.attendance_date}</span>
                          <StatusBadge variant={attendanceStatusVariant(log.status)}>
                            {String(log.status || "").toUpperCase()}
                          </StatusBadge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 border-t border-black/[0.06] shrink-0 bg-white">
          <button type="button" onClick={onClose} className={`${secondaryBtnClass} w-full py-2.5`}>
            Back to edit batch
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentDetailPanel;
