// server.js
import express from "express";
import "dotenv/config.js";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import path from "path";

const app = express();
const Port = process.env.PORT || 3000;

connectDB();
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://chat-app-babble.onrender.com/"],
    credentials: true,
  })
);

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

//---------------------Deployment--------------------//

// Deployment: Serve React frontend from Express in production
const __dirname = path.resolve();
const frontendPath = path.join(__dirname, "../frontend/build");
console.log("Resolved frontend path:", frontendPath);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running");
  });
}

//---------------------Deployment--------------------//

app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: ["http://localhost:3000", "https://chat-app-babble.onrender.com/"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log(userData._id);
    socket.emit("connected");
  });

  socket.on("typing", (chatId) => {
    socket.in(chatId).emit("typing", chatId);
  });

  socket.on("stop typing", (chatId) => {
    socket.in(chatId).emit("stop typing", chatId);
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room:" + room);
  });

  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;
    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});

server.listen(Port, () => {
  console.log(`Server started on port: ${Port}`);
});
