import { useState, useEffect } from "react";
import axios from "axios";
import { FiPlus, FiEdit, FiTrash2, FiFileText, FiClock, FiUsers, FiCheckCircle, FiXCircle, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { Panel, PanelHeader, Toast } from "../DashboardUI";
import { primaryBtnClass, secondaryBtnClass, inputClass, labelMutedClass } from "../dashboardTheme";

export function AssessmentManager({ courseId, batchId }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [expandedResults, setExpandedResults] = useState({});
  const [selectedResults, setSelectedResults] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    course_id: courseId || "",
    batch_id: batchId || "",
    total_marks: 100,
    duration_minutes: 30,
    start_time: "",
    end_time: "",
    questions: [],
  });

  const [questionForm, setQuestionForm] = useState({
    question_text: "",
    options: ["", "", "", ""],
    correct_answer: 0,
    marks: 1,
  });

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 3500); };

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (courseId) params.course_id = courseId;
      if (batchId) params.batch_id = batchId;

      const { data } = await axios.get("/api/admin/assessments/", { params });
      setAssessments(data.data || []);
    } catch (err) {
      showToast("Failed to load assessments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, [courseId, batchId]);

  const addQuestion = () => {
    if (!questionForm.question_text.trim()) {
      showToast("Please enter a question");
      return;
    }
    setForm({
      ...form,
      questions: [...form.questions, { ...questionForm }],
    });
    setQuestionForm({
      question_text: "",
      options: ["", "", "", ""],
      correct_answer: 0,
      marks: 1,
    });
  };

  const removeQuestion = (index) => {
    setForm({
      ...form,
      questions: form.questions.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.questions.length === 0) {
      showToast("Please add at least one question");
      return;
    }
    try {
      if (editingAssessment) {
        await axios.put(`/api/admin/assessments/${editingAssessment.id}`, form);
        showToast("Assessment updated");
      } else {
        await axios.post("/api/admin/assessments/", form);
        showToast("Assessment created");
      }
      setShowForm(false);
      setEditingAssessment(null);
      resetForm();
      fetchAssessments();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save assessment");
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      course_id: courseId || "",
      batch_id: batchId || "",
      total_marks: 100,
      passing_marks: 40,
      duration_minutes: 30,
      start_time: "",
      end_time: "",
      questions: [],
    });
    setQuestionForm({
      question_text: "",
      options: ["", "", "", ""],
      correct_answer: 0,
      marks: 1,
    });
  };

  const handleEdit = (assessment) => {
    setEditingAssessment(assessment);
    setForm({
      title: assessment.title,
      description: assessment.description,
      course_id: assessment.course_id,
      batch_id: assessment.batch_id,
      total_marks: assessment.total_marks,
      duration_minutes: assessment.duration_minutes,
      start_time: assessment.start_time?.substring(0, 16) || "",
      end_time: assessment.end_time?.substring(0, 16) || "",
      questions: assessment.questions || [],
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this assessment?")) return;
    try {
      await axios.delete(`/api/admin/assessments/${id}`);
      showToast("Assessment deleted");
      fetchAssessments();
    } catch (err) {
      showToast("Failed to delete");
    }
  };

  const viewResults = async (assessmentId) => {
    try {
      const { data } = await axios.get(`/api/admin/assessments/${assessmentId}/results`);
      setSelectedResults({ assessmentId, data: data.data });
      setExpandedResults(prev => ({ ...prev, [assessmentId]: true }));
    } catch (err) {
      showToast("Failed to load results");
    }
  };

  const getStatus = (assessment) => {
    const now = new Date();
    const start = new Date(assessment.start_time);
    const end = new Date(assessment.end_time);

    if (now < start) return { label: "Upcoming", color: "bg-blue-50 text-blue-700 border-blue-200" };
    if (now > end) return { label: "Completed", color: "bg-gray-50 text-gray-700 border-gray-200" };
    return { label: "Active", color: "bg-green-50 text-green-700 border-green-200" };
  };

  return (
    <>
      <Toast message={toast} />
      <Panel>
        <PanelHeader
          eyebrow="Assessments"
          title="Quiz & Evaluations"
          action={
            <button
              onClick={() => { setShowForm(true); setEditingAssessment(null); resetForm(); }}
              className={`${primaryBtnClass} text-xs flex items-center gap-1.5`}
            >
              <FiPlus className="w-3.5 h-3.5" /> Create Assessment
            </button>
          }
        />

        {loading ? (
          <div className="text-center py-12 text-sm text-[#94a3b8]">Loading assessments...</div>
        ) : assessments.length === 0 ? (
          <div className="text-center py-12 text-sm text-[#94a3b8] border border-dashed border-black/[0.1] rounded-2xl">
            No assessments yet. Create your first assessment above.
          </div>
        ) : (
          <div className="space-y-3">
            {assessments.map((assessment) => {
              const status = getStatus(assessment);
              return (
                <div key={assessment.id} className="border border-black/[0.07] rounded-2xl overflow-hidden bg-white">
                  <div className="flex items-center justify-between px-4 py-3 bg-[#fafafa] border-b border-black/[0.06]">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${status.color}`}>
                        {status.label}
                      </span>
                      <span className="text-sm font-semibold text-[#0c0407]">{assessment.title}</span>
                      <span className="text-[10px] font-bold text-[#94a3b8] bg-black/5 px-2 py-0.5 rounded-full">
                        {assessment.questions?.length || 0} questions
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewResults(assessment.id)}
                        className="p-1.5 rounded-lg text-[#94a3b8] hover:bg-black/5 hover:text-[#fc362d]"
                        title="View Results"
                      >
                        <FiUsers className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleEdit(assessment)}
                        className="p-1.5 rounded-lg text-[#94a3b8] hover:bg-black/5 hover:text-[#fc362d]"
                      >
                        <FiEdit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(assessment.id)}
                        className="p-1.5 rounded-lg text-[#94a3b8] hover:bg-black/5 hover:text-[#b91c1c]"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="px-4 py-3 grid grid-cols-3 gap-4 text-xs">
                    <div className="flex items-center gap-2 text-[#636363]">
                      <FiFileText className="w-3.5 h-3.5" />
                      <span>{assessment.total_marks} marks</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#636363]">
                      <FiClock className="w-3.5 h-3.5" />
                      <span>{assessment.duration_minutes} mins</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#636363]">
                      <span>Pass: {assessment.passing_marks} marks</span>
                    </div>
                  </div>
                  {expandedResults[assessment.id] && selectedResults?.assessmentId === assessment.id && (
                    <div className="border-t border-black/[0.06] p-4 bg-white">
                      <h4 className="text-xs font-bold text-[#0c0407] mb-3">Student Results</h4>
                      {selectedResults.data.length === 0 ? (
                        <p className="text-xs text-[#94a3b8]">No submissions yet</p>
                      ) : (
                        <div className="space-y-2">
                          {selectedResults.data.map((result) => (
                            <div key={result.id} className="flex items-center justify-between p-2 bg-[#fafafa] rounded-lg">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-[#0c0407]">{result.student?.name}</span>
                                <span className="text-[10px] text-[#94a3b8]">{result.student?.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-[#0c0407]">
                                  {result.obtained_marks}/{result.total_marks}
                                </span>
                                {result.passed ? (
                                  <FiCheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <FiXCircle className="w-4 h-4 text-red-600" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      {/* Assessment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 my-8">
            <h3 className="text-lg font-bold text-[#0c0407] mb-4">
              {editingAssessment ? "Edit Assessment" : "Create Assessment"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelMutedClass}>Title</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className={inputClass}
                    placeholder="e.g., React Fundamentals Quiz"
                    required
                  />
                </div>
                <div>
                  <label className={labelMutedClass}>Duration (minutes)</label>
                  <input
                    type="number"
                    value={form.duration_minutes}
                    onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) })}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
              <div>
                <label className={labelMutedClass}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={inputClass}
                  rows={2}
                  placeholder="Brief description of the assessment"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelMutedClass}>Start Time</label>
                  <input
                    type="datetime-local"
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelMutedClass}>End Time</label>
                  <input
                    type="datetime-local"
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelMutedClass}>Total Marks</label>
                  <input
                    type="number"
                    value={form.total_marks}
                    onChange={(e) => setForm({ ...form, total_marks: parseInt(e.target.value) })}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              {/* Questions Section */}
              <div className="border border-black/[0.07] rounded-2xl p-4">
                <h4 className="text-sm font-bold text-[#0c0407] mb-3">
                  Questions ({form.questions.length})
                </h4>
                
                {/* Add Question Form */}
                <div className="space-y-3 mb-4 p-3 bg-[#fafafa] rounded-xl">
                  <input
                    value={questionForm.question_text}
                    onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                    className={inputClass}
                    placeholder="Question text"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {questionForm.options.map((opt, idx) => (
                      <input
                        key={idx}
                        value={opt}
                        onChange={(e) => {
                          const newOptions = [...questionForm.options];
                          newOptions[idx] = e.target.value;
                          setQuestionForm({ ...questionForm, options: newOptions });
                        }}
                        className={inputClass}
                        placeholder={`Option ${idx + 1}`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={questionForm.correct_answer}
                      onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: parseInt(e.target.value) })}
                      className={inputClass}
                    >
                      <option value={0}>Option 1 is correct</option>
                      <option value={1}>Option 2 is correct</option>
                      <option value={2}>Option 3 is correct</option>
                      <option value={3}>Option 4 is correct</option>
                    </select>
                    <input
                      type="number"
                      value={questionForm.marks}
                      onChange={(e) => setQuestionForm({ ...questionForm, marks: parseInt(e.target.value) })}
                      className={inputClass}
                      placeholder="Marks"
                      min="1"
                    />
                    <button
                      type="button"
                      onClick={addQuestion}
                      className={`${primaryBtnClass} text-xs`}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Questions List */}
                {form.questions.map((q, idx) => (
                  <div key={idx} className="flex items-start justify-between p-3 bg-white border border-black/[0.06] rounded-xl mb-2">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-[#0c0407] mb-1">
                        Q{idx + 1}: {q.question_text}
                      </p>
                      <div className="flex gap-2 text-[10px] text-[#636363]">
                        {q.options.map((opt, oidx) => (
                          <span key={oidx} className={q.correct_answer === oidx ? "text-green-600 font-bold" : ""}>
                            {oidx + 1}. {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#94a3b8]">{q.marks} marks</span>
                      <button
                        type="button"
                        onClick={() => removeQuestion(idx)}
                        className="p-1 rounded text-[#94a3b8] hover:text-[#b91c1c]"
                      >
                        <FiXCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingAssessment(null); resetForm(); }}
                  className={secondaryBtnClass}
                >
                  Cancel
                </button>
                <button type="submit" className={primaryBtnClass}>
                  {editingAssessment ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AssessmentManager;
