import React, { useState } from "react";
import {
  FiUsers,
  FiBookOpen,
  FiAward,
  FiLayers,
  FiPlus,
  FiCheck,
  FiExternalLink,
  FiCheckCircle,
} from "react-icons/fi";
import {
  WelcomeBanner,
  StatCards,
  PrimaryButton,
  SecondaryButton,
  Toast,
} from "../DashboardUI";
import { pageWrapClass, inputClass, primaryBtnClass } from "../dashboardTheme";

export const TrainerDashboard = ({ user }) => {
  
  const [submissions, setSubmissions] = useState([
    { id: 1, name: "Rohit Sharma", pg: "React E-Commerce UI", batch: "MERN-2026-B1", link: "https://github.com/rohit/ecommerce", date: "Today, 10:24", graded: false, marks: "", feedback: "" },
    { id: 2, name: "Aishwarya Rai", pg: "Docker-Compose deployment", batch: "DEVOPS-26-B2", link: "https://github.com/aish/docker-deploy", date: "Yesterday, 14:15", graded: true, marks: "95", feedback: "Excellent compose script!" },
    { id: 3, name: "Vikram Malhotra", pg: "SQL Index Tuning Plan", batch: "DATA-2026-B3", link: "https://github.com/vikram/pg-tuning", date: "24 May, 19:30", graded: false, marks: "", feedback: "" },
  ]);

  const [toastMessage, setToastMessage] = useState("");

  const handleGrade = (id, marks, feedback) => {
    if (!marks) {
      alert("Please enter numerical marks!");
      return;
    }
    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === id
          ? { ...sub, graded: true, marks, feedback: feedback || "Well done." }
          : sub
      )
    );
    setToastMessage(`Successfully logged score for submission ID #${id}!`);
    setTimeout(() => setToastMessage(""), 4000);
  };

  return (
    <div className={pageWrapClass}>
      <Toast message={toastMessage} />

      <WelcomeBanner
        badge="Trainer Workstation"
        title={`Welcome back, ${user?.name || "Trainer"}!`}
        description="Mark attendance, upload resources, assign projects, and grade submissions."
        actions={
          <>
            <PrimaryButton className="flex items-center gap-1.5">
              <FiPlus className="w-3.5 h-3.5" />
              Publish Assignment
            </PrimaryButton>
            <SecondaryButton>Curriculum Map</SecondaryButton>
          </>
        }
      />

      <StatCards
        stats={[
          {
            label: "Batches",
            value: "3",
            change: "Active cohorts",
            icon: <FiLayers className="w-5 h-5" />,
          },
          {
            label: "Attendance",
            value: "92.5%",
            change: "+1.2% MoM",
            icon: <FiUsers className="w-5 h-5" />,
          },
          {
            label: "To Grade",
            value: `${submissions.filter((s) => !s.graded).length}`,
            change: "Pending",
            icon: <FiAward className="w-5 h-5" />,
          },
          {
            label: "Resources",
            value: "48",
            change: "Shared files",
            icon: <FiBookOpen className="w-5 h-5" />,
          },
        ]}
      />

      {/* 3. Middle Main Widgets Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Double-Column Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Submissions Grading Console Table */}
          <div className="bg-white border border-black/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <span className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider">Evaluation Hub</span>
                <h3 className="text-lg font-extrabold text-[#0c0407] tracking-tight mt-0.5">Trainee Coding Submissions</h3>
              </div>
              <span className="px-3 py-1.5 text-xs font-extrabold text-[#475569] bg-[#475569]/10 border border-[#475569]/20 rounded-xl">
                Awaiting Grade: {submissions.filter((s) => !s.graded).length}
              </span>
            </div>

            <div className="space-y-4">
              {submissions.map((sub) => {
                // local state for grading form inputs on the row
                return <SubmissionRow key={sub.id} sub={sub} onGrade={handleGrade} />;
              })}
            </div>
          </div>

          {/* Attendance Engagement & Syllabus Milestones Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Weekly Attendance Line Chart */}
            <div className="bg-white border border-black/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <h3 className="text-base font-extrabold text-[#0c0407] mb-4">Batch Attendance Trends</h3>
              
              {/* Custom Line Sparkline SVG */}
              <div className="h-44 bg-slate-50/50 rounded-2xl border border-gray-50/50 p-3 relative">
                <svg viewBox="0 0 300 120" className="w-full h-full overflow-visible">
                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2="300" y2="30" stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray="3" />
                  <line x1="0" y1="75" x2="300" y2="75" stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray="3" />
                  
                  {/* Primary Teal Line */}
                  <path
                    d="M 10 90 Q 70 20 130 65 T 250 40"
                    fill="none"
                    stroke="#334155"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  {/* Glowing Dots */}
                  <circle cx="130" cy="65" r="3.5" fill="#334155" stroke="white" strokeWidth="1.5" />
                  <circle cx="250" cy="40" r="3.5" fill="#334155" stroke="white" strokeWidth="1.5" />
                  
                  {/* X Axis */}
                  <text x="10" y="115" fill="#9ca3af" fontSize="9" fontWeight="bold">Week 1</text>
                  <text x="90" y="115" fill="#9ca3af" fontSize="9" fontWeight="bold">Week 2</text>
                  <text x="170" y="115" fill="#9ca3af" fontSize="9" fontWeight="bold">Week 3</text>
                  <text x="250" y="115" fill="#9ca3af" fontSize="9" fontWeight="bold">Week 4</text>
                </svg>
              </div>
              <p className="text-[10px] text-gray-400 font-semibold mt-3 text-center">
                MERN-2026-B1 weekly average participation rate.
              </p>
            </div>

            {/* Curriculum Progress Checklist */}
            <div className="bg-white border border-black/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <h3 className="text-base font-extrabold text-[#0c0407] border-b border-black/[0.08] pb-3.5 mb-3.5">
                MERN syllabus checklist
              </h3>
              <div className="space-y-3">
                {[
                  { topic: "React Components & Hooks State", done: true },
                  { topic: "Redux Toolkit central store", done: true },
                  { topic: "Axios API Interceptors Integration", done: false },
                  { topic: "JSON Web Tokens cookie storage", done: false },
                ].map((top, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                      top.done 
                        ? "bg-[#475569] border-[#475569] text-white" 
                        : "border-gray-200 bg-slate-50"
                    }`}>
                      {top.done && <FiCheck className="w-3.5 h-3.5" />}
                    </div>
                    <span className={`text-xs font-semibold ${top.done ? "text-gray-400 line-through" : "text-gray-700"}`}>
                      {top.topic}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Right Single-Column Panel */}
        <div className="space-y-6">
          
          {/* Active Cohorts Timing Grid */}
          <div className="bg-white border border-black/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <h3 className="text-base font-extrabold text-[#0c0407] mb-4">Daily Training Blocks</h3>
            <div className="space-y-3.5">
              {[
                { name: "MERN Stack - B1", time: "09:00 AM - 11:00 AM", students: "34 Registered" },
                { name: "PostgreSQL DB - B3", time: "11:30 AM - 01:30 PM", students: "28 Registered" },
                { name: "DevOps Deploy - B2", time: "02:30 PM - 04:30 PM", students: "32 Registered" },
              ].map((co, i) => (
                <div key={i} className="bg-slate-50 border border-black/[0.08] p-4 rounded-2xl hover:scale-[1.01] transition-transform">
                  <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider block">Cohort Active</span>
                  <h4 className="text-sm font-extrabold mt-0.5">{co.name}</h4>
                  <div className="h-[1px] bg-slate-100 my-2"></div>
                  <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold">
                    <span>{co.time}</span>
                    <span>{co.students}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Classroom Commands Card */}
          <div className="bg-white border border-black/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <h3 className="text-base font-extrabold text-[#0c0407] mb-4">Instructor Actions</h3>
            <div className="grid grid-cols-1 gap-2.5">
              {[
                { label: "Mark Attendance Grid", icon: "☑" },
                { label: "Upload Syllabus Topic", icon: "⎋" },
                { label: "Share Study Material", icon: "⇪" },
                { label: "Issue Class Link", icon: "⌨" },
              ].map((act, i) => (
                <button
                  key={i}
                  className="flex items-center justify-between text-left p-3 rounded-2xl hover:bg-[#f1f5f9]/5 hover:border-[#475569]/20 border border-slate-50/50 bg-slate-50/30 transition-all cursor-pointer font-bold text-xs"
                >
                  <span className="text-gray-600 font-semibold">{act.label}</span>
                  <span className="text-sm font-bold text-[#475569]">{act.icon}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

// Row component for grading student submissions locally
const SubmissionRow = ({ sub, onGrade }) => {
  const [marks, setMarks] = useState(sub.marks);
  const [feedback, setFeedback] = useState(sub.feedback);

  return (
    <div className="p-4 rounded-2xl bg-slate-50/50 border border-black/[0.08]/80 space-y-3">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h4 className="font-extrabold text-sm text-[#0c0407]">{sub.name}</h4>
          <p className="text-[10px] text-gray-400 font-bold mt-0.5">
            Assignment: <span className="text-[#475569] font-extrabold">{sub.pg}</span> • {sub.batch}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={sub.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#475569] hover:underline"
          >
            <FiExternalLink />
            Code Repository
          </a>
          <span className="text-[10px] font-bold text-[#9ca3af]">{sub.date}</span>
        </div>
      </div>

      <div className="h-[1px] bg-slate-100"></div>

      {sub.graded ? (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 bg-[#475569]/5 border border-[#475569]/10 p-3 rounded-xl">
          <div className="text-xs">
            <span className="font-bold text-[#9ca3af]">Score:</span>{" "}
            <span className="font-extrabold text-[#475569]">{sub.marks}/100</span>
            <span className="mx-2 text-gray-300">|</span>
            <span className="font-bold text-[#9ca3af]">Review:</span>{" "}
            <span className="text-gray-600 font-semibold">{sub.feedback}</span>
          </div>
          <span className="px-2.5 py-0.5 bg-[#475569] text-white text-[9px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1 select-none">
            <FiCheck /> Graded
          </span>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-end md:items-center gap-3 bg-white border border-black/[0.08] p-3 rounded-xl shadow-inner">
          <div className="w-24">
            <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Marks (100)</label>
            <input
              type="number"
              placeholder="e.g. 90"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              className={`${inputClass} !py-2 !rounded-xl text-xs`}
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Feedback</label>
            <input
              type="text"
              placeholder="Provide student feedback..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className={`${inputClass} !py-2 !rounded-xl text-xs`}
            />
          </div>
          <button
            onClick={() => onGrade(sub.id, marks, feedback)}
            className={`${primaryBtnClass} px-4 py-2 text-xs w-full md:w-auto`}
          >
            Submit Score
          </button>
        </div>
      )}
    </div>
  );
};
export default TrainerDashboard;
