const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send an email
 * @param {string} to - recipient email
 * @param {string} subject - email subject
 * @param {string} html - email body
 */
const sendEmail = async (to, subject, html) => {
  try {
    await sgMail.send({
      to,
      from: process.env.EMAIL_USER, // must be a verified sender
      subject,
      html,
    });
    console.log("Email sent to", to);
  } catch (err) {
    console.error("Email sending failed:", err.message);
  }
};

module.exports = { sendEmail };
