// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
const app = express();

/* -------------------- CORS MUST BE FIRST -------------------- */

// ** 🛑 CRITICAL FIX: Explicitly define allowed origins for security and functionality **
const allowedOrigins = [
    // 1. Your Custom Production Domain
    'https://gudates.com',
    // 2. Your Netlify Subdomain (for staging/testing)
    'https://gudates.netlify.app',
    // 3. (Optional) Your local development environment
    // 'http://localhost:5000', // Update if you use a different port locally
];

app.use(
    cors({
        // Use a function to check if the origin is in the allowed list
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps, postman, or same-origin)
            if (!origin) return callback(null, true); 
            
            if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true); // Origin is allowed
            } else {
                callback(new Error('Not allowed by CORS')); // Origin is NOT allowed
            }
        },
        // 🚨 CRUCIAL: Must be true because your frontend uses `credentials: "include"`
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

/* -------------------- MIDDLEWARE -------------------- */
app.use(express.json());
app.use(cookieParser());

/* -------------------- ROUTES -------------------- */
app.get("/", (req, res) => {
    res.send("💖 GUdates backend is running successfully!");
});

app.use("/api/auth", authRoutes);

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

