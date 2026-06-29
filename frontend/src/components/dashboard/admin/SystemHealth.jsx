import React from "react";
import { FiActivity, FiDatabase, FiServer, FiCpu } from "react-icons/fi";
import { WelcomeBanner, StatCards, Panel, PanelHeader, StatusBadge } from "../DashboardUI";
import { pageWrapClass } from "../dashboardTheme";
import { INSTITUTE_NAME } from "../../../constants";

const SERVICES = [
  { name: "PostgreSQL", status: "ok", latency: "8ms", uptime: "99.98%" },
  { name: "Redis Cache", status: "ok", latency: "2ms", uptime: "99.99%" },
  { name: "API Gateway", status: "ok", latency: "45ms", uptime: "99.95%" },
  { name: "Email (SMTP)", status: "warn", latency: "320ms", uptime: "98.10%" },
  { name: "Object Storage", status: "ok", latency: "120ms", uptime: "99.90%" },
];

export const SystemHealth = () => {
  return (
    <div className={pageWrapClass}>
      <WelcomeBanner
        badge="System Health"
        title="Infrastructure monitor"
        description={`Live status of databases, caches, and external services powering ${INSTITUTE_NAME}.`}
      />

      <StatCards
        stats={[
          { label: "Overall Uptime", value: "99.98%", change: "Last 30 days", icon: <FiActivity className="w-5 h-5" /> },
          { label: "Avg Latency", value: "42ms", change: "-3ms vs yesterday", icon: <FiCpu className="w-5 h-5" /> },
          { label: "DB Connections", value: "24/100", change: "Healthy pool", icon: <FiDatabase className="w-5 h-5" /> },
          { label: "API Errors", value: "0.02%", change: "Within SLA", icon: <FiServer className="w-5 h-5" /> },
        ]}
      />

      <Panel>
        <PanelHeader eyebrow="Services" title="Component status" />
        <div className="space-y-3">
          {SERVICES.map((svc) => (
            <div
              key={svc.name}
              className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#fafafa] border border-black/[0.06]"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-2 h-2 rounded-full ${
                    svc.status === "ok" ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                <span className="text-sm font-bold text-[#0c0407]">{svc.name}</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold text-[#64748b]">
                <span>Latency {svc.latency}</span>
                <span>Uptime {svc.uptime}</span>
                <StatusBadge variant={svc.status === "ok" ? "ok" : "warn"}>
                  {svc.status === "ok" ? "Operational" : "Degraded"}
                </StatusBadge>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelHeader eyebrow="Recent" title="Incident log" />
        <div className="space-y-2 text-xs font-semibold text-[#64748b]">
          <p>
            <span className="text-[#0c0407] font-bold">12 May</span> — Scheduled Postgres maintenance completed (0 downtime).
          </p>
          <p>
            <span className="text-[#0c0407] font-bold">08 May</span> — SMTP provider latency spike; auto-failover engaged.
          </p>
        </div>
      </Panel>
    </div>
  );
};

export default SystemHealth;
