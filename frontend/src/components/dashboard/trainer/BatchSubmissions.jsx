import { useState } from "react";
import axios from "axios";
import { FiAward } from "react-icons/fi";
import { Panel, PanelHeader, StatusBadge, Toast } from "../DashboardUI";
import { BasicProfile, useBasicProfile } from "../BasicProfile";
import { ProfileAvatar } from "../ProfileAvatar";
import { fmt } from "./trainerUtils";
import { SubmissionPanel } from "./SubmissionPanel";

/**
 * All Submissions tab — flat list of every submission across all projects, with quick grading.
 */
export function BatchSubmissions({ batchId, submissions, onRefresh }) {
  const [toast, setToast]           = useState("");
  const [selectedSub, setSelectedSub] = useState(null);
  const {
    basicProfileOpen,
    basicProfileType,
    basicProfileId,
    openBasicProfile,
    closeBasicProfile,
  } = useBasicProfile();

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
      <BasicProfile
        open={basicProfileOpen}
        profileType={basicProfileType}
        profileId={basicProfileId}
        onClose={closeBasicProfile}
      />

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
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <FiAward className="w-10 h-10 text-[#94a3b8]" />
            <p className="text-xs text-[#94a3b8] font-semibold">No submissions yet</p>
          </div>
        ) : (
          <div className="divide-y divide-black/[0.04]">
            {submissions.map(sub => (
              <div
                key={sub.id}
                className="w-full flex items-center gap-3 py-3.5 px-1 hover:bg-[#fafafa] transition-colors group"
              >
                <ProfileAvatar
                  src={sub.student?.profile_img}
                  name={sub.student?.name}
                  profileType="student"
                  onClick={() => openBasicProfile("student", sub.student?.id)}
                />
                <button
                  type="button"
                  onClick={() => setSelectedSub(sub)}
                  className="flex-1 min-w-0 flex items-center gap-3 text-left"
                >
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
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}

export default BatchSubmissions;
