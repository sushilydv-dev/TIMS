import express from "express";
import protect from "../middlewares/authmiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Trainer from "../models/trainer.js";
import Batch from "../models/batch.js";
import Enrollment from "../models/enrollment.js";
import Student from "../models/student.js";
import User from "../models/user.js";
import Course from "../models/course.js";
import Attendance from "../models/attendance.js";
import ProjectSubmission from "../models/projectSubmission.js";
import Project from "../models/project.js";
import StudyMaterial from "../models/studyMaterial.js";
import BatchTrainer from "../models/batchTrainer.js";
import Notification from "../models/notification.js";
import { Op } from "sequelize";
import { handleFileUpload } from "../utils/fileUpload.js";
import {
  sendProjectAssignedToStudents,
  sendTrainerProfileComplete,
} from "../services/notification.service.js";

const router = express.Router();
router.use(protect);

/* ── Guard: only trainers ─────────────────────────── */
router.use((req, res, next) => {
  if (!req.user) { res.status(401); throw new Error("Not authenticated"); }
  next();
});

async function getTrainerRecord(userId) {
  return Trainer.findOne({ where: { user_id: userId } });
}

/** Returns all batch IDs where this trainer is primary OR co-trainer */
async function getTrainerBatchIds(trainerId) {
  const [primary, secondary] = await Promise.all([
    Batch.findAll({ where: { trainer_id: trainerId }, attributes: ["id"] }),
    BatchTrainer.findAll({ where: { trainer_id: trainerId }, attributes: ["batch_id"] }),
  ]);
  const ids = new Set([
    ...primary.map(b => b.id),
    ...secondary.map(bt => bt.batch_id),
  ]);
  return [...ids];
}

/** Finds a batch the trainer is allowed to manage (primary or co-trainer) */
async function findTrainerBatch(batchId, trainerId) {
  const batchIds = await getTrainerBatchIds(trainerId);
  if (!batchIds.includes(batchId)) return null;
  return Batch.findByPk(batchId);
}

/* ── GET /api/trainer/profile ────────────────────────── */
router.get("/profile", asyncHandler(async (req, res) => {
  const trainer = await Trainer.findOne({
    where: { user_id: req.user.id },
    include: [{ model: User, attributes: ["id", "name", "email", "status"] }],
  });
  if (!trainer) { res.status(404); throw new Error("Trainer profile not found"); }

  res.json({
    id:               trainer.id,
    specialization:   trainer.specialization,
    experience_year:  trainer.experience_year,
    salary:           trainer.salary,
    profile_img:      trainer.profile_img || "",
    profile_completed: trainer.profile_completed,
    user: {
      id:    trainer.User?.id,
      name:  trainer.User?.name,
      email: trainer.User?.email,
    },
  });
}));

/* ── PUT /api/trainer/complete-profile ─────────────────── */
router.put("/complete-profile", asyncHandler(async (req, res) => {
  const { name, specialization, experience_year, profile_img } = req.body;
  
  const trainer = await Trainer.findOne({
    where: { user_id: req.user.id },
    include: [{ model: User }],
  });
  
  if (!trainer) { res.status(404); throw new Error("Trainer profile not found"); }
  
  // Update trainer fields
  trainer.specialization = specialization || trainer.specialization;
  trainer.experience_year = experience_year || trainer.experience_year;
  trainer.profile_img = handleFileUpload(profile_img || trainer.profile_img, "profile");
  trainer.profile_completed = true;
  
  // Update user name if provided
  if (name && trainer.User) {
    trainer.User.name = name;
    await trainer.User.save();
  }
  
  await trainer.save();
  
  // Send notification to admins about trainer profile completion
  console.log("=== TRAINER PROFILE COMPLETION NOTIFICATION START ===");
  console.log("Trainer ID:", trainer.id);
  console.log("Trainer Name:", trainer.User?.name || "Unknown");
  try {
    await sendTrainerProfileComplete(trainer.user_id, trainer.id, trainer.User?.name || "Unknown");
    console.log("Trainer profile notification sent successfully");
  } catch (error) {
    console.error("Error sending trainer profile notification:", error);
    console.error("Error stack:", error.stack);
  }
  console.log("=== TRAINER PROFILE COMPLETION NOTIFICATION END ===");
  
  res.json({
    message: "Profile completed successfully",
    trainer: {
      id: trainer.id,
      specialization: trainer.specialization,
      experience_year: trainer.experience_year,
      profile_img: trainer.profile_img,
      profile_completed: trainer.profile_completed,
    },
  });
}));

/* ── PUT /api/trainer/profile ────────────────────────── */
router.put("/profile", asyncHandler(async (req, res) => {
  const trainer = await Trainer.findOne({
    where: { user_id: req.user.id },
    include: [{ model: User }],
  });
  if (!trainer) { res.status(404); throw new Error("Trainer profile not found"); }

  const { name, specialization, experience_year, profile_img } = req.body;

  if (name !== undefined)            trainer.User.name           = String(name).trim();
  if (specialization !== undefined)  trainer.specialization      = String(specialization).trim();
  if (experience_year !== undefined) trainer.experience_year     = parseInt(experience_year, 10) || 0;
  if (profile_img !== undefined)     trainer.profile_img         = handleFileUpload(profile_img, "profile");

  await trainer.User.save();
  await trainer.save();

  res.json({ message: "Profile updated" });
}));

/* ── PUT /api/trainer/change-password ───────────────── */
router.put("/change-password", asyncHandler(async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) {
    res.status(400); throw new Error("Both current and new password are required");
  }
  if (String(new_password).length < 6) {
    res.status(400); throw new Error("New password must be at least 6 characters");
  }

  const userRecord = await User.findByPk(req.user.id);
  if (!userRecord) { res.status(404); throw new Error("User not found"); }

  const bcrypt = await import("bcryptjs");
  const isMatch = await bcrypt.default.compare(String(current_password), userRecord.password);
  if (!isMatch) { res.status(400); throw new Error("Current password is incorrect"); }

  const salt = await bcrypt.default.genSalt(10);
  userRecord.password = await bcrypt.default.hash(String(new_password), salt);
  await userRecord.save();

  res.json({ message: "Password changed successfully" });
}));

/* ── GET /api/trainer/me ───────────────────────────── */
router.get("/me", asyncHandler(async (req, res) => {
  const trainer = await Trainer.findOne({
    where: { user_id: req.user.id },
    include: [{ model: User, attributes: ["id", "name", "email", "status"] }],
  });
  if (!trainer) { res.status(404); throw new Error("Trainer profile not found"); }

  const batchIds = await getTrainerBatchIds(trainer.id);
  const batches = batchIds.length > 0
    ? await Batch.findAll({
        where: { id: batchIds },
        include: [
          { model: Course, attributes: ["id", "title", "duration_month"] },
          { model: Enrollment, attributes: ["id"], include: [{ model: Student, attributes: ["id"] }] },
        ],
        order: [["start_date", "DESC"]],
      })
    : [];

  res.json({
    id: trainer.id,
    specialization: trainer.specialization,
    experience_year: trainer.experience_year,
    profile_img: trainer.profile_img || "",
    user: trainer.User,
    batch_count: batches.length,
    total_students: batches.reduce((s, b) => s + (b.Enrollments?.length ?? 0), 0),
    batches: batches.map(b => ({
      id: b.id,
      batch_name: b.batch_name,
      start_date: b.start_date,
      end_date: b.end_date,
      course: b.Course ? { id: b.Course.id, title: b.Course.title, duration_month: b.Course.duration_month } : null,
      student_count: b.Enrollments?.length ?? 0,
    })),
  });
}));

/* ── GET /api/trainer/batches/:batchId ─────────────── */
router.get("/batches/:batchId", asyncHandler(async (req, res) => {
  const trainer = await getTrainerRecord(req.user.id);
  if (!trainer) { res.status(404); throw new Error("Trainer profile not found"); }

  const access = await findTrainerBatch(req.params.batchId, trainer.id);
  if (!access) { res.status(404); throw new Error("Batch not found or not assigned to you"); }

  const batch = await Batch.findByPk(req.params.batchId, {
    include: [
      { model: Course, attributes: ["id", "title", "duration_month"] },
      {
        model: Enrollment,
        include: [{
          model: Student,
          include: [{ model: User, attributes: ["id", "name", "email"] }],
        }],
      },
    ],
  });

  res.json({
    id: batch.id,
    batch_name: batch.batch_name,
    start_date: batch.start_date,
    end_date: batch.end_date,
    course: batch.Course,
    student_count: (batch.Enrollments || []).length,
    students: (batch.Enrollments || []).map(e => ({
      enrollment_id: e.id,
      enrollment_status: e.status,
      student: {
        id: e.Student?.id,
        name: e.Student?.User?.name || "",
        email: e.Student?.User?.email || "",
        profile_img: e.Student?.profile_img || "",
        student_code: e.Student?.student_code || "",
      },
    })),
  });
}));

/* ── GET /api/trainer/batches/:batchId/attendance ──── */
router.get("/batches/:batchId/attendance", asyncHandler(async (req, res) => {
  const trainer = await getTrainerRecord(req.user.id);
  if (!trainer) { res.status(404); throw new Error("Trainer profile not found"); }

  const batch = await findTrainerBatch(req.params.batchId, trainer.id);
  if (!batch) { res.status(404); throw new Error("Batch not found"); }

  const { date } = req.query;
  const where = { batch_id: req.params.batchId };
  if (date) where.attendance_date = date;

  const records = await Attendance.findAll({
    where,
    include: [{
      model: Student,
      include: [{ model: User, attributes: ["id", "name"] }],
    }],
    order: [["attendance_date", "DESC"]],
  });

  // Also return all enrolled students for this batch
  const enrollments = await Enrollment.findAll({
    where: { batch_id: req.params.batchId },
    include: [{ model: Student, include: [{ model: User, attributes: ["id", "name"] }] }],
  });

  const students = enrollments.map(e => ({
    student_id: e.Student?.id,
    name: e.Student?.User?.name || "",
    email: e.Student?.User?.email || "",
    profile_img: e.Student?.profile_img || "",
    student_code: e.Student?.student_code || "",
  }));

  res.json({ records, students });
}));

/* ── POST /api/trainer/batches/:batchId/attendance ─── */
router.post("/batches/:batchId/attendance", asyncHandler(async (req, res) => {
  const trainer = await getTrainerRecord(req.user.id);
  if (!trainer) { res.status(404); throw new Error("Trainer profile not found"); }

  const batch = await findTrainerBatch(req.params.batchId, trainer.id);
  if (!batch) { res.status(404); throw new Error("Batch not found"); }

  const { date, entries } = req.body;
  // entries: [{ student_id, status }]
  if (!date || !Array.isArray(entries) || entries.length === 0) {
    res.status(400); throw new Error("date and entries[] are required");
  }

  const VALID_STATUSES = ["PRESENT", "ABSENT", "LATE", "LEAVE"];
  const toUpsert = entries
    .filter(e => e.student_id && VALID_STATUSES.includes(String(e.status).toUpperCase()))
    .map(e => ({
      batch_id: req.params.batchId,
      student_id: e.student_id,
      attendance_date: date,
      status: String(e.status).toUpperCase(),
      marked_by: String(req.user.id),
    }));

  if (toUpsert.length === 0) { res.status(400); throw new Error("No valid entries"); }

  // Delete existing records for this date+batch, then re-insert
  await Attendance.destroy({ where: { batch_id: req.params.batchId, attendance_date: date } });
  await Attendance.bulkCreate(toUpsert);

  res.json({ message: "Attendance marked", count: toUpsert.length });
}));

/* ── GET /api/trainer/batches/:batchId/submissions ─── */
router.get("/batches/:batchId/submissions", asyncHandler(async (req, res) => {
  const trainer = await getTrainerRecord(req.user.id);
  if (!trainer) { res.status(404); throw new Error("Trainer profile not found"); }

  const batch = await findTrainerBatch(req.params.batchId, trainer.id);
  if (!batch) { res.status(404); throw new Error("Batch not found"); }

  // Get projects for this batch's course
  const projects = await Project.findAll({ where: { course_id: batch.course_id } });
  const projectIds = projects.map(p => p.id);

  const submissions = await ProjectSubmission.findAll({
    where: projectIds.length > 0 ? { project_id: { [Op.in]: projectIds } } : { project_id: null },
    include: [
      { model: Project, attributes: ["id", "title", "deadline"] },
      { model: Student, include: [{ model: User, attributes: ["id", "name"] }] },
    ],
    order: [["submitted_at", "DESC"]],
  });

  res.json(submissions.map(s => ({
    id: s.id,
    project: s.Project,
    student: {
      id: s.Student?.id,
      name: s.Student?.User?.name || "",
      profile_img: s.Student?.profile_img || "",
    },
    github_link: s.GitHub_link,
    file_url: s.file_url,
    submitted_at: s.submitted_at,
    marks: s.marks,
    feedback: s.feedback,
    graded: s.marks > 0 || !!s.feedback,
  })));
}));

/* ── GET /api/trainer/batches/:batchId/projects ──────── */
router.get("/batches/:batchId/projects", asyncHandler(async (req, res) => {
  const trainer = await getTrainerRecord(req.user.id);
  if (!trainer) { res.status(404); throw new Error("Trainer profile not found"); }

  const batch = await findTrainerBatch(req.params.batchId, trainer.id);
  if (!batch) { res.status(404); throw new Error("Batch not found"); }

  const projects = await Project.findAll({
    where: { course_id: batch.course_id },
    order: [["deadline", "ASC"]],
  });

  // For each project, get submission stats
  const projectIds = projects.map(p => p.id);
  const allSubs = projectIds.length > 0
    ? await ProjectSubmission.findAll({
        where: { project_id: { [Op.in]: projectIds } },
        include: [{ model: Student, include: [{ model: User, attributes: ["id", "name"] }] }],
      })
    : [];

  const subMap = {};
  allSubs.forEach(s => {
    if (!subMap[s.project_id]) subMap[s.project_id] = [];
    subMap[s.project_id].push(s);
  });

  res.json(projects.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description,
    deadline: p.deadline,
    assigned_by: p.assigned_by,
    course_id: p.course_id,
    submission_count: (subMap[p.id] || []).length,
    graded_count: (subMap[p.id] || []).filter(s => s.marks > 0).length,
    submissions: (subMap[p.id] || []).map(s => ({
      id: s.id,
      student: { id: s.Student?.id, name: s.Student?.User?.name || "" },
      github_link: s.GitHub_link,
      file_url: s.file_url,
      submitted_at: s.submitted_at,
      marks: s.marks,
      feedback: s.feedback,
      graded: s.marks > 0,
    })),
  })));
}));

/* ── POST /api/trainer/batches/:batchId/projects ─────── */
router.post("/batches/:batchId/projects", asyncHandler(async (req, res) => {
  const trainer = await getTrainerRecord(req.user.id);
  if (!trainer) { res.status(404); throw new Error("Trainer profile not found"); }

  const batch = await findTrainerBatch(req.params.batchId, trainer.id);
  if (!batch) { res.status(404); throw new Error("Batch not found"); }

  const { title, description, deadline } = req.body;
  if (!title?.trim() || !description?.trim() || !deadline?.trim()) {
    res.status(400); throw new Error("title, description, and deadline are required");
  }

  const project = await Project.create({
    course_id: batch.course_id,
    title: title.trim(),
    description: description.trim(),
    deadline: deadline.trim(),
    assigned_by: String(req.user.id),
  });

  try {
    await sendProjectAssignedToStudents(
      batch.course_id,
      project.id,
      project.title,
      project.deadline,
      req.user?.name || "Trainer",
    );
  } catch (error) {
    console.error("Error sending project assigned notification:", error);
  }

  res.status(201).json(project);
}));

/* ── PUT /api/trainer/projects/:id ──────────────────── */
router.put("/projects/:id", asyncHandler(async (req, res) => {
  const trainer = await getTrainerRecord(req.user.id);
  if (!trainer) { res.status(404); throw new Error("Trainer profile not found"); }

  const project = await Project.findByPk(req.params.id);
  if (!project) { res.status(404); throw new Error("Project not found"); }

  // Verify trainer owns a batch for this course (primary or co-trainer)
  const trainerBatchIds = await getTrainerBatchIds(trainer.id);
  const batch = trainerBatchIds.length > 0
    ? await Batch.findOne({ where: { course_id: project.course_id, id: trainerBatchIds } })
    : null;
  if (!batch) { res.status(403); throw new Error("Not authorized to edit this project"); }

  const { title, description, deadline } = req.body;
  if (title !== undefined) project.title = title.trim();
  if (description !== undefined) project.description = description.trim();
  if (deadline !== undefined) project.deadline = deadline.trim();
  await project.save();

  res.json(project);
}));

/* ── DELETE /api/trainer/projects/:id ───────────────── */
router.delete("/projects/:id", asyncHandler(async (req, res) => {
  const trainer = await getTrainerRecord(req.user.id);
  if (!trainer) { res.status(404); throw new Error("Trainer profile not found"); }

  const project = await Project.findByPk(req.params.id);
  if (!project) { res.status(404); throw new Error("Project not found"); }

  const trainerBatchIdsForDelete = await getTrainerBatchIds(trainer.id);
  const batchForDelete = trainerBatchIdsForDelete.length > 0
    ? await Batch.findOne({ where: { course_id: project.course_id, id: trainerBatchIdsForDelete } })
    : null;
  if (!batchForDelete) { res.status(403); throw new Error("Not authorized to delete this project"); }

  await ProjectSubmission.destroy({ where: { project_id: project.id } });
  await project.destroy();
  res.json({ message: "Project deleted" });
}));

/* ── PUT /api/trainer/submissions/:id/grade ──────────*/
router.put("/submissions/:id/grade", asyncHandler(async (req, res) => {
  const trainer = await getTrainerRecord(req.user.id);
  if (!trainer) { res.status(404); throw new Error("Trainer profile not found"); }

  const submission = await ProjectSubmission.findByPk(req.params.id);
  if (!submission) { res.status(404); throw new Error("Submission not found"); }

  const { marks, feedback } = req.body;
  if (marks === undefined) { res.status(400); throw new Error("marks is required"); }
  if (Number(marks) < 0 || Number(marks) > 10) { res.status(400); throw new Error("marks must be between 0 and 10"); }

  submission.marks = Number(marks);
  submission.feedback = String(feedback || "").trim();
  await submission.save();

  res.json({ message: "Graded", submission });
}));

/* ── GET /api/trainer/batches/:batchId/materials ───── */
router.get("/batches/:batchId/materials", asyncHandler(async (req, res) => {
  const trainer = await getTrainerRecord(req.user.id);
  if (!trainer) { res.status(404); throw new Error("Trainer profile not found"); }

  const batch = await findTrainerBatch(req.params.batchId, trainer.id);
  if (!batch) { res.status(404); throw new Error("Batch not found"); }

  const materials = await StudyMaterial.findAll({
    where: { course_id: batch.course_id },
    order: [["id", "ASC"]],   // study_material has no createdAt column
  });

  res.json(materials);
}));

/* ── POST /api/trainer/batches/:batchId/materials ──── */
router.post("/batches/:batchId/materials", asyncHandler(async (req, res) => {
  const trainer = await getTrainerRecord(req.user.id);
  if (!trainer) { res.status(404); throw new Error("Trainer profile not found"); }

  const batch = await findTrainerBatch(req.params.batchId, trainer.id);
  if (!batch) { res.status(404); throw new Error("Batch not found"); }

  const { title, topic_name, file_url, file_data, material_type } = req.body;
  if (!title?.trim() || !material_type?.trim()) {
    res.status(400); throw new Error("title and material_type are required");
  }

  // Handle file upload - save base64 to disk or use existing URL
  const storedUrl = handleFileUpload(file_data?.trim() || file_url?.trim() || "", "material");
  if (!storedUrl) {
    res.status(400); throw new Error("Either file_data or file_url is required");
  }

  const material = await StudyMaterial.create({
    course_id:     batch.course_id,
    title:         title.trim(),
    topic_name:    (topic_name?.trim() || "General"),
    file_url:      storedUrl,
    material_type: material_type.trim(),
    uploaded_by:   String(req.user.id),
  });

  res.status(201).json(material);
}));

/* ── DELETE /api/trainer/materials/:id ──────────────── */
router.delete("/materials/:id", asyncHandler(async (req, res) => {
  const trainer = await getTrainerRecord(req.user.id);
  if (!trainer) { res.status(404); throw new Error("Trainer profile not found"); }

  const material = await StudyMaterial.findByPk(req.params.id);
  if (!material) { res.status(404); throw new Error("Material not found"); }

  // Verify this trainer owns the batch for this course (primary or co-trainer)
  const trainerBatchIdsForMaterial = await getTrainerBatchIds(trainer.id);
  const batchForMaterial = trainerBatchIdsForMaterial.length > 0
    ? await Batch.findOne({ where: { course_id: material.course_id, id: trainerBatchIdsForMaterial } })
    : null;
  if (!batchForMaterial) { res.status(403); throw new Error("Not authorized to delete this material"); }

  await material.destroy();
  res.json({ message: "Material deleted" });
}));

export default router;
