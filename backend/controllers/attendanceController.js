const StudentAttendance = require('../models/Attendance'); 
const TeacherAttendance = require('../models/TeacherAttendance');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

// ==========================================
// --- STUDENT ATTENDANCE CONTROLLERS ---
// ==========================================

// 1. Get Student Attendance (For a specific Class & Date)
exports.getStudentAttendance = async (req, res) => {
    try {
        const { date, standard, board } = req.query;
        
        // 👇 ROBUST FIX: Dynamic Query for finding students
        let studentQuery = { standard };
        if (board) studentQuery.board = board;
        
        // A. Get All Students of this Class
        const students = await Student.find(studentQuery).select('name rollNumber');
        
        // 👇 ROBUST FIX: Dynamic Query for finding the attendance record
        let recordQuery = { date, standard };
        if (board) recordQuery.board = board;

        // B. Get Attendance Record for this Date
        const record = await StudentAttendance.findOne(recordQuery);
        
        // C. Merge Data
        const absentIds = record ? record.absentStudents.map(id => id.toString()) : [];
        
        const attendanceList = students.map(student => ({
            _id: student._id,
            name: student.name,
            rollNumber: student.rollNumber,
            status: absentIds.includes(student._id.toString()) ? 'Absent' : 'Present'
        }));

        res.json({ attendanceList, recordExists: !!record });

    } catch (err) {
        console.error("Get Attendance Error:", err);
        res.status(500).send("Server Error");
    }
};

// 2. Mark/Update Student Attendance
exports.markStudentAttendance = async (req, res) => {
    try {
        const { date, standard, board, absentStudentIds } = req.body;

        // 👇 ROBUST FIX: Build the query dynamically to prevent "Not Found" duplicate bugs
        let query = { date, standard };
        if (board) query.board = board; 

        let record = await StudentAttendance.findOne(query);

        if (record) {
            // Update existing record
            record.absentStudents = absentStudentIds;
            await record.save();
        } else {
            // Create new record
            record = new StudentAttendance({
                date,
                standard,
                board, 
                absentStudents: absentStudentIds,
                takenBy: req.user.id
            });
            await record.save();
        }
        res.json({ msg: "Student Attendance Updated!" });
    } catch (err) {
        console.error("Mark Attendance Error:", err);
        res.status(500).send("Server Error");
    }
};

// 3. Get MY Attendance History (For Logged-in Student)
exports.getMyAttendance = async (req, res) => {
    try {
        const studentId = req.user.id;
        
        // 1. Get Student Details (Standard/Board)
        const student = await Student.findById(studentId);
        if(!student) return res.status(404).json({ msg: "Student not found" });

        // 👇 ROBUST FIX: Dynamic Query based on student's actual profile
        let query = { standard: student.standard };
        if (student.board) query.board = student.board;

        // 2. Find all attendance records for this class
        const records = await StudentAttendance.find(query).sort({ date: -1 });

        // 3. Transform into a Map
        const attendanceMap = {};
        
        records.forEach(record => {
            const dateKey = record.date.toISOString().split('T')[0]; 
            const isAbsent = record.absentStudents.includes(studentId);
            attendanceMap[dateKey] = isAbsent ? 'Absent' : 'Present';
        });

        res.json(attendanceMap);

    } catch (err) {
        console.error("Get My Attendance Error:", err);
        res.status(500).send("Server Error");
    }
};

// 4. [ADMIN] Get Specific Student's History
exports.getStudentAttendanceHistory = async (req, res) => {
    try {
        const studentId = req.params.id; 

        // 1. Find Student to get standard/board
        const student = await Student.findById(studentId);
        if(!student) return res.status(404).json({ msg: "Student not found" });

        // 👇 ROBUST FIX: Dynamic Query for Admin view
        let query = { standard: student.standard };
        if (student.board) query.board = student.board;

        // 2. Find all attendance records for their class
        const records = await StudentAttendance.find(query).sort({ date: -1 });

        // 3. Transform into Map
        const attendanceMap = {};
        
        records.forEach(record => {
            const dateKey = record.date.toISOString().split('T')[0];
            const isAbsent = record.absentStudents.includes(studentId);
            attendanceMap[dateKey] = isAbsent ? 'Absent' : 'Present';
        });

        res.json(attendanceMap);

    } catch (err) {
        console.error("Get Student History Error:", err);
        res.status(500).send("Server Error");
    }
};

// ==========================================
// --- TEACHER ATTENDANCE CONTROLLERS ---
// ==========================================

// 5. Get Teacher Attendance (For a specific Date)
exports.getTeacherAttendance = async (req, res) => {
    try {
        const { date } = req.query;

        // A. Get All Teachers
        const teachers = await Teacher.find().select('name email subject');

        // B. Get Attendance Record
        const record = await TeacherAttendance.findOne({ date });

        // C. Merge
        const absentIds = record ? record.absentTeachers.map(id => id.toString()) : [];

        const attendanceList = teachers.map(teacher => ({
            _id: teacher._id,
            name: teacher.name,
            subject: teacher.subject,
            status: absentIds.includes(teacher._id.toString()) ? 'Absent' : 'Present'
        }));

        res.json({ attendanceList, recordExists: !!record });
    } catch (err) {
        console.error("Get Teacher Attendance Error:", err);
        res.status(500).send("Server Error");
    }
};

// 6. Mark/Update Teacher Attendance
exports.markTeacherAttendance = async (req, res) => {
    try {
        const { date, absentTeacherIds } = req.body;

        let record = await TeacherAttendance.findOne({ date });

        if (record) {
            record.absentTeachers = absentTeacherIds;
            await record.save();
        } else {
            record = new TeacherAttendance({
                date,
                absentTeachers: absentTeacherIds,
                markedBy: req.user.id
            });
            await record.save();
        }
        res.json({ msg: "Teacher Attendance Updated!" });
    } catch (err) {
        console.error("Mark Teacher Attendance Error:", err);
        res.status(500).send("Server Error");
    }
};

// @desc    Get logged-in teacher's attendance history
// @route   GET /api/attendance/teacher/my-history
exports.getMyTeacherAttendance = async (req, res) => {
    try {
        const teacherId = req.user.id; // From your auth middleware

        // Find all teacher attendance records
        const records = await TeacherAttendance.find({}).sort({ date: -1 });

        const attendanceMap = {};

        records.forEach(record => {
            // Format date as YYYY-MM-DD
            const dateKey = record.date.toISOString().split('T')[0];
            
            // Check if this teacher's ID is in the absent list
            const isAbsent = record.absentTeachers.includes(teacherId);
            
            // Map the status
            attendanceMap[dateKey] = isAbsent ? 'Absent' : 'Present';
        });

        res.json(attendanceMap);
    } catch (err) {
        console.error("Get My Teacher Attendance Error:", err);
        res.status(500).send("Server Error");
    }
};