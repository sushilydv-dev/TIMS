import express from "express";
import protect from "../middlewares/authmiddleware.js";
import { getMyFeeProfile } from "../controllers/studentControl.controller.js";

const router = express.Router();

router.use(protect);

router.get("/me/fees", getMyFeeProfile);

export default router;
