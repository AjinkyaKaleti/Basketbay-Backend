const nodemailer = require("nodemailer");
require("dotenv").config();

const MAILER_HOST = process.env.MAILER_HOST;
const MAILER_PORT = process.env.MAILER_PORT;
const MAILER_USER = process.env.MAILER_USER;
const MAILER_PASS = process.env.MAILER_PASS;
const MAILER_FROM = process.env.MAILER_FROM;

if (!MAILER_USER || !MAILER_PASS) {
  console.warn("Mail credentials are not set in .env file");
}

// Create a reusable transporter object
const transporter = nodemailer.createTransport({
  host: MAILER_HOST,
  port: Number(MAILER_PORT),
  secure: true, // true for port 465 (SSL)
  auth: {
    user: MAILER_USER,
    pass: MAILER_PASS,
  },
});

// Verify connection once when the server starts
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP connection failed:", error);
  } else {
    console.log("SMTP server is ready to send emails");
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    const payload = {
      from: MAILER_FROM,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(payload);
    console.log("Email sent to:", info.messageId);
    return true;
  } catch (err) {
    console.error("Email sending failed:", err.message);
    return false;
  }
};

module.exports = { sendEmail };
