import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiBookOpen,
  FiAward,
  FiLayers,
  FiAlertCircle,
  FiUpload,
  FiCalendar,
  FiX,
  FiTrendingUp,
  FiBarChart2,
} from "react-icons/fi";
import axios from "axios";
import {
  WelcomeBanner,
  StatCards,
  Panel,
  PrimaryButton,
  SecondaryButton,
  StatusBadge,
} from "../DashboardUI";
import {
  pageWrapClass,
  inputClass,
  primaryBtnClass,
  secondaryBtnClass,
  cardClass,
  cardLightClass,
  labelMutedClass,
} from "../dashboardTheme";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/* ── helpers ─────────────────────────────────────────── */
const today = () => new Date().toISOString().slice(0, 10);
const fmt   = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtShort = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—";
const statusColor = {
  PRESENT: "bg-emerald-100 text-emerald-700",
  ABSENT:  "bg-red-100 text-red-600",
  LATE:    "bg-amber-100 text-amber-700",
  LEAVE:   "bg-blue-100 text-blue-600",
};

const POSITIVE_ATTENDANCE = new Set(["PRESENT", "LATE"]);

const marksScaleFor = (subs) => {
  const maxMarks = Math.max(0, ...subs.map((s) => Number(s?.marks || 0)));
  return maxMarks <= 10 ? 10 : 100;
};

const attendanceSeriesFor = (records) => {
  const grouped = (records || []).reduce((acc, record) => {
    const date = record?.attendance_date;
    if (!date) return acc;
    if (!acc[date]) acc[date] = { date, present: 0, total: 0 };
    acc[date].total += 1;
    if (POSITIVE_ATTENDANCE.has(String(record.status || "").toUpperCase())) {
      acc[date].present += 1;
    }
    return acc;
  }, {});

  return Object.values(grouped)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((row) => ({
      label: fmtShort(row.date),
      fullDate: fmt(row.date),
      pct: row.total ? Math.round((row.present / row.total) * 100) : 0,
      present: row.present,
      total: row.total,
    }))
    .slice(-10);
};

const submissionVolumeFor = (subs) => {
  const grouped = (subs || []).reduce((acc, sub) => {
    const date = sub?.submitted_at;
    if (!date) return acc;
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([date, count]) => ({ date, label: fmtShort(date), fullDate: fmt(date), count }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-10);
};

const materialTypeFor = (materials) => {
  const grouped = (materials || []).reduce((acc, m) => {
    const key = String(m?.material_type || "OTHER").toUpperCase();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const palette = ["#fc362d", "#6366f1", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"];

  return Object.entries(grouped)
    .map(([name, count], index) => ({ name, count, color: palette[index % palette.length] }))
    .sort((a, b) => b.count - a.count);
};

function ChartCard({ title, subtitle, icon, iconClassName, children }) {
  return (
    <div className="bg-white border border-black/[0.06] rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_30px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col h-[360px]">
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconClassName}`}>
          {icon}
        </div>
        <div>
          <h3 className="text-base font-extrabold text-[#0c0407]">{title}</h3>
          <p className="text-xs text-[#94a3b8] font-semibold mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}

function EmptyState({ title, subtitle }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-6">
      <div className="w-32 h-32 rounded-2xl overflow-hidden mb-4 border border-black/[0.06]">
        <img src="/assets/consultation.jpg" alt="Empty state" className="w-full h-full object-cover opacity-60" />
      </div>
      <p className="text-sm font-bold text-[#0c0407]">{title}</p>
      <p className="text-xs font-semibold text-[#94a3b8] mt-1">{subtitle}</p>
    </div>
  );
}

function AttendanceTrendChart({ data }) {
  if (!data.length) {
    return <EmptyState title="No attendance records" subtitle="Mark attendance to unlock analytics." />;
  }

  const tooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const point = payload[0].payload;
    return (
      <div className="bg-[#0c0407] text-white p-3 rounded-xl shadow-xl border border-white/10 text-xs font-semibold">
        <p className="text-white/60">{point.fullDate}</p>
        <p className="text-emerald-400 font-black mt-1">{point.pct}% attendance</p>
        <p className="text-white/60 mt-1">
          {point.present}/{point.total} present/late
        </p>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="trainerAttendanceTrend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
        />
        <YAxis
          domain={[0, 100]}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
        />
        <Tooltip content={tooltip} />
        <Area
          type="monotone"
          dataKey="pct"
          stroke="#10b981"
          strokeWidth={2.5}
          fillOpacity={1}
          fill="url(#trainerAttendanceTrend)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function SubmissionVolumeChart({ data }) {
  if (!data.length) {
    return <EmptyState title="No submissions yet" subtitle="Student submissions will trend here." />;
  }

  const tooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const point = payload[0].payload;
    return (
      <div className="bg-[#0c0407] text-white p-3 rounded-xl shadow-xl border border-white/10 text-xs font-semibold">
        <p className="text-white/60">{point.fullDate}</p>
        <p className="text-[#fc362d] font-black mt-1">
          {point.count} submission{point.count !== 1 ? "s" : ""}
        </p>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
        />
        <Tooltip content={tooltip} cursor={{ fill: "rgba(0,0,0,0.02)" }} />
        <Bar dataKey="count" fill="#fc362d" radius={[6, 6, 0, 0]} maxBarSize={42} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function MaterialTypeChart({ data }) {
  if (!data.length) {
    return <EmptyState title="No materials uploaded" subtitle="Upload study materials to see distribution." />;
  }

  const tooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const point = payload[0].payload;
    return (
      <div className="bg-[#0c0407] text-white p-3 rounded-xl shadow-xl border border-white/10 text-xs font-semibold">
        <p className="font-black" style={{ color: point.color }}>
          {point.name}
        </p>
        <p className="text-white/60 mt-1">
          {point.count} item{point.count !== 1 ? "s" : ""}
        </p>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 12, left: 18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.04)" />
        <XAxis
          type="number"
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={100}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#0c0407", fontSize: 10, fontWeight: 800 }}
        />
        <Tooltip content={tooltip} cursor={{ fill: "rgba(0,0,0,0.02)" }} />
        <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={14}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
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

/* ── Main TrainerDashboard ────────────────────────────── */
export const TrainerDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [profile, setProfile]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [activeBatchId, setActiveBatchId] = useState(null);
  const [batchDetail, setBatchDetail]   = useState(null);
  const [submissions, setSubmissions]   = useState([]);
  const [materials, setMaterials]       = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loadingBatch, setLoadingBatch] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);

  /* Fetch trainer profile + batches */
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/trainer/me");
      setProfile(data);
      if (data.batches?.length > 0 && !activeBatchId) {
        setActiveBatchId(data.batches[0].id);
      }
    } catch { 
      console.error("Failed to fetch trainer profile");
      setProfile(null); 
    }
    finally { setLoading(false); }
  }, [activeBatchId]);

  useEffect(() => { fetchProfile(); }, []);

  /* Fetch batch detail + submissions + materials when activeBatchId changes */
  const fetchBatchData = useCallback(async (batchId) => {
    if (!batchId) return;
    setLoadingBatch(true);
    try {
      const [detailRes, subRes, matRes, attendanceRes] = await Promise.all([
        axios.get(`/api/trainer/batches/${batchId}`),
        axios.get(`/api/trainer/batches/${batchId}/submissions`),
        axios.get(`/api/trainer/batches/${batchId}/materials`),
        axios.get(`/api/trainer/batches/${batchId}/attendance`),
      ]);
      setBatchDetail(detailRes.data);
      setSubmissions(subRes.data);
      setMaterials(matRes.data);
      setAttendanceRecords(attendanceRes.data?.records || []);
    } catch {
      setBatchDetail(null);
      setSubmissions([]);
      setMaterials([]);
      setAttendanceRecords([]);
    }
    finally { setLoadingBatch(false); }
  }, []);

  useEffect(() => { if (activeBatchId) fetchBatchData(activeBatchId); }, [activeBatchId, fetchBatchData]);

  const pendingCount = submissions.filter(s => !s.graded).length;
  const gradedCount  = submissions.filter(s => s.graded).length;
  const marksScale   = useMemo(() => marksScaleFor(submissions), [submissions]);
  const averageMarks = useMemo(() => {
    const graded = submissions.filter(s => s.graded && Number(s.marks || 0) > 0);
    if (!graded.length) return null;
    const total = graded.reduce((sum, s) => sum + Number(s.marks || 0), 0);
    return total / graded.length;
  }, [submissions]);
  const attendanceTrend = useMemo(() => attendanceSeriesFor(attendanceRecords), [attendanceRecords]);
  const submissionTrend = useMemo(() => submissionVolumeFor(submissions), [submissions]);
  const materialTypeTrend = useMemo(() => materialTypeFor(materials), [materials]);
  const latestAttendancePct = attendanceTrend.length ? attendanceTrend[attendanceTrend.length - 1].pct : 0;
  const reviewCompletionPct = submissions.length ? Math.round((gradedCount / submissions.length) * 100) : 0;

  if (loading) return (
    <div className={pageWrapClass}>
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-[#fc362d]/20 border-t-[#fc362d] rounded-full animate-spin" />
        <p className="text-sm font-semibold text-[#94a3b8]">Loading trainer workspace…</p>
      </div>
    </div>
  );

  if (!profile) return (
    <div className={pageWrapClass}>
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <FiAlertCircle className="w-12 h-12 text-[#fc362d]" />
        <p className="text-sm font-semibold text-[#636363]">Trainer profile not found</p>
        <p className="text-xs text-[#94a3b8]">Please contact your administrator to get assigned to batches.</p>
        <button onClick={fetchProfile} className={`${primaryBtnClass} mt-2`}>Retry</button>
      </div>
    </div>
  );

  const activeBatch = profile.batches?.find(b => b.id === activeBatchId);

  return (
    <div className={pageWrapClass}>
      {attendanceOpen && batchDetail && (
        <AttendancePanel
          batchId={activeBatchId}
          students={batchDetail.students?.map(s => ({ student_id: s.id, name: s.name })) || []}
          onClose={() => setAttendanceOpen(false)}
        />
      )}

      <WelcomeBanner
        badge="Trainer Workstation"
        title={`Welcome, ${user?.name || "Trainer"}!`}
        description="Batch analytics — attendance momentum, submission volume, material usage, and review load."
        actions={
          <>
            <PrimaryButton onClick={() => setAttendanceOpen(true)} className="flex items-center gap-1.5">
              <FiCalendar className="w-3.5 h-3.5" /> Mark Attendance
            </PrimaryButton>            <SecondaryButton
              onClick={() =>
                navigate(activeBatchId ? `/dashboard/trainer/batches/${activeBatchId}` : "/dashboard/trainer/batches")
              }
            >
              Manage Batch
            </SecondaryButton>
          </>
        }
      />

      <StatCards stats={[
        { label: "Assigned Batches",  value: String(profile.batch_count || 0),    change: "Active cohorts",      icon: <FiLayers   className="w-5 h-5" /> },
        { label: "Total Students",    value: String(profile.total_students || 0),  change: "Enrolled learners",   icon: <FiUsers    className="w-5 h-5" /> },
        { label: "Pending Reviews",   value: String(pendingCount),                 change: "Submissions to grade", icon: <FiAward    className="w-5 h-5" /> },
        { label: "Attendance",        value: `${latestAttendancePct}%`,            change: "Recent sessions",      icon: <FiTrendingUp className="w-5 h-5" /> },
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
        <Panel className={cardLightClass}>
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <FiLayers className="w-12 h-12 text-[#fc362d]/40" />
            <p className="text-sm font-semibold text-[#475569]">No batches assigned yet</p>
            <p className="text-xs text-[#94a3b8]">Contact your administrator to get assigned to a cohort.</p>
          </div>
        </Panel>
      )}

      {activeBatch && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {loadingBatch ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-[#fc362d]/20 border-t-[#fc362d] rounded-full animate-spin" />
                <p className="text-sm text-[#94a3b8]">Loading analytics…</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ChartCard
                    title="Attendance Momentum"
                    subtitle="Attendance rate across recent sessions"
                    icon={<FiTrendingUp className="w-5 h-5" />}
                    iconClassName="bg-emerald-50 text-emerald-600"
                  >
                    <AttendanceTrendChart data={attendanceTrend} />
                  </ChartCard>

                  <ChartCard
                    title="Submission Volume"
                    subtitle="How many submissions arrive per day"
                    icon={<FiBarChart2 className="w-5 h-5" />}
                    iconClassName="bg-red-50 text-[#fc362d]"
                  >
                    <SubmissionVolumeChart data={submissionTrend} />
                  </ChartCard>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ChartCard
                    title="Material Distribution"
                    subtitle="What type of resources you shared"
                    icon={<FiBookOpen className="w-5 h-5" />}
                    iconClassName="bg-indigo-50 text-indigo-600"
                  >
                    <MaterialTypeChart data={materialTypeTrend} />
                  </ChartCard>

                  <div className="bg-white border border-black/[0.06] rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_30px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col h-[360px]">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 text-slate-600">
                        <FiAward className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-[#0c0407]">Review Load</h3>
                        <p className="text-xs text-[#94a3b8] font-semibold mt-0.5">Pending vs graded work</p>
                      </div>
                    </div>

                    <div className="flex-1 min-h-0 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-2xl bg-[#fafafa] border border-black/[0.05]">
                          <p className={labelMutedClass}>Pending</p>
                          <p className="text-2xl font-black text-[#0c0407] mt-2">{pendingCount}</p>
                          <StatusBadge variant={pendingCount > 0 ? "warn" : "ok"}>
                            {pendingCount > 0 ? "Needs review" : "Clear"}
                          </StatusBadge>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#fafafa] border border-black/[0.05]">
                          <p className={labelMutedClass}>Reviewed</p>
                          <p className="text-2xl font-black text-[#0c0407] mt-2">{gradedCount}</p>
                          <StatusBadge variant={gradedCount > 0 ? "ok" : "info"}>
                            {gradedCount > 0 ? "Graded" : "None"}
                          </StatusBadge>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#fafafa] border border-black/[0.05]">
                        <p className={labelMutedClass}>Completion</p>
                        <p className="text-xl font-black text-[#0c0407] mt-2">{reviewCompletionPct}%</p>
                        <div className="h-2 rounded-full bg-[#e2e8f0] overflow-hidden mt-3">
                          <div
                            className="h-full bg-gradient-to-r from-[#fc362d] to-rose-500 rounded-full"
                            style={{ width: `${reviewCompletionPct}%` }}
                          />
                        </div>
                        <p className="text-[11px] font-semibold text-[#94a3b8] mt-2">
                          {submissions.length} total submissions tracked
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#fafafa] border border-black/[0.05]">
                        <p className={labelMutedClass}>Average Score</p>
                        <p className="text-xl font-black text-[#0c0407] mt-2">
                          {averageMarks === null ? "—" : `${averageMarks.toFixed(marksScale === 10 ? 1 : 0)}/${marksScale}`}
                        </p>
                        <p className="text-[11px] font-semibold text-[#94a3b8] mt-2">
                          Based on graded submissions only
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

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

            {/* All batches summary */}
            {profile.batches?.length > 0 && (
              <Panel>
                <h3 className="text-sm font-bold text-[#0c0407] mb-3">All My Batches</h3>
                <div className="space-y-2">
                  {profile.batches.map(b => {
                    const now    = new Date().toISOString().slice(0, 10);
                    const active = now >= (b.start_date || "") && now <= (b.end_date || "");
                    return (
                      <div key={b.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#fafafa] border border-black/[0.06]">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#0c0407] truncate">{b.batch_name}</p>
                          <p className="text-[10px] text-[#94a3b8] font-medium truncate">{b.course?.title}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[9px] font-bold text-[#94a3b8]">{b.student_count}s</span>
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-lg border ${
                            active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-[#f1f5f9] text-[#94a3b8] border-black/[0.06]"
                          }`}>{active ? "Active" : "Inactive"}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Panel>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerDashboard;
