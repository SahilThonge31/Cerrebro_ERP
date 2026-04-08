const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
    getAcademics, 
    addSubject, 
    removeSubject, 
    getMaterials, 
    deleteMaterial, 
    resetAcademics, 
    addMaterial 
} = require('../controllers/academicController');

// 👇 NEW: Import your unified Cloudinary middleware
const upload = require('../middleware/cloudUpload');

// --- ROUTES ---

// Academic Structure
router.get('/', auth, getAcademics);
router.post('/add', auth, addSubject);
router.post('/remove', auth, removeSubject);

// Content Management
router.get('/materials', auth, getMaterials); // Fetch content
router.delete('/materials/:id', auth, deleteMaterial); // Admin delete

// 👇 UPDATED: Uses the Cloudinary upload middleware
router.post('/materials/add', auth, upload.single('file'), addMaterial);

module.exports = router;