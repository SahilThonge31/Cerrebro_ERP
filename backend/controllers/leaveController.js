const Leave = require('../models/Leave');
const Teacher = require('../models/Teacher');

// 1. Apply for Leave (Teacher)
exports.applyLeave = async (req, res) => {
    try {
        const { leaveType, startDate, endDate, reason } = req.body;

        const newLeave = new Leave({
            employee: req.user.id,
            role: 'teacher',
            leaveType,
            startDate,
            endDate,
            reason
        });

        await newLeave.save();
        res.json(newLeave);

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

// 2. Get My Leave History (Teacher)
exports.getMyLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ employee: req.user.id }).sort({ createdAt: -1 });
        res.json(leaves);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

// 3. Update Leave Status (Admin - For future use)
exports.updateLeaveStatus = async (req, res) => {
    try {
        const { leaveId, status, adminRemark } = req.body;
        const leave = await Leave.findByIdAndUpdate(
            leaveId, 
            { status, adminRemark },
            { new: true }
        );
        res.json(leave);
    } catch (err) {
        res.status(500).send("Server Error");
    }
};

// 👇 GET ALL LEAVES (Admin View)
exports.getAllLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find()
            .populate('employee', 'name profilePic contact email') // Get Teacher Info
            .sort({ createdAt: -1 }); // Newest first
        res.json(leaves);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};