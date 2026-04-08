const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    standard: { type: String, required: true }, // e.g., "10th"
    board: { type: String, required: true },    // e.g., "CBSE"
    
    // We only store ABSENT students to save space. 
    // If a student is NOT in this list, they are PRESENT.
    absentStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    
    takenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' } // Or Teacher
});

// Compound index to ensure we don't have duplicate records for the same class on the same day
attendanceSchema.index({ date: 1, standard: 1, board: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);