import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiBookOpen,
  FiChevronDown,
  FiChevronRight,
  FiLayers,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import axios from "axios";
import {
  WelcomeBanner,
  StatCards,
  Panel,
  PrimaryButton,
  SecondaryButton,
  Toast,
} from "../DashboardUI";
import { pageWrapClass, badgeClass } from "../dashboardTheme";
import { CourseFormModal } from "./CourseFormModal";
import { DepartmentFormModal } from "./DepartmentFormModal";

function formatFees(amount) {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

export const CourseSetup = () => {
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState({
    departments: 0,
    courses: 0,
    modules: 0,
  });
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [formOpen, setFormOpen] = useState(false);
  const [deptFormOpen, setDeptFormOpen] = useState(false);
  const [defaultDeptId, setDefaultDeptId] = useState("");
  const [toast, setToast] = useState("");
  const [deletingDeptId, setDeletingDeptId] = useState(null);
  const [flatDepartments, setFlatDepartments] = useState([]);

  const fetchCurriculum = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/curriculum");
      const depts = data?.departments ?? [];
      setDepartments(depts);
      setFlatDepartments(
        depts.map(({ id, name, code }) => ({ id, name, code })),
      );
      setStats(data?.stats ?? { departments: 0, courses: 0, modules: 0 });
      setExpanded((prev) => {
        const next = { ...prev };
        depts.forEach((d) => {
          if (next[d.id] === undefined) next[d.id] = true;
        });
        return next;
      });
    } catch {
      setDepartments([]);
      setFlatDepartments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurriculum();
  }, [fetchCurriculum]);

  const openCreate = (departmentId = "") => {
    setDefaultDeptId(departmentId);
    setFormOpen(true);
  };

  const handleFormSuccess = () => {
    setToast("Course created");
    fetchCurriculum();
    window.setTimeout(() => setToast(""), 4000);
  };

  const handleDeptSuccess = () => {
    setToast("Department created");
    fetchCurriculum();
    window.setTimeout(() => setToast(""), 4000);
  };

  const handleDeleteDepartment = async (dept) => {
    const courseCount = dept.courses?.length ?? 0;
    if (courseCount > 0) {
      setToast(
        `Remove ${courseCount} course(s) from this department before deleting`,
      );
      window.setTimeout(() => setToast(""), 5000);
      return;
    }

    const confirmed = window.confirm(
      `Delete department "${dept.name}" (${dept.code})? This cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingDeptId(dept.id);
    try {
      await axios.delete(`/api/admin/departments/${dept.id}`);
      setToast("Department removed");
      fetchCurriculum();
    } catch (err) {
      setToast(err.response?.data?.message || "Could not delete department");
    } finally {
      setDeletingDeptId(null);
      window.setTimeout(() => setToast(""), 4000);
    }
  };

  const toggleDept = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalModules = stats.modules ?? 0;

  return (
    <div className={pageWrapClass}>
      <CourseFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={handleFormSuccess}
        departments={flatDepartments}
        initialDepartmentId={defaultDeptId}
      />

      <DepartmentFormModal
        open={deptFormOpen}
        onClose={() => setDeptFormOpen(false)}
        onSuccess={handleDeptSuccess}
      />

      <WelcomeBanner
        badge="Corporate Structure"
        title="Company Divisions"
        description="Configure your organization's primary divisions, department codes, and linked programs."
        actions={
          <PrimaryButton type="button" onClick={() => setDeptFormOpen(true)}>
            <span className="inline-flex items-center gap-1.5">
              <FiPlus className="w-3.5 h-3.5" /> New department
            </span>
          </PrimaryButton>
        }
      />

      <StatCards
        stats={[
          {
            label: "Departments",
            value: String(stats.departments ?? 0),
            change: "Company divisions",
            icon: <FiLayers className="w-5 h-5" />,
          },
          {
            label: "Courses",
            value: String(stats.courses ?? 0),
            change: loading ? "Loading…" : "All programs",
            icon: <FiBookOpen className="w-5 h-5" />,
          },
          {
            label: "Training modules",
            value: String(totalModules),
            change: "Across all courses",
            icon: <FiLayers className="w-5 h-5" />,
          },
          {
            label: "Avg modules / course",
            value:
              stats.courses > 0
                ? (totalModules / stats.courses).toFixed(1)
                : "0",
            change: "Curriculum depth",
            icon: <FiBookOpen className="w-5 h-5" />,
          },
        ]}
      />

      {loading ? (
        <Panel>
          <p className="text-sm text-[#94a3b8] font-semibold py-8 text-center">
            Loading…
          </p>
        </Panel>
      ) : departments.length === 0 ? (
        <Panel>
          <p className="text-sm text-[#94a3b8] font-semibold py-6 text-center">
            No departments yet. Create one to organize your courses.
          </p>
          <div className="flex justify-center pb-2">
            <PrimaryButton type="button" onClick={() => setDeptFormOpen(true)}>
              <span className="inline-flex items-center gap-1.5">
                <FiPlus className="w-3.5 h-3.5" /> New department
              </span>
            </PrimaryButton>
          </div>
        </Panel>
      ) : (
        <div className="space-y-5">
          {departments.map((dept) => {
            const isOpen = expanded[dept.id] !== false;
            const courseCount = dept.courses?.length ?? 0;

            return (
              <Panel key={dept.id}>
                <div className="flex items-start justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => toggleDept(dept.id)}
                    className="flex-1 flex items-start gap-3 min-w-0 text-left cursor-pointer group"
                  >
                    <span className="mt-1 text-[#94a3b8] group-hover:text-[#0c0407] transition-colors">
                      {isOpen ? (
                        <FiChevronDown className="w-5 h-5" />
                      ) : (
                        <FiChevronRight className="w-5 h-5" />
                      )}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={badgeClass}>{dept.code}</span>
                        <h3 className="text-lg font-bold text-[#0c0407] tracking-tight">
                          {dept.name}
                        </h3>
                      </div>
                      {dept.description && (
                        <p className="text-xs text-[#636363] font-medium mt-1.5 max-w-2xl">
                          {dept.description}
                        </p>
                      )}
                      <p className="text-[11px] text-[#94a3b8] font-semibold mt-2">
                        {courseCount} course{courseCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </button>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <SecondaryButton
                      type="button"
                      onClick={() => openCreate(dept.id)}
                    >
                      <span className="inline-flex items-center gap-1">
                        <FiPlus className="w-3.5 h-3.5" /> Add course
                      </span>
                    </SecondaryButton>
                    <button
                      type="button"
                      onClick={() => handleDeleteDepartment(dept)}
                      disabled={deletingDeptId === dept.id}
                      title={
                        courseCount > 0
                          ? "Remove all courses before deleting this department"
                          : "Delete department"
                      }
                      className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-black/[0.08] text-[#94a3b8] hover:text-[#b91c1c] hover:border-[#b91c1c]/30 hover:bg-[#fef2f2] transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-5 border-t border-black/[0.06] pt-5">
                    {courseCount === 0 ? (
                      <p className="text-xs text-[#94a3b8] font-semibold py-4 text-center rounded-xl bg-[#fafafa] border border-dashed border-black/[0.08]">
                        No courses in this department yet.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {dept.courses.map((course) => (
                          <li key={course.id}>
                            <Link
                              to={`/dashboard/courses/${course.id}`}
                              className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-black/[0.08] bg-[#fafafa] hover:bg-white hover:border-[#fc362d]/25 hover:shadow-[0_4px_20px_rgba(252,54,45,0.08)] transition-all group"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-extrabold text-[#0c0407] group-hover:text-[#fc362d] transition-colors truncate">
                                  {course.title}
                                </p>
                                <p className="text-[11px] text-[#94a3b8] font-semibold mt-0.5">
                                  {course.duration_month} mo ·{" "}
                                  {formatFees(course.fees)}
                                  {course.module_count > 0 &&
                                    ` · ${course.module_count} module${course.module_count !== 1 ? "s" : ""}`}
                                </p>
                              </div>
                              <FiChevronRight className="w-5 h-5 text-[#94a3b8] group-hover:text-[#fc362d] shrink-0 transition-colors" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </Panel>
            );
          })}
        </div>
      )}

      <Toast message={toast} />
    </div>
  );
};

export default CourseSetup;
