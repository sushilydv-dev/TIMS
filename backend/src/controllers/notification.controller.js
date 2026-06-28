import Notification from "../models/notification.js";
import User from "../models/user.js";
import { Op } from "sequelize";

// Get all notifications for a user
export const getNotifications = async (req, res) => {
  try {
    console.log("=== NOTIFICATION FETCH START ===");
    console.log("Request user:", req.user);
    console.log("Request user id:", req.user?.id);
    console.log("Request user role:", req.user?.role);
    
    const user_id = req.user?.id;
    const { filter = "all" } = req.query;

    if (!user_id) {
      console.error("No user_id found in request.user");
      return res.status(401).json({ error: "User not authenticated" });
    }

    console.log("Fetching notifications for user:", user_id, "filter:", filter);

    const whereClause = { user_id };

    if (filter === "unread") {
      whereClause.is_read = false;
    } else if (filter === "read") {
      whereClause.is_read = true;
    }

    console.log("Where clause:", JSON.stringify(whereClause));

    // Try a simple count first
    const count = await Notification.count({ where: whereClause });
    console.log("Notification count:", count);

    // Then fetch the actual notifications
    const notifications = await Notification.findAll({
      where: whereClause,
      order: [["created_at", "DESC"]],
    });

    console.log("Found notifications:", notifications.length);
    console.log("First notification sample:", notifications[0] ? JSON.stringify(notifications[0].toJSON()) : "none");

    const formatted = notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.is_read,
      relatedUserId: n.related_user_id,
      relatedUserName: null,
      relatedData: n.related_data,
      actionUrl: n.action_url,
      time: formatTimeAgo(n.created_at),
    }));

    console.log("Formatted notifications:", formatted.length);
    console.log("=== NOTIFICATION FETCH END ===");
    
    res.json(formatted);
  } catch (error) {
    console.error("=== NOTIFICATION FETCH ERROR ===");
    console.error("Error message:", error.message);
    console.error("Error name:", error.name);
    console.error("Error stack:", error.stack);
    console.error("=== END ERROR ===");
    
    res.status(500).json({ error: "Failed to fetch notifications", details: error.message });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const user_id = req.user?.id;
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      where: { id: notificationId, user_id },
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    await notification.update({ is_read: true });

    res.json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const user_id = req.user?.id;

    await Notification.update(
      { is_read: true },
      { where: { user_id, is_read: false } }
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const user_id = req.user?.id;
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      where: { id: notificationId, user_id },
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    await notification.destroy();

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Failed to delete notification" });
  }
};

// Clear all notifications
export const clearAll = async (req, res) => {
  try {
    const user_id = req.user?.id;

    await Notification.destroy({ where: { user_id } });

    res.json({ success: true });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    res.status(500).json({ error: "Failed to clear notifications" });
  }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const user_id = req.user?.id;

    const count = await Notification.count({
      where: { user_id, is_read: false },
    });

    res.json({ count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
};

// Create notification (helper function)
export const createNotification = async (data) => {
  try {
    const notification = await Notification.create(data);
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Delete old notifications (older than 30 days)
export const deleteOldNotifications = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deleted = await Notification.destroy({
      where: {
        created_at: {
          [Op.lt]: thirtyDaysAgo,
        },
      },
    });

    console.log(`Deleted ${deleted} old notifications`);
  } catch (error) {
    console.error("Error deleting old notifications:", error);
  }
};

// Helper function to format time ago
function formatTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
}
