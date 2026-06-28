import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiAward, FiUsers, FiBookOpen, FiCheck, FiCheckCircle,
  FiDownload, FiLock, FiUnlock, FiCreditCard, FiExternalLink,
  FiAlertCircle, FiUpload, FiRefreshCw
} from "react-icons/fi";
import axios from "axios";
import {
  WelcomeBanner, StatCards, PrimaryButton, SecondaryButton, Toast,
} from "../DashboardUI";
import {
  pageWrapClass, inputClass, primaryBtnClass, cardClass, labelMutedClass, secondaryBtnClass
} from "../dashboardTheme";
import { MyFeesDesk } from "./MyFeesDesk";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";

/* ── helpers ─────────────────────────────────────────── */
const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

/* ── AttendanceChart (Pie Donut) ─────────────────────── */
const AttendanceChart = ({ attendance }) => {
  const total = attendance.total || 0;
  const present = attendance.present || 0;
  const absent = attendance.absent || 0;
  const pct = attendance.pct || 0;

  const data = [
    { name: "Present", count: present, color: "#10b981" },
    { name: "Absent", count: absent, color: "#fc362d" }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const pData = payload[0].payload;
      return (
        <div className="bg-[#0c0407] text-white p-2.5 rounded-xl shadow-xl border border-white/10 text-[10px] font-bold">
          <p style={{ color: pData.color }}>{pData.name}</p>
          <p className="text-white/60 mt-0.5">{pData.count} Class{pData.count !== 1 ? 'es' : ''}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full flex items-center justify-around gap-4 px-2">
      <div className="relative w-28 h-28 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={36}
              outerRadius={48}
              paddingAngle={3}
              dataKey="count"
              animationDuration={500}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={1} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-lg font-black text-[#0c0407] tracking-tight">{pct}%</span>
          <span className="text-[7px] font-bold text-[#94a3b8] uppercase tracking-wider">Attendance</span>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-1.5 w-full text-[11px] font-bold text-[#636363]">
        <div className="flex justify-between items-center py-1 border-b border-black/[0.03]">
          <span className="text-[#94a3b8]">Total Classes</span>
          <span className="text-[#0c0407] font-black">{total}</span>
        </div>
        <div className="flex justify-between items-center py-1 border-b border-black/[0.03]">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
            <span>Present</span>
          </div>
          <span className="text-[#059669] font-black">{present}</span>
        </div>
        <div className="flex justify-between items-center py-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#fc362d]" />
            <span>Absent</span>
          </div>
          <span className="text-[#b91c1c] font-black">{absent}</span>
        </div>
      </div>
    </div>
  );
};

/* ── GradesTrendChart (AreaChart) ─────────────────────── */
const GradesTrendChart = ({ projects }) => {
  const gradedProjects = projects
    .filter(p => p.submission && p.submission.marks !== null && p.submission.marks !== undefined)
    .map((p, i) => ({
      name: p.title.length > 15 ? p.title.slice(0, 12) + "..." : p.title,
      fullName: p.title,
      score: p.submission.marks,
    }));

  if (gradedProjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <FiAward className="w-8 h-8 text-[#94a3b8] mb-1.5" />
        <p className="text-xs text-[#94a3b8] font-bold">No graded projects yet</p>
        <p className="text-[9px] text-[#94a3b8] font-medium mt-0.5">Submit assignments to view score trend</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const pData = payload[0].payload;
      return (
        <div className="bg-[#0c0407] text-white p-2.5 rounded-xl shadow-xl border border-white/10 text-[10px] font-bold">
          <p className="text-white/50 mb-0.5 truncate max-w-[150px]">{pData.fullName}</p>
          <p className="text-xs font-black text-[#10b981]">Score: {pData.score}/100</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={gradedProjects} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="colorStudentGrades" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#64748b", fontSize: 9, fontWeight: 700 }}
          />
          <YAxis
            domain={[0, 100]}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#64748b", fontSize: 9, fontWeight: 700 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorStudentGrades)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ── ProjectStatusChart (Donut Chart) ─────────────────── */
const ProjectStatusChart = ({ projects }) => {
  const graded = projects.filter(p => p.submission?.marks > 0).length;
  const submitted = projects.filter(p => p.submission && !(p.submission.marks > 0)).length;
  const overdue = projects.filter(p => !p.submission && p.deadline && new Date(p.deadline) < new Date()).length;
  const pending = projects.filter(p => !p.submission && (!p.deadline || new Date(p.deadline) >= new Date())).length;
  const total = projects.length;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <FiAward className="w-8 h-8 text-[#94a3b8] mb-1.5" />
        <p className="text-xs text-[#94a3b8] font-bold">No assignments assigned</p>
      </div>
    );
  }

  const data = [
    { name: "Graded", count: graded, color: "#10b981" },
    { name: "Submitted", count: submitted, color: "#6366f1" },
    { name: "Overdue", count: overdue, color: "#fc362d" },
    { name: "Pending", count: pending, color: "#f59e0b" }
  ].filter(d => d.count > 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const pData = payload[0].payload;
      return (
        <div className="bg-[#0c0407] text-white p-2.5 rounded-xl shadow-xl border border-white/10 text-[10px] font-bold">
          <p style={{ color: pData.color }}>{pData.name}</p>
          <p className="text-white/60 mt-0.5">{pData.count} Project{pData.count !== 1 ? 's' : ''}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full flex items-center justify-around gap-4 px-2">
      <div className="relative w-28 h-28 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={36}
              outerRadius={48}
              paddingAngle={3}
              dataKey="count"
              animationDuration={500}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={1} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-lg font-black text-[#0c0407] tracking-tight">{total}</span>
          <span className="text-[7px] font-bold text-[#94a3b8] uppercase tracking-wider">Projects</span>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-1 w-full text-[11px] font-bold text-[#636363] justify-center">
        {data.map((item, index) => (
          <div key={index} className="flex justify-between items-center py-0.5 border-b border-black/[0.02] last:border-0">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.name}</span>
            </div>
            <span className="text-[#0c0407] font-black">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};




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
                <PrimaryButton onClick={() => navigate("/dashboard/student/projects")}>
                  Go to Projects
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

            {/* Workspace Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Attendance Chart */}
              <div className="bg-white border border-black/[0.06] rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-300 flex flex-col h-[220px]">
                <h3 className="text-xs font-black text-[#0c0407] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-[#10b981] rounded-full" />
                  Attendance progress
                </h3>
                <div className="flex-1 min-h-0 flex items-center justify-center">
                  <AttendanceChart attendance={attendance} />
                </div>
              </div>

              {/* Grades Trend Chart */}
              <div className="bg-white border border-black/[0.06] rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-300 flex flex-col h-[220px]">
                <h3 className="text-xs font-black text-[#0c0407] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-[#6366f1] rounded-full" />
                  Grades Trend (Scores)
                </h3>
                <div className="flex-1 min-h-0">
                  <GradesTrendChart projects={projects} />
                </div>
              </div>

              {/* Assignment Status Chart */}
              <div className="bg-white border border-black/[0.06] rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-300 flex flex-col h-[220px] md:col-span-2 lg:col-span-1">
                <h3 className="text-xs font-black text-[#0c0407] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-[#fc362d] rounded-full" />
                  Assignment Status
                </h3>
                <div className="flex-1 min-h-0 flex items-center justify-center">
                  <ProjectStatusChart projects={projects} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* ── Left (Projects & Materials) ── */}
              <div className="lg:col-span-2 space-y-6">




                {/* Materials */}
                <div id="materials-section" className="scroll-mt-6">
                  <h3 className="text-base font-extrabold text-[#0c0407] mb-4">Study Materials</h3>
                  {materials.length === 0 ? (
                    <div className="bg-[#fafafa] border border-dashed border-black/[0.08] rounded-2xl p-8 text-center">
                      <FiBookOpen className="w-8 h-8 text-[#94a3b8] mx-auto mb-2" />
                      <p className="text-xs text-[#94a3b8] font-semibold">No materials uploaded yet by your trainer.</p>
                    </div>
                  ) : (() => {
                    const grouped = materials.reduce((acc, m) => {
                      const t = m.topic_name || "General";
                      if (!acc[t]) acc[t] = [];
                      acc[t].push(m);
                      return acc;
                    }, {});
                    const topics = Object.keys(grouped).sort();
                    const getIcon = (type) => {
                      const t = (type || "").toUpperCase();
                      if (t === "PDF")   return { bg: "bg-red-50 text-red-600 border-red-200",    label: "PDF" };
                      if (t === "DOC")   return { bg: "bg-blue-50 text-blue-600 border-blue-200",  label: "DOC" };
                      if (t === "PPT")   return { bg: "bg-orange-50 text-orange-600 border-orange-200", label: "PPT" };
                      if (t === "VIDEO") return { bg: "bg-purple-50 text-purple-600 border-purple-200", label: "VID" };
                      return               { bg: "bg-[#f1f5f9] text-[#475569] border-black/10",   label: type };
                    };
                    return (
                      <div className="space-y-5">
                        {topics.map(topic => (
                          <div key={topic} className="bg-white border border-black/[0.07] rounded-2xl overflow-hidden">
                            <div className="flex items-center gap-2.5 px-4 py-3 bg-[#fafafa] border-b border-black/[0.06]">
                              <div className="w-6 h-6 rounded-lg bg-[#fc362d]/10 flex items-center justify-center shrink-0">
                                <FiBookOpen className="w-3.5 h-3.5 text-[#fc362d]" />
                              </div>
                              <h4 className="text-xs font-extrabold text-[#0c0407] uppercase tracking-wider flex-1">{topic}</h4>
                              <span className="text-[10px] font-bold text-[#94a3b8]">
                                {grouped[topic].length} file{grouped[topic].length !== 1 ? "s" : ""}
                              </span>
                            </div>
                            <div className="divide-y divide-black/[0.04]">
                              {grouped[topic].map(m => {
                                const icon  = getIcon(m.material_type);
                                const isB64 = m.file_url?.startsWith("data:");
                                const ext   = m.material_type === "PDF" ? ".pdf" : m.material_type === "DOC" ? ".docx" : m.material_type === "PPT" ? ".pptx" : ".file";
                                const dlName = `${m.title.replace(/\s+/g, "_")}${ext}`;
                                return (
                                  <div key={m.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-[#fafafa] transition-colors group">
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                      <span className={`shrink-0 text-[9px] font-extrabold px-2 py-0.5 rounded-lg border ${icon.bg}`}>
                                        {icon.label}
                                      </span>
                                      <p className="text-xs font-semibold text-[#0c0407] truncate group-hover:text-[#fc362d] transition-colors">
                                        {m.title}
                                      </p>
                                    </div>
                                    {isB64 ? (
                                      <a href={m.file_url} download={dlName}
                                        className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg border border-black/[0.08] text-[10px] font-bold text-[#475569] hover:text-[#fc362d] hover:border-[#fc362d]/30 transition-all no-underline">
                                        <FiDownload className="w-3 h-3" /> Download
                                      </a>
                                    ) : (
                                      <a href={m.file_url} target="_blank" rel="noopener noreferrer"
                                        className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg border border-black/[0.08] text-[10px] font-bold text-[#475569] hover:text-[#fc362d] hover:border-[#fc362d]/30 transition-all no-underline">
                                        <FiExternalLink className="w-3 h-3" /> Open
                                      </a>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

              </div>

              {/* ── Right Column (Trainer Info) ── */}
              <div className="space-y-5">

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
