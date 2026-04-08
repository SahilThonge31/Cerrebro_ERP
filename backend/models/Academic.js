const mongoose = require('mongoose');

const academicSchema = new mongoose.Schema({
    className: { type: String, required: true }, 
    board: { type: String, required: true, enum: ['SSC', 'CBSE'] }, // Must exist!

    subjects: [{ 
        name: { type: String, required: true },
        teacherName: { type: String, default: "Not Assigned" }
    }],

    lastUpdated: { type: Date, default: Date.now },
    updatedBy: { type: String, default: "Admin" }
});

// THIS LINE ALLOWS "8th SSC" AND "8th CBSE" TO CO-EXIST
academicSchema.index({ className: 1, board: 1 }, { unique: true });

module.exports = mongoose.model('Academic', academicSchema);