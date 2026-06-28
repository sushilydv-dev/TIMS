import crypto from "crypto";
import sequelize from "../config/db.js";
import Installment from "../models/installment.js";
import Fee from "../models/fee.js";
import Student from "../models/student.js";
import Payment from "../models/payment.js";
import User from "../models/user.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { recalculateStudentLedger } from "./studentControl.controller.js";
import { getUserRoleForClient } from "../utils/roleHelpers.js";
import Razorpay from "razorpay";
import { sendFeePayment } from "../services/notification.service.js";

function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error("Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env");
  }
  return new Razorpay({ key_id, key_secret });
}

async function resolveStudentForPayment(req, student_id) {
  const role = await getUserRoleForClient(req.user);
  if (role === "STUDENT") {
    const ownedStudent = await Student.findOne({ where: { user_id: req.user.id } });
    if (!ownedStudent) {
      const err = new Error("Student profile not found for this account");
      err.statusCode = 404;
      throw err;
    }
    return ownedStudent;
  }

  if (!student_id) {
    const err = new Error("Student ID is required");
    err.statusCode = 400;
    throw err;
  }

  const student = await Student.findByPk(student_id);
  if (!student) {
    const err = new Error("Student not found");
    err.statusCode = 404;
    throw err;
  }
  return student;
}

function getPayableAmount(installment) {
  return Math.max(0, Number(installment.amount_due) - Number(installment.amount_settled || 0));
}

// Student-authenticated order creation
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { installment_id, student_id } = req.body;

  if (!installment_id) {
    res.status(400);
    throw new Error("Installment ID is required");
  }

  const student = await resolveStudentForPayment(req, student_id);

  const fee = await Fee.findOne({ where: { student_id: student.id } });
  if (!fee) {
    res.status(404);
    throw new Error("Student fee record not found");
  }

  const installment = await Installment.findOne({
    where: { id: installment_id, fee_id: fee.id },
  });

  if (!installment) {
    res.status(404);
    throw new Error("Installment record not found");
  }

  if (installment.status === "PAID") {
    res.status(400);
    throw new Error("Installment is already paid");
  }

  const payableAmount = getPayableAmount(installment);
  if (payableAmount <= 0) {
    res.status(400);
    throw new Error("Nothing due on this installment");
  }

  let razorpay;
  try {
    razorpay = getRazorpayClient();
  } catch (err) {
    res.status(503);
    throw err;
  }

  const amountInPaise = payableAmount * 100;

  try {
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `inst_receipt_${installment.id.slice(0, 8)}`,
      notes: {
        installment_id: installment.id,
        student_id: student.id,
      },
    });

    installment.razorpay_order_id = order.id;
    await installment.save();

    res.status(200).json({
      razorpay_order_id: order.id,
      amount: payableAmount,
      currency: "INR",
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Razorpay Order creation failed:", err.message);
    res.status(500);
    throw new Error(`Razorpay checkout setup failed: ${err.message}`);
  }
});

// Student payment verification and settlement
export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, student_id } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400);
    throw new Error("Missing required payment verification details");
  }

  // Verify signature
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    res.status(503);
    throw new Error("Razorpay is not configured on the server");
  }
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error("Payment signature verification failed");
  }

  // Update payment status in database
  let studentIdToRecalculate = student_id;
  await sequelize.transaction(async (t) => {
    const installment = await Installment.findOne({
      where: { razorpay_order_id },
      include: [{ model: Fee, as: "fee" }],
      transaction: t,
    });

    if (!installment) {
      throw new Error(`Installment not found for order ID: ${razorpay_order_id}`);
    }

    if (!studentIdToRecalculate) {
      studentIdToRecalculate = installment.fee?.student_id;
    }

    if (installment.status !== "PAID") {
      const settledAmount = getPayableAmount(installment) || Number(installment.amount_due);

      // Create payment transaction record
      await Payment.create(
        {
          fee_id: installment.fee_id,
          installment_id: installment.id,
          amount: settledAmount,
          payment_date: new Date().toISOString().slice(0, 10),
          payment_methhod: "ONLINE",
          transaction_id: razorpay_payment_id,
          status: "SUCCESS",
        },
        { transaction: t }
      );

      // Settle installment
      installment.amount_settled = Number(installment.amount_due);
      installment.status = "PAID";
      installment.razorpay_payment_id = razorpay_payment_id;
      installment.razorpay_signature = razorpay_signature;
      await installment.save({ transaction: t });
    }
  });

  if (studentIdToRecalculate) {
    await recalculateStudentLedger(studentIdToRecalculate);
  }

  // Send notification to admins about fee payment
  try {
    const student = await Student.findByPk(studentIdToRecalculate, {
      include: [{ model: User, attributes: ["name"] }],
    });
    if (student) {
      await sendFeePayment(
        student.user_id,
        student.id,
        student.User?.name || "Unknown",
        settledAmount,
        new Date().toISOString().slice(0, 10)
      );
    }
  } catch (error) {
    console.error("Error sending payment notification:", error);
  }

  res.status(200).json({ message: "Payment verified and settled successfully" });
});


// Asynchronous Webhook validation and settlement
export const handleRazorpayWebhook = asyncHandler(async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "razorpay_webhook_secret_123";
  const signature = req.headers["x-razorpay-signature"];

  if (!signature) {
    res.status(400);
    throw new Error("Webhook signature is missing");
  }

  // Validate webhook signature authenticity
  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(req.body));
  const expectedSignature = shasum.digest("hex");

  if (signature !== expectedSignature) {
    res.status(400);
    throw new Error("Webhook signature verification failed");
  }

  const event = req.body.event;
  if (event === "payment.captured") {
    const paymentEntity = req.body.payload?.payment?.entity;
    const razorpayOrderId = paymentEntity?.order_id;
    const razorpayPaymentId = paymentEntity?.id;
    const method = paymentEntity?.method || "UPI";
    const amountSettledPaise = paymentEntity?.amount || 0;
    const amountSettled = Math.round(amountSettledPaise / 100);

    if (!razorpayOrderId) {
      console.warn("Webhook received payment.captured without order_id");
      return res.status(200).json({ status: "skipped", reason: "no order_id" });
    }

    // ACID transaction to settle payment ledger states securely
    let studentIdToRecalculate = null;
    await sequelize.transaction(async (t) => {
      const installment = await Installment.findOne({
        where: { razorpay_order_id: razorpayOrderId },
        include: [{ model: Fee, as: "fee" }],
        transaction: t,
      });

      if (!installment) {
        throw new Error(`Installment not found for order ID: ${razorpayOrderId}`);
      }

      studentIdToRecalculate = installment.fee?.student_id;

      if (installment.status !== "PAID") {
        // Appends record to payments log table
        await Payment.create(
          {
            fee_id: installment.fee_id,
            installment_id: installment.id,
            amount: amountSettled,
            payment_date: new Date().toISOString().slice(0, 10),
            payment_methhod: method.toUpperCase(),
            transaction_id: razorpayPaymentId || razorpayOrderId,
            status: "SUCCESS",
          },
          { transaction: t }
        );

        // Flip status
        installment.amount_settled = amountSettled;
        installment.status = "PAID";
        installment.razorpay_payment_id = razorpayPaymentId;
        await installment.save({ transaction: t });
      }
    });

    if (studentIdToRecalculate) {
      await recalculateStudentLedger(studentIdToRecalculate);
    }

    // Send notification to admins about fee payment
    try {
      const student = await Student.findByPk(studentIdToRecalculate, {
        include: [{ model: User, attributes: ["name"] }],
      });
      if (student) {
        await sendFeePayment(
          student.user_id,
          student.id,
          student.User?.name || "Unknown",
          amountSettled,
          new Date().toISOString().slice(0, 10)
        );
      }
    } catch (error) {
      console.error("Error sending payment notification:", error);
    }
  }

  res.status(200).json({ status: "ok" });
});
