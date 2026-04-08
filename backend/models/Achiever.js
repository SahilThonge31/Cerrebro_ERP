const mongoose = require('mongoose');

const achieverSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    photoUrl: { 
        type: String, 
        required: true 
    },
    percentage: { 
        type: String, 
        required: true // Stored as a string so you can format it like "98.5%" or "99/100"
    },
    examName: { 
        type: String, 
        required: true // e.g., "10th SSC Board", "JEE Mains"
    },
    year: { 
        type: String,
        default: () => new Date().getFullYear().toString()
    }
}, { timestamps: true });

module.exports = mongoose.model('Achiever', achieverSchema);