import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowRight,
  FiAward,
  FiBarChart2,
  FiBookOpen,
  FiCalendar,
  FiClock,
  FiCreditCard,
  FiDownload,
  FiExternalLink,
  FiLayers,
  FiLock,
  FiRefreshCw,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import axios from "axios";
import {
  Panel,
  PanelHeader,
  PrimaryButton,
  SecondaryButton,
  StatCards,
  StatusBadge,
  WelcomeBanner,
} from "../DashboardUI";
import { BasicProfile, useBasicProfile } from "../BasicProfile";
import { ProfileAvatar } from "../ProfileAvatar";
import {
  cardClass,
  labelMutedClass,
  pageWrapClass,
  primaryBtnClass,
  secondaryBtnClass,
} from "../dashboardTheme";
import { MyFeesDesk } from "./MyFeesDesk";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHART_COLORS = ["#fc362d", "#6366f1", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"];
const POSITIVE_ATTENDANCE = new Set(["PRESENT", "LATE"]);

const fmtDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const fmtShortDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      })
    : "—";

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const toDate = (value) => {
  if (!value) return null;
  const parsed = new Date(String(value).includes("T") ? value : `${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const normalizeStatus = (status) => String(status || "").toUpperCase();

const getProjectState = (project) => {
  if (project?.submission?.marks > 0) return "graded";
  if (project?.submission) return "submitted";
  const deadline = toDate(project?.deadline);
  if (deadline && deadline < new Date()) return "overdue";
  return "pending";
};

const getMarksScale = (projects) => {
  const maxMarks = Math.max(
    0,
    ...projects.map((project) => Number(project?.submission?.marks || 0))
  );
  return maxMarks <= 10 ? 10 : 100;
};

const getDaysUntil = (value) => {
  const target = toDate(value);
  if (!target) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
};

const calculateTimelineProgress = (startDate, endDate) => {
  const start = toDate(startDate);
  const end = toDate(endDate);
  if (!start || !end || end <= start) return 0;
  const now = new Date();
  if (now <= start) return 0;
  if (now >= end) return 100;
  return Math.max(0, Math.min(100, Math.round(((now - start) / (end - start)) * 100)));
};

const buildAttendanceTrend = (records = []) => {
  const sorted = [...records]
    .filter((record) => record?.attendance_date)
    .sort((a, b) => new Date(a.attendance_date) - new Date(b.attendance_date));

  let runningPositive = 0;
  let runningTotal = 0;

  return sorted
    .map((record) => {
      runningTotal += 1;
      if (POSITIVE_ATTENDANCE.has(normalizeStatus(record.status))) {
        runningPositive += 1;
      }

      return {
        label: fmtShortDate(record.attendance_date),
        date: fmtDate(record.attendance_date),
        status: normalizeStatus(record.status),
        pct: Math.round((runningPositive / runningTotal) * 100),
      };
    })
    .slice(-8);
};

const buildMarksTrend = (projects = [], marksScale = 10) =>
  projects
    .filter(
      (project) =>
        project?.submission &&
        project.submission.marks !== null &&
        project.submission.marks !== undefined &&
        project.submission.marks !== ""
    )
    .map((project) => ({
      label: project.title?.length > 16 ? `${project.title.slice(0, 13)}...` : project.title,
      title: project.title,
      marks: Number(project.submission.marks || 0),
      submittedAt: fmtDate(project.submission.submitted_at),
      marksScale,
    }));

const buildMaterialMix = (materials = []) => {
  const grouped = materials.reduce((acc, material) => {
    const key = String(material?.material_type || "OTHER").toUpperCase();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([name, count], index) => ({
      name,
      count,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }))
    .sort((a, b) => b.count - a.count);
};

const getMaterialBadge = (type) => {
  const normalized = String(type || "").toUpperCase();
  if (normalized === "PDF") return "bg-red-50 text-red-600 border-red-200";
  if (normalized === "DOC") return "bg-blue-50 text-blue-600 border-blue-200";
  if (normalized === "PPT") return "bg-orange-50 text-orange-600 border-orange-200";
  if (normalized === "VIDEO") return "bg-purple-50 text-purple-600 border-purple-200";
  if (normalized === "LINK") return "bg-sky-50 text-sky-600 border-sky-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
};

function EmptyCardState({ icon: Icon, title, description }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center px-4">
      <Icon className="w-8 h-8 text-[#94a3b8] mb-2" />
      <p className="text-sm font-bold text-[#475569]">{title}</p>
      <p className="text-xs text-[#94a3b8] mt-1 max-w-xs">{description}</p>
    </div>
  );
}

function ChartCard({ title, subtitle, icon, iconClassName, children, height = "h-[320px]" }) {
  return (
    <div className={`${cardClass} p-5 sm:p-6 flex flex-col ${height}`}>
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

function ProgressRow({ label, value, hint, percent, fillClassName }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-[#0c0407]">{label}</p>
          <p className="text-[10px] font-semibold text-[#94a3b8] mt-0.5">{hint}</p>
        </div>
        <span className="text-xs font-black text-[#0c0407]">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-[#f1f5f9] overflow-hidden">
        <div
          className={`h-full rounded-full ${fillClassName}`}
          style={{ width: `${Math.max(0, Math.min(100, percent || 0))}%` }}
        />
      </div>
    </div>
  );
}

function AttendanceTrendChart({ data }) {
  if (!data.length) {
    return (
      <EmptyCardState
        icon={FiUsers}
        title="Attendance is not available yet"
        description="Once sessions are marked by your trainer, the recent trend appears here."
      />
    );
  }

  const tooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const point = payload[0].payload;
    return (
      <div className="bg-[#0c0407] text-white p-3 rounded-xl shadow-xl border border-white/10 text-xs font-semibold">
        <p className="text-white/60">{point.date}</p>
        <p className="text-[#10b981] font-black mt-1">{point.pct}% running attendance</p>
        <p className="text-white/60 mt-1">Status: {point.status}</p>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 6, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="studentAttendanceTrend" x1="0" y1="0" x2="0" y2="1">
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
          fill="url(#studentAttendanceTrend)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ProjectPipelineChart({ data }) {
  if (!data.some((item) => item.count > 0)) {
    return (
      <EmptyCardState
        icon={FiAward}
        title="No project pipeline yet"
        description="Assigned projects, submitted work, and reviews will appear here."
      />
    );
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
      <BarChart data={data} margin={{ top: 8, right: 6, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
        <XAxis
          dataKey="name"
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
        <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={42}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function MarksTrendChart({ data, marksScale }) {
  if (!data.length) {
    return (
      <EmptyCardState
        icon={FiTrendingUp}
        title="No grades published yet"
        description="Your score progression appears after the trainer starts grading submissions."
      />
    );
  }

  const tooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const point = payload[0].payload;
    return (
      <div className="bg-[#0c0407] text-white p-3 rounded-xl shadow-xl border border-white/10 text-xs font-semibold">
        <p className="text-white/60 truncate max-w-[180px]">{point.title}</p>
        <p className="text-[#6366f1] font-black mt-1">
          {point.marks}/{marksScale}
        </p>
        <p className="text-white/60 mt-1">Submitted: {point.submittedAt}</p>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 6, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="studentMarksTrend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.22} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
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
          domain={[0, marksScale]}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
        />
        <Tooltip content={tooltip} />
        <Area
          type="monotone"
          dataKey="marks"
          stroke="#6366f1"
          strokeWidth={2.5}
          fillOpacity={1}
          fill="url(#studentMarksTrend)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function MaterialsMixChart({ data }) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  if (!total) {
    return (
      <EmptyCardState
        icon={FiBookOpen}
        title="No study materials yet"
        description="Uploaded PDFs, videos, and links appear here once your trainer adds them."
      />
    );
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
          {point.count} resource{point.count !== 1 ? "s" : ""}
        </p>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col sm:flex-row items-center justify-center gap-6">
      <div className="relative w-40 h-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={68}
              paddingAngle={3}
              dataKey="count"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} stroke="white" strokeWidth={1} />
              ))}
            </Pie>
            <Tooltip content={tooltip} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-[#0c0407]">{total}</span>
          <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">
            Resources
          </span>
        </div>
      </div>
      <div className="flex-1 w-full space-y-2">
        {data.map((item) => {
          const percentage = total ? Math.round((item.count / total) * 100) : 0;
          return (
            <div
              key={item.name}
              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#fafafa] border border-black/[0.05]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <p className="text-xs font-bold text-[#0c0407] truncate">{item.name}</p>
              </div>
              <span className="text-xs font-extrabold text-[#475569]">
                {item.count} • {percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const StudentDashboard = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("workspace");
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feeData, setFeeData] = useState(null);
  const {
    basicProfileOpen,
    basicProfileType,
    basicProfileId,
    openBasicProfile,
    closeBasicProfile,
  } = useBasicProfile();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setActiveTab(params.get("tab") === "fees" ? "fees" : "workspace");
  }, [location.search]);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/students/me/dashboard");
      setDashData(data);
    } catch {
      setDashData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFeeStatus = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/students/me/fees");
      setFeeData(data);
    } catch {
      setFeeData(null);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchFeeStatus();
  }, [fetchDashboard, fetchFeeStatus]);

  const fee = feeData?.Fees?.[0] || null;
  const paymentStatus = fee?.payment_status || "NONE";
  const feeBalance = Number(fee?.due_amount || 0);
  const paidAmount = Number(fee?.paid_ammount || fee?.paid_amount || 0);
  const totalFeeAmount = Number(fee?.total_amount || 0);
  const paymentScheme = fee?.payment_scheme_mode || "FULL";
  const isPendingFirst = ["PENDING_FIRST_PAYMENT", "NONE"].includes(paymentStatus);
  const isFullPlan = paymentScheme === "FULL";

  const attendance = dashData?.attendance || { total: 0, present: 0, absent: 0, pct: 0, records: [] };
  const attendanceRecords = attendance.records || [];
  const projects = dashData?.projects || [];
  const materials = dashData?.materials || [];
  const batchInfo = dashData?.batch || null;
  const courseInfo = dashData?.course || null;
  const trainerInfo = dashData?.trainer || null;
  const studentInfo = dashData?.student || null;

  const marksScale = useMemo(() => getMarksScale(projects), [projects]);
  const submittedCount = useMemo(() => projects.filter((project) => Boolean(project.submission)).length, [projects]);
  const gradedCount = useMemo(() => projects.filter((project) => project?.submission?.marks > 0).length, [projects]);
  const overdueCount = useMemo(
    () => projects.filter((project) => getProjectState(project) === "overdue").length,
    [projects]
  );
  const averageMarks = useMemo(() => {
    const gradedProjects = projects.filter((project) => project?.submission?.marks > 0);
    if (!gradedProjects.length) return null;
    const total = gradedProjects.reduce((sum, project) => sum + Number(project.submission.marks || 0), 0);
    return total / gradedProjects.length;
  }, [projects]);
  const submissionRate = projects.length ? Math.round((submittedCount / projects.length) * 100) : 0;
  const timelineProgress = calculateTimelineProgress(batchInfo?.start_date, batchInfo?.end_date);
  const attendanceTrend = useMemo(() => buildAttendanceTrend(attendanceRecords), [attendanceRecords]);
  const marksTrend = useMemo(() => buildMarksTrend(projects, marksScale), [projects, marksScale]);
  const materialsMix = useMemo(() => buildMaterialMix(materials), [materials]);
  const recentMaterials = useMemo(
    () => [...materials].sort((a, b) => Number(b.id || 0) - Number(a.id || 0)).slice(0, 6),
    [materials]
  );
  const groupedMaterials = useMemo(() => {
    return materials.reduce((acc, material) => {
      const topic = material.topic_name || "General";
      if (!acc[topic]) acc[topic] = [];
      acc[topic].push(material);
      return acc;
    }, {});
  }, [materials]);
  const topTopics = Object.entries(groupedMaterials)
    .map(([topic, items]) => ({ topic, count: items.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  const prioritizedProjects = useMemo(() => {
    const priorityWeight = {
      overdue: 0,
      pending: 1,
      submitted: 2,
      graded: 3,
    };

    return [...projects]
      .map((project) => ({
        ...project,
        state: getProjectState(project),
        daysUntil: getDaysUntil(project.deadline),
      }))
      .sort((a, b) => {
        const byState = priorityWeight[a.state] - priorityWeight[b.state];
        if (byState !== 0) return byState;
        return (a.daysUntil ?? 9999) - (b.daysUntil ?? 9999);
      })
      .slice(0, 5);
  }, [projects]);

  const nextDeadlineProject = prioritizedProjects.find(
    (project) => project.state === "pending" || project.state === "overdue"
  );
  const nextInstallment = useMemo(() => {
    const installments = fee?.installments || [];
    return [...installments]
      .filter((item) => item.status !== "PAID")
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];
  }, [fee]);

  const isEligible = attendance.pct >= 85 && feeBalance === 0 && !isPendingFirst;

  const projectPipeline = [
    { name: "Assigned", count: projects.length, color: "#fc362d" },
    { name: "Submitted", count: submittedCount, color: "#6366f1" },
    { name: "Reviewed", count: gradedCount, color: "#10b981" },
    { name: "Overdue", count: overdueCount, color: "#f59e0b" },
  ];

  const workspaceStatus = attendance.pct >= 75 && overdueCount === 0
    ? "Healthy progress"
    : overdueCount > 0
      ? "Needs attention"
      : "Building momentum";

  if (loading) {
    return (
      <div className={pageWrapClass}>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-[#fc362d]/20 border-t-[#fc362d] rounded-full animate-spin" />
          <p className="text-sm font-semibold text-[#94a3b8]">Loading student dashboard…</p>
        </div>
      </div>
    );
  }

  if (activeTab === "fees") {
    return (
      <div className={pageWrapClass}>
        <div className="flex border-b border-black/[0.08] text-xs font-bold text-[#94a3b8] gap-6 pb-0">
          {[
            { key: "workspace", label: "My Workspace", path: "/dashboard" },
            { key: "fees", label: "Fees & Access Desk", path: "/dashboard?tab=fees" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => navigate(tab.path)}
              className={`pb-3 transition-all relative cursor-pointer ${
                activeTab === tab.key ? "text-[#fc362d] font-extrabold" : "hover:text-[#0c0407]"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#fc362d] rounded-full" />
              )}
            </button>
          ))}
        </div>
        <MyFeesDesk onPaymentSuccess={fetchFeeStatus} />
      </div>
    );
  }

  if (!dashData) {
    return (
      <div className={pageWrapClass}>
        <Panel>
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <FiAlertCircle className="w-12 h-12 text-[#fc362d] mb-3" />
            <h2 className="text-lg font-extrabold text-[#0c0407]">Student dashboard could not be loaded</h2>
            <p className="text-sm text-[#94a3b8] mt-2 max-w-md">
              Refresh to retry the workspace analytics and learner overview panels.
            </p>
            <button
              onClick={fetchDashboard}
              className={`${primaryBtnClass} mt-5 inline-flex items-center gap-2`}
            >
              <FiRefreshCw className="w-3.5 h-3.5" />
              Retry Dashboard
            </button>
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className={pageWrapClass}>
      <BasicProfile
        open={basicProfileOpen}
        profileType={basicProfileType}
        profileId={basicProfileId}
        onClose={closeBasicProfile}
      />
      <div className="flex border-b border-black/[0.08] text-xs font-bold text-[#94a3b8] gap-6 pb-0">
        {[
          { key: "workspace", label: "My Workspace", path: "/dashboard" },
          { key: "fees", label: "Fees & Access Desk", path: "/dashboard?tab=fees" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => navigate(tab.path)}
            className={`pb-3 transition-all relative cursor-pointer ${
              activeTab === tab.key ? "text-[#fc362d] font-extrabold" : "hover:text-[#0c0407]"
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#fc362d] rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="relative">
        {isPendingFirst && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/50 backdrop-blur-[6px] rounded-2xl">
            <div className="bg-white border border-black/10 p-6 rounded-2xl max-w-sm text-center shadow-xl">
              <FiLock className="w-12 h-12 text-[#fc362d] mx-auto mb-3 animate-bounce" />
              <h3 className="text-base font-extrabold text-[#0c0407]">Access Restricted</h3>
              <p className="text-xs text-[#636363] mt-2 leading-relaxed">
                Complete your {isFullPlan ? "full course fee" : "initial installment"} to unlock the
                full student workspace.
              </p>
              <button
                onClick={() => navigate("/dashboard?tab=fees")}
                className={`mt-4 px-5 py-2.5 ${primaryBtnClass} mx-auto block`}
              >
                {isFullPlan ? "Pay Full Fee" : "Pay Installment"}
              </button>
            </div>
          </div>
        )}

        <div className={isPendingFirst ? "filter blur-[3px] pointer-events-none select-none space-y-6" : "space-y-6"}>
          <WelcomeBanner
            badge="Student Command Center"
            title={`Welcome back, ${user?.name || "Student"}!`}
            description={[
              courseInfo?.title ? `${courseInfo.title}` : "Your active program",
              batchInfo?.batch_name ? `in ${batchInfo.batch_name}` : null,
              trainerInfo?.name ? `with ${trainerInfo.name}` : null,
            ]
              .filter(Boolean)
              .join(" ")}
            actions={
              <>
                <PrimaryButton onClick={() => navigate("/dashboard/student/projects")}>
                  Open Projects
                </PrimaryButton>
                <SecondaryButton onClick={() => navigate("/dashboard/student/materials")}>
                  Browse Materials
                </SecondaryButton>
              </>
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className={`${cardClass} p-4`}>
              <p className={labelMutedClass}>Active Batch</p>
              <p className="text-lg font-extrabold text-[#0c0407] mt-2">
                {batchInfo?.batch_name || "Not Assigned"}
              </p>
              <p className="text-xs font-semibold text-[#94a3b8] mt-1">
                {courseInfo?.title || "Course details unavailable"}
              </p>
            </div>
            <div className={`${cardClass} p-4`}>
              <p className={labelMutedClass}>Next Deadline</p>
              <p className="text-lg font-extrabold text-[#0c0407] mt-2">
                {nextDeadlineProject ? fmtShortDate(nextDeadlineProject.deadline) : "All clear"}
              </p>
              <p className="text-xs font-semibold text-[#94a3b8] mt-1 truncate">
                {nextDeadlineProject?.title || "No pending submissions"}
              </p>
            </div>
            <div className={`${cardClass} p-4`}>
              <p className={labelMutedClass}>Workspace Status</p>
              <p className="text-lg font-extrabold text-[#0c0407] mt-2">{workspaceStatus}</p>
              <p className="text-xs font-semibold text-[#94a3b8] mt-1">
                {attendance.total} session{attendance.total !== 1 ? "s" : ""} tracked
              </p>
            </div>
            <div className={`${cardClass} p-4`}>
              <p className={labelMutedClass}>Student ID</p>
              <p className="text-lg font-extrabold text-[#0c0407] mt-2">
                {studentInfo?.student_code || "—"}
              </p>
              <p className="text-xs font-semibold text-[#94a3b8] mt-1">
                {trainerInfo?.name ? `Trainer: ${trainerInfo.name}` : "Trainer not assigned"}
              </p>
            </div>
          </div>

          <StatCards
            stats={[
              {
                label: "Attendance",
                value: `${attendance.pct || 0}%`,
                change: attendance.pct >= 75 ? "On track" : "Needs support",
                icon: <FiUsers className="w-5 h-5" />,
                trendType: attendance.pct >= 75 ? "up" : "down",
              },
              {
                label: "Submission Rate",
                value: `${submittedCount}/${projects.length || 0}`,
                change: projects.length ? `${submissionRate}% completed` : "No assignments yet",
                icon: <FiAward className="w-5 h-5" />,
                trendType: submissionRate >= 70 ? "up" : "down",
              },
              {
                label: "Average Score",
                value:
                  averageMarks === null
                    ? "—"
                    : `${averageMarks.toFixed(marksScale === 10 ? 1 : 0)}/${marksScale}`,
                change: gradedCount ? `${gradedCount} review${gradedCount !== 1 ? "s" : ""}` : "Awaiting grades",
                icon: <FiTrendingUp className="w-5 h-5" />,
                trendType: averageMarks !== null && averageMarks >= marksScale * 0.7 ? "up" : "down",
              },
              {
                label: "Outstanding Fees",
                value: formatCurrency(feeBalance),
                change: feeBalance === 0 ? "Account clear" : "Balance pending",
                icon: <FiCreditCard className="w-5 h-5" />,
                trendType: feeBalance === 0 ? "up" : "down",
              },
            ]}
          />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard
                  title="Attendance Momentum"
                  subtitle="Running attendance trend from recent marked sessions"
                  icon={<FiUsers className="w-5 h-5" />}
                  iconClassName="bg-emerald-50 text-emerald-600"
                >
                  <AttendanceTrendChart data={attendanceTrend} />
                </ChartCard>

                <ChartCard
                  title="Assignment Pipeline"
                  subtitle="How your workload is moving from assigned to reviewed"
                  icon={<FiBarChart2 className="w-5 h-5" />}
                  iconClassName="bg-red-50 text-[#fc362d]"
                >
                  <ProjectPipelineChart data={projectPipeline} />
                </ChartCard>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard
                  title="Score Progress"
                  subtitle={`Performance trend across graded work (out of ${marksScale})`}
                  icon={<FiTrendingUp className="w-5 h-5" />}
                  iconClassName="bg-indigo-50 text-indigo-600"
                >
                  <MarksTrendChart data={marksTrend} marksScale={marksScale} />
                </ChartCard>

                <ChartCard
                  title="Resource Mix"
                  subtitle="Content types available in your study library"
                  icon={<FiBookOpen className="w-5 h-5" />}
                  iconClassName="bg-sky-50 text-sky-600"
                >
                  <MaterialsMixChart data={materialsMix} />
                </ChartCard>
              </div>

              <Panel>
                <PanelHeader
                  eyebrow="Priority Board"
                  title="Upcoming Work And Reviews"
                  action={
                    <button
                      onClick={() => navigate("/dashboard/student/projects")}
                      className="text-xs font-bold text-[#fc362d] inline-flex items-center gap-1"
                    >
                      Open Projects
                      <FiArrowRight className="w-3.5 h-3.5" />
                    </button>
                  }
                />

                {!prioritizedProjects.length ? (
                  <EmptyCardState
                    icon={FiAward}
                    title="No projects assigned right now"
                    description="When new assignments are published by your trainer, they show up here."
                  />
                ) : (
                  <div className="space-y-3">
                    {prioritizedProjects.map((project) => {
                      const daysUntil = project.daysUntil;
                      const statusLabelMap = {
                        graded: "Reviewed",
                        submitted: "Submitted",
                        overdue: "Overdue",
                        pending: "Pending",
                      };
                      const badgeVariantMap = {
                        graded: "ok",
                        submitted: "info",
                        overdue: "danger",
                        pending: "warn",
                      };

                      let meta = "No deadline provided";
                      if (daysUntil !== null) {
                        if (daysUntil < 0) meta = `${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? "s" : ""} overdue`;
                        else if (daysUntil === 0) meta = "Due today";
                        else meta = `Due in ${daysUntil} day${daysUntil !== 1 ? "s" : ""}`;
                      }

                      return (
                        <div
                          key={project.id}
                          className="border border-black/[0.06] rounded-2xl p-4 bg-[#fafafa] hover:bg-white transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-extrabold text-[#0c0407]">{project.title}</p>
                                <StatusBadge variant={badgeVariantMap[project.state]}>
                                  {statusLabelMap[project.state]}
                                </StatusBadge>
                              </div>
                              <p className="text-xs text-[#636363] mt-2 line-clamp-2">
                                {project.description || "No project description provided yet."}
                              </p>
                              <div className="flex flex-wrap items-center gap-4 mt-3 text-[11px] font-semibold text-[#94a3b8]">
                                <span className="inline-flex items-center gap-1.5">
                                  <FiCalendar className="w-3.5 h-3.5" />
                                  {fmtDate(project.deadline)}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                  <FiClock className="w-3.5 h-3.5" />
                                  {meta}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => navigate("/dashboard/student/projects")}
                              className={`${project.state === "pending" || project.state === "overdue" ? primaryBtnClass : secondaryBtnClass} shrink-0`}
                            >
                              {project.state === "graded" ? "View Feedback" : "Open"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Panel>

              <Panel>
                <PanelHeader
                  eyebrow="Study Library"
                  title="Recent Materials"
                  action={
                    <button
                      onClick={() => navigate("/dashboard/student/materials")}
                      className="text-xs font-bold text-[#fc362d] inline-flex items-center gap-1"
                    >
                      View All
                      <FiArrowRight className="w-3.5 h-3.5" />
                    </button>
                  }
                />

                {!recentMaterials.length ? (
                  <EmptyCardState
                    icon={FiBookOpen}
                    title="Your library is empty right now"
                    description="Once your trainer shares learning resources, they appear here with direct access."
                  />
                ) : (
                  <div className="space-y-3">
                    {recentMaterials.map((material) => {
                      const isBase64 = material.file_url?.startsWith("data:");
                      const ext =
                        material.material_type === "PDF"
                          ? ".pdf"
                          : material.material_type === "DOC"
                            ? ".docx"
                            : material.material_type === "PPT"
                              ? ".pptx"
                              : ".file";
                      const downloadName = `${material.title.replace(/\s+/g, "_")}${ext}`;

                      return (
                        <div
                          key={material.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-black/[0.06] bg-[#fafafa] hover:bg-white transition-colors"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[10px] font-extrabold px-2 py-1 rounded-lg border ${getMaterialBadge(material.material_type)}`}>
                                {material.material_type || "FILE"}
                              </span>
                              <p className="text-sm font-bold text-[#0c0407] truncate">{material.title}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] font-semibold text-[#94a3b8]">
                              <span>{material.topic_name || "General"}</span>
                              <span>Uploaded by {material.uploader_name || "Trainer"}</span>
                            </div>
                          </div>
                          {isBase64 ? (
                            <a
                              href={material.file_url}
                              download={downloadName}
                              className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-black/[0.08] text-xs font-bold text-[#475569] hover:text-[#fc362d] hover:border-[#fc362d]/30 transition-all no-underline"
                            >
                              <FiDownload className="w-3.5 h-3.5" />
                              Download
                            </a>
                          ) : (
                            <a
                              href={material.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-black/[0.08] text-xs font-bold text-[#475569] hover:text-[#fc362d] hover:border-[#fc362d]/30 transition-all no-underline"
                            >
                              <FiExternalLink className="w-3.5 h-3.5" />
                              Open Resource
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Panel>
            </div>

            <div className="space-y-6">
              <Panel>
                <PanelHeader eyebrow="Learning Snapshot" title="Cohort Overview" />
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-[#fafafa] border border-black/[0.05] p-4">
                      <p className={labelMutedClass}>Course</p>
                      <p className="text-sm font-extrabold text-[#0c0407] mt-2">
                        {courseInfo?.title || "Not assigned"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#fafafa] border border-black/[0.05] p-4">
                      <p className={labelMutedClass}>Batch</p>
                      <p className="text-sm font-extrabold text-[#0c0407] mt-2">
                        {batchInfo?.batch_name || "Pending"}
                      </p>
                    </div>
                  </div>

                  <ProgressRow
                    label="Course Timeline"
                    value={`${timelineProgress}%`}
                    hint={`${fmtDate(batchInfo?.start_date)} - ${fmtDate(batchInfo?.end_date)}`}
                    percent={timelineProgress}
                    fillClassName="bg-gradient-to-r from-[#fc362d] to-rose-500"
                  />
                  <ProgressRow
                    label="Submission Coverage"
                    value={`${submissionRate}%`}
                    hint={`${submittedCount} of ${projects.length || 0} assignments submitted`}
                    percent={submissionRate}
                    fillClassName="bg-gradient-to-r from-indigo-500 to-sky-500"
                  />
                  <ProgressRow
                    label="Attendance Health"
                    value={`${attendance.pct || 0}%`}
                    hint={`${attendance.present || 0} present out of ${attendance.total || 0} sessions`}
                    percent={attendance.pct || 0}
                    fillClassName="bg-gradient-to-r from-emerald-500 to-teal-500"
                  />
                </div>
              </Panel>

              <Panel>
                <PanelHeader eyebrow="Mentor Desk" title="Your Trainer" />
                {trainerInfo ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <ProfileAvatar
                        src={trainerInfo.profile_img}
                        name={trainerInfo.name}
                        profileType="trainer"
                        size="lg"
                        onClick={() => openBasicProfile("trainer", trainerInfo.id)}
                      />
                      <div>
                        <p className="text-base font-extrabold text-[#0c0407]">
                          {trainerInfo.name || "Trainer"}
                        </p>
                        <p className="text-xs text-[#94a3b8] font-semibold mt-1">
                          {trainerInfo.specialization || "Academic mentor"}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-[#fafafa] border border-black/[0.05] p-4">
                      <p className="text-xs font-semibold text-[#636363] leading-relaxed">
                        Use the project and materials sections to stay synced with your trainer’s
                        updates, shared resources, and graded feedback.
                      </p>
                    </div>
                  </div>
                ) : (
                  <EmptyCardState
                    icon={FiUsers}
                    title="Trainer details are not available"
                    description="Your assigned trainer will appear here once the batch mapping is configured."
                  />
                )}
              </Panel>

              <Panel>
                <PanelHeader eyebrow="Finance And Access" title="Account Readiness" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-[#fafafa] border border-black/[0.05]">
                    <div>
                      <p className="text-xs font-bold text-[#0c0407]">Access State</p>
                      <p className="text-[11px] font-semibold text-[#94a3b8] mt-1">
                        {isPendingFirst ? "Workspace locked until first payment clears" : "Workspace access is active"}
                      </p>
                    </div>
                    <StatusBadge variant={isPendingFirst ? "danger" : "ok"}>
                      {isPendingFirst ? "Locked" : "Active"}
                    </StatusBadge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-[#fafafa] border border-black/[0.05] p-4">
                      <p className={labelMutedClass}>Paid So Far</p>
                      <p className="text-sm font-extrabold text-[#0c0407] mt-2">
                        {formatCurrency(paidAmount)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#fafafa] border border-black/[0.05] p-4">
                      <p className={labelMutedClass}>Balance</p>
                      <p className="text-sm font-extrabold text-[#0c0407] mt-2">
                        {formatCurrency(feeBalance)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#fafafa] border border-black/[0.05] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-[#0c0407]">
                          {paymentScheme === "FULL" ? "Full Payment Plan" : "Installment Plan"}
                        </p>
                        <p className="text-[11px] font-semibold text-[#94a3b8] mt-1">
                          Total fee: {formatCurrency(totalFeeAmount)}
                        </p>
                      </div>
                      {feeBalance === 0 ? (
                        <StatusBadge variant="ok">Cleared</StatusBadge>
                      ) : (
                        <StatusBadge variant="warn">Pending</StatusBadge>
                      )}
                    </div>
                    {nextInstallment && (
                      <p className="text-[11px] font-semibold text-[#636363] mt-3">
                        Next due: {nextInstallment.installment_label || "Installment"} on{" "}
                        {fmtDate(nextInstallment.due_date)}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => navigate("/dashboard?tab=fees")}
                    className={`${feeBalance === 0 ? secondaryBtnClass : primaryBtnClass} w-full`}
                  >
                    Open Fees Desk
                  </button>
                </div>
              </Panel>

              <Panel>
                <PanelHeader eyebrow="Milestones" title="Progress Checklist" />
                <div className="space-y-3">
                  {[
                    {
                      label: "Attendance above 85%",
                      detail: `${attendance.pct || 0}% currently`,
                      done: attendance.pct >= 85,
                    },
                    {
                      label: "Fee account cleared",
                      detail: feeBalance === 0 ? "No pending balance" : `${formatCurrency(feeBalance)} still due`,
                      done: feeBalance === 0 && !isPendingFirst,
                    },
                    {
                      label: "All projects submitted",
                      detail: `${submittedCount}/${projects.length || 0} submitted`,
                      done: projects.length > 0 && submittedCount === projects.length,
                    },
                    {
                      label: "Reviewed work available",
                      detail: gradedCount ? `${gradedCount} graded project${gradedCount !== 1 ? "s" : ""}` : "Awaiting trainer review",
                      done: gradedCount > 0,
                    },
                    {
                      label: "Certificate readiness",
                      detail: isEligible ? "Core checks are satisfied" : "Needs attendance and finance clearance",
                      done: isEligible,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-start justify-between gap-3 p-3 rounded-2xl bg-[#fafafa] border border-black/[0.05]"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#0c0407]">{item.label}</p>
                        <p className="text-[11px] font-semibold text-[#94a3b8] mt-1">{item.detail}</p>
                      </div>
                      <StatusBadge variant={item.done ? "ok" : "info"}>
                        {item.done ? "Done" : "Pending"}
                      </StatusBadge>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel>
                <PanelHeader eyebrow="Quick Actions" title="Keep Moving" />
                <div className="space-y-2.5">
                  {[
                    {
                      label: "Review Projects",
                      hint: "Open assignments and submissions",
                      icon: <FiAward className="w-4 h-4" />,
                      action: () => navigate("/dashboard/student/projects"),
                    },
                    {
                      label: "Open Study Materials",
                      hint: "Browse uploaded learning resources",
                      icon: <FiBookOpen className="w-4 h-4" />,
                      action: () => navigate("/dashboard/student/materials"),
                    },
                    {
                      label: "Check Notifications",
                      hint: "See reminders and announcements",
                      icon: <FiAlertCircle className="w-4 h-4" />,
                      action: () => navigate("/dashboard/notifications"),
                    },
                    {
                      label: "Open Fees Desk",
                      hint: "Track payments and access",
                      icon: <FiCreditCard className="w-4 h-4" />,
                      action: () => navigate("/dashboard?tab=fees"),
                    },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="w-full flex items-center justify-between gap-3 p-3 rounded-2xl border border-black/[0.06] bg-[#fafafa] hover:bg-white hover:border-[#fc362d]/20 hover:shadow-sm transition-all text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-9 h-9 rounded-xl bg-[#fc362d]/10 text-[#fc362d] flex items-center justify-center shrink-0">
                          {item.icon}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#0c0407]">{item.label}</p>
                          <p className="text-[11px] font-semibold text-[#94a3b8] mt-0.5">{item.hint}</p>
                        </div>
                      </div>
                      <FiArrowRight className="w-4 h-4 text-[#94a3b8] shrink-0" />
                    </button>
                  ))}
                </div>
              </Panel>

              {topTopics.length > 0 && (
                <Panel>
                  <PanelHeader eyebrow="Topic Coverage" title="Strongest Resource Areas" />
                  <div className="space-y-3">
                    {topTopics.map((topic) => (
                      <div
                        key={topic.topic}
                        className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#fafafa] border border-black/[0.05]"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-9 h-9 rounded-xl bg-[#fc362d]/10 text-[#fc362d] flex items-center justify-center shrink-0">
                            <FiLayers className="w-4 h-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#0c0407] truncate">{topic.topic}</p>
                            <p className="text-[11px] font-semibold text-[#94a3b8] mt-0.5">
                              {topic.count} resource{topic.count !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <StatusBadge variant="info">{topic.count}</StatusBadge>
                      </div>
                    ))}
                  </div>
                </Panel>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
