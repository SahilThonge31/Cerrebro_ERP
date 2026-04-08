const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String }, // The "Text/Question" part
    
    // Filters
    standard: { type: String, required: true },
    board: { type: String, required: true },
    subject: { type: String, required: true },

    // File (PDF/Image)
    fileUrl: { type: String }, 
    fileType: { type: String }, // 'pdf', 'image', etc.

    // Metadata
    dueDate: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    teacherName: { type: String },
    
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Assignment', AssignmentSchema);