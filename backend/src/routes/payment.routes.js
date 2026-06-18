import express from "express";
import protect from "../middlewares/authmiddleware.js";
import {
  createRazorpayOrder,
  handleRazorpayWebhook,
  verifyRazorpayPayment,
} from "../controllers/payment.controller.js";

const router = express.Router();

// Public webhook route
router.post("/razorpay-webhook", handleRazorpayWebhook);

// Student-authenticated order creation and verification
router.post("/razorpay-order", protect, createRazorpayOrder);
router.post("/verify-payment", protect, verifyRazorpayPayment);

export default router;

