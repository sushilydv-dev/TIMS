import React, { useEffect, useState } from "react";
import { FiX, FiMail, FiPhone, FiCalendar, FiMapPin, FiAward, FiBook, FiShield, FiDollarSign, FiAlertCircle, FiLayers } from "react-icons/fi";
import axios from "axios";
import { StatusBadge, Toast } from "../DashboardUI";
import { inputClass, secondaryBtnClass, primaryBtnClass, labelMutedClass } from "../dashboardTheme";
import studentPlaceholder from "../../../assets/student_placeholder.png";

function formatInr(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

export function StudentFinancialProfile({ open, studentId, onClose, onUpdate }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [editMode, setEditMode] = useState(false);
  
  // Batch assignment state
  const [batchAssignOpen, setBatchAssignOpen]   = useState(false);
  const [allBatches, setAllBatches]             = useState([]);
  const [selectedBatchId, setSelectedBatchId]   = useState("");
  const [assigningBatch, setAssigningBatch]     = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    status: "",
    phone: "",
    address: "",
    college_name: "",
    qualification: "",
    profile_img: "",
  });

  const fetchDetails = async () => {
    if (!studentId) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`/api/admin/students/${studentId}`);
      setStudent(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load student profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && studentId) {
      setEditMode(false);
      fetchDetails();
    } else {
      setStudent(null);
      setError("");
    }
  }, [open, studentId]);

  useEffect(() => {
    if (student) {
      setProfileForm({
        name: student.User?.name || "",
        email: student.User?.email || "",
        status: student.User?.status || "",
        phone: student.phone || "",
        address: student.address || "",
        college_name: student.college_name || "",
        qualification: student.qualification || "",
        profile_img: student.profile_img || "",
      });
    }
  }, [student]);

  const showToastMsg = (msg) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 4000);
  };

  /* Load all batches for the assignment picker */
  const loadBatches = async () => {
    try {
      const { data } = await axios.get("/api/admin/batches");
      setAllBatches(Array.isArray(data) ? data : []);
    } catch { setAllBatches([]); }
  };

  const handleOpenBatchAssign = () => {
    setBatchAssignOpen(true);
    setSelectedBatchId("");
    loadBatches();
  };

  const handleAssignBatch = async () => {
    if (!selectedBatchId || !student?.id) return;
    setAssigningBatch(true);
    try {
      // Add student to the chosen batch via updateBatch (append to existing student list)
      const batchRes = await axios.get(`/api/admin/batches/${selectedBatchId}`);
      const existingStudentIds = (batchRes.data?.students || []).map(s => s.id).filter(Boolean);
      // student.id here is the Student table id
      const updatedIds = [...new Set([...existingStudentIds, student.id])];
      await axios.put(`/api/admin/batches/${selectedBatchId}`, { student_ids: updatedIds });
      showToastMsg("Batch assigned successfully!");
      setBatchAssignOpen(false);
      setSelectedBatchId("");
      fetchDetails();
      if (onUpdate) onUpdate();
    } catch (err) {
      showToastMsg(err.response?.data?.message || "Failed to assign batch");
    } finally { setAssigningBatch(false); }
  };

  const handleUpdateProfile = async (e) => {
    if (e) e.preventDefault();
    if (!profileForm.name?.trim() || !profileForm.email?.trim()) {
      showToastMsg("Name and email are required");
      return;
    }
    setLoading(true);
    try {
      await axios.put(`/api/admin/students/${studentId}`, profileForm);
      showToastMsg("Student profile updated successfully!");
      setEditMode(false);
      await fetchDetails();
      if (onUpdate) onUpdate();
    } catch (err) {
      showToastMsg(err.response?.data?.message || "Failed to update profile");
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    const nextStatus = profileForm.status === "active" ? "suspended" : "active";
    setLoading(true);
    try {
      await axios.put(`/api/admin/students/${studentId}`, {
        ...profileForm,
        status: nextStatus,
      });
      showToastMsg(
        nextStatus === "suspended"
          ? "Account deactivated successfully"
          : "Account activated successfully"
      );
      await fetchDetails();
      if (onUpdate) onUpdate();
    } catch (err) {
      showToastMsg(err.response?.data?.message || "Failed to change status");
      setLoading(false);
    }
  };

  const handleEditClick = (e) => {
    if (editMode) {
      handleUpdateProfile(e);
    } else {
      setEditMode(true);
    }
  };

  if (!open) return null;

  const primaryFee = student?.Fees?.[0] || null;
  const totalFee = Number(primaryFee?.total_amount || 0);
  const totalPaid = Number(primaryFee?.paid_ammount || primaryFee?.paid_amount || 0);
  const remainingBalance = Number(primaryFee?.due_amount || 0);

  return (
    <div className="fixed inset-0 z-[120] flex justify-end" role="dialog" aria-modal="true">
      <Toast message={toast} />

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
        <div className="flex items-start justify-between gap-3 p-5 border-b border-black/[0.06] shrink-0 bg-white">
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">
              Manage Student Account
            </span>
            <h2 className="text-xl font-bold text-[#0c0407] mt-1 tracking-tight truncate">
              {loading ? "Loading…" : student?.User?.name || "Student Details"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-black/10 bg-[#fafafa] text-[#475569] flex items-center justify-center hover:bg-[#f1f5f9] cursor-pointer shrink-0"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {error && (
            <p className="text-xs font-semibold text-[#b91c1c] bg-[#fef2f2] border border-[#b91c1c]/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          {loading ? (
            <div className="py-12 text-center text-sm font-semibold text-[#94a3b8]">
              Loading student details…
            </div>
          ) : !student ? (
            <div className="py-12 text-center text-sm font-semibold text-[#94a3b8]">
              No student data loaded.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header card with profile image & background */}
              <div className="relative rounded-2xl overflow-hidden border border-black/[0.04] bg-[#fafafa]">
                {/* Decorative Brand Gradient Background Banner */}
                <div className="h-24 bg-gradient-to-r from-rose-500 to-[#fc362d] w-full" />
                
                {/* Circular Profile Image */}
                <div className="flex flex-col items-center pb-5 mt-[-48px]">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-white">
                    <img
                      src={
                        profileForm.profile_img ||
                        studentPlaceholder
                      }
                      alt="Student Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = studentPlaceholder;
                      }}
                    />
                  </div>
                  
                  {/* Basic Metadata */}
                  <div className="text-center mt-3 space-y-1">
                    <h3 className="text-base font-bold text-[#0c0407]">
                      {profileForm.name}
                    </h3>
                    <p className="text-xs text-[#64748b] font-bold">
                      {student.student_code}
                    </p>
                    <div className="flex justify-center pt-1">
                      <span className={`text-[8px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wider ${
                        profileForm.status === "active"
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-600 border border-red-500/20"
                      }`}>
                        {profileForm.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exact Two Actions: Edit / Activate-Deactivate */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleToggleStatus}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                    profileForm.status === "active"
                      ? "bg-red-500/5 border-red-500/10 text-red-600 hover:bg-red-500/10"
                      : "bg-emerald-500/5 border-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10"
                  }`}
                >
                  {profileForm.status === "active" ? "Deactivate Account" : "Activate Account"}
                </button>
                <button
                  type="button"
                  onClick={handleEditClick}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl text-white ${primaryBtnClass}`}
                >
                  {editMode ? "Save Details" : "Edit Profile"}
                </button>
              </div>

              {editMode && (
                <div className="flex justify-end -mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setProfileForm({
                        name: student.User?.name || "",
                        email: student.User?.email || "",
                        status: student.User?.status || "",
                        phone: student.phone || "",
                        address: student.address || "",
                        college_name: student.college_name || "",
                        qualification: student.qualification || "",
                        profile_img: student.profile_img || "",
                      });
                    }}
                    className="text-[10px] font-bold text-[#fc362d] hover:underline"
                  >
                    Cancel Editing
                  </button>
                </div>
              )}

              {/* Details sections */}
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                {/* Personal Information */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[#475569] uppercase tracking-wider">
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 gap-3.5 bg-[#fafafa] border border-black/[0.04] rounded-2xl p-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-wider">Full Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        disabled={!editMode}
                        className={`${inputClass} disabled:bg-transparent disabled:border-transparent disabled:shadow-none disabled:p-0 disabled:text-xs disabled:font-bold disabled:text-[#0c0407]`}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-wider">Email Address</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        disabled={!editMode}
                        className={`${inputClass} disabled:bg-transparent disabled:border-transparent disabled:shadow-none disabled:p-0 disabled:text-xs disabled:font-bold disabled:text-[#0c0407]`}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-wider">Phone</label>
                      <input
                        type="text"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        disabled={!editMode}
                        className={`${inputClass} disabled:bg-transparent disabled:border-transparent disabled:shadow-none disabled:p-0 disabled:text-xs disabled:font-bold disabled:text-[#0c0407]`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-wider">Address</label>
                      {editMode ? (
                        <textarea
                          value={profileForm.address}
                          onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                          rows={2}
                          className={`${inputClass} resize-none`}
                        />
                      ) : (
                        <p className="text-xs font-bold text-[#0c0407]">{profileForm.address || "Not specified"}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-wider">College Name</label>
                      <input
                        type="text"
                        value={profileForm.college_name}
                        onChange={(e) => setProfileForm({ ...profileForm, college_name: e.target.value })}
                        disabled={!editMode}
                        className={`${inputClass} disabled:bg-transparent disabled:border-transparent disabled:shadow-none disabled:p-0 disabled:text-xs disabled:font-bold disabled:text-[#0c0407]`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-wider">Highest Qualification</label>
                      {editMode ? (
                        <select
                          value={profileForm.qualification}
                          onChange={(e) => setProfileForm({ ...profileForm, qualification: e.target.value })}
                          className={inputClass}
                        >
                          <option value="B.Tech">B.Tech</option>
                          <option value="MCA">MCA</option>
                          <option value="BCA">BCA</option>
                          <option value="Graduate">Graduate</option>
                          <option value="Postgraduate">Postgraduate</option>
                        </select>
                      ) : (
                        <p className="text-xs font-bold text-[#0c0407]">{profileForm.qualification}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[#94a3b8] uppercase tracking-wider">Profile Image URL</label>
                      <input
                        type="text"
                        value={profileForm.profile_img}
                        onChange={(e) => setProfileForm({ ...profileForm, profile_img: e.target.value })}
                        disabled={!editMode}
                        placeholder="https://example.com/avatar.jpg"
                        className={`${inputClass} disabled:bg-transparent disabled:border-transparent disabled:shadow-none disabled:p-0 disabled:text-xs disabled:font-bold disabled:text-[#0c0407]`}
                      />
                    </div>
                  </div>
                </div>

                {/* Enrollment & Academic Information */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[#475569] uppercase tracking-wider">
                    Academic Info
                  </h4>

                  {/* Batch not assigned alert */}
                  {!student?.Enrollments?.[0]?.Batch && (
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                      <FiAlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-amber-800">Batch not assigned</p>
                        <p className="text-[10px] text-amber-700 font-medium mt-0.5">
                          This student is enrolled but has not been assigned to any batch yet.
                        </p>
                      </div>
                      {!batchAssignOpen && (
                        <button
                          type="button"
                          onClick={handleOpenBatchAssign}
                          className="shrink-0 flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 cursor-pointer transition-colors"
                        >
                          <FiLayers className="w-3 h-3" /> Assign Batch
                        </button>
                      )}
                    </div>
                  )}

                  {/* Batch assignment picker */}
                  {batchAssignOpen && (
                    <div className="border border-[#fc362d]/20 rounded-xl p-4 bg-[#fff8f7] space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-[#0c0407]">Assign to a Batch</p>
                        <button onClick={() => setBatchAssignOpen(false)}
                          className="w-6 h-6 rounded-lg border border-black/10 flex items-center justify-center text-[#94a3b8] hover:text-[#0c0407] cursor-pointer">
                          <FiX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <select
                        value={selectedBatchId}
                        onChange={e => setSelectedBatchId(e.target.value)}
                        className={inputClass}
                      >
                        <option value="">Select a batch…</option>
                        {allBatches.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.batch_name}
                            {b.course_title ? ` — ${b.course_title}` : ""}
                            {b.trainer?.name ? ` (${b.trainer.name})` : ""}
                          </option>
                        ))}
                      </select>
                      {allBatches.length === 0 && (
                        <p className="text-[10px] text-amber-600 font-semibold">No batches found. Create one first.</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={!selectedBatchId || assigningBatch}
                          onClick={handleAssignBatch}
                          className={`${primaryBtnClass} text-xs py-2 flex items-center gap-1.5 disabled:opacity-50`}
                        >
                          <FiLayers className="w-3.5 h-3.5" />
                          {assigningBatch ? "Assigning…" : "Confirm Assignment"}
                        </button>
                        <button type="button" onClick={() => setBatchAssignOpen(false)}
                          className={`${secondaryBtnClass} text-xs py-2`}>Cancel</button>
                      </div>
                    </div>
                  )}

                  {/* Also allow re-assigning when batch is already set */}
                  {student?.Enrollments?.[0]?.Batch && !batchAssignOpen && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleOpenBatchAssign}
                        className="flex items-center gap-1 text-[10px] font-bold text-[#475569] hover:text-[#fc362d] cursor-pointer border border-black/[0.08] px-2.5 py-1.5 rounded-lg hover:border-[#fc362d]/30 transition-all"
                      >
                        <FiLayers className="w-3 h-3" /> Change Batch
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-[#fafafa] border border-black/[0.04] rounded-2xl p-4">
                    <div>
                      <span className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-wider">Course Title</span>
                      <p className="text-xs font-bold text-[#0c0407] mt-1">
                        {student?.Enrollments?.[0]?.Batch?.Course?.title || "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-wider">Batch Name</span>
                      <p className={`text-xs font-bold mt-1 ${student?.Enrollments?.[0]?.Batch ? "text-[#0c0407]" : "text-amber-600"}`}>
                        {student?.Enrollments?.[0]?.Batch?.batch_name || "Not assigned"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-wider">Joining Date</span>
                      <p className="text-xs font-bold text-[#0c0407] mt-1">
                        {student?.joining_date || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-wider">Student Code</span>
                      <p className="text-xs font-bold text-[#0c0407] mt-1">
                        {student?.student_code || "Unassigned"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Financial Ledger Metrics */}
                {primaryFee && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-[#475569] uppercase tracking-wider">
                      Financial Summary
                    </h4>
                    <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                      <div className="bg-[#fafafa] border border-black/[0.04] rounded-xl p-3">
                        <p className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-wider">Payment Plan</p>
                        <p className="text-xs font-extrabold text-[#0c0407] mt-1">
                          {primaryFee.payment_scheme_mode === "INSTALLMENT" ? "Installment" : "Full Payment"}
                        </p>
                      </div>
                      <div className="bg-[#fafafa] border border-black/[0.04] rounded-xl p-3">
                        <p className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-wider">Base Fee</p>
                        <p className="text-xs font-extrabold text-[#0c0407] mt-1">
                          {formatInr(primaryFee.base_amount ?? totalFee)}
                        </p>
                      </div>
                    </div>
                    {Number(primaryFee.discount_amount || 0) > 0 && (
                      <div className="bg-emerald-50 border border-emerald-500/10 rounded-xl p-3 mb-2.5">
                        <p className="text-[9px] text-emerald-700 font-bold uppercase tracking-wider">Discount Applied</p>
                        <p className="text-xs font-extrabold text-emerald-700 mt-1">
                          −{formatInr(primaryFee.discount_amount)}
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="bg-[#fafafa] border border-black/[0.04] rounded-xl p-3 text-center">
                        <p className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-wider">Contracted</p>
                        <p className="text-xs font-extrabold text-[#0c0407] mt-1">{formatInr(totalFee)}</p>
                      </div>
                      <div className="bg-[#fafafa] border border-black/[0.04] rounded-xl p-3 text-center">
                        <p className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-wider">Paid</p>
                        <p className="text-xs font-extrabold text-[#059669] mt-1">{formatInr(totalPaid)}</p>
                      </div>
                      <div className="bg-[#fafafa] border border-black/[0.04] rounded-xl p-3 text-center">
                        <p className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-wider">Due</p>
                        <p className="text-xs font-extrabold text-[#d97706] mt-1">{formatInr(remainingBalance)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default StudentFinancialProfile;
