const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    contact: { type: String }, 
    address: { type: String },
    role: { type: String, default: 'student' },
    profilePic: { type: String, default: '' }, 
    
    // 👇 ADD THIS FIELD
    bio: { type: String, default: '' }, 

    board: { type: String, enum: ['SSC', 'CBSE'] },
    standard: { type: String }, 
    rollNumber: { type: String, unique: true }, 
    
    parentName: { type: String },
    parentPhone: { type: String },
    
    dob: { type: Date },
    gender: { type: String },
    
    totalFees: { type: Number, default: 0 },
    paidFees: { type: Number, default: 0 },

    // 👇 Added field for notification preferences as seen in your frontend
    notificationPreferences: {
        emailAlerts: { type: Boolean, default: true },
        smsAlerts: { type: Boolean, default: false },
        assignmentReminders: { type: Boolean, default: true },
        attendanceAlerts: { type: Boolean, default: true }
    },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);