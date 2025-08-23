const express = require("express");
const router = express.Router();

// Mock data - replace with your database queries
const notifications = [
  {
    id: 1,
    title: "Production Target Achieved",
    message: "Daily tea production target of 500kg successfully achieved",
    body: "Daily tea production target of 500kg successfully achieved",
    timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    time: "2 minutes ago",
    read: false,
    type: "production",
    priority: "high",
    isNew: true,
  },
  {
    id: 2,
    title: "Quality Check Required",
    message: "Batch #2024-001 requires immediate quality inspection",
    body: "Batch #2024-001 requires immediate quality inspection",
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    time: "30 minutes ago",
    read: false,
    type: "quality",
    priority: "urgent",
    isNew: true,
  },
  {
    id: 3,
    title: "Machine Maintenance Scheduled",
    message: "Tea processing machine #3 scheduled for maintenance tomorrow",
    body: "Tea processing machine #3 scheduled for maintenance tomorrow",
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    time: "1 hour ago",
    read: false,
    type: "maintenance",
    priority: "medium",
    isNew: false,
  },
  {
    id: 4,
    title: "Staff Meeting Reminder",
    message: "Weekly production meeting scheduled at 2:00 PM today",
    body: "Weekly production meeting scheduled at 2:00 PM today",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    time: "3 hours ago",
    read: true,
    type: "meeting",
    priority: "low",
    isNew: false,
  },
  {
    id: 5,
    title: "New Order Received",
    message: "Large order received for premium Ceylon tea - 1000kg",
    body: "Large order received for premium Ceylon tea - 1000kg",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    time: "6 hours ago",
    read: true,
    type: "order",
    priority: "high",
    isNew: false,
  },
  {
    id: 6,
    title: "Temperature Alert Resolved",
    message: "Processing room temperature has returned to optimal range",
    body: "Processing room temperature has returned to optimal range",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    time: "1 day ago",
    read: true,
    type: "alert",
    priority: "medium",
    isNew: false,
  },
];

// GET /api/notifications - Get all notifications
router.get("/", (req, res) => {
  try {
    const { unreadOnly, limit, type } = req.query;

    let filtered = [...notifications];

    // Filter by read status
    if (unreadOnly === "true") {
      filtered = filtered.filter((n) => !n.read);
    }

    // Filter by type
    if (type) {
      filtered = filtered.filter((n) => n.type === type);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp - a.timestamp);

    // Limit results
    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum)) {
        filtered = filtered.slice(0, limitNum);
      }
    }

    // Format notifications for frontend
    const formattedNotifications = filtered.map((notification) => ({
      id: notification.id,
      title: notification.title,
      body: notification.message || notification.body,
      time: formatTimeAgo(notification.timestamp),
      read: notification.read,
      type: notification.type,
      priority: notification.priority,
      isNew: notification.isNew,
      timestamp: notification.timestamp,
    }));

    res.json({ success: true, data: formattedNotifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json([]);
  }
});

// GET /api/notifications/unread-count - Get unread notification count
router.get("/unread-count", (req, res) => {
  try {
    const unreadCount = notifications.filter((n) => !n.read).length;
    res.json({
      success: true,
      data: { count: unreadCount },
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({
      success: false,
      count: 0,
    });
  }
});

// GET /api/notifications/:id - Get specific notification
router.get("/:id", (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const notification = notifications.find((n) => n.id === notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: "Notification not found",
      });
    }

    res.json({
      success: true,
      data: {
        id: notification.id,
        title: notification.title,
        body: notification.message || notification.body,
        time: formatTimeAgo(notification.timestamp),
        read: notification.read,
        type: notification.type,
        priority: notification.priority,
        timestamp: notification.timestamp,
      },
    });
  } catch (error) {
    console.error("Error fetching notification:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// PATCH /api/notifications/:id/read - Mark notification as read
router.patch("/:id/read", (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const notification = notifications.find((n) => n.id === notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: "Notification not found",
      });
    }

    notification.read = true;
    notification.isNew = false; // Mark as not new once read

    res.json({
      success: true,
      data: notification,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST /api/notifications/mark-all-read - Mark all notifications as read
router.post("/mark-all-read", (req, res) => {
  try {
    let markedCount = 0;

    notifications.forEach((notification) => {
      if (!notification.read) {
        notification.read = true;
        notification.isNew = false;
        markedCount++;
      }
    });

    res.json({
      success: true,
      message: "All notifications marked as read",
      markedCount: markedCount,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST /api/notifications - Create new notification
router.post("/", (req, res) => {
  try {
    const { title, message, type, priority } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: "Title and message are required",
      });
    }

    const newNotification = {
      id: Math.max(...notifications.map((n) => n.id)) + 1,
      title,
      message,
      body: message,
      timestamp: new Date(),
      time: "Just now",
      read: false,
      type: type || "general",
      priority: priority || "medium",
      isNew: true,
    };

    notifications.unshift(newNotification); // Add to beginning

    res.status(201).json({
      success: true,
      data: newNotification,
      message: "Notification created successfully",
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// DELETE /api/notifications/:id - Delete notification
router.delete("/:id", (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const index = notifications.findIndex((n) => n.id === notificationId);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: "Notification not found",
      });
    }

    const deletedNotification = notifications.splice(index, 1)[0];

    res.json({
      success: true,
      data: deletedNotification,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Helper function to format time ago
function formatTimeAgo(date) {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes === 1) return "1 minute ago";
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;

  // For older notifications, show date
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

module.exports = router;
