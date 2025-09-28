const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an email
 * @param {string} to - recipient email
 * @param {string} subject - email subject
 * @param {string} html - email body
 */
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"BasketBay" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("📧 Email sent to", to);
  } catch (err) {
    console.error("Email sending failed:", err.message);
  }
};

module.exports = { sendEmail };
