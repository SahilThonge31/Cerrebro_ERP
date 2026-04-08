const mongoose = require('mongoose');

// Schema for individual payment entries (Months or Installments)
const paymentSchema = new mongoose.Schema({
    title: { type: String, required: true },       // e.g., "January" or "Installment 1"
    amount: { type: Number, required: true },      // e.g., 2000
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Pending' },
    paidDate: { type: Date },                      // Only if status is 'Paid'
    receiptUrl: { type: String }                   // Link to download receipt
});

const feeRecordSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    standard: { type: String, required: true },
    paymentType: { type: String, enum: ['Monthly', 'Yearly'], required: true },
    totalFee: { type: Number, required: true },
    breakdown: [paymentSchema] // Array of months or installments
}, { timestamps: true });

module.exports = mongoose.model('FeeRecord', feeRecordSchema);