const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    title: { type: String, required: true }, // e.g. "Chapter 1: Algebra Basics"
    description: String,
    fileUrl: { type: String, required: true }, // Link to PDF/Video
    type: { type: String, enum: ['Notes', 'Textbook', 'Video Lecture', 'PDF', 'Video', 'Link'] },
    
    // Categorization
    board: String,   // SSC
    className: String, // 10th
    subject: String, // Maths 1
    
    // Meta Data
    uploadedBy: { type: String, required: true }, // Teacher Name
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Material', materialSchema);