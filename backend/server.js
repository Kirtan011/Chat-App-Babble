import express from "express";
import "dotenv/config.js";
import cors from "cors";
import http from "http";
import path from "path";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import User from "./Models/userModel.js";

const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// ✅ CORRECT CORS: Allow only frontend origins (not your own backend URL)
const allowedOrigins = [
  "http://localhost:3000", // dev
  "https://chat-app-babble.vercel.app", // deployed frontend
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// API routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// ✅ Health check (for Render cold start)
app.get("/api/user/health-check", (req, res) => {
  res.send("Backend awake");
});

// Production (serve frontend if hosted together — optional if Vercel handles it)
const __dirnameResolved = path.resolve();
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirnameResolved, "../frontend/build");
  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running...");
  });
}

// Error middleware
app.use(notFound);
app.use(errorHandler);

// Start HTTP server and bind Socket.IO
const server = http.createServer(app);

const io = new Server(server, {
  pingTimeout: 60000,
  path: "/socket.io",
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Socket.IO events
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  // Setup user
  socket.on("setup", async (userData) => {
    socket.join(userData._id);
    socket.userId = userData._id;
    socket.emit("connected");
    console.log(`User ${userData._id} joined their personal room`);

    // Update status to online
    try {
      await User.findByIdAndUpdate(userData._id, { isOnline: true });
      socket.broadcast.emit("user status changed", {
        userId: userData._id,
        isOnline: true,
      });
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  });

  // Join chat room
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  // Typing indicators
  socket.on("typing", (chatId) => {
    socket.in(chatId).emit("typing", chatId);
  });

  socket.on("stop typing", (chatId) => {
    socket.in(chatId).emit("stop typing", chatId);
  });

  // New message
  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived.chat;
    if (!chat.users) return console.error("❌ Chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;
      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  // Disconnect
  socket.on("disconnect", async () => {
    console.log("🔴 User disconnected:", socket.userId);
    if (socket.userId) {
      try {
        await User.findByIdAndUpdate(socket.userId, { isOnline: false });
        socket.broadcast.emit("user status changed", {
          userId: socket.userId,
          isOnline: false,
        });
      } catch (error) {
        console.error("Error updating user status on disconnect:", error);
      }
      socket.leave(socket.userId);
    }
  });

  // Error logging
  socket.on("error", (err) => {
    console.error("❌ Socket error:", err);
  });
});

// Start server
server.listen(port, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${port}`
  );
});
