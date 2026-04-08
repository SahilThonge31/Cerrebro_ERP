const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const controller = require('../controllers/notificationController');

router.get('/', auth, controller.getMyNotifications);
router.put('/read-all', auth, controller.markAllRead);
// 👇 ADMIN ROUTES 👇
router.post('/create', auth, controller.createNotice); // Publish
router.get('/history', auth, controller.getAllSentNotices); // View Sent
router.delete('/:id', auth, controller.deleteNotice); // Delete

module.exports = router;