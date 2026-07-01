import { useState, useEffect } from "react";
import axios from "axios";
import { FiPlus, FiEdit, FiTrash2, FiBook, FiLayers, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { Panel, PanelHeader, Toast } from "../DashboardUI";
import { primaryBtnClass, secondaryBtnClass, inputClass, labelMutedClass } from "../dashboardTheme";

export function SyllabusManager({ courseId, courseName }) {
  const [syllabus, setSyllabus] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [showSyllabusForm, setShowSyllabusForm] = useState(false);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editingSyllabus, setEditingSyllabus] = useState(null);
  const [editingModule, setEditingModule] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});

  const [syllabusForm, setSyllabusForm] = useState({
    topic_name: "",
    description: "",
    sequence_order: "",
  });

  const [moduleForm, setModuleForm] = useState({
    title: "",
    sequence_order: "",
    learning_items: "",
  });

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 3500); };

  const fetchCurriculum = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/admin/courses/${courseId}/curriculum`);
      setSyllabus(data.data.syllabus || []);
      setModules(data.data.modules || []);
    } catch (err) {
      showToast("Failed to load curriculum");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchCurriculum();
  }, [courseId]);

  const handleSyllabusSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSyllabus) {
        await axios.put(`/api/admin/syllabus/${editingSyllabus.id}`, syllabusForm);
        showToast("Syllabus topic updated");
      } else {
        await axios.post("/api/admin/syllabus", { ...syllabusForm, course_id: courseId });
        showToast("Syllabus topic added");
      }
      setShowSyllabusForm(false);
      setEditingSyllabus(null);
      setSyllabusForm({ topic_name: "", description: "", sequence_order: "" });
      fetchCurriculum();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save syllabus");
    }
  };

  const handleModuleSubmit = async (e) => {
    e.preventDefault();
    try {
      const learningItems = moduleForm.learning_items
        .split("\n")
        .filter(item => item.trim())
        .map(item => item.trim());

      if (editingModule) {
        await axios.put(`/api/admin/modules/${editingModule.id}`, {
          ...moduleForm,
          learning_items: learningItems,
        });
        showToast("Module updated");
      } else {
        await axios.post("/api/admin/modules", {
          ...moduleForm,
          course_id: courseId,
          learning_items: learningItems,
        });
        showToast("Module added");
      }
      setShowModuleForm(false);
      setEditingModule(null);
      setModuleForm({ title: "", sequence_order: "", learning_items: "" });
      fetchCurriculum();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save module");
    }
  };

  const handleDeleteSyllabus = async (id) => {
    if (!window.confirm("Delete this syllabus topic?")) return;
    try {
      await axios.delete(`/api/admin/syllabus/${id}`);
      showToast("Syllabus topic deleted");
      fetchCurriculum();
    } catch (err) {
      showToast("Failed to delete");
    }
  };

  const handleDeleteModule = async (id) => {
    if (!window.confirm("Delete this module?")) return;
    try {
      await axios.delete(`/api/admin/modules/${id}`);
      showToast("Module deleted");
      fetchCurriculum();
    } catch (err) {
      showToast("Failed to delete");
    }
  };

  const editSyllabus = (item) => {
    setEditingSyllabus(item);
    setSyllabusForm({
      topic_name: item.topic_name,
      description: item.description,
      sequence_order: item.sequence_order,
    });
    setShowSyllabusForm(true);
  };

  const editModule = (item) => {
    setEditingModule(item);
    setModuleForm({
      title: item.title,
      sequence_order: item.sequence_order,
      learning_items: item.learning_items?.join("\n") || "",
    });
    setShowModuleForm(true);
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  return (
    <>
      <Toast message={toast} />
      <Panel>
        <PanelHeader
          eyebrow="Curriculum"
          title={courseName || "Course Syllabus"}
          action={
            <div className="flex gap-2">
              <button
                onClick={() => { setShowModuleForm(true); setEditingModule(null); }}
                className={`${secondaryBtnClass} text-xs flex items-center gap-1.5`}
              >
                <FiLayers className="w-3.5 h-3.5" /> Add Module
              </button>
              <button
                onClick={() => { setShowSyllabusForm(true); setEditingSyllabus(null); }}
                className={`${primaryBtnClass} text-xs flex items-center gap-1.5`}
              >
                <FiPlus className="w-3.5 h-3.5" /> Add Topic
              </button>
            </div>
          }
        />

        {loading ? (
          <div className="text-center py-12 text-sm text-[#94a3b8]">Loading curriculum...</div>
        ) : (
          <div className="space-y-6">
            {/* Modules Section */}
            <div>
              <h3 className="text-sm font-bold text-[#0c0407] mb-4 flex items-center gap-2">
                <FiLayers className="w-4 h-4 text-[#fc362d]" />
                Course Modules ({modules.length})
              </h3>
              {modules.length === 0 ? (
                <div className="text-center py-8 text-sm text-[#94a3b8] border border-dashed border-black/[0.1] rounded-2xl">
                  No modules yet. Add your first module above.
                </div>
              ) : (
                <div className="space-y-3">
                  {modules.map((mod) => (
                    <div key={mod.id} className="border border-black/[0.07] rounded-2xl overflow-hidden bg-white">
                      <div className="flex items-center justify-between px-4 py-3 bg-[#fafafa] border-b border-black/[0.06]">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-[#94a3b8]">#{mod.sequence_order}</span>
                          <span className="text-sm font-semibold text-[#0c0407]">{mod.title}</span>
                          <span className="text-[10px] font-bold text-[#94a3b8] bg-black/5 px-2 py-0.5 rounded-full">
                            {mod.learning_items?.length || 0} items
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleModule(mod.id)}
                            className="p-1.5 rounded-lg text-[#94a3b8] hover:bg-black/5 hover:text-[#0c0407]"
                          >
                            {expandedModules[mod.id] ? <FiChevronUp /> : <FiChevronDown />}
                          </button>
                          <button
                            onClick={() => editModule(mod)}
                            className="p-1.5 rounded-lg text-[#94a3b8] hover:bg-black/5 hover:text-[#fc362d]"
                          >
                            <FiEdit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteModule(mod.id)}
                            className="p-1.5 rounded-lg text-[#94a3b8] hover:bg-black/5 hover:text-[#b91c1c]"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      {expandedModules[mod.id] && (
                        <div className="p-4 bg-white">
                          <ul className="space-y-2">
                            {mod.learning_items?.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-[#3a3b50]">
                                <span className="text-[#fc362d] mt-1">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Syllabus Topics Section */}
            <div>
              <h3 className="text-sm font-bold text-[#0c0407] mb-4 flex items-center gap-2">
                <FiBook className="w-4 h-4 text-[#fc362d]" />
                Syllabus Topics ({syllabus.length})
              </h3>
              {syllabus.length === 0 ? (
                <div className="text-center py-8 text-sm text-[#94a3b8] border border-dashed border-black/[0.1] rounded-2xl">
                  No syllabus topics yet. Add your first topic above.
                </div>
              ) : (
                <div className="space-y-3">
                  {syllabus.map((item) => (
                    <div key={item.id} className="border border-black/[0.07] rounded-2xl p-4 bg-white">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold text-[#94a3b8]">#{item.sequence_order}</span>
                            <span className="text-sm font-semibold text-[#0c0407]">{item.topic_name}</span>
                          </div>
                          <p className="text-xs text-[#636363]">{item.description}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => editSyllabus(item)}
                            className="p-1.5 rounded-lg text-[#94a3b8] hover:bg-black/5 hover:text-[#fc362d]"
                          >
                            <FiEdit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSyllabus(item.id)}
                            className="p-1.5 rounded-lg text-[#94a3b8] hover:bg-black/5 hover:text-[#b91c1c]"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Panel>

      {/* Syllabus Form Modal */}
      {showSyllabusForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-[#0c0407] mb-4">
              {editingSyllabus ? "Edit Syllabus Topic" : "Add Syllabus Topic"}
            </h3>
            <form onSubmit={handleSyllabusSubmit} className="space-y-4">
              <div>
                <label className={labelMutedClass}>Topic Name</label>
                <input
                  value={syllabusForm.topic_name}
                  onChange={(e) => setSyllabusForm({ ...syllabusForm, topic_name: e.target.value })}
                  className={inputClass}
                  placeholder="e.g., Introduction to React"
                  required
                />
              </div>
              <div>
                <label className={labelMutedClass}>Description</label>
                <textarea
                  value={syllabusForm.description}
                  onChange={(e) => setSyllabusForm({ ...syllabusForm, description: e.target.value })}
                  className={inputClass}
                  rows={3}
                  placeholder="Brief description of the topic"
                  required
                />
              </div>
              <div>
                <label className={labelMutedClass}>Sequence Order</label>
                <input
                  type="number"
                  value={syllabusForm.sequence_order}
                  onChange={(e) => setSyllabusForm({ ...syllabusForm, sequence_order: e.target.value })}
                  className={inputClass}
                  placeholder="e.g., 1"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowSyllabusForm(false); setEditingSyllabus(null); setSyllabusForm({ topic_name: "", description: "", sequence_order: "" }); }}
                  className={secondaryBtnClass}
                >
                  Cancel
                </button>
                <button type="submit" className={primaryBtnClass}>
                  {editingSyllabus ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Module Form Modal */}
      {showModuleForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-[#0c0407] mb-4">
              {editingModule ? "Edit Module" : "Add Module"}
            </h3>
            <form onSubmit={handleModuleSubmit} className="space-y-4">
              <div>
                <label className={labelMutedClass}>Module Title</label>
                <input
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  className={inputClass}
                  placeholder="e.g., Module 1: Fundamentals"
                  required
                />
              </div>
              <div>
                <label className={labelMutedClass}>Sequence Order</label>
                <input
                  type="number"
                  value={moduleForm.sequence_order}
                  onChange={(e) => setModuleForm({ ...moduleForm, sequence_order: e.target.value })}
                  className={inputClass}
                  placeholder="e.g., 1"
                  required
                />
              </div>
              <div>
                <label className={labelMutedClass}>Learning Items (one per line)</label>
                <textarea
                  value={moduleForm.learning_items}
                  onChange={(e) => setModuleForm({ ...moduleForm, learning_items: e.target.value })}
                  className={inputClass}
                  rows={5}
                  placeholder="Introduction to the topic&#10;Key concepts&#10;Practical exercises"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModuleForm(false); setEditingModule(null); setModuleForm({ title: "", sequence_order: "", learning_items: "" }); }}
                  className={secondaryBtnClass}
                >
                  Cancel
                </button>
                <button type="submit" className={primaryBtnClass}>
                  {editingModule ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default SyllabusManager;
