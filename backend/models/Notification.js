const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipientRole: { type: String, enum: ['student', 'teacher', 'all'], required: true },
    
    // Target Audience (Optional - if null, it goes to ALL in that role)
    standard: { type: String }, 
    board: { type: String },

    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { 
        type: String, 
        enum: ['exam', 'gallery', 'timetable', 'notice', 'urgent', 'event', 'holiday'], 
        default: 'notice' 
    },
    
    // Where should the user go when they click?
    link: { type: String }, 

    isReadBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Track who read it
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);