import bodyParser from "body-parser";
import express from "express";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import messagesRoutes from "./routes/messages.js";
import notificationsRoutes from "./routes/notifications.js";
import usersRoutes from "./routes/users.js";
import connectDB from "./config/db.js";
import http from "http";
import { Server } from "socket.io";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import profileRoutes from "./routes/profile.js";
dotenv.config();

const app = express();

// Ensure database connection
connectDB()
  .then(() => {
    console.log("MySQL connected");
  })
  .catch((err) => console.error("MySQL connection error:", err));

app.use(cors());
app.use(bodyParser.json());

// Security middleware
app.use(helmet());

// Logging middleware
app.use(morgan("combined"));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api", limiter);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "BrewOps API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// API documentation endpoint
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "BrewOps API",

    version: "1.0.0",
    endpoints: {
      users: {
        list: "GET /api/users",
        search: "GET /api/users?search=query",
        getUser: "GET /api/users/:id",
        updateStatus: "PUT /api/users/:id/status",
      },
      messages: {
        list: "GET /api/messages",
        chat: "GET /api/messages/chat/:userId",
        send: "POST /api/messages/send",
        markRead: "PATCH /api/messages/:messageId/read",
        markAllRead: "POST /api/messages/mark-all-read/:userId",
      },
      notifications: {
        list: "GET /api/notifications",
        unreadCount: "GET /api/notifications/unread-count",
        getNotification: "GET /api/notifications/:id",
        markRead: "PATCH /api/notifications/:id/read",
        markAllRead: "POST /api/notifications/mark-all-read",
        create: "POST /api/notifications",
        delete: "DELETE /api/notifications/:id",
      },
      profile: {
        get: "GET /api/profile",
        basic: "GET /api/profile/basic",
        update: "PUT /api/profile",
        changePassword: "POST /api/profile/change-password",
        uploadAvatar: "POST /api/profile/upload-avatar",
        stats: "GET /api/profile/stats",
        permissions: "GET /api/profile/permissions",
        updatePreferences: "PUT /api/profile/preferences",
        deactivate: "POST /api/profile/deactivate",
      },
    },
  });
});

// Public routes (login, registration)
app.use("/api/users", authRoutes);
app.use("/api/admin", authRoutes);
app.use("/inventory", inventoryRoutes);

// JWT authentication middleware for protected routes only
app.use((req, res, next) => {
  const tokenString = req.header("Authorization");
  if (tokenString != null) {
    const token = tokenString.replace("Bearer ", "");

    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (decoded != null) {
        console.log(decoded);
        req.user = decoded;
        next();
      } else {
        console.log("Token is not provided");
        res.status(403).json({
          message: "Token is not provided",
        });
      }
    });
  } else {
    next();
  }
});

// Protected profile routes
app.use("/api/profile", profileRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/users", usersRoutes);

// WebSocket server setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Real-time notifications/messages
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join user to their own room for targeted messages
  socket.on("join", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Handle real-time message sending
  socket.on("sendMessage", (data) => {
    // Emit to the receiver's room
    socket.to(`user_${data.receiverId}`).emit("newMessage", {
      id: data.id,
      senderId: data.senderId,
      senderName: data.senderName,
      message: data.message,
      time: data.time,
      timestamp: data.timestamp,
    });
  });

  // Handle message read notifications
  socket.on("messageRead", (data) => {
    // Notify the sender that their message was read
    socket.to(`user_${data.senderId}`).emit("messageRead", {
      messageId: data.messageId,
      readBy: data.readBy,
      timestamp: new Date(),
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "API endpoint not found",
    path: req.path,
    method: req.method,
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);
  res.status(error.status || 500).json({
    success: false,
    error: error.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  process.exit(0);
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
