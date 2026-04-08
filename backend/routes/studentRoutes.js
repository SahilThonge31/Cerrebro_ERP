const express = require('express');
const router = express.Router();

// --- Middleware ---
const auth = require('../middleware/auth');
const upload = require('../middleware/cloudUpload');

// --- Controllers ---
const studentController = require('../controllers/studentController');

// ==========================================
// STUDENT PROFILE ROUTES
// ==========================================

/**
 * @route   POST /api/student/upload-profile
 * @desc    Upload student profile picture to Cloudinary
 * @access  Private (Student/Admin)
 */
router.post(
    '/upload-profile', 
    auth, 
    upload.single('profilePic'), 
    studentController.uploadProfilePic
);

// Note: If you have other student routes, add them here
// router.get('/me', auth, studentController.getStudentProfile);

router.put('/profile/update', auth, studentController.updateProfile);

module.exports = router;