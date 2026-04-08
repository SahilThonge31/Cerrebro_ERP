const { Transaction } = require('../models/Fee');
const Expense = require('../models/Expense');
const Student = require('../models/Student');

// --- 1. GET FULL FINANCIAL REPORT ---
exports.getFinanceDashboard = async (req, res) => {
    try {
        const { board, standard, dateRange } = req.query; // Filters

        // A. FETCH INCOME (Student Fees)
        let transactionQuery = {};
        
        // Date Filter (e.g., 'today', 'month', 'year')
        const now = new Date();
        if(dateRange === 'month') {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            transactionQuery.date = { $gte: startOfMonth };
        }

        // Fetch Transactions & Populate Student info for filtering
        let transactions = await Transaction.find(transactionQuery)
            .populate('student', 'name standard board profilePic')
            .sort({ date: -1 });

        // Apply Board/Standard Filters (Post-fetch filtering is easier for small/medium datasets)
        if (board && board !== 'All') {
            transactions = transactions.filter(t => t.student?.board === board);
        }
        if (standard && standard !== 'All') {
            transactions = transactions.filter(t => t.student?.standard === standard);
        }

        const totalIncome = transactions.reduce((acc, curr) => acc + curr.amount, 0);

        // B. FETCH EXPENSES (Salaries, etc.)
        const expenses = await Expense.find().sort({ date: -1 });
        const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
        const totalSalaries = expenses
            .filter(e => e.category === 'Salary')
            .reduce((acc, curr) => acc + curr.amount, 0);

        // C. CALCULATE NET PROFIT
        const netProfit = totalIncome - totalExpenses;

        // D. RECENT ONLINE ACTIVITY (Specific request)
        const onlineTransactions = transactions.filter(t => t.paymentMode.includes('Online') || t.paymentMode === 'UPI');

        res.json({
            summary: {
                income: totalIncome,
                expenses: totalExpenses,
                salaries: totalSalaries,
                profit: netProfit
            },
            transactions: transactions, // Filtered list
            expensesList: expenses,
            recentOnline: onlineTransactions.slice(0, 5) // Top 5
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// --- 2. RECORD NEW EXPENSE (Salary, etc.) ---
exports.addExpense = async (req, res) => {
    try {
        const { title, amount, category, paymentMode, description } = req.body;
        
        const expense = new Expense({
            title, amount, category, paymentMode, description,
            recordedBy: req.user.id
        });
        
        await expense.save();
        res.json(expense);

    } catch (err) {
        res.status(500).send('Server Error');
    }
};