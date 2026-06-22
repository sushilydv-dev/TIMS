import { useState } from "react";
import axios from "axios";
import { FiCheckCircle } from "react-icons/fi";
import { Panel, PanelHeader, StatusBadge, Toast } from "../DashboardUI";
import { labelMutedClass, primaryBtnClass, secondaryBtnClass, inputClass } from "../dashboardTheme";
import { fmt } from "./trainerUtils";
import { SubmissionPanel } from "./SubmissionPanel";

/**
 * All Submissions tab — flat list of every submission across all projects, with quick grading.
 */
export function BatchSubmissions({ batchId, submissions, onRefresh }) {
  const [toast, setToast]           = useState("");
  const [selectedSub, setSelectedSub] = useState(null);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 3500); };

  const pendingCount = submissions.filter(s => !s.graded).length;

  const handleGrade = async (subId, marks, feedback) => {
    try {
      await axios.put(`/api/trainer/submissions/${subId}/grade`, { marks: Number(marks), feedback });
      showToast("Grade saved");
      onRefresh();
      if (selectedSub?.id === subId) {
        setSelectedSub(s => ({ ...s, marks: Number(marks), feedback, graded: true }));
      }
    } catch (err) { showToast(err.response?.data?.message || "Grade failed"); }
  };

  return (
    <>
      <Toast message={toast} />

      {selectedSub && (
        <SubmissionPanel
          sub={selectedSub}
          onClose={() => setSelectedSub(null)}
          onGrade={handleGrade}
        />
      )}

      <Panel>
        <PanelHeader
          eyebrow="Grading"
          title="All Student Submissions"
          action={
            <span className="text-xs font-bold text-[#475569] bg-[#f1f5f9] px-3 py-1 rounded-lg border border-black/[0.06]">
              {pendingCount} Pending
            </span>
          }
        />

        {submissions.length === 0 ? (
          <p className="text-xs text-[#94a3b8] text-center py-10 bg-[#fafafa] rounded-xl border border-dashed border-black/[0.07]">
            No submissions yet.
          </p>
        ) : (
          <div className="divide-y divide-black/[0.04]">
            {submissions.map(sub => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSub(sub)}
                className="w-full flex items-center gap-3 py-3.5 px-1 hover:bg-[#fafafa] transition-colors group text-left"
              >
                <div className="w-8 h-8 rounded-full bg-[#fc362d]/10 flex items-center justify-center text-[#fc362d] text-[10px] font-extrabold shrink-0">
                  {(sub.student?.name || "?").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#0c0407] group-hover:text-[#fc362d] transition-colors truncate">
                    {sub.student?.name}
                  </p>
                  <p className="text-[10px] text-[#94a3b8] font-semibold mt-0.5 truncate">
                    {sub.project?.title} · Submitted {fmt(sub.submitted_at)}
                  </p>
                </div>
                <StatusBadge variant={sub.graded ? "ok" : "warn"}>
                  {sub.graded ? `${sub.marks}/10` : "Pending"}
                </StatusBadge>
              </button>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}

export default BatchSubmissions;
