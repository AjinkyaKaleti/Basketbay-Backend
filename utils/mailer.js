const axios = require("axios");

const ZEPTO_API_KEY = process.env.ZEPTO_API_KEY;
const MAILER_FROM = process.env.MAILER_FROM;

const sendEmail = async (to, subject, html) => {
  try {
    const response = await axios.post(
      "https://api.zeptomail.in/v1.1/email",
      {
        from: { address: MAILER_FROM, name: "BasketBay" },
        to: [{ email_address: { address: to } }],
        subject,
        htmlbody: html,
      },
      {
        headers: {
          Authorization: `Zoho-enczapikey ${ZEPTO_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Email sent successfully:", response.data);
    return true;
  } catch (err) {
    console.error("Error sending email:", err.response?.data || err.message);
    return false;
  }
};

module.exports = { sendEmail };
