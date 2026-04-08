const mongoose = require('mongoose');

// 1. FEE STRUCTURE (The Rules set by Admin)
const feeStructureSchema = new mongoose.Schema({
    standard: { type: String, required: true }, 
    board: { type: String, required: true },    
    monthlyAmount: { type: Number, default: 0 }, 
    yearlyAmount: { type: Number, default: 0 },
    sessionStartMonth: { type: Number, required: true }, 
    sessionEndMonth: { type: Number, default: 3 },       
});

// 2. TRANSACTION (The Receipt)
const transactionSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    amount: { type: Number, required: true },
    paymentMode: { type: String, enum: ['Cash', 'UPI', 'Cheque'], required: true },
    transactionId: { type: String }, 
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['Installment', 'Monthly', 'Advance', 'Full'], required: true },
    status: { type: String, default: 'Success' },
    receiptUrl: { type: String } 
});

// 3. STUDENT FEE PROFILE (The Contract)
const studentFeeProfileSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', unique: true },
    
    // Contract Details
    standard: String,
    board: String,
    paymentPlan: { type: String, enum: ['Monthly', 'Yearly'], required: true },
    
    // Money Math
    totalFee: { type: Number, required: true },    
    discount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true }, 
    paidAmount: { type: Number, default: 0 },
    pendingAmount: { type: Number, required: true },

    // Installment Logic
    installments: [{
        number: Number,
        amount: Number,
        dueDate: Date,
        status: { type: String, enum: ['Pending', 'Paid', 'Overdue'], default: 'Pending' },
        paidDate: Date
    }],

    // --- 🚨 THIS WAS MISSING 🚨 ---
    // This connects the Profile to the list of receipts
    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }], 
    // -----------------------------

    // Advance Logic
    isAdvancePaid: { type: Boolean, default: false } 
});

const FeeStructure = mongoose.model('FeeStructure', feeStructureSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const StudentFeeProfile = mongoose.model('StudentFeeProfile', studentFeeProfileSchema);

module.exports = { FeeStructure, Transaction, StudentFeeProfile };