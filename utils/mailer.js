const nodemailer = require("nodemailer");

const ZOHO_PASS = process.env.ZOHO_PASS;

const transporter = nodemailer.createTransport({
  host: "smtp.zeptomail.com",
  port: 587,
  secure: false,
  auth: {
    user: "emailapikey",
    pass: ZOHO_PASS,
  },
  tls: {
    rejectUnauthorized: false,
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
