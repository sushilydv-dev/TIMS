import { useState } from "react";
import { FiX, FiStar, FiExternalLink, FiUpload } from "react-icons/fi";
import { isB64, fmt } from "./trainerUtils";
import { DocPreviewCard } from "./DocPreviewCard";
import {
  labelMutedClass, primaryBtnClass, inputClass,
} from "../dashboardTheme";

/**
 * Slide-over panel showing one student's submission with file/link preview and grading.
 */
export function SubmissionPanel({ sub, onClose, onGrade }) {
  const [marks, setMarks]       = useState(sub.marks > 0 ? String(sub.marks) : "");
  const [feedback, setFeedback] = useState(sub.feedback || "");
  const [saving, setSaving]     = useState(false);

  const hasLink  = Boolean(sub.github_link);
  const hasFile  = Boolean(sub.file_url);
  const isBase64 = hasFile && sub.file_url.startsWith("data:");

  const guessFileName = () => {
    if (!isBase64) return "submission-file";
    const mime = sub.file_url.split(";")[0].replace("data:", "");
    const ext  = mime === "application/pdf" ? ".pdf" : mime.includes("word") ? ".docx" : ".file";
    return `${(sub.student?.name || "submission").replace(/\s+/g, "_")}${ext}`;
  };

  const guessMaterialType = () => {
    if (!isBase64) return "PDF";
    const mime = sub.file_url.split(";")[0].replace("data:", "");
    if (mime.includes("pdf")) return "PDF";
    if (mime.includes("word")) return "DOC";
    return "PDF";
  };

  const handleSave = async () => {
    if (!marks || Number(marks) < 0 || Number(marks) > 10) return;
    setSaving(true);
    await onGrade(sub.id, marks, feedback);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-[#0c0407]/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-white border-l border-black/[0.08] shadow-[-12px_0_48px_rgba(0,0,0,0.12)] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-black/[0.07] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#fc362d]/10 flex items-center justify-center text-[#fc362d] text-sm font-extrabold shrink-0">
              {(sub.student?.name || "?").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-extrabold text-[#0c0407] truncate">{sub.student?.name}</h2>
              <p className="text-[10px] text-[#94a3b8] font-semibold mt-0.5">Submitted {fmt(sub.submitted_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {sub.graded && (
              <span className="flex items-center gap-1 text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                <FiStar className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" /> {sub.marks}/10
              </span>
            )}
            <button onClick={onClose}
              className="w-9 h-9 rounded-xl border border-black/10 flex items-center justify-center text-[#94a3b8] hover:text-[#0c0407] cursor-pointer">
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Link submission */}
          {hasLink && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 overflow-hidden">
              <div className="px-4 py-2 border-b border-blue-200 flex items-center gap-2">
                <FiExternalLink className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Submitted Link</span>
              </div>
              <div className="px-4 py-3 flex items-start justify-between gap-3">
                <a href={sub.github_link} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#0c0407] hover:text-[#fc362d] underline underline-offset-2 break-all flex-1">
                  {sub.github_link}
                </a>
                <a href={sub.github_link} target="_blank" rel="noopener noreferrer"
                  className={`shrink-0 ${primaryBtnClass} py-1.5 px-3 text-xs no-underline`}>Open</a>
              </div>
            </div>
          )}

          {/* File submission with preview */}
          {hasFile && (
            <div className="rounded-2xl border border-sky-200 overflow-hidden">
              <div className="px-4 py-2 border-b border-sky-200 bg-[#f0f9ff] flex items-center gap-2">
                <FiUpload className="w-3.5 h-3.5 text-sky-600 rotate-180" />
                <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">Uploaded File</span>
              </div>
              {isBase64 ? (
                <DocPreviewCard
                  material={{
                    id: sub.id,
                    title: guessFileName(),
                    file_url: sub.file_url,
                    material_type: guessMaterialType(),
                  }}
                  showDelete={false}
                />
              ) : (
                <div className="px-4 py-3 flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-[#475569] break-all flex-1">{sub.file_url}</p>
                  <a href={sub.file_url} target="_blank" rel="noopener noreferrer"
                    className={`shrink-0 ${primaryBtnClass} py-1.5 px-3 text-xs no-underline flex items-center gap-1`}>
                    <FiExternalLink className="w-3 h-3" /> Open
                  </a>
                </div>
              )}
            </div>
          )}

          {!hasLink && !hasFile && (
            <p className="text-xs text-[#94a3b8] text-center py-6 bg-[#fafafa] rounded-xl border border-dashed border-black/[0.07]">
              No submission content found.
            </p>
          )}

          {/* Grade section */}
          <div className="border border-black/[0.08] rounded-2xl overflow-hidden">
            <div className={`px-4 py-3 border-b border-black/[0.07] flex items-center justify-between ${sub.graded ? "bg-emerald-50" : "bg-[#fafafa]"}`}>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${sub.graded ? "text-emerald-700" : "text-[#94a3b8]"}`}>
                {sub.graded ? "Grade Given" : "Grade Submission"}
              </span>
              {sub.graded && (
                <span className="text-xs font-extrabold text-emerald-700">{sub.marks}/10</span>
              )}
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className={`${labelMutedClass} block mb-1.5`}>Score (0 – 10)</label>
                <div className="flex items-center gap-3">
                  <input type="number" min={0} max={10} step={0.5}
                    value={marks} onChange={e => setMarks(e.target.value)}
                    className={`${inputClass} w-24 text-sm`} placeholder="e.g. 8" />
                  {marks && !isNaN(Number(marks)) && (
                    <div className="flex-1 h-2 rounded-full bg-[#f1f5f9] overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (Number(marks) / 10) * 100)}%`,
                          background: Number(marks) >= 7 ? "#059669" : Number(marks) >= 5 ? "#d97706" : "#b91c1c",
                        }} />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className={`${labelMutedClass} block mb-1.5`}>Remarks / Feedback</label>
                <textarea value={feedback} onChange={e => setFeedback(e.target.value)}
                  className={`${inputClass} min-h-[80px] resize-y text-sm`}
                  placeholder="Good use of components. Improve error handling…" />
              </div>
              <button onClick={handleSave} disabled={saving || !marks}
                className={`${primaryBtnClass} w-full flex items-center justify-center gap-2 disabled:opacity-50`}>
                {saving ? "Saving…" : sub.graded ? "Update Grade" : "Submit Grade"}
              </button>
            </div>
          </div>

          {sub.graded && sub.feedback && (
            <div className="bg-[#fafafa] border border-black/[0.07] rounded-xl px-4 py-3">
              <p className={`${labelMutedClass} mb-1`}>Feedback on record</p>
              <p className="text-xs text-[#475569] leading-relaxed italic">"{sub.feedback}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SubmissionPanel;
