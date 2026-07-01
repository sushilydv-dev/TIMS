import express from "express"
import authRoutes from "./authRoutes.js"
import adminRoutes from "./admin.routes.js"
import paymentRoutes from "./payment.routes.js"
import studentControlRoutes from "./studentControl.routes.js"
import studentRoutes from "./student.routes.js"
import trainerRoutes from "./trainer.routes.js"
import publicRoutes from "./public.routes.js"
import notificationRoutes from "./notification.routes.js"
import appointmentRoutes from "./appointment.routes.js"
import certificateRoutes from "./certificate.routes.js"
import profileRoutes from "./profile.routes.js"
const router=express.Router()
router.use("/auth", authRoutes);
router.use("/public", publicRoutes);
router.use("/admin", adminRoutes);
router.use("/admin/students", studentControlRoutes);
router.use("/students", studentRoutes);
router.use("/trainer", trainerRoutes);
router.use("/v1/payments", paymentRoutes);
router.use("/notifications", notificationRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/certificates", certificateRoutes);
router.use("/profile", profileRoutes);

export default router;
