const Student = require('../models/Student');
const Exam = require('../models/Exam');
const Result = require('../models/Result');

// 1. Export Students to CSV
exports.exportStudents = async (req, res) => {
    try {
        const students = await Student.find().select('-password');
        
        // CSV Header
        let csv = 'Name,Email,Role,Standard,Board,Contact\n';
        
        // Data Rows
        students.forEach(student => {
            const name = student.name || 'N/A';
            const email = student.email || 'N/A';
            const role = student.role || 'student';
            const std = student.standard || '-';
            const board = student.board || '-';
            const contact = student.contact || '-';
            
            csv += `${name},${email},${role},${std},${board},${contact}\n`;
        });

        res.header('Content-Type', 'text/csv');
        res.attachment(`students_export_${Date.now()}.csv`);
        return res.send(csv);

    } catch (err) {
        console.error("Export Error:", err);
        res.status(500).send("Server Error");
    }
};

// 2. System Backup (JSON Dump)
exports.systemBackup = async (req, res) => {
    try {
        const backupData = {
            metadata: {
                exportedAt: new Date(),
                version: '1.0'
            },
            students: await Student.find(),
            exams: await Exam.find(),
            results: await Result.find()
        };

        res.header('Content-Type', 'application/json');
        res.attachment(`system_backup_${Date.now()}.json`);
        return res.send(JSON.stringify(backupData, null, 2));

    } catch (err) {
        console.error("Backup Error:", err);
        res.status(500).send("Server Error");
    }
};