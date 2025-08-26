import express from "express";

const router = express.Router();

// Mock current user ID - replace with actual user from JWT token
const CURRENT_USER_ID = "current_user";

// Mock users data for reference
const users = {
  current_user: {
    id: "current_user",
    name: "Current User",
    avatar: "CU",
    role: "Manager",
  },
  vimalaweera: {
    id: "vimalaweera",
    name: "M P S K M Vimalaweera",
    avatar: "MV",
    role: "Production Manager",
  },
  weerasiri: {
    id: "weerasiri",
    name: "L D S N S Weerasiri",
    avatar: "LW",
    role: "Quality Control Manager",
  },
  perera: {
    id: "perera",
    name: "S M Perera",
    avatar: "SP",
    role: "Factory Supervisor",
  },
  manager: {
    id: "manager",
    name: "Production Manager",
    avatar: "PM",
    role: "Production Manager",
  },
};

// In-memory chat history for demonstration
const chatHistory = {
  vimalaweera: [
    {
      id: 1,
      senderId: "current_user",
      message: "Hello Vimalaweera! How is the production going today?",
      time: "10:30",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: true,
    },
    {
      id: 2,
      senderId: "vimalaweera",
      message:
        "Hi! Production is running smoothly. We're on target for today's quota.",
      time: "10:32",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 2 * 60 * 1000),
      read: true,
    },
    {
      id: 3,
      senderId: "vimalaweera",
      message: "I'll send the detailed report by evening.",
      time: "10:33",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 3 * 60 * 1000),
      read: false,
    },
  ],
  weerasiri: [
    {
      id: 4,
      senderId: "current_user",
      message: "Hello Weerasiri! Can you check the quality parameters?",
      time: "Yesterday",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      read: true,
    },
    {
      id: 5,
      senderId: "weerasiri",
      message: "Ow akka, I'll check them right away.",
      time: "Yesterday",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
      read: false,
    },
  ],
  perera: [
    {
      id: 6,
      senderId: "current_user",
      message: "Hello Perera! How are the workers doing?",
      time: "Monday",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      read: true,
    },
    {
      id: 7,
      senderId: "perera",
      message:
        "Everyone is working well. Thanks for the update on the new procedures.",
      time: "Monday",
      timestamp: new Date(
        Date.now() - 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000
      ),
      read: true,
    },
  ],
};

// GET /api/messages - Get all conversation threads
router.get("/", (req, res) => {
  try {
    const conversations = [];

    // Create conversation summaries from chat history
    Object.keys(chatHistory).forEach((userId) => {
      const messages = chatHistory[userId];
      if (messages && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        const otherUser = users[userId];

        if (otherUser && lastMessage) {
          conversations.push({
            id: lastMessage.id,
            senderId:
              lastMessage.senderId === CURRENT_USER_ID
                ? CURRENT_USER_ID
                : userId,
            senderName:
              lastMessage.senderId === CURRENT_USER_ID
                ? users[CURRENT_USER_ID].name
                : otherUser.name,
            senderRole:
              lastMessage.senderId === CURRENT_USER_ID
                ? users[CURRENT_USER_ID].role
                : otherUser.role,
            senderInitials:
              lastMessage.senderId === CURRENT_USER_ID
                ? users[CURRENT_USER_ID].avatar
                : otherUser.avatar,
            body: lastMessage.message,
            time: formatMessageTime(lastMessage.timestamp),
            read: lastMessage.read,
            unread:
              !lastMessage.read && lastMessage.senderId !== CURRENT_USER_ID,
          });
        }
      }
    });

    // Sort by timestamp (newest first)
    conversations.sort((a, b) => {
      const aTime = getTimestampFromConversation(
        a.senderId === CURRENT_USER_ID
          ? a.senderId
          : Object.keys(chatHistory).find(
              (k) => users[k] && users[k].name === a.senderName
            )
      );
      const bTime = getTimestampFromConversation(
        b.senderId === CURRENT_USER_ID
          ? b.senderId
          : Object.keys(chatHistory).find(
              (k) => users[k] && users[k].name === b.senderName
            )
      );
      return bTime - aTime;
    });

    res.json({ success: true, data: conversations });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ success: false, error: "Failed to fetch messages" });
  }
});

// GET /api/messages/chat/:userId - Get chat history with specific user
router.get("/chat/:userId", (req, res) => {
  try {
    const userId = req.params.userId;
    const messages = chatHistory[userId] || [];

    // Format messages for frontend
    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      senderId: msg.senderId,
      message: msg.message,
      time: msg.time,
      timestamp: msg.timestamp,
      read: msg.read,
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
router.post("/send", (req, res) => {
  try {
    const { receiverId, message } = req.body;

    if (!receiverId || !message) {
      return res.status(400).json({ error: "Missing receiverId or message" });
    }

    const newMsg = {
      id: Date.now(),
      senderId: CURRENT_USER_ID, // Replace with req.user.id in real app
      message: message.trim(),
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      timestamp: new Date(),
      read: false,
    };

    // Initialize chat history if it doesn't exist
    if (!chatHistory[receiverId]) {
      chatHistory[receiverId] = [];
    }

    // Add message to chat history
    chatHistory[receiverId].push(newMsg);

    res.json({
      success: true,
      data: newMsg,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send message",
    });
  }
});

// PATCH /api/messages/:messageId/read - Mark message as read
router.patch("/:messageId/read", (req, res) => {
  try {
    const messageId = parseInt(req.params.messageId);
    let found = false;

    // Find and mark message as read
    Object.keys(chatHistory).forEach((userId) => {
      chatHistory[userId].forEach((msg) => {
        if (msg.id === messageId) {
          msg.read = true;
          found = true;
        }
      });
    });

    if (found) {
      res.json({
        success: true,
        message: "Message marked as read",
      });
    } else {
      res.status(404).json({
        success: false,
        error: "Message not found",
      });
    }
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({
      success: false,
      error: "Failed to mark message as read",
    });
  }
});

// POST /api/messages/mark-all-read/:userId - Mark all messages from user as read
router.post("/mark-all-read/:userId", (req, res) => {
  try {
    const userId = req.params.userId;

    if (chatHistory[userId]) {
      chatHistory[userId].forEach((msg) => {
        if (msg.senderId !== CURRENT_USER_ID) {
          msg.read = true;
        }
      });

      res.json({
        success: true,
        message: "All messages marked as read",
      });
    } else {
      res.status(404).json({
        success: false,
        error: "Chat history not found",
      });
    }
  } catch (error) {
    console.error("Error marking all messages as read:", error);
    res.status(500).json({
      success: false,
      error: "Failed to mark messages as read",
    });
  }
});

// Helper function to format message time
function formatMessageTime(date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const diffTime = now - date;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (messageDate.getTime() === today.getTime()) {
    // Today - show time
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  } else {
    return date.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "2-digit",
    });
  }
}

// Helper function to get timestamp from conversation
function getTimestampFromConversation(userId) {
  if (!userId || !chatHistory[userId] || chatHistory[userId].length === 0) {
    return 0;
  }
  const lastMessage = chatHistory[userId][chatHistory[userId].length - 1];
  return lastMessage.timestamp ? lastMessage.timestamp.getTime() : 0;
}

export default router;
