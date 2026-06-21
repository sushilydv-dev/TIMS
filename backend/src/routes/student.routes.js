import express from "express";
import protect from "../middlewares/authmiddleware.js";
import { getMyFeeProfile } from "../controllers/studentControl.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Student from "../models/student.js";
import Enrollment from "../models/enrollment.js";
import Batch from "../models/batch.js";
import Course from "../models/course.js";
import Attendance from "../models/attendance.js";
import StudyMaterial from "../models/studyMaterial.js";
import Project from "../models/project.js";
import ProjectSubmission from "../models/projectSubmission.js";
import User from "../models/user.js";
import Trainer from "../models/trainer.js";
import { Op } from "sequelize";

const router = express.Router();
router.use(protect);

router.get("/me/fees", getMyFeeProfile);

/* ── GET /api/students/me/dashboard ─────────────────── */
router.get("/me/dashboard", asyncHandler(async (req, res) => {
  const student = await Student.findOne({
    where: { user_id: req.user.id },
    include: [
      { model: User, attributes: ["id", "name", "email"] },
      {
        model: Enrollment,
        include: [{
          model: Batch,
          include: [
            { model: Course, attributes: ["id", "title", "duration_month"] },
            { model: Trainer, include: [{ model: User, attributes: ["id", "name"] }] },
          ],
        }],
      },
      { model: Attendance, required: false },
    ],
  });

  if (!student) { res.status(404); throw new Error("Student profile not found"); }

  const enrollment = student.Enrollments?.[0] || null;
  const batch = enrollment?.Batch || null;
  const course = batch?.Course || null;
  const trainer = batch?.Trainer || null;

  // Attendance summary
  const attendances = student.Attendances || [];
  const present = attendances.filter(a => ["PRESENT", "LATE"].includes(String(a.status).toUpperCase())).length;
  const absent  = attendances.filter(a => String(a.status).toUpperCase() === "ABSENT").length;
  const total   = attendances.length;
  const pct     = total > 0 ? Math.round((present / total) * 100) : 0;

  // Study materials for their course
  let materials = [];
  if (course?.id) {
    materials = await StudyMaterial.findAll({
      where: { course_id: course.id },
      order: [["id", "ASC"]],
      limit: 20,
    });
  }

  // Projects + submissions with trainer info
  let projects = [];
  if (course?.id) {
    const rawProjects = await Project.findAll({
      where: { course_id: course.id },
      order: [["deadline", "ASC"]],
    });
    const projectIds = rawProjects.map(p => p.id);
    const submissions = projectIds.length > 0
      ? await ProjectSubmission.findAll({
          where: { project_id: { [Op.in]: projectIds }, student_id: student.id },
        })
      : [];
    const submissionMap = {};
    submissions.forEach(s => { submissionMap[s.project_id] = s; });

    // Resolve trainer name from assigned_by (user id)
    const trainerUser = trainer ? { name: trainer.User?.name || "Your Trainer" } : null;

    projects = rawProjects.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      deadline: p.deadline,
      assigned_by_name: trainerUser?.name || "Trainer",
      submission: submissionMap[p.id] ? {
        id:           submissionMap[p.id].id,
        github_link:  submissionMap[p.id].GitHub_link,
        file_url:     submissionMap[p.id].file_url,
        submitted_at: submissionMap[p.id].submitted_at,
        marks:        submissionMap[p.id].marks,
        feedback:     submissionMap[p.id].feedback,
      } : null,
    }));
  }

  res.json({
    student: {
      id: student.id,
      student_code: student.student_code,
      college_name: student.college_name,
      profile_img: student.profile_img,
      user: student.User,
    },
    enrollment: enrollment ? {
      id: enrollment.id,
      status: enrollment.status,
      enrollment_date: enrollment.enrollment_date,
    } : null,
    batch: batch ? {
      id: batch.id,
      batch_name: batch.batch_name,
      start_date: batch.start_date,
      end_date: batch.end_date,
    } : null,
    course: course ? { id: course.id, title: course.title, duration_month: course.duration_month } : null,
    trainer: trainer ? {
      id: trainer.id,
      name: trainer.User?.name || "",
      specialization: trainer.specialization,
      profile_img: trainer.profile_img || "",
    } : null,
    attendance: { total, present, absent, pct, records: attendances.slice(0, 30) },
    materials,
    projects,
  });
}));

/* ── POST /api/students/me/projects/:projectId/submit ─ */
router.post("/me/projects/:projectId/submit", asyncHandler(async (req, res) => {
  const student = await Student.findOne({ where: { user_id: req.user.id } });
  if (!student) { res.status(404); throw new Error("Student profile not found"); }

  const project = await Project.findByPk(req.params.projectId);
  if (!project) { res.status(404); throw new Error("Project not found"); }

  const { github_link, file_url } = req.body;
  if (!github_link?.trim() && !file_url?.trim()) {
    res.status(400); throw new Error("Either github_link or file_url is required");
  }

  const today = new Date().toISOString().slice(0, 10);
  const existing = await ProjectSubmission.findOne({
    where: { project_id: req.params.projectId, student_id: student.id },
  });

  if (existing) {
    existing.GitHub_link = github_link?.trim() || "";
    existing.file_url    = file_url?.trim() || "";
    existing.submitted_at = today;
    await existing.save();
    return res.json({ message: "Submission updated", submission: existing });
  }

  const submission = await ProjectSubmission.create({
    project_id: req.params.projectId,
    student_id: student.id,
    GitHub_link: github_link?.trim() || "",
    file_url:    file_url?.trim() || "",
    submitted_at: today,
    marks: 0,
    feedback: "",
  });

  res.status(201).json({ message: "Submitted", submission });
}));

export default router;
