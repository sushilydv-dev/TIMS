import React, { useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiX } from "react-icons/fi";
import axios from "axios";
import {
  cardClass,
  inputClass,
  primaryBtnClass,
  secondaryBtnClass,
} from "../dashboardTheme";

const emptyModule = () => ({
  title: "",
  learning_items: [""],
});

export function CourseFormModal({
  open,
  onClose,
  onSuccess,
  departments = [],
  initialDepartmentId = "",
  editCourse = null,
}) {
  const isEdit = Boolean(editCourse?.id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [durationMonth, setDurationMonth] = useState(3);
  const [fees, setFees] = useState(0);
  const [modules, setModules] = useState([emptyModule()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setDepartmentId("");
      setDurationMonth(3);
      setFees(0);
      setModules([emptyModule()]);
      setError("");
      setLoading(false);
      return;
    }

    if (editCourse) {
      setTitle(editCourse.title || "");
      setDescription(editCourse.description || "");
      setDepartmentId(editCourse.department_id || "");
      setDurationMonth(editCourse.duration_month ?? 3);
      setFees(editCourse.fees ?? 0);
      setModules(
        editCourse.modules?.length
          ? editCourse.modules.map((m) => ({
              title: m.title || "",
              learning_items:
                m.learning_items?.length > 0 ? [...m.learning_items] : [""],
            }))
          : [emptyModule()],
      );
    } else {
      setDepartmentId(initialDepartmentId || departments[0]?.id || "");
      setModules([emptyModule()]);
    }
  }, [open, editCourse, initialDepartmentId, departments]);

  if (!open) return null;

  const updateModule = (index, patch) => {
    setModules((prev) =>
      prev.map((mod, i) => (i === index ? { ...mod, ...patch } : mod)),
    );
  };

  const addModule = () => {
    setModules((prev) => [...prev, emptyModule()]);
  };

  const removeModule = (index) => {
    setModules((prev) =>
      prev.length === 1 ? [emptyModule()] : prev.filter((_, i) => i !== index),
    );
  };

  const updateLearningItem = (modIndex, itemIndex, value) => {
    setModules((prev) =>
      prev.map((mod, i) => {
        if (i !== modIndex) return mod;
        const items = [...mod.learning_items];
        items[itemIndex] = value;
        return { ...mod, learning_items: items };
      }),
    );
  };

  const addLearningItem = (modIndex) => {
    setModules((prev) =>
      prev.map((mod, i) =>
        i === modIndex
          ? { ...mod, learning_items: [...mod.learning_items, ""] }
          : mod,
      ),
    );
  };

  const removeLearningItem = (modIndex, itemIndex) => {
    setModules((prev) =>
      prev.map((mod, i) => {
        if (i !== modIndex) return mod;
        const items = mod.learning_items.filter((_, j) => j !== itemIndex);
        return { ...mod, learning_items: items.length ? items : [""] };
      }),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      title,
      description,
      department_id: departmentId,
      duration_month: Number(durationMonth),
      fees: Number(fees),
      modules: modules.map((mod, index) => ({
        title: mod.title,
        sequence_order: index + 1,
        learning_items: mod.learning_items,
      })),
    };

    try {
      if (isEdit) {
        await axios.put(`/api/admin/courses/${editCourse.id}`, payload);
      } else {
        await axios.post("/api/admin/courses", payload);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#0c0407]/40 backdrop-blur-sm cursor-default"
        aria-label="Close dialog"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto ${cardClass} p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.15)]`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-xl border border-black/10 bg-[#fafafa] text-[#475569] flex items-center justify-center hover:bg-[#f1f5f9] transition-colors cursor-pointer z-10"
          aria-label="Close"
        >
          <FiX className="w-4 h-4" />
        </button>

        <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">
          {isEdit ? "Edit course" : "New course"}
        </span>
        <h2 className="text-xl font-bold text-[#0c0407] mt-2 pr-10 tracking-tight">
          {isEdit ? "Update program" : "Create program"}
        </h2>
        <p className="text-sm text-[#636363] mt-1.5 mb-6 font-medium">
          Assign a department, set fees & duration, and define training modules with learning outcomes.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#475569] mb-1.5">
                Course title
              </label>
              <input
                required
                className={inputClass}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. MERN Stack Development"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#475569] mb-1.5">
                Description
              </label>
              <textarea
                className={`${inputClass} min-h-[80px] resize-y`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief overview of the program"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1.5">
                Department
              </label>
              <select
                required
                className={inputClass}
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1.5">
                Duration (months)
              </label>
              <input
                type="number"
                min={1}
                required
                className={inputClass}
                value={durationMonth}
                onChange={(e) => setDurationMonth(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1.5">
                Fees (₹)
              </label>
              <input
                type="number"
                min={0}
                required
                className={inputClass}
                value={fees}
                onChange={(e) => setFees(e.target.value)}
              />
            </div>
          </div>

          <div className="border-t border-black/[0.08] pt-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#0c0407]">Training modules</h3>
                <p className="text-[11px] text-[#94a3b8] font-semibold mt-0.5">
                  What students will learn in each module
                </p>
              </div>
              <button
                type="button"
                onClick={addModule}
                className={`${secondaryBtnClass} !py-2 !px-3 inline-flex items-center gap-1`}
              >
                <FiPlus className="w-3.5 h-3.5" /> Module
              </button>
            </div>

            <div className="space-y-4">
              {modules.map((mod, modIndex) => (
                <div
                  key={modIndex}
                  className="rounded-2xl border border-black/[0.08] bg-[#fafafa] p-4"
                >
                  <div className="flex gap-2 items-start mb-3">
                    <input
                      required
                      className={`${inputClass} flex-1 bg-white`}
                      value={mod.title}
                      onChange={(e) =>
                        updateModule(modIndex, { title: e.target.value })
                      }
                      placeholder={`Module ${modIndex + 1} title`}
                    />
                    <button
                      type="button"
                      onClick={() => removeModule(modIndex)}
                      className="p-2.5 rounded-xl border border-black/10 text-[#b91c1c] hover:bg-[#fef2f2] cursor-pointer shrink-0"
                      aria-label="Remove module"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">
                    Learning outcomes
                  </p>
                  <div className="space-y-2">
                    {mod.learning_items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex gap-2">
                        <input
                          className={`${inputClass} flex-1 bg-white text-[11px]`}
                          value={item}
                          onChange={(e) =>
                            updateLearningItem(modIndex, itemIndex, e.target.value)
                          }
                          placeholder="e.g. Build REST APIs with Express"
                        />
                        <button
                          type="button"
                          onClick={() => removeLearningItem(modIndex, itemIndex)}
                          className="p-2 rounded-lg text-[#94a3b8] hover:text-[#b91c1c] hover:bg-white cursor-pointer"
                          aria-label="Remove item"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => addLearningItem(modIndex)}
                    className="mt-2 text-[11px] font-bold text-[#fc362d] hover:underline cursor-pointer"
                  >
                    + Add learning point
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs font-semibold text-[#b91c1c] bg-[#fef2f2] border border-[#b91c1c]/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3 pt-2 sticky bottom-0 bg-white pb-1">
            <button
              type="submit"
              disabled={loading}
              className={`${primaryBtnClass} flex-1 min-w-[140px] disabled:opacity-50`}
            >
              {loading ? "Saving…" : isEdit ? "Save changes" : "Create course"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={secondaryBtnClass}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CourseFormModal;
