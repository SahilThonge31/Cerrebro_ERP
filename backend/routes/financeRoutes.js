const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const financeController = require('../controllers/financeController');

router.get('/dashboard', auth, financeController.getFinanceDashboard);
router.post('/expense', auth, financeController.addExpense);

module.exports = router;