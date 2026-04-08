const express = require('express');
const router = express.Router();

// --- Middleware ---
const auth = require('../middleware/auth');
// 👇 UPDATED: Swapped local 'upload' for your new 'cloudUpload' middleware
const upload = require('../middleware/cloudUpload'); 

// --- Controllers ---
const controller = require('../controllers/facultyController');

// ==========================================
// FACULTY / TEACHER ROUTES
// ==========================================

// Route: GET /api/faculty/dashboard
// This fetches all the details the teacher needs for their home screen
router.get('/dashboard', auth, controller.getDashboard);
router.get('/my-students', auth, controller.getMyStudents);
router.get('/class-students', auth, controller.getClassStudents);

// Notifications
router.get('/notifications', auth, controller.getNotifications);
router.put('/notifications/:id/read', auth, controller.markNotificationRead);

// Stats & Profile
router.get('/stats', auth, controller.getDashboardStats);
router.get('/profile', auth, controller.getProfile);

// 👇 This route now automatically sends the 'file' to Cloudinary!
router.put('/update-profile-pic', auth, upload.single('file'), controller.updateProfilePic);

router.put('/profile/update', auth, controller.updateProfileDetails);

router.put('/profile/updates', auth, controller.updateTeacherProfile);

router.put('/change-password', auth, controller.changePassword);

module.exports = router;