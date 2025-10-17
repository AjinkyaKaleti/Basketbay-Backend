const axios = require("axios");

const BREVO_API_KEY = process.env.BREVO_API_KEY;

const sendEmail = async (to, subject, html) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { email: "noreply@basketbay.in", name: "BasketBay" },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Email sent successfully:", response.data);
    return true;
  } catch (err) {
    console.error(
      "Error sending email via Brevo API:",
      err.response?.data || err
    );
    return false;
  }
};

module.exports = { sendEmail };
