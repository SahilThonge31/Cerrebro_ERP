const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const controller = require('../controllers/dataController');

// Route: /api/data/export/students
router.get('/export/students', auth, controller.exportStudents);

// Route: /api/data/backup
router.get('/backup', auth, controller.systemBackup);

module.exports = router;