const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const controller = require('../controllers/attendanceController');

// Student Routes
router.get('/student/view', auth, controller.getStudentAttendance);
router.post('/student/mark', auth, controller.markStudentAttendance);
router.get('/student/my-history', auth, controller.getMyAttendance);

// Teacher Routes

router.get('/teacher/my-history', auth, controller.getMyTeacherAttendance);
router.get('/teacher/view', auth, controller.getTeacherAttendance);
router.post('/teacher/mark', auth, controller.markTeacherAttendance);
router.get('/student/history/:id', auth, controller.getStudentAttendanceHistory);


module.exports = router;