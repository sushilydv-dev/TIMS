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
    updateProfile,
    changePassword,
    refreshToken,
    logout,
} from "../controllers/authcontroller.js"
import protect from "../middlewares/authmiddleware.js"
const router =express.Router()
router.post('/send-otp',sendOTP)
router.post('/register',registerUser)
router.post('/login',loginUser)
router.post('/forgot-password',forgotPassword)
router.post('/reset-password',resetPassword)
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.get("/activate/:token", getActivationInfo);
router.post("/activate", activateAccount);
export default router;