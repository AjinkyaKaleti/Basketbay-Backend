// backend/utils/sendEmail.js
const nodemailer = require("nodemailer");
require("dotenv").config();

const transport = nodemailer.createTransport({
  host: "smtp.zeptomail.com",
  port: 587,
  secure: false,
  auth: {
    user: "emailapikey",
    pass: process.env.ZEPTO_PASS,
  },
});

const MAILER_FROM = process.env.MAILER_FROM || "noreply@basketbay.in";

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"BasketBay" <${MAILER_FROM}>`,
      to,
      subject,
      html,
    };

    const info = await transport.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
    return true;
  } catch (err) {
    console.error("Error sending email:", err);
    return false;
  }
};

module.exports = { sendEmail };
