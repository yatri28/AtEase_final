import cron from "node-cron";
import Session from "../models/Session.js";
import User from "../models/User.js";
import Counselor from "../models/Counselor.js";
import { sendEmail } from "../utils/sendEmail.js";

export const startReminderJob = () => {
  cron.schedule("* * * * *", async () => {
    console.log("Running reminder job...");

    const now = new Date();

    const sessions = await Session.find({ status: "Approved" });

    for (let session of sessions) {
      const sessionDateTime = new Date(
        `${session.sessionDate} ${session.sessionTime}`
      );

      const diff = sessionDateTime - now;

      const oneDay = 24 * 60 * 60 * 1000;
      const oneHour = 60 * 60 * 1000;

      const student = await User.findById(session.studentId);
      const counselor = await Counselor.findById(session.counselorId).populate("userId");

      if (!student || !counselor) continue;

      // ⏰ 1 DAY BEFORE
      if (diff > oneDay - 60000 && diff < oneDay + 60000) {
        await sendEmail(
          student.email,
          "Session Reminder (1 Day)",
          `Hello ${student.name},

Reminder: Your session with ${counselor.name} is tomorrow at ${session.sessionTime}.`
        );
      }

      // ⏰ 1 HOUR BEFORE
      if (diff > oneHour - 60000 && diff < oneHour + 60000) {
        await sendEmail(
          student.email,
          "Session Reminder (1 Hour)",
          `Hello ${student.name},

Reminder: Your session with ${counselor.name} is in 1 hour.`
        );
      }
    }
  });
};