const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    
    // Context
    standard: { type: String, required: true },
    board: { type: String, required: true },
    subject: { type: String, required: true },
    examType: { type: String, default: 'Final' }, // You can expand this later (Mid-term, Unit Test)

    // Data
    marksObtained: { type: Number, required: true },
    totalMarks: { type: Number, default: 100 },
    remarks: { type: String },

    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    createdAt: { type: Date, default: Date.now }
});

// Ensure a student has only one result per subject per exam type
ResultSchema.index({ student: 1, subject: 1, examType: 1 }, { unique: true });

module.exports = mongoose.model('Result', ResultSchema);