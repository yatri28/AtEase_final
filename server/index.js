import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import sessionRoutes from "./routes/session.routes.js";  // 👈 add this
import noteRoutes from "./routes/noteRoutes.js";
import counselorRoutes from "./routes/counselor.routes.js";
import moodRoutes from "./routes/moodRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";


import analyticsRoutes from "./routes/analyticsRoutes.js";


dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);  // 👈 add this
app.use("/api/counselors", counselorRoutes);
app.use("/api/notes",noteRoutes);
app.use("/api/moods", moodRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/analytics", analyticsRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
