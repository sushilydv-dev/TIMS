import { useState } from "react";
import axios from "axios";
import {
  FiPlus, FiEdit2, FiTrash2, FiCalendar,
  FiAward, FiStar, FiExternalLink, FiX,
} from "react-icons/fi";
import { Panel, PanelHeader, Toast } from "../DashboardUI";
import {
  primaryBtnClass, secondaryBtnClass, inputClass, labelMutedClass, cardClass,
} from "../dashboardTheme";
import { fmt } from "./trainerUtils";
import { SubmissionPanel } from "./SubmissionPanel";

/**
 * Projects tab — create/edit/delete projects and review student submissions.
 */
export function BatchProjects({ batchId, projects, onRefresh }) {
  const [toast, setToast]           = useState("");
  const [projModal, setProjModal]   = useState(false);
  const [projEdit, setProjEdit]     = useState(null);
  const [projForm, setProjForm]     = useState({ title: "", description: "", deadline: "" });
  const [projSaving, setProjSaving] = useState(false);
  const [expandedProj, setExpandedProj] = useState(null);
  const [selectedSub, setSelectedSub]   = useState(null);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 3500); };

  const openCreate = () => { setProjEdit(null); setProjForm({ title: "", description: "", deadline: "" }); setProjModal(true); };
  const openEdit   = (p)  => { setProjEdit(p);  setProjForm({ title: p.title, description: p.description, deadline: p.deadline }); setProjModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setProjSaving(true);
    try {
      if (projEdit) {
        await axios.put(`/api/trainer/projects/${projEdit.id}`, projForm);
        showToast("Project updated");
      } else {
        await axios.post(`/api/trainer/batches/${batchId}/projects`, projForm);
        showToast("Project created");
      }
      setProjModal(false);
      onRefresh();
    } catch (err) { showToast(err.response?.data?.message || "Save failed"); }
    finally { setProjSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project and all its submissions?")) return;
    try { await axios.delete(`/api/trainer/projects/${id}`); showToast("Deleted"); onRefresh(); }
    catch (err) { showToast(err.response?.data?.message || "Delete failed"); }
  };

  const handleGrade = async (subId, marks, feedback) => {
    try {
      await axios.put(`/api/trainer/submissions/${subId}/grade`, { marks: Number(marks), feedback });
      showToast("Grade saved");
      onRefresh();
      // update the selected sub in the panel
      const updated = projects.flatMap(p => p.submissions).find(s => s.id === subId);
      if (updated) setSelectedSub({ ...updated, marks: Number(marks), feedback, graded: true });
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
          eyebrow="Assignments"
          title="Projects & Assignments"
          action={
            <button onClick={openCreate} className={`${primaryBtnClass} flex items-center gap-1.5`}>
              <FiPlus className="w-3.5 h-3.5" /> New Project
            </button>
          }
        />

        {/* Create / edit modal */}
        {projModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog">
            <div className="absolute inset-0 bg-[#0c0407]/40 backdrop-blur-sm" onClick={() => setProjModal(false)} />
            <div className={`relative w-full max-w-lg ${cardClass} p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)]`}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-extrabold text-[#0c0407]">
                  {projEdit ? "Edit Project" : "Create New Project"}
                </h2>
                <button onClick={() => setProjModal(false)}
                  className="w-8 h-8 rounded-xl border border-black/10 flex items-center justify-center text-[#94a3b8] hover:text-[#0c0407] cursor-pointer">
                  <FiX className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className={`${labelMutedClass} block mb-1.5`}>Project Title</label>
                  <input required value={projForm.title}
                    onChange={e => setProjForm(p => ({ ...p, title: e.target.value }))}
                    className={inputClass} placeholder="e.g. Build a REST API" />
                </div>
                <div>
                  <label className={`${labelMutedClass} block mb-1.5`}>Description / Instructions</label>
                  <textarea required value={projForm.description}
                    onChange={e => setProjForm(p => ({ ...p, description: e.target.value }))}
                    className={`${inputClass} min-h-[90px] resize-y`}
                    placeholder="Describe requirements, deliverables and evaluation criteria…" />
                </div>
                <div>
                  <label className={`${labelMutedClass} block mb-1.5`}>Submission Deadline</label>
                  <input required type="date" value={projForm.deadline}
                    onChange={e => setProjForm(p => ({ ...p, deadline: e.target.value }))}
                    className={inputClass} />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="submit" disabled={projSaving}
                    className={`${primaryBtnClass} flex-1 disabled:opacity-50`}>
                    {projSaving ? "Saving…" : projEdit ? "Save Changes" : "Create Project"}
                  </button>
                  <button type="button" onClick={() => setProjModal(false)}
                    className={secondaryBtnClass}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Project list */}
        {projects.length === 0 ? (
          <div className="text-center py-12 bg-[#fafafa] rounded-2xl border border-dashed border-black/[0.07]">
            <FiAward className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#94a3b8]">No projects assigned yet.</p>
            <button onClick={openCreate} className={`${primaryBtnClass} mt-4 inline-flex items-center gap-1.5`}>
              <FiPlus className="w-3.5 h-3.5" /> Create First Project
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map(proj => {
              const pendingSubs = proj.submissions.filter(s => !s.graded).length;
              const isExpanded  = expandedProj === proj.id;
              const isPast      = proj.deadline && proj.deadline < new Date().toISOString().slice(0, 10);

              return (
                <div key={proj.id} className="border border-black/[0.07] rounded-2xl overflow-hidden">
                  {/* Project header */}
                  <div className="flex items-start justify-between gap-3 p-5 bg-white">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-sm font-extrabold text-[#0c0407] leading-snug">{proj.title}</h3>
                        {pendingSubs > 0 && (
                          <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                            {pendingSubs} to grade
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#636363] font-medium leading-relaxed mb-2">{proj.description}</p>
                      <div className="flex flex-wrap gap-3 text-[10px] font-semibold text-[#94a3b8]">
                        <span className={`flex items-center gap-1 ${isPast ? "text-[#b91c1c]" : ""}`}>
                          <FiCalendar className="w-3 h-3" />
                          Deadline: <strong>{proj.deadline || "—"}</strong>
                        </span>
                        <span>{proj.submission_count} submitted · {proj.graded_count} graded</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setExpandedProj(isExpanded ? null : proj.id)}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-xl border cursor-pointer transition-all ${
                          isExpanded
                            ? "bg-[#fc362d] text-white border-[#fc362d]"
                            : "bg-[#f1f5f9] text-[#475569] border-black/[0.07] hover:border-[#fc362d]/30"
                        }`}
                      >
                        {isExpanded ? "Hide" : `Submissions (${proj.submission_count})`}
                      </button>
                      <button onClick={() => openEdit(proj)}
                        className="w-7 h-7 rounded-lg border border-black/10 flex items-center justify-center text-[#475569] hover:text-[#fc362d] cursor-pointer">
                        <FiEdit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(proj.id)}
                        className="w-7 h-7 rounded-lg border border-black/10 flex items-center justify-center text-[#94a3b8] hover:text-[#b91c1c] cursor-pointer">
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Student submission list */}
                  {isExpanded && (
                    <div className="border-t border-black/[0.06] bg-[#fafafa] divide-y divide-black/[0.04]">
                      {proj.submissions.length === 0 ? (
                        <p className="text-xs text-[#94a3b8] text-center py-5">No submissions yet.</p>
                      ) : (
                        proj.submissions.map(sub => (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => setSelectedSub(sub)}
                            className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-white transition-colors group text-left"
                          >
                            <div className="w-8 h-8 rounded-full bg-[#fc362d]/10 flex items-center justify-center text-[#fc362d] text-[10px] font-extrabold shrink-0">
                              {(sub.student?.name || "?").slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-[#0c0407] group-hover:text-[#fc362d] transition-colors truncate">
                                {sub.student?.name}
                              </p>
                              <p className="text-[10px] text-[#94a3b8] font-semibold mt-0.5">
                                Submitted {fmt(sub.submitted_at)}
                                {sub.github_link && " · Link"}
                                {sub.file_url && " · File"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {sub.graded ? (
                                <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                                  <FiStar className="w-3 h-3 fill-emerald-500 text-emerald-500" /> {sub.marks}/10
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                                  Grade
                                </span>
                              )}
                              <FiExternalLink className="w-3.5 h-3.5 text-[#94a3b8] group-hover:text-[#fc362d]" />
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </>
  );
}

export default BatchProjects;
