const resendImport = require("resend");
const { Resend } = resendImport;
require("dotenv").config();
const resend = new Resend(process.env.RESEND_API);

async function sendResendEmail(
    to,
    subject,
    html,
    attachments = []
) {
    const { data, error } = await resend.emails.send({
        from: 'MediShield-No-reply <medishield-NoReply@darkinc.tech>',
        to: [to],
        subject: subject,
        html: html,
        attachments: attachments
    });

    if (error) {
        return console.error({ error });
    }

    return data;
};
module.exports = { sendResendEmail }