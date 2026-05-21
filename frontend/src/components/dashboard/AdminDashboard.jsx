import React from "react";

export const AdminDashboard = ({ user }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Panel */}
      <div className="relative overflow-hidden rounded-3xl backdrop-blur-3xl bg-white/5 border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-widest">
              Control Panel
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2">
              Welcome Back, {user?.name || "Administrator"}!
            </h1>
            <p className="text-gray-400 mt-1">
              Here is the current state of MSAI INDIA's training management infrastructure.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-lg hover:shadow-indigo-500/20 cursor-pointer">
              System Settings
            </button>
            <button className="px-4 py-2 text-sm font-semibold rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer">
              Activity Report
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Users Active", value: "2,840", change: "+14.2%", color: "indigo" },
          { label: "Courses Offered", value: "114", change: "+4 this week", color: "purple" },
          { label: "Database Health", value: "99.98%", change: "Excellent", color: "emerald" },
          { label: "Monthly Revenue", value: "₹4.8L", change: "+8.3% MoM", color: "cyan" },
        ].map((stat, i) => (
          <div
            key={i}
            className="group rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6 shadow-xl hover:bg-white/8 hover:border-white/15 transition-all duration-300 hover:-translate-y-1"
          >
            <p className="text-sm font-medium text-gray-400">{stat.label}</p>
            <div className="flex items-baseline justify-between mt-4">
              <h2 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h2>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  stat.color === "emerald"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : stat.color === "purple"
                    ? "bg-purple-500/10 text-purple-400"
                    : stat.color === "cyan"
                    ? "bg-cyan-500/10 text-cyan-400"
                    : "bg-indigo-500/10 text-indigo-400"
                }`}
              >
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Control Widgets & Realtime Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions Panel */}
        <div className="lg:col-span-1 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6 shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-white/10 pb-3">
            Administrative Tasks
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {[
              { label: "Configure Server Ports", desc: "Change system ports and load balancers", icon: "⚙️" },
              { label: "Manage User Permissions", desc: "Override custom role assignments", icon: "👥" },
              { label: "Perform Database Backup", desc: "Instant sync checkpoint to cloud storage", icon: "💾" },
              { label: "Flush OTP Cache Table", desc: "Force expire all verification codes", icon: "🧹" },
            ].map((action, i) => (
              <button
                key={i}
                className="flex items-start text-left p-3 rounded-xl bg-white/0 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer group"
              >
                <span className="text-2xl mr-3 group-hover:scale-110 transition-transform">{action.icon}</span>
                <div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
                    {action.label}
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">{action.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Audit Logs and System Health */}
        <div className="lg:col-span-2 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6 shadow-xl space-y-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <h3 className="text-lg font-bold text-white">System Security Log</h3>
            <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span>
              Live Monitoring
            </span>
          </div>

          <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
            {[
              { user: "super_admin", action: "Completed full DB schema synchronization", time: "2 mins ago", level: "info" },
              { user: "trainer_pete", action: "Uploaded curriculum syllabus.pdf", time: "24 mins ago", level: "info" },
              { user: "system_cron", action: "Cleared 14 expired OTP table entries", time: "1 hour ago", level: "success" },
              { user: "unknown_client", action: "Failed login attempt (IP: 192.168.1.104)", time: "2 hours ago", level: "warning" },
              { user: "system_cron", action: "Daily Postgres dump created successfully", time: "5 hours ago", level: "success" },
            ].map((log, i) => (
              <div key={i} className="flex justify-between items-center text-sm p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      log.level === "warning"
                        ? "bg-amber-400"
                        : log.level === "success"
                        ? "bg-emerald-400"
                        : "bg-indigo-400"
                    }`}
                  ></span>
                  <div>
                    <p className="text-white font-medium">
                      <span className="text-indigo-300 font-semibold font-mono">@{log.user}</span>: {log.action}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{log.time}</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-gray-400">{log.level.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
