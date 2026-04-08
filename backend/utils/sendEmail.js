const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Create the Transporter
    // For Gmail, you need an 'App Password' (not your normal password).
    // Go to Google Account -> Security -> 2-Step Verification -> App Passwords
    const transporter = nodemailer.createTransport({
        service: 'gmail', // or your hosting provider (Hostinger, GoDaddy, etc.)
        auth: {
            user: process.env.EMAIL_USER, // Your admin email (e.g., admin@cerrebro.com)
            pass: process.env.EMAIL_PASS  // Your App Password
        }
    });

    // 2. Define Email Options
    const mailOptions = {
        from: `"Cerrebro Security" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.message // HTML body
    };

    // 3. Send Email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;