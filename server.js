import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/user.js";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();

/* ---------------- CORS ---------------- */
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "https://gudates.netlify.app";

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ---------------- ROUTES ---------------- */
app.get("/", (req, res) => {
  res.send("💖 GUdates backend with Random Videochat running!");
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

/* ---------------- SOCKET.IO SERVER ---------------- */
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true
  }
});

/* ---------------- RANDOM VIDEOCHAT MATCH SYSTEM ---------------- */

let waitingUser = null; // store a user waiting for a partner

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // User wants a partner
  socket.on("find-partner", () => {
    if (waitingUser === null) {
      // No one waiting → store this person
      waitingUser = socket;
      socket.emit("waiting");
    } else {
      // Match two users
      const partner = waitingUser;
      waitingUser = null;

      socket.emit("partner-found", { partnerId: partner.id });
      partner.emit("partner-found", { partnerId: socket.id });
    }
  });

  // Relay WebRTC offer
  socket.on("offer", (data) => {
    io.to(data.partnerId).emit("offer", {
      offer: data.offer,
      sender: socket.id,
    });
  });

  // Relay WebRTC answer
  socket.on("answer", (data) => {
    io.to(data.partnerId).emit("answer", {
      answer: data.answer,
      sender: socket.id,
    });
  });

  // Relay ICE candidates
  socket.on("ice-candidate", (data) => {
    io.to(data.partnerId).emit("ice-candidate", {
      candidate: data.candidate,
      sender: socket.id,
    });
  });

  socket.on("disconnect", () => {
    if (waitingUser && waitingUser.id === socket.id) {
      waitingUser = null;
    }
  });
});

/* ---------------- DATABASE ---------------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err.message));

/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Backend running on port ${PORT}`)
);











