import { useState, useEffect } from "react";
import axios from "axios";
import { FiCheck, FiAlertTriangle, FiShield } from "react-icons/fi";
import { Panel, PrimaryButton, SecondaryButton, Toast } from "../DashboardUI";
import { CertificateSettingsModal } from "./CertificateSettings";
import { BasicProfile, useBasicProfile } from "../BasicProfile";
import { ProfileAvatar } from "../ProfileAvatar";
import { LOGO_PATH } from "../../../constants";

const selectionKey = (studentId, batchId) => `${studentId}::${batchId}`;

const CertificateApproval = () => {
  const [activeTab, setActiveTab] = useState("standard"); // "standard", "bypass", or "manual"
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [bypassStudents, setBypassStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const {
    basicProfileOpen,
    basicProfileType,
    basicProfileId,
    openBasicProfile,
    closeBasicProfile,
  } = useBasicProfile();
  
  // Manual generation state
  const [manualForm, setManualForm] = useState({
    student_id: "",
    custom_issue_date: "",
  });

  useEffect(() => {
    fetchQueues();
  }, []);

  const fetchQueues = async () => {
    setLoading(true);
    try {
      const [eligibleRes, bypassRes] = await Promise.all([
        axios.get("/api/certificates/eligible"),
        axios.get("/api/certificates/bypass-queue"),
      ]);
      setEligibleStudents(eligibleRes.data);
      setBypassStudents(bypassRes.data);
    } catch (error) {
      console.error("Error fetching certificate queues:", error);
      setToast("Failed to load certificate queues");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStudent = (studentId, batchId) => {
    const key = selectionKey(studentId, batchId);
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedStudents(newSelected);
  };

  const handleSelectAll = () => {
    const currentList = activeTab === "standard" ? eligibleStudents : bypassStudents;
    if (selectedStudents.size === currentList.length) {
      setSelectedStudents(new Set());
    } else {
      const newSelected = new Set();
      currentList.forEach((student) => {
        newSelected.add(selectionKey(student.student_id, student.batch_id));
      });
      setSelectedStudents(newSelected);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedStudents.size === 0) return;

    setGenerating(true);
    setToast("");

    const enrollments = Array.from(selectedStudents).map((key) => {
      const [student_id, batch_id] = key.split("::");
      return { student_id, batch_id };
    });

    try {
      const { data: results } = await axios.post("/api/certificates/bulk-approve", { enrollments });
      const succeeded = results.filter((result) => result.success).length;
      const failed = results.length - succeeded;

      if (failed === 0) {
        setToast(`Successfully generated ${succeeded} certificate${succeeded === 1 ? "" : "s"}`);
      } else {
        setToast(`Generated ${succeeded}, failed ${failed}. Check console for details.`);
        console.warn("Bulk certificate results:", results);
      }
      setSelectedStudents(new Set());
      setTimeout(() => setToast(""), 3000);
      fetchQueues();
    } catch (error) {
      console.error("Error bulk approving certificates:", error);
      setToast("Failed to approve certificates");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setGenerating(false);
    }
  };

  const handleBypassApprove = async (studentId, batchId) => {
    setGenerating(true);
    setToast("");

    try {
      await axios.post("/api/certificates/generate", {
        student_id: studentId,
        batch_id: batchId,
        bypass: true,
      });
      setToast("Certificate approved with bypass");
      setTimeout(() => setToast(""), 3000);
      fetchQueues();
    } catch (error) {
      console.error("Error bypass approving certificate:", error);
      setToast(error.response?.data?.message || "Failed to approve certificate");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setGenerating(false);
    }
  };

  const handleManualGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setToast("");

    try {
      const response = await axios.post("/api/certificates/generate-manual", {
        student_id: manualForm.student_id.trim(),
        custom_issue_date: manualForm.custom_issue_date,
      });
      setToast(`Certificate generated for ${response.data.course} (${response.data.batch})!`);
      setManualForm({ student_id: "", custom_issue_date: "" });
      fetchQueues();
    } catch (error) {
      console.error("Error generating manual certificate:", error);
      setToast(error.response?.data?.message || "Failed to generate certificate");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setGenerating(false);
    }
  };

  const StudentRow = ({ student, isBypass }) => (
    <tr className="border-b border-black/[0.05] hover:bg-[#f8fafc] transition-colors">
      <td className="p-4">
        <input
          type="checkbox"
          checked={selectedStudents.has(selectionKey(student.student_id, student.batch_id))}
          onChange={() => handleSelectStudent(student.student_id, student.batch_id)}
          className="w-4 h-4 rounded border-[#cbd5e1] text-[#fc362d] focus:ring-[#fc362d]"
        />
      </td>
      <td className="p-4">
        <div className="flex items-center gap-3">
          <ProfileAvatar
            name={student.student_name}
            profileType="student"
            onClick={() => openBasicProfile("student", student.student_id)}
          />
          <div className="font-semibold text-[#0c0407]">{student.student_name}</div>
        </div>
      </td>
      <td className="p-4">
        <div className="text-sm text-[#636363]">{student.course_name}</div>
      </td>
      <td className="p-4">
        {isBypass ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#fef2f2] text-[#b91c1c] border border-[#b91c1c]/20">
            <FiAlertTriangle className="w-3.5 h-3.5" />
            {student.attendance_percentage}% (Below {student.threshold}%)
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ecfdf5] text-[#059669] border border-[#059669]/20">
            <FiCheck className="w-3.5 h-3.5" />
            {student.attendance_percentage}%
          </span>
        )}
      </td>
      <td className="p-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ecfdf5] text-[#059669] border border-[#059669]/20">
          Paid
        </span>
      </td>
      <td className="p-4">
        {isBypass ? (
          <button
            onClick={() => handleBypassApprove(student.student_id, student.batch_id)}
            disabled={generating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#fc362d] text-white hover:bg-[#e02d25] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiShield className="w-3.5 h-3.5" />
            Skip Criteria & Approve
          </button>
        ) : (
          <span className="text-xs text-[#94a3b8]">Awaiting approval</span>
        )}
      </td>
    </tr>
  );

  if (loading) {
    return (
      <Panel>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#fc362d]/20 border-t-[#fc362d] rounded-full animate-spin" />
        </div>
      </Panel>
    );
  }

  return (
    <Panel>
      <Toast message={toast} />
      <CertificateSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <BasicProfile
        open={basicProfileOpen}
        profileType={basicProfileType}
        profileId={basicProfileId}
        onClose={closeBasicProfile}
      />
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
            Certificates
          </p>
          <h3 className="text-xl font-extrabold text-[#0c0407] mt-1">
            Certificate Approvals
          </h3>
          <p className="text-sm text-[#636363] mt-1">
            Review and approve student certificates
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-black/[0.08] bg-white hover:bg-[#f8fafc] hover:shadow-sm transition-all"
          title="Certificate settings"
          aria-label="Open certificate settings"
        >
          <img src={LOGO_PATH} alt="" className="w-8 h-8 object-contain" />
          <span className="text-sm font-semibold text-[#636363] hidden sm:inline">
            Settings
          </span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mt-6 border-b border-black/[0.08]">
        <button
          onClick={() => {
            setActiveTab("standard");
            setSelectedStudents(new Set());
          }}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "standard"
              ? "border-[#fc362d] text-[#fc362d]"
              : "border-transparent text-[#94a3b8] hover:text-[#0c0407]"
          }`}
        >
          Standard Approvals ({eligibleStudents.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("bypass");
            setSelectedStudents(new Set());
          }}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "bypass"
              ? "border-[#fc362d] text-[#fc362d]"
              : "border-transparent text-[#94a3b8] hover:text-[#0c0407]"
          }`}
        >
          Exception Queue ({bypassStudents.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("manual");
            setSelectedStudents(new Set());
          }}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "manual"
              ? "border-[#fc362d] text-[#fc362d]"
              : "border-transparent text-[#94a3b8] hover:text-[#0c0407]"
          }`}
        >
          Manual Generation
        </button>
      </div>

      {/* Bulk Actions */}
      {activeTab === "standard" && eligibleStudents.length > 0 && (
        <div className="flex items-center justify-between mt-4 p-4 bg-[#f8fafc] rounded-xl">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedStudents.size === eligibleStudents.length && eligibleStudents.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-[#cbd5e1] text-[#fc362d] focus:ring-[#fc362d]"
            />
            <span className="text-sm text-[#636363]">
              {selectedStudents.size} of {eligibleStudents.length} selected
            </span>
          </div>
          <PrimaryButton
            onClick={handleBulkApprove}
            disabled={selectedStudents.size === 0 || generating}
            icon={<FiCheck className="w-4 h-4" />}
          >
            {generating ? "Generating..." : "Approve & Generate Selected"}
          </PrimaryButton>
        </div>
      )}

      {/* Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/[0.08] bg-[#f8fafc]">
              <th className="p-4 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                Select
              </th>
              <th className="p-4 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                Student Name
              </th>
              <th className="p-4 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                Course
              </th>
              <th className="p-4 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                Attendance
              </th>
              <th className="p-4 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                Payment Status
              </th>
              <th className="p-4 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {activeTab === "standard" ? (
              eligibleStudents.length > 0 ? (
                eligibleStudents.map((student) => (
                  <StudentRow key={`${student.student_id}-${student.batch_id}`} student={student} isBypass={false} />
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-sm text-[#94a3b8]">
                    No students in standard approval queue
                  </td>
                </tr>
              )
            ) : activeTab === "bypass" ? (
              bypassStudents.length > 0 ? (
                bypassStudents.map((student) => (
                  <StudentRow key={`${student.student_id}-${student.batch_id}`} student={student} isBypass={true} />
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-sm text-[#94a3b8]">
                    No students in exception queue
                  </td>
                </tr>
              )
            ) : (
              <tr>
                <td colSpan="6" className="p-8">
                  <form onSubmit={handleManualGenerate} className="max-w-2xl mx-auto space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#0c0407] mb-2">
                        Student ID
                      </label>
                      <input
                        type="text"
                        required
                        value={manualForm.student_id}
                        onChange={(e) => setManualForm({ ...manualForm, student_id: e.target.value })}
                        placeholder="e.g. STU-2026-001"
                        className="w-full px-4 py-2.5 rounded-lg border border-black/[0.08] focus:outline-none focus:ring-2 focus:ring-[#fc362d]/20 focus:border-[#fc362d]"
                      />
                      <p className="text-xs text-[#94a3b8] mt-1">
                        Enter the student code or UUID. Uses the active batch, or the most recently ended batch if none is active.
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-[#0c0407] mb-2">
                        Custom Issue Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={manualForm.custom_issue_date}
                        onChange={(e) => setManualForm({ ...manualForm, custom_issue_date: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-black/[0.08] focus:outline-none focus:ring-2 focus:ring-[#fc362d]/20 focus:border-[#fc362d]"
                      />
                      <p className="text-xs text-[#94a3b8] mt-1">
                        Leave empty to use today's date
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <PrimaryButton
                        type="submit"
                        disabled={generating || !manualForm.student_id}
                        icon={<FiShield className="w-4 h-4" />}
                      >
                        {generating ? "Generating..." : "Generate Certificate"}
                      </PrimaryButton>
                      <SecondaryButton
                        type="button"
                        onClick={() => setManualForm({ student_id: "", custom_issue_date: "" })}
                      >
                        Clear
                      </SecondaryButton>
                    </div>
                    
                    <div className="p-4 bg-[#fef3c7] border border-[#d97706]/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <FiAlertTriangle className="w-5 h-5 text-[#d97706] mt-0.5" />
                        <div className="text-sm text-[#92400e]">
                          <p className="font-semibold mb-1">Manual Override Warning</p>
                          <p>
                            This will generate a certificate bypassing all eligibility checks (attendance, fees, batch completion).
                            The system will automatically find the student's active batch. Use this only for special cases or manual corrections.
                          </p>
                        </div>
                      </div>
                    </div>
                  </form>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
};

export default CertificateApproval;
