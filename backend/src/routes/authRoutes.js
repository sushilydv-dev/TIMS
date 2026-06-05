import express from "express"
import {
    registerUser,
    loginUser,
    getProfile,
    sendOTP,
    forgotPassword,
    resetPassword,
    getActivationInfo,
    activateAccount,
} from "../controllers/authcontroller.js"
import protect from "../middlewares/authmiddleware.js"
const router =express.Router()
router.post('/send-otp',sendOTP)
router.post('/register',registerUser)
router.post('/login',loginUser)
router.post('/forgot-password',forgotPassword)
router.post('/reset-password',resetPassword)
router.get("/profile", protect, getProfile);
router.get("/activate/:token", getActivationInfo);
router.post("/activate", activateAccount);
export default router;