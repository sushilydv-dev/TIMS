import express from "express";
import { getCurriculum, getCourse } from "../controllers/courses.controller.js";
import Trainer from "../models/trainer.js";
import User from "../models/user.js";

const router = express.Router();

router.get("/curriculum", getCurriculum);
router.get("/courses/:id", getCourse);

// Public endpoint to get top 5 trainers for homepage carousel
router.get("/trainers", async (req, res) => {
  try {
    const { literal } = await import("sequelize");
    const trainers = await Trainer.findAll({
      include: [{ model: User, attributes: ["id", "name"] }],
      order: [[literal('"Trainer"."id"'), "ASC"]],
      limit: 5,
    });

    res.json(trainers.map(t => ({
      id:             t.id,
      name:           t.User?.name || "Trainer",
      experience:     `${t.experience_year || 0} yr${t.experience_year !== 1 ? "s" : ""} exp`,
      specialization: t.specialization || "General Training",
      profile_img:    t.profile_img   || "",
    })));
  } catch (err) {
    console.error("Error fetching trainers:", err);
    res.status(500).json({ error: "Failed to fetch trainers" });
  }
});

export default router;
