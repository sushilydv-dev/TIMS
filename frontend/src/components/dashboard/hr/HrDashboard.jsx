import React from "react";
import {
  FiUsers,
  FiLayers,
  FiTrendingUp,
  FiCalendar,
  FiCheckSquare,
  FiPlus,
} from "react-icons/fi";
import {
  WelcomeBanner,
  StatCards,
  PrimaryButton,
  SecondaryButton,
} from "../DashboardUI";
import { INSTITUTE_NAME } from "../../../constants";
import { pageWrapClass } from "../dashboardTheme";

export const HrDashboard = ({ user }) => {
  return (
    <div className={pageWrapClass}>
      <WelcomeBanner
        badge="HR Coordinator"
        title={`Welcome back, ${user?.name || "HR Manager"}!`}
        description="Onboard students, manage batches, and track placement pipelines."
        actions={
          <>
            <PrimaryButton className="flex items-center gap-1.5">
              <FiPlus className="w-3.5 h-3.5" />
              Onboard Student
            </PrimaryButton>
            <SecondaryButton>Interview Scheduler</SecondaryButton>
          </>
        }
      />

      <StatCards
        stats={[
          {
            label: "Active Cohorts",
            value: "14",
            change: "+2 today",
            icon: <FiLayers className="w-5 h-5" />,
          },
          {
            label: "Trainees",
            value: "112",
            change: "Onboarded",
            icon: <FiUsers className="w-5 h-5" />,
          },
          {
            label: "Placement Rate",
            value: "94.6%",
            change: "Target met",
            icon: <FiTrendingUp className="w-5 h-5" />,
          },
          {
            label: "Interviews",
            value: "8",
            change: "This week",
            icon: <FiCalendar className="w-5 h-5" />,
          },
        ]}
      />

      {/* 3. Middle Main Widgets Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Double-Column Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Candidates Directory Table */}
          <div className="bg-white border border-black/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <span className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider">Trainee Database</span>
                <h3 className="text-lg font-extrabold text-[#0c0407] tracking-tight mt-0.5">Active Onboarded Candidates</h3>
              </div>
              <button className="px-3.5 py-2 text-xs font-extrabold text-[#475569] bg-[#475569]/5 hover:bg-[#f1f5f9]/10 rounded-xl transition-all cursor-pointer">
                View All Directory
              </button>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-50 text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider">
                    <th className="pb-3.5 pl-2">Student Details</th>
                    <th className="pb-3.5">Assigned Program</th>
                    <th className="pb-3.5">Academic College</th>
                    <th className="pb-3.5 text-right pr-2">Placement Status</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-bold divide-y divide-gray-50/50">
                  {[
                    { name: "Rohit Sharma", code: "STU-2026-001", pg: "React Web Stack", col: "LPU University", status: "Interviewing", type: "warn" },
                    { name: "Aishwarya Rai", code: "STU-2026-014", pg: "DevOps Orchestration", col: "Amity Campus", status: "Offered", type: "ok" },
                    { name: "Vikram Malhotra", code: "STU-2026-042", pg: "Postgres Database", col: "BITS Pilani", status: "Shortlisted", type: "info" },
                    { name: "Sneha Sen", code: "STU-2026-103", pg: "Full Stack Java", col: "VIT College", status: "Interviewing", type: "warn" },
                  ].map((stu, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 pl-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-[#0c0407] font-extrabold shadow-sm border border-gray-50">
                            {stu.name[0]}
                          </div>
                          <div>
                            <h4 className="text-[#0c0407]">{stu.name}</h4>
                            <span className="text-[9px] text-gray-400 font-bold block mt-0.5">{stu.code}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-[#9ca3af]">{stu.pg}</td>
                      <td className="py-4 text-gray-500 font-semibold">{stu.col}</td>
                      <td className="py-4 text-right pr-2">
                        <span className={`inline-block px-2.5 py-1 text-[9px] font-extrabold rounded-full border ${
                          stu.type === "ok" 
                            ? "bg-[#E6FAF5] text-[#05CD99] border-[#05CD99]/20" 
                            : stu.type === "warn" 
                            ? "bg-[#FFF4E5] text-[#FFB547] border-[#FFB547]/20" 
                            : "bg-[#475569]/10 text-[#475569] border-[#475569]/20"
                        }`}>
                          {stu.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Onboarding Operations & Checklist Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Onboarding Statistics Visual (Vertical pillars chart) */}
            <div className="bg-white border border-black/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <h3 className="text-base font-extrabold text-[#0c0407] mb-4">Registration Analytics</h3>
              
              {/* Daily/Weekly Registration Pillars */}
              <div className="h-44 flex items-end justify-between px-3 bg-slate-50/50 rounded-2xl border border-gray-50/50 p-4">
                {[
                  { day: "W1", ht: "h-16", val: "12" },
                  { day: "W2", ht: "h-24", val: "18" },
                  { day: "W3", ht: "h-36", val: "29" },
                  { day: "W4", ht: "h-20", val: "15" },
                  { day: "W5", ht: "h-40", val: "34" },
                  { day: "W6", ht: "h-28", val: "22" },
                ].map((col, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="text-[9px] font-bold text-[#9ca3af] opacity-0 group-hover:opacity-100 transition-opacity">
                      {col.val}
                    </div>
                    <div className="w-6 rounded-t-lg bg-slate-200 group-hover:bg-[#f1f5f9] transition-all relative overflow-hidden">
                      <div className={`w-full ${col.ht} bg-[#334155]/70 group-hover:bg-[#334155]`}></div>
                    </div>
                    <span className="text-[10px] font-bold text-[#9ca3af]">{col.day}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 font-semibold mt-3 text-center">
                Net student acquisitions in MSAI INDIA batches over the last 6 weeks.
              </p>
            </div>

            {/* HR Operations Tasks Checklist */}
            <div className="bg-white border border-black/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <h3 className="text-base font-extrabold text-[#0c0407] border-b border-black/[0.08] pb-3.5 mb-3.5">
                Coordinator Pending Actions
              </h3>
              <div className="space-y-3">
                {[
                  { action: "Verify Student ID Attachments", tag: "2 Pending", type: "warn" },
                  { action: "Approve Batch Allocations", tag: "v1.4 Draft", type: "info" },
                  { action: "Lock Batch Attendances", tag: "0 Overdue", type: "ok" },
                  { action: "Validate Placement Policy doc", tag: "Review Required", type: "warn" },
                ].map((act, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-2xl bg-[#fafafa]/50 border border-gray-50">
                    <div className="flex items-center gap-2">
                      <FiCheckSquare className="w-4 h-4 text-[#475569] flex-shrink-0" />
                      <span className="text-xs font-semibold text-gray-700 truncate max-w-[170px]">{act.action}</span>
                    </div>
                    <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      act.type === "warn" 
                        ? "bg-[#FFF4E5] text-[#FFB547]" 
                        : act.type === "info" 
                        ? "bg-[#475569]/10 text-[#475569]" 
                        : "bg-[#E6FAF5] text-[#05CD99]"
                    }`}>
                      {act.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Right Single-Column Panel */}
        <div className="space-y-6">
          
          {/* Beautiful HR ID Smartcard */}
          <div className="bg-white border border-black/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <h3 className="text-base font-extrabold text-[#0c0407] mb-4">Verification Node</h3>
            
            {/* Visual Smart ID Card */}
            <div className="relative overflow-hidden aspect-[1.6/1] w-full rounded-2xl bg-gradient-to-br from-[#1a1a1f] via-[#141418] to-[#0c0407] p-5 text-white shadow-[0_8px_28px_rgba(0,0,0,0.2)]">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-[#475569]/10 rounded-full blur-xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#475569]/5 rounded-full blur-lg"></div>
              
              <div className="h-full flex flex-col justify-between relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-white/20 uppercase tracking-wider">
                      Staff ID Card
                    </span>
                    <h4 className="text-sm font-extrabold tracking-tight mt-1.5">Sarah Jenkins</h4>
                    <p className="text-[9px] text-white/80 font-bold uppercase tracking-wider">HR Placement Director</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center font-extrabold text-white text-sm shadow-sm select-none">
                    SJ
                  </div>
                </div>
                
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[7px] font-bold text-white/40 uppercase">Card Holder Serial</p>
                    <p className="text-xs font-bold font-mono">{INSTITUTE_NAME}-HR-491026</p>
                  </div>
                  <div>
                    <p className="text-[7px] font-bold text-white/40 uppercase text-right">Office Base</p>
                    <p className="text-[9px] font-bold tracking-tight">MSAI Corporate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recruiter Placements Timeline */}
          <div className="bg-white border border-black/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <h3 className="text-base font-extrabold text-[#0c0407] mb-4">Interviews Pipeline</h3>
            <div className="space-y-4">
              {[
                { co: "Zeta Tech Internships", role: "React Developer", time: "Today, 15:30", candidates: "Rohit, Sneha" },
                { co: "TCS Cloud Engineering", role: "DevOps Engineer", time: "Tomorrow, 10:00", candidates: "Aishwarya" },
                { co: "CyberShield Database", role: "Postgres Admin", time: "28 May, 11:30", candidates: "Vikram" },
              ].map((sch, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-gray-50 transition-all">
                  <div className="w-2 h-2 rounded-full bg-[#475569] mt-1.5 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-xs font-extrabold text-[#0c0407]">{sch.co}</h4>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{sch.role} • {sch.time}</p>
                    <div className="inline-block mt-2 px-2 py-0.5 bg-[#fafafa] text-[#475569] text-[9px] font-bold rounded-lg border border-slate-100">
                      Trainees: {sch.candidates}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2.5 text-center text-xs font-extrabold text-[#475569] bg-[#475569]/5 hover:bg-[#f1f5f9]/10 rounded-2xl transition-all cursor-pointer">
              Schedule Recruiter Call
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
export default HrDashboard;
