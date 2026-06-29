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
import Installment from "../models/installment.js";
import { Op } from "sequelize";
import crypto from "crypto";
import { generateCertificatePDF } from "../utils/generateCertificatePDF.js";
import fs from "fs";
import path from "path";

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
    const { attendance_threshold, allow_bypass, verification_domain, certificate_template_url } = req.body;
    
    let settings = await CertificateSettings.findOne();
    
    if (settings) {
      await settings.update({
        attendance_threshold,
        allow_bypass,
        verification_domain,
        certificate_template_url,
      });
    } else {
      settings = await CertificateSettings.create({
        attendance_threshold,
        allow_bypass,
        verification_domain,
        certificate_template_url,
      });
    }
    
    res.json(settings);
  } catch (error) {
    console.error("Error updating certificate settings:", error);
    res.status(500).json({ message: "Failed to update certificate settings" });
  }
};

// Calculate attendance percentage for a student in a batch
const calculateAttendancePercentage = async (studentId, batchId) => {
  const totalSessions = await Attendance.count({ where: { batch_id: batchId } });
  const attendedSessions = await Attendance.count({ 
    where: { student_id: studentId, batch_id: batchId, status: "present" } 
  });
  
  if (totalSessions === 0) return 0;
  return (attendedSessions / totalSessions) * 100;
};

// Check if student has paid all fees for a batch
const checkFeesPaid = async (studentId, batchId) => {
  // Get fees associated with this student
  const fees = await Fee.findAll({
    where: { student_id: studentId },
    include: [{ model: Payment }],
  });

  if (!fees || fees.length === 0) return false;

  // Check if any fee is fully paid
  for (const fee of fees) {
    const totalAmount = fee.total_amount;
    const paidAmount = await Payment.sum("amount", {
      where: { fee_id: fee.id, status: "success" },
    });

    if (paidAmount >= totalAmount) {
      return true;
    }
  }

  return false;
};

// Get students eligible for certificate (standard queue)
export const getEligibleStudents = async (req, res) => {
  try {
    const settings = await CertificateSettings.findOne();
    const threshold = settings ? settings.attendance_threshold : 75;
    
    const enrollments = await Enrollment.findAll({
      where: {
        status: "active",
      },
      include: [
        {
          model: Student,
          include: [{ model: User }],
        },
        {
          model: Batch,
          include: [{ model: Course }],
          where: {
            end_date: { [Op.lte]: new Date() },
          },
        },
      ],
    });
    
    const eligibleStudents = [];
    
    for (const enrollment of enrollments) {
      const attendancePercentage = await calculateAttendancePercentage(
        enrollment.student_id,
        enrollment.batch_id
      );
      
      const feesPaid = await checkFeesPaid(enrollment.student_id, enrollment.batch_id);
      
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
    const threshold = settings ? settings.attendance_threshold : 75;
    
    const enrollments = await Enrollment.findAll({
      where: {
        status: "active",
      },
      include: [
        {
          model: Student,
          include: [{ model: User }],
        },
        {
          model: Batch,
          include: [{ model: Course }],
          where: {
            end_date: { [Op.lte]: new Date() },
          },
        },
      ],
    });
    
    const bypassStudents = [];
    
    for (const enrollment of enrollments) {
      const attendancePercentage = await calculateAttendancePercentage(
        enrollment.student_id,
        enrollment.batch_id
      );
      
      const feesPaid = await checkFeesPaid(enrollment.student_id, enrollment.batch_id);
      
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

// Generate certificate (placeholder for PDF generation)
export const generateCertificate = async (req, res) => {
  try {
    const { student_id, batch_id, bypass = false } = req.body;
    const admin_id = req.user.id;
    
    const settings = await CertificateSettings.findOne();
    const threshold = settings ? settings.attendance_threshold : 75;
    
    // Check if bypass is allowed
    if (bypass && (!settings || !settings.allow_bypass)) {
      return res.status(403).json({ message: "Bypass is not allowed by admin settings" });
    }
    
    // Calculate attendance
    const attendancePercentage = await calculateAttendancePercentage(student_id, batch_id);
    
    // Check fees
    const feesPaid = await checkFeesPaid(student_id, batch_id);
    
    if (!feesPaid) {
      return res.status(400).json({ message: "Student has not paid all fees" });
    }
    
    // Check attendance threshold if not bypass
    if (!bypass && attendancePercentage < threshold) {
      return res.status(400).json({ 
        message: `Attendance (${attendancePercentage.toFixed(2)}%) is below threshold (${threshold}%)` 
      });
    }
    
    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      where: { student_id, batch_id },
    });
    
    if (existingCertificate) {
      return res.status(400).json({ message: "Certificate already exists" });
    }
    
    // Get student and batch details
    const student = await Student.findByPk(student_id, {
      include: [{ model: User }],
    });
    
    const batch = await Batch.findByPk(batch_id, {
      include: [{ model: Course }],
    });
    
    // Generate certificate
    const certificateNo = generateCertificateNo();
    const verificationCode = generateVerificationCode();
    const issueDate = new Date().toISOString().split("T")[0];
    
    // Generate PDF
    const pdfBuffer = await generateCertificatePDF(
      student,
      batch.Course,
      certificateNo,
      verificationCode,
      issueDate,
      settings?.certificate_template_url
    );
    
    // Create certificates directory if it doesn't exist
    const certificatesDir = path.join(process.cwd(), "certificates");
    if (!fs.existsSync(certificatesDir)) {
      fs.mkdirSync(certificatesDir, { recursive: true });
    }
    
    // Save PDF locally (for now - can be replaced with S3 upload)
    const pdfFileName = `${certificateNo}.pdf`;
    const pdfPath = path.join(certificatesDir, pdfFileName);
    fs.writeFileSync(pdfPath, pdfBuffer);
    
    // For now, use local file path (replace with S3 URL when cloud storage is set up)
    const certificateUrl = `/certificates/${pdfFileName}`;
    
    const certificate = await Certificate.create({
      student_id,
      batch_id,
      certificate_no: certificateNo,
      verification_code: verificationCode,
      issue_date: issueDate,
      certificate_url: certificateUrl,
      status: "issued",
      attendance_percentage: attendancePercentage,
      bypass_approved: bypass,
      approved_by: admin_id,
      approved_at: new Date(),
    });
    
    res.json(certificate);
  } catch (error) {
    console.error("Error generating certificate:", error);
    res.status(500).json({ message: "Failed to generate certificate" });
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
const generateCertificateInternal = async (student_id, batch_id, bypass, admin_id) => {
  const settings = await CertificateSettings.findOne();
  const threshold = settings ? settings.attendance_threshold : 75;
  
  const attendancePercentage = await calculateAttendancePercentage(student_id, batch_id);
  const feesPaid = await checkFeesPaid(student_id, batch_id);
  
  if (!feesPaid) {
    throw new Error("Student has not paid all fees");
  }
  
  if (!bypass && attendancePercentage < threshold) {
    throw new Error(`Attendance (${attendancePercentage.toFixed(2)}%) is below threshold (${threshold}%)`);
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
  
  const batch = await Batch.findByPk(batch_id, {
    include: [{ model: Course }],
  });
  
  const certificateNo = generateCertificateNo();
  const verificationCode = generateVerificationCode();
  const issueDate = new Date().toISOString().split("T")[0];
  const certificateUrl = `https://${settings.verification_domain}/certificates/${certificateNo}.pdf`;
  
  const certificate = await Certificate.create({
    student_id,
    batch_id,
    certificate_no: certificateNo,
    verification_code: verificationCode,
    issue_date: issueDate,
    certificate_url: certificateUrl,
    status: "issued",
    attendance_percentage: attendancePercentage,
    bypass_approved: bypass,
    approved_by: admin_id,
    approved_at: new Date(),
  });
  
  return certificate;
};

// Get student certificates
export const getStudentCertificates = async (req, res) => {
  try {
    const student_id = req.user.Student?.id;
    
    if (!student_id) {
      return res.status(400).json({ message: "Student profile not found" });
    }
    
    const certificates = await Certificate.findAll({
      where: { student_id },
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
