import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/user.js";
import chatRoutes from "./routes/chat.js";

dotenv.config();
const app = express();

/* ---------- SOCKET.IO SERVER WRAPPER ---------- */
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "https://gudates.netlify.app",
    methods: ["GET", "POST"],
    credentials: true
  }
});

/* ---------- SOCKET.IO EVENTS ---------- */
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("joinRoom", (room) => {
    socket.join(room);
  });

  socket.on("sendMessage", (data) => {
    io.to(data.room).emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

/* ---------- EXPRESS MIDDLEWARE ---------- */
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "https://gudates.netlify.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

/* ---------- ROUTES ---------- */
app.get("/", (req, res) => res.send("💖 GUdates backend with Chat system active!"));
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);

/* ---------- DATABASE ---------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err.message));

/* ---------- START SERVER ---------- */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server & WebSockets running at http://localhost:${PORT}`)
);

export { io };









