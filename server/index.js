import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import noteRoutes from "./routes/noteRoutes.js";
import counselorRoutes from "./routes/counselor.routes.js";
import moodRoutes from "./routes/moodRoutes.js";
import userRoutes from "./routes/userRoutes.js";   // ✅ ADD PROFILE ROUTES

dotenv.config();
connectDB();

const app = express();

/* ================== MIDDLEWARE ================== */

// CORS setup (important for Authorization header)
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend port
    credentials: true,
  })
);

app.use(express.json());

/* ================== ROUTES ================== */

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);       // ✅ PROFILE ROUTES
app.use("/api/sessions", sessionRoutes);
app.use("/api/counselors", counselorRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/moods", moodRoutes);

/* ================== HEALTH CHECK ================== */

app.get("/", (req, res) => {
  res.send("AtEase API is running 🚀");
});

/* ================== ERROR HANDLER ================== */

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

/* ================== SERVER ================== */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);