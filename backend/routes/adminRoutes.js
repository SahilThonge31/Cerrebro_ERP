const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// 👇 IMPORT YOUR UPLOAD MIDDLEWARE HERE
const upload = require('../middleware/cloudUpload');

// Import Controllers
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');

// ==========================================
// 1. AUTH & REGISTRATION (Public)
// ==========================================
router.post('/verify-email', authController.verifyEmail);
router.post('/verify-mobile', authController.verifyMobile);
router.post('/check-email-otp', authController.checkEmailOtp);
router.post('/check-mobile-otp', authController.checkMobileOtp);
router.post('/register', authController.registerUser);

// ==========================================
// 2. DASHBOARD & LISTS (Admin Protected)
// ==========================================
router.get('/stats', auth, adminController.getDashboardStats);
router.get('/students', auth, adminController.getAllStudents);
router.get('/teachers', auth, adminController.getAllTeachers);

// ==========================================
// 3. SMART USER MANAGEMENT (Handles Both Roles)
// ==========================================
router.put('/users/:id', auth, adminController.updateUser);   
router.delete('/users/:id', auth, adminController.deleteUser); 

// ==========================================
// 4. SPECIFIC ACTIONS
// ==========================================
router.post('/users/:id/remind', auth, adminController.sendFeeReminder);       
router.put('/teachers/:id/salary', auth, adminController.updateTeacherSalary); 

// ==========================================
// 5. ACHIEVERS (Fixed with Upload Middleware!)
// ==========================================
router.get('/students/search', adminController.searchStudents);

// 👇 THE FIX: Added upload.single('photo') right before the controller function
router.post('/achievers', upload.single('photo'), adminController.addAchiever);

router.get('/achievers', adminController.getAchievers);

module.exports = router;