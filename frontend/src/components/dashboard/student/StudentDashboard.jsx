import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiAward, FiUsers, FiBookOpen, FiCheck, FiCheckCircle,
  FiDownload, FiLock, FiUnlock, FiCreditCard, FiExternalLink,
  FiAlertCircle, FiUpload,
} from "react-icons/fi";
import axios from "axios";
import {
  WelcomeBanner, StatCards, PrimaryButton, SecondaryButton, Toast,
} from "../DashboardUI";
import {
  pageWrapClass, inputClass, primaryBtnClass, cardClass, labelMutedClass,
} from "../dashboardTheme";
import { MyFeesDesk } from "./MyFeesDesk";

/* ── helpers ─────────────────────────────────────────── */
const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

/* ── AttendanceDonut ──────────────────────────────────── */
function AttendanceDonut({ pct, present, absent, total }) {
  const displayPct = isNaN(pct) ? 0 : pct;
  return (
    <div className="bg-white border border-black/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
      <h3 className="text-sm font-extrabold text-[#0c0407] mb-4">Attendance Progress</h3>
      <div className="flex items-center justify-around gap-4 h-40">
        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path strokeWidth="3.5" stroke="#f1f5f9" fill="none" d="M18 2.0845 a15.9155 15.9155 0 0 1 0 31.831 a15.9155 15.9155 0 0 1 0-31.831" />
            <path strokeWidth="3.5" strokeLinecap="round" fill="none"
              stroke={displayPct >= 75 ? "#059669" : displayPct >= 50 ? "#d97706" : "#b91c1c"}
              strokeDasharray={`${displayPct}, 100`}
              d="M18 2.0845 a15.9155 15.9155 0 0 1 0 31.831 a15.9155 15.9155 0 0 1 0-31.831"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-xl font-extrabold text-[#0c0407]">{displayPct}%</span>
            <span className="text-[8px] font-bold text-[#94a3b8] uppercase tracking-wider">Attendance</span>
          </div>
        </div>
        <div className="space-y-3 text-xs font-semibold text-[#636363]">
          <div><p className={labelMutedClass}>Total Classes</p><p className="text-sm font-extrabold text-[#0c0407]">{total}</p></div>
          <div><p className={labelMutedClass}>Present</p><p className="text-sm font-extrabold text-[#059669]">{present}</p></div>
          <div><p className={labelMutedClass}>Absent</p><p className="text-sm font-extrabold text-[#b91c1c]">{absent}</p></div>
        </div>
      </div>
      {displayPct < 75 && total > 0 && (
        <p className="text-[10px] text-[#b91c1c] font-semibold mt-3 bg-[#fef2f2] rounded-lg px-3 py-2 border border-[#b91c1c]/10">
          ⚠ Attendance below 75% minimum threshold
        </p>
      )}
    </div>
  );
}

/* ── ProjectCard ──────────────────────────────────────── */
function ProjectCard({ project, onSubmit }) {
  const [link, setLink]   = useState(project.submission?.github_link || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const hasSubmission     = Boolean(project.submission);
  const isGraded          = hasSubmission && project.submission.marks > 0;
  const isPastDeadline    = project.deadline && new Date(project.deadline) < new Date();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!link.trim()) return;
    setSaving(true); setError("");
    try {
      await onSubmit(project.id, link);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit");
    } finally { setSaving(false); }
  };

  return (
    <div className="bg-white border border-black/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.05)] space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-sm font-extrabold text-[#0c0407] leading-snug">{project.title}</h4>
          <p className="text-xs text-[#636363] mt-1 leading-relaxed">{project.description}</p>
        </div>
        <span className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-lg border ${
          isGraded ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : hasSubmission ? "bg-[#f1f5f9] text-[#475569] border-black/10"
          : isPastDeadline ? "bg-[#fef2f2] text-[#b91c1c] border-[#b91c1c]/20"
          : "bg-amber-50 text-amber-700 border-amber-200"
        }`}>
          {isGraded ? "Graded" : hasSubmission ? "Submitted" : isPastDeadline ? "Overdue" : "Pending"}
        </span>
      </div>

      {project.deadline && (
        <p className="text-[10px] text-[#94a3b8] font-semibold">
          Deadline: <strong className={isPastDeadline && !hasSubmission ? "text-[#b91c1c]" : "text-[#475569]"}>{fmt(project.deadline)}</strong>
        </p>
      )}

      {isGraded && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-1">
          <p className="text-xs font-bold text-emerald-700">Score: {project.submission.marks}/100</p>
          {project.submission.feedback && (
            <p className="text-[11px] text-[#636363]">"{project.submission.feedback}"</p>
          )}
          {project.submission.github_link && (
            <a href={project.submission.github_link} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] font-bold text-[#475569] hover:text-[#fc362d]">
              <FiExternalLink className="w-3 h-3" /> View Repository
            </a>
          )}
        </div>
      )}

      {!isGraded && (
        <form onSubmit={handleSubmit} className="space-y-2">
          <label className={`${labelMutedClass} block`}>GitHub Repository Link</label>
          <div className="flex gap-2">
            <input type="url" required value={link} onChange={e => setLink(e.target.value)}
              placeholder="https://github.com/username/repo"
              className={`${inputClass} flex-1`} />
            <button type="submit" disabled={saving}
              className={`${primaryBtnClass} px-4 shrink-0 disabled:opacity-50`}>
              {saving ? "…" : hasSubmission ? "Update" : "Submit"}
            </button>
          </div>
          {error && <p className="text-[10px] text-[#b91c1c] font-semibold">{error}</p>}
          {hasSubmission && (
            <p className="text-[10px] text-[#94a3b8] flex items-center gap-1">
              <FiCheckCircle className="w-3 h-3 text-emerald-500" /> Submitted · awaiting grade
            </p>
          )}
        </form>
      )}
    </div>
  );
}

/* ── Main StudentDashboard ────────────────────────────── */
export const StudentDashboard = ({ user }) => {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [activeTab, setActiveTab]     = useState("workspace");
  const [dashData, setDashData]       = useState(null);
  const [loading, setLoading]         = useState(true);
  const [feeData, setFeeData]         = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => { setToastMessage(msg); setTimeout(() => setToastMessage(""), 4000); };

  /* Sync tab from URL */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "fees") setActiveTab("fees");
    else setActiveTab("workspace");
  }, [location.search]);

  /* Fetch dashboard data */
  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/students/me/dashboard");
      setDashData(data);
    } catch { setDashData(null); }
    finally { setLoading(false); }
  }, []);

  /* Fetch fee status */
  const fetchFeeStatus = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/students/me/fees");
      setFeeData(data);
    } catch { setFeeData(null); }
  }, []);

  useEffect(() => { fetchDashboard(); fetchFeeStatus(); }, [fetchDashboard, fetchFeeStatus]);

  /* Project submission handler */
  const handleProjectSubmit = async (projectId, githubLink) => {
    await axios.post(`/api/students/me/projects/${projectId}/submit`, { github_link: githubLink });
    showToast("Project submitted successfully!");
    fetchDashboard();
  };

  /* Derived data */
  const fee = feeData?.Fees?.[0];
  const paymentStatus  = fee?.payment_status || "NONE";
  const feeBalance     = Number(fee?.due_amount || 0);
  const isPendingFirst = ["PENDING_FIRST_PAYMENT", "NONE"].includes(paymentStatus);
  const paymentScheme  = fee?.payment_scheme_mode || "FULL";
  const isFullPlan     = paymentScheme === "FULL";

  const attendance     = dashData?.attendance || { total: 0, present: 0, absent: 0, pct: 0 };
  const projects       = dashData?.projects   || [];
  const materials      = dashData?.materials  || [];
  const batchInfo      = dashData?.batch;
  const courseInfo     = dashData?.course;
  const trainerInfo    = dashData?.trainer;
  const studentInfo    = dashData?.student;

  const submittedCount = projects.filter(p => p.submission).length;
  const gradedCount    = projects.filter(p => p.submission?.marks > 0).length;
  const isEligible     = attendance.pct >= 85 && feeBalance === 0 && !isPendingFirst;

  if (loading) return (
    <div className={pageWrapClass}>
      <div className="py-16 text-center text-sm font-semibold text-[#94a3b8]">Loading student workspace…</div>
    </div>
  );

  return (
    <div className={pageWrapClass}>
      <Toast message={toastMessage} />

      {/* Tab nav */}
      <div className="flex border-b border-black/[0.08] text-xs font-bold text-[#94a3b8] gap-6 pb-0">
        {[
          { key: "workspace", label: "My Workspace",       path: "/dashboard" },
          { key: "fees",      label: "Fees & Access Desk", path: "/dashboard?tab=fees" },
        ].map(t => (
          <button key={t.key} onClick={() => navigate(t.path)}
            className={`pb-3 transition-all relative cursor-pointer ${activeTab === t.key ? "text-[#fc362d] font-extrabold" : "hover:text-[#0c0407]"}`}>
            {t.label}
            {activeTab === t.key && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#fc362d] rounded-full" />}
          </button>
        ))}
      </div>

      {activeTab === "workspace" ? (
        <div className="relative">
          {/* Fee lock overlay */}
          {isPendingFirst && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/50 backdrop-blur-[6px] rounded-2xl">
              <div className="bg-white border border-black/10 p-6 rounded-2xl max-w-sm text-center shadow-xl">
                <FiLock className="w-12 h-12 text-[#fc362d] mx-auto mb-3 animate-bounce" />
                <h3 className="text-base font-extrabold text-[#0c0407]">Access Restricted</h3>
                <p className="text-xs text-[#636363] mt-2 leading-relaxed">
                  Complete your {isFullPlan ? "full course fee" : "initial installment"} to unlock your workspace.
                </p>
                <button onClick={() => navigate("/dashboard?tab=fees")}
                  className={`mt-4 px-5 py-2.5 ${primaryBtnClass} mx-auto block`}>
                  {isFullPlan ? "Pay Full Fee" : "Pay Installment"}
                </button>
              </div>
            </div>
          )}

          <div className={isPendingFirst ? "filter blur-[3px] pointer-events-none select-none space-y-6" : "space-y-6"}>

            <WelcomeBanner
              badge="Student Workspace"
              title={`Welcome back, ${user?.name || "Student"}!`}
              description="Track attendance, access materials, and submit your projects."
              actions={
                <>
                  <PrimaryButton onClick={() => document.getElementById("projects-section")?.scrollIntoView({ behavior: "smooth" })}>
                    View Projects
                  </PrimaryButton>
                  <SecondaryButton onClick={() => document.getElementById("materials-section")?.scrollIntoView({ behavior: "smooth" })}>
                    Study Materials
                  </SecondaryButton>
                </>
              }
            />

            <StatCards stats={[
              { label: "Attendance",    value: `${attendance.pct}%`,   change: attendance.pct >= 75 ? "On track" : "Below target", icon: <FiUsers className="w-5 h-5" />, trendType: attendance.pct >= 75 ? "up" : "down" },
              { label: "Projects",      value: `${submittedCount}/${projects.length}`, change: "Submitted",  icon: <FiAward className="w-5 h-5" /> },
              { label: "Materials",     value: String(materials.length), change: "Available",               icon: <FiBookOpen className="w-5 h-5" /> },
              { label: "Fees Due",      value: `₹${feeBalance.toLocaleString("en-IN")}`, change: feeBalance === 0 ? "Cleared" : "Outstanding", icon: <FiCreditCard className="w-5 h-5" />, trendType: feeBalance === 0 ? "up" : "down" },
            ]} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* ── Left ── */}
              <div className="lg:col-span-2 space-y-6">

                {/* Projects */}
                <div id="projects-section" className="scroll-mt-6">
                  <h3 className="text-base font-extrabold text-[#0c0407] mb-4">
                    Active Projects
                    {projects.length > 0 && <span className="ml-2 text-[#94a3b8] font-semibold text-sm">({projects.length})</span>}
                  </h3>
                  {projects.length === 0 ? (
                    <div className="bg-[#fafafa] border border-dashed border-black/[0.08] rounded-2xl p-8 text-center">
                      <FiAward className="w-8 h-8 text-[#94a3b8] mx-auto mb-2" />
                      <p className="text-xs text-[#94a3b8] font-semibold">No projects assigned yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {projects.map(p => (
                        <ProjectCard key={p.id} project={p} onSubmit={handleProjectSubmit} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Materials */}
                <div id="materials-section" className="scroll-mt-6">
                  <h3 className="text-base font-extrabold text-[#0c0407] mb-4">Study Materials</h3>
                  {materials.length === 0 ? (
                    <div className="bg-[#fafafa] border border-dashed border-black/[0.08] rounded-2xl p-8 text-center">
                      <FiBookOpen className="w-8 h-8 text-[#94a3b8] mx-auto mb-2" />
                      <p className="text-xs text-[#94a3b8] font-semibold">No materials uploaded yet by your trainer.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {materials.map(m => (
                        <a key={m.id} href={m.file_url} target="_blank" rel="noopener noreferrer"
                          className="group flex items-center gap-3 p-4 bg-white border border-black/[0.08] rounded-2xl hover:border-[#fc362d]/25 hover:shadow-md transition-all no-underline">
                          <div className="w-9 h-9 rounded-xl bg-[#fc362d]/10 flex items-center justify-center shrink-0">
                            <FiBookOpen className="w-4 h-4 text-[#fc362d]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#0c0407] truncate group-hover:text-[#fc362d] transition-colors">{m.title}</p>
                            <p className="text-[10px] text-[#94a3b8] font-semibold mt-0.5">{m.material_type}</p>
                          </div>
                          <FiExternalLink className="w-3.5 h-3.5 text-[#94a3b8] group-hover:text-[#fc362d] shrink-0" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* ── Right ── */}
              <div className="space-y-5">

                {/* Smart ID card */}
                <div className="bg-white border border-black/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
                  <h3 className="text-sm font-extrabold text-[#0c0407] mb-4">Trainee Smartcard</h3>
                  <div className="relative overflow-hidden aspect-[1.6/1] w-full rounded-2xl bg-gradient-to-br from-[#1a1a1f] via-[#141418] to-[#0c0407] p-5 text-white shadow-[0_8px_28px_rgba(0,0,0,0.2)]">
                    <div className="absolute top-0 right-0 -mt-6 -mr-6 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full blur-lg" />
                    <div className="h-full flex flex-col justify-between relative z-10">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-white/20 uppercase tracking-wider">Student Access Card</span>
                          <h4 className="text-sm font-extrabold tracking-tight mt-1.5">{studentInfo?.user?.name || user?.name || "—"}</h4>
                          <p className="text-[9px] text-white/70 font-bold uppercase tracking-wider">{courseInfo?.title || "Unassigned"}</p>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-extrabold text-sm">
                          {(studentInfo?.user?.name || user?.name || "ST").slice(0, 2).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[7px] font-bold text-white/40 uppercase">Student Code</p>
                          <p className="text-xs font-bold font-mono">{studentInfo?.student_code || "—"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[7px] font-bold text-white/40 uppercase">Batch</p>
                          <p className="text-[9px] font-bold">{batchInfo?.batch_name || "Unassigned"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attendance donut */}
                <AttendanceDonut
                  pct={attendance.pct}
                  present={attendance.present}
                  absent={attendance.absent}
                  total={attendance.total}
                />

                {/* Trainer info */}
                {trainerInfo && (
                  <div className="bg-white border border-black/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
                    <h3 className="text-sm font-extrabold text-[#0c0407] mb-3">Your Trainer</h3>
                    <div className="flex items-center gap-3">
                      <img
                        src={trainerInfo.profile_img || `https://api.dicebear.com/7.x/initials/svg?seed=${trainerInfo.name}`}
                        alt={trainerInfo.name}
                        className="w-10 h-10 rounded-xl object-cover border border-black/[0.08]"
                        onError={e => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${trainerInfo.name}`; }}
                      />
                      <div>
                        <p className="text-sm font-bold text-[#0c0407]">{trainerInfo.name}</p>
                        <p className="text-[10px] text-[#94a3b8] font-semibold mt-0.5">{trainerInfo.specialization}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Certificate locker */}
                <div className="bg-white border border-black/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
                  <h3 className="text-sm font-extrabold text-[#0c0407] mb-4">Graduation Certificate</h3>
                  <div className="bg-[#fafafa] border border-black/[0.07] rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isEligible ? "bg-emerald-100 text-emerald-600" : "bg-[#f1f5f9] text-[#94a3b8]"}`}>
                        {isEligible ? <FiUnlock className="w-4 h-4" /> : <FiLock className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-[#0c0407]">Completion Certificate</p>
                        <p className="text-[9px] text-[#94a3b8] font-semibold">TIMS verified credential</p>
                      </div>
                      <span className={`ml-auto text-[9px] font-bold px-2 py-0.5 rounded-lg border ${isEligible ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-amber-600 bg-amber-50 border-amber-200"}`}>
                        {isEligible ? "Ready" : "Locked"}
                      </span>
                    </div>

                    <div className="space-y-1.5 border-t border-black/[0.05] pt-3 text-[10px] font-bold text-[#636363]">
                      <div className="flex justify-between">
                        <span>Attendance ≥75%</span>
                        <span className={attendance.pct >= 75 ? "text-emerald-600" : "text-[#b91c1c]"}>{attendance.pct}% ({attendance.pct >= 75 ? "Pass" : "Fail"})</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fee Balance = ₹0</span>
                        <span className={feeBalance === 0 ? "text-emerald-600" : "text-[#b91c1c]"}>{feeBalance === 0 ? "Cleared" : `₹${feeBalance.toLocaleString("en-IN")} due`}</span>
                      </div>
                    </div>

                    {isEligible ? (
                      <button onClick={() => alert(`Downloading Certificate — CERT-${studentInfo?.id?.slice(0, 8) || "XXXX"}`)}
                        className={`w-full py-2.5 text-xs font-extrabold flex items-center justify-center gap-1.5 ${primaryBtnClass}`}>
                        <FiDownload className="w-3.5 h-3.5" /> Download Certificate
                      </button>
                    ) : (
                      <button disabled className="w-full py-2.5 text-xs font-extrabold text-[#94a3b8] bg-[#f1f5f9] rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed">
                        <FiLock className="w-3.5 h-3.5" /> Locked
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      ) : (
        <MyFeesDesk onPaymentSuccess={fetchFeeStatus} />
      )}
    </div>
  );
};

export default StudentDashboard;
