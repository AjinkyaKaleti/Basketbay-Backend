const nodemailer = require("nodemailer");

const BREVO_SMTP = process.env.BREVO_SMTP;
const MAILER_FROM = process.env.MAILER_FROM;

const transporter = nodemailer.createTransport({
  host: "smtp.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: MAILER_FROM,
    pass: BREVO_SMTP,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: '"BasketBay" <noreply@basketbay.in>',
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
