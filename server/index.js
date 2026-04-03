import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cron from "node-cron";
import cors from "cors";

import connectDB from "./config/db.js";

import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import noteRoutes from "./routes/noteRoutes.js";
import counselorRoutes from "./routes/counselor.routes.js";
import moodRoutes from "./routes/moodRoutes.js";
import userRoutes from "./routes/userRoutes.js"; 
import messageRoutes from "./routes/messageRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import settingsRoutes from "./routes/settings.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import counselorSettingsRoutes from "./routes/counselorSettings.routes.js";

import { sendSessionReminders } from "./controllers/reminderController.js";

connectDB();

const app = express();
const server = http.createServer(app);

export const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"], credentials: true },
});

// ================== SOCKET.IO ==================
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", (userId) => {
    socket.join(`notification-${userId}`);
    console.log(`Socket ${socket.id} joined room notification-${userId}`);
  });
});

// ================== CRON JOB ==================
// Run every 5 minutes to send session reminders
cron.schedule("*/5 * * * *", () => {
  console.log("Running reminder job...");
  sendSessionReminders();
});

// ================== MIDDLEWARE ==================
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// ================== ROUTES ==================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/counselors", counselorRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/moods", moodRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/counselor-settings", counselorSettingsRoutes);

// ================== HEALTH CHECK ==================
app.get("/", (req, res) => res.send("AtEase API is running 🚀"));

// ================== ERROR HANDLER ==================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// ================== SERVER ==================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));