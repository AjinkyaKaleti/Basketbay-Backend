const { MailerSend, EmailParams, Recipient, Sender } = require("mailersend");

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY, // must match exactly
});

const sendEmail = async (to, subject, html) => {
  try {
    const emailParams = new EmailParams()
      .setFrom(new Sender(process.env.MAILER_FROM))
      .setTo([new Recipient(to)])
      .setSubject(subject)
      .setHtml(html);

    console.log("API key present?", !!process.env.MAILERSEND_API_KEY);
    console.log("API key value:", process.env.MAILERSEND_API_KEY);
    console.log("MAILER_FROM:", process.env.MAILER_FROM);

    await mailerSend.email.send(emailParams);
    console.log("Test email sent successfully");
  } catch (err) {
    console.error("Email sending failed:", err);
    return false;
  }
};

module.exports = { sendEmail };
