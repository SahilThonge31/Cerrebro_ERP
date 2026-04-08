const Razorpay = require('razorpay');
const dotenv = require('dotenv');
const path = require('path');

// Explicitly load .env from the backend root folder
dotenv.config({ path: path.join(__dirname, '../.env') });

// Debugging: Check if keys are loaded (Don't show this in production logs)
// console.log("🔍 Razorpay ID:", process.env.RAZORPAY_KEY_ID ? "Found" : "Missing");

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
    // This prevents the app from crashing if keys are missing
    // It will just warn you instead.
    console.error("⚠️  RAZORPAY KEYS MISSING in .env file! Online payments will fail.");
}

// Create instance only if keys exist, otherwise create a dummy (to prevent crash on startup)
const razorpay = (keyId && keySecret) 
    ? new Razorpay({ key_id: keyId, key_secret: keySecret })
    : { orders: { create: () => Promise.reject("Razorpay not configured") } };

module.exports = razorpay;