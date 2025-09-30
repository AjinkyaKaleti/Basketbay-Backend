const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 587, // SSL port. Use 587 + secure:false if you prefer TLS
  secure: false, // true for 465
  auth: {
    user: process.env.MAILER_FROM, // your Zoho email
    pass: process.env.MAILERSEND_API_KEY, // Zoho App Password stored in this var
  },
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
    console.error("Email sending failed:", err);
    return false;
  }
};

module.exports = { sendEmail };
