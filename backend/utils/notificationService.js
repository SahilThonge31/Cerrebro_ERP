const nodemailer = require('nodemailer');

// Email Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- 1. SEND EMAIL OTP ---
exports.sendEmailOTP = async (email, otpCode) => {
    try {
        await transporter.sendMail({
            from: '"Cerrebro Admin"',
            to: email,
            subject: 'Email Verification - Cerrebro',
            text: `Your Email OTP is: ${otpCode}`
        });
        console.log(`✅ [EMAIL SENT] To ${email}: OTP ${otpCode}`);
    } catch (error) {
        console.error("❌ Email Error:", error);
        throw new Error("Email sending failed.");
    }
};

// --- 2. SEND MOBILE OTP (Mock Logic) ---
exports.sendMobileOTP = async (contact, otpCode) => {
    try {
        // --- REAL SMS CODE (For Future Use with Twilio) ---
        // const client = require('twilio')(accountSid, authToken);
        // await client.messages.create({ body: `Your OTP is ${otpCode}`, from: '+1234567890', to: contact });
        
        // --- MOCK LOGIC (For Development) ---
        // This prints the OTP in your VS Code terminal so you can copy it
        console.log(`📲 [SMS SENT] To ${contact}: Your Mobile OTP is ${otpCode}`);
        
    } catch (error) {
        console.error("❌ SMS Error:", error);
        throw new Error("SMS sending failed.");
    }
};

// --- 3. SEND CREDENTIALS ---
exports.sendCredentials = async (email, contact, password) => {
    try {
        // Send via Email
        await transporter.sendMail({
            from: '"Cerrebro Admin"',
            to: email,
            subject: 'Your Login Credentials',
            text: `Username: ${email} \nPassword: ${password} \nLogin: http://localhost:5173`
        });
        
        // Log for Mobile
        console.log(`📲 [SMS SENT] Creds sent to ${contact}`);
    } catch (error) {
        console.error("❌ Credential Error:", error);
    }
};