import express from "express";
import protect from "../middlewares/authmiddleware.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import {
  inviteUser,
  listUsers,
  updateUserStatus,
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

router.use(protect, requireAdmin);

router.get("/users", listUsers);
router.post("/invite", inviteUser);
router.patch("/users/:id/status", updateUserStatus);

router.get("/curriculum", getCurriculum);
router.get("/departments", listDepartments);
router.post("/departments", createDepartment);
router.delete("/departments/:id", deleteDepartment);
router.get("/trainers", listTrainers);
router.get("/students", listStudents);
router.get("/students/browse", browseStudents);
router.get("/students/:id", getStudentDetails);
router.get("/courses/:courseId/batches", listCourseBatches);
router.post("/batches", createBatch);
router.get("/batches", listAllBatches);
router.get("/batches/:id", getBatch);
router.put("/batches/:id", updateBatch);
router.get("/courses/:id", getCourse);
router.post("/courses", createCourse);
router.put("/courses/:id", updateCourse);
router.delete("/courses/:id", deleteCourse);

export default router;
