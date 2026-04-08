const express = require('express');
const router = express.Router();

// --- Middleware ---
const auth = require('../middleware/auth');
// 👇 UPDATED: Swapped local upload for your unified Cloudinary middleware
const upload = require('../middleware/cloudUpload'); 

// --- Controllers & Models ---
const controller = require('../controllers/galleryController');
const GalleryAlbum = require('../models/GalleryAlbum');

// ==========================================
// GALLERY ROUTES
// ==========================================

// 1. GET ALL ALBUMS (Folders)
router.get('/', auth, async (req, res) => {
    try {
        const albums = await GalleryAlbum.find().sort({ eventDate: -1 });
        res.json(albums);
    } catch (err) {
        console.error("Error fetching albums:", err.message);
        res.status(500).send('Server Error');
    }
});

// 2. CREATE ALBUM 
// 👇 Automatically routes the 'cover' image to Cloudinary
router.post('/create', auth, upload.single('cover'), controller.createAlbum);

// 3. ADD MEDIA TO ALBUM
// 👇 Automatically routes up to 50 files (Images/Videos) to Cloudinary
router.post('/:id/add', auth, upload.array('media', 50), controller.addMedia);

// 4. DELETE MEDIA
router.delete('/:id/media/:mediaId', auth, controller.deleteMedia);

// 5. GET SINGLE ALBUM (Photos)
router.get('/:id', auth, async (req, res) => {
    try {
        const album = await GalleryAlbum.findById(req.params.id);
        if (!album) return res.status(404).json({ msg: "Album not found" });
        res.json(album);
    } catch (err) {
        console.error("Error fetching album:", err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;