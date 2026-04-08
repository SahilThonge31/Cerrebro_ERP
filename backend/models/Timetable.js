const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
    standard: { type: String, required: true }, // e.g., "10th"
    board: { type: String, required: true },    // e.g., "CBSE"
    pdfUrl: { type: String, required: true },   // URL to the uploaded file
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, { timestamps: true });

// Ensures we don't have duplicate entries. 
// If Admin uploads again for "10th CBSE", it replaces the old one.
timetableSchema.index({ standard: 1, board: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);