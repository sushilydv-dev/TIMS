import { useState, useEffect } from "react";
import axios from "axios";
import {
  FiUsers, FiBook, FiLayers, FiDollarSign, FiClock,
  FiTrendingUp, FiCheckCircle, FiXCircle, FiBarChart2,
  FiDownload, FiCalendar, FiFilter,
} from "react-icons/fi";
import { Panel, PanelHeader, Toast } from "../DashboardUI";
import { primaryBtnClass, secondaryBtnClass, inputClass, labelMutedClass } from "../dashboardTheme";

export function AnalyticsDashboard() {
  const [stats, setStats] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [feeData, setFeeData] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [reportType, setReportType] = useState("attendance");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState(null);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 3500); };

  const fetchDashboardStats = async () => {
    try {
      const { data } = await axios.get("/api/admin/analytics/dashboard");
      setStats(data.data);
    } catch (err) {
      showToast("Failed to load dashboard stats");
    }
  };

  const fetchAttendanceData = async () => {
    try {
      const { data } = await axios.get("/api/admin/analytics/attendance");
      setAttendanceData(data.data);
    } catch (err) {
      showToast("Failed to load attendance data");
    }
  };

  const fetchFeeData = async () => {
    try {
      const { data } = await axios.get("/api/admin/analytics/fees");
      setFeeData(data.data);
    } catch (err) {
      showToast("Failed to load fee data");
    }
  };

  const fetchCourseData = async () => {
    try {
      const { data } = await axios.get("/api/admin/analytics/courses");
      setCourseData(data.data);
    } catch (err) {
      showToast("Failed to load course data");
    }
  };

  const fetchReport = async () => {
    try {
      const params = { report_type: reportType };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const { data } = await axios.get("/api/admin/analytics/reports", { params });
      setReportData(data.data);
    } catch (err) {
      showToast("Failed to load report");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDashboardStats(),
        fetchAttendanceData(),
        fetchFeeData(),
        fetchCourseData(),
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === "reports") {
      fetchReport();
    }
  }, [activeTab, reportType, startDate, endDate]);

  const StatCard = ({ icon: Icon, label, value, trend, color }) => (
    <div className="bg-white border border-black/[0.07] rounded-2xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-xl bg-[#fc362d]/10 flex items-center justify-center">
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold ${trend > 0 ? "text-green-600" : "text-red-600"}`}>
            <FiTrendingUp className="w-3.5 h-3.5" />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-extrabold text-[#0c0407]">{value}</p>
        <p className="text-xs text-[#94a3b8] mt-1">{label}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="text-center py-12 text-sm text-[#94a3b8]">Loading analytics...</div>
    );
  }

  return (
    <>
      <Toast message={toast} />
      <Panel>
        <PanelHeader
          eyebrow="Analytics"
          title="Reports & Insights"
          action={
            <button
              onClick={() => {
                const dataStr = JSON.stringify({ stats, attendanceData, feeData, courseData }, null, 2);
                const blob = new Blob([dataStr], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "analytics-report.json";
                a.click();
              }}
              className={`${secondaryBtnClass} text-xs flex items-center gap-1.5`}
            >
              <FiDownload className="w-3.5 h-3.5" /> Export
            </button>
          }
        />

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-black/[0.07]">
          {["overview", "attendance", "fees", "courses", "reports"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-bold capitalize transition-colors ${
                activeTab === tab
                  ? "text-[#fc362d] border-b-2 border-[#fc362d]"
                  : "text-[#94a3b8] hover:text-[#0c0407]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={FiUsers} label="Total Students" value={stats.total_students} color="text-[#fc362d]" />
              <StatCard icon={FiLayers} label="Active Batches" value={stats.active_batches} color="text-blue-600" />
              <StatCard icon={FiBook} label="Total Courses" value={stats.total_courses} color="text-green-600" />
              <StatCard icon={FiDollarSign} label="Total Revenue" value={`₹${(stats.total_revenue || 0).toLocaleString()}`} color="text-purple-600" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard icon={FiClock} label="Pending Fees" value={stats.pending_fees} color="text-orange-600" />
              <StatCard icon={FiTrendingUp} label="Recent Enrollments" value={stats.recent_enrollments} color="text-teal-600" />
              <StatCard icon={FiUsers} label="Total Trainers" value={stats.total_trainers} color="text-indigo-600" />
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === "attendance" && attendanceData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <StatCard icon={FiUsers} label="Total Records" value={attendanceData.total} color="text-[#fc362d]" />
              <StatCard icon={FiCheckCircle} label="Present" value={attendanceData.present} color="text-green-600" />
              <StatCard icon={FiXCircle} label="Absent" value={attendanceData.absent} color="text-red-600" />
              <StatCard icon={FiClock} label="Late" value={attendanceData.late} color="text-orange-600" />
            </div>

            <div className="bg-white border border-black/[0.07] rounded-2xl p-6">
              <h3 className="text-sm font-bold text-[#0c0407] mb-4">Attendance Rate</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-4 bg-black/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#fc362d] transition-all duration-500"
                    style={{ width: `${attendanceData.attendance_rate}%` }}
                  />
                </div>
                <span className="text-lg font-extrabold text-[#0c0407]">{attendanceData.attendance_rate}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Fees Tab */}
        {activeTab === "fees" && feeData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard icon={FiDollarSign} label="Total Collected" value={`₹${(feeData.total_collected || 0).toLocaleString()}`} color="text-green-600" />
              <StatCard icon={FiCheckCircle} label="Completed Payments" value={feeData.completed_payments} color="text-blue-600" />
              <StatCard icon={FiClock} label="Pending Payments" value={feeData.pending_payments} color="text-orange-600" />
            </div>

            {feeData.monthly_trend && feeData.monthly_trend.length > 0 && (
              <div className="bg-white border border-black/[0.07] rounded-2xl p-6">
                <h3 className="text-sm font-bold text-[#0c0407] mb-4">Monthly Revenue Trend</h3>
                <div className="space-y-3">
                  {feeData.monthly_trend.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-xs text-[#636363]">
                        {new Date(item.month).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </span>
                      <span className="text-sm font-bold text-[#0c0407]">₹{(item.amount || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === "courses" && courseData && (
          <div className="space-y-4">
            {courseData.map((course) => (
              <div key={course.course_id} className="bg-white border border-black/[0.07] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-[#0c0407]">{course.course_name}</h3>
                  <span className="text-[10px] font-bold text-[#94a3b8] bg-black/5 px-2 py-1 rounded-full">
                    {course.total_batches} batches
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-[#94a3b8]">Total Enrollments</p>
                    <p className="text-lg font-extrabold text-[#0c0407]">{course.total_enrollments}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94a3b8]">Active Students</p>
                    <p className="text-lg font-extrabold text-green-600">{course.active_students}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94a3b8]">Completion Rate</p>
                    <p className="text-lg font-extrabold text-[#fc362d]">
                      {course.total_enrollments > 0
                        ? ((course.active_students / course.total_enrollments) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className={labelMutedClass}>Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className={inputClass}
                >
                  <option value="attendance">Attendance Report</option>
                  <option value="fees">Fee Collection Report</option>
                  <option value="projects">Project Submissions Report</option>
                  <option value="assessments">Assessment Results Report</option>
                </select>
              </div>
              <div>
                <label className={labelMutedClass}>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelMutedClass}>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <button onClick={fetchReport} className={primaryBtnClass}>
                <FiFilter className="w-3.5 h-3.5" /> Generate Report
              </button>
            </div>

            {reportData && reportData.length > 0 ? (
              <div className="bg-white border border-black/[0.07] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-[#fafafa] border-b border-black/[0.07]">
                      <tr>
                        {Object.keys(reportData[0]).map((key) => (
                          <th key={key} className="px-4 py-3 text-left font-bold text-[#0c0407] capitalize">
                            {key.replace(/_/g, " ")}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((row, idx) => (
                        <tr key={idx} className="border-b border-black/[0.04] hover:bg-[#fafafa]">
                          {Object.values(row).map((val, vidx) => (
                            <td key={vidx} className="px-4 py-3 text-[#3a3b50]">
                              {val !== null && val !== undefined ? String(val) : "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-sm text-[#94a3b8] border border-dashed border-black/[0.1] rounded-2xl">
                No report data available. Select filters and generate a report.
              </div>
            )}
          </div>
        )}
      </Panel>
    </>
  );
}

export default AnalyticsDashboard;
