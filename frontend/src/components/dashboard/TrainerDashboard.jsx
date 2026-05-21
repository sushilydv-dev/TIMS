import React from "react";

export const TrainerDashboard = ({ user }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Panel */}
      <div className="relative overflow-hidden rounded-3xl backdrop-blur-3xl bg-white/5 border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-widest">
              Instructor Dashboard
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2">
              Welcome Back, {user?.name || "Trainer"}!
            </h1>
            <p className="text-gray-400 mt-1">
              Ready to inspire? Review your schedule, classes, and student updates below.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 text-sm font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-lg hover:shadow-purple-500/20 cursor-pointer">
              Schedule New Class
            </button>
            <button className="px-4 py-2 text-sm font-semibold rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer">
              Manage Courses
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Students Assigned", value: "48", change: "Active", color: "purple" },
          { label: "Active Courses", value: "3", change: "Full-term", color: "indigo" },
          { label: "Avg Class Rating", value: "4.92 / 5", change: "Top 5%", color: "amber" },
          { label: "Total Lecture Hours", value: "320 hrs", change: "This Semester", color: "emerald" },
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
                    : stat.color === "purple"
                    ? "bg-purple-500/10 text-purple-400"
                    : "bg-indigo-500/10 text-indigo-400"
                }`}
              >
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Classes */}
        <div className="lg:col-span-2 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6 shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-white/10 pb-3 flex justify-between items-center">
            <span>Today's Class Schedule</span>
            <span className="text-xs text-purple-400 hover:underline cursor-pointer font-medium">View calendar</span>
          </h3>

          <div className="space-y-4">
            {[
              { subject: "Advanced React State Management", course: "MSAI Frontend Suite", time: "10:00 AM - 12:00 PM", status: "Completed", room: "Zoom Hall A" },
              { subject: "Database Models & Postgres ORMs", course: "Full Stack Development", time: "02:00 PM - 03:30 PM", status: "Ongoing", room: "Slack Suite 4" },
              { subject: "Intro to Docker & Containerization", course: "Cloud Architecture", time: "05:00 PM - 06:30 PM", status: "Upcoming", room: "Zoom Hall B" },
            ].map((cls, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl backdrop-blur-md bg-white/5 border border-white/5 gap-3 hover:border-purple-500/30 transition-colors"
              >
                <div>
                  <h4 className="font-semibold text-white">{cls.subject}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {cls.course} • <span className="text-purple-300 font-medium">{cls.room}</span>
                  </p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-sm text-gray-300 font-mono">{cls.time}</span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      cls.status === "Completed"
                        ? "bg-white/10 text-gray-400"
                        : cls.status === "Ongoing"
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    {cls.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Curriculum / Quick Tools */}
        <div className="lg:col-span-1 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6 shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-white/10 pb-3">
            Quick Resource Manager
          </h3>

          <div className="p-4 rounded-xl bg-white/5 border border-white/5 border-dashed border-white/20 hover:border-purple-500/50 hover:bg-white/10 transition-all text-center group cursor-pointer">
            <span className="text-3xl inline-block mb-2 group-hover:scale-110 transition-transform">📤</span>
            <h4 className="text-sm font-semibold text-white">Upload Class Material</h4>
            <p className="text-xs text-gray-400 mt-1">PDF, ZIP, pptx up to 50MB max size</p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">
              Instructor Utilities
            </h4>
            {[
              { title: "Grade Center", desc: "Submit review points for MSAI Batch 2", icon: "📊" },
              { title: "Trainer Profile Details", desc: "Change hourly schedule calendar", icon: "💼" },
            ].map((tool, i) => (
              <button
                key={i}
                className="w-full flex items-center text-left p-3 rounded-xl bg-white/0 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer group"
              >
                <span className="text-xl mr-3">{tool.icon}</span>
                <div>
                  <h5 className="text-sm font-semibold text-white group-hover:text-purple-400 transition-colors">
                    {tool.title}
                  </h5>
                  <p className="text-xs text-gray-400 mt-0.5">{tool.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
