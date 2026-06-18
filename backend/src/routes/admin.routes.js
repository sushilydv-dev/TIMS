import express from "express";
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
} from "../controllers/batches.controller.js";

const router = express.Router();

// Relaxed routes for Admin & HR (placed before RequireAdmin middleware)
router.get("/curriculum", protect, requireAdminOrHR, getCurriculum);
router.get("/courses/:courseId/batches", protect, requireAdminOrHR, listCourseBatches);

router.use(protect, requireAdmin);

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
router.get("/courses/:id", getCourse);
router.post("/courses", createCourse);
router.put("/courses/:id", updateCourse);
router.delete("/courses/:id", deleteCourse);

export default router;
