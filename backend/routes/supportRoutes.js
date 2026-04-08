const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const auth = require('../middleware/auth');

// SUBMIT A TICKET
router.post('/', auth, async (req, res) => {
    try {
        const { category, subject, message } = req.body;
        
        const newTicket = new Ticket({
            user: req.user.id,
            category,
            subject,
            message
        });

        await newTicket.save();
        res.json(newTicket);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
