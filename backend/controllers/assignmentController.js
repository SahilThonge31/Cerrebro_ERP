const Assignment = require('../models/Assignment');
const Notification = require('../models/Notification');
const Teacher = require('../models/Teacher');
const path = require('path');
// Note: 'fs' import was removed because we no longer interact with the local file system!

// ==========================================
// 1. Create Assignment & Notify Students
// ==========================================
exports.createAssignment = async (req, res) => {
    try {
        const { title, description, standard, board, subject, dueDate } = req.body;
        
        let fileUrl = "";
        let fileType = "";

        // 👇 NEW LOGIC: Grab the secure Cloudinary URL and determine file type
        if (req.file) {
            fileUrl = req.file.path; 
            // Gets the extension (e.g., 'pdf', 'jpg') from the original uploaded file
            fileType = path.extname(req.file.originalname).substring(1); 
        }

        // --- Get Teacher Info ---
        const teacher = await Teacher.findById(req.user.id);
        const teacherName = teacher ? teacher.name : "Faculty";

        // --- Save Assignment ---
        const newAssignment = new Assignment({
            title,
            description,
            standard,
            board,
            subject,
            fileUrl,   // Saves the Cloudinary URL
            fileType,  // Saves 'pdf', 'png', etc.
            dueDate,
            createdBy: req.user.id,
            teacherName: teacherName
        });

        await newAssignment.save();

        // --- AUTO-NOTIFY STUDENTS ---
        const newNotification = new Notification({
            recipientRole: 'student',
            standard: standard,
            board: board,
            title: `New Assignment: ${subject}`,
            message: `Topic: ${title} - Due by ${new Date(dueDate).toLocaleDateString()}`,
            type: 'notice',
            link: '/student/assignments'
        });

        await newNotification.save();

        res.json(newAssignment);

    } catch (err) {
        console.error("Assignment Upload Error:", err);
        res.status(500).send("Server Error");
    }
};

// ==========================================
// 2. Get Assignments (Filtered)
// ==========================================
exports.getAssignments = async (req, res) => {
    try {
        const { standard, board, subject } = req.query;
        
        let query = {};
        if (standard) query.standard = standard;
        if (board) query.board = board;
        if (subject) query.subject = subject;

        const assignments = await Assignment.find(query).sort({ createdAt: -1 });
        res.json(assignments);

    } catch (err) {
        console.error("Error fetching assignments:", err);
        res.status(500).send("Server Error");
    }
};

// ==========================================
// 3. Delete Assignment
// ==========================================
exports.deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        
        if (!assignment) {
            return res.status(404).json({ msg: "Assignment not found" });
        }

        // 👇 NEW LOGIC: We no longer need to manually delete local files using 'fs.unlink'.
        // If you want to automatically delete the file from Cloudinary to save space, 
        // you would use the Cloudinary SDK here (e.g., cloudinary.uploader.destroy(public_id)). 
        // For now, simply deleting the database record is sufficient for the app functionality.

        await assignment.deleteOne();
        
        res.json({ msg: "Assignment deleted successfully" });

    } catch (err) {
        console.error("Error deleting assignment:", err);
        res.status(500).send("Server Error");
    }
};