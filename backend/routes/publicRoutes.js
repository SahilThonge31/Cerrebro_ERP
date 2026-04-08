const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');
const auth = require('../middleware/auth');
const upload = require('../middleware/cloudUpload'); // 👈 ADDED THIS FOR FILE UPLOADS

// Public Read Routes
router.get('/testimonials', publicController.getPublicTestimonials);
router.get('/classes', publicController.getPublicClasses);
router.get('/achievers', publicController.getPublicAchievers);
router.get('/gallery', publicController.getPublicGallery);
router.post('/enquiry', publicController.submitEnquiry);

// Admin Action Routes (Protected)
// --- NEW: Route to Add Achiever ---
router.post('/achievers', auth, upload.single('photo'), publicController.addAchiever);

// --- Route to Delete Achiever ---
router.delete('/achievers/:id', auth, publicController.deleteAchiever);

module.exports = router;