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

/* ── GET /api/students/me/profile ────────────────────── */
router.get("/me/profile", asyncHandler(async (req, res) => {
  const student = await Student.findOne({
    where: { user_id: req.user.id },
    include: [
      { model: User, attributes: ["id", "name", "email"] },
      {
        model: Enrollment,
        include: [{
          model: Batch,
          include: [{ model: Course, attributes: ["id", "title", "duration_month"] }],
        }],
      },
    ],
  });
  if (!student) { res.status(404); throw new Error("Student profile not found"); }

  const enrollment = student.Enrollments?.[0] || null;
  const batch      = enrollment?.Batch  || null;
  const course     = batch?.Course      || null;

  res.json({
    id:             student.id,
    student_code:   student.student_code,
    phone:          student.phone,
    address:        student.address,
    college_name:   student.college_name,
    qualification:  student.qualification,
    joining_date:   student.joining_date,
    profile_img:    student.profile_img || "",
    user: {
      id:    student.User?.id,
      name:  student.User?.name,
      email: student.User?.email,
    },
    enrollment: enrollment ? {
      id:              enrollment.id,
      enrollment_date: enrollment.enrollment_date,
      status:          enrollment.status,
    } : null,
    batch:  batch  ? { id: batch.id,   batch_name: batch.batch_name, start_date: batch.start_date, end_date: batch.end_date } : null,
    course: course ? { id: course.id,  title: course.title, duration_month: course.duration_month } : null,
  });
}));

/* ── PUT /api/students/me/profile ────────────────────── */
router.put("/me/profile", asyncHandler(async (req, res) => {
  const student = await Student.findOne({
    where: { user_id: req.user.id },
    include: [{ model: User }],
  });
  if (!student) { res.status(404); throw new Error("Student profile not found"); }

  const { phone, address, college_name, qualification, profile_img } = req.body;

  if (phone       !== undefined) student.phone        = String(phone || "").trim();
  if (address     !== undefined) student.address      = String(address || "").trim();
  if (college_name!== undefined) student.college_name = String(college_name || "").trim();
  if (qualification !== undefined) student.qualification = String(qualification || "").trim();
  if (profile_img !== undefined) student.profile_img  = profile_img || "";

  await student.save();
  res.json({ message: "Profile updated", student_code: student.student_code });
}));

/* ── POST /api/students/backfill-codes (admin util) ──── */
// One-time endpoint to assign stu- codes to legacy students that have placeholder codes
router.post("/backfill-codes", asyncHandler(async (req, res) => {
  const all = await Student.findAll({ attributes: ["id", "student_code"] });
  let updated = 0;
  for (const s of all) {
    const code = (s.student_code || "").trim();
    const needsBackfill = !code || code === "0" || code.startsWith("STU-") || !code.startsWith("stu-");
    if (needsBackfill) {
      // Generate new code
      const year   = new Date().getFullYear();
      const prefix = `stu-${year}-`;
      const existing = await Student.findAll({
        where: { student_code: { [Op.like]: `%${year}%` } },
        attributes: ["student_code"],
      });
      let maxNum = 0;
      existing.forEach(e => {
        const m = (e.student_code || "").toLowerCase().match(/\d{4}-(\d+)$/);
        if (m) { const n = parseInt(m[1], 10); if (!isNaN(n) && n > maxNum) maxNum = n; }
      });
      s.student_code = `${prefix}${String(maxNum + 1).padStart(3, "0")}`;
      await s.save();
      updated++;
    }
  }
  res.json({ message: `Backfilled ${updated} student codes` });
}));

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

  // Study materials for their course — include uploader name
  let materials = [];
  if (course?.id) {
    const rawMaterials = await StudyMaterial.findAll({
      where: { course_id: course.id },
      order: [["id", "ASC"]],
    });

    // Resolve uploaded_by user IDs to names in one query
    const uploaderIds = [...new Set(rawMaterials.map(m => m.uploaded_by).filter(Boolean))];
    const uploaderUsers = uploaderIds.length > 0
      ? await User.findAll({ where: { id: uploaderIds }, attributes: ["id", "name"] })
      : [];
    const uploaderMap = {};
    uploaderUsers.forEach(u => { uploaderMap[u.id] = u.name; });

    materials = rawMaterials.map(m => ({
      id:            m.id,
      title:         m.title,
      topic_name:    m.topic_name || "General",
      file_url:      m.file_url,
      material_type: m.material_type,
      uploaded_by:   m.uploaded_by,
      uploader_name: uploaderMap[m.uploaded_by] || trainer?.User?.name || "Trainer",
    }));
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

/* ── GET /api/students/me/materials ─────────────────── */
router.get("/me/materials", asyncHandler(async (req, res) => {
  const student = await Student.findOne({
    where: { user_id: req.user.id },
    include: [{
      model: Enrollment,
      include: [{ model: Batch, include: [{ model: Course, attributes: ["id", "title"] }] }],
    }],
  });

  if (!student) { res.status(404); throw new Error("Student profile not found"); }

  const course = student.Enrollments?.[0]?.Batch?.Course || null;
  if (!course) return res.json({ materials: [], course: null });

  const rawMaterials = await StudyMaterial.findAll({
    where: { course_id: course.id },
    order: [["id", "ASC"]],
  });

  const uploaderIds = [...new Set(rawMaterials.map(m => m.uploaded_by).filter(Boolean))];
  const uploaderUsers = uploaderIds.length > 0
    ? await User.findAll({ where: { id: uploaderIds }, attributes: ["id", "name"] })
    : [];
  const uploaderMap = {};
  uploaderUsers.forEach(u => { uploaderMap[u.id] = u.name; });

  res.json({
    course: { id: course.id, title: course.title },
    materials: rawMaterials.map(m => ({
      id:            m.id,
      title:         m.title,
      topic_name:    m.topic_name || "General",
      file_url:      m.file_url,
      material_type: m.material_type,
      uploader_name: uploaderMap[m.uploaded_by] || "Trainer",
    })),
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
