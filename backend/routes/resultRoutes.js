const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const controller = require('../controllers/resultController');

router.post('/submit', auth, controller.submitMarks);
router.get('/view', auth, controller.getClassResults);

module.exports = router;