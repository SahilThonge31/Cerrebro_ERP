const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');

// 1. Import Middleware (Check path!)
const auth = require('../middleware/auth'); 
// 👇 UPDATED: Import the new cloudUpload middleware
const upload = require('../middleware/cloudUpload'); 

// 2. Import Controllers (Check if getMe is listed!)
const { loginUser, getMe } = require('../controllers/authController');

// Debugging: If the server crashes, these logs will tell us which one is missing
if (!auth) console.error("CRITICAL ERROR: 'auth' middleware is missing.");
if (!getMe) console.error("CRITICAL ERROR: 'getMe' controller is missing.");

// 3. Define Routes

router.post('/login', loginUser);
router.get('/me', auth, getMe); 
router.get('/user', auth, controller.getMe); // <--- The error was happening here

router.put('/update-profile', auth, controller.updateProfile);
router.put('/change-password', auth, controller.changePassword);

// 👇 UPDATED: Use the new 'upload' middleware here
router.post('/upload-avatar', auth, upload.single('image'), controller.uploadAvatar);

module.exports = router;