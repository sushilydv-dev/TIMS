import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiAward,
  FiUsers,
  FiBookOpen,
  FiCheck,
  FiCheckCircle,
  FiDownload,
  FiLock,
  FiUnlock,
  FiCreditCard,
} from "react-icons/fi";
import axios from "axios";
import {
  WelcomeBanner,
  StatCards,
  PrimaryButton,
  SecondaryButton,
  Toast,
} from "../DashboardUI";
import { pageWrapClass, inputClass, primaryBtnClass } from "../dashboardTheme";
import { MyFeesDesk } from "./MyFeesDesk";

export const StudentDashboard = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("workspace"); // "workspace" or "fees"
  const [githubUrl, setGithubUrl] = useState("");
  const [projectSubmitted, setProjectSubmitted] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [checkedSyllabus, setCheckedSyllabus] = useState([true, true, true, false, false]);

  // Financial & Student metadata status tracking
  const [paymentStatus, setPaymentStatus] = useState("PENDING_FIRST_PAYMENT");
  const [feeBalance, setFeeBalance] = useState(0);
  const [paymentScheme, setPaymentScheme] = useState("FULL");
  const [student, setStudent] = useState(null);

  // Check URL query parameters for tab selection
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "fees") {
      setActiveTab("fees");
    } else {
      setActiveTab("workspace");
      if (tab === "syllabus") {
        setTimeout(() => {
          document.getElementById("syllabus-section")?.scrollIntoView({ behavior: "smooth" });
        }, 150);
      } else if (tab === "projects") {
        setTimeout(() => {
          document.getElementById("projects-section")?.scrollIntoView({ behavior: "smooth" });
        }, 150);
      }
    }
  }, [location.search]);

  const studentId = user?.Student?.id || null;

  const fetchStatus = async () => {
    try {
      const { data } = await axios.get("/api/students/me/fees");
      setStudent(data);
      const fee = data?.Fees?.[0];
      setPaymentStatus(fee?.payment_status || "PENDING_FIRST_PAYMENT");
      setFeeBalance(Number(fee?.due_amount || 0));
      setPaymentScheme(fee?.payment_scheme_mode || "FULL");
    } catch (err) {
      console.warn("Failed to load student fee status:", err);
      setPaymentStatus("PENDING_FIRST_PAYMENT");
      setFeeBalance(0);
      setStudent(null);
    }
  };

  useEffect(() => {
    if (user?.role === "STUDENT") {
      fetchStatus();
    }
  }, [user?.role]);


  const toggleSyllabus = (idx) => {
    if (paymentStatus === "PENDING_FIRST_PAYMENT") return; // Locked
    setCheckedSyllabus((prev) =>
      prev.map((val, i) => (i === idx ? !val : val))
    );
  };

  const handleProjectSubmit = (e) => {
    e.preventDefault();
    if (paymentStatus === "PENDING_FIRST_PAYMENT") return; // Locked
    if (!githubUrl || !githubUrl.includes("github.com")) {
      alert("Please enter a valid GitHub repository link!");
      return;
    }
    setProjectSubmitted(true);
    setToastMessage("Successfully submitted project repository to Dr. Marcus Vance!");
    setTimeout(() => setToastMessage(""), 4000);
  };

  const attendances = student?.Attendances || [];
  const totalClasses = attendances.length;
  const classesMet = student ? attendances.filter(a => String(a.status).toUpperCase() === "PRESENT" || String(a.status).toUpperCase() === "LATE").length : 44;
  const absentLogs = student ? attendances.filter(a => String(a.status).toUpperCase() === "ABSENT").length : 6;
  const attendancePct = student ? (totalClasses > 0 ? Math.round((classesMet / totalClasses) * 100) : 100) : 88;

  const courseTitle = student?.Enrollments?.[0]?.Batch?.Course?.title || "Full Stack MERN Dev";
  const batchName = student?.Enrollments?.[0]?.Batch?.batch_name || "Unassigned Batch";
  const studentCode = student?.student_code || "STU-2026-001";
  const collegeName = student?.college_name || "VIT University";

  const isPendingFirst = paymentStatus === "PENDING_FIRST_PAYMENT" || paymentStatus === "NONE";
  const isFullPaymentPlan = paymentScheme === "FULL";
  const isEligibleForGraduation = attendancePct >= 85 && feeBalance === 0;

  if (user?.role === "STUDENT" && !studentId) {
    return (
      <div className={pageWrapClass}>
        <div className="py-12 text-center text-sm font-semibold text-[#94a3b8]">
          Loading student workspace...
        </div>
      </div>
    );
  }


  return (
    <div className={pageWrapClass}>
      <Toast message={toastMessage} />

      {/* Tabs Selector Navigation */}
      <div className="flex border-b border-black/[0.08] text-xs font-bold text-gray-500 gap-6 pb-0.5">
        <button
          onClick={() => navigate("/dashboard")}
          className={`pb-2.5 transition-all relative cursor-pointer ${
            activeTab === "workspace"
              ? "text-rose-500 font-extrabold"
              : "hover:text-[#0c0407]"
          }`}
        >
          My Workspace
          {activeTab === "workspace" && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-rose-500 rounded-full"></span>
          )}
        </button>
        <button
          onClick={() => navigate("/dashboard?tab=fees")}
          className={`pb-2.5 transition-all relative cursor-pointer ${
            activeTab === "fees"
              ? "text-rose-500 font-extrabold"
              : "hover:text-[#0c0407]"
          }`}
        >
          My Fees & Access Desk
          {activeTab === "fees" && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-rose-500 rounded-full"></span>
          )}
        </button>
      </div>

      {activeTab === "workspace" ? (
        <div className="relative">
          {/* Platform Resource Lock Blur Overlay */}
          {isPendingFirst && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/40 backdrop-blur-[6px] rounded-2xl">
              <div className="bg-white border border-black/10 p-6 rounded-2xl max-w-sm text-center shadow-xl animate-[fadeIn_0.3s_ease]">
                <FiLock className="w-12 h-12 text-[#fc362d] mx-auto mb-3 animate-bounce" />
                <h3 className="text-base font-extrabold text-[#0c0407]">Access Restricted</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Access Restricted: Complete your {isFullPaymentPlan ? "full course fee" : "initial installment"} payment to unlock your learning resources (Assignments, Content Materials, and Attendance).
                </p>
                <button
                  onClick={() => navigate("/dashboard?tab=fees")}
                  className="mt-4 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md shadow-rose-500/10 transition-all active:scale-95"
                >
                  {isFullPaymentPlan ? "Pay Full Course Fee" : "Pay Initial Installment"}
                </button>
              </div>
            </div>
          )}

          <div className={`space-y-6 ${isPendingFirst ? "filter blur-[3px] pointer-events-none select-none" : ""}`}>
            <WelcomeBanner
              badge="Student Workspace"
              title={`Welcome back, ${user?.name || "Student"}!`}
              description="Track attendance, complete syllabus milestones, and submit projects."
              actions={
                <>
                  <PrimaryButton>Access Resources</PrimaryButton>
                  <SecondaryButton>Class Roadmap</SecondaryButton>
                </>
              }
            />

            <StatCards
              stats={[
                {
                  label: "Attendance",
                  value: `${attendancePct}%`,
                  change: "Target met",
                  icon: <FiUsers className="w-5 h-5" />,
                },
                {
                  label: "Topics Done",
                  value: `${checkedSyllabus.filter(Boolean).length}/5`,
                  change: "Syllabus",
                  icon: <FiBookOpen className="w-5 h-5" />,
                },
                {
                  label: "Submissions",
                  value: "100%",
                  change: "On track",
                  icon: <FiAward className="w-5 h-5" />,
                },
                {
                  label: "Fees Due",
                  value: `₹${feeBalance.toLocaleString("en-IN")}`,
                  change: feeBalance === 0 ? "Cleared" : "Outstanding",
                  icon: <FiCreditCard className="w-5 h-5" />,
                },
              ]}
            />

            {/* 3. Middle Main Widgets Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Double-Column Panel */}
              <div className="lg:col-span-2 space-y-6">
                {/* Term Project & Code Submission Widget */}
                <div id="projects-section" className="bg-white border border-black/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] scroll-mt-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <span className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider">Evaluation Task</span>
                      <h3 className="text-lg font-extrabold text-[#0c0407] tracking-tight mt-0.5">Active Program Project</h3>
                    </div>
                    <span className="px-2.5 py-1 text-[10px] font-extrabold text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg">
                      Deadline: 28 May 2026
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-black/[0.08] space-y-4">
                    <div>
                      <h4 className="text-base font-extrabold text-[#0c0407]">MSAI-PRJ-004: React E-Commerce Portfolio</h4>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        Design and build a responsive glassmorphic checkout UI, integrate global user contexts in React, implement simulated payment ledgers, and host files securely. Submit the GitHub repository URL below.
                      </p>
                    </div>

                    <div className="h-[1px] bg-slate-200"></div>

                    {projectSubmitted ? (
                      <div className="p-4 rounded-xl bg-[#475569]/5 border border-[#475569]/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <h5 className="text-xs font-extrabold text-[#475569] flex items-center gap-1.5">
                            <FiCheckCircle /> Repository Submitted
                          </h5>
                          <p className="text-[10px] text-gray-500 mt-1 truncate max-w-xs md:max-w-md font-semibold">
                            Submitted Link: <span className="font-mono text-gray-700">{githubUrl}</span>
                          </p>
                        </div>
                        <button
                          onClick={() => setProjectSubmitted(false)}
                          className="px-3 py-1.5 bg-[#475569]/10 hover:bg-[#f1f5f9]/15 text-[#475569] text-[10px] font-extrabold rounded-lg cursor-pointer border border-[#475569]/10"
                        >
                          Edit Submission
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleProjectSubmit} className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">
                            GitHub Code Repository Link
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="url"
                              placeholder="https://github.com/username/repository-name"
                              value={githubUrl}
                              onChange={(e) => setGithubUrl(e.target.value)}
                              required
                              className={`flex-1 ${inputClass}`}
                            />
                            <button
                              type="submit"
                              className={`${primaryBtnClass} px-5`}
                            >
                              Submit
                            </button>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                </div>

                {/* Attendance progress wheel and Syllabus Progress checklist */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Attendance Progress Donut Wheel */}
                  <div className="bg-white border border-black/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                    <h3 className="text-base font-extrabold text-[#0c0407] mb-4">Participation Progress</h3>

                    <div className="flex items-center justify-around gap-4 h-40">
                      {/* SVG Radial Wheel */}
                      <div className="relative w-28 h-28 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-slate-100"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-[#334155]"
                            strokeDasharray={`${attendancePct}, 100`}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                          <span className="text-xl font-extrabold text-[#0c0407]">{attendancePct}%</span>
                          <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Attendance</span>
                        </div>
                      </div>

                      <div className="space-y-3 font-semibold text-xs text-gray-500">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Classes Met</p>
                          <p className="text-sm font-extrabold text-[#0c0407]">{classesMet} Blocks</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Absent Logs</p>
                          <p className="text-sm font-extrabold text-[#0c0407]">{absentLogs} Blocks</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Syllabus Milestones checklist */}
                  <div id="syllabus-section" className="bg-white border border-black/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] scroll-mt-6">
                    <h3 className="text-base font-extrabold text-[#0c0407] border-b border-black/[0.08] pb-3.5 mb-3.5">
                      Syllabus Topic Milestones
                    </h3>
                    <div className="space-y-3">
                      {[
                        "React components & props mapping",
                        "Redux Toolkit slice configurations",
                        "Axios routing & endpoint hooks",
                        "JWT token authorization pipelines",
                        "Prisma ORM migration validations",
                      ].map((topic, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <button
                            onClick={() => toggleSyllabus(i)}
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all cursor-pointer ${
                              checkedSyllabus[i]
                                ? "bg-[#334155] border-[#334155] text-white"
                                : "border-gray-200 bg-slate-50 hover:bg-[#f1f5f9]/10"
                            }`}
                          >
                            {checkedSyllabus[i] && <FiCheck className="w-3.5 h-3.5" />}
                          </button>
                          <span className={`text-xs font-semibold ${checkedSyllabus[i] ? "text-gray-400 line-through" : "text-gray-700"}`}>
                            {topic}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Single-Column Panel */}
              <div className="space-y-6">
                {/* Virtual Student Smart ID Card */}
                <div className="bg-white border border-black/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                  <h3 className="text-base font-extrabold text-[#0c0407] mb-4">Trainee smartcard</h3>

                  <div className="relative overflow-hidden aspect-[1.6/1] w-full rounded-2xl bg-gradient-to-br from-[#1a1a1f] via-[#141418] to-[#0c0407] p-5 text-white shadow-[0_8px_28px_rgba(0,0,0,0.2)]">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-lg"></div>

                    <div className="h-full flex flex-col justify-between relative z-10">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-white/20 uppercase tracking-wider">
                            Student Access Card
                          </span>
                          <h4 className="text-sm font-extrabold tracking-tight mt-1.5">{student?.User?.name || user?.name || "Alex Manda"}</h4>
                          <p className="text-[9px] text-white/80 font-bold uppercase tracking-wider">{courseTitle}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-extrabold text-white text-sm shadow-sm select-none">
                          {(student?.User?.name || user?.name || "ST").slice(0, 2).toUpperCase()}
                        </div>
                      </div>

                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[7px] font-bold text-white/40 uppercase">Deterministic Code</p>
                          <p className="text-xs font-bold font-mono">{studentCode}</p>
                        </div>
                        <div>
                          <p className="text-[7px] font-bold text-white/40 uppercase text-right">Academic Sponsor</p>
                          <p className="text-[9px] font-bold tracking-tight">{collegeName}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Graduation Certificate Locker */}
                <div className="bg-white border border-black/[0.08] rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                  <h3 className="text-base font-extrabold text-[#0c0407] mb-4">Milestone Certificates</h3>

                  <div className="bg-slate-50 border border-black/[0.08] rounded-2xl p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-[#475569]/10 border border-[#475569]/20 flex items-center justify-center text-[#475569]">
                          {isEligibleForGraduation ? <FiUnlock /> : <FiLock />}
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-[#0c0407]">Graduation Credential</h4>
                          <p className="text-[9px] text-gray-400 font-bold mt-0.5">TIMS verifiable certificate</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                        isEligibleForGraduation 
                          ? "text-[#05CD99] bg-[#E6FAF5] border-[#05CD99]/20" 
                          : "text-amber-600 bg-amber-50 border-amber-500/20"
                      }`}>
                        {isEligibleForGraduation ? "Ready" : "Locked"}
                      </span>
                    </div>

                    <div className="space-y-2 border-t border-b border-slate-200/50 py-3 text-[10px] font-bold text-gray-500">
                      <div className="flex justify-between">
                        <span>Attendance Criteria (&gt;=85%):</span>
                        <span className={attendancePct >= 85 ? "text-[#05CD99]" : "text-red-500"}>
                          {attendancePct}% ({attendancePct >= 85 ? "Pass" : "Failed"})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Accounting Ledger Dues (₹0):</span>
                        <span className={feeBalance === 0 ? "text-[#05CD99]" : "text-red-500"}>
                          {feeBalance === 0 ? "Cleared (Pass)" : `Outstanding ₹${Number(feeBalance).toLocaleString("en-IN")}`}
                        </span>
                      </div>
                    </div>

                    {isEligibleForGraduation ? (
                      <button
                        onClick={() => alert(`Simulating PDF Certificate download! Verification Code: CERT-${studentId.slice(0, 8)}`)}
                        className={`w-full py-2.5 text-center text-xs font-extrabold text-white ${primaryBtnClass} flex items-center justify-center gap-1.5`}
                      >
                        <FiDownload />
                        Download Certificate PDF
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2.5 text-center text-xs font-extrabold text-gray-400 bg-slate-100 rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        <FiLock /> Locked (Dues pending)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <MyFeesDesk onPaymentSuccess={fetchStatus} />
      )}
    </div>
  );
};

export default StudentDashboard;
