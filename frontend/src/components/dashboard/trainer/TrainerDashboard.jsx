import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FiUsers, FiBookOpen, FiAward, FiLayers, FiPlus, FiCheck,
  FiExternalLink, FiCheckCircle, FiAlertCircle, FiTrash2,
  FiUpload, FiCalendar, FiChevronDown, FiX, FiLoader,
} from "react-icons/fi";
import axios from "axios";
import {
  WelcomeBanner, StatCards, Panel, PanelHeader,
  PrimaryButton, SecondaryButton, Toast, StatusBadge,
} from "../DashboardUI";
import {
  pageWrapClass, inputClass, primaryBtnClass, secondaryBtnClass,
  cardClass, labelMutedClass,
} from "../dashboardTheme";

/* ── helpers ─────────────────────────────────────────── */
const today = () => new Date().toISOString().slice(0, 10);
const fmt   = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const statusColor = {
  PRESENT: "bg-emerald-100 text-emerald-700",
  ABSENT:  "bg-red-100 text-red-600",
  LATE:    "bg-amber-100 text-amber-700",
  LEAVE:   "bg-blue-100 text-blue-600",
};

/* ── SubmissionRow ────────────────────────────────────── */
function SubmissionRow({ sub, onGrade }) {
  const [marks, setMarks]       = useState(String(sub.marks || ""));
  const [feedback, setFeedback] = useState(sub.feedback || "");
  const [saving, setSaving]     = useState(false);

  const handleSubmit = async () => {
    if (!marks) return;
    setSaving(true);
    await onGrade(sub.id, marks, feedback);
    setSaving(false);
  };

  return (
    <div className="p-4 rounded-2xl bg-[#fafafa] border border-black/[0.07] space-y-3">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h4 className="font-bold text-sm text-[#0c0407]">{sub.student?.name}</h4>
          <p className="text-[10px] text-[#94a3b8] font-semibold mt-0.5">
            {sub.project?.title} · Submitted {fmt(sub.submitted_at)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {sub.github_link && (
            <a href={sub.github_link} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] font-bold text-[#475569] hover:text-[#fc362d]">
              <FiExternalLink className="w-3.5 h-3.5" /> GitHub
            </a>
          )}
        </div>
      </div>

      <div className="h-px bg-black/[0.05]" />

      {sub.graded ? (
        <div className="flex items-center justify-between bg-[#475569]/5 border border-[#475569]/10 p-3 rounded-xl text-xs">
          <span className="text-[#475569] font-semibold">
            Score: <strong>{sub.marks}/100</strong>
            {sub.feedback && <> · <span className="text-[#636363]">{sub.feedback}</span></>}
          </span>
          <span className="px-2 py-0.5 bg-[#475569] text-white text-[9px] font-bold rounded-lg flex items-center gap-1">
            <FiCheck className="w-3 h-3" /> Graded
          </span>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-2 items-end bg-white border border-black/[0.07] p-3 rounded-xl">
          <div className="w-24 shrink-0">
            <label className={`${labelMutedClass} block mb-1`}>Marks /100</label>
            <input type="number" min={0} max={100} value={marks}
              onChange={e => setMarks(e.target.value)}
              className={`${inputClass} !py-1.5 text-xs`} placeholder="90" />
          </div>
          <div className="flex-1 w-full">
            <label className={`${labelMutedClass} block mb-1`}>Feedback</label>
            <input type="text" value={feedback}
              onChange={e => setFeedback(e.target.value)}
              className={`${inputClass} !py-1.5 text-xs`} placeholder="Great work…" />
          </div>
          <button onClick={handleSubmit} disabled={saving || !marks}
            className={`${primaryBtnClass} py-2 px-4 text-xs whitespace-nowrap disabled:opacity-50`}>
            {saving ? "Saving…" : "Submit Grade"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ── AttendancePanel ──────────────────────────────────── */
function AttendancePanel({ batchId, students, onClose }) {
  const [date, setDate]       = useState(today());
  const [entries, setEntries] = useState({});
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState("");
  const [existing, setExisting] = useState([]);

  const STATUSES = ["PRESENT", "ABSENT", "LATE", "LEAVE"];

  useEffect(() => {
    if (!batchId || !date) return;
    axios.get(`/api/trainer/batches/${batchId}/attendance`, { params: { date } })
      .then(({ data }) => {
        const map = {};
        data.records.forEach(r => { map[r.student_id] = r.status; });
        setExisting(data.records);
        setEntries(prev => {
          // pre-fill with existing, keep manual changes
          const next = { ...prev };
          students.forEach(s => {
            if (map[s.student_id] && !next[s.student_id]) next[s.student_id] = map[s.student_id];
          });
          return next;
        });
      })
      .catch(() => {});
  }, [batchId, date, students]);

  const markAll = (status) => {
    const next = {};
    students.forEach(s => { next[s.student_id] = status; });
    setEntries(next);
  };

  const handleSave = async () => {
    const payload = students
      .filter(s => entries[s.student_id])
      .map(s => ({ student_id: s.student_id, status: entries[s.student_id] }));
    if (!payload.length) { setToast("Mark at least one student"); return; }
    setSaving(true);
    try {
      await axios.post(`/api/trainer/batches/${batchId}/attendance`, { date, entries: payload });
      setToast(`Attendance saved for ${date}`);
      setTimeout(() => setToast(""), 3500);
    } catch (e) {
      setToast(e.response?.data?.message || "Failed to save");
      setTimeout(() => setToast(""), 3500);
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" role="dialog">
      <div className="absolute inset-0 bg-[#0c0407]/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-lg max-h-[85vh] flex flex-col ${cardClass} overflow-hidden`}>
        <div className="flex items-center justify-between p-5 border-b border-black/[0.07] shrink-0">
          <div>
            <span className={labelMutedClass}>Mark Attendance</span>
            <h2 className="text-base font-bold text-[#0c0407] mt-0.5">Daily Register</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl border border-black/10 flex items-center justify-center text-[#94a3b8] hover:text-[#0c0407] cursor-pointer">
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 shrink-0 space-y-3 border-b border-black/[0.06]">
          <div>
            <label className={`${labelMutedClass} block mb-1`}>Session Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              max={today()} className={`${inputClass} w-full`} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {STATUSES.map(s => (
              <button key={s} onClick={() => markAll(s)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border cursor-pointer transition-colors ${statusColor[s]} border-current/20`}>
                All {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          {students.length === 0 && (
            <p className="text-xs text-[#94a3b8] text-center py-8">No students enrolled</p>
          )}
          {students.map(s => (
            <div key={s.student_id} className="flex items-center justify-between gap-3 py-2.5 border-b border-black/[0.04]">
              <span className="text-sm font-semibold text-[#0c0407] truncate">{s.name}</span>
              <div className="flex gap-1.5 shrink-0">
                {STATUSES.map(st => (
                  <button key={st} onClick={() => setEntries(prev => ({ ...prev, [s.student_id]: st }))}
                    className={`px-2.5 py-1 text-[9px] font-bold rounded-lg border cursor-pointer transition-all ${
                      entries[s.student_id] === st
                        ? `${statusColor[st]} border-current/30 shadow-sm`
                        : "bg-[#f1f5f9] text-[#94a3b8] border-transparent"
                    }`}>
                    {st[0]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-5 border-t border-black/[0.07] shrink-0 flex gap-3">
          <button onClick={handleSave} disabled={saving}
            className={`${primaryBtnClass} flex-1 disabled:opacity-50`}>
            {saving ? "Saving…" : "Save Attendance"}
          </button>
          <button onClick={onClose} className={secondaryBtnClass}>Cancel</button>
        </div>

        {toast && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-[#0c0407] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── MaterialsPanel ───────────────────────────────────── */
function MaterialsPanel({ batchId, materials, onRefresh }) {
  const [form, setForm]     = useState({ title: "", file_url: "", material_type: "PDF" });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const TYPES = ["PDF", "VIDEO", "PPT", "ASSIGNMENT", "LINK"];

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      await axios.post(`/api/trainer/batches/${batchId}/materials`, form);
      setForm({ title: "", file_url: "", material_type: "PDF" });
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this material?")) return;
    try { await axios.delete(`/api/trainer/materials/${id}`); onRefresh(); }
    catch { /* ignore */ }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2">
        <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
          placeholder="Material title" className={`${inputClass} flex-1`} />
        <input required value={form.file_url} onChange={e => setForm(p => ({ ...p, file_url: e.target.value }))}
          placeholder="URL or link" className={`${inputClass} flex-1`} />
        <select value={form.material_type} onChange={e => setForm(p => ({ ...p, material_type: e.target.value }))}
          className={`${inputClass} w-32 shrink-0`}>
          {TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <button type="submit" disabled={saving} className={`${primaryBtnClass} shrink-0 disabled:opacity-50`}>
          <FiUpload className="w-3.5 h-3.5 mr-1 inline" />{saving ? "Uploading…" : "Upload"}
        </button>
      </form>
      {error && <p className="text-xs text-[#b91c1c] font-semibold">{error}</p>}

      {materials.length === 0 ? (
        <p className="text-xs text-[#94a3b8] text-center py-6 bg-[#fafafa] rounded-xl border border-dashed border-black/[0.07]">
          No materials uploaded yet.
        </p>
      ) : (
        <div className="space-y-2">
          {materials.map(m => (
            <div key={m.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#fafafa] border border-black/[0.07]">
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#0c0407] truncate">{m.title}</p>
                <p className="text-[10px] text-[#94a3b8] font-semibold truncate">{m.file_url}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-[#f1f5f9] text-[#475569] border border-black/[0.06]">
                  {m.material_type}
                </span>
                <a href={m.file_url} target="_blank" rel="noopener noreferrer"
                  className="w-7 h-7 rounded-lg border border-black/10 flex items-center justify-center text-[#475569] hover:text-[#fc362d]">
                  <FiExternalLink className="w-3.5 h-3.5" />
                </a>
                <button onClick={() => handleDelete(m.id)}
                  className="w-7 h-7 rounded-lg border border-black/10 flex items-center justify-center text-[#94a3b8] hover:text-[#b91c1c] hover:border-[#b91c1c]/30 cursor-pointer">
                  <FiTrash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main TrainerDashboard ────────────────────────────── */
export const TrainerDashboard = ({ user }) => {
  const [profile, setProfile]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [activeBatchId, setActiveBatchId] = useState(null);
  const [batchDetail, setBatchDetail]   = useState(null);
  const [submissions, setSubmissions]   = useState([]);
  const [materials, setMaterials]       = useState([]);
  const [loadingBatch, setLoadingBatch] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [activeTab, setActiveTab]       = useState("submissions"); // submissions | materials | students
  const [toast, setToast]               = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 4000); };

  /* Fetch trainer profile + batches */
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/trainer/me");
      setProfile(data);
      if (data.batches?.length > 0 && !activeBatchId) {
        setActiveBatchId(data.batches[0].id);
      }
    } catch { setProfile(null); }
    finally { setLoading(false); }
  }, [activeBatchId]);

  useEffect(() => { fetchProfile(); }, []);

  /* Fetch batch detail + submissions + materials when activeBatchId changes */
  const fetchBatchData = useCallback(async (batchId) => {
    if (!batchId) return;
    setLoadingBatch(true);
    try {
      const [detailRes, subRes, matRes] = await Promise.all([
        axios.get(`/api/trainer/batches/${batchId}`),
        axios.get(`/api/trainer/batches/${batchId}/submissions`),
        axios.get(`/api/trainer/batches/${batchId}/materials`),
      ]);
      setBatchDetail(detailRes.data);
      setSubmissions(subRes.data);
      setMaterials(matRes.data);
    } catch { setBatchDetail(null); setSubmissions([]); setMaterials([]); }
    finally { setLoadingBatch(false); }
  }, []);

  useEffect(() => { if (activeBatchId) fetchBatchData(activeBatchId); }, [activeBatchId, fetchBatchData]);

  const handleGrade = async (subId, marks, feedback) => {
    try {
      await axios.put(`/api/trainer/submissions/${subId}/grade`, { marks: Number(marks), feedback });
      showToast("Grade saved");
      const { data } = await axios.get(`/api/trainer/batches/${activeBatchId}/submissions`);
      setSubmissions(data);
    } catch (e) {
      showToast(e.response?.data?.message || "Failed to grade");
    }
  };

  const pendingCount = submissions.filter(s => !s.graded).length;
  const presentPct   = batchDetail ? (() => {
    // compute attendance pct across all students for today-ish context
    return "—";
  })() : "—";

  if (loading) return (
    <div className={pageWrapClass}>
      <div className="py-16 text-center text-sm font-semibold text-[#94a3b8]">Loading trainer workspace…</div>
    </div>
  );

  if (!profile) return (
    <div className={pageWrapClass}>
      <div className="py-16 text-center">
        <FiAlertCircle className="w-10 h-10 text-[#fc362d] mx-auto mb-3" />
        <p className="text-sm font-semibold text-[#636363]">Trainer profile not found. Contact admin.</p>
      </div>
    </div>
  );

  const activeBatch = profile.batches?.find(b => b.id === activeBatchId);

  return (
    <div className={pageWrapClass}>
      <Toast message={toast} />

      {attendanceOpen && batchDetail && (
        <AttendancePanel
          batchId={activeBatchId}
          students={batchDetail.students?.map(s => ({ student_id: s.student?.id, name: s.student?.name })) || []}
          onClose={() => setAttendanceOpen(false)}
        />
      )}

      <WelcomeBanner
        badge="Trainer Workstation"
        title={`Welcome, ${user?.name || "Trainer"}!`}
        description="Mark attendance, upload resources, review submissions and grade your students."
        actions={
          <>
            <PrimaryButton onClick={() => setAttendanceOpen(true)} className="flex items-center gap-1.5">
              <FiCalendar className="w-3.5 h-3.5" /> Mark Attendance
            </PrimaryButton>
            <SecondaryButton onClick={() => { setActiveTab("materials"); }}>
              Upload Material
            </SecondaryButton>
          </>
        }
      />

      <StatCards stats={[
        { label: "Assigned Batches",  value: String(profile.batch_count || 0), change: "Active cohorts",          icon: <FiLayers className="w-5 h-5" /> },
        { label: "Total Students",    value: String(profile.total_students || 0), change: "Enrolled learners",    icon: <FiUsers  className="w-5 h-5" /> },
        { label: "Pending Reviews",   value: String(pendingCount),             change: "Submissions to grade",     icon: <FiAward  className="w-5 h-5" /> },
        { label: "Study Materials",   value: String(materials.length),          change: "Uploaded this batch",     icon: <FiBookOpen className="w-5 h-5" /> },
      ]} />

      {/* Batch selector */}
      {profile.batches?.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {profile.batches.map(b => (
            <button key={b.id} onClick={() => setActiveBatchId(b.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                activeBatchId === b.id
                  ? "bg-[#fc362d] text-white border-[#fc362d] shadow-[0_2px_12px_rgba(252,54,45,0.3)]"
                  : "bg-white text-[#475569] border-black/10 hover:border-[#fc362d]/30"
              }`}>
              {b.batch_name}
              <span className={`ml-2 text-[9px] font-extrabold ${activeBatchId === b.id ? "text-white/70" : "text-[#94a3b8]"}`}>
                {b.student_count} students
              </span>
            </button>
          ))}
        </div>
      )}

      {profile.batches?.length === 0 && (
        <Panel>
          <p className="text-sm text-[#94a3b8] font-semibold text-center py-8">
            No batches assigned yet. Contact your admin to get assigned to a cohort.
          </p>
        </Panel>
      )}

      {activeBatch && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left 2/3 ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Tab nav */}
            <div className="flex border-b border-black/[0.08] gap-5">
              {[
                { key: "submissions", label: "Submissions", badge: pendingCount > 0 ? pendingCount : null },
                { key: "materials",   label: "Study Materials" },
                { key: "students",    label: "Students" },
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`pb-2.5 text-xs font-bold relative cursor-pointer transition-colors flex items-center gap-1.5 ${
                    activeTab === tab.key ? "text-[#fc362d]" : "text-[#94a3b8] hover:text-[#0c0407]"
                  }`}>
                  {tab.label}
                  {tab.badge && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#fc362d] text-white text-[9px] font-extrabold">
                      {tab.badge}
                    </span>
                  )}
                  {activeTab === tab.key && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#fc362d] rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {loadingBatch ? (
              <div className="py-12 text-center text-sm text-[#94a3b8]">Loading batch data…</div>
            ) : (
              <>
                {/* Submissions tab */}
                {activeTab === "submissions" && (
                  <Panel>
                    <PanelHeader eyebrow="Evaluation Hub" title="Student Submissions"
                      action={<span className="text-xs font-bold text-[#475569] bg-[#f1f5f9] px-3 py-1 rounded-lg border border-black/[0.06]">
                        {pendingCount} Pending
                      </span>} />
                    {submissions.length === 0 ? (
                      <p className="text-xs text-[#94a3b8] text-center py-10 bg-[#fafafa] rounded-xl border border-dashed border-black/[0.07]">
                        No submissions yet for this batch.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {submissions.map(sub => (
                          <SubmissionRow key={sub.id} sub={sub} onGrade={handleGrade} />
                        ))}
                      </div>
                    )}
                  </Panel>
                )}

                {/* Materials tab */}
                {activeTab === "materials" && (
                  <Panel>
                    <PanelHeader eyebrow="Resources" title="Study Materials" />
                    <MaterialsPanel
                      batchId={activeBatchId}
                      materials={materials}
                      onRefresh={() => fetchBatchData(activeBatchId)}
                    />
                  </Panel>
                )}

                {/* Students tab */}
                {activeTab === "students" && (
                  <Panel>
                    <PanelHeader eyebrow="Roster" title={`Enrolled Students (${batchDetail?.students?.length || 0})`} />
                    {!batchDetail?.students?.length ? (
                      <p className="text-xs text-[#94a3b8] text-center py-8">No students enrolled.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-black/[0.07] text-[#94a3b8] uppercase tracking-wider">
                              <th className="pb-3 px-2 font-bold text-left">Student</th>
                              <th className="pb-3 px-2 font-bold text-left">Email</th>
                              <th className="pb-3 px-2 font-bold text-left">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {batchDetail.students.map((s, i) => (
                              <tr key={i} className="border-b border-black/[0.04] hover:bg-[#fafafa]">
                                <td className="py-3 px-2 font-bold text-[#0c0407]">{s.student?.name}</td>
                                <td className="py-3 px-2 text-[#636363]">{s.student?.email}</td>
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
              </>
            )}
          </div>

          {/* ── Right 1/3 ── */}
          <div className="space-y-5">

            {/* Active batch card */}
            <Panel>
              <h3 className="text-sm font-bold text-[#0c0407] mb-4">Active Batch</h3>
              <div className="space-y-3">
                <div>
                  <span className={labelMutedClass}>Cohort</span>
                  <p className="text-base font-extrabold text-[#0c0407] mt-0.5">{activeBatch.batch_name}</p>
                </div>
                {activeBatch.course && (
                  <div>
                    <span className={labelMutedClass}>Course</span>
                    <p className="text-sm font-semibold text-[#475569] mt-0.5">{activeBatch.course.title}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className={labelMutedClass}>Start</span>
                    <p className="text-xs font-bold text-[#0c0407] mt-0.5">{fmt(activeBatch.start_date)}</p>
                  </div>
                  <div>
                    <span className={labelMutedClass}>End</span>
                    <p className="text-xs font-bold text-[#0c0407] mt-0.5">{fmt(activeBatch.end_date)}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-black/[0.06]">
                  <span className={labelMutedClass}>Students</span>
                  <p className="text-2xl font-extrabold text-[#0c0407] mt-0.5">{activeBatch.student_count}</p>
                </div>
              </div>
            </Panel>

            {/* Quick actions */}
            <Panel>
              <h3 className="text-sm font-bold text-[#0c0407] mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: "Mark Today's Attendance", icon: <FiCalendar className="w-4 h-4" />, action: () => setAttendanceOpen(true) },
                  { label: "Upload Study Material",    icon: <FiUpload className="w-4 h-4" />,   action: () => setActiveTab("materials") },
                  { label: "Review Submissions",       icon: <FiAward className="w-4 h-4" />,    action: () => setActiveTab("submissions") },
                  { label: "View Student Roster",      icon: <FiUsers className="w-4 h-4" />,    action: () => setActiveTab("students") },
                ].map((a, i) => (
                  <button key={i} onClick={a.action}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-black/[0.07] bg-[#fafafa] hover:bg-white hover:border-[#fc362d]/20 hover:shadow-sm transition-all cursor-pointer text-left">
                    <span className="w-7 h-7 rounded-lg bg-[#fc362d]/10 flex items-center justify-center text-[#fc362d] shrink-0">
                      {a.icon}
                    </span>
                    <span className="text-xs font-semibold text-[#475569]">{a.label}</span>
                  </button>
                ))}
              </div>
            </Panel>

          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerDashboard;
