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

export const sendEmail = async (to, subject, message) => {
  try {
    const info = await transporter.sendMail({
      from: `"AtEase" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: `
  <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px;">
    
    <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 25px; border-radius: 8px;">
      
      <h2 style="color: #14b8a6; margin-bottom: 20px;">AtEase</h2>

      <p style="font-size: 14px; color: #333;">
        ${message.replace(/\n/g, "<br/>")}
      </p>

      <br/>

      <p style="font-size: 14px; color: #333;">
        <strong>Date & Time:</strong> ${new Date().toDateString()} 
      </p>

      <p style="font-size: 14px; color: #333;">
        Please check your dashboard for more details.
      </p>

      <br/>

      <p style="font-size: 14px; color: #333;">
        Best regards,<br/>
        <strong>AtEase Team</strong>
      </p>

    </div>

  </div>
`
    });

    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error("❌ EMAIL ERROR:", err);
  }
};