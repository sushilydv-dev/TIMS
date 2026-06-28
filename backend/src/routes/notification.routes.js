import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAll,
  getUnreadCount,
} from "../controllers/notification.controller.js";
import protect from "../middlewares/authmiddleware.js";
import User from "../models/user.js";
import Role from "../models/role.js";

const router = express.Router();

// Test endpoint to check admin users (no auth required for testing)
router.get("/test-admins", async (req, res) => {
  try {
    const admins = await User.findAll({
      include: [
        {
          model: Role,
          as: "role",
          where: { role_name: "ADMIN" },
        },
      ],
      attributes: ["id", "name", "email"],
    });
    res.json({
      count: admins.length,
      admins: admins,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// All notification routes require authentication
router.use(protect);

// Get all notifications for the authenticated user
router.get("/", getNotifications);

// Get unread count
router.get("/unread-count", getUnreadCount);

// Mark a notification as read
router.patch("/:notificationId/read", markAsRead);

// Mark all notifications as read
router.patch("/mark-all-read", markAllAsRead);

// Delete a notification
router.delete("/:notificationId", deleteNotification);

// Clear all notifications
router.delete("/", clearAll);

export default router;
