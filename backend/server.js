// server.js
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

const app = express();
const port = process.env.PORT || 5000;

connectDB();
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://<YOUR-FRONTEND-URL>.onrender.com",
    ],
    credentials: true,
  })
);

// API Endpoints
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// Serve React frontend in production
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

// Error Handling
app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);

// Socket.IO Setup
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: [
      "http://localhost:3000",
      "https://<YOUR-FRONTEND-URL>.onrender.com",
    ],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.userId = userData._id;
    socket.emit("connected");
    console.log(`User ${userData._id} joined room`);
  });

  socket.on("typing", (chatId) => {
    socket.in(chatId).emit("typing", chatId);
  });

  socket.on("stop typing", (chatId) => {
    socket.in(chatId).emit("stop typing", chatId);
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined chat room: ${room}`);
  });

  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived.chat;
    if (!chat.users) return console.error("Chat.users not defined");

    chat.users.forEach((usr) => {
      if (usr._id === newMessageReceived.sender._id) return;
      socket.in(usr._id).emit("message received", newMessageReceived);
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.userId);
    socket.leave(socket.userId);
  });
});

server.listen(port, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`);
});
