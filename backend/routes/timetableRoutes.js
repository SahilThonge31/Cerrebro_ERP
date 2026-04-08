const express = require('express');
const router = express.Router();

// --- Middleware ---
const auth = require('../middleware/auth');
// 👇 UPDATED: Swapped local upload for your unified Cloudinary middleware
const upload = require('../middleware/cloudUpload'); 

// --- Controllers ---
const controller = require('../controllers/timetableController');

// ==========================================
// TIMETABLE ROUTES
// ==========================================

// Admin Upload Route (Expects form-data with key 'file')
// 👇 Automatically routes the 'file' (Image or PDF) to Cloudinary
router.post('/upload', auth, upload.single('file'), controller.uploadTimetable);

// Fetch Routes (Public to authenticated users)
router.get('/fetch', auth, controller.getTimetable);
router.get('/my-timetable', auth, controller.getMyTimetable);
router.get('/all', auth, controller.getAllTimetables);
router.get('/view', auth, controller.getTimetable);

// Route: DELETE /api/timetable/:id
router.delete('/:id', auth, controller.deleteTimetable);

module.exports = router;