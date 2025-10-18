const { SendMailClient } = require("zeptomail");
require("dotenv").config();

const ZEPTO_TOKEN = process.env.ZEPTO_TOKEN;
const MAILER_FROM = process.env.MAILER_FROM;

const client = new SendMailClient({
  url: "https://api.zeptomail.in/v1.1/email",
  token: `Zoho-enczapikey ${ZEPTO_TOKEN}`,
});

const sendEmail = async (to, subject, html) => {
  try {
    const response = await client.sendMail({
      from: { address: MAILER_FROM, name: "BasketBay" },
      to: [{ email_address: { address: to, name: to.split("@")[0] } }],
      subject,
      htmlbody: html,
    });

    console.log("Email sent successfully to: ", to);
    console.log("Response:", response);
    return true;
  } catch (err) {
    console.error("Error sending email:", err);
    return false;
  }
};

module.exports = { sendEmail };
