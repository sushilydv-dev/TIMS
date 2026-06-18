import express from "express";
import protect from "../middlewares/authmiddleware.js";
import { requireAdminOrHR } from "../middlewares/requireAdminOrHR.js";
import Student from "../models/student.js";
import { getUserRoleForClient } from "../utils/roleHelpers.js";
import {
  enrollStudent,
  recordOfflineSettle,
  refreshRazorpayLink,
  resendInvitation,
  modifyFutureInstallments,
  updateStudentProfile,
} from "../controllers/studentControl.controller.js";
import {
  browseStudents,
  getStudentDetails,
} from "../controllers/batches.controller.js";

const router = express.Router();

router.use(protect);

// Rest of the management endpoints require Admin or HR
router.get("/browse", requireAdminOrHR, browseStudents);

// Allow a student to view their own profile, or Admin/HR to view any student profile
router.get("/:id", async (req, res, next) => {
  try {
    const role = await getUserRoleForClient(req.user);
    if (role === "ADMIN" || role === "HR_COORDINATOR" || role === "HR") {
      return next();
    }
    const student = await Student.findOne({ where: { id: req.params.id } });
    if (student && student.user_id === req.user.id) {
      return next();
    }
    res.status(403);
    return res.json({ message: "Access denied: student can only access their own profile details" });
  } catch (err) {
    return next(err);
  }
}, getStudentDetails);

// Rest of the management endpoints require Admin or HR
router.use(requireAdminOrHR);

router.post("/enroll", enrollStudent);
router.post("/:id/offline-settle", recordOfflineSettle);
router.post("/installments/:installmentId/refresh-link", refreshRazorpayLink);
router.post("/users/:userId/resend-invite", resendInvitation);
router.put("/:studentId/installments/modify", modifyFutureInstallments);
router.put("/:id", updateStudentProfile);

export default router;

