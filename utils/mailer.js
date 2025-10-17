const nodemailer = require("nodemailer");
require("dotenv").config();

const BREVO_SMTP = process.env.BREVO_SMTP;
const MAILER_FROM = process.env.MAILER_FROM;
const MAILER_PORT = process.env.MAILER_PORT;
const MAILER_HOST = process.env.MAILER_HOST;

const transporter = nodemailer.createTransport({
  host: MAILER_HOST,
  port: MAILER_PORT,
  secure: false,
  auth: {
    user: MAILER_FROM,
    pass: BREVO_SMTP,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"BasketBay" <${MAILER_FROM}>`,
      to,
      subject,
      html,
    });
    console.log("Email sent successfully");
    return true;
  } catch (err) {
    console.error("Error sending email:", err);
    return false;
  }
};

module.exports = { sendEmail };
