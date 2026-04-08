const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    contact: { type: String, required: true },
    address: { type: String },
    role: { type: String, default: 'teacher' },
    profilePic: { type: String, default: '' },
    
    // --- TEACHER SPECIFIC DATA ---
    qualification: { type: String }, 
    bio: { type: String },
    subjects: [{ type: String }],
    
    classes: [{ 
        standard: { type: String, required: true },
        board: { type: String, required: true }
    }], 
    
    experience: { type: String, default: '0 Years' },
    baseSalary: { type: Number, default: 0 },

    // 👇 ADD THIS FIELD FOR SETTINGS
    notificationPreferences: {
        emailAlerts: { type: Boolean, default: true },
        smsAlerts: { type: Boolean, default: false },
        examUpdates: { type: Boolean, default: true },
        adminNotices: { type: Boolean, default: true }
    },

    salaryHistory: [{
        month: String, 
        status: { type: String, enum: ['Paid', 'Unpaid', 'Pending'], default: 'Pending' },
        amount: Number,
        paidDate: Date
    }],

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Teacher', teacherSchema);