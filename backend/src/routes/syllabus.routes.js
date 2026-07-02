import express from "express";
import {
  createSyllabus,
  getSyllabusByCourse,
  getSyllabusById,
  updateSyllabus,
  deleteSyllabus,
  createCourseModule,
  getModulesByCourse,
  getModuleById,
  updateCourseModule,
  deleteCourseModule,
  getCourseCurriculum,
} from "../controllers/syllabus.controller.js";
import protect from "../middlewares/authmiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Syllabus routes
router.post("/syllabus", createSyllabus);
router.get("/courses/:courseId/syllabus", getSyllabusByCourse);
router.get("/syllabus/:id", getSyllabusById);
router.put("/syllabus/:id", updateSyllabus);
router.delete("/syllabus/:id", deleteSyllabus);

// Course Module routes
router.post("/modules", createCourseModule);
router.get("/courses/:courseId/modules", getModulesByCourse);
router.get("/modules/:id", getModuleById);
router.put("/modules/:id", updateCourseModule);
router.delete("/modules/:id", deleteCourseModule);

// Complete curriculum
router.get("/courses/:courseId/curriculum", getCourseCurriculum);

export default router;
