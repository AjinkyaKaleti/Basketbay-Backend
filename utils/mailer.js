const axios = require("axios");

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const MAILER_FROM = process.env.MAILER_FROM;

console.log(
  `RESEND_API_KEY: ${RESEND_API_KEY} and MAILER_FROM: ${MAILER_FROM}`
);

if (!RESEND_API_KEY) {
  console.log(
    `Warning: RESEND_API_KEY ${RESEND_API_KEY} not set. MAILER_FROM ${MAILER_FROM} Emails will not be sent.`
  );
}

const sendEmail = async (to, subject, html) => {
  try {
    const payload = {
      from: MAILER_FROM,
      to: [to],
      subject,
      html,
    };

    const resp = await axios.post("https://api.resend.com/emails", payload, {
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

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
