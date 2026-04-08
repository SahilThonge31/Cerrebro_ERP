const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },       // e.g., "Science Fair"
    description: { type: String },                 // e.g., "All students must assemble..."
    date: { type: Date, required: true },          // The actual date
    type: { type: String, enum: ['Holiday', 'Exam', 'Event'], default: 'Event' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Admin/Teacher ID
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);