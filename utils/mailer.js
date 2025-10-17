const { SendMailClient } = require("zeptomail");
require("dotenv").config();

const ZEPTO_URL = "https://api.zeptomail.in/v1.1/email";
const ZEPTO_TOKEN =
  "Zoho-enczapikey wSsVR611/xShWKx+mGeoI+htzAtQAVn2FkR02lKpvn/5G6rEocc7wk3LBQWlHPAXETI4HDIbrbstnB0DgDIH2Yt5mV8EDSiF9mqRe1U4J3x17qnvhDzDV21YlRSIKIoBxAlqk2lnG8sl+g==";
const MAILER_FROM = "noreply@basketbay.in";

const client = new SendMailClient({ url: ZEPTO_URL, token: ZEPTO_TOKEN });

const sendEmail = async (to, subject, html) => {
  try {
    const response = await client.sendMail({
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

    console.log("Email sent successfully to:", to);
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
