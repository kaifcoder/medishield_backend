// const resendImport = require("resend");
// const { Resend } = resendImport;
// require("dotenv").config();
// const resend = new Resend(process.env.RESEND_API);

// async function sendResendEmail(
//     to,
//     subject,
//     html,
//     attachments = []
// ) {
//     const { data, error } = await resend.emails.send({
//         from: 'MediShield-No-reply <medishield-NoReply@darkinc.tech>',
//         to: [to],
//         subject: subject,
//         html: html,
//         attachments: attachments
//     });

//     if (error) {
//         return console.error({ error });
//     }

//     return data;
// };
// module.exports = { sendResendEmail }

const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

async function sendResendEmail(
    to,
    subject,
    html,
    attachments = []
) {
    const mailOptions = {
        from: `${process.env.GMAIL_USER} <${process.env.GMAIL_USER}>`,
        to: to,
        subject: subject,
        html: html,
        attachments: attachments.map(file => ({
            filename: file.filename,
            path: file.path
        }))
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error({ error });
        return { error };
    }
};

module.exports = { sendResendEmail }
