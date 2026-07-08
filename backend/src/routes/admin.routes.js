import express from "express";
import os from "os";
import sequelize from "../config/db.js";
import protect from "../middlewares/authmiddleware.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import { requireAdminOrHR } from "../middlewares/requireAdminOrHR.js";
import {
  inviteUser,
  listUsers,
  updateUserStatus,
  listTrainersBrowse,
  updateTrainerProfile,
  listHrDetailed,
  updateHrProfile,
  getDashboardStats,
} from "../controllers/admin.controller.js";
import {
  getCurriculum,
  listDepartments,
  createDepartment,
  deleteDepartment,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/courses.controller.js";
import {
  listTrainers,
  listStudents,
  browseStudents,
  listCourseBatches,
  listAllBatches,
  createBatch,
  getBatch,
  updateBatch,
  getStudentDetails,
  removeStudentFromBatch,
  deleteBatch,
} from "../controllers/batches.controller.js";
import Fee from "../models/fee.js";
import Payment from "../models/payment.js";
import Installment from "../models/installment.js";
import Student from "../models/student.js";
import User from "../models/user.js";
import Enrollment from "../models/enrollment.js";
import Batch from "../models/batch.js";
import Course from "../models/course.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

// Relaxed routes for Admin & HR (placed before RequireAdmin middleware)
router.get("/curriculum", protect, requireAdminOrHR, getCurriculum);
router.get("/courses/:courseId/batches", protect, requireAdminOrHR, listCourseBatches);

router.use(protect, requireAdmin);

router.get("/dashboard-stats", getDashboardStats);
router.get("/users", listUsers);
router.post("/invite", inviteUser);
router.patch("/users/:id/status", updateUserStatus);

router.get("/trainers/browse", listTrainersBrowse);
router.put("/trainers/:id", updateTrainerProfile);
router.get("/hr/browse", listHrDetailed);
router.put("/hr/:id", updateHrProfile);

router.get("/departments", listDepartments);
router.post("/departments", createDepartment);
router.delete("/departments/:id", deleteDepartment);
router.get("/trainers", listTrainers);
router.get("/students", listStudents);
router.post("/batches", createBatch);
router.get("/batches", listAllBatches);
router.get("/batches/:id", getBatch);
router.put("/batches/:id", updateBatch);
router.delete("/batches/:id", deleteBatch);
router.delete("/batches/:id/students/:studentId", removeStudentFromBatch);
router.get("/courses/:id", getCourse);
router.post("/courses", createCourse);
router.put("/courses/:id", updateCourse);
router.delete("/courses/:id", deleteCourse);

/* ── GET /api/admin/billing ──────────────────────────── */
router.get("/billing", asyncHandler(async (req, res) => {
  // All fees with student + payment + installment data
  const fees = await Fee.findAll({
    include: [
      {
        model: Student,
        include: [
          { model: User, attributes: ["id", "name", "email"] },
          {
            model: Enrollment,
            include: [{ model: Batch, include: [{ model: Course, attributes: ["id", "title"] }] }],
            required: false,
          },
        ],
      },
      {
        model: Payment,
        as: "payments",
        required: false,
        order: [["payment_date", "DESC"]],
      },
      {
        model: Installment,
        as: "installments",
        required: false,
        order: [["sequence_number", "ASC"]],
      },
    ],
    order: [["id", "ASC"]],   // fees table has no createdAt column
  });

  // Aggregate stats
  let totalRevenue   = 0;
  let totalPending   = 0;
  let totalOverdue   = 0;
  let studentsOverdue = 0;
  let studentsPending = 0;
  let recentPayments = [];

  fees.forEach(fee => {
    totalRevenue += Number(fee.paid_ammount || 0);
    totalPending += Number(fee.due_amount   || 0);
    const status = (fee.payment_status || "").toUpperCase();
    if (status === "OVERDUE") { totalOverdue += Number(fee.due_amount || 0); studentsOverdue++; }
    if (["PENDING_FIRST_PAYMENT", "ACTIVE", "OVERDUE"].includes(status)) studentsPending++;

    (fee.payments || []).forEach(p => {
        const enrollment = fee.Student?.Enrollments?.[0] || null;
        const batch  = enrollment?.Batch  || null;
        const course = batch?.Course      || null;
        recentPayments.push({
          id:             p.id,
          student_id:     fee.Student?.id,
          profile_img:    fee.Student?.profile_img || "",
          student_name:   fee.Student?.User?.name || "Unknown",
          student_code:   fee.Student?.student_code || "—",
          student_email:  fee.Student?.User?.email || "—",
          course_title:   course?.title || "—",
          batch_name:     batch?.batch_name || "—",
          amount:         Number(p.amount || 0),
          payment_date:   p.payment_date,
          method:         p.payment_methhod || "—",
          transaction_id: p.transaction_id || "—",
          status:         p.status || "SUCCESS",
        });
      });
  });

  // Sort recent payments by date desc, take top 50
  recentPayments.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));
  recentPayments = recentPayments.slice(0, 50);

  // Per-student fee rows
  const studentFees = fees.map(fee => {
    const enrollment = fee.Student?.Enrollments?.[0] || null;
    const batch  = enrollment?.Batch  || null;
    const course = batch?.Course      || null;
    return {
      fee_id:         fee.id,
      student_id:     fee.Student?.id,
      profile_img:    fee.Student?.profile_img || "",
      student_name:   fee.Student?.User?.name  || "Unknown",
      student_email:  fee.Student?.User?.email || "—",
      student_code:   fee.Student?.student_code || "—",
      course_title:   course?.title || "—",
      batch_name:     batch?.batch_name || "—",
      total_amount:   Number(fee.total_amount || 0),
      paid_amount:    Number(fee.paid_ammount || 0),
      due_amount:     Number(fee.due_amount   || 0),
      discount:       Number(fee.discount_amount || 0),
      payment_status: fee.payment_status || "—",
      scheme:         fee.payment_scheme_mode || "FULL",
      installments:   (fee.installments || []).map(i => ({
        id:          i.id,
        label:       i.installment_label,
        amount_due:  Number(i.amount_due || 0),
        settled:     Number(i.amount_settled || 0),
        due_date:    i.due_date,
        status:      i.status,
        seq:         i.sequence_number,
      })),
    };
  });

  res.json({
    stats: {
      total_revenue:     totalRevenue,
      total_pending:     totalPending,
      total_overdue:     totalOverdue,
      students_overdue:  studentsOverdue,
      students_pending:  studentsPending,
      total_students:    fees.length,
    },
    recent_payments: recentPayments,
    student_fees:    studentFees,
  });
}));

/* ── GET /api/admin/system-health ───────────────────── */
router.get("/system-health", asyncHandler(async (req, res) => {
  const checks = [];

  // 1. PostgreSQL — attempt a simple query
  const dbStart = Date.now();
  let dbStatus = "ok";
  let dbError = null;
  try {
    await sequelize.query("SELECT 1");
  } catch (err) {
    dbStatus = "error";
    dbError = err.message;
  }
  const dbLatency = Date.now() - dbStart;
  checks.push({
    name: "PostgreSQL",
    status: dbStatus,
    latency_ms: dbLatency,
    detail: dbError || "Connected",
  });

  // 2. Node.js process memory
  const mem = process.memoryUsage();
  const heapUsedMB  = Math.round(mem.heapUsed  / 1024 / 1024);
  const heapTotalMB = Math.round(mem.heapTotal / 1024 / 1024);
  const rssMB       = Math.round(mem.rss       / 1024 / 1024);
  checks.push({
    name: "Node Process",
    status: heapUsedMB < heapTotalMB * 0.9 ? "ok" : "warn",
    latency_ms: null,
    detail: `Heap ${heapUsedMB}/${heapTotalMB} MB  ·  RSS ${rssMB} MB`,
  });

  // 3. System CPU load (1-minute average)
  const cpuLoad = os.loadavg()[0];
  const cpuCount = os.cpus().length;
  const cpuNorm  = cpuLoad / cpuCount; // normalised: >1 = saturated
  checks.push({
    name: "CPU Load",
    status: cpuNorm < 0.7 ? "ok" : cpuNorm < 1.0 ? "warn" : "error",
    latency_ms: null,
    detail: `Load avg 1m: ${cpuLoad.toFixed(2)} on ${cpuCount} cores`,
  });

  // 4. System memory
  const totalMem = os.totalmem();
  const freeMem  = os.freemem();
  const usedPct  = ((totalMem - freeMem) / totalMem) * 100;
  checks.push({
    name: "System Memory",
    status: usedPct < 80 ? "ok" : usedPct < 95 ? "warn" : "error",
    latency_ms: null,
    detail: `${usedPct.toFixed(1)}% used  ·  ${Math.round(freeMem / 1024 / 1024)} MB free`,
  });

  // 5. Uptime
  const uptimeSeconds = process.uptime();
  const uptimeHours   = (uptimeSeconds / 3600).toFixed(1);
  checks.push({
    name: "API Server",
    status: "ok",
    latency_ms: null,
    detail: `Up ${uptimeHours}h  ·  PID ${process.pid}`,
  });

  const overall = checks.some(c => c.status === "error")
    ? "error"
    : checks.some(c => c.status === "warn")
    ? "warn"
    : "ok";

  res.json({
    overall,
    checked_at: new Date().toISOString(),
    process_uptime_seconds: Math.round(uptimeSeconds),
    checks,
  });
}));

export default router;
