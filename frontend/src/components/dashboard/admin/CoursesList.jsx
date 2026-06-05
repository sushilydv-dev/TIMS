import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBookOpen,
  FiEdit2,
  FiLayers,
  FiPlus,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";
import axios from "axios";
import {
  WelcomeBanner,
  StatCards,
  Panel,
  PanelHeader,
  PrimaryButton,
  SecondaryButton,
  Toast,
} from "../DashboardUI";
import { pageWrapClass, inputClass } from "../dashboardTheme";
import { CourseFormModal } from "./CourseFormModal";

function formatFees(amount) {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

export const CoursesList = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ courses: 0, modules: 0, avgFees: 0, avgDuration: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [fetchingDetailsId, setFetchingDetailsId] = useState(null);
  const [deletingCourseId, setDeletingCourseId] = useState(null);
  const [toast, setToast] = useState("");

  const fetchCurriculum = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/curriculum");
      const depts = data?.departments ?? [];
      setDepartments(depts.map(({ id, name, code }) => ({ id, name, code })));
      
      const allCourses = [];
      let totalFees = 0;
      let totalDuration = 0;

      depts.forEach((dept) => {
        (dept.courses ?? []).forEach((course) => {
          allCourses.push({
            ...course,
            department: {
              id: dept.id,
              name: dept.name,
              code: dept.code,
            },
          });
          totalFees += Number(course.fees || 0);
          totalDuration += Number(course.duration_month || 0);
        });
      });

      setCourses(allCourses);

      const courseCount = allCourses.length;
      setStats({
        courses: courseCount,
        modules: data?.stats?.modules ?? 0,
        avgFees: courseCount > 0 ? Math.round(totalFees / courseCount) : 0,
        avgDuration: courseCount > 0 ? Number((totalDuration / courseCount).toFixed(1)) : 0,
      });
    } catch {
      setCourses([]);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurriculum();
  }, [fetchCurriculum]);

  const handleCreateNew = () => {
    setEditCourse(null);
    setFormOpen(true);
  };

  const handleEditClick = async (course, e) => {
    e.stopPropagation();
    setFetchingDetailsId(course.id);
    try {
      const { data } = await axios.get(`/api/admin/courses/${course.id}`);
      setEditCourse(data);
      setFormOpen(true);
    } catch (err) {
      setToast("Failed to fetch course details");
      window.setTimeout(() => setToast(""), 4000);
    } finally {
      setFetchingDetailsId(null);
    }
  };

  const handleDeleteClick = async (course, e) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      `Delete course "${course.title}"? This will permanently remove its modules and batches.`,
    );
    if (!confirmed) return;

    setDeletingCourseId(course.id);
    try {
      await axios.delete(`/api/admin/courses/${course.id}`);
      setToast("Course deleted successfully");
      fetchCurriculum();
    } catch (err) {
      setToast(err.response?.data?.message || "Could not delete course");
    } finally {
      setDeletingCourseId(null);
      window.setTimeout(() => setToast(""), 4000);
    }
  };

  const handleFormSuccess = () => {
    setToast(editCourse ? "Course updated" : "Course created");
    fetchCurriculum();
    window.setTimeout(() => setToast(""), 4000);
  };

  const filteredCourses = courses.filter((c) => {
    const term = search.toLowerCase();
    return (
      c.title?.toLowerCase().includes(term) ||
      c.department?.name?.toLowerCase().includes(term) ||
      c.department?.code?.toLowerCase().includes(term)
    );
  });

  return (
    <div className={pageWrapClass}>
      <CourseFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={handleFormSuccess}
        departments={departments}
        editCourse={editCourse}
      />

      <WelcomeBanner
        badge="Courses Setup"
        title="Master Curriculum"
        description="View and configure all programs, edit syllabi, and set up teaching modules."
        actions={
          <PrimaryButton type="button" onClick={handleCreateNew}>
            <span className="inline-flex items-center gap-1.5">
              <FiPlus className="w-3.5 h-3.5" /> New Course
            </span>
          </PrimaryButton>
        }
      />

      <StatCards
        stats={[
          {
            label: "Total Programs",
            value: String(stats.courses),
            change: loading ? "Loading…" : "All departments",
            icon: <FiBookOpen className="w-5 h-5" />,
          },
          {
            label: "Total Modules",
            value: String(stats.modules),
            change: "Across all courses",
            icon: <FiLayers className="w-5 h-5" />,
          },
          {
            label: "Avg Duration",
            value: `${stats.avgDuration} mo`,
            change: "Course length average",
            icon: <FiBookOpen className="w-5 h-5" />,
          },
          {
            label: "Avg Tuition Fee",
            value: formatFees(stats.avgFees),
            change: "Cost per program",
            icon: <FiLayers className="w-5 h-5" />,
          },
        ]}
      />

      <Panel>
        <PanelHeader
          eyebrow="Centralized Curriculum"
          title="All courses"
          action={
            <div className="relative w-full sm:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <input
                type="search"
                placeholder="Search by title or department…"
                className={`${inputClass} pl-9`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          }
        />

        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.08] text-[#94a3b8] uppercase tracking-wider">
                <th className="pb-3 font-bold px-2">Course Title</th>
                <th className="pb-3 font-bold px-2">Department</th>
                <th className="pb-3 font-bold px-2">Duration</th>
                <th className="pb-3 font-bold px-2">Tuition Fees</th>
                <th className="pb-3 font-bold px-2">Modules Count</th>
                <th className="pb-3 font-bold px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#94a3b8] font-semibold">
                    Loading courses…
                  </td>
                </tr>
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#94a3b8] font-semibold">
                    {search ? "No courses match your search" : "No courses created yet."}
                  </td>
                </tr>
              ) : (
                filteredCourses.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => navigate(`/dashboard/courses/${row.id}`)}
                    className="border-b border-black/[0.04] hover:bg-[#fafafa] transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-2">
                      <p className="font-extrabold text-[#0c0407] group-hover:text-[#fc362d] transition-colors">
                        {row.title}
                      </p>
                    </td>
                    <td className="py-3.5 px-2 font-bold text-[#475569]">
                      <span className="text-[10px] bg-[#f1f5f9] px-2 py-0.5 rounded border border-black/[0.05] mr-1.5 font-extrabold text-[#64748b]">
                        {row.department?.code}
                      </span>
                      {row.department?.name}
                    </td>
                    <td className="py-3.5 px-2 font-bold text-[#475569]">
                      {row.duration_month} months
                    </td>
                    <td className="py-3.5 px-2 font-bold text-[#475569]">
                      {formatFees(row.fees)}
                    </td>
                    <td className="py-3.5 px-2 font-bold text-[#475569]">
                      {row.module_count} modules
                    </td>
                    <td className="py-3.5 px-2 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleEditClick(row, e)}
                          disabled={fetchingDetailsId === row.id}
                          className="p-2 rounded-lg border border-black/10 text-[#475569] hover:bg-[#f1f5f9] cursor-pointer"
                          title="Edit course"
                        >
                          <FiEdit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteClick(row, e)}
                          disabled={deletingCourseId === row.id}
                          className="p-2 rounded-lg border border-black/10 text-[#94a3b8] hover:text-[#b91c1c] hover:border-[#b91c1c]/30 hover:bg-[#fef2f2] cursor-pointer"
                          title="Delete course"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Toast message={toast} />
    </div>
  );
};

export default CoursesList;
