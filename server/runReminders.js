// runReminders.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { sendSessionReminders } from "./controllers/reminderController.js";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

// Create HTTP server (needed for socket.io)
const server = http.createServer();
export const io = new Server(server, {
  cors: { origin: "*" }, // allow your frontend origin
});

io.on("connection", (socket) => {
  console.log("🟢 A client connected:", socket.id);
});

server.listen(3001, () => console.log("⚡ Socket.io server running on port 3001"));

// Connect MongoDB and start reminder service
async function startReminderService() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // Run reminders immediately and then every 1 minute
    await sendSessionReminders(io);

    setInterval(async () => {
      await sendSessionReminders(io);
    }, 60 * 1000);

    console.log("⏰ Reminder service running (checks every 1 minute)");
  } catch (err) {
    console.error("❌ Error starting reminder service:", err);
  }
}

startReminderService();