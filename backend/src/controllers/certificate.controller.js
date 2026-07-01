import Certificate from "../models/certificate.js";
import CertificateSettings from "../models/certificateSettings.js";
import Student from "../models/student.js";
import Batch from "../models/batch.js";
import Course from "../models/course.js";
import User from "../models/user.js";
import Enrollment from "../models/enrollment.js";
import Attendance from "../models/attendance.js";
import Payment from "../models/payment.js";
import Fee from "../models/fee.js";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { Op } from "sequelize";
import { generateCertificatePDF } from "../utils/generateCertificatePDF.js";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ACTIVE_ENROLLMENT_STATUSES = ["ACTIVE", "active", "Active"];
const ATTENDED_STATUSES = ["PRESENT", "present", "Present", "LATE", "late", "Late"];
const SUCCESS_PAYMENT_STATUSES = ["SUCCESS", "success", "Success"];
const PAID_FEE_STATUSES = ["COMPLETED", "completed", "Completed"];

const resolveStudentByIdentifier = async (studentIdInput) => {
  const identifier = String(studentIdInput).trim();
  if (!identifier) return null;

  if (UUID_REGEX.test(identifier)) {
    const byUuid = await Student.findByPk(identifier, {
      include: [{ model: User }],
    });
    if (byUuid) return byUuid;
  }

  return Student.findOne({
    where: { student_code: { [Op.iLike]: identifier } },
    include: [{ model: User }],
  });
};

const resolveEnrollmentForManualCertificate = async (studentId) => {
  const enrollments = await Enrollment.findAll({
    where: {
      student_id: studentId,
      batch_id: { [Op.not]: null },
    },
    include: [
      {
        model: Batch,
        required: true,
        include: [{ model: Course, required: true }],
      },
    ],
    order: [[{ model: Batch }, "end_date", "DESC"]],
  });

  if (enrollments.length === 0) return null;

  return (
    enrollments.find((e) => ACTIVE_ENROLLMENT_STATUSES.includes(e.status)) ||
    enrollments[0]
  );
};

const getCompletedBatchEnrollments = async () =>
  Enrollment.findAll({
    where: {
      status: { [Op.in]: ACTIVE_ENROLLMENT_STATUSES },
      batch_id: { [Op.not]: null },
    },
    include: [
      {
        model: Student,
        required: true,
        include: [{ model: User, required: true }],
      },
      {
        model: Batch,
        required: true,
        include: [{ model: Course, required: true }],
        where: {
          end_date: { [Op.lte]: new Date() },
        },
      },
    ],
  });

// Generate unique certificate number
const generateCertificateNo = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `CERT-${timestamp}-${random}`;
};

// Generate unique verification code
const generateVerificationCode = () => {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
};

// Get certificate settings
export const getCertificateSettings = async (req, res) => {
  try {
    let settings = await CertificateSettings.findOne();
    
    if (!settings) {
      settings = await CertificateSettings.create({
        attendance_threshold: 75.00,
        allow_bypass: true,
        auto_generate: false,
        verification_domain: "sushildev.in",
      });
    }
    
    res.json(settings);
  } catch (error) {
    console.error("Error fetching certificate settings:", error);
    res.status(500).json({ message: "Failed to fetch certificate settings" });
  }
};

// Update certificate settings
export const updateCertificateSettings = async (req, res) => {
  try {
    const {
      attendance_threshold,
      allow_bypass,
      auto_generate,
      verification_domain,
      certificate_template_url,
      digital_signature_url,
      signature_title,
    } = req.body;
    
    let settings = await CertificateSettings.findOne();
    
    const payload = {
      attendance_threshold,
      allow_bypass,
      auto_generate,
      verification_domain,
      certificate_template_url,
      signature_title,
    };

    if (digital_signature_url !== undefined) {
      payload.digital_signature_url = digital_signature_url;
    }
    
    if (settings) {
      await settings.update(payload);
    } else {
      settings = await CertificateSettings.create(payload);
    }
    
    res.json(settings);
  } catch (error) {
    console.error("Error updating certificate settings:", error);
    res.status(500).json({ message: "Failed to update certificate settings" });
  }
};

// Calculate attendance percentage for a student in a batch
const calculateAttendancePercentage = async (studentId, batchId) => {
  const totalSessions = await Attendance.count({
    where: { batch_id: batchId },
    distinct: true,
    col: "attendance_date",
  });
  const attendedSessions = await Attendance.count({
    where: {
      student_id: studentId,
      batch_id: batchId,
      status: { [Op.in]: ATTENDED_STATUSES },
    },
  });

  if (totalSessions === 0) return 0;
  return (attendedSessions / totalSessions) * 100;
};

// Check if student has paid all fees
const checkFeesPaid = async (studentId) => {
  const fees = await Fee.findAll({
    where: { student_id: studentId },
  });

  if (!fees?.length) return false;

  for (const fee of fees) {
    if (PAID_FEE_STATUSES.includes(fee.payment_status) || Number(fee.due_amount) <= 0) {
      return true;
    }

    const paidAmount =
      (await Payment.sum("amount", {
        where: {
          fee_id: fee.id,
          status: { [Op.in]: SUCCESS_PAYMENT_STATUSES },
        },
      })) || 0;

    if (paidAmount >= Number(fee.total_amount)) {
      return true;
    }
  }

  return false;
};

const saveCertificatePdf = async (pdfBuffer, certificateNo) => {
  const certificatesDir = path.join(process.cwd(), "certificates");
  if (!fs.existsSync(certificatesDir)) {
    fs.mkdirSync(certificatesDir, { recursive: true });
  }

  const pdfFileName = `${certificateNo}.pdf`;
  fs.writeFileSync(path.join(certificatesDir, pdfFileName), pdfBuffer);
  return `/certificates/${pdfFileName}`;
};

const issueCertificate = async ({
  student_id,
  batch_id,
  bypass = false,
  admin_id,
  issueDate,
  skipEligibilityChecks = false,
}) => {
  const settings = await CertificateSettings.findOne();
  const threshold = settings ? Number(settings.attendance_threshold) : 75;

  const attendancePercentage = await calculateAttendancePercentage(student_id, batch_id);
  const feesPaid = await checkFeesPaid(student_id);

  if (!skipEligibilityChecks) {
    if (!feesPaid) {
      throw new Error("Student has not paid all fees");
    }

    if (!bypass && attendancePercentage < threshold) {
      throw new Error(
        `Attendance (${attendancePercentage.toFixed(2)}%) is below threshold (${threshold}%)`,
      );
    }
  }

  const existingCertificate = await Certificate.findOne({
    where: { student_id, batch_id },
  });

  if (existingCertificate) {
    throw new Error("Certificate already exists");
  }

  const student = await Student.findByPk(student_id, {
    include: [{ model: User }],
  });

  if (!student?.User?.name) {
    throw new Error("Student profile not found");
  }

  const batch = await Batch.findByPk(batch_id, {
    include: [{ model: Course }],
  });

  if (!batch?.Course) {
    throw new Error("Batch or course not found");
  }

  const certificateNo = generateCertificateNo();
  const verificationCode = generateVerificationCode();
  const resolvedIssueDate = issueDate || new Date().toISOString().split("T")[0];

  const pdfBuffer = await generateCertificatePDF({
    student,
    course: batch.Course,
    batch,
    certificateNo,
    verificationCode,
    issueDate: resolvedIssueDate,
    settings,
  });

  const certificateUrl = await saveCertificatePdf(pdfBuffer, certificateNo);

  return Certificate.create({
    student_id,
    batch_id,
    certificate_no: certificateNo,
    verification_code: verificationCode,
    issue_date: resolvedIssueDate,
    certificate_url: certificateUrl,
    status: "issued",
    attendance_percentage: attendancePercentage,
    bypass_approved: bypass || skipEligibilityChecks,
    approved_by: admin_id,
    approved_at: new Date(),
  });
};

// Get students eligible for certificate (standard queue)
export const getEligibleStudents = async (req, res) => {
  try {
    const settings = await CertificateSettings.findOne();
    const threshold = settings ? Number(settings.attendance_threshold) : 75;
    
    const enrollments = await getCompletedBatchEnrollments();
    
    const eligibleStudents = [];
    
    for (const enrollment of enrollments) {
      const attendancePercentage = await calculateAttendancePercentage(
        enrollment.student_id,
        enrollment.batch_id
      );
      
      const feesPaid = await checkFeesPaid(enrollment.student_id);
      
      // Check if certificate already exists
      const existingCertificate = await Certificate.findOne({
        where: {
          student_id: enrollment.student_id,
          batch_id: enrollment.batch_id,
        },
      });
      
      if (!existingCertificate && feesPaid && attendancePercentage >= threshold) {
        eligibleStudents.push({
          enrollment_id: enrollment.id,
          student_id: enrollment.student_id,
          batch_id: enrollment.batch_id,
          student_name: enrollment.Student.User.name,
          course_name: enrollment.Batch.Course.title,
          attendance_percentage: attendancePercentage.toFixed(2),
          fees_paid: feesPaid,
          batch_end_date: enrollment.Batch.end_date,
        });
      }
    }
    
    res.json(eligibleStudents);
  } catch (error) {
    console.error("Error fetching eligible students:", error);
    res.status(500).json({ message: "Failed to fetch eligible students" });
  }
};

// Get students in bypass queue (fees paid but attendance below threshold)
export const getBypassQueueStudents = async (req, res) => {
  try {
    const settings = await CertificateSettings.findOne();
    const threshold = settings ? Number(settings.attendance_threshold) : 75;
    
    const enrollments = await getCompletedBatchEnrollments();
    
    const bypassStudents = [];
    
    for (const enrollment of enrollments) {
      const attendancePercentage = await calculateAttendancePercentage(
        enrollment.student_id,
        enrollment.batch_id
      );
      
      const feesPaid = await checkFeesPaid(enrollment.student_id);
      
      // Check if certificate already exists
      const existingCertificate = await Certificate.findOne({
        where: {
          student_id: enrollment.student_id,
          batch_id: enrollment.batch_id,
        },
      });
      
      if (!existingCertificate && feesPaid && attendancePercentage < threshold) {
        bypassStudents.push({
          enrollment_id: enrollment.id,
          student_id: enrollment.student_id,
          batch_id: enrollment.batch_id,
          student_name: enrollment.Student.User.name,
          course_name: enrollment.Batch.Course.title,
          attendance_percentage: attendancePercentage.toFixed(2),
          fees_paid: feesPaid,
          batch_end_date: enrollment.Batch.end_date,
          threshold: threshold,
        });
      }
    }
    
    res.json(bypassStudents);
  } catch (error) {
    console.error("Error fetching bypass queue students:", error);
    res.status(500).json({ message: "Failed to fetch bypass queue students" });
  }
};

// Generate certificate
export const generateCertificate = async (req, res) => {
  try {
    const { student_id, batch_id, bypass = false } = req.body;
    const admin_id = req.user.id;

    const settings = await CertificateSettings.findOne();

    if (bypass && (!settings || !settings.allow_bypass)) {
      return res.status(403).json({ message: "Bypass is not allowed by admin settings" });
    }

    const certificate = await issueCertificate({
      student_id,
      batch_id,
      bypass,
      admin_id,
    });

    res.json(certificate);
  } catch (error) {
    console.error("Error generating certificate:", error);
    const status = error.message?.includes("not paid") ||
      error.message?.includes("Attendance") ||
      error.message?.includes("already exists")
      ? 400
      : 500;
    res.status(status).json({ message: error.message || "Failed to generate certificate" });
  }
};

// Manual certificate generation (admin override - bypasses all checks)
export const generateManualCertificate = async (req, res) => {
  try {
    const { student_id, custom_issue_date } = req.body;
    const admin_id = req.user.id;
    
    if (!student_id || !String(student_id).trim()) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    const student = await resolveStudentByIdentifier(student_id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.User?.name) {
      return res.status(400).json({ message: "Student profile is missing linked user account" });
    }

    const enrollment = await resolveEnrollmentForManualCertificate(student.id);

    if (!enrollment?.Batch?.Course) {
      return res.status(404).json({ message: "No batch enrollment found for this student" });
    }
    
    const batch_id = enrollment.batch_id;
    
    // Check if certificate already exists for this student and batch
    const existingCertificate = await Certificate.findOne({
      where: { student_id: student.id, batch_id },
    });
    
    if (existingCertificate) {
      return res.status(400).json({ message: "Certificate already exists for this student and batch" });
    }

    const certificate = await issueCertificate({
      student_id: student.id,
      batch_id,
      bypass: true,
      admin_id,
      issueDate: custom_issue_date || undefined,
      skipEligibilityChecks: true,
    });

    res.json({
      message: "Certificate generated manually",
      certificate,
      course: enrollment.Batch.Course.title,
      batch: enrollment.Batch.batch_name,
      student_name: student.User.name,
    });
  } catch (error) {
    console.error("Error generating manual certificate:", error);
    res.status(500).json({ message: error.message || "Failed to generate manual certificate" });
  }
};

// Bulk approve certificates
export const bulkApproveCertificates = async (req, res) => {
  try {
    const { enrollments } = req.body; // Array of { student_id, batch_id }
    const admin_id = req.user.id;
    
    const results = [];
    
    for (const { student_id, batch_id } of enrollments) {
      try {
        const result = await generateCertificateInternal(student_id, batch_id, false, admin_id);
        results.push({ success: true, student_id, batch_id, certificate: result });
      } catch (error) {
        results.push({ success: false, student_id, batch_id, error: error.message });
      }
    }
    
    res.json(results);
  } catch (error) {
    console.error("Error bulk approving certificates:", error);
    res.status(500).json({ message: "Failed to bulk approve certificates" });
  }
};

// Internal function to generate certificate
const generateCertificateInternal = async (student_id, batch_id, bypass, admin_id) =>
  issueCertificate({
    student_id,
    batch_id,
    bypass,
    admin_id,
  });

// Get student certificates
export const getStudentCertificates = async (req, res) => {
  try {
    const student = await Student.findOne({
      where: { user_id: req.user.id },
    });

    if (!student) {
      return res.status(400).json({ message: "Student profile not found" });
    }

    const certificates = await Certificate.findAll({
      where: { student_id: student.id },
      include: [
        {
          model: Batch,
          include: [{ model: Course }],
        },
        {
          model: Student,
          include: [{ model: User }],
        },
      ],
      order: [["created_at", "DESC"]],
    });
    
    res.json(certificates);
  } catch (error) {
    console.error("Error fetching student certificates:", error);
    res.status(500).json({ message: "Failed to fetch student certificates" });
  }
};

// Verify certificate
export const verifyCertificate = async (req, res) => {
  try {
    const { code } = req.params;
    
    const certificate = await Certificate.findOne({
      where: { verification_code: code },
      include: [
        {
          model: Student,
          include: [{ model: User }],
        },
        {
          model: Batch,
          include: [{ model: Course }],
        },
        {
          model: User,
          as: "approver",
          attributes: ["name"],
        },
      ],
    });
    
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }
    
    if (certificate.status !== "issued") {
      return res.status(400).json({ message: `Certificate status is ${certificate.status}` });
    }
    
    res.json(certificate);
  } catch (error) {
    console.error("Error verifying certificate:", error);
    res.status(500).json({ message: "Failed to verify certificate" });
  }
};

// Auto-generate certificates for eligible students (scheduled job)
export const processAutoEligibleCertificates = async () => {
  const settings = await CertificateSettings.findOne();
  if (!settings?.auto_generate) {
    return { skipped: true, succeeded: 0, failed: 0 };
  }

  const threshold = Number(settings.attendance_threshold) || 75;
  const enrollments = await getCompletedBatchEnrollments();
  let succeeded = 0;
  let failed = 0;

  for (const enrollment of enrollments) {
    const attendancePercentage = await calculateAttendancePercentage(
      enrollment.student_id,
      enrollment.batch_id,
    );
    const feesPaid = await checkFeesPaid(enrollment.student_id);

    const existingCertificate = await Certificate.findOne({
      where: {
        student_id: enrollment.student_id,
        batch_id: enrollment.batch_id,
      },
    });

    if (existingCertificate || !feesPaid || attendancePercentage < threshold) {
      continue;
    }

    try {
      await issueCertificate({
        student_id: enrollment.student_id,
        batch_id: enrollment.batch_id,
        bypass: false,
        admin_id: null,
      });
      succeeded += 1;
    } catch (error) {
      failed += 1;
      console.error(
        `Auto certificate failed for student ${enrollment.student_id}:`,
        error.message,
      );
    }
  }

  if (succeeded > 0 || failed > 0) {
    console.log(`Auto certificate generation: ${succeeded} issued, ${failed} failed`);
  }

  return { skipped: false, succeeded, failed };
};

// Get all certificates (admin)
export const getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.findAll({
      include: [
        {
          model: Student,
          include: [{ model: User }],
        },
        {
          model: Batch,
          include: [{ model: Course }],
        },
        {
          model: User,
          as: "approver",
          attributes: ["name"],
        },
      ],
      order: [["created_at", "DESC"]],
    });
    
    res.json(certificates);
  } catch (error) {
    console.error("Error fetching all certificates:", error);
    res.status(500).json({ message: "Failed to fetch certificates" });
  }
};
