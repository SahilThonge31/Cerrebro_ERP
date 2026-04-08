const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
    title: { type: String, required: true },
    imageUrl: { type: String, required: true }, // Path to the uploaded file
    link: { type: String },                     // Optional external link
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Advertisement', adSchema);