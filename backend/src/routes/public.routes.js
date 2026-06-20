import express from "express";
import { getCurriculum, getCourse } from "../controllers/courses.controller.js";

const router = express.Router();

router.get("/curriculum", getCurriculum);
router.get("/courses/:id", getCourse);

export default router;
