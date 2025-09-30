const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465, // SSL port
  secure: true, // true for SSL (port 465)
  auth: {
    user: process.env.MAILER_FROM,
    pass: process.env.MAILERSEND_API_KEY, // Zoho app password
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.MAILER_FROM,
      to,
      subject,
      html,
    });
    console.log("Email sent successfully to", to);
    return true;
  } catch (err) {
    console.error("Email sending failed:", err);
    return false;
  }
};

module.exports = { sendEmail };
