const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const feeController = require('../controllers/feeController');

// 1. Admin: Setup Rules (One time)
router.post('/structure', auth, feeController.createFeeStructure);

// 2. Admin: Assign Fees to a new Student
router.post('/assign', auth, feeController.assignFeeProfile);

// 3. Admin: Record a Payment (Cash/UPI)
router.post('/pay', auth, feeController.recordPayment);

// 4. Shared: Get Fee History (Admin sees all, Student sees theirs)
router.get('/:studentId', auth, feeController.getFeeDetails);

router.post('/order', auth, feeController.createRazorpayOrder);
router.post('/verify', auth, feeController.verifyRazorpayPayment);

module.exports = router;