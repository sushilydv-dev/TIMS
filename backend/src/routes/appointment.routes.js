import express from "express";
import protect from "../middlewares/authmiddleware.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import {
  createAppointmentRequest,
  getAllAppointmentRequests,
  updateAppointmentStatus,
  deleteAppointmentRequest,
} from "../controllers/appointment.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

// Public endpoint to create appointment request
router.post("/", asyncHandler(createAppointmentRequest));

// Admin-only endpoints
router.get("/", protect, requireAdmin, asyncHandler(getAllAppointmentRequests));
router.patch("/:id/status", protect, requireAdmin, asyncHandler(updateAppointmentStatus));
router.delete("/:id", protect, requireAdmin, asyncHandler(deleteAppointmentRequest));

export default router;
