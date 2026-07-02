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

const router = express.Router();

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
