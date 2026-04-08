const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    title: { type: String, required: true }, // e.g., "Mid-Term Examination"
    standard: { type: String, required: true },
    board: { type: String, required: true },
    
    // The list of papers in this exam
    schedule: [{
        subject: { type: String, required: true },
        date: { type: Date, required: true },
        startTime: { type: String, required: true }, // e.g., "10:00 AM"
        duration: { type: String, required: true }   // e.g., "2 Hours"
    }],

    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
});

module.exports = mongoose.model('Exam', examSchema);