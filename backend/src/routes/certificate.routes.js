import express from "express";
import {
  getCertificateSettings,
  updateCertificateSettings,
  getEligibleStudents,
  getBypassQueueStudents,
  generateCertificate,
  generateManualCertificate,
  bulkApproveCertificates,
  getStudentCertificates,
  verifyCertificate,
  getAllCertificates,
} from "../controllers/certificate.controller.js";
import protect from "../middlewares/authmiddleware.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

const router = express.Router();

// Certificate settings (admin only)
router.get("/settings", protect, requireAdmin, getCertificateSettings);
router.put("/settings", protect, requireAdmin, updateCertificateSettings);

// Certificate approval queues (admin only)
router.get("/eligible", protect, requireAdmin, getEligibleStudents);
router.get("/bypass-queue", protect, requireAdmin, getBypassQueueStudents);

// Certificate generation (admin only)
router.post("/generate", protect, requireAdmin, generateCertificate);
router.post("/generate-manual", protect, requireAdmin, generateManualCertificate);
router.post("/bulk-approve", protect, requireAdmin, bulkApproveCertificates);

// Get all certificates (admin only)
router.get("/all", protect, requireAdmin, getAllCertificates);

// Student certificates (student only)
router.get("/my-certificates", protect, getStudentCertificates);

// Public certificate verification
router.get("/verify/:code", verifyCertificate);

export default router;
