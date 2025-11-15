import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js"; // Adjust path if needed

dotenv.config();
const app = express();

/* -------------------- CORS MUST BE FIRST -------------------- */
// Ensure specific origin is used if not using a catch-all for production
app.use(
  cors({
    origin: "*", // allow all for testing
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

/* -------------------- MIDDLEWARE (BODY PARSERS) -------------------- */
// CRITICAL FIX: Add limit option to ensure body parsing works for larger payloads (standard practice)
app.use(express.json({ limit: '10kb' })); 
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // Good practice to include both
app.use(cookieParser());


/* -------------------- ROUTES -------------------- */
// Status check route
app.get("/", (req, res) => {
  res.send("💖 GUdates backend is running successfully!");
});

// Primary API route definitions
app.use("/api/auth", authRoutes);

// Optional: Global Error Handler to ensure JSON responses for unknown errors
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


