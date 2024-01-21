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

    // async..await is not allowed in global scope, must use a wrapper
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

        // console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        //
        // NOTE: You can go to https://forwardemail.net/my-account/emails to see your email delivery status and preview
        //       Or you can use the "preview-email" npm package to preview emails locally in browsers and iOS Simulator
        //       <https://github.com/forwardemail/preview-email>
        //
    }

    main().catch(console.error);
});

module.exports = { sendEmail }

//Create an Account with Mail trap and Login
//on the sidebar of the dashboard select Email testing
//select inboxes
//choose SMTP setting and select Nodejs on Integration language
//your  configure details will appear copy the user and pass and use them  above in our auth user and pass ~