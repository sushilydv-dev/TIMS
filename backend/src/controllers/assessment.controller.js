import Assessment from "../models/assessment.js";
import AssessmentResult from "../models/assessmentResult.js";
import Student from "../models/student.js";
import Batch from "../models/batch.js";
import Course from "../models/course.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new assessment/quiz
export const createAssessment = asyncHandler(async (req, res) => {
  const { title, description, course_id, batch_id, questions, total_marks, start_time, end_time, duration_minutes } = req.body;

  const assessment = await Assessment.create({
    title,
    description,
    course_id,
    batch_id,
    questions: questions || [],
    total_marks,
    start_time,
    end_time,
    duration_minutes,
    created_by: req.user.id,
  });

  res.status(201).json({
    success: true,
    data: assessment,
  });
});

// Get all assessments (with filters)
export const getAssessments = asyncHandler(async (req, res) => {
  const { course_id, batch_id, status } = req.query;
  const where = {};

  if (course_id) where.course_id = course_id;
  if (batch_id) where.batch_id = batch_id;

  const assessments = await Assessment.findAll({
    where,
    include: [
      { model: Course, as: "course", attributes: ["id", "title"] },
      { model: Batch, as: "batch", attributes: ["id", "name"] },
    ],
    order: [["created_at", "DESC"]],
  });

  // Filter by status if provided
  let filtered = assessments;
  if (status === "active") {
    const now = new Date();
    filtered = assessments.filter(a => new Date(a.start_time) <= now && new Date(a.end_time) >= now);
  } else if (status === "upcoming") {
    const now = new Date();
    filtered = assessments.filter(a => new Date(a.start_time) > now);
  } else if (status === "completed") {
    const now = new Date();
    filtered = assessments.filter(a => new Date(a.end_time) < now);
  }

  res.status(200).json({
    success: true,
    data: filtered,
  });
});

// Get a single assessment
export const getAssessmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const assessment = await Assessment.findByPk(id, {
    include: [
      { model: Course, as: "course", attributes: ["id", "title"] },
      { model: Batch, as: "batch", attributes: ["id", "name"] },
    ],
  });

  if (!assessment) {
    return res.status(404).json({
      success: false,
      message: "Assessment not found",
    });
  }

  res.status(200).json({
    success: true,
    data: assessment,
  });
});

// Update an assessment
export const updateAssessment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, questions, total_marks, start_time, end_time, duration_minutes } = req.body;

  const assessment = await Assessment.findByPk(id);

  if (!assessment) {
    return res.status(404).json({
      success: false,
      message: "Assessment not found",
    });
  }

  await assessment.update({
    title: title || assessment.title,
    description: description || assessment.description,
    questions: questions !== undefined ? questions : assessment.questions,
    total_marks: total_marks !== undefined ? total_marks : assessment.total_marks,
    start_time: start_time || assessment.start_time,
    end_time: end_time || assessment.end_time,
    duration_minutes: duration_minutes !== undefined ? duration_minutes : assessment.duration_minutes,
  });

  res.status(200).json({
    success: true,
    data: assessment,
  });
});

// Delete an assessment
export const deleteAssessment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const assessment = await Assessment.findByPk(id);

  if (!assessment) {
    return res.status(404).json({
      success: false,
      message: "Assessment not found",
    });
  }

  await assessment.destroy();

  res.status(200).json({
    success: true,
    message: "Assessment deleted successfully",
  });
});

// Student: Submit assessment answers
export const submitAssessment = asyncHandler(async (req, res) => {
  const { assessmentId } = req.params;
  const { answers } = req.body;

  // Look up the Student record for the authenticated user
  const student = await Student.findOne({ where: { user_id: req.user.id } });
  if (!student) {
    return res.status(404).json({ success: false, message: "Student profile not found" });
  }

  const assessment = await Assessment.findByPk(assessmentId);

  if (!assessment) {
    return res.status(404).json({
      success: false,
      message: "Assessment not found",
    });
  }

  // Check if assessment is still active
  const now = new Date();
  if (assessment.start_time && new Date(assessment.start_time) > now) {
    return res.status(400).json({ success: false, message: "Assessment has not started yet" });
  }
  if (assessment.end_time && new Date(assessment.end_time) < now) {
    return res.status(400).json({ success: false, message: "Assessment has already ended" });
  }

  // Check if student already submitted
  const existingResult = await AssessmentResult.findOne({
    where: { assessment_id: assessmentId, student_id: student.id },
  });

  if (existingResult) {
    return res.status(400).json({
      success: false,
      message: "You have already submitted this assessment",
    });
  }

  // Auto-grade MCQ answers
  let obtainedMarks = 0;
  const questions = assessment.questions || [];

  questions.forEach((q, idx) => {
    // answers is an array of selected option indices
    if (answers[idx] !== undefined && q.correct_answer === answers[idx]) {
      obtainedMarks += q.marks || 1;
    }
  });

  const passed =
    assessment.passing_marks != null
      ? obtainedMarks >= assessment.passing_marks
      : null;

  const result = await AssessmentResult.create({
    assessment_id: assessmentId,
    student_id: student.id,
    answers,
    obtained_marks: obtainedMarks,
    total_marks: assessment.total_marks,
    passed,
    submitted_at: new Date(),
  });

  res.status(201).json({
    success: true,
    data: result,
  });
});

// Get assessment results for a specific assessment
export const getAssessmentResults = asyncHandler(async (req, res) => {
  const { assessmentId } = req.params;

  const results = await AssessmentResult.findAll({
    where: { assessment_id: assessmentId },
    include: [
      { model: Student, as: "student", attributes: ["id", "name", "email"] },
    ],
    order: [["obtained_marks", "DESC"]],
  });

  res.status(200).json({
    success: true,
    data: results,
  });
});

// Get student's assessment results
export const getStudentResults = asyncHandler(async (req, res) => {
  const studentId = req.user.id;

  const results = await AssessmentResult.findAll({
    where: { student_id: studentId },
    include: [
      { model: Assessment, as: "assessment", attributes: ["id", "title", "total_marks", "passing_marks"] },
    ],
    order: [["submitted_at", "DESC"]],
  });

  res.status(200).json({
    success: true,
    data: results,
  });
});

// Get a specific result
export const getResultById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await AssessmentResult.findByPk(id, {
    include: [
      { model: Assessment, as: "assessment" },
      { model: Student, as: "student", attributes: ["id", "name", "email"] },
    ],
  });

  if (!result) {
    return res.status(404).json({
      success: false,
      message: "Result not found",
    });
  }

  res.status(200).json({
    success: true,
    data: result,
  });
});

// Update/grade a result (for manual grading if needed)
export const updateResult = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { obtained_marks, feedback } = req.body;

  const result = await AssessmentResult.findByPk(id);

  if (!result) {
    return res.status(404).json({
      success: false,
      message: "Result not found",
    });
  }

  await result.update({
    obtained_marks: obtained_marks !== undefined ? obtained_marks : result.obtained_marks,
    feedback: feedback || result.feedback,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});
