const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/galleryUpload');
const controller = require('../controllers/galleryController');

// Routes
router.get('/', auth, controller.getAlbums);
router.post('/create', auth, upload.single('cover'), controller.createAlbum);
router.post('/:id/add', auth, upload.array('media', 10), controller.addMedia); // Max 10 files at once
router.delete('/:id', auth, controller.deleteAlbum);
router.delete('/:id/media/:mediaId', auth, controller.deleteMedia);

module.exports = router;