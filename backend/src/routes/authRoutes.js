import express from "express"
import {registerUser,loginUser,getProfile,sendOTP} from "../controllers/authcontroller.js"
import protect from "../middlewares/authmiddleware.js"
const router =express.Router()
router.post('/send-otp',sendOTP)
router.post('/register',registerUser)
router.post('/login',loginUser)
router.get('/profile', protect, getProfile)
export default router;