import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiBookOpen,
  FiDollarSign,
  FiSettings,
  FiShield,
  FiDatabase,
  FiTrash2,
  FiCreditCard,
} from "react-icons/fi";
import {
  WelcomeBanner,
  StatCards,
  PrimaryButton,
  SecondaryButton,
} from "../DashboardUI";
import { pageWrapClass } from "../dashboardTheme";

export const AdminDashboard = ({ user }) => {
  const navigate = useNavigate();
  return (
    <div className={pageWrapClass}>
      <WelcomeBanner
        badge="Control Panel & Audit"
        title={`Welcome back, ${user?.name || "Administrator"}!`}
        description="Monitor system health, user access, courses, and financial flows from one console."
        actions={
          <>
            <PrimaryButton onClick={() => navigate("/dashboard/students")}>Enroll Student</PrimaryButton>
            <SecondaryButton onClick={() => navigate("/dashboard/billing")}>Billing Ledger</SecondaryButton>
          </>
        }
      />

      <StatCards
        stats={[
          {
            label: "Active Users",
            value: "2,840",
            change: "+14.2% MoM",
            icon: <FiUsers className="w-5 h-5" />,
          },
          {
            label: "Courses Offered",
            value: "114",
            change: "+4 this week",
            icon: <FiBookOpen className="w-5 h-5" />,
          },
          {
            label: "DB Health",
            value: "99.98%",
            change: "Latency 8ms",
            icon: <FiDatabase className="w-5 h-5" />,
          },
          {
            label: "Revenue",
            value: "₹4.82L",
            change: "+8.3% MoM",
            icon: <FiDollarSign className="w-5 h-5" />,
          },
        ]}
      />

      {/* 3. Middle Main Widgets Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Double-Column Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Revenue Over Time Chart */}
          <div className="bg-white border border-black/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <span className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider">MSAI FINANCIALS</span>
                <h3 className="text-lg font-extrabold text-[#0c0407] tracking-tight mt-0.5">Overall Revenue Tracking</h3>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#64748b] bg-[#f8fafc] rounded-lg p-1 border border-black/[0.06]">
                <button className="px-3 py-1.5 bg-white text-[#0c0407] rounded-md shadow-sm border border-black/[0.06]">Monthly</button>
                <button className="px-3 py-1.5 hover:text-[#0c0407]">Quarterly</button>
              </div>
            </div>

            {/* Custom Interactive SVG Line Chart (Replicates high fidelity charting) */}
            <div className="h-64 relative w-full bg-slate-50/50 rounded-2xl border border-gray-50/50 p-4">
              <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                {/* Defs for gradients */}
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#334155" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#334155" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="adminChartSecondary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.04" />
                    <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
                <line x1="0" y1="90" x2="500" y2="90" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
                <line x1="0" y1="140" x2="500" y2="140" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />

                {/* Shaded Area Under Primary Line */}
                <path
                  d="M 10 140 Q 90 40 170 110 T 330 60 T 490 80 L 490 180 L 10 180 Z"
                  fill="url(#chartGradient)"
                />
                {/* Shaded Area Under Secondary Line */}
                <path
                  d="M 10 170 Q 90 90 170 140 T 330 90 T 490 110 L 490 180 L 10 180 Z"
                  fill="url(#adminChartSecondary)"
                />

                {/* Target estimate — muted */}
                <path
                  d="M 10 170 Q 90 90 170 140 T 330 90 T 490 110"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray="4 4"
                />

                {/* Collected income — charcoal */}
                <path
                  d="M 10 140 Q 90 40 170 110 T 330 60 T 490 80"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                <circle cx="170" cy="110" r="3.5" fill="#334155" stroke="white" strokeWidth="1.5" />
                <circle cx="330" cy="60" r="3.5" fill="#334155" stroke="white" strokeWidth="1.5" />

                {/* X Axis Labels */}
                <text x="10" y="195" fill="#9ca3af" fontSize="10" fontWeight="bold">Sep</text>
                <text x="90" y="195" fill="#9ca3af" fontSize="10" fontWeight="bold">Oct</text>
                <text x="170" y="195" fill="#9ca3af" fontSize="10" fontWeight="bold">Nov</text>
                <text x="250" y="195" fill="#9ca3af" fontSize="10" fontWeight="bold">Dec</text>
                <text x="330" y="195" fill="#9ca3af" fontSize="10" fontWeight="bold">Jan</text>
                <text x="410" y="195" fill="#9ca3af" fontSize="10" fontWeight="bold">Feb</text>
                <text x="470" y="195" fill="#9ca3af" fontSize="10" fontWeight="bold">Mar</text>
              </svg>
            </div>

            <div className="flex gap-6 mt-4 pt-4 border-t border-slate-50 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-4 h-0.5 rounded-full bg-[#334155]"></span>
                <span className="text-[#64748b]">Collected Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-0 border-t border-dashed border-[#94a3b8]"></span>
                <span className="text-gray-500">Target Estimate</span>
              </div>
            </div>
          </div>

          {/* Quick Tasks Grid & Security Monitor Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Quick Actions Panel */}
            <div className="bg-white border border-black/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <h3 className="text-base font-extrabold text-[#0c0407] border-b border-black/[0.08] pb-3.5 mb-3.5">
                System Commands
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    label: "Enroll New Student",
                    desc: "Register student & configure payment blueprints",
                    icon: <FiUsers className="w-4 h-4 text-[#fc362d]" />,
                    onClick: () => navigate("/dashboard/students"),
                  },
                  {
                    label: "Configure Server Ports",
                    desc: "Change active gateway port settings",
                    icon: <FiSettings className="w-4 h-4 text-[#475569]" />,
                  },
                  {
                    label: "Manage User Permissions",
                    desc: "Override and assign granular RBAC keys",
                    icon: <FiShield className="w-4 h-4 text-[#05CD99]" />,
                  },
                  {
                    label: "Full Database Backup",
                    desc: "Capture safe structural dump file",
                    icon: <FiDatabase className="w-4 h-4 text-teal-600" />,
                  },
                  {
                    label: "Flush OTP Cache",
                    desc: "Clear verifying registers in Redis",
                    icon: <FiTrash2 className="w-4 h-4 text-red-500" />,
                  },
                ].map((act, i) => (
                  <button
                    key={i}
                    onClick={act.onClick || (() => alert(`Simulated command: ${act.label}`))}
                    className="flex items-start text-left p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-black/[0.08] transition-all cursor-pointer group w-full"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#fafafa] flex items-center justify-center mr-3 mt-0.5 group-hover:scale-105 transition-transform flex-shrink-0">
                      {act.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-[#0c0407] group-hover:text-[#0c0407] transition-colors">
                        {act.label}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{act.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Audit Security Logs */}
            <div className="bg-white border border-black/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <div className="flex justify-between items-center border-b border-black/[0.08] pb-3.5 mb-3.5">
                <h3 className="text-base font-extrabold text-[#0c0407]">Security Stream</h3>
                <span className="inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#E6FAF5] text-[#05CD99] animate-pulse">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 mr-1"></span>
                  Active Monitor
                </span>
              </div>

              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {[
                  { user: "super_admin", action: "Synced Postgres database constraints", time: "2m ago", lvl: "info" },
                  { user: "trainer_pete", action: "Uploaded material syllabus.pdf", time: "24m ago", lvl: "info" },
                  { user: "system_cron", action: "Expired 14 verifying OTP records", time: "1h ago", lvl: "ok" },
                  { user: "unknown_api", action: "Suspicious POST payload on /login", time: "2h ago", lvl: "warn" },
                ].map((log, i) => (
                  <div key={i} className="flex justify-between items-start text-xs p-3 rounded-2xl bg-[#fafafa]/50 border border-gray-50">
                    <div className="flex gap-2.5">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                        log.lvl === "warn" ? "bg-amber-500" : log.lvl === "ok" ? "bg-emerald-500" : "bg-sky-500"
                      }`}></span>
                      <div>
                        <p className="text-gray-600 leading-relaxed font-semibold">
                          <span className="text-[#475569] font-extrabold">@{log.user}</span>: {log.action}
                        </p>
                        <span className="text-[10px] text-gray-400 font-bold mt-0.5 block">{log.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Right Single-Column Panel */}
        <div className="space-y-6">
          
          {/* Replicating "Your Card" credit card widget */}
          <div className="bg-white border border-black/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <h3 className="text-base font-extrabold text-[#0c0407] mb-4">Billing Node</h3>
            
            {/* The Gradient Glassy Card */}
            <div className="relative overflow-hidden aspect-[1.6/1] w-full rounded-2xl bg-gradient-to-br from-[#1a1a1f] via-[#141418] to-[#0c0407] p-5 text-white shadow-[0_8px_28px_rgba(0,0,0,0.25)]">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-lg"></div>
              
              <div className="h-full flex flex-col justify-between relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">MSAI Admin Gateway</p>
                    <h4 className="text-sm font-extrabold tracking-tight mt-0.5">TIMS Central</h4>
                  </div>
                  <FiCreditCard className="w-5 h-5 text-white/90" />
                </div>
                
                <div>
                  <p className="text-xs font-bold tracking-widest font-mono">7812 •••• •••• 9840</p>
                  <div className="flex justify-between items-end mt-4">
                    <div>
                      <p className="text-[8px] font-bold text-white/50 uppercase">Balance Limit</p>
                      <p className="text-sm font-extrabold tracking-tight">₹4,82,940</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-white/50 uppercase">CVV Code</p>
                      <p className="text-xs font-bold font-mono">09X</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Below Card */}
            <div className="grid grid-cols-4 gap-2 mt-4 text-center">
              {[
                { label: "Withdraw", icon: "⇥" },
                { label: "Deposit", icon: "⇤" },
                { label: "Sync API", icon: "⚡" },
                { label: "Ledger", icon: "▤" },
              ].map((b, i) => (
                <button key={i} className="p-2 rounded-xl bg-slate-50 border border-black/[0.08] hover:bg-slate-100 transition-all text-xs font-extrabold text-[#0c0407] cursor-pointer">
                  <div className="text-sm font-bold mb-0.5 text-[#475569]">{b.icon}</div>
                  <div className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">{b.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Transactions Ledger */}
          <div className="bg-white border border-black/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <h3 className="text-base font-extrabold text-[#0c0407] mb-4">Financial Ledger</h3>
            <div className="space-y-3">
              {[
                { item: "PG Fee UPI - STU-001", time: "22 May 2026", amt: "+₹14,500", positive: true },
                { item: "AWS Object Store Storage", time: "18 May 2026", amt: "-₹8,490", positive: false },
                { item: "PG Fee Bank - STU-024", time: "15 May 2026", amt: "+₹24,000", positive: true },
                { item: "Redis Cluster Cache API", time: "12 May 2026", amt: "-₹2,300", positive: false },
                { item: "PG Fee UPI - STU-112", time: "09 May 2026", amt: "+₹14,500", positive: true },
              ].map((tx, i) => (
                <div key={i} className="flex justify-between items-center text-xs p-2.5 rounded-2xl bg-slate-50/50 hover:bg-slate-50 border border-gray-50/80 transition-all">
                  <div>
                    <h4 className="font-extrabold text-[#0c0407] truncate max-w-[150px]">{tx.item}</h4>
                    <span className="text-[9px] text-[#9ca3af] font-bold block mt-0.5">{tx.time}</span>
                  </div>
                  <span className={`font-extrabold text-sm ${tx.positive ? "text-[#05CD99]" : "text-[#0c0407]"}`}>
                    {tx.amt}
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2.5 text-center text-xs font-extrabold text-[#475569] bg-[#475569]/5 hover:bg-[#f1f5f9]/10 rounded-2xl transition-all cursor-pointer">
              Download Bank Statements
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
export default AdminDashboard;
