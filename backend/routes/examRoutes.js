const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const controller = require('../controllers/examController');

router.post('/create', auth, controller.createExam);
router.get('/fetch', auth, controller.getExams);
router.delete('/:id', auth, controller.deleteExam);
router.get('/report/:studentId', auth, controller.getStudentReport);

module.exports = router;