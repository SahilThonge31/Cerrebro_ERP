const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    title: { type: String, required: true }, // e.g. "Salary - Ravi Sir"
    amount: { type: Number, required: true },
    category: { 
        type: String, 
        enum: ['Salary', 'Rent', 'Electricity', 'Maintenance', 'Other'], 
        default: 'Other' 
    },
    paymentMode: { type: String, enum: ['Cash', 'UPI', 'Bank Transfer'], default: 'Bank Transfer' },
    date: { type: Date, default: Date.now },
    description: { type: String },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
});

module.exports = mongoose.model('Expense', expenseSchema);