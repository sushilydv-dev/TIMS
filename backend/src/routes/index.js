import express from "express"
import authRoutes from "./authRoutes.js"
import adminRoutes from "./admin.routes.js"
const router=express.Router()
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);

export default router;