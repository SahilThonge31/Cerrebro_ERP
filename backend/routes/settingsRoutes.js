const express = require('express');
const router = express.Router();

// --- Middleware ---
const auth = require('../middleware/auth');
const upload = require('../middleware/cloudUpload'); // 👈 NEW: Cloudinary Upload Middleware

// --- Models ---
const Settings = require('../models/Settings');

// ==========================================
// 1. GET Institute Settings
// ==========================================
router.get('/', async (req, res) => {
    try {
        // Find existing settings or create default if none exist
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({}); 
        }
        res.json(settings);
    } catch (err) {
        console.error("Error fetching settings:", err.message);
        res.status(500).send("Server Error");
    }
});

// ==========================================
// 2. PUT (Update) Institute Settings
// ==========================================
// 👇 UPDATED: Added upload.single('logo') to intercept the image
router.put('/', auth, upload.single('logo'), async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
        }
        
        // 1. Update text fields (Only if they are provided in the request)
        if (req.body.instituteName) settings.instituteName = req.body.instituteName;
        if (req.body.address) settings.address = req.body.address;
        if (req.body.contact) settings.contact = req.body.contact;
        if (req.body.currentSession) settings.currentSession = req.body.currentSession;
        
        // 2. Handle Cloudinary Image Upload
        // 👇 NEW: If a file was uploaded, save the secure Cloud URL to the database
        if (req.file) {
            settings.logo = req.file.path; 
        }

        // 3. Track which Admin made the update
        settings.updatedBy = req.user.id;

        await settings.save();
        res.json({ msg: "Institute Settings Updated Successfully!", settings });
    } catch (err) {
        console.error("Error updating settings:", err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;