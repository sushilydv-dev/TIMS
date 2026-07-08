import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiBookOpen,
  FiDollarSign,
  FiLayers,
  FiTrendingUp,
  FiPieChart,
  FiBarChart2,
  FiActivity
} from "react-icons/fi";
import axios from "axios";
import { pageWrapClass } from "../dashboardTheme";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie
} from "recharts";

// Premium Color Palette
const COLORS = [
  "#fc362d", // Primary Red
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
  "#ec4899", // Pink
  "#f97316", // Orange
];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatCompactNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

export const AdminDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revenuePeriod, setRevenuePeriod] = useState("monthly"); // 'monthly', 'quarterly', 'yearly'

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get("/api/admin/dashboard-stats");
        setStats(response.data.stats);
        setCharts(response.data.charts);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getRevenueData = () => {
    switch (revenuePeriod) {
      case "monthly":
        return charts?.monthlyRevenue || [];
      case "quarterly":
        return charts?.quarterlyRevenue || [];
      case "yearly":
      default:
        return charts?.yearlyRevenue || [];
    }
  };

  const getRevenueLabel = (item) => {
    switch (revenuePeriod) {
      case "monthly":
        return `${item.month} ${item.year.toString().slice(-2)}`;
      case "quarterly":
        return item.label;
      case "yearly":
      default:
        return item.year;
    }
  };

  if (loading) {
    return (
      <div className={pageWrapClass}>
        <div className="flex items-center justify-center h-96">
          <div className="relative flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#fc362d]"></div>
            <div className="absolute text-xs font-bold text-[#0c0407] animate-pulse">TIMS</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={pageWrapClass}>
      {/* Welcome Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0c0407] tracking-tight">
            Welcome back, {user?.name || "Administrator"}!
          </h1>
          <p className="text-[#636363] mt-1.5 text-sm">
            Monitor system health, user access, courses, and financial flows from one console.
          </p>
        </div>
        
      </div>

      {/* 4 Stat Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatTile
          label="Total Active Users"
          value={stats?.totalActiveUsers || 0}
          icon={<FiUsers className="w-5 h-5" />}
          color="#fc362d"
        />
        <StatTile
          label="Total Courses Offered"
          value={stats?.totalCourses || 0}
          icon={<FiBookOpen className="w-5 h-5" />}
          color="#6366f1"
        />
        <StatTile
          label="Total Departments"
          value={stats?.totalDepartments || 0}
          icon={<FiLayers className="w-5 h-5" />}
          color="#10b981"
        />
        <StatTile
          label="MTD Revenue"
          value={formatCurrency(stats?.mtdRevenue || 0)}
          icon={<FiDollarSign className="w-5 h-5" />}
          color="#f59e0b"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Line/Area Chart - Monthly Enrollments */}
        <div className="bg-white border border-black/[0.06] rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_30px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col h-[380px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-[#fc362d]">
                <FiTrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-base font-extrabold text-[#0c0407]">Student Enrollments Trend</h3>
            </div>
            <span className="text-xs font-semibold text-[#636363] bg-[#f8fafc] px-2.5 py-1 rounded-md border border-black/[0.04]">Last 12 Months</span>
          </div>
          <div className="flex-1 min-h-0">
            <EnrollmentTrendChart data={charts?.monthlyEnrollments || []} />
          </div>
        </div>

        {/* Bar Chart - Revenue */}
        <div className="bg-white border border-black/[0.06] rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_30px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col h-[380px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-[#f59e0b]">
                <FiBarChart2 className="w-4 h-4" />
              </div>
              <h3 className="text-base font-extrabold text-[#0c0407]">Revenue Analysis</h3>
            </div>
            <div className="flex items-center gap-1 bg-[#f8fafc] rounded-lg p-1 border border-black/[0.06] self-start sm:self-auto">
              {["monthly", "quarterly", "yearly"].map((period) => (
                <button
                  key={period}
                  onClick={() => setRevenuePeriod(period)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    revenuePeriod === period
                      ? "bg-white text-[#0c0407] shadow-sm border border-black/[0.06]"
                      : "text-[#64748b] hover:text-[#0c0407]"
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <RevenueChart data={getRevenueData()} getLabel={getRevenueLabel} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Donut Chart - Students by Department */}
        <div className="bg-white border border-black/[0.06] rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_30px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col h-[380px]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[#6366f1]">
              <FiPieChart className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold text-[#0c0407]">Students by Department</h3>
          </div>
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <DepartmentDonutChart data={charts?.departmentStats || []} />
          </div>
        </div>

        {/* Horizontal Bar Chart - Course Popularity */}
        <div className="bg-white border border-black/[0.06] rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_30px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col h-[380px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[#10b981]">
                <FiBookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-base font-extrabold text-[#0c0407]">Course Popularity</h3>
            </div>
            <span className="text-xs font-semibold text-[#636363] bg-[#f8fafc] px-2.5 py-1 rounded-md border border-black/[0.04]">Active Students</span>
          </div>
          <div className="flex-1 min-h-0">
            <CoursePopularityChart data={charts?.courseStats || []} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart - User Role Distribution */}
        <div className="bg-white border border-black/[0.06] rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_30px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col h-[380px]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-[#8b5cf6]">
              <FiUsers className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold text-[#0c0407]">User Roles Distribution</h3>
          </div>
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <UserRolesChart data={charts?.roleStats || []} />
          </div>
        </div>

        {/* Quick Insights card */}
        <div className="bg-white border border-black/[0.06] rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_30px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col justify-between h-[380px]">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-500">
                <FiActivity className="w-4 h-4" />
              </div>
              <h3 className="text-base font-extrabold text-[#0c0407]">System Insights & Overview</h3>
            </div>
            <p className="text-sm text-[#636363] mb-6">
              Quick analytical computations based on currently active database entities.
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#f8fafc] rounded-xl border border-black/[0.03] hover:bg-slate-50 transition-colors">
                <span className="text-sm font-semibold text-[#636363]">Average Active Users per Dept</span>
                <span className="text-base font-extrabold text-[#0c0407]">
                  {stats?.totalDepartments > 0 ? (stats?.totalActiveUsers / stats?.totalDepartments).toFixed(1) : 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#f8fafc] rounded-xl border border-black/[0.03] hover:bg-slate-50 transition-colors">
                <span className="text-sm font-semibold text-[#636363]">Average Courses per Dept</span>
                <span className="text-base font-extrabold text-[#10b981]">
                  {stats?.totalDepartments > 0 ? (stats?.totalCourses / stats?.totalDepartments).toFixed(1) : 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#f8fafc] rounded-xl border border-black/[0.03] hover:bg-slate-50 transition-colors">
                <span className="text-sm font-semibold text-[#636363]">MTD Revenue flow</span>
                <span className="text-base font-extrabold text-[#f59e0b]">{formatCurrency(stats?.mtdRevenue || 0)}</span>
              </div>
            </div>
          </div>
          <div className="text-center text-xs text-[#636363] pt-4 border-t border-black/[0.04]">
            Data updated in real-time • TIMS Console v1.0
          </div>
        </div>
      </div>
    </div>
  );
};

const StatTile = ({ label, value, icon, color }) => (
  <div className="bg-white border border-black/[0.06] rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${color}12` }}
      >
        <div style={{ color }}>{icon}</div>
      </div>
    </div>
    <p className="text-xs font-bold text-[#636363] mb-1.5 uppercase tracking-wider">{label}</p>
    <p className="text-2xl font-black text-[#0c0407] tracking-tight">{value}</p>
  </div>
);

// 1. Enrollment Trend Chart (AreaChart)
const EnrollmentTrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[#636363] text-sm font-medium">
        No enrollment data available
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0c0407] text-white p-3 rounded-xl shadow-xl border border-white/10 text-xs font-semibold">
          <p className="text-white/50 mb-0.5">{label}</p>
          <p className="text-sm font-black text-[#fc362d]">
            {payload[0].value} Student{payload[0].value !== 1 ? "s" : ""}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fc362d" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#fc362d" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#fc362d"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorEnrollments)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// 2. Revenue Chart (BarChart)
const RevenueChart = ({ data, getLabel }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[#636363] text-sm font-medium">
        No revenue data available
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    formattedLabel: getLabel(d),
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0c0407] text-white p-3 rounded-xl shadow-xl border border-white/10 text-xs font-semibold">
          <p className="text-white/50 mb-0.5">{label}</p>
          <p className="text-sm font-black text-[#ff6b5b]">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 5, left: -15, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fc362d" stopOpacity={0.9} />
              <stop offset="95%" stopColor="#ff6b5b" stopOpacity={0.75} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
          <XAxis
            dataKey="formattedLabel"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `₹${formatCompactNumber(val)}`}
            tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.02)" }} />
          <Bar dataKey="revenue" fill="url(#colorRevenue)" radius={[4, 4, 0, 0]} maxBarSize={45} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// 3. Department Donut Chart
const DepartmentDonutChart = ({ data }) => {
  const total = data.reduce((sum, d) => sum + parseInt(d.count || 0), 0);

  if (!data || data.length === 0 || total === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[#636363] text-sm font-medium">
        No department distribution data available
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const pData = payload[0].payload;
      const percentage = total > 0 ? ((pData.count / total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-[#0c0407] text-white p-3 rounded-xl shadow-xl border border-white/10 text-xs font-semibold">
          <p className="font-black text-[#fc362d]">{pData.name}</p>
          <p className="text-white/60 mt-0.5">
            {pData.count} Student{pData.count !== 1 ? "s" : ""} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 px-4">
      <div className="relative w-44 h-44 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={75}
              paddingAngle={3}
              dataKey="count"
              animationDuration={600}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={1} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-[#0c0407] tracking-tight">{total}</span>
          <span className="text-[9px] font-bold text-[#64748b] uppercase tracking-wider">Students</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
        {data.map((item, index) => {
          const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
          const color = COLORS[index % COLORS.length];
          return (
            <div key={index} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors">
              <div
                className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0"
                style={{ backgroundColor: color }}
              ></div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#0c0407] truncate leading-tight">{item.name}</p>
                <p className="text-[10px] font-medium text-[#64748b] mt-0.5">
                  {item.count} Student{item.count !== 1 ? "s" : ""} • {percentage}%
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 4. Course Popularity Chart (Horizontal BarChart)
const CoursePopularityChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[#636363] text-sm font-medium">
        No active course enrollment data available
      </div>
    );
  }

  // Cap length of course names to make them look nice on Y axis
  const chartData = data.map((d) => ({
    ...d,
    shortName: d.name.length > 20 ? d.name.slice(0, 18) + "..." : d.name,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const pData = payload[0].payload;
      return (
        <div className="bg-[#0c0407] text-white p-3 rounded-xl shadow-xl border border-white/10 text-xs font-semibold">
          <p className="font-bold text-[#ff6b5b]">{pData.name}</p>
          <p className="text-white/60 mt-0.5">{pData.count} Active Student{pData.count !== 1 ? "s" : ""}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 15, left: 15, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.03)" />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
            allowDecimals={false}
          />
          <YAxis
            dataKey="shortName"
            type="category"
            width={110}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#0c0407", fontSize: 10, fontWeight: 700 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.01)" }} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={14}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// 5. User Roles Chart (Donut Chart)
const UserRolesChart = ({ data }) => {
  const total = data.reduce((sum, d) => sum + parseInt(d.count || 0), 0);

  if (!data || data.length === 0 || total === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[#636363] text-sm font-medium">
        No user role data available
      </div>
    );
  }

  // Make role names more readable
  const formattedData = data.map((d) => {
    let name = d.name;
    if (name === "ADMIN") name = "Admin";
    else if (name === "HR") name = "HR Coordinator";
    else if (name === "TRAINER") name = "Trainer";
    else if (name === "STUDENT") name = "Student";
    return { ...d, name };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const pData = payload[0].payload;
      const percentage = total > 0 ? ((pData.count / total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-[#0c0407] text-white p-3 rounded-xl shadow-xl border border-white/10 text-xs font-semibold">
          <p className="font-black text-[#fc362d]">{pData.name}</p>
          <p className="text-white/60 mt-0.5">
            {pData.count} User{pData.count !== 1 ? "s" : ""} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 px-4">
      <div className="relative w-44 h-44 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={75}
              paddingAngle={3}
              dataKey="count"
              animationDuration={600}
            >
              {formattedData.map((entry, index) => (
                // Offset colors by 2 for variety
                <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} stroke="white" strokeWidth={1} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-[#0c0407] tracking-tight">{total}</span>
          <span className="text-[9px] font-bold text-[#64748b] uppercase tracking-wider">Active Users</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2.5 w-full">
        {formattedData.map((item, index) => {
          const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
          const color = COLORS[(index + 2) % COLORS.length];
          return (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors border border-black/[0.01]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                ></div>
                <span className="text-xs font-bold text-[#0c0407] truncate">{item.name}</span>
              </div>
              <span className="text-xs font-extrabold text-[#64748b]">
                {item.count} ({percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDashboard;
