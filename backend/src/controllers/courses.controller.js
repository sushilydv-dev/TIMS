import { Op } from "sequelize";
import Department from "../models/department.js";
import Course from "../models/course.js";
import CourseModule from "../models/courseModule.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function normalizeModules(modules) {
  if (!Array.isArray(modules)) return [];

  return modules
    .map((mod, index) => ({
      title: String(mod?.title || "").trim(),
      sequence_order: Number(mod?.sequence_order) || index + 1,
      learning_items: Array.isArray(mod?.learning_items)
        ? mod.learning_items
            .map((item) => String(item || "").trim())
            .filter(Boolean)
        : [],
    }))
    .filter((mod) => mod.title);
}

function formatCourse(course, modules = []) {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    duration_month: course.duration_month,
    fees: course.fees,
    department_id: course.department_id,
    created_by: course.created_by,
    thumbnail_url: course.thumbnail_url || null,
    demo_video_url: course.demo_video_url || null,
    outcomes: Array.isArray(course.outcomes) ? course.outcomes : [],
    modules: modules.map((m) => ({
      id: m.id,
      title: m.title,
      sequence_order: m.sequence_order,
      learning_items: m.learning_items || [],
    })),
  };
}

async function loadCourseWithModules(courseId) {
  const course = await Course.findByPk(courseId);
  if (!course) return null;

  const modules = await CourseModule.findAll({
    where: { course_id: courseId },
    order: [["sequence_order", "ASC"]],
  });

  return formatCourse(course, modules);
}

async function replaceCourseModules(courseId, modules) {
  await CourseModule.destroy({ where: { course_id: courseId } });

  if (modules.length === 0) return;

  await CourseModule.bulkCreate(
    modules.map((mod) => ({
      course_id: courseId,
      title: mod.title,
      sequence_order: mod.sequence_order,
      learning_items: mod.learning_items,
    })),
  );
}

function formatCourseSummary(course) {
  return {
    id: course.id,
    title: course.title,
    duration_month: course.duration_month,
    fees: course.fees,
    module_count: Number(course.module_count) || 0,
    thumbnail_url: course.thumbnail_url || null,
    demo_video_url: course.demo_video_url || null,
  };
}

export const getCurriculum = asyncHandler(async (_req, res) => {
  const departments = await Department.findAll({
    order: [["name", "ASC"]],
    include: [
      {
        model: Course,
        include: [
          {
            model: CourseModule,
            attributes: ["id"],
            separate: true,
          },
        ],
        order: [["title", "ASC"]],
      },
    ],
  });

  const allCourses = await Course.findAll();
  const allModules = await CourseModule.findAll();

  const payload = departments.map((dept) => ({
    id: dept.id,
    name: dept.name,
    code: dept.code,
    description: dept.description,
    courses: (dept.Courses || []).map((course) =>
      formatCourseSummary({
        ...course.toJSON(),
        module_count: course.CourseModules?.length ?? 0,
      }),
    ),
  }));

  res.json({
    departments: payload,
    stats: {
      departments: departments.length,
      courses: allCourses.length,
      modules: allModules.length,
    },
  });
});

export const listDepartments = asyncHandler(async (_req, res) => {
  const departments = await Department.findAll({ order: [["name", "ASC"]] });
  res.json(departments);
});

export const createDepartment = asyncHandler(async (req, res) => {
  const { name, code, description } = req.body;

  if (!name?.trim() || !code?.trim()) {
    res.status(400);
    throw new Error("Department name and code are required");
  }

  const existing = await Department.findOne({
    where: {
      [Op.or]: [
        { name: name.trim() },
        { code: code.trim().toUpperCase() },
      ],
    },
  });

  if (existing) {
    res.status(400);
    throw new Error("Department with this name or code already exists");
  }

  const department = await Department.create({
    name: name.trim(),
    code: code.trim().toUpperCase(),
    description: description?.trim() || null,
  });

  res.status(201).json(department);
});

export const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByPk(req.params.id);

  if (!department) {
    res.status(404);
    throw new Error("Department not found");
  }

  const courseCount = await Course.count({
    where: { department_id: department.id },
  });

  if (courseCount > 0) {
    res.status(400);
    throw new Error(
      `Cannot delete department with ${courseCount} course(s). Move or delete those courses first.`,
    );
  }

  await department.destroy();
  res.json({ message: "Department deleted successfully" });
});

export const getCourse = asyncHandler(async (req, res) => {
  const course = await loadCourseWithModules(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  const row = await Course.findByPk(req.params.id, {
    include: [{ model: Department, attributes: ["id", "name", "code"] }],
  });

  res.json({
    ...course,
    department: row?.Department
      ? {
          id: row.Department.id,
          name: row.Department.name,
          code: row.Department.code,
        }
      : null,
  });
});

export const createCourse = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    department_id,
    duration_month,
    fees,
    modules,
    thumbnail_url,
    demo_video_url,
    outcomes,
  } = req.body;

  if (!title?.trim() || !department_id) {
    res.status(400);
    throw new Error("Course title and department are required");
  }

  const department = await Department.findByPk(department_id);
  if (!department) {
    res.status(400);
    throw new Error("Department not found");
  }

  const normalizedModules = normalizeModules(modules);
  const normalizedOutcomes = Array.isArray(outcomes)
    ? outcomes.map((o) => String(o || "").trim()).filter(Boolean)
    : [];

  const course = await Course.create({
    title: title.trim(),
    description: description?.trim() || "",
    department_id,
    duration_month: Number(duration_month) || 1,
    fees: Number(fees) || 0,
    created_by: req.user?.id || null,
    thumbnail_url: thumbnail_url || null,
    demo_video_url: demo_video_url?.trim() || null,
    outcomes: normalizedOutcomes,
  });

  await replaceCourseModules(course.id, normalizedModules);

  const full = await loadCourseWithModules(course.id);
  res.status(201).json(full);
});

export const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  const {
    title,
    description,
    department_id,
    duration_month,
    fees,
    modules,
    thumbnail_url,
    demo_video_url,
    outcomes,
  } = req.body;

  if (department_id) {
    const department = await Department.findByPk(department_id);
    if (!department) {
      res.status(400);
      throw new Error("Department not found");
    }
    course.department_id = department_id;
  }

  if (title !== undefined) course.title = title.trim();
  if (description !== undefined) course.description = description.trim();
  if (duration_month !== undefined) {
    course.duration_month = Number(duration_month) || 1;
  }
  if (fees !== undefined) course.fees = Number(fees) || 0;
  if (thumbnail_url !== undefined) course.thumbnail_url = thumbnail_url || null;
  if (demo_video_url !== undefined) course.demo_video_url = demo_video_url?.trim() || null;
  if (outcomes !== undefined) {
    course.outcomes = Array.isArray(outcomes)
      ? outcomes.map((o) => String(o || "").trim()).filter(Boolean)
      : [];
  }

  await course.save();

  if (modules !== undefined) {
    await replaceCourseModules(course.id, normalizeModules(modules));
  }

  const full = await loadCourseWithModules(course.id);
  res.json(full);
});

export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  await course.destroy();
  res.json({ message: "Course deleted successfully" });
});
