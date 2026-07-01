import { useCallback, useEffect, useRef, useState } from "react";
import {
  FiAward, FiCalendar, FiCheckCircle, FiExternalLink,
  FiUpload, FiStar, FiUser, FiAlertCircle, FiRefreshCw,
  FiFile, FiLink,
} from "react-icons/fi";
import axios from "axios";
import { WelcomeBanner, StatCards, Panel, Toast } from "../DashboardUI";
import {
  pageWrapClass, cardClass, labelMutedClass,
  primaryBtnClass, secondaryBtnClass, inputClass,
} from "../dashboardTheme";

/* ── helpers ─────────────────────────────────────────── */
const fmt = (d) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  }) : "—";

const isPastDeadline = (deadline) =>
  deadline ? new Date(deadline + "T23:59:59") < new Date() : false;

/* ── compress image / read file as base64 ────────────── */
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    if (file.size > 15 * 1024 * 1024) {
      reject(new Error("File must be under 15 MB"));
      return;
    }    const reader = new FileReader();
    reader.onload  = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

/* ── StarRating (read-only display) ─────────────────── */
function StarRating({ marks, max = 10 }) {
  const pct = Math.round((marks / max) * 100);
  const color = pct >= 70 ? "text-emerald-600" : pct >= 40 ? "text-amber-600" : "text-[#b91c1c]";
  return (
    <span className={`flex items-center gap-1 text-sm font-extrabold ${color}`}>
      <FiStar className="w-4 h-4 fill-current" />
      {marks}/{max}
    </span>
  );
}

/* ── SubmissionForm ───────────────────────────────────── */
function SubmissionForm({ projectId, existing, onDone }) {
  const fileRef              = useRef(null);
  const [mode, setMode]      = useState(existing?.file_url && !existing?.github_link ? "file" : "link");
  const [link, setLink]      = useState(existing?.github_link || "");
  const [fileData, setFileData] = useState(null);   // base64 data URL
  const [fileName, setFileName] = useState("");
  const [saving, setSaving]  = useState(false);
  const [error, setError]    = useState("");

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setError("");
    try {
      const data = await readFileAsBase64(f);
      setFileData(data);
      setFileName(f.name);
    } catch (err) {
      setError(err.message);
    }
    e.target.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (mode === "link" && !link.trim()) {
      setError("Please enter a link"); return;
    }
    if (mode === "file" && !fileData && !existing?.file_url) {
      setError("Please select a file"); return;
    }
    setSaving(true);
    try {
      await axios.post(`/api/students/me/projects/${projectId}/submit`, {
        github_link: mode === "link" ? link.trim() : "",
        file_url:    mode === "file" ? (fileData || existing?.file_url || "") : "",
      });
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed");
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-3 border-t border-black/[0.06]">
      {/* Mode toggle */}
      <div className="flex gap-2">
        {[
          { key: "link", label: "Submit a Link", icon: <FiLink className="w-3.5 h-3.5" /> },
          { key: "file", label: "Upload a File", icon: <FiFile className="w-3.5 h-3.5" /> },
        ].map(m => (
          <button key={m.key} type="button" onClick={() => setMode(m.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
              mode === m.key
                ? "bg-[#fc362d] text-white border-[#fc362d]"
                : "bg-[#fafafa] text-[#475569] border-black/[0.08] hover:border-[#fc362d]/30"
            }`}>
            {m.icon}{m.label}
          </button>
        ))}
      </div>

      {mode === "link" ? (
        <div>
          <label className={`${labelMutedClass} block mb-1.5`}>
            GitHub / Drive / any URL
          </label>
          <input type="url" value={link} onChange={e => setLink(e.target.value)}
            placeholder="https://github.com/username/repo  or  https://drive.google.com/…"
            className={inputClass} />
        </div>
      ) : (
        <div>
          <label className={`${labelMutedClass} block mb-1.5`}>
            Upload PDF or Word file <span className="text-[#94a3b8] font-normal normal-case">(max 15 MB)</span>
          </label>
          <div
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-black/[0.1] rounded-xl bg-[#fafafa] hover:border-[#fc362d]/40 hover:bg-[#fc362d]/[0.02] transition-all cursor-pointer flex items-center justify-center gap-2 py-5 text-[#94a3b8]"
          >
            <FiUpload className="w-5 h-5" />
            <span className="text-xs font-semibold">
              {fileName || (existing?.file_url ? "Change file" : "Click to choose file")}
            </span>
          </div>
          <input ref={fileRef} type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden" onChange={handleFile} />
          {existing?.file_url && !fileData && (
            <p className="text-[10px] text-[#94a3b8] mt-1">Currently: file already uploaded. Choose a new file to replace it.</p>
          )}
        </div>
      )}

      {error && <p className="text-xs text-[#b91c1c] font-semibold">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={saving}
          className={`${primaryBtnClass} flex items-center gap-1.5 disabled:opacity-50`}>
          {saving ? "Submitting…" : existing ? "Update Submission" : "Submit Assignment"}
        </button>
        <button type="button" onClick={onDone}
          className={secondaryBtnClass}>Cancel</button>
      </div>
    </form>
  );
}

/* ── ProjectCard ──────────────────────────────────────── */
function ProjectCard({ project, onRefresh }) {
  const [submitting, setSubmitting] = useState(false);
  const sub        = project.submission;
  const isGraded   = sub && sub.marks > 0;
  const past       = isPastDeadline(project.deadline);

  let statusLabel = "Pending";
  let statusClass = "bg-amber-50 text-amber-700 border-amber-200";
  if (isGraded)       { statusLabel = "Graded";    statusClass = "bg-emerald-50 text-emerald-700 border-emerald-200"; }
  else if (sub)       { statusLabel = "Submitted";  statusClass = "bg-blue-50 text-blue-700 border-blue-200"; }
  else if (past)      { statusLabel = "Overdue";    statusClass = "bg-[#fef2f2] text-[#b91c1c] border-[#b91c1c]/20"; }

  return (
    <div className={`${cardClass} overflow-hidden`}>
      {/* Top stripe — colored by status */}
      <div className={`h-1 w-full ${isGraded ? "bg-emerald-500" : sub ? "bg-blue-500" : past ? "bg-[#b91c1c]" : "bg-amber-400"}`} />

      <div className="p-5 space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-extrabold text-[#0c0407] leading-snug mb-1">
              {project.title}
            </h3>
            <div className="flex flex-wrap gap-3 text-[10px] font-semibold text-[#94a3b8]">
              {project.assigned_by_name && (
                <span className="flex items-center gap-1">
                  <FiUser className="w-3 h-3 text-[#fc362d]" />
                  Assigned by <strong className="text-[#475569] ml-0.5">{project.assigned_by_name}</strong>
                </span>
              )}
              <span className={`flex items-center gap-1 ${past && !sub ? "text-[#b91c1c]" : ""}`}>
                <FiCalendar className="w-3 h-3" />
                Deadline: <strong className="ml-0.5">{fmt(project.deadline)}</strong>
              </span>
            </div>
          </div>
          <span className={`shrink-0 text-[9px] font-extrabold px-2.5 py-1 rounded-lg border ${statusClass}`}>
            {statusLabel}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-[#636363] leading-relaxed font-medium bg-[#fafafa] rounded-xl px-4 py-3 border border-black/[0.05]">
          {project.description}
        </p>

        {/* Graded result */}
        {isGraded && (
          <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <FiCheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-1">
                <StarRating marks={sub.marks} max={10} />
                <span className="text-[10px] text-[#94a3b8] font-semibold">
                  Graded on {fmt(sub.submitted_at)}
                </span>
              </div>
              {sub.feedback && (
                <p className="text-xs text-[#475569] font-medium italic">"{sub.feedback}"</p>
              )}
            </div>
          </div>
        )}

        {/* Existing ungraded submission summary */}
        {sub && !isGraded && (
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <FiCheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-blue-700">Submitted · awaiting grade</p>
              <div className="flex flex-wrap gap-3 mt-1">
                {sub.github_link && (
                  <a href={sub.github_link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] font-bold text-[#475569] hover:text-[#fc362d]">
                    <FiExternalLink className="w-3 h-3" /> View link
                  </a>
                )}
                {sub.file_url && (() => {
                  const fileUrl = sub.file_url.startsWith("data:") ? sub.file_url : `http://localhost:3000${sub.file_url}`;
                  return (
                    <a href={fileUrl}
                      {...(sub.file_url.startsWith("data:") ? { download: "submission" } : { target: "_blank", rel: "noopener noreferrer" })}
                      className="flex items-center gap-1 text-[10px] font-bold text-[#475569] hover:text-[#fc362d]">
                      <FiFile className="w-3 h-3" /> View file
                    </a>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Submit / re-submit form */}
        {!submitting && !isGraded && (
          <button
            onClick={() => setSubmitting(true)}
            className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              sub
                ? `${secondaryBtnClass}`
                : `${primaryBtnClass}`
            }`}
          >
            <FiUpload className="w-3.5 h-3.5" />
            {sub ? "Edit Submission" : "Submit Assignment"}
          </button>
        )}

        {submitting && (
          <SubmissionForm
            projectId={project.id}
            existing={sub}
            onDone={() => { setSubmitting(false); onRefresh(); }}
          />
        )}
      </div>
    </div>
  );
}

/* ── Main StudentProjects page ───────────────────────── */
export default function StudentProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [toast, setToast]       = useState("");

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 3500); };

  const fetchProjects = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const { data } = await axios.get("/api/students/me/dashboard");
      setProjects(data.projects || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load projects");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const graded     = projects.filter(p => p.submission?.marks > 0).length;
  const submitted  = projects.filter(p => p.submission && !(p.submission.marks > 0)).length;
  const pending    = projects.filter(p => !p.submission).length;
  const avgMarks   = graded > 0
    ? (projects.filter(p => p.submission?.marks > 0)
        .reduce((s, p) => s + p.submission.marks, 0) / graded).toFixed(1)
    : "—";

  return (
    <div className={pageWrapClass}>
      <Toast message={toast} />

      <WelcomeBanner
        badge="Projects & Assignments"
        title="My Assignments"
        description="View all assigned projects, submit your work via link or file upload, and track your grades."
        actions={
          <button onClick={fetchProjects}
            className={`${secondaryBtnClass} flex items-center gap-1.5`}>
            <FiRefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        }
      />

      <StatCards stats={[
        { label: "Total Projects",  value: String(projects.length), change: "Assigned",       icon: <FiAward    className="w-5 h-5" /> },
        { label: "Submitted",       value: String(submitted + graded), change: "Turned in",   icon: <FiCheckCircle className="w-5 h-5" /> },
        { label: "Graded",          value: String(graded),          change: "With feedback",  icon: <FiStar     className="w-5 h-5" /> },
        { label: "Avg Score",       value: avgMarks === "—" ? "—" : `${avgMarks}/10`, change: "Out of 10", icon: <FiStar className="w-5 h-5" /> },
      ]} />

      {loading ? (
        <div className="text-center py-16 text-sm text-[#94a3b8] font-semibold">
          Loading assignments…
        </div>
      ) : error ? (
        <Panel>
          <div className="flex flex-col items-center py-12 gap-3 text-center">
            <FiAlertCircle className="w-10 h-10 text-[#fc362d]" />
            <p className="text-sm font-semibold text-[#636363]">{error}</p>
            <button onClick={fetchProjects} className={primaryBtnClass}>Retry</button>
          </div>
        </Panel>
      ) : projects.length === 0 ? (
        <Panel>
          <div className="flex flex-col items-center py-16 gap-3 text-center">
            <FiAward className="w-10 h-10 text-[#94a3b8]" />
            <p className="text-sm font-bold text-[#0c0407]">No projects assigned yet</p>
            <p className="text-xs text-[#94a3b8] font-medium max-w-xs">
              Your trainer hasn't assigned any projects yet. Check back later.
            </p>
          </div>
        </Panel>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Pending / overdue first */}
          {[
            ...projects.filter(p => !p.submission),
            ...projects.filter(p => p.submission && !(p.submission.marks > 0)),
            ...projects.filter(p => p.submission?.marks > 0),
          ].map(p => (
            <ProjectCard
              key={p.id}
              project={p}
              onRefresh={() => { fetchProjects(); showToast("Submission saved!"); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
