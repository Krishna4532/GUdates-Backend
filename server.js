import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/user.js";

dotenv.config();
const app = express();
const server = http.createServer(app);

/* -------------------- SOCKET.IO SETUP -------------------- */
const io = new Server(server, {
  cors: {
    origin: ["https://gudates.netlify.app", "http://localhost:5500"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store active users
let onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("🔥 User connected:", socket.id);

  // User joins the site
  socket.on("registerUser", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log("Online Users:", onlineUsers);
  });

  /* -------------------- REAL-TIME CHAT -------------------- */
  socket.on("sendMessage", (data) => {
    const receiverSocket = onlineUsers.get(data.receiver);
    if (receiverSocket) {
      io.to(receiverSocket).emit("receiveMessage", data);
    }
  });

  /* -------------------- VIDEO CALL SIGNALING -------------------- */
  // Join a video call room
  socket.on("joinRoom", ({ roomId }) => {
    socket.join(roomId);
    socket.to(roomId).emit("userJoined", socket.id);
  });

  socket.on("offer", (data) => {
    socket.to(data.roomId).emit("offer", data);
  });

  socket.on("answer", (data) => {
    socket.to(data.roomId).emit("answer", data);
  });

  socket.on("candidate", (data) => {
    socket.to(data.roomId).emit("candidate", data);
  });

  /* -------------------- DISCONNECT -------------------- */
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
    for (let [userId, sock] of onlineUsers.entries()) {
      if (sock === socket.id) {
        onlineUsers.delete(userId);
      }
    }
  });
});

/* -------------------- MIDDLEWARE -------------------- */
app.use(
  cors({
    origin: "https://gudates.netlify.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

/* -------------------- ROUTES -------------------- */
app.get("/", (req, res) => {
  res.send("💖 GUdates backend is running!");
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

/* -------------------- DB -------------------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log(err));

/* -------------------- START SERVER -------------------- */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);








