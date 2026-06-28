import express from "express";
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

// Admin endpoints (protected middleware will be added in main routes)
router.get("/", asyncHandler(getAllAppointmentRequests));
router.patch("/:id/status", asyncHandler(updateAppointmentStatus));
router.delete("/:id", asyncHandler(deleteAppointmentRequest));

export default router;
