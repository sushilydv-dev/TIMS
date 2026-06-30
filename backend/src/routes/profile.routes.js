import express from "express";
import protect from "../middlewares/authmiddleware.js";
import { getBasicProfile } from "../controllers/basicProfile.controller.js";

const router = express.Router();

router.use(protect);
router.get("/basic/:type/:id", getBasicProfile);

export default router;
