const Result = require('../models/Result');
const Student = require('../models/Student');

// 1. Submit Marks (Bulk Update/Insert)
exports.submitMarks = async (req, res) => {
    try {
        const { standard, board, subject, examType, totalMarks, studentsData } = req.body;
        // studentsData = [ { studentId: "123", marks: 85, remarks: "Good" }, ... ]

        const operations = studentsData.map(entry => ({
            updateOne: {
                filter: { 
                    student: entry.studentId, 
                    subject: subject, 
                    examType: examType || 'Final' 
                },
                update: { 
                    $set: { 
                        standard,
                        board,
                        marksObtained: entry.marks,
                        remarks: entry.remarks,
                        teacher: req.user.id,
                        totalMarks: totalMarks || 100 
                    }
                },
                upsert: true // Create if doesn't exist, Update if it does
            }
        }));

        await Result.bulkWrite(operations);
        res.json({ msg: "Marks saved successfully!" });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

// 2. Get Existing Marks (To populate form if editing)
// 2. Get Results (Smart Filter)
exports.getClassResults = async (req, res) => {
    try {
        const { standard, board, subject } = req.query;
        
        // 1. Build Query Dynamically
        let query = {};
        
        // Only add fields if they are sent from Frontend
        if (standard) query.standard = standard;
        if (board) query.board = board;
        
        // If subject is provided (Teacher View), filter by it.
        // If NOT provided (Admin View), return ALL subjects.
        if (subject) query.subject = subject;

        const results = await Result.find(query)
            .populate('student', 'name rollNumber') // Optional: Get student details
            .sort({ student: 1 });

        res.json(results);

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};