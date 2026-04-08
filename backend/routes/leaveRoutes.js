const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const controller = require('../controllers/leaveController');

// Teacher Routes
router.post('/apply', auth, controller.applyLeave);
router.get('/my-history', auth, controller.getMyLeaves);

// Admin Route (You can protect this with an 'adminAuth' middleware later)
router.put('/update-status', auth, controller.updateLeaveStatus);
// 👇 ADMIN: Get All Requests
router.get('/all', auth, controller.getAllLeaves);

module.exports = router;