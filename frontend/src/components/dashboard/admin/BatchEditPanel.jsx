import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiUsers, FiX, FiSearch, FiChevronDown, FiChevronUp, FiTrash2, FiArrowRight, FiEye } from "react-icons/fi";
import axios from "axios";
import { inputClass, primaryBtnClass, secondaryBtnClass } from "../dashboardTheme";
import { BasicProfile, useBasicProfile } from "../BasicProfile";
import { ProfileAvatar } from "../ProfileAvatar";
import { BatchStudentPickerPanel } from "./BatchStudentPickerPanel";
import { StudentDetailPanel } from "./StudentDetailPanel";

export function BatchEditPanel({ open, batch, courseTitle, onClose, onSuccess }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const studentIdParam = searchParams.get("studentId");

  const [batchName, setBatchName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedTrainers, setSelectedTrainers] = useState([]);
  const [trainerSearch, setTrainerSearch] = useState("");
  const [trainerDropdownOpen, setTrainerDropdownOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [enrolledPreview, setEnrolledPreview] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const {
    basicProfileOpen,
    basicProfileType,
    basicProfileId,
    openBasicProfile,
    closeBasicProfile,
  } = useBasicProfile();

  useEffect(() => {
    if (studentIdParam) {
      setSelectedStudentId(studentIdParam);
    } else {
      setSelectedStudentId(null);
    }
  }, [studentIdParam]);

  const handleSelectStudent = (id) => {
    setSelectedStudentId(id);
    setSearchParams((prev) => {
      prev.set("studentId", id);
      return prev;
    });
  };

  const handleCloseStudent = () => {
    setSelectedStudentId(null);
    setSearchParams((prev) => {
      prev.delete("studentId");
      return prev;
    });
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (selectedStudentId) handleCloseStudent();
        else if (pickerOpen) setPickerOpen(false);
        else onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, pickerOpen, selectedStudentId]);

  useEffect(() => {
    if (!open || !batch) {
      setError("");
      setLoading(false);
      setPickerOpen(false);
      setSelectedStudentId(null);
      setExpandedStudentId(null);
      setTrainerDropdownOpen(false);
      setTrainerSearch("");
      return;
    }

    const initial = batch.students || [];
    setBatchName(batch.batch_name || "");
    setStartDate(batch.start_date || "");
    setEndDate(batch.end_date || "");
    
    // Handle multiple trainers
    const batchTrainers = batch.trainers || [];
    if (batch.trainer && !batchTrainers.find(t => t.id === batch.trainer.id)) {
      batchTrainers.push(batch.trainer);
    }
    setSelectedTrainers(batchTrainers.map(t => ({ id: t.id, name: t.name, specialization: t.specialization, email: t.email })));
    
    setSelectedStudents(initial.map((s) => s.id));
    setEnrolledPreview(initial);

    const loadTrainers = async () => {
      try {
        const { data } = await axios.get("/api/admin/trainers");
        setTrainers(data || []);
      } catch {
        setTrainers([]);
      }
    };

    loadTrainers();
  }, [open, batch]);

  const handleSelectionChange = (ids, toggledStudent) => {
    setSelectedStudents(ids);
    setEnrolledPreview((prev) => {
      const byId = new Map(prev.map((s) => [s.id, s]));

      if (toggledStudent) {
        if (ids.includes(toggledStudent.id)) {
          byId.set(toggledStudent.id, {
            id: toggledStudent.id,
            name: toggledStudent.name,
            email: toggledStudent.email,
            fees: toggledStudent.fees,
          });
        } else {
          byId.delete(toggledStudent.id);
        }
      }

      return ids.map((id) => byId.get(id)).filter(Boolean);
    });
  };

  const handlePickerClose = () => {
    setPickerOpen(false);
  };

  if (!open || !batch) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.put(`/api/admin/batches/${batch.id}`, {
        batch_name: batchName,
        trainer_ids: selectedTrainers.map(t => t.id),
        start_date: startDate,
        end_date: endDate,
        student_ids: selectedStudents,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update batch");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrainer = (trainer) => {
    if (!selectedTrainers.find(t => t.id === trainer.id)) {
      setSelectedTrainers([...selectedTrainers, trainer]);
    }
    setTrainerSearch("");
    setTrainerDropdownOpen(false);
  };

  const handleRemoveTrainer = (trainerId) => {
    setSelectedTrainers(selectedTrainers.filter(t => t.id !== trainerId));
  };

  const filteredTrainers = trainers.filter(t => {
    const search = trainerSearch.toLowerCase();
    return (
      t.name?.toLowerCase().includes(search) ||
      t.email?.toLowerCase().includes(search) ||
      t.specialization?.toLowerCase().includes(search)
    ) && !selectedTrainers.find(st => st.id === t.id);
  });

  const toggleStudentExpand = (studentId) => {
    setExpandedStudentId(expandedStudentId === studentId ? null : studentId);
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      await axios.delete(`/api/admin/batches/${batch.id}/students/${studentId}`);
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
      setEnrolledPreview(enrolledPreview.filter(s => s.id !== studentId));
      setExpandedStudentId(null);
    } catch (err) {
      setError(err.response?.data?.message || "Could not remove student");
    }
  };

  const handleReassignStudent = (studentId) => {
    // TODO: Implement reassign modal
    console.log("Reassign student:", studentId);
  };

  const handleViewStudentProfile = (studentId) => {
    setSelectedStudentId(studentId);
    setSearchParams((prev) => {
      prev.set("studentId", studentId);
      return prev;
    });
  };

  return (
    <>
      <BasicProfile
        open={basicProfileOpen}
        profileType={basicProfileType}
        profileId={basicProfileId}
        onClose={closeBasicProfile}
      />
      <BatchStudentPickerPanel
        open={pickerOpen}
        batchId={batch.id}
        selectedIds={selectedStudents}
        onSelectionChange={handleSelectionChange}
        onClose={handlePickerClose}
        onOpenStudentProfile={(studentId) => openBasicProfile("student", studentId)}
      />

      <StudentDetailPanel
        open={Boolean(selectedStudentId)}
        studentId={selectedStudentId}
        onClose={handleCloseStudent}
      />

      <div className="fixed inset-0 z-[100] flex justify-end" role="dialog" aria-modal="true">
        <button
          type="button"
          className="absolute inset-0 bg-[#0c0407]/40 backdrop-blur-sm cursor-default"
          aria-label="Close"
          onClick={onClose}
        />

        <div
          className="relative w-full max-w-md h-full bg-white border-l border-black/[0.08] shadow-[-12px_0_40px_rgba(0,0,0,0.08)] flex flex-col animate-[slideInRight_0.25s_ease-out]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3 p-5 sm:p-6 border-b border-black/[0.06] shrink-0">
            <div className="min-w-0 pr-2">
              <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">
                Edit batch
              </span>
              <h2 className="text-xl font-bold text-[#0c0407] mt-1 tracking-tight truncate">
                {batch.batch_name}
              </h2>
              {courseTitle && (
                <p className="text-xs text-[#636363] font-medium mt-1 truncate">{courseTitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl border border-black/10 bg-[#fafafa] text-[#475569] flex items-center justify-center hover:bg-[#f1f5f9] cursor-pointer shrink-0"
              aria-label="Close"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          <form
            id="batch-edit-form"
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1.5">Batch name</label>
              <input
                required
                className={inputClass}
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1.5">Start date</label>
                <input
                  type="date"
                  required
                  className={inputClass}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1.5">End date</label>
                <input
                  type="date"
                  required
                  className={inputClass}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1.5">Trainers</label>
              <div className="relative">
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedTrainers.map((trainer) => (
                    <div
                      key={trainer.id}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#eff6ff] border border-[#bfdbfe] rounded-lg text-xs font-semibold text-[#0c0407]"
                    >
                      <ProfileAvatar
                        src={trainer.profile_img}
                        name={trainer.name}
                        profileType="trainer"
                        size="sm"
                        onClick={() => openBasicProfile("trainer", trainer.id)}
                      />
                      <span>{trainer.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTrainer(trainer.id)}
                        className="text-[#64748b] hover:text-[#b91c1c] transition-colors"
                      >
                        <FiX className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                  <input
                    type="text"
                    placeholder="Search trainers by name or email..."
                    className={`${inputClass} pl-9`}
                    value={trainerSearch}
                    onChange={(e) => {
                      setTrainerSearch(e.target.value);
                      setTrainerDropdownOpen(true);
                    }}
                    onFocus={() => setTrainerDropdownOpen(true)}
                  />
                  {trainerDropdownOpen && (
                    <button
                      type="button"
                      onClick={() => setTrainerDropdownOpen(false)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#0c0407]"
                    >
                      <FiChevronUp className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {trainerDropdownOpen && trainerSearch && filteredTrainers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-black/[0.08] rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {filteredTrainers.map((trainer) => (
                      <button
                        key={trainer.id}
                        type="button"
                        onClick={() => handleAddTrainer(trainer)}
                        className="w-full px-4 py-2.5 text-left hover:bg-[#f8fafc] transition-colors border-b border-black/[0.04] last:border-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-[#0c0407]">{trainer.name}</p>
                            <p className="text-[10px] text-[#636363]">{trainer.email}</p>
                          </div>
                          <span className="text-[10px] text-[#94a3b8]">{trainer.specialization}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <label className="block text-xs font-bold text-[#475569]">
                  Total students enrolled: {selectedStudents.length}
                </label>
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className={`${secondaryBtnClass} inline-flex items-center gap-1.5 text-xs py-2 px-3`}
                >
                  <FiUsers className="w-3.5 h-3.5" />
                  Manage enrollments
                </button>
              </div>

              {enrolledPreview.length === 0 ? (
                <p className="text-xs text-[#94a3b8] font-semibold py-4 text-center rounded-xl bg-[#fafafa] border border-dashed border-black/[0.08]">
                  No students enrolled. Open enrollments to add students.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                  {enrolledPreview.map((s) => (
                    <div
                      key={s.id}
                      className={`relative bg-white border border-black/[0.06] rounded-xl overflow-hidden transition-all ${
                        expandedStudentId === s.id ? 'ring-2 ring-[#3b82f6] shadow-md' : 'hover:border-black/15 hover:shadow-sm'
                      }`}
                    >
                      {/* Collapsed state */}
                      <div
                        onClick={() => toggleStudentExpand(s.id)}
                        className="p-3 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <ProfileAvatar
                            src={s.profile_img}
                            name={s.name}
                            profileType="student"
                            size="md"
                            onClick={(event) => {
                              event.stopPropagation();
                              openBasicProfile("student", s.id);
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#0c0407] truncate">{s.name}</p>
                            <p className="text-[10px] text-[#636363] truncate">{s.student_code || s.id}</p>
                          </div>
                          <button
                            type="button"
                            className="text-[#94a3b8] hover:text-[#0c0407] transition-colors shrink-0"
                          >
                            {expandedStudentId === s.id ? (
                              <FiChevronUp className="w-4 h-4" />
                            ) : (
                              <FiChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded state */}
                      {expandedStudentId === s.id && (
                        <div className="px-3 pb-3 pt-0 border-t border-black/[0.06] bg-[#fafafa]">
                          <div className="pt-3 space-y-2">
                            <button
                              type="button"
                              onClick={() => handleViewStudentProfile(s.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#0c0407] bg-white border border-black/[0.08] rounded-lg hover:bg-[#f8fafc] transition-colors"
                            >
                              <FiEye className="w-3.5 h-3.5" />
                              View student profile
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReassignStudent(s.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#0c0407] bg-white border border-black/[0.08] rounded-lg hover:bg-[#f8fafc] transition-colors"
                            >
                              <FiArrowRight className="w-3.5 h-3.5" />
                              Reassign to different batch
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveStudent(s.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#b91c1c] bg-[#fef2f2] border border-[#b91c1c]/20 rounded-lg hover:bg-[#fee2e2] transition-colors"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                              Remove from batch
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <p className="text-xs font-semibold text-[#b91c1c] bg-[#fef2f2] border border-[#b91c1c]/20 rounded-xl px-3 py-2">
                {error}
              </p>
            )}
          </form>

          <div className="flex flex-wrap gap-3 p-5 sm:p-6 border-t border-black/[0.06] shrink-0 bg-white">
            <button
              type="submit"
              form="batch-edit-form"
              disabled={loading || trainers.length === 0}
              className={`${primaryBtnClass} flex-1 min-w-[140px] disabled:opacity-50`}
            >
              {loading ? "Saving…" : "Save changes"}
            </button>
            <button type="button" onClick={onClose} disabled={loading} className={secondaryBtnClass}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default BatchEditPanel;
