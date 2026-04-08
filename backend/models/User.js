const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    contact: { type: String, required: true },
    role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
    address: { type: String },
    
    // --- 1. STUDENT SPECIFIC DATA ---
    studentDetails: {
        board: { type: String, enum: ['SSC', 'CBSE'] }, // Critical for our new Features
        standard: { type: String }, // "10th", "12th"
        rollNumber: { type: String }, 
        parentName: { type: String },
        parentPhone: { type: String },
        address: { type: String },
        totalFees: { type: Number, default: 0 },
        paidFees: { type: Number, default: 0 }
    },

    // --- 2. TEACHER SPECIFIC DATA ---
    teacherDetails: {
        qualification: { type: String },
        
        // Arrays for Multiple Entries
        subjects: [{ type: String }],       // e.g. ["Biology", "Maths"]
        classes: [{ type: String }],        // e.g. ["10th", "12th"]
        
        // Career Info
        experience: { type: String, default: '0 Years' },
        baseSalary: { type: Number, default: 0 },
        
        // Salary Tracking
        salaryHistory: [{
            month: String, // "January 2026"
            status: { type: String, enum: ['Paid', 'Unpaid', 'Pending'], default: 'Pending' },
            amount: Number,
            paidDate: Date
        }],

        // Documents (Optional for now)
        documents: {
            cv: String,
            idProof: String
        }
    },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);