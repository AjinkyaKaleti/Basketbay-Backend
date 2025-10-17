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
            name: to.split("@")[0], // just the username
          },
        },
      ],
      subject,
      htmlbody: html,
    });

    console.log("Email sent successfully to: ", to);
    return true;
  } catch (err) {
    console.error("Error sending email:", err.response?.data || err.message);
    return false;
  }
};

module.exports = { sendEmail };
