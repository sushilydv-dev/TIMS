import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiBookOpen,
  FiEdit2,
  FiLayers,
  FiPlus,
  FiUsers,
} from "react-icons/fi";
import axios from "axios";
import {
  Panel,
  PanelHeader,
  PrimaryButton,
  SecondaryButton,
  Toast,
} from "../../components/dashboard/DashboardUI";
import { pageWrapClass, badgeClass } from "../../components/dashboard/dashboardTheme";
import { CourseFormModal } from "../../components/dashboard/admin/CourseFormModal";
import { BatchFormModal } from "../../components/dashboard/admin/BatchFormModal";
import { BatchEditPanel } from "../../components/dashboard/admin/BatchEditPanel";

function formatFees(amount) {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

export const CourseDetail = () => {
  const { courseId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [course, setCourse] = useState(null);
  const [batches, setBatches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [editBatch, setEditBatch] = useState(null);
  const [toast, setToast] = useState("");

  const batchIdParam = searchParams.get("batchId");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [courseRes, batchesRes, deptRes] = await Promise.all([
        axios.get(`/api/admin/courses/${courseId}`),
        axios.get(`/api/admin/courses/${courseId}/batches`),
        axios.get("/api/admin/departments"),
      ]);
      setCourse(courseRes.data);
      setBatches(batchesRes.data || []);
      setDepartments(deptRes.data || []);
    } catch {
      setCourse(null);
      setBatches([]);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (batches.length > 0 && batchIdParam) {
      const matching = batches.find((b) => b.id === batchIdParam);
      if (matching) {
        setEditBatch(matching);
      }
    }
  }, [batches, batchIdParam]);

  const handleOpenBatch = (batch) => {
    setEditBatch(batch);
    setSearchParams((prev) => {
      prev.set("batchId", batch.id);
      return prev;
    });
  };

  const handleCloseBatch = () => {
    setEditBatch(null);
    setSearchParams((prev) => {
      prev.delete("batchId");
      prev.delete("studentId");
      return prev;
    });
  };

  const handleEditSuccess = () => {
    setToast("Course updated");
    load();
    window.setTimeout(() => setToast(""), 4000);
  };

  const handleBatchSuccess = () => {
    setToast("Batch created");
    load();
    window.setTimeout(() => setToast(""), 4000);
  };

  const handleBatchEditSuccess = () => {
    setToast("Batch updated");
    load();
    window.setTimeout(() => setToast(""), 4000);
  };

  if (loading) {
    return (
      <div className={pageWrapClass}>
        <p className="text-sm text-[#94a3b8] font-semibold py-12 text-center">Loading course…</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className={pageWrapClass}>
        <Panel>
          <p className="text-sm text-[#b91c1c] font-semibold">Course not found.</p>
          <Link
            to="/dashboard/courses"
            className="inline-flex items-center gap-2 mt-4 text-sm font-bold text-[#fc362d]"
          >
            <FiArrowLeft className="w-4 h-4" /> Back to courses
          </Link>
        </Panel>
      </div>
    );
  }

  return (
    <div className={pageWrapClass}>
      <CourseFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSuccess={handleEditSuccess}
        departments={departments}
        editCourse={course}
      />

      <BatchFormModal
        open={batchOpen}
        onClose={() => setBatchOpen(false)}
        onSuccess={handleBatchSuccess}
        courseId={course.id}
        courseTitle={course.title}
      />

      <BatchEditPanel
        open={Boolean(editBatch)}
        batch={editBatch}
        courseTitle={course.title}
        onClose={handleCloseBatch}
        onSuccess={handleBatchEditSuccess}
      />

      <Link
        to="/dashboard/courses"
        className="inline-flex items-center gap-2 text-xs font-bold text-[#64748b] hover:text-[#fc362d] transition-colors w-fit"
      >
        <FiArrowLeft className="w-4 h-4" />
        Back to courses
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mt-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {course.department?.code && (
              <span className={badgeClass}>{course.department.code}</span>
            )}
            <span className="text-[11px] font-semibold text-[#94a3b8]">
              {course.duration_month} mo · {formatFees(course.fees)}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0c0407] tracking-tight">
            {course.title}
          </h1>
          {course.department?.name && (
            <p className="text-sm text-[#636363] font-medium mt-1">{course.department.name}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <PrimaryButton type="button" onClick={() => setEditOpen(true)}>
            <span className="inline-flex items-center gap-1.5">
              <FiEdit2 className="w-3.5 h-3.5" /> Edit course
            </span>
          </PrimaryButton>
          <SecondaryButton type="button" onClick={() => setBatchOpen(true)}>
            <span className="inline-flex items-center gap-1.5">
              <FiPlus className="w-3.5 h-3.5" /> New batch
            </span>
          </SecondaryButton>
        </div>
      </div>

      <Panel className="mt-6">
        <PanelHeader eyebrow="Overview" title="Course description" />
        <p className="text-sm text-[#636363] font-medium leading-relaxed whitespace-pre-wrap">
          {course.description || "No description provided."}
        </p>
      </Panel>

      <Panel>
        <PanelHeader
          eyebrow="Curriculum"
          title={`Training modules (${course.modules?.length || 0})`}
        />
        {course.modules?.length ? (
          <div className="space-y-3">
            {course.modules.map((mod, idx) => (
              <div
                key={mod.id || idx}
                className="rounded-2xl border border-black/[0.08] bg-[#fafafa] p-4"
              >
                <p className="text-sm font-bold text-[#0c0407]">
                  {idx + 1}. {mod.title}
                </p>
                {mod.learning_items?.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {mod.learning_items.map((item, i) => (
                      <li key={i} className="text-xs text-[#64748b] font-medium flex gap-2">
                        <span className="text-[#fc362d]">·</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#94a3b8] font-semibold">No modules defined yet.</p>
        )}
      </Panel>

      <Panel>
        <PanelHeader
          eyebrow="Cohorts"
          title={`Batches (${batches.length})`}
          action={
            <PrimaryButton type="button" onClick={() => setBatchOpen(true)}>
              <span className="inline-flex items-center gap-1.5">
                <FiPlus className="w-3.5 h-3.5" /> New batch
              </span>
            </PrimaryButton>
          }
        />

        {batches.length === 0 ? (
          <p className="text-xs text-[#94a3b8] font-semibold py-6 text-center rounded-xl bg-[#fafafa] border border-dashed border-black/[0.08]">
            No batches yet. Create one to assign a trainer and enroll students.
          </p>
        ) : (
          <div className="space-y-4">
            {batches.map((batch) => (
              <button
                key={batch.id}
                type="button"
                onClick={() => handleOpenBatch(batch)}
                className="w-full text-left rounded-2xl border border-black/[0.08] p-4 sm:p-5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:border-[#fc362d]/20 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fc362d]/40"
              >
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <h3 className="text-base font-extrabold text-[#0c0407] flex items-center gap-2">
                      <FiLayers className="w-4 h-4 text-[#94a3b8]" />
                      {batch.batch_name}
                    </h3>
                    <p className="text-[11px] text-[#94a3b8] font-semibold mt-1">
                      {batch.start_date} → {batch.end_date}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-[#475569] bg-[#f1f5f9] px-3 py-1 rounded-lg">
                    {batch.student_count} student{batch.student_count !== 1 ? "s" : ""}
                  </span>
                </div>

                {batch.trainer && (
                  <div className="mt-4 flex items-start gap-2 text-xs">
                    <FiBookOpen className="w-4 h-4 text-[#94a3b8] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[#0c0407]">Trainer: {batch.trainer.name}</p>
                      <p className="text-[#94a3b8] font-semibold">{batch.trainer.specialization}</p>
                    </div>
                  </div>
                )}

                {batch.students?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2 flex items-center gap-1">
                      <FiUsers className="w-3.5 h-3.5" /> Enrolled students
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {batch.students.map((s) => (
                        <span
                          key={s.id}
                          className="text-[11px] font-semibold text-[#475569] bg-[#fafafa] border border-black/[0.06] px-2.5 py-1 rounded-lg"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-[10px] font-bold text-[#fc362d] mt-4 uppercase tracking-wider">
                  Click to edit trainer, students, or dates
                </p>
              </button>
            ))}
          </div>
        )}
      </Panel>

      <Toast message={toast} />
    </div>
  );
};

export default CourseDetail;
