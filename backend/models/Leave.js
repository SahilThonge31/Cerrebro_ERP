const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    role: { type: String, default: 'teacher' }, // Scalable for other staff later
    
    leaveType: { 
        type: String, 
        enum: ['Sick Leave', 'Casual Leave', 'Emergency', 'Other'], 
        required: true 
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    
    status: { 
        type: String, 
        enum: ['Pending', 'Approved', 'Rejected'], 
        default: 'Pending' 
    },
    adminRemark: { type: String }, // If admin rejects, they can say why

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Leave', LeaveSchema);