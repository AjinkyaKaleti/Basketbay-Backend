const axios = require("axios");

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const MAILER_FROM = process.env.MAILER_FROM;

if (!BREVO_API_KEY) {
  console.warn(
    `BREVO_API_KEY not set. Emails from ${MAILER_FROM} will not be sent.`
  );
}

// Helper to extract name & email from MAILER_FROM
const parseFrom = (from) => {
  const match = from.match(/<(.+)>/);
  const email = match ? match[1] : from;
  const name = from.split("<")[0].trim() || "";
  return { email, name };
};

const sendEmail = async (to, subject, html) => {
  try {
    const { email, name } = parseFrom(MAILER_FROM);
    const payload = {
      sender: { email, name },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    };

    const resp = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      payload,
      {
        headers: {
          "api-key": BREVO_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    console.log("Resend response status:", resp.status);
    console.log("Resend response data:", JSON.stringify(resp.data));

    // success if status 2xx
    return resp.status >= 200 && resp.status < 300;
  } catch (err) {
    console.error("Email sending failed:", err);
    return false;
  }
};

module.exports = { sendEmail };
