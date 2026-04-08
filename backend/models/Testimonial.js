const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        refPath: 'userModel' // Dynamic reference to either Student or Teacher
    },
    userModel: { 
        type: String, 
        required: true, 
        enum: ['Student', 'Teacher'] 
    },
    name: { type: String, required: true },
    role: { type: String, required: true }, // e.g., "Class 10 Student" or "Math Teacher"
    text: { type: String, required: true },
    profilePic: { type: String, default: "" },
    isApproved: { type: Boolean, default: true }, // Default to true, or false if admin needs to approve first
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Testimonial', testimonialSchema);