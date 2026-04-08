const Timetable = require('../models/Timetable');
const Student = require('../models/Student'); // <--- 1. ADD THIS IMPORT

// ADMIN: Upload or Update Timetable
exports.uploadTimetable = async (req, res) => {
    try {
        const { standard, board } = req.body;
        if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

        const fileUrl = req.file.path;

        // Query by BOTH standard and board
        const timetable = await Timetable.findOneAndUpdate(
            { standard, board }, 
            { 
                standard, 
                board, 
                pdfUrl: fileUrl, 
                uploadedBy: req.user.id 
            },
            { new: true, upsert: true } 
        );

        res.json({ msg: "Timetable Uploaded!", timetable });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
// SHARED: Get Timetable (For Admin, Student, Teacher)
exports.getTimetable = async (req, res) => {
    try {
        const { standard, board } = req.query;

        // If User is a Student, we can force their own class/board (Optional Security)
        // For now, we trust the query params sent by frontend
        
        const timetable = await Timetable.findOne({ standard, board });
        
        if (!timetable) {
            return res.status(404).json({ msg: "Timetable not uploaded yet." });
        }
        
        res.json(timetable);
    } catch (err) {
        res.status(500).send("Server Error");
    }
};

// 2. ADD THIS NEW FUNCTION
exports.getMyTimetable = async (req, res) => {
    try {
        // Find the logged-in student to know their Class/Board
        const student = await Student.findById(req.user.id);
        
        if (!student) {
            return res.status(404).json({ msg: "Student record not found." });
        }

        // Find the timetable that matches their details
        const timetable = await Timetable.findOne({ 
            standard: student.standard, 
            board: student.board 
        });

        if (!timetable) {
            return res.status(404).json({ msg: "Timetable not uploaded yet." });
        }

        res.json(timetable);

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

// 3. GET ALL TIMETABLES (For Admin Summary)
exports.getAllTimetables = async (req, res) => {
    try {
        // Sort by Standard (e.g., 10th) and then Board
        const list = await Timetable.find().sort({ standard: 1, board: 1 });
        res.json(list);
    } catch (err) {
        res.status(500).send("Server Error");
    }
};

// ==========================================
// 5. ADMIN: DELETE TIMETABLE
// ==========================================
exports.deleteTimetable = async (req, res) => {
    try {
        const timetable = await Timetable.findByIdAndDelete(req.params.id);
        
        if (!timetable) {
            return res.status(404).json({ msg: "Timetable not found." });
        }

        res.json({ msg: "Timetable deleted successfully." });
    } catch (err) {
        console.error("Error deleting timetable:", err);
        res.status(500).send("Server Error");
    }
};