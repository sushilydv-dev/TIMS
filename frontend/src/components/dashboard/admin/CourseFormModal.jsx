import React, { useEffect, useRef, useState } from "react";
import { FiImage, FiPlus, FiTrash2, FiX } from "react-icons/fi";
import axios from "axios";
import {
  cardClass,
  inputClass,
  primaryBtnClass,
  secondaryBtnClass,
} from "../dashboardTheme";

const emptyModule = () => ({ title: "", learning_items: [""] });

/* ── Section heading helper ─────────────────────────── */
function SectionHeading({ title, description, action }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <div>
        <h3 className="text-sm font-bold text-[#0c0407]">{title}</h3>
        {description && (
          <p className="text-[11px] text-[#94a3b8] font-semibold mt-0.5">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function CourseFormModal({
  open,
  onClose,
  onSuccess,
  departments = [],
  initialDepartmentId = "",
  editCourse = null,
}) {
  const isEdit = Boolean(editCourse?.id);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  /* ── form state ── */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [durationMonth, setDurationMonth] = useState(3);
  const [fees, setFees] = useState(0);
  const [modules, setModules] = useState([emptyModule()]);
  const [outcomes, setOutcomes] = useState([""]);
  const [thumbnailPreview, setThumbnailPreview] = useState(null); // data URL shown in preview
  const [thumbnailData, setThumbnailData] = useState(null);       // data URL sent to API (null = unchanged)
  const [clearThumbnail, setClearThumbnail] = useState(false);    // explicit remove
  const [demoVideoUrl, setDemoVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ── keyboard / scroll lock ── */
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  /* ── populate / reset on open ── */
  useEffect(() => {
    if (!open) {
      setTitle(""); setDescription(""); setDepartmentId("");
      setDurationMonth(3); setFees(0);
      setModules([emptyModule()]); setOutcomes([""]);
      setThumbnailPreview(null); setThumbnailData(null); setClearThumbnail(false);
      setDemoVideoUrl(""); setError(""); setLoading(false);
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
              learning_items: m.learning_items?.length > 0 ? [...m.learning_items] : [""],
            }))
          : [emptyModule()],
      );
      setOutcomes(
        editCourse.outcomes?.length ? [...editCourse.outcomes] : [""],
      );
      const thumbUrl = editCourse.thumbnail_url || null;
      setThumbnailPreview(thumbUrl?.startsWith("data:") ? thumbUrl : (thumbUrl ? `http://localhost:3000${thumbUrl}` : null));
      setThumbnailData(null);
      setClearThumbnail(false);
      setDemoVideoUrl(editCourse.demo_video_url || "");
    } else {
      setDepartmentId(initialDepartmentId || departments[0]?.id || "");
      setModules([emptyModule()]);
      setOutcomes([""]);
      setThumbnailPreview(null); setThumbnailData(null); setClearThumbnail(false);
      setDemoVideoUrl("");
    }
  }, [open, editCourse, initialDepartmentId, departments]);

  if (!open) return null;

  /* ── image file picker — compresses via canvas before storing ── */
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Handle video upload
    if (file.type.startsWith("video/")) {
      if (file.size > 50 * 1024 * 1024) {
        setError("Video cover media must be under 50 MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setThumbnailPreview(event.target.result);
        setThumbnailData(event.target.result);
        setClearThumbnail(false);
        setError("");
      };
      reader.onerror = () => {
        setError("Could not read video file");
      };
      reader.readAsDataURL(file);
      e.target.value = "";
      return;
    }

    // Handle image upload
    if (file.size > 10 * 1024 * 1024) {
      setError("Image cover media must be under 10 MB");
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Resize to max 1280px on the longest side
      const MAX = 1280;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width >= height) { height = Math.round((height / width) * MAX); width = MAX; }
        else { width = Math.round((width / height) * MAX); height = MAX; }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);

      // Encode as JPEG at 82% quality — typically 80–200 KB
      const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
      setThumbnailPreview(dataUrl);
      setThumbnailData(dataUrl);
      setClearThumbnail(false);
      setError("");
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setError("Could not read image file");
    };

    img.src = objectUrl;
    e.target.value = "";
  };

  const handleRemoveImage = () => {
    setThumbnailPreview(null);
    setThumbnailData(null);
    setClearThumbnail(true);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      setError("Video must be under 50 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setDemoVideoUrl(event.target.result);
      setError("");
    };
    reader.onerror = () => {
      setError("Could not read video file");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  /* ── outcomes helpers ── */
  const updateOutcome = (i, val) =>
    setOutcomes((prev) => prev.map((o, idx) => (idx === i ? val : o)));
  const addOutcome = () => setOutcomes((prev) => [...prev, ""]);
  const removeOutcome = (i) =>
    setOutcomes((prev) =>
      prev.length === 1 ? [""] : prev.filter((_, idx) => idx !== i),
    );

  /* ── module helpers ── */
  const updateModule = (i, patch) =>
    setModules((prev) => prev.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
  const addModule = () => setModules((prev) => [...prev, emptyModule()]);
  const removeModule = (i) =>
    setModules((prev) => (prev.length === 1 ? [emptyModule()] : prev.filter((_, idx) => idx !== i)));
  const updateLearningItem = (mi, ii, val) =>
    setModules((prev) =>
      prev.map((m, idx) => {
        if (idx !== mi) return m;
        const items = [...m.learning_items];
        items[ii] = val;
        return { ...m, learning_items: items };
      }),
    );
  const addLearningItem = (mi) =>
    setModules((prev) =>
      prev.map((m, idx) =>
        idx === mi ? { ...m, learning_items: [...m.learning_items, ""] } : m,
      ),
    );
  const removeLearningItem = (mi, ii) =>
    setModules((prev) =>
      prev.map((m, idx) => {
        if (idx !== mi) return m;
        const items = m.learning_items.filter((_, j) => j !== ii);
        return { ...m, learning_items: items.length ? items : [""] };
      }),
    );

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Build thumbnail_url value:
    // - new file chosen → send base64
    // - explicit clear → send null
    // - unchanged (no new file, no clear) → send undefined so backend ignores it
    let thumbnailValue;
    if (thumbnailData) thumbnailValue = thumbnailData;
    else if (clearThumbnail) thumbnailValue = null;
    // else leave undefined

    const payload = {
      title,
      description,
      department_id: departmentId,
      duration_month: Number(durationMonth),
      fees: Number(fees),
      demo_video_url: demoVideoUrl.trim() || null,
      outcomes: outcomes.map((o) => o.trim()).filter(Boolean),
      modules: modules.map((mod, index) => ({
        title: mod.title,
        sequence_order: index + 1,
        learning_items: mod.learning_items,
      })),
    };

    if (thumbnailValue !== undefined) payload.thumbnail_url = thumbnailValue;

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
          Assign a department, set fees & duration, add media, define outcomes and training modules.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Basic info ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#475569] mb-1.5">Course title</label>
              <input
                required
                className={inputClass}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. MERN Stack Development"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#475569] mb-1.5">Description</label>
              <textarea
                className={`${inputClass} min-h-[80px] resize-y`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief overview of the program"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1.5">Department</label>
              <select
                required
                className={inputClass}
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1.5">Duration (months)</label>
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
              <label className="block text-xs font-bold text-[#475569] mb-1.5">Fees (₹)</label>
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

          {/* ── Media ── */}
          <div className="border-t border-black/[0.08] pt-5 space-y-4">
            <SectionHeading
              title="Course media"
              description="Thumbnail shown on the course page; paste a video URL for a demo preview"
            />

            {/* Thumbnail */}
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-2">
                Thumbnail / cover media <span className="text-[#94a3b8] font-normal">(image under 10 MB or video under 50 MB)</span>
              </label>

              {thumbnailPreview ? (
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-black/[0.08] bg-[#f0eef4]">
                  {thumbnailPreview.startsWith("data:video/") ||
                  thumbnailPreview.endsWith(".mp4") ||
                  thumbnailPreview.endsWith(".mov") ||
                  thumbnailPreview.endsWith(".webm") ||
                  thumbnailPreview.endsWith(".ogg") ||
                  (thumbnailPreview.includes("/uploads/") &&
                    (thumbnailPreview.endsWith(".mp4") ||
                      thumbnailPreview.endsWith(".mov") ||
                      thumbnailPreview.endsWith(".webm") ||
                      thumbnailPreview.endsWith(".ogg"))) ? (
                    <video
                      src={thumbnailPreview}
                      controls
                      className="w-full h-full object-contain bg-black"
                    />
                  ) : (
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1.5 rounded-lg bg-white/90 border border-black/10 text-xs font-semibold text-[#475569] hover:bg-white cursor-pointer"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-1.5 rounded-lg bg-white/90 border border-black/10 text-[#b91c1c] hover:bg-white cursor-pointer"
                      aria-label="Remove cover media"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video rounded-2xl border-2 border-dashed border-black/[0.1] bg-[#fafafa] hover:border-[#fc362d]/40 hover:bg-[#fc362d]/[0.02] transition-all flex flex-col items-center justify-center gap-2 text-[#94a3b8] cursor-pointer"
                >
                  <FiImage className="w-8 h-8" />
                  <span className="text-xs font-semibold">Click to upload cover image/video</span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/ogg,video/quicktime,.mov"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {/* Demo video */}
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-2">
                Demo video <span className="text-[#94a3b8] font-normal">(YouTube link or upload direct MP4/WebM under 50 MB)</span>
              </label>

              {demoVideoUrl && (demoVideoUrl.startsWith("data:video/") || demoVideoUrl.includes("/uploads/courses/")) ? (
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-black/[0.08] bg-black">
                  <video
                    src={demoVideoUrl.startsWith("data:") ? demoVideoUrl : `http://localhost:3000${demoVideoUrl}`}
                    controls
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="px-2.5 py-1.5 rounded-lg bg-white/90 border border-black/10 text-xs font-semibold text-[#475569] hover:bg-white cursor-pointer"
                    >
                      Change Video
                    </button>
                    <button
                      type="button"
                      onClick={() => setDemoVideoUrl("")}
                      className="p-1.5 rounded-lg bg-white/90 border border-black/10 text-[#b91c1c] hover:bg-white cursor-pointer"
                      aria-label="Remove video"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      className={`${inputClass} flex-1`}
                      value={demoVideoUrl || ""}
                      onChange={(e) => setDemoVideoUrl(e.target.value)}
                      placeholder="e.g. https://www.youtube.com/embed/..."
                    />
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="px-4 py-2 border border-black/10 rounded-xl bg-[#fafafa] text-[#475569] hover:bg-[#f1f5f9] transition-colors cursor-pointer text-xs font-semibold whitespace-nowrap"
                    >
                      Upload File
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/ogg,video/quicktime,.mov"
                className="hidden"
                onChange={handleVideoChange}
              />
            </div>
          </div>

          {/* ── Skills & Outcomes ── */}
          <div className="border-t border-black/[0.08] pt-5">
            <SectionHeading
              title="Skills & Outcomes"
              description="What students will be able to do after completing this course"
              action={
                <button
                  type="button"
                  onClick={addOutcome}
                  className={`${secondaryBtnClass} !py-2 !px-3 inline-flex items-center gap-1`}
                >
                  <FiPlus className="w-3.5 h-3.5" /> Add point
                </button>
              }
            />
            <div className="space-y-2">
              {outcomes.map((outcome, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#fc362d] shrink-0" />
                  <input
                    className={`${inputClass} flex-1`}
                    value={outcome}
                    onChange={(e) => updateOutcome(i, e.target.value)}
                    placeholder={`e.g. Build production-ready REST APIs`}
                  />
                  <button
                    type="button"
                    onClick={() => removeOutcome(i)}
                    className="p-2 rounded-lg text-[#94a3b8] hover:text-[#b91c1c] hover:bg-[#fef2f2] cursor-pointer"
                    aria-label="Remove outcome"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── Training modules ── */}
          <div className="border-t border-black/[0.08] pt-5">
            <SectionHeading
              title="Training modules"
              description="What students will learn in each module"
              action={
                <button
                  type="button"
                  onClick={addModule}
                  className={`${secondaryBtnClass} !py-2 !px-3 inline-flex items-center gap-1`}
                >
                  <FiPlus className="w-3.5 h-3.5" /> Module
                </button>
              }
            />

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
                      onChange={(e) => updateModule(modIndex, { title: e.target.value })}
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
                          onChange={(e) => updateLearningItem(modIndex, itemIndex, e.target.value)}
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
