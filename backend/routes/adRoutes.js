const express = require('express');
const router = express.Router();

// Middleware
const auth = require('../middleware/auth'); 
// 👇 NEW: Import your unified Cloudinary middleware
const upload = require('../middleware/cloudUpload');

// Controller
const { getAds, createAd, deleteAd } = require('../controllers/adController');

// --- ROUTES ---

// 1. GET All Ads
// Removed 'auth' so the frontend can fetch ads without errors
router.get('/', getAds); 

// 2. Create Ad (Keep 'auth' - Only Admins can create)
// 👇 UPDATED: Uses the Cloudinary upload middleware
router.post('/', auth, upload.single('image'), createAd);

// 3. Delete Ad (Keep 'auth' - Only Admins can delete)
router.delete('/:id', auth, deleteAd);

module.exports = router;