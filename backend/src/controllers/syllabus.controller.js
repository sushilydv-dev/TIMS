import Syllabus from "../models/syllabus.js";
import CourseModule from "../models/courseModule.js";
import Course from "../models/course.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new syllabus topic
export const createSyllabus = asyncHandler(async (req, res) => {
  const { course_id, topic_name, description, sequence_order } = req.body;

  const syllabus = await Syllabus.create({
    course_id,
    topic_name,
    description,
    sequence_order,
  });

  res.status(201).json({
    success: true,
    data: syllabus,
  });
});

// Get all syllabus topics for a course
export const getSyllabusByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const syllabus = await Syllabus.findAll({
    where: { course_id: courseId },
    order: [["sequence_order", "ASC"]],
  });

  res.status(200).json({
    success: true,
    data: syllabus,
  });
});

// Get a single syllabus topic
export const getSyllabusById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const syllabus = await Syllabus.findByPk(id);

  if (!syllabus) {
    return res.status(404).json({
      success: false,
      message: "Syllabus topic not found",
    });
  }

  res.status(200).json({
    success: true,
    data: syllabus,
  });
});

// Update a syllabus topic
export const updateSyllabus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { topic_name, description, sequence_order } = req.body;

  const syllabus = await Syllabus.findByPk(id);

  if (!syllabus) {
    return res.status(404).json({
      success: false,
      message: "Syllabus topic not found",
    });
  }

  await syllabus.update({
    topic_name: topic_name || syllabus.topic_name,
    description: description || syllabus.description,
    sequence_order: sequence_order || syllabus.sequence_order,
  });

  res.status(200).json({
    success: true,
    data: syllabus,
  });
});

// Delete a syllabus topic
export const deleteSyllabus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const syllabus = await Syllabus.findByPk(id);

  if (!syllabus) {
    return res.status(404).json({
      success: false,
      message: "Syllabus topic not found",
    });
  }

  await syllabus.destroy();

  res.status(200).json({
    success: true,
    message: "Syllabus topic deleted successfully",
  });
});

// Course Module Controllers

// Create a course module
export const createCourseModule = asyncHandler(async (req, res) => {
  const { course_id, title, sequence_order, learning_items } = req.body;

  const module = await CourseModule.create({
    course_id,
    title,
    sequence_order: sequence_order || 1,
    learning_items: learning_items || [],
  });

  res.status(201).json({
    success: true,
    data: module,
  });
});

// Get all modules for a course
export const getModulesByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const modules = await CourseModule.findAll({
    where: { course_id: courseId },
    order: [["sequence_order", "ASC"]],
  });

  res.status(200).json({
    success: true,
    data: modules,
  });
});

// Get a single module
export const getModuleById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const module = await CourseModule.findByPk(id);

  if (!module) {
    return res.status(404).json({
      success: false,
      message: "Module not found",
    });
  }

  res.status(200).json({
    success: true,
    data: module,
  });
});

// Update a module
export const updateCourseModule = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, sequence_order, learning_items } = req.body;

  const module = await CourseModule.findByPk(id);

  if (!module) {
    return res.status(404).json({
      success: false,
      message: "Module not found",
    });
  }

  await module.update({
    title: title || module.title,
    sequence_order: sequence_order !== undefined ? sequence_order : module.sequence_order,
    learning_items: learning_items !== undefined ? learning_items : module.learning_items,
  });

  res.status(200).json({
    success: true,
    data: module,
  });
});

// Delete a module
export const deleteCourseModule = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const module = await CourseModule.findByPk(id);

  if (!module) {
    return res.status(404).json({
      success: false,
      message: "Module not found",
    });
  }

  await module.destroy();

  res.status(200).json({
    success: true,
    message: "Module deleted successfully",
  });
});

// Get complete course curriculum (modules + syllabus)
export const getCourseCurriculum = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const modules = await CourseModule.findAll({
    where: { course_id: courseId },
    order: [["sequence_order", "ASC"]],
  });

  const syllabus = await Syllabus.findAll({
    where: { course_id: courseId },
    order: [["sequence_order", "ASC"]],
  });

  res.status(200).json({
    success: true,
    data: {
      modules,
      syllabus,
    },
  });
});
