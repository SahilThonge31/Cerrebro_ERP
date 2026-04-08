const Notification = require('../models/Notification');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

// 1. Get My Notifications (Updated for Smart Teacher Logic)
exports.getMyNotifications = async (req, res) => {
    try {
        const user = req.user; 
        let query = {};

        // --- STUDENT LOGIC ---
        if (user.role === 'student') {
            const student = await Student.findById(user.id);
            if (!student) return res.status(404).json({ msg: "Student not found" });

            query = {
                // Must be for 'student' or 'all' roles
                recipientRole: { $in: ['student', 'all'] },
                $or: [
                    { standard: student.standard, board: student.board }, // Class Specific
                    { standard: null } // Global (All School)
                ]
            };
        } 
        
        // --- TEACHER LOGIC (NEW & IMPROVED) ---
        else if (user.role === 'teacher') {
            const teacher = await Teacher.findById(user.id);
            if (!teacher) return res.status(404).json({ msg: "Teacher not found" });

            // Teacher sees notices if:
            // 1. It is sent to 'teacher' or 'all'
            // 2. AND (It is Global OR It is for a class they teach)
            
            query = {
                recipientRole: { $in: ['teacher', 'all'] },
                $or: [
                    { standard: null }, // Global Teacher Notice
                    { standard: { $in: teacher.classes } } // Notice for a class they teach (e.g., "10th")
                ]
            };
        }

        const notifications = await Notification.find(query).sort({ createdAt: -1 });
        
        // Check read status
        const formatted = notifications.map(n => ({
            ...n._doc,
            isRead: n.isReadBy.includes(user.id)
        }));

        res.json(formatted);

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

// 2. Create Notice (Updated to accept Recipient Role)
exports.createNotice = async (req, res) => {
    try {
        const { 
            title, message, type, 
            target, // 'all' (Global) or 'specific' (Class based)
            standard, board, 
            recipient // 'student', 'teacher', or 'all' (NEW FIELD)
        } = req.body;

        let noticeData = {
            title,
            message,
            type: type || 'notice',
            recipientRole: recipient || 'student', // Default to student if missing
            createdAt: Date.now()
        };

        // Logic: Scope (Global vs Class Specific)
        if (target === 'all') {
            // Global Notice (e.g., for All Teachers, or All Students, or Everyone)
            noticeData.standard = null;
            noticeData.board = null;
        } else {
            // Class Specific Notice
            if (!standard || !board) {
                return res.status(400).json({ msg: "Standard/Board required for specific notices." });
            }
            noticeData.standard = standard;
            noticeData.board = board;
        }

        const newNotice = new Notification(noticeData);
        await newNotice.save();

        res.json({ msg: "Notice Published Successfully!", notice: newNotice });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

// 2. Mark All As Read
exports.markAllRead = async (req, res) => {
    try {
        const userId = req.user.id;
        // Find notifications not yet read by this user, push user ID to array
        await Notification.updateMany(
            { isReadBy: { $ne: userId } }, // Condition
            { $addToSet: { isReadBy: userId } } // Update
        );
        res.json({ msg: "All marked as read" });
    } catch (err) {
        res.status(500).send("Server Error");
    }
};


// 3. [ADMIN] Get All Sent Notices (History)
exports.getAllSentNotices = async (req, res) => {
    try {
        // Fetch all, sorted by newest first
        const notices = await Notification.find().sort({ createdAt: -1 });
        res.json(notices);
    } catch (err) {
        res.status(500).send("Server Error");
    }
};

// 4. [ADMIN] Delete Notice (Undo mistake)
exports.deleteNotice = async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.json({ msg: "Notice Deleted" });
    } catch (err) {
        res.status(500).send("Server Error");
    }
};