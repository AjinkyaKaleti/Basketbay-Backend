const { MailerSend } = require("mailersend");

const mailer = new MailerSend({
  api_key: process.env.MAILERSEND_API_KEY, // Railway env var
});

const sendEmail = async (to, subject, html) => {
  try {
    const response = await mailer.email.send({
      from: "your_verified_email@yourdomain.com", // verify in MailerSend
      to: [to],
      subject,
      html, // use html content
    });
    console.log("Email sent successfully", response);
    return true;
  } catch (err) {
    console.error("Email sending failed:", err.message);
    return false;
  }
};

module.exports = { sendEmail };
