import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
// CRITICAL FIX: Changed the import path to match your file name: user.js
import userRoutes from "./routes/user.js"; 

dotenv.config();
const app = express();

/* -------------------- CORS MUST BE FIRST (FIXED) -------------------- */

// Explicitly allow the Netlify frontend URL for complex requests.
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "https://gudates.netlify.app"; 

app.use(
  cors({
    origin: CLIENT_ORIGIN, // Use the specific, allowed domain
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true // Allows tokens to be sent from the frontend
  })
);

/* -------------------- MIDDLEWARE (BODY PARSERS) -------------------- */
// Ensures body parsing works and sets a limit
app.use(express.json({ limit: '10kb' })); 
app.use(express.urlencoded({ extended: true, limit: '10kb' })); 
app.use(cookieParser());


/* -------------------- ROUTES -------------------- */
// Status check route
app.get("/", (req, res) => {
  res.send("💖 GUdates backend is running successfully!");
});

// Primary API route definitions
app.use("/api/auth", authRoutes);

// User profile and data routes
app.use("/api/user", userRoutes);


// Optional: Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Internal Server Error',
        error: err.message
    });
});


/* -------------------- DATABASE -------------------- */
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err.message));

/* -------------------- SERVER -------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);




