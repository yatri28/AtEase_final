import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("❌ SMTP Error:", error);
  } else {
    console.log("✅ SMTP server is ready to send emails");
  }
});

export const sendEmail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: `"AtEase" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error("❌ EMAIL ERROR:", err);
  }
};