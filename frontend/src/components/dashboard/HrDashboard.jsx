import React from "react";

export const HrDashboard = ({ user }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Panel */}
      <div className="relative overflow-hidden rounded-3xl backdrop-blur-3xl bg-white/5 border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-widest">
              Talent Coordinator Dashboard
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2">
              Welcome Back, {user?.name || "HR Manager"}!
            </h1>
            <p className="text-gray-400 mt-1">
              Organize student placements, coordinate recruitment pipelines, and manage human resource tickets.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-lg hover:shadow-emerald-500/20 cursor-pointer">
              Add New Candidate
            </button>
            <button className="px-4 py-2 text-sm font-semibold rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer">
              Interview Pipeline
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Active Job Listings", value: "14 Roles", change: "+2 New Today", color: "emerald" },
          { label: "Onboarded Employees", value: "112", change: "TIMS Corporate", color: "indigo" },
          { label: "Placement Success Rate", value: "94.6%", change: "Target Met", color: "cyan" },
          { label: "Pending Interviews", value: "8 Scheduled", change: "This Week", color: "amber" },
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
                    : stat.color === "amber"
                    ? "bg-amber-500/10 text-amber-400"
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

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Candidate / Job Openings Tracking */}
        <div className="lg:col-span-2 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6 shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-white/10 pb-3">
            Placement Candidates (MSAI Batch A)
          </h3>

          <div className="space-y-4">
            {[
              { name: "Rohit Sharma", role: "React JS Developer Intern", company: "Zeta Networks", status: "Interviewing" },
              { name: "Aishwarya Rai", role: "DevOps Engineer Lead", company: "TCS Cloud Group", status: "Offered" },
              { name: "Vikram Malhotra", role: "PostgreSQL Database Admin", company: "CyberShield Corp", status: "Shortlisted" },
            ].map((cand, i) => (
              <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <h4 className="font-semibold text-white">{cand.name}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Role: <span className="text-emerald-300">{cand.role}</span> • Company: <span className="text-gray-300 font-medium">{cand.company}</span>
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    cand.status === "Offered"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : cand.status === "Interviewing"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  }`}
                >
                  {cand.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* HR Operations Card */}
        <div className="lg:col-span-1 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6 shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-white/10 pb-3">
            Onboarding Actions
          </h3>

          <div className="space-y-3">
            {[
              { action: "Verify Student Certificates", badge: "2 Pending", type: "verify" },
              { action: "Update Placement Policy document", badge: "v2.1 Draft", type: "draft" },
              { action: "Leave Approval Board", badge: "0 Requests", type: "clean" },
            ].map((act, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-sm text-gray-300">{act.action}</span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    act.type === "verify"
                      ? "bg-amber-500/10 text-amber-400"
                      : act.type === "draft"
                      ? "bg-cyan-500/10 text-cyan-400"
                      : "bg-white/10 text-gray-400"
                  }`}
                >
                  {act.badge}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-4">
            <button className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer text-sm">
              Schedule Recruiter Call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
