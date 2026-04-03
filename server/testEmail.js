import dotenv from "dotenv";

dotenv.config();

import { sendEmail } from "./utils/sendEmail.js";

const test = async () => {
  try {
    await sendEmail(
      process.env.EMAIL_USER,
      "Test Email - AtEase",
      "This is a test email from AtEase using Gmail App Password."
    );
  } catch (err) {
    console.error(err);
  }
};

test();