const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Your JWT verify middleware
const profileController = require('../controllers/studentProfileController');

// All routes here require the user to be logged in
router.get('/', auth, profileController.getProfile);
router.put('/update', auth, profileController.updateProfile);
router.put('/change-password', auth, profileController.changePassword);

module.exports = router;