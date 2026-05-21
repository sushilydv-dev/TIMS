import React from "react";

export const StudentDashboard = ({ user }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Panel */}
      <div className="relative overflow-hidden rounded-3xl backdrop-blur-3xl bg-white/5 border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-widest">
              Student Learning Hub
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2">
              Welcome Back, {user?.name || "Student"}!
            </h1>
            <p className="text-gray-400 mt-1">
              Ready to learn something new today? Here's an overview of your training path.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 text-sm font-semibold rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white transition-all shadow-lg hover:shadow-cyan-500/20 cursor-pointer">
              Resume Last Lesson
            </button>
            <button className="px-4 py-2 text-sm font-semibold rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer">
              Browse All Courses
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Completed Modules", value: "12 / 16", change: "75% Done", color: "cyan" },
          { label: "Ongoing Courses", value: "2 Active", change: "MSAI Frontend", color: "indigo" },
          { label: "Quiz Avg Performance", value: "88%", change: "Excellent", color: "emerald" },
          { label: "Syllabus Attendance", value: "92.4%", change: "Good", color: "purple" },
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
                    : stat.color === "cyan"
                    ? "bg-cyan-500/10 text-cyan-400"
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

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Your Course Schedule */}
        <div className="lg:col-span-2 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6 shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-white/10 pb-3 flex justify-between items-center">
            <span>Your Training Schedule</span>
            <span className="text-xs text-cyan-400 hover:underline cursor-pointer font-medium">Join Live Link</span>
          </h3>

          <div className="space-y-4">
            {[
              { subject: "Database Models & Postgres ORMs", course: "Full Stack Development", time: "02:00 PM - 03:30 PM", instructor: "Pete (TRAINER)", link: "Active Zoom" },
              { subject: "Intro to Docker & Containerization", course: "Cloud Architecture", time: "Tomorrow, 05:00 PM", instructor: "Pete (TRAINER)", link: "Scheduled Link" },
            ].map((cls, i) => (
              <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl bg-white/5 border border-white/5 gap-3">
                <div>
                  <h4 className="font-semibold text-white">{cls.subject}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {cls.course} • Instructor: <span className="text-cyan-300 font-medium">{cls.instructor}</span>
                  </p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-sm text-gray-300 font-mono">{cls.time}</span>
                  <button className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-cyan-600/80 hover:bg-cyan-600 text-white transition-all cursor-pointer">
                    {cls.link}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quizzes & Study Materials */}
        <div className="lg:col-span-1 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6 shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-white/10 pb-3">
            Upcoming Assessments
          </h3>

          <div className="space-y-3">
            {[
              { title: "React State Sync Quiz", deadline: "Tonight, 11:59 PM", status: "Open" },
              { title: "Node Express API Mock", deadline: "May 25, 05:00 PM", status: "Locked" },
            ].map((qz, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <h4 className="text-sm font-semibold text-white">{qz.title}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Deadline: {qz.deadline}</p>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    qz.status === "Open"
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse"
                      : "bg-white/10 text-gray-500"
                  }`}
                >
                  {qz.status}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-4">
            <button className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer text-sm">
              Open Course Syllabus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
