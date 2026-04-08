const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., "Mathematics"
    standard: { type: String, required: true }, // e.g., "10th"
    image: { type: String }, // URL to subject icon/image
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);