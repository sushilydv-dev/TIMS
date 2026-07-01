import { useState, useEffect } from "react";
import axios from "axios";
import {
  FiTrendingUp, FiAward, FiCheckCircle, FiClock,
  FiBook, FiTarget, FiBarChart2, FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";
import { WelcomeBanner, StatCards, Panel, Toast } from "../DashboardUI";
import {
  pageWrapClass, cardClass, labelMutedClass,
  primaryBtnClass, secondaryBtnClass,
} from "../dashboardTheme";

export default function PerformanceScorecard() {
  const [performance, setPerformance] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 3500); };

  const fetchPerformance = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get("/api/students/me/performance");
      setPerformance(data.performance);
      setCourse(data.course);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load performance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  const getScoreColor = (score) => {
    if (score >= 9) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 8) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 7) return "text-cyan-600 bg-cyan-50 border-cyan-200";
    if (score >= 6) return "text-amber-600 bg-amber-50 border-amber-200";
    if (score >= 5) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const ProgressBar = ({ value, max, label, color = "#fc362d" }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-[#636363]">{label}</span>
          <span className="text-xs font-bold text-[#0c0407]">{value}/{max}</span>
        </div>
        <div className="h-2 bg-black/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%`, backgroundColor: color }}
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={pageWrapClass}>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-[#fc362d]/20 border-t-[#fc362d] rounded-full animate-spin" />
          <p className="text-sm font-semibold text-[#94a3b8]">Loading performance data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={pageWrapClass}>
        <Panel>
          <div className="flex flex-col items-center py-16 gap-3 text-center">
            <FiAlertCircle className="w-10 h-10 text-[#fc362d]" />
            <p className="text-sm font-semibold text-[#636363]">{error}</p>
            <button onClick={fetchPerformance} className={primaryBtnClass}>Retry</button>
          </div>
        </Panel>
      </div>
    );
  }

  if (!performance) {
    return (
      <div className={pageWrapClass}>
        <Panel>
          <div className="flex flex-col items-center py-16 gap-3 text-center">
            <FiAward className="w-10 h-10 text-[#94a3b8]" />
            <p className="text-sm font-bold text-[#0c0407]">No performance data available</p>
            <p className="text-xs text-[#94a3b8] font-medium max-w-xs">
              You need to be enrolled in a course to view your performance.
            </p>
          </div>
        </Panel>
      </div>
    );
  }

  const scoreColor = getScoreColor(performance.overall_score);

  return (
    <div className={pageWrapClass}>
      <Toast message={toast} />

      <WelcomeBanner
        badge="Performance"
        title="My Scorecard"
        description="Track your overall assessment scores and academic progress."
        actions={
          <button onClick={fetchPerformance} className={`${secondaryBtnClass} flex items-center gap-1.5`}>
            <FiRefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        }
      />

      {/* Overall Score Card */}
      <div className={`${cardClass} mb-6 overflow-hidden`}>
        <div className="bg-gradient-to-r from-[#fc362d] via-[#f43f5e] to-[#e02d25] p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white/80 uppercase tracking-wider mb-2">Overall Score</p>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-extrabold">{performance.overall_score}</span>
                <span className="text-2xl font-bold text-white/80">/10</span>
              </div>
              {course && (
                <p className="text-xs font-semibold text-white/70 mt-2">{course.title}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <StatCards stats={[
        {
          label: "Assessment Score",
          value: `${performance.assessments.avg_score}/10`,
          change: `${performance.assessments.graded}/${performance.assessments.total} graded`,
          icon: <FiTarget className="w-5 h-5" />,
        },
      ]} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Performance Breakdown */}
        <Panel>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#fc362d]/10 flex items-center justify-center">
              <FiBarChart2 className="w-5 h-5 text-[#fc362d]" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#0c0407]">Assessment Breakdown</h3>
              <p className={`${labelMutedClass}`}>Your academic performance</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-[#636363]">Overall Assessment Score</span>
                <span className="text-xs font-bold text-[#0c0407]">{performance.assessments.avg_score}/10</span>
              </div>
              <ProgressBar
                value={performance.assessments.avg_score}
                max={10}
                label=""
                color={performance.assessments.avg_score >= 8 ? "#059669" : performance.assessments.avg_score >= 6 ? "#d97706" : "#b91c1c"}
              />
            </div>
          </div>
        </Panel>

        {/* Detailed Stats */}
        <Panel>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#fc362d]/10 flex items-center justify-center">
              <FiTrendingUp className="w-5 h-5 text-[#fc362d]" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#0c0407]">Detailed Statistics</h3>
              <p className={`${labelMutedClass}`}>Your assessment progress</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Assessment Details */}
            <div className="bg-[#fafafa] rounded-xl p-4 border border-black/[0.05]">
              <div className="flex items-center gap-2 mb-3">
                <FiBook className="w-4 h-4 text-[#fc362d]" />
                <span className="text-xs font-bold text-[#0c0407]">Assessments</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[10px] text-[#94a3b8] uppercase">Total</p>
                  <p className="text-lg font-extrabold text-[#0c0407]">{performance.assessments.total}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#94a3b8] uppercase">Graded</p>
                  <p className="text-lg font-extrabold text-emerald-600">{performance.assessments.graded}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#94a3b8] uppercase">Avg Score</p>
                  <p className="text-lg font-extrabold text-[#fc362d]">{performance.assessments.avg_score}</p>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
