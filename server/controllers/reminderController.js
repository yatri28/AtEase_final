import Notification from "../models/Notification.js";
import Session from "../models/Session.js";
import { sendEmail } from "../utils/sendEmail.js";
import { io } from "../index.js";

export const sendSessionReminders = async () => {
  try {
    const now = new Date();
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;

    const sessions = await Session.find({ approved: true })
      .populate("studentId")
      .populate({ path: "counselorId", populate: { path: "userId" } })

    for (const session of sessions) {
      const [time, modifier] = session.sessionTime.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      if (modifier === "PM" && hours !== 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      const sessionDateTime = new Date(session.sessionDate);
      sessionDateTime.setHours(hours, minutes, 0, 0);

      const diff = sessionDateTime - now;

      // 24h reminder
      if (diff > 0 && diff <= oneDay && !session.reminder24hSent) {
        const studentMessage = `Session starting soon ⏰ Reminder: Your session with ${session.counselorId.userId?.name || session.counselorName} is at ${session.sessionTime}`;
        const counselorMessage = `Session starting soon ⏰ Reminder: Your session with ${session.studentId.name} is at ${session.sessionTime}`;

        const studentNotif = await Notification.create({ userId: session.studentId._id, message: studentMessage });
        io.to(`notification-${session.studentId._id}`).emit("newNotification", studentNotif);

        const counselorNotif = await Notification.create({ userId: session.counselorId._id, message: counselorMessage });
        io.to(`notification-${session.counselorId.userId._id}`).emit("newNotification", counselorNotif);

        if (session.studentId.email) await sendEmail(session.studentId.email, "Session Reminder", studentMessage);
        if (session.counselorId.userId?.email) await sendEmail(session.counselorId.userId.email, "Session Reminder", counselorMessage);

        session.reminder24hSent = true;
        await session.save();
      }

      // 1h reminder
      if (diff > 0 && diff <= oneHour && !session.reminder1hSent) {
        const studentMessage = `Session starting soon ⏰ Reminder: Your session with ${session.counselorId.userId?.name || session.counselorName} is at ${session.sessionTime}`;
        const counselorMessage = `Session starting soon ⏰ Reminder: Your session with ${session.studentId.name} is at ${session.sessionTime}`;

        const studentNotif = await Notification.create({ userId: session.studentId._id, message: studentMessage });
        io.to(`notification-${session.studentId._id}`).emit("newNotification", studentNotif);

        const counselorNotif = await Notification.create({ userId: session.counselorId._id, message: counselorMessage });
        io.to(`notification-${session.counselorId.userId._id}`).emit("newNotification", counselorNotif);

        if (session.studentId.email) await sendEmail(session.studentId.email, "Session Reminder", studentMessage);
        if (session.counselorId.userId?.email) await sendEmail(session.counselorId.userId.email, "Session Reminder", counselorMessage);

        session.reminder1hSent = true;
        await session.save();
      }
    }
  } catch (err) {
    console.error("Reminder error:", err);
  }
};