import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft, FiUsers, FiCalendar, FiBookOpen,
  FiLayers, FiCheckCircle, FiAlertCircle, FiExternalLink,
  FiUpload, FiTrash2, FiAward,
} from "react-icons/fi";
import axios from "axios";
import {
  WelcomeBanner, StatCards, Panel, PanelHeader,
  StatusBadge, Toast,
} from "../DashboardUI";
import {
  pageWrapClass, cardClass, labelMutedClass, primaryBtnClass,
  secondaryBtnClass, inputClass, badgeClass,
} from "../dashboardTheme";

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

/* ── Batch detail view ───────────────────────────────── */
function BatchDetail({ batchId, onBack }) {
  const [detail, setDetail]           = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [materials, setMaterials]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [tab, setTab]                 = useState("students");
  const [matForm, setMatForm]         = useState({ title: "", file_url: "", material_type: "PDF" });
  const [matSaving, setMatSaving]     = useState(false);
  const [gradingId, setGradingId]     = useState(null);
  const [gradeForm, setGradeForm]     = useState({});
  const [toast, setToast]             = useState("");

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 3500); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [d, s, m] = await Promise.all([
        axios.get(`/api/trainer/batches/${batchId}`),
        axios.get(`/api/trainer/batches/${batchId}/submissions`),
        axios.get(`/api/trainer/batches/${batchId}/materials`),
      ]);
      setDetail(d.data);
      setSubmissions(s.data);
      setMaterials(m.data);
    } catch { setDetail(null); }
    finally { setLoading(false); }
  }, [batchId]);

  useEffect(() => { load(); }, [load]);

  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    setMatSaving(true);
    try {
      await axios.post(`/api/trainer/batches/${batchId}/materials`, matForm);
      setMatForm({ title: "", file_url: "", material_type: "PDF" });
      showToast("Material uploaded");
      const { data } = await axios.get(`/api/trainer/batches/${batchId}/materials`);
      setMaterials(data);
    } catch (err) { showToast(err.response?.data?.message || "Upload failed"); }
    finally { setMatSaving(false); }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm("Delete this material?")) return;
    try { await axios.delete(`/api/trainer/materials/${id}`); load(); }
    catch (err) { showToast(err.response?.data?.message || "Delete failed"); }
  };

  const handleGrade = async (subId) => {
    const { marks, feedback } = gradeForm[subId] || {};
    if (!marks) { showToast("Enter marks first"); return; }
    try {
      await axios.put(`/api/trainer/submissions/${subId}/grade`, { marks: Number(marks), feedback: feedback || "" });
      showToast("Grade saved");
      const { data } = await axios.get(`/api/trainer/batches/${batchId}/submissions`);
      setSubmissions(data);
      setGradingId(null);
    } catch (err) { showToast(err.response?.data?.message || "Grade failed"); }
  };

  if (loading) return (
    <div className={pageWrapClass}>
      <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold text-[#64748b] hover:text-[#fc362d] mb-4">
        <FiArrowLeft className="w-4 h-4" /> Back to batches
      </button>
      <p className="text-sm text-[#94a3b8] text-center py-16">Loading batch…</p>
    </div>
  );

  if (!detail) return (
    <div className={pageWrapClass}>
      <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold text-[#64748b] hover:text-[#fc362d]">
        <FiArrowLeft className="w-4 h-4" /> Back
      </button>
      <p className="text-sm text-[#b91c1c] font-semibold mt-6 text-center">Batch not found.</p>
    </div>
  );

  const pendingCount = submissions.filter(s => !s.graded).length;

  return (
    <div className={pageWrapClass}>
      <Toast message={toast} />

      {/* Back + header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold text-[#64748b] hover:text-[#fc362d] mb-3 transition-colors">
            <FiArrowLeft className="w-4 h-4" /> All my batches
          </button>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={badgeClass}>{detail.course?.title || "No course"}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0c0407] tracking-tight">{detail.batch_name}</h1>
          <p className="text-sm text-[#636363] mt-1 font-medium">
            {fmt(detail.start_date)} → {fmt(detail.end_date)} · {detail.students?.length || 0} students
          </p>
        </div>
      </div>

      {/* Stats */}
      <StatCards stats={[
        { label: "Enrolled Students", value: String(detail.students?.length || 0),  change: "In this batch",         icon: <FiUsers    className="w-5 h-5" /> },
        { label: "Course Duration",   value: `${detail.course?.duration_month || "?"}m`, change: "Total program",    icon: <FiCalendar className="w-5 h-5" /> },
        { label: "Pending Reviews",   value: String(pendingCount),                  change: "Submissions to grade",  icon: <FiAward    className="w-5 h-5" /> },
        { label: "Materials",         value: String(materials.length),              change: "Uploaded",              icon: <FiBookOpen className="w-5 h-5" /> },
      ]} />

      {/* Tab bar */}
      <div className="flex border-b border-black/[0.07] gap-6">
        {[
          { key: "students",    label: "Students",        badge: null },
          { key: "submissions", label: "Submissions",     badge: pendingCount || null },
          { key: "materials",   label: "Study Materials", badge: null },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`pb-3 text-xs font-bold flex items-center gap-1.5 relative cursor-pointer transition-colors ${
              tab === t.key ? "text-[#fc362d]" : "text-[#94a3b8] hover:text-[#0c0407]"
            }`}>
            {t.label}
            {t.badge && <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded-full bg-[#fc362d] text-white">{t.badge}</span>}
            {tab === t.key && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#fc362d] rounded-full" />}
          </button>
        ))}
      </div>

      {/* Students tab */}
      {tab === "students" && (
        <Panel>
          <PanelHeader eyebrow="Roster" title={`Enrolled (${detail.students?.length || 0})`} />
          {!detail.students?.length ? (
            <p className="text-xs text-[#94a3b8] text-center py-10 bg-[#fafafa] rounded-xl border border-dashed border-black/[0.07]">No students enrolled.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-black/[0.07] text-[#94a3b8] uppercase tracking-wider">
                    <th className="pb-3 px-2 font-bold text-left">#</th>
                    <th className="pb-3 px-2 font-bold text-left">Student</th>
                    <th className="pb-3 px-2 font-bold text-left">Email</th>
                    <th className="pb-3 px-2 font-bold text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.students.map((s, i) => (
                    <tr key={i} className="border-b border-black/[0.04] hover:bg-[#fafafa]">
                      <td className="py-3 px-2 text-[#94a3b8] font-bold">{i + 1}</td>
                      <td className="py-3 px-2 font-extrabold text-[#0c0407]">{s.student?.name || "—"}</td>
                      <td className="py-3 px-2 text-[#636363]">{s.student?.email || "—"}</td>
                      <td className="py-3 px-2">
                        <StatusBadge variant={s.enrollment_status === "ACTIVE" ? "ok" : "info"}>
                          {s.enrollment_status}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      )}

      {/* Submissions tab */}
      {tab === "submissions" && (
        <Panel>
          <PanelHeader eyebrow="Grading" title="Student Submissions"
            action={<span className="text-xs font-bold text-[#475569] bg-[#f1f5f9] px-3 py-1 rounded-lg border border-black/[0.06]">{pendingCount} Pending</span>}
          />
          {submissions.length === 0 ? (
            <p className="text-xs text-[#94a3b8] text-center py-10 bg-[#fafafa] rounded-xl border border-dashed border-black/[0.07]">
              No submissions yet.
            </p>
          ) : (
            <div className="space-y-3">
              {submissions.map(sub => (
                <div key={sub.id} className="p-4 rounded-2xl bg-[#fafafa] border border-black/[0.07] space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-extrabold text-[#0c0407]">{sub.student?.name}</p>
                      <p className="text-[10px] text-[#94a3b8] font-semibold mt-0.5">
                        {sub.project?.title} · Submitted {fmt(sub.submitted_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {sub.github_link && (
                        <a href={sub.github_link} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] font-bold text-[#475569] hover:text-[#fc362d]">
                          <FiExternalLink className="w-3.5 h-3.5" /> GitHub
                        </a>
                      )}
                      <StatusBadge variant={sub.graded ? "ok" : "warn"}>
                        {sub.graded ? "Graded" : "Pending"}
                      </StatusBadge>
                    </div>
                  </div>

                  {sub.graded && (
                    <div className="flex items-center gap-4 text-xs bg-[#f0fdf4] border border-emerald-200 rounded-xl px-3 py-2">
                      <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-emerald-700 font-bold">{sub.marks}/100</span>
                      {sub.feedback && <span className="text-[#636363]">— {sub.feedback}</span>}
                    </div>
                  )}

                  {!sub.graded && gradingId !== sub.id && (
                    <button onClick={() => { setGradingId(sub.id); setGradeForm(p => ({ ...p, [sub.id]: { marks: "", feedback: "" } })); }}
                      className={`${secondaryBtnClass} text-xs py-1.5 px-3`}>
                      Grade this submission
                    </button>
                  )}

                  {!sub.graded && gradingId === sub.id && (
                    <div className="flex flex-col sm:flex-row gap-2 items-end bg-white border border-black/[0.07] p-3 rounded-xl">
                      <div className="w-24 shrink-0">
                        <label className={`${labelMutedClass} block mb-1`}>Marks/100</label>
                        <input type="number" min={0} max={100}
                          value={gradeForm[sub.id]?.marks || ""}
                          onChange={e => setGradeForm(p => ({ ...p, [sub.id]: { ...p[sub.id], marks: e.target.value } }))}
                          className={`${inputClass} !py-1.5 text-xs`} placeholder="90" />
                      </div>
                      <div className="flex-1 w-full">
                        <label className={`${labelMutedClass} block mb-1`}>Feedback</label>
                        <input type="text"
                          value={gradeForm[sub.id]?.feedback || ""}
                          onChange={e => setGradeForm(p => ({ ...p, [sub.id]: { ...p[sub.id], feedback: e.target.value } }))}
                          className={`${inputClass} !py-1.5 text-xs`} placeholder="Great work…" />
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => handleGrade(sub.id)} className={`${primaryBtnClass} py-1.5 px-3 text-xs`}>Save</button>
                        <button onClick={() => setGradingId(null)} className={`${secondaryBtnClass} py-1.5 px-3 text-xs`}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}

      {/* Materials tab */}
      {tab === "materials" && (
        <Panel>
          <PanelHeader eyebrow="Resources" title="Study Materials" />
          <form onSubmit={handleUploadMaterial} className="flex flex-col sm:flex-row gap-2 mb-5">
            <input required value={matForm.title}
              onChange={e => setMatForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Material title" className={`${inputClass} flex-1`} />
            <input required value={matForm.file_url}
              onChange={e => setMatForm(p => ({ ...p, file_url: e.target.value }))}
              placeholder="URL / link" className={`${inputClass} flex-1`} />
            <select value={matForm.material_type}
              onChange={e => setMatForm(p => ({ ...p, material_type: e.target.value }))}
              className={`${inputClass} w-32 shrink-0`}>
              {["PDF", "VIDEO", "PPT", "ASSIGNMENT", "LINK"].map(t => <option key={t}>{t}</option>)}
            </select>
            <button type="submit" disabled={matSaving} className={`${primaryBtnClass} shrink-0 disabled:opacity-50 flex items-center gap-1.5`}>
              <FiUpload className="w-3.5 h-3.5" />{matSaving ? "…" : "Upload"}
            </button>
          </form>

          {materials.length === 0 ? (
            <p className="text-xs text-[#94a3b8] text-center py-10 bg-[#fafafa] rounded-xl border border-dashed border-black/[0.07]">No materials uploaded yet.</p>
          ) : (
            <div className="space-y-2">
              {materials.map(m => (
                <div key={m.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#fafafa] border border-black/[0.07]">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#0c0407] truncate">{m.title}</p>
                    <p className="text-[10px] text-[#94a3b8] truncate">{m.file_url}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-[#f1f5f9] text-[#475569] border border-black/[0.06]">{m.material_type}</span>
                    <a href={m.file_url} target="_blank" rel="noopener noreferrer"
                      className="w-7 h-7 rounded-lg border border-black/10 flex items-center justify-center text-[#475569] hover:text-[#fc362d]">
                      <FiExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button onClick={() => handleDeleteMaterial(m.id)}
                      className="w-7 h-7 rounded-lg border border-black/10 flex items-center justify-center text-[#94a3b8] hover:text-[#b91c1c] cursor-pointer">
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}
    </div>
  );
}

/* ── Batches list view ───────────────────────────────── */
export function TrainerBatches() {
  const navigate = useNavigate();
  const { batchId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/trainer/me")
      .then(({ data }) => setProfile(data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  if (batchId) {
    return <BatchDetail batchId={batchId} onBack={() => navigate("/dashboard/trainer/batches")} />;
  }

  if (loading) return (
    <div className={pageWrapClass}>
      <p className="text-sm text-[#94a3b8] text-center py-16">Loading batches…</p>
    </div>
  );

  const batches = profile?.batches || [];

  return (
    <div className={pageWrapClass}>
      <WelcomeBanner
        badge="My Batches"
        title="Assigned Cohorts"
        description="All batches currently under your supervision. Click any batch to view students, submissions, and materials."
      />

      <StatCards stats={[
        { label: "Total Batches",   value: String(batches.length),                                             change: "Assigned to you",     icon: <FiLayers   className="w-5 h-5" /> },
        { label: "Total Students",  value: String(batches.reduce((s, b) => s + (b.student_count || 0), 0)),   change: "Across all batches",   icon: <FiUsers    className="w-5 h-5" /> },
      ]} />

      {batches.length === 0 ? (
        <Panel>
          <p className="text-sm text-[#94a3b8] text-center py-12">No batches assigned yet. Contact your admin.</p>
        </Panel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {batches.map(b => (
            <button key={b.id}
              onClick={() => navigate(`/dashboard/trainer/batches/${b.id}`)}
              className={`${cardClass} p-6 text-left hover:border-[#fc362d]/25 hover:shadow-[0_8px_32px_rgba(252,54,45,0.08)] transition-all duration-300 cursor-pointer group w-full`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-[#fc362d]/10 flex items-center justify-center shrink-0">
                  <FiLayers className="w-5 h-5 text-[#fc362d]" />
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-[#f1f5f9] text-[#475569] border border-black/[0.06] shrink-0">
                  {b.student_count} students
                </span>
              </div>

              <h3 className="text-base font-extrabold text-[#0c0407] group-hover:text-[#fc362d] transition-colors leading-snug mb-1">
                {b.batch_name}
              </h3>
              {b.course && (
                <p className="text-xs text-[#636363] font-medium mb-3 truncate">{b.course.title}</p>
              )}

              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#94a3b8]">
                <FiCalendar className="w-3.5 h-3.5" />
                {fmt(b.start_date)} → {fmt(b.end_date)}
              </div>

              <div className="mt-4 pt-4 border-t border-black/[0.05]">
                <span className="text-[10px] font-bold text-[#fc362d] uppercase tracking-wider group-hover:underline">
                  Open batch →
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default TrainerBatches;
