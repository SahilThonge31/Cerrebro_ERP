const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    className: { type: String, required: true }, // e.g., 10th
    schoolName: { type: String, required: true },
    board: { type: String, required: true }, // SSC, CBSE, etc.
    studentMobile: { type: String, required: true },
    parentMobile: { type: String, required: true },
    address: { type: String, required: true },
    previousMarks: { type: String, required: true },
    referenceSource: { type: String, required: true },
    status: { type: String, default: 'Pending' }, // So admin can mark as "Contacted" later
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Enquiry', enquirySchema);