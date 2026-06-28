import React, { useState, useEffect } from "react";
import { FiBell, FiCheck, FiTrash2, FiClock, FiAlertCircle, FiCheckCircle, FiUser } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useAuth } from "../../app/AuthContext";
import axios from "axios";
import { io } from "socket.io-client";

const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) return;

    console.log("Enabling Socket.IO real-time notification client...");
    const newSocket = io({
      path: "/socket.io",
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("Connected to Socket.IO notification server");
      newSocket.emit("join", user.id);
    });

    newSocket.on("new_notification", (notification) => {
      console.log("Real-time notification received:", notification);
      setNotifications((prev) => [notification, ...prev]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get(`/api/notifications?filter=${filter}`);
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(`/api/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch("/api/notifications/mark-all-read");
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`/api/notifications/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const clearAll = async () => {
    try {
      await axios.delete("/api/notifications");
      setNotifications([]);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "fee_reminder":
      case "fee_missed":
        return <FiAlertCircle className="w-5 h-5 text-amber-500" />;
      case "trainer_profile_complete":
      case "new_student_enrollment":
      case "fee_payment":
        return <FiCheckCircle className="w-5 h-5 text-emerald-500" />;
      case "student_assigned_to_batch":
        return <FiUser className="w-5 h-5 text-blue-500" />;
      case "project_submission":
        return <FiAward className="w-5 h-5 text-purple-500" />;
      case "trainer_assigned_to_batch":
        return <FiLayers className="w-5 h-5 text-indigo-500" />;
      case "success":
        return <FiCheckCircle className="w-5 h-5 text-emerald-500" />;
      case "warning":
        return <FiAlertCircle className="w-5 h-5 text-amber-500" />;
      case "error":
        return <FiAlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FiBell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTypeBg = (type) => {
    switch (type) {
      case "fee_reminder":
      case "fee_missed":
        return "bg-amber-50 border-amber-200";
      case "trainer_profile_complete":
      case "new_student_enrollment":
      case "fee_payment":
        return "bg-emerald-50 border-emerald-200";
      case "student_assigned_to_batch":
        return "bg-blue-50 border-blue-200";
      case "project_submission":
        return "bg-purple-50 border-purple-200";
      case "trainer_assigned_to_batch":
        return "bg-indigo-50 border-indigo-200";
      case "success":
        return "bg-emerald-50 border-emerald-200";
      case "warning":
        return "bg-amber-50 border-amber-200";
      case "error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="text-[#636363]">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#0c0407]">Notification Center</h2>
          <p className="text-sm text-[#636363] mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : "All notifications read"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#0c0407] bg-white border border-black/[0.08] rounded-xl hover:bg-[#f8fafc] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <FiCheck className="w-4 h-4" />
            Mark All Read
          </button>
          <button
            onClick={clearAll}
            disabled={notifications.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#b91c1c] bg-white border border-black/[0.08] rounded-xl hover:bg-[#fef2f2] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <FiTrash2 className="w-4 h-4" />
            Clear All
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 bg-[#f8fafc] p-1 rounded-xl w-fit">
        {["all", "unread", "read"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all capitalize ${
              filter === f
                ? "bg-white text-[#0c0407] shadow-sm"
                : "text-[#636363] hover:text-[#0c0407]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12 bg-white border border-black/[0.04] rounded-2xl">
            <FiBell className="w-12 h-12 text-[#94a3b8] mx-auto mb-4" />
            <p className="text-[#636363] font-medium">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white border rounded-2xl p-4 transition-all hover:shadow-md ${
                notification.read ? "border-black/[0.04] opacity-70" : "border-black/[0.08] shadow-sm"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${getTypeBg(notification.type)} border flex items-center justify-center`}>
                  {getTypeIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`font-semibold text-[#0c0407] ${!notification.read ? "font-bold" : ""}`}>
                      {notification.title}
                    </h3>
                    <span className="flex items-center gap-1 text-xs text-[#94a3b8] shrink-0">
                      <FiClock className="w-3 h-3" />
                      {notification.time}
                    </span>
                  </div>
                  <p className="text-sm text-[#636363] mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  {notification.relatedUserName && (
                    <div className="flex items-center gap-2 mt-2">
                      <FiUser className="w-3 h-3 text-[#94a3b8]" />
                      <span className="text-xs text-[#94a3b8]">{notification.relatedUserName}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {notification.actionUrl && (
                    <Link
                      to={notification.actionUrl}
                      className="p-2 text-[#94a3b8] hover:text-[#fc362d] hover:bg-[#fef2f2] rounded-lg transition-all"
                      title="View Details"
                    >
                      <FiUser className="w-4 h-4" />
                    </Link>
                  )}
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 text-[#94a3b8] hover:text-[#0c0407] hover:bg-[#f8fafc] rounded-lg transition-all"
                      title="Mark as read"
                    >
                      <FiCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-2 text-[#94a3b8] hover:text-[#b91c1c] hover:bg-[#fef2f2] rounded-lg transition-all"
                    title="Delete"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
