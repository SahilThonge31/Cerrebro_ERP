const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');

// GET ALL EVENTS
router.get('/', auth, async (req, res) => {
    try {
        constevents = await Event.find().sort({ date: 1 });
        res.json(events);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;