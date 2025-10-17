const { SendMailClient } = require("zeptomail");
require("dotenv").config();

const url = process.env.ZEPTO_URL;
const token = process.env.ZEPTO_TOKEN;
const MAILER_FROM = process.env.MAILER_FROM;

const client = new SendMailClient({ url, token });

const sendEmail = async (to, subject, html) => {
  try {
    await client.sendMail({
      from: {
        address: MAILER_FROM,
        name: "BasketBay",
      },
      to: [
        {
          email_address: {
            address: to,
            name: to.split("@")[0],
          },
        },
      ],
      subject,
      htmlbody: html,
    });

    console.log("Email sent successfully to: ", to);
    console.log("ZeptoMail Response:", response);
    return true;
  } catch (err) {
    console.error("Error message:", err.message);
    console.error("Full error object:", JSON.stringify(err, null, 2));
    console.error("Response data:", err?.response?.data);
    return false;
  }
};

module.exports = { sendEmail };
