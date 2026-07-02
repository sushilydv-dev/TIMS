import express from "express";
import {
  getAdminDashboardStats,
  getAttendanceAnalytics,
  getStudentPerformanceAnalytics,
  getFeeAnalytics,
  getTrainerPerformanceAnalytics,
  getCourseAnalytics,
  getDetailedReport,
} from "../controllers/analytics.controller.js";
import protect from "../middlewares/authmiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Dashboard stats
router.get("/dashboard", getAdminDashboardStats);

// Attendance analytics
router.get("/attendance", getAttendanceAnalytics);

// Student performance
router.get("/student-performance", getStudentPerformanceAnalytics);

// Fee analytics
router.get("/fees", getFeeAnalytics);

// Trainer performance
router.get("/trainer-performance", getTrainerPerformanceAnalytics);

// Course analytics
router.get("/courses", getCourseAnalytics);

// Detailed reports
router.get("/reports", getDetailedReport);

export default router;
