const nodemailer = require('nodemailer')
const asyncHandler = require('express-async-handler')

const sendEmail = asyncHandler(async (data, req, res) => {
    var transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: process.env.MAILTRAP_EMAIL_USER,
            pass: process.env.MAILTRAP_EMAIL_USER_PASSWORD,
        }
    });
    async function main() {
        // send mail with defined transport object
        const mailOptions = await transporter.sendMail({
            from: "myemail@example.com", // sender address
            to: data.to, // list of receivers
            subject: data.subject, // Subject line
            text: data.text, // plain text body  
            html: data.html, // html body
        });
        const mailresponse = await transporter.sendMail(mailOptions);
        return mailresponse;
    }

    main().catch(console.error);
});

module.exports = { sendEmail }
