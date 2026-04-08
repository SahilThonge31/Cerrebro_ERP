const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const controller = require('../controllers/chatController');

// 1. Get Chat History with a specific person
router.get('/history/:partnerId', auth, controller.getHistory);

// 2. Get Contacts (Students for Teacher, Admins for Teacher, etc.)
router.get('/contacts', auth, controller.getContactsForTeacher);

router.get('/contacts/admin', auth, controller.getContactsForAdmin);

router.get('/unread', auth, controller.getUnreadCounts);
router.put('/mark-read', auth, controller.markAsRead);

router.get('/contacts/student', auth, controller.getContactsForStudent);

router.get('/recent', auth, controller.getRecentChats);

module.exports = router;