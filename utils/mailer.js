const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAILER_HOST,
  port: Number(process.env.MAILER_PORT),
  secure: false, // false for port 587 (STARTTLS)
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASS,
  },
});

transporter.verify((err, success) => {
  if (err) console.error("SMTP connection failed:", err);
  else console.log("SMTP server is ready to send emails");
});

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.MAILER_FROM,
      to,
      subject,
      html,
    });
    console.log("Email sent:", info.messageId);
    return true;
  } catch (err) {
    console.error("Email sending failed:", err.message);
    return false;
  }
};

module.exports = { sendEmail };
