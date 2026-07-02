import { Op, literal, fn, col } from "sequelize";
import User from "../models/user.js";
import Student from "../models/student.js";
import Trainer from "../models/trainer.js";
import Course from "../models/course.js";
import Batch from "../models/batch.js";
import Enrollment from "../models/enrollment.js";
import Attendance from "../models/attendance.js";
import ProjectSubmission from "../models/projectSubmission.js";
import Fee from "../models/fee.js";
import Payment from "../models/payment.js";
import Assessment from "../models/assessment.js";
import AssessmentResult from "../models/assessmentResult.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Admin Dashboard Analytics
export const getAdminDashboardStats = asyncHandler(async (req, res) => {
  const totalStudents = await Student.count();
  const totalTrainers = await Trainer.count();
  const totalCourses = await Course.count();
  // Batch model has no status field — count all batches
  const activeBatches = await Batch.count();

  // Revenue calculation — payment status is stored as "SUCCESS"
  const payments = await Payment.findAll({
    where: { status: "SUCCESS" },
    attributes: [[fn("SUM", col("amount")), "total_revenue"]],
  });
  const totalRevenue = payments[0]?.dataValues?.total_revenue || 0;

  // Pending fees — Fee model uses payment_status field
  const pendingFees = await Fee.count({ where: { payment_status: "PENDING" } });

  // Recent enrollments (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentEnrollments = await Enrollment.count({
    where: { enrollment_date: { [Op.gte]: thirtyDaysAgo } },
  });

  res.status(200).json({
    success: true,
    data: {
      total_students: totalStudents,
      total_trainers: totalTrainers,
      total_courses: totalCourses,
      active_batches: activeBatches,
      total_revenue: totalRevenue,
      pending_fees: pendingFees,
      recent_enrollments: recentEnrollments,
    },
  });
});

// Attendance Analytics
export const getAttendanceAnalytics = asyncHandler(async (req, res) => {
  const { batch_id, start_date, end_date } = req.query;
  const where = {};

  if (batch_id) where.batch_id = batch_id;
  if (start_date && end_date) {
    where.attendance_date = { [Op.between]: [start_date, end_date] };
  }

  const attendanceRecords = await Attendance.findAll({ where });

  const total = attendanceRecords.length;
  const present = attendanceRecords.filter(a => a.status === "present").length;
  const absent = attendanceRecords.filter(a => a.status === "absent").length;
  const late = attendanceRecords.filter(a => a.status === "late").length;
  const leave = attendanceRecords.filter(a => a.status === "leave").length;

  const attendanceRate = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

  res.status(200).json({
    success: true,
    data: {
      total,
      present,
      absent,
      late,
      leave,
      attendance_rate: parseFloat(attendanceRate),
    },
  });
});

// Student Performance Analytics
export const getStudentPerformanceAnalytics = asyncHandler(async (req, res) => {
  const { student_id, batch_id } = req.query;

  // Project submissions
  const projectWhere = {};
  if (student_id) projectWhere.student_id = student_id;
  // ProjectSubmission has no batch_id column — filter by student only

  const submissions = await ProjectSubmission.findAll({ where: projectWhere });
  const avgProjectScore = submissions.length > 0
    ? (submissions.reduce((sum, s) => sum + (s.marks || 0), 0) / submissions.length).toFixed(2)
    : 0;

  // Assessment results
  const assessmentWhere = {};
  if (student_id) assessmentWhere.student_id = student_id;

  const assessmentResults = await AssessmentResult.findAll({ where: assessmentWhere });
  const avgAssessmentScore = assessmentResults.length > 0
    ? (assessmentResults.reduce((sum, r) => sum + r.obtained_marks, 0) / assessmentResults.length).toFixed(2)
    : 0;
  const passedAssessments = assessmentResults.filter(r => r.passed).length;

  res.status(200).json({
    success: true,
    data: {
      total_submissions: submissions.length,
      avg_project_score: parseFloat(avgProjectScore),
      total_assessments: assessmentResults.length,
      avg_assessment_score: parseFloat(avgAssessmentScore),
      passed_assessments,
    },
  });
});

// Fee Collection Analytics
export const getFeeAnalytics = asyncHandler(async (req, res) => {
  const { start_date, end_date } = req.query;
  const where = {};

  if (start_date && end_date) {
    where.payment_date = { [Op.between]: [start_date, end_date] };
  }

  const payments = await Payment.findAll({ where });

  const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const completedPayments = payments.filter(p => p.status === "SUCCESS").length;
  const pendingPayments = payments.filter(p => p.status === "PENDING").length;

  // Monthly trend
  const monthlyData = await Payment.findAll({
    attributes: [
      [literal("DATE_TRUNC('month', payment_date)"), "month"],
      [fn("SUM", col("amount")), "amount"],
    ],
    where: start_date && end_date ? { payment_date: { [Op.between]: [start_date, end_date] } } : {},
    group: [literal("DATE_TRUNC('month', payment_date)")],
    order: [[literal("DATE_TRUNC('month', payment_date)"), "ASC"]],
  });

  res.status(200).json({
    success: true,
    data: {
      total_collected: totalCollected,
      completed_payments: completedPayments,
      pending_payments: pendingPayments,
      monthly_trend: monthlyData,
    },
  });
});

// Trainer Performance Analytics
export const getTrainerPerformanceAnalytics = asyncHandler(async (req, res) => {
  const { trainer_id } = req.query;

  const trainerWhere = trainer_id ? { trainer_id } : {};

  // Get batches for trainer
  const batches = await Batch.findAll({ where: trainerWhere });
  const batchIds = batches.map(b => b.id);

  // Students in these batches
  const enrollments = await Enrollment.findAll({
    where: { batch_id: { [Op.in]: batchIds } },
  });
  const totalStudents = enrollments.length;

  // Attendance marked by trainer
  const attendanceRecords = await Attendance.findAll({
    where: { batch_id: { [Op.in]: batchIds } },
  });

  // Project evaluations — ProjectSubmission has no batch_id;
  // proxy through student enrollments in these batches
  const studentIds = [...new Set(enrollments.map(e => e.student_id))];
  const evaluations = studentIds.length > 0
    ? await ProjectSubmission.findAll({
        where: { student_id: { [Op.in]: studentIds }, marks: { [Op.ne]: null } },
      })
    : [];

  const avgEvaluationScore = evaluations.length > 0
    ? (evaluations.reduce((sum, e) => sum + e.marks, 0) / evaluations.length).toFixed(2)
    : 0;

  res.status(200).json({
    success: true,
    data: {
      total_batches: batches.length,
      total_students: totalStudents,
      attendance_marked: attendanceRecords.length,
      total_evaluations: evaluations.length,
      avg_evaluation_score: parseFloat(avgEvaluationScore),
    },
  });
});

// Course Analytics
export const getCourseAnalytics = asyncHandler(async (req, res) => {
  const courses = await Course.findAll({
    include: [
      {
        model: Batch,
        as: "batches",
        attributes: ["id"],
      },
    ],
  });

  const courseAnalytics = await Promise.all(
    courses.map(async (course) => {
      const batchIds = course.batches?.map(b => b.id) || [];

      const enrollments = await Enrollment.findAll({
        where: { batch_id: { [Op.in]: batchIds } },
      });

      const activeStudents = enrollments.filter(e => e.status === "active").length;

      return {
        course_id: course.id,
        course_name: course.title,
        total_batches: course.batches?.length || 0,
        total_enrollments: enrollments.length,
        active_students: activeStudents,
      };
    })
  );

  res.status(200).json({
    success: true,
    data: courseAnalytics,
  });
});

// Detailed Reports
export const getDetailedReport = asyncHandler(async (req, res) => {
  const { report_type, start_date, end_date } = req.query;

  let data = [];

  switch (report_type) {
    case "attendance":
      data = await Attendance.findAll({
        where: start_date && end_date
          ? { attendance_date: { [Op.between]: [start_date, end_date] } }
          : {},
        include: [
          { model: Student, attributes: ["id", "name"] },
          { model: Batch, attributes: ["id", "name"] },
        ],
        order: [["attendance_date", "DESC"]],
      });
      break;

    case "fees":
      data = await Payment.findAll({
        where: start_date && end_date
          ? { payment_date: { [Op.between]: [start_date, end_date] } }
          : {},
        include: [
          { model: Fee, as: "fee", attributes: ["id", "amount"] },
        ],
        order: [["payment_date", "DESC"]],
      });
      break;

    case "projects":
      data = await ProjectSubmission.findAll({
        where: start_date && end_date
          ? { submitted_at: { [Op.between]: [start_date, end_date] } }
          : {},
        include: [
          { model: Student, attributes: ["id", "name"] },
        ],
        order: [["submitted_at", "DESC"]],
      });
      break;

    case "assessments":
      data = await AssessmentResult.findAll({
        where: start_date && end_date
          ? { submitted_at: { [Op.between]: [start_date, end_date] } }
          : {},
        include: [
          { model: Student, attributes: ["id", "name"] },
          { model: Assessment, attributes: ["id", "title"] },
        ],
        order: [["submitted_at", "DESC"]],
      });
      break;

    default:
      return res.status(400).json({
        success: false,
        message: "Invalid report type. Use: attendance, fees, projects, assessments",
      });
  }

  res.status(200).json({
    success: true,
    data,
  });
});
