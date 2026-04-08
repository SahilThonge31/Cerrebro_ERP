const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    title: { type: String, required: true }, // e.g., "Chapter 1 Notes"
    type: { type: String, enum: ['Textbook', 'Notes', 'Audio', 'Video'], required: true },
    url: { type: String, required: true }, // Link to the file/video
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    standard: { type: String, required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Who uploaded it
}, { timestamps: true });

module.exports = mongoose.model('StudyMaterial', materialSchema);