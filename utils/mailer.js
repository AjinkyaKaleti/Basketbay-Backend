// backend/utils/sendEmail.js
const nodemailer = require("nodemailer");
require("dotenv").config();

const ZEPTO_PASS = process.env.ZEPTO_PASS;
const ZEPTO_USER = process.env.ZEPTO_USER;
const ZEPTO_PORT = process.env.ZEPTO_PORT;
const ZEPTO_HOST = process.env.ZEPTO_HOST;

const transport = nodemailer.createTransport({
  host: ZEPTO_HOST,
  port: ZEPTO_PORT,
  secure: false,
  auth: {
    user: ZEPTO_USER,
    pass: ZEPTO_PASS,
  },
});

const MAILER_FROM = process.env.MAILER_FROM;

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
