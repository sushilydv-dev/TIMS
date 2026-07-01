import express from "express";
import {
  createAssessment,
  getAssessments,
  getAssessmentById,
  updateAssessment,
  deleteAssessment,
  submitAssessment,
  getAssessmentResults,
  getStudentResults,
  getResultById,
  updateResult,
} from "../controllers/assessment.controller.js";
import protect from "../middlewares/authmiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Assessment CRUD (Admin/Trainer)
router.post("/", createAssessment);
router.get("/", getAssessments);
router.get("/:id", getAssessmentById);
router.put("/:id", updateAssessment);
router.delete("/:id", deleteAssessment);

// Student submission
router.post("/:assessmentId/submit", submitAssessment);

// Results
router.get("/:assessmentId/results", getAssessmentResults);
router.get("/student/my-results", getStudentResults);
router.get("/results/:id", getResultById);
router.put("/results/:id", updateResult);

export default router;
