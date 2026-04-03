// testSession.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Session from "./models/Session.js";
import Settings from "./models/Settings.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function createTestSession() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    // 1️⃣ Create/find a test student
    let student = await User.findOne({ email: "teststudent@example.com" });
    if (!student) {
      student = await User.create({
        name: "Test Student",
        email: "teststudent@example.com",
        role: "student", // Make sure your User model has a role field
        password: "dummy123", // hashed or plain depending on your model
      });
      console.log("✅ Test student created");
    }

    // 2️⃣ Create/find a counselor
    let counselor = await User.findOne({ email: "testcounselor@example.com" });
    if (!counselor) {
      counselor = await User.create({
        name: "Test Counselor",
        email: "testcounselor@example.com",
        role: "counselor",
        password: "dummy123",
      });
      console.log("✅ Test counselor created");
    }

    // 3️⃣ Create a session 1 hour from now
    const now = new Date();
    const sessionDate = new Date(now);
    const sessionTimeHour = now.getHours() + 1; // 1 hour ahead
    const sessionTimeStr = ((sessionTimeHour % 12) || 12) + ":00 " + (sessionTimeHour >= 12 ? "PM" : "AM");

    let session = await Session.create({
      studentId: student._id,
      counselorId: counselor._id,
      sessionDate,
      sessionTime: sessionTimeStr,
      status: "Approved",
    });
    console.log("✅ Test session created:", sessionTimeStr);

    // 4️⃣ Enable reminders for the student
    const settings = await Settings.findOneAndUpdate(
      { userId: student._id },
      { sessionReminder: true, emailReminder: true },
      { upsert: true, returnDocument: "after" }
    );
    console.log("✅ Settings enabled for test student");

    console.log("🎉 Test session setup complete! Wait for reminders to trigger.");

    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error creating test session:", err);
  }
}

createTestSession();