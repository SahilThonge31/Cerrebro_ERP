const { FeeStructure, StudentFeeProfile, Transaction } = require('../models/Fee');
const Student = require('../models/Student');
const generateReceipt = require('../utils/receiptGenerator');
const sendEmail = require('../utils/sendEmail');
const razorpay = require('../config/razorpay'); // Import the configured instance
const crypto = require('crypto');
// --- 1. INITIALIZE FEE RULES (One time setup) ---
exports.createFeeStructure = async (req, res) => {
    try {
        const rules = req.body; 
        await FeeStructure.insertMany(rules);
        res.json({ msg: "Fee Rules Created Successfully" });
    } catch (err) { res.status(500).send('Server Error'); }
};

// --- 2. ASSIGN FEE TO STUDENT ---
exports.assignFeeProfile = async (req, res) => {
    try {
        const { studentId, paymentPlan, discount, joinDate } = req.body;
        
        const student = await Student.findById(studentId);
        if(!student) return res.status(404).json({ msg: "Student not found" });

        const rule = await FeeStructure.findOne({ 
            standard: student.standard, 
            board: student.board 
        });

        if(!rule) return res.status(400).json({ msg: "No Fee Rule found for this Class/Board" });

        // Prorating Logic
        const joining = new Date(joinDate || Date.now());
        // Simple logic: If plan is monthly, count months. If yearly, take full.
        // You can refine this calculation logic later.
        let monthsRemaining = 12; 
        if (paymentPlan === 'Monthly') {
            monthsRemaining = 10; 
        }

        let totalFee = 0;
        if (paymentPlan === 'Yearly') {
            totalFee = rule.yearlyAmount;
        } else {
            totalFee = rule.monthlyAmount * monthsRemaining;
        }

        const finalAmount = totalFee - (discount || 0);

        const profile = new StudentFeeProfile({
            student: studentId,
            standard: student.standard,
            board: student.board,
            paymentPlan,
            totalFee,
            discount,
            finalAmount,
            pendingAmount: finalAmount,
            paidAmount: 0,
            transactions: [], // <--- EXPLICITLY INITIALIZE EMPTY ARRAY
            isAdvancePaid: false
        });

        student.totalFees = finalAmount;
        student.paidFees = 0;
        await student.save();
        
        await profile.save();
        res.json(profile);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// --- 3. RECORD PAYMENT (Cash/UPI) ---
exports.recordPayment = async (req, res) => {
    try {
        const { studentId, amount, mode, type } = req.body;
        
        const student = await Student.findById(studentId);
        const profile = await StudentFeeProfile.findOne({ student: studentId });

        if (!profile) return res.status(404).json({ msg: "Fee Profile not found. Assign fees first." });

        // 1. Create Transaction
        const txnId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        const transaction = new Transaction({
            student: studentId,
            amount: Number(amount),
            paymentMode: mode,
            transactionId: txnId,
            type: type,
            status: 'Success'
        });

        // 2. Generate PDF Receipt
        generateReceipt(transaction, student, async (receiptUrl) => {
            transaction.receiptUrl = receiptUrl;
            await transaction.save();

            // 3. Update Profile Balance
            profile.paidAmount += Number(amount);
            profile.pendingAmount -= Number(amount);

            // --- 🚨 THE FIX IS HERE 🚨 ---
            // Ensure array exists before pushing
            if (!profile.transactions) {
                profile.transactions = [];
            }
            profile.transactions.push(transaction._id);
            // -----------------------------
            
            if (type === 'Advance') profile.isAdvancePaid = true;

            await profile.save();

            // 4. Update Student Model
            student.paidFees = profile.paidAmount;
            await student.save();

            // 5. Send Email
            const emailMsg = `
                <h3>Payment Successful</h3>
                <p>Hi ${student.name},</p>
                <p>We received <b>₹${amount}</b> via ${mode}.</p>
                <p>Transaction ID: ${txnId}</p>
                <p>You can download your receipt from your dashboard.</p>
            `;
            // Wrap email in try-catch so it doesn't crash payment if email fails
            try {
                await sendEmail({ email: student.email, subject: 'Fee Receipt - Cerrebro', message: emailMsg });
            } catch (emailErr) {
                console.error("Email failed but payment recorded:", emailErr);
            }

            res.json({ msg: "Payment Recorded", receipt: receiptUrl });
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// --- 4. GET STUDENT FEE DETAILS (Updated for Debugging) ---
exports.getFeeDetails = async (req, res) => {
    try {
        console.log("🔍 Fetching fees for Student ID:", req.params.studentId); // Log 1

        // Check if ID is valid format
        if (!req.params.studentId || req.params.studentId === 'undefined') {
             console.log("❌ Invalid Student ID received");
             return res.status(400).json({ msg: "Invalid Student ID" });
        }

        const profile = await StudentFeeProfile.findOne({ student: req.params.studentId });
        
        if(!profile) {
            console.log("⚠️ No Fee Profile found in DB"); // Log 2
            return res.status(404).json({ msg: "No fee record found" });
        }

        // Populate manually to debug
        await profile.populate('transactions');

        res.json(profile);

    } catch (err) {
        console.error("❌ ERROR in getFeeDetails:", err); // <--- THIS WILL SHOW THE REAL ERROR
        res.status(500).send('Server Error');
    }
};

// ==========================================
// 5. ONLINE PAYMENT: CREATE ORDER
// ==========================================
exports.createRazorpayOrder = async (req, res) => {
    try {
        const { amount } = req.body; // Amount in Rupees

        const options = {
            amount: amount * 100, // Razorpay works in Paise (1 Rupee = 100 Paise)
            currency: "INR",
            receipt: `order_rcptid_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        res.json(order);

    } catch (err) {
        console.error("Razorpay Order Failed:", err);
        res.status(500).send("Order Creation Failed");
    }
};

// ==========================================
// 6. ONLINE PAYMENT: VERIFY & SAVE
// ==========================================
exports.verifyRazorpayPayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature, 
            studentId, 
            amount 
        } = req.body;

        // 1. SECURITY CHECK: Verify Signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'YOUR_SECRET_HERE')
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ msg: "Invalid Payment Signature" });
        }

        // 2. Payment Verified! Now Save to DB (Same logic as Manual Payment)
        const student = await Student.findById(studentId);
        const profile = await StudentFeeProfile.findOne({ student: studentId });

        if (!profile) return res.status(404).json({ msg: "Profile not found" });

        // Create Transaction
        const transaction = new Transaction({
            student: studentId,
            amount: Number(amount),
            paymentMode: 'Online (Razorpay)',
            transactionId: razorpay_payment_id, // Use Razorpay ID as Ref
            type: 'Online Payment',
            status: 'Success'
        });

        // Generate Receipt
        generateReceipt(transaction, student, async (receiptUrl) => {
            transaction.receiptUrl = receiptUrl;
            await transaction.save();

            // Update Profile
            profile.paidAmount += Number(amount);
            profile.pendingAmount -= Number(amount);
            
            if (!profile.transactions) profile.transactions = [];
            profile.transactions.push(transaction._id);
            
            await profile.save();

            // Update Student Model
            student.paidFees = profile.paidAmount;
            await student.save();

            // Send Email
            const emailMsg = `
                <h3>Payment Successful! 🎉</h3>
                <p>Hi ${student.name},</p>
                <p>We received your online payment of <b>₹${amount}</b>.</p>
                <p>Payment ID: ${razorpay_payment_id}</p>
                <p>Your receipt is attached to your dashboard.</p>
            `;
            try {
                await sendEmail({ email: student.email, subject: 'Payment Success - Cerrebro', message: emailMsg });
            } catch (e) { console.error("Email failed"); }

            res.json({ msg: "Payment Verified", receipt: receiptUrl });
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Verification Failed');
    }
};