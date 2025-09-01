import express from "express";
import connectDB from "../config/db.js";

const router = express.Router();

// GET /api/messages/search-users - Search users by name
router.get("/search-users", async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    const { query } = req.query;

    if (!currentUserId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    if (!query) {
      return res
        .status(400)
        .json({ success: false, error: "Search query is required" });
    }

    const db = await connectDB();
    const [users] = await db.execute(
      `
      SELECT id, name, email, role, employee_id
      FROM users 
      WHERE id != ? AND (
        name LIKE ? OR 
        email LIKE ? OR 
        role LIKE ? OR 
        employee_id LIKE ?
      )
      LIMIT 10
    `,
      [currentUserId, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]
    );

    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      employee_id: user.employee_id,
      initials: getInitials(user.name),
    }));

    res.json({ success: true, data: formattedUsers });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ success: false, error: "Failed to search users" });
  }
});

// POST /api/messages/send-by-name - Send message by user name
router.post("/send-by-name", async (req, res) => {
  try {
    const senderId = req.user?.id;
    const { receiverName, message } = req.body;

    if (!senderId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    if (!receiverName || !message) {
      return res
        .status(400)
        .json({ success: false, error: "Missing receiverName or message" });
    }

    const db = await connectDB();

    // Find receiver by name
    const [receivers] = await db.execute(
      "SELECT id, name, role FROM users WHERE name LIKE ? LIMIT 1",
      [`%${receiverName}%`]
    );

    if (receivers.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const receiver = receivers[0];

    // Insert message
    const [result] = await db.execute(
      "INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)",
      [senderId, receiver.id, message.trim()]
    );

    const [newMessage] = await db.execute(
      `SELECT m.*, u.name as sender_name, u.role as sender_role 
       FROM messages m 
       JOIN users u ON m.sender_id = u.id 
       WHERE m.id = ?`,
      [result.insertId]
    );

    res.json({
      success: true,
      data: {
        id: newMessage[0].id,
        senderId: newMessage[0].sender_id,
        receiverId: receiver.id,
        receiverName: receiver.name,
        receiverRole: receiver.role,
        message: newMessage[0].message,
        time: formatMessageTime(newMessage[0].timestamp),
        timestamp: newMessage[0].timestamp,
        read: false,
      },
      message: `Message sent successfully to ${receiver.name}`,
    });
  } catch (error) {
    console.error("Error sending message by name:", error);
    res.status(500).json({ success: false, error: "Failed to send message" });
  }
});

// GET /api/messages - Get all conversation threads
router.get("/", async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const db = await connectDB();
    const [conversations] = await db.execute(
      `
      SELECT 
        m.id, m.sender_id, m.receiver_id, m.message, m.timestamp, m.read_status,
        u1.name as sender_name, u1.role as sender_role,
        u2.name as receiver_name, u2.role as receiver_role
      FROM messages m
      JOIN users u1 ON m.sender_id = u1.id
      JOIN users u2 ON m.receiver_id = u2.id
      WHERE m.id IN (
        SELECT MAX(id) FROM messages
        WHERE sender_id = ? OR receiver_id = ?
        GROUP BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id)
      )
      ORDER BY m.timestamp DESC
    `,
      [currentUserId, currentUserId]
    );

    const formattedConversations = conversations.map((conv) => {
      // Determine who is the "other" person in the conversation
      const isCurrentUserSender = conv.sender_id === currentUserId;
      const otherPersonId = isCurrentUserSender
        ? conv.receiver_id
        : conv.sender_id;
      const otherPersonName = isCurrentUserSender
        ? conv.receiver_name
        : conv.sender_name;
      const otherPersonRole = isCurrentUserSender
        ? conv.receiver_role
        : conv.sender_role;

      return {
        id: conv.id,
        senderId: conv.sender_id,
        senderName: conv.sender_name,
        senderRole: conv.sender_role,
        senderInitials: getInitials(conv.sender_name),
        receiverId: conv.receiver_id,
        receiverName: conv.receiver_name,
        receiverRole: conv.receiver_role,
        receiverInitials: getInitials(conv.receiver_name),
        // For conversation display, show the "other" person's info
        otherPersonId: otherPersonId,
        otherPersonName: otherPersonName,
        otherPersonRole: otherPersonRole,
        otherPersonInitials: getInitials(otherPersonName),
        body: conv.message,
        time: formatMessageTime(conv.timestamp),
        read: Boolean(conv.read_status),
        unread: !Boolean(conv.read_status) && conv.sender_id !== currentUserId,
      };
    });

    res.json({ success: true, data: formattedConversations });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ success: false, error: "Failed to fetch messages" });
  }
});

// GET /api/messages/chat/:userId - Get chat history with specific user
router.get("/chat/:userId", async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    const otherUserId = req.params.userId;

    if (!currentUserId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const db = await connectDB();

    // Get both sender and receiver information for all messages
    const [messages] = await db.execute(
      `
      SELECT 
        m.id, m.sender_id, m.receiver_id, m.message, m.timestamp, m.read_status,
        u1.name as sender_name, u1.role as sender_role,
        u2.name as receiver_name, u2.role as receiver_role
      FROM messages m
      JOIN users u1 ON m.sender_id = u1.id
      JOIN users u2 ON m.receiver_id = u2.id
      WHERE (m.sender_id = ? AND m.receiver_id = ?)
         OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.timestamp ASC
    `,
      [currentUserId, otherUserId, otherUserId, currentUserId]
    );

    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      senderId: msg.sender_id,
      senderName: msg.sender_name,
      senderRole: msg.sender_role,
      senderInitials: getInitials(msg.sender_name),
      receiverId: msg.receiver_id,
      receiverName: msg.receiver_name,
      receiverRole: msg.receiver_role,
      receiverInitials: getInitials(msg.receiver_name),
      message: msg.message,
      time: formatMessageTime(msg.timestamp),
      timestamp: msg.timestamp,
      read: Boolean(msg.read_status),
    }));

    res.json({ success: true, data: formattedMessages });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch chat history" });
  }
});

// POST /api/messages/send - Send message to a user
router.post("/send", async (req, res) => {
  try {
    const senderId = req.user?.id;
    const { receiverId, message } = req.body;

    if (!senderId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    if (!receiverId || !message) {
      return res
        .status(400)
        .json({ success: false, error: "Missing receiverId or message" });
    }

    const db = await connectDB();
    const [result] = await db.execute(
      "INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)",
      [senderId, receiverId, message.trim()]
    );

    // Get the complete message with both sender and receiver information
    const [newMessage] = await db.execute(
      `SELECT m.*, 
       u1.name as sender_name, u1.role as sender_role,
       u2.name as receiver_name, u2.role as receiver_role
       FROM messages m 
       JOIN users u1 ON m.sender_id = u1.id 
       JOIN users u2 ON m.receiver_id = u2.id
       WHERE m.id = ?`,
      [result.insertId]
    );

    res.json({
      success: true,
      data: {
        id: newMessage[0].id,
        senderId: newMessage[0].sender_id,
        senderName: newMessage[0].sender_name,
        senderRole: newMessage[0].sender_role,
        senderInitials: getInitials(newMessage[0].sender_name),
        receiverId: newMessage[0].receiver_id,
        receiverName: newMessage[0].receiver_name,
        receiverRole: newMessage[0].receiver_role,
        receiverInitials: getInitials(newMessage[0].receiver_name),
        message: newMessage[0].message,
        time: formatMessageTime(newMessage[0].timestamp),
        timestamp: newMessage[0].timestamp,
        read: false,
      },
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, error: "Failed to send message" });
  }
});

// PATCH /api/messages/:messageId/read - Mark message as read
router.patch("/:messageId/read", async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    const messageId = req.params.messageId;

    if (!currentUserId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const db = await connectDB();
    await db.execute(
      "UPDATE messages SET read_status = true WHERE id = ? AND receiver_id = ?",
      [messageId, currentUserId]
    );

    res.json({
      success: true,
      message: "Message marked as read",
    });
  } catch (error) {
    console.error("Error marking message as read:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to mark message as read" });
  }
});

// POST /api/messages/mark-all-read/:userId - Mark all messages from user as read
router.post("/mark-all-read/:userId", async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    const otherUserId = req.params.userId;

    if (!currentUserId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const db = await connectDB();
    await db.execute(
      "UPDATE messages SET read_status = true WHERE sender_id = ? AND receiver_id = ? AND read_status = false",
      [otherUserId, currentUserId]
    );

    res.json({
      success: true,
      message: "All messages marked as read",
    });
  } catch (error) {
    console.error("Error marking all messages as read:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to mark messages as read" });
  }
});

// Helper function to format message time
function formatMessageTime(date) {
  const now = new Date();
  const messageDate = new Date(date);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDate = new Date(
    messageDate.getFullYear(),
    messageDate.getMonth(),
    messageDate.getDate()
  );

  const diffTime = now - messageDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (msgDate.getTime() === today.getTime()) {
    // Today - show time
    return messageDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return messageDate.toLocaleDateString("en-US", { weekday: "long" });
  } else {
    return messageDate.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "2-digit",
    });
  }
}

// Helper function to get initials
function getInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

export default router;
