const Exam = require('../models/Exam');
const Notification = require('../models/Notification');
const Result = require('../models/Result')

// 1. Create a New Exam Schedule
exports.createExam = async (req, res) => {
    try {
        const { title, standard, board, schedule } = req.body;

        const newExam = new Exam({
            title, standard, board, schedule, createdBy: req.user.id
        });
        await newExam.save();

        // 🔔 AUTOMATIC NOTIFICATION TRIGGER 🔔
        const newNotif = new Notification({
            recipientRole: 'student',
            standard, 
            board,
            title: `New Exam Scheduled: ${title}`,
            message: `The schedule for ${title} has been published. Check dates now.`,
            type: 'exam',
            link: '/student/exams' // Frontend route
        });
        await newNotif.save();

        res.json({ msg: "Exam Schedule Published & Students Notified!", exam: newExam });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};
// 2. Get Exams (For Admin List & Student Dashboard)
exports.getExams = async (req, res) => {
    try {
        const { standard, board } = req.query;
        let query = {};

        // If standard/board provided, filter (for Students)
        if (standard && board) {
            query = { standard, board };
        }

        const exams = await Exam.find(query).sort({ createdAt: -1 });
        res.json(exams);
    } catch (err) {
        res.status(500).send("Server Error");
    }
};

// 3. Delete Exam
exports.deleteExam = async (req, res) => {
    try {
        await Exam.findByIdAndDelete(req.params.id);
        res.json({ msg: "Exam Deleted" });
    } catch (err) {
        res.status(500).send("Server Error");
    }
};

exports.getStudentReport = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        // Fetch results and populate the Exam title so we know which exam it is
        const results = await Result.find({ student: studentId })
                                    .populate('exam', 'title') 
                                    .sort({ createdAt: -1 });
        res.json(results);  
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};