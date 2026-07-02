import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FiActivity, FiDatabase, FiServer, FiCpu, FiRefreshCw, FiHardDrive, FiZap } from "react-icons/fi";
import { WelcomeBanner, Panel, PanelHeader } from "../DashboardUI";
import { pageWrapClass, primaryBtnClass } from "../dashboardTheme";
import { INSTITUTE_NAME } from "../../../constants";

const SERVICE_ICONS = {
  PostgreSQL:      <FiDatabase className="w-5 h-5" />,
  "Node Process":  <FiZap      className="w-5 h-5" />,
  "CPU Load":      <FiCpu      className="w-5 h-5" />,
  "System Memory": <FiHardDrive className="w-5 h-5" />,
  "API Server":    <FiServer   className="w-5 h-5" />,
};

const STATUS_STYLES = {
  ok:    { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Operational" },
  warn:  { dot: "bg-amber-500",   badge: "bg-amber-50  text-amber-700  border-amber-200",   label: "Degraded"    },
  error: { dot: "bg-red-500",     badge: "bg-red-50    text-red-700    border-red-200",     label: "Error"       },
};

const OVERALL_BANNER = {
  ok:    { bg: "from-emerald-50 to-green-100",  border: "border-emerald-200", text: "text-emerald-700", label: "All systems operational" },
  warn:  { bg: "from-amber-50  to-yellow-100",  border: "border-amber-200",  text: "text-amber-700",  label: "Some systems degraded"   },
  error: { bg: "from-red-50    to-red-100",     border: "border-red-200",    text: "text-red-700",    label: "System issues detected"  },
};

export const SystemHealth = () => {
  const [health, setHealth]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastFetched, setLastFetched] = useState(null);
  const [error, setError]       = useState(null);

  const fetchHealth = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const { data } = await axios.get("/api/admin/system-health");
      setHealth(data);
      setLastFetched(new Date());
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load health data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load + auto-refresh every 30 seconds
  useEffect(() => {
    fetchHealth();
    const interval = setInterval(() => fetchHealth(true), 30_000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  const formatUptime = (seconds) => {
    if (!seconds) return "—";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${seconds % 60}s`;
  };

  if (loading) {
    return (
      <div className={pageWrapClass}>
        <div className="flex items-center justify-center py-24">
          <div className="text-center space-y-3">
            <FiRefreshCw className="w-8 h-8 text-[#fc362d] animate-spin mx-auto" />
            <p className="text-sm text-[#94a3b8] font-semibold">Checking services…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={pageWrapClass}>
        <div className="flex items-center justify-center py-24">
          <div className="text-center space-y-4">
            <p className="text-sm text-red-500 font-semibold">{error}</p>
            <button onClick={() => fetchHealth()} className={primaryBtnClass}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const overall  = health?.overall || "ok";
  const banner   = OVERALL_BANNER[overall];

  return (
    <div className={pageWrapClass}>
      <WelcomeBanner
        badge="System Health"
        title="Infrastructure monitor"
        description={`Live status of services powering ${INSTITUTE_NAME}.`}
      />

      {/* Overall status banner */}
      <div className={`rounded-2xl border px-6 py-4 bg-gradient-to-r ${banner.bg} ${banner.border} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full ${STATUS_STYLES[overall].dot}`} />
          <span className={`text-sm font-bold ${banner.text}`}>{banner.label}</span>
        </div>
        <div className="flex items-center gap-3">
          {lastFetched && (
            <span className="text-xs text-[#94a3b8]">
              Updated {lastFetched.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => fetchHealth(true)}
            disabled={refreshing}
            className="p-2 rounded-lg hover:bg-black/[0.04] transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <FiRefreshCw className={`w-4 h-4 text-[#64748b] ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-black/[0.07] rounded-2xl p-5">
          <p className="text-xs text-[#94a3b8] font-semibold mb-1">Services Checked</p>
          <p className="text-2xl font-extrabold text-[#0c0407]">{health?.checks?.length ?? 0}</p>
        </div>
        <div className="bg-white border border-black/[0.07] rounded-2xl p-5">
          <p className="text-xs text-[#94a3b8] font-semibold mb-1">Healthy</p>
          <p className="text-2xl font-extrabold text-emerald-600">
            {health?.checks?.filter(c => c.status === "ok").length ?? 0}
          </p>
        </div>
        <div className="bg-white border border-black/[0.07] rounded-2xl p-5">
          <p className="text-xs text-[#94a3b8] font-semibold mb-1">Degraded</p>
          <p className="text-2xl font-extrabold text-amber-500">
            {health?.checks?.filter(c => c.status === "warn").length ?? 0}
          </p>
        </div>
        <div className="bg-white border border-black/[0.07] rounded-2xl p-5">
          <p className="text-xs text-[#94a3b8] font-semibold mb-1">Server Uptime</p>
          <p className="text-2xl font-extrabold text-[#0c0407]">
            {formatUptime(health?.process_uptime_seconds)}
          </p>
        </div>
      </div>

      {/* Per-service rows */}
      <Panel>
        <PanelHeader eyebrow="Services" title="Component status" />
        <div className="space-y-3">
          {(health?.checks || []).map((svc) => {
            const style = STATUS_STYLES[svc.status] || STATUS_STYLES.ok;
            return (
              <div
                key={svc.name}
                className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#fafafa] border border-black/[0.06]"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${style.dot}`} />
                  <span className="text-[#94a3b8]">
                    {SERVICE_ICONS[svc.name] ?? <FiActivity className="w-5 h-5" />}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#0c0407]">{svc.name}</p>
                    <p className="text-xs text-[#94a3b8]">{svc.detail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold text-[#64748b]">
                  {svc.latency_ms != null && (
                    <span>{svc.latency_ms} ms</span>
                  )}
                  <span className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-bold ${style.badge}`}>
                    {style.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* Raw checked_at timestamp */}
      {health?.checked_at && (
        <p className="text-xs text-[#94a3b8] text-right">
          Last server check: {new Date(health.checked_at).toLocaleString()}
        </p>
      )}
    </div>
  );
};

export default SystemHealth;
