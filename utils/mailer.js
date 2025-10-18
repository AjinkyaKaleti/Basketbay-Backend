const { SendMailClient } = require("zeptomail");
require("dotenv").config();

const url = "api.zeptomail.com/";
const token =
  "Zoho-enczapikey wSsVR60k+UOiWqsrymb7dOdtzVpQAg6nFkp1ilPy6SetH6zF/cdtkxLNAA6kSaRJGGFvQWZBo7shy0pThzpf29stzgtUWyiF9mqRe1U4J3x17qnvhDzNW2pYlRWMLIILwA5skmVhE8ol+g==";

const client = new SendMailClient({
  url,
  token,
});
const MAILER_FROM = process.env.MAILER_FROM;

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
