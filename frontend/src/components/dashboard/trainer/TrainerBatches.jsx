import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft, FiUsers, FiCalendar, FiBookOpen, FiLayers, FiAward,
} from "react-icons/fi";
import axios from "axios";
import { WelcomeBanner, StatCards, Panel, Toast } from "../DashboardUI";
import { pageWrapClass, cardClass, badgeClass } from "../dashboardTheme";
import { fmt } from "./trainerUtils";

// Four tab components
import { BatchStudents }    from "./BatchStudents";
import { BatchProjects }    from "./BatchProjects";
import { BatchSubmissions } from "./BatchSubmissions";
import { BatchMaterials }   from "./BatchMaterials";

/* ─────────────────────────────────────────────────────────
   BATCH DETAIL
   ───────────────────────────────────────────────────────── */
function BatchDetail({ batchId, onBack }) {
  const [detail, setDetail]           = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [materials, setMaterials]     = useState([]);
  const [projects, setProjects]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [tab, setTab]                 = useState("students");
  const [toast, setToast]             = useState("");

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 3500); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [d, s, m, p] = await Promise.all([
        axios.get(`/api/trainer/batches/${batchId}`),
        axios.get(`/api/trainer/batches/${batchId}/submissions`),
        axios.get(`/api/trainer/batches/${batchId}/materials`),
        axios.get(`/api/trainer/batches/${batchId}/projects`),
      ]);
      setDetail(d.data);
      setSubmissions(s.data);
      setMaterials(m.data);
      setProjects(p.data);
    } catch { setDetail(null); }
    finally { setLoading(false); }
  }, [batchId]);

  useEffect(() => { load(); }, [load]);

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
      <p className="text-sm text-red-600 font-semibold mt-6 text-center">Batch not found.</p>
    </div>
  );

  const pendingSubmissions = submissions.filter(s => !s.graded).length;
  const pendingProjects    = projects.filter(p => p.submission_count > p.graded_count).length;

  const TABS = [
    { key: "students",    label: "Students",        badge: null },
    { key: "projects",    label: "Projects",        badge: pendingProjects || null },
    { key: "submissions", label: "All Submissions", badge: pendingSubmissions || null },
    { key: "materials",   label: "Study Materials", badge: null },
  ];

  return (
    <div className={pageWrapClass}>
      <Toast message={toast} />

      {/* Back + header */}
      <div>
        <button onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-[#64748b] hover:text-[#fc362d] mb-3 transition-colors">
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

      {/* Stats */}
      <StatCards stats={[
        { label: "Enrolled",      value: String(detail.students?.length || 0), change: "Students",    icon: <FiUsers    className="w-5 h-5" /> },
        { label: "Duration",      value: `${detail.course?.duration_month || "?"}m`, change: "Program", icon: <FiCalendar className="w-5 h-5" /> },
        { label: "Projects",      value: String(projects.length),              change: "Assigned",    icon: <FiAward    className="w-5 h-5" /> },
        { label: "Materials",     value: String(materials.length),             change: "Uploaded",    icon: <FiBookOpen className="w-5 h-5" /> },
      ]} />

      {/* Tab bar */}
      <div className="flex border-b border-black/[0.07] gap-6 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`pb-3 text-xs font-bold flex items-center gap-1.5 relative cursor-pointer transition-colors whitespace-nowrap ${
              tab === t.key ? "text-[#fc362d]" : "text-[#94a3b8] hover:text-[#0c0407]"
            }`}>
            {t.label}
            {t.badge && (
              <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded-full bg-[#fc362d] text-white">
                {t.badge}
              </span>
            )}
            {tab === t.key && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#fc362d] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content — each tab is its own component */}
      {tab === "students"    && <BatchStudents    students={detail.students || []} />}
      {tab === "projects"    && <BatchProjects    batchId={batchId} projects={projects}    onRefresh={load} />}
      {tab === "submissions" && <BatchSubmissions batchId={batchId} submissions={submissions} onRefresh={load} />}
      {tab === "materials"   && <BatchMaterials   batchId={batchId} materials={materials}  onRefresh={load} />}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   BATCHES LIST
   ───────────────────────────────────────────────────────── */
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

  // If a batchId param is present, render the detail view
  if (batchId) {
    return (
      <BatchDetail
        batchId={batchId}
        onBack={() => navigate("/dashboard/trainer/batches")}
      />
    );
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
        description="All batches currently under your supervision. Click any batch to manage students, projects, and materials."
      />

      <StatCards stats={[
        {
          label: "Total Batches",
          value: String(batches.length),
          change: "Assigned to you",
          icon: <FiLayers className="w-5 h-5" />,
        },
        {
          label: "Total Students",
          value: String(batches.reduce((s, b) => s + (b.student_count || 0), 0)),
          change: "Across all batches",
          icon: <FiUsers className="w-5 h-5" />,
        },
      ]} />

      {batches.length === 0 ? (
        <Panel>
          <p className="text-sm text-[#94a3b8] text-center py-12">
            No batches assigned yet. Contact your admin.
          </p>
        </Panel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {batches.map(b => (
            <button
              key={b.id}
              onClick={() => navigate(`/dashboard/trainer/batches/${b.id}`)}
              className={`${cardClass} p-6 text-left hover:border-[#fc362d]/25 hover:shadow-[0_8px_32px_rgba(252,54,45,0.08)] transition-all duration-300 cursor-pointer group w-full`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-[#fc362d]/10 flex items-center justify-center shrink-0">
                  <FiLayers className="w-5 h-5 text-[#fc362d]" />
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-[#f1f5f9] text-[#475569] border border-black/[0.06] shrink-0">
                  {b.student_count} student{b.student_count !== 1 ? "s" : ""}
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
