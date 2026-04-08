const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Ensure only logged-in students can use it
const aiController = require('../controllers/aiController');

// POST /api/ai/ask
router.post('/ask', auth, aiController.askTutor);

module.exports = router;