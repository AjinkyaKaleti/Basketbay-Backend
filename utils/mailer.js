const { MailerSend, EmailParams, Recipient, Sender } = require("mailersend");

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY, // must match exactly
});

const sendEmail = async (to, subject, html) => {
  try {
    const emailParams = new EmailParams()
      .setFrom(new Sender(process.env.EMAIL_USER))
      .setTo([new Recipient(to)])
      .setSubject(subject)
      .setHtml(html);

    await mailerSend.email.send(emailParams);
    console.log("Test email sent successfully");
  } catch (err) {
    console.error("Email sending failed:", err);
    return false;
  }
};

module.exports = { sendEmail };
