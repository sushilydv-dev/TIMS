import express from "express"
import authRoutes from "./authRoutes.js"
import adminRoutes from "./admin.routes.js"
import paymentRoutes from "./payment.routes.js"
import studentControlRoutes from "./studentControl.routes.js"
import studentRoutes from "./student.routes.js"
const router=express.Router()
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/admin/students", studentControlRoutes);
router.use("/students", studentRoutes);
router.use("/v1/payments", paymentRoutes);

export default router;