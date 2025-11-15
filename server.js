import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

// Auth Routes
import authRoutes from "./routes/authRoutes.js";

// User Routes (profile, update, posts, profile completion)
import userRoutes from "./routes/user.js";

dotenv.config();
const app = express();

/* ---------------------------------------------------
   CORS CONFIG – REQUIRED FOR NETLIFY FRONTEND
----------------------------------------------------*/

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "https://gudates.netlify.app";

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allows cookies & tokens to travel
  })
);

/* ---------------------------------------------------
   GLOBAL MIDDLEWARE
----------------------------------------------------*/
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

/* ---------------------------------------------------
   SERVER STATUS TEST ROUTE
----------------------------------------------------*/
app.get("/", (req, res) => {
  res.send("💖 GUdates backend is running successfully!");
});

/* ---------------------------------------------------
   MAIN ROUTES
----------------------------------------------------*/

// Authentication (Signup, Login, Logout)
app.use("/api/auth", authRoutes);

// User operations (Profile setup, get profile, update profile, upload posts, etc.)
app.use("/api/user", userRoutes);

/* ---------------------------------------------------
   OPTIONAL GLOBAL ERROR HANDLER
----------------------------------------------------*/
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err.stack);
  res.status(500).json({
    message: "Internal Server Error",
    error: err.message,
  });
});

/* ---------------------------------------------------
   DATABASE CONNECT
----------------------------------------------------*/
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err.message));

/* ---------------------------------------------------
   SERVER START
----------------------------------------------------*/
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});






