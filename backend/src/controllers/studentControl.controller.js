import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import sequelize from "../config/db.js";
import User from "../models/user.js";
import Student from "../models/student.js";
import Role from "../models/role.js";
import Enrollment from "../models/enrollment.js";
import Fee from "../models/fee.js";
import Payment from "../models/payment.js";
import Installment from "../models/installment.js";
import Course from "../models/course.js";
import Batch from "../models/batch.js";
import InviteToken from "../models/inviteToken.js";
import Attendance from "../models/attendance.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendTemplateEmail } from "../utils/emailService.js";
import { getCanonicalRoleByName, toClientRole } from "../utils/roleHelpers.js";
import { handleFileUpload } from "../utils/fileUpload.js";
import Razorpay from "razorpay";
import {
  sendBatchAssignedToStudent,
  sendNewStudentEnrollment,
  sendFeePayment,
  sendStudentAssignedToBatch,
} from "../services/notification.service.js";


// Helper: build activation link
function buildActivationLink(token) {
  const base = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
  return `${base}/activate-account?token=${encodeURIComponent(token)}`;
}

// Helper: generate student code
async function generateStudentCode() {
  const year = new Date().getFullYear();
  const prefix = `STU-${year}-`;
  const students = await Student.findAll({
    where: {
      student_code: { [Op.like]: `${prefix}%` },
    },
    attributes: ["student_code"],
  });

  let maxNum = 0;
  for (const s of students) {
    if (s.student_code && s.student_code.startsWith(prefix)) {
      const suffixStr = s.student_code.slice(prefix.length);
      const suffixNum = parseInt(suffixStr, 10);
      if (!isNaN(suffixNum) && suffixNum > maxNum) {
        maxNum = suffixNum;
      }
    }
  }
  return `${prefix}${String(maxNum + 1).padStart(3, "0")}`;
}

// Helper: Recalculate outstanding fee and enrollment status
export async function recalculateStudentLedger(studentId, transaction = null) {
  const student = await Student.findByPk(studentId, {
    include: [
      { model: User },
      { model: Fee, include: [{ model: Installment, as: "installments" }] },
      { model: Enrollment },
    ],
    transaction,
  });

  if (!student || !student.Fees || student.Fees.length === 0) {
    return;
  }

  const fee = student.Fees[0];
  const installments = fee.installments || [];

  const paid_ammount = installments.reduce((sum, inst) => sum + Number(inst.amount_settled || 0), 0);
  const due_amount = Math.max(0, Number(fee.total_amount) - paid_ammount);

  let payment_status = "PENDING_FIRST_PAYMENT";
  const todayStr = new Date().toISOString().slice(0, 10);

  // Check if all is paid
  if (due_amount <= 0) {
    payment_status = "COMPLETED";
  } else if (paid_ammount > 0) {
    payment_status = "ACTIVE";
  } else {
    payment_status = "PENDING_FIRST_PAYMENT";
  }

  // Check for overdue installments
  const hasOverdue = installments.some(
    (inst) => inst.status !== "PAID" && inst.due_date < todayStr
  );
  if (hasOverdue && payment_status !== "COMPLETED") {
    payment_status = "OVERDUE";
  }

  fee.paid_ammount = paid_ammount;
  fee.due_amount = due_amount;
  fee.payment_status = payment_status;
  await fee.save({ transaction });

  // Update installments status in DB based on settled amounts and due dates
  for (const inst of installments) {
    if (Number(inst.amount_settled) >= Number(inst.amount_due)) {
      inst.status = "PAID";
    } else if (inst.due_date < todayStr) {
      inst.status = "OVERDUE";
    } else {
      inst.status = "PENDING";
    }
    await inst.save({ transaction });
  }

  // Dynamic enrollment status update
  if (student.Enrollments && student.Enrollments.length > 0) {
    for (const enrollment of student.Enrollments) {
      if (payment_status === "PENDING_FIRST_PAYMENT") {
        enrollment.status = "PENDING_FIRST_PAYMENT";
      } else {
        enrollment.status = "ACTIVE";
      }
      await enrollment.save({ transaction });
    }
  }
}

// Enroll Student endpoint
export const enrollStudent = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    address,
    college_name,
    qualification,
    course_id,
    batch_id,
    discount_amount,
    scholarship_tag,
    payment_scheme_mode, // "FULL" or "INSTALLMENT"
    installments, // array of { label, amount_due, due_date }
  } = req.body;

  if (!name || !email?.trim() || !phone || !address || !qualification || !course_id) {
    res.status(400);
    throw new Error("Missing required fields");
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Validate email uniqueness
  const existingUser = await User.findOne({ where: { email: normalizedEmail } });
  if (existingUser) {
    res.status(400);
    throw new Error("A user with this email already exists");
  }

  // Fetch course and batch
  const course = await Course.findByPk(course_id);
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  let batch = null;
  if (batch_id && batch_id !== "") {
    batch = await Batch.findByPk(batch_id, {
      include: [{ model: Course }]
    });
    if (!batch || batch.course_id !== course.id) {
      res.status(400);
      throw new Error("Batch not found or not assigned to the selected course");
    }
    console.log("Batch found for enrollment:", batch.batch_name, "ID:", batch.id);
  } else {
    console.log("No batch_id provided, enrolling without batch");
  }

  // Calculate fees
  const baseFee = Number(course.fees || course.base_fee || 0);
  const discount = Number(discount_amount || 0);
  const finalFee = Math.max(0, baseFee - discount);

  // Parse and validate payment blueprint
  let finalInstallments = [];
  if (payment_scheme_mode === "INSTALLMENT") {
    if (!Array.isArray(installments) || installments.length === 0) {
      res.status(400);
      throw new Error("Installment details must be provided for installment plans");
    }

    const sumInstallments = installments.reduce((sum, inst) => sum + Number(inst.amount_due || 0), 0);
    if (sumInstallments !== finalFee) {
      res.status(400);
      throw new Error(`Validation constraint failed: Sum of installments (₹${sumInstallments}) must equal the final payable fee (₹${finalFee})`);
    }

    finalInstallments = installments.map((inst, index) => ({
      installment_label: inst.label || `Installment ${index + 1}`,
      amount_due: Number(inst.amount_due),
      amount_settled: 0,
      due_date: inst.due_date,
      status: "PENDING",
      sequence_number: index + 1,
    }));
  } else {
    // Full Payment: create a single installment row representing full amount due today
    const today = new Date().toISOString().slice(0, 10);
    finalInstallments = [
      {
        installment_label: "Full Payment",
        amount_due: finalFee,
        amount_settled: 0,
        due_date: today,
        status: "PENDING",
        sequence_number: 1,
      },
    ];
  }

  // Execute database entries in ACID transaction
  const result = await sequelize.transaction(async (t) => {
    // 1. Create User
    const studentRole = await getCanonicalRoleByName("STUDENT");
    const temporaryPassword = crypto.randomBytes(6).toString("hex") + "aA1!"; // safe temp pass
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(temporaryPassword, salt);

    const user = await User.create(
      {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role_id: studentRole.id,
        status: "inactive", // inactive until credentials invite accepted
      },
      { transaction: t }
    );

    // 2. Create Student
    const studentCode = await generateStudentCode();
    const today = new Date().toISOString().slice(0, 10);
    const student = await Student.create(
      {
        user_id: user.id,
        student_code: studentCode,
        phone,
        address,
        college_name: college_name || "",
        qualification,
        joining_date: today,
        profile_img: "",
      },
      { transaction: t }
    );

    // 3. Create Fee Ledger
    const fee = await Fee.create(
      {
        student_id: student.id,
        base_amount: baseFee,
        discount_amount: discount,
        payment_scheme_mode: payment_scheme_mode === "INSTALLMENT" ? "INSTALLMENT" : "FULL",
        scholarship_tag: scholarship_tag || null,
        total_amount: finalFee,
        paid_ammount: 0,
        due_amount: finalFee,
        payment_status: "PENDING_FIRST_PAYMENT",
      },
      { transaction: t }
    );

    // 4. Create Installments
    const createdInstallments = await Installment.bulkCreate(
      finalInstallments.map((inst) => ({
        ...inst,
        fee_id: fee.id,
      })),
      { transaction: t, returning: true }
    );

    // 5. Create Enrollment
    const enrollmentData = {
      student_id: student.id,
      enrollment_date: today,
      status: "PENDING_FIRST_PAYMENT",
    };
    
    if (batch_id && batch_id !== "" && batch) {
      enrollmentData.batch_id = batch.id;
      console.log("Creating enrollment with batch_id:", batch.id, "for student:", student.id);
    } else {
      console.log("Creating enrollment without batch_id for student:", student.id);
    }
    
    const enrollment = await Enrollment.create(enrollmentData, { transaction: t });
    console.log("Enrollment created with ID:", enrollment.id, "batch_id:", enrollment.batch_id);

    // 6. Generate invite credentials token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry
    await InviteToken.create(
      {
        token: rawToken,
        user_id: user.id,
        expiresAt,
      },
      { transaction: t }
    );

    return { user, student, fee, createdInstallments, rawToken };
  });

  // Send activation link email
  try {
    const activationLink = buildActivationLink(result.rawToken);
    await sendTemplateEmail(process.env.AUTH_TRAINER_HR_INVITE, {
      to_email: normalizedEmail,
      email: normalizedEmail,
      name,
      role: "Student",
      activationLink,
      activation_link: activationLink,
    });
  } catch (emailErr) {
    console.error("Failed to send verification invitation email:", emailErr.message);
  }

  // Send notification to admins about new student enrollment
  try {
    await sendNewStudentEnrollment(result.student.user_id, result.student.id, name, course.title);
  } catch (error) {
    console.error("Error sending enrollment notification:", error);
  }

  // Notify trainers about student assigned to batch
  if (batch) {
    try {
      await sendStudentAssignedToBatch(
        result.student.user_id,
        result.student.id,
        name,
        batch.id,
        batch.batch_name
      );

      await sendBatchAssignedToStudent(
        result.student.user_id,
        result.student.id,
        batch.id,
        batch.batch_name,
      );
    } catch (err) {
      console.error("Error sending student assigned to batch notification:", err);
    }
  }

  res.status(201).json({
    message: "Student enrolled and invitation sent successfully",
    studentId: result.student.id,
    studentCode: result.student.student_code,
  });
});

// Record Offline Settlement
export const recordOfflineSettle = asyncHandler(async (req, res) => {
  const { id: studentId } = req.params;
  const { installment_id, payment_method, reference_hashing } = req.body;

  if (!installment_id || !payment_method) {
    res.status(400);
    throw new Error("Installment ID and Payment Method are required");
  }

  const result = await sequelize.transaction(async (t) => {
    const student = await Student.findByPk(studentId, { transaction: t });
    if (!student) {
      res.status(404);
      throw new Error("Student not found");
    }

    const fee = await Fee.findOne({ where: { student_id: student.id }, transaction: t });
    if (!fee) {
      res.status(404);
      throw new Error("Fee record not found");
    }

    const installment = await Installment.findOne({
      where: { id: installment_id, fee_id: fee.id },
      transaction: t,
    });

    if (!installment) {
      res.status(404);
      throw new Error("Installment record not found");
    }

    if (installment.status === "PAID") {
      res.status(400);
      throw new Error("Installment has already been settled");
    }

    const today = new Date().toISOString().slice(0, 10);
    const amountToSettle = Number(installment.amount_due);

    // Create payment transaction record
    const payment = await Payment.create(
      {
        fee_id: fee.id,
        installment_id: installment.id,
        amount: amountToSettle,
        payment_date: today,
        payment_methhod: payment_method, // "Cash" or "Cheque"
        transaction_id: reference_hashing || `CASH-OFFLINE-${Date.now()}`,
        status: "SUCCESS",
      },
      { transaction: t }
    );

    // Flip installment status
    installment.amount_settled = amountToSettle;
    installment.status = "PAID";
    await installment.save({ transaction: t });

    return payment;
  });

  // Recalculate outstanding fee balances and toggle access
  await recalculateStudentLedger(studentId);

  // Send notification to admins about fee payment
  try {
    const student = await Student.findByPk(studentId, {
      include: [{ model: User, attributes: ["name", "id"] }],
    });
    if (student) {
      const today = new Date().toISOString().slice(0, 10);
      const amountSettled = result.amount || 0;
      await sendFeePayment(
        student.user_id,
        student.id,
        student.User?.name || "Unknown",
        amountSettled,
        today
      );
    }
  } catch (error) {
    console.error("Error sending offline fee payment notification:", error);
  }

  res.status(200).json({
    message: "Offline transaction recorded successfully",
    paymentId: result.id,
  });
});

// Force generate Razorpay Payment Link/Order ID
export const refreshRazorpayLink = asyncHandler(async (req, res) => {
  const { installmentId } = req.params;

  const installment = await Installment.findByPk(installmentId, {
    include: [{ model: Fee, as: "fee", include: [{ model: Student, include: [{ model: User }] }] }],
  });

  if (!installment) {
    res.status(404);
    throw new Error("Installment not found");
  }

  if (installment.status === "PAID") {
    res.status(400);
    throw new Error("Installment is already settled");
  }

  const razorpay = (() => {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      res.status(503);
      throw new Error("Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env");
    }
    return new Razorpay({ key_id, key_secret });
  })();

  const payableAmount = Math.max(0, Number(installment.amount_due) - Number(installment.amount_settled || 0));
  const amountInPaise = payableAmount * 100;

  try {
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `inst_receipt_${installment.id.slice(0, 8)}`,
      notes: {
        installment_id: installment.id,
        student_id: installment.fee?.student_id,
      },
    });

    installment.razorpay_order_id = order.id;
    await installment.save();

    res.json({
      message: "Razorpay order recreated successfully",
      razorpay_order_id: order.id,
    });
  } catch (err) {
    console.error("Razorpay orders.create failed:", err.message);
    res.status(500);
    throw new Error(`Razorpay Order generation failed: ${err.message}`);
  }
});

// Resend Credentials invitation link
export const resendInvitation = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findByPk(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await InviteToken.destroy({ where: { user_id: user.id } });
  await InviteToken.create({
    token: rawToken,
    user_id: user.id,
    expiresAt,
  });

  const activationLink = buildActivationLink(rawToken);

  await sendTemplateEmail(process.env.AUTH_TRAINER_HR_INVITE, {
    to_email: user.email,
    email: user.email,
    name: user.name,
    role: "Student",
    activationLink,
    activation_link: activationLink,
  });

  res.json({ message: "Invitation token resent successfully" });
});

// Modify Future Installments
export const modifyFutureInstallments = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { installments } = req.body; // Array of { id, label, amount_due, due_date }

  if (!Array.isArray(installments) || installments.length === 0) {
    res.status(400);
    throw new Error("Installments modifications list is required");
  }

  const student = await Student.findByPk(studentId, {
    include: [{ model: Fee, include: [{ model: Installment, as: "installments" }] }],
  });

  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }

  const fee = student.Fees?.[0];
  if (!fee) {
    res.status(404);
    throw new Error("Fee record not found");
  }

  const existingInstallments = fee.installments || [];
  const unpaidInstallments = existingInstallments.filter((inst) => inst.status !== "PAID");
  const paidInstallments = existingInstallments.filter((inst) => inst.status === "PAID");

  const totalPaidSettled = paidInstallments.reduce((sum, inst) => sum + Number(inst.amount_settled || 0), 0);
  const remainingDue = Number(fee.total_amount) - totalPaidSettled;

  // Enforce sum of modified unpaid installments equals remaining due amount
  const modifiedSum = installments.reduce((sum, inst) => sum + Number(inst.amount_due || 0), 0);
  if (modifiedSum !== remainingDue) {
    res.status(400);
    throw new Error(
      `Validation constraint failed: Sum of modified installments (₹${modifiedSum}) must equal remaining unpaid fee balance (₹${remainingDue})`
    );
  }

  // ACID transaction to drop existing unpaid installments and write new ones,
  // or update/recreate them
  await sequelize.transaction(async (t) => {
    // Delete existing unpaid ones
    await Installment.destroy({
      where: {
        fee_id: fee.id,
        status: { [Op.ne]: "PAID" },
      },
      transaction: t,
    });

    // Bulk create new ones
    const newInstallments = installments.map((inst, index) => ({
      fee_id: fee.id,
      installment_label: inst.label || inst.installment_label || `Installment ${paidInstallments.length + index + 1}`,
      amount_due: Number(inst.amount_due),
      amount_settled: 0,
      due_date: inst.due_date,
      status: "PENDING",
      sequence_number: paidInstallments.length + index + 1,
    }));

    await Installment.bulkCreate(newInstallments, { transaction: t });
  });

  // Recalculate ledger to ensure consistency
  await recalculateStudentLedger(studentId);

  res.json({ message: "Future installments modified successfully" });
});

export const updateStudentProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    status,
    phone,
    address,
    college_name,
    qualification,
    profile_img,
  } = req.body;

  const student = await Student.findByPk(id, {
    include: [{ model: User }],
  });

  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }

  const user = student.User;
  if (!user) {
    res.status(404);
    throw new Error("Associated User not found");
  }

  if (email && email.trim().toLowerCase() !== user.email.toLowerCase()) {
    const existing = await User.findOne({
      where: { email: email.trim().toLowerCase() },
    });
    if (existing) {
      res.status(400);
      throw new Error("Email is already taken by another user");
    }
  }

  await sequelize.transaction(async (t) => {
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email.trim().toLowerCase();
    if (status !== undefined) {
      if (user.id === req.user.id) {
        res.status(400);
        throw new Error("You cannot change your own status");
      }
      user.status = status;
    }
    await user.save({ transaction: t });

    if (phone !== undefined) student.phone = phone;
    if (address !== undefined) student.address = address;
    if (college_name !== undefined) student.college_name = college_name;
    if (qualification !== undefined) student.qualification = qualification;
    if (profile_img !== undefined) {
      student.profile_img = handleFileUpload(profile_img, "profile");
    }
    await student.save({ transaction: t });
  });

  await recalculateStudentLedger(student.id);

  res.json({
    message: "Student profile updated successfully",
    student: {
      id: student.id,
      name: user.name,
      email: user.email,
      status: user.status,
      phone: student.phone,
      address: student.address,
      college_name: student.college_name,
      qualification: student.qualification,
      profile_img: student.profile_img,
    },
  });
});

const studentProfileInclude = [
  { model: User, attributes: ["id", "name", "email", "status"] },
  {
    model: Fee,
    required: false,
    include: [
      { model: Installment, as: "installments" },
      { model: Payment, as: "payments" },
    ],
  },
  { model: Attendance, required: false },
  { model: Enrollment, include: [{ model: Batch, include: [{ model: Course }] }] },
];

function sortStudentInstallments(student) {
  const fee = student?.Fees?.[0];
  if (fee?.installments) {
    fee.installments.sort((a, b) => (a.sequence_number ?? 0) - (b.sequence_number ?? 0));
  }
  return student;
}

/** Authenticated student reads their own fee ledger and enrollment profile */
export const getMyFeeProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({
    where: { user_id: req.user.id },
    include: studentProfileInclude,
  });

  if (!student) {
    res.status(404);
    throw new Error("Student profile not found for this account");
  }

  res.json(sortStudentInstallments(student));
});
