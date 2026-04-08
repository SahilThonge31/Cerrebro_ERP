const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');
const sendEmail = require('../utils/sendEmail');
const Achiever = require('../models/Achiever');

// =================================================
//  1. DASHBOARD STATS (Now with REAL FINANCE DATA)
// =================================================
exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Basic Counts
        const totalStudents = await Student.countDocuments();
        const totalTeachers = await Teacher.countDocuments();
        
        // 2. FINANCE: Calculate Total Revenue & Pending Fees
        // We sum up the 'paidFees' and 'totalFees' fields from all students
        const financeAgg = await Student.aggregate([
            {
                $group: {
                    _id: null,
                    totalCollected: { $sum: "$paidFees" },  // Sum of all money collected
                    totalExpected: { $sum: "$totalFees" }   // Sum of all invoices
                }
            }
        ]);

        const totalRevenue = financeAgg[0]?.totalCollected || 0;
        const totalExpected = financeAgg[0]?.totalExpected || 0;
        const pendingFees = totalExpected - totalRevenue;

        // 3. CLASS-WISE BREAKDOWN (New Feature)
        // Groups revenue by Standard (e.g., "10th": 50000, "12th": 80000)
        const stdWiseRevenue = await Student.aggregate([
             { $match: { paidFees: { $gt: 0 } } }, // Filter: Only check students who paid
             {
                 $group: {
                     _id: "$standard",         // Group by Class
                     collected: { $sum: "$paidFees" },
                     count: { $sum: 1 }        // Count how many students paid
                 }
             },
             { $sort: { _id: 1 } } // Sort alphanumerically
        ]);

        // 4. Fetch Recent Activity
        const recentStudents = await Student.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email createdAt board standard');

        // 5. Construct Response
        const financialStats = {
            totalRevenue, 
            pendingFees,
            collectionRate: totalExpected > 0 ? Math.round((totalRevenue / totalExpected) * 100) : 0,
            byClass: stdWiseRevenue // Sending the class breakdown to frontend
        };

        res.json({
            counts: { students: totalStudents, teachers: totalTeachers },
            recentActivity: recentStudents,
            finance: financialStats
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// =================================================
//  2. GET ALL USERS (Separated)
// =================================================
exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find().select('-password').sort({ createdAt: -1 });
        res.json(students);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find().select('-password').sort({ createdAt: -1 });
        res.json(teachers);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// =================================================
//  3. SMART UPDATE USER (Handles Both Student & Teacher)
// =================================================
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("👉 Admin Update Request for ID:", id);
        console.log("👉 Data:", req.body);

        // --- A. TRY UPDATING STUDENT ---
        let student = await Student.findById(id);
        if (student) {
            const { name, email, contact, standard, board, parentName, parentPhone, address, totalFees } = req.body;
            
            if (name) student.name = name;
            if (email) student.email = email;
            if (contact) student.contact = contact;
            if (address) student.address = address;
            
            // Student Specifics (Flat Structure now)
            if (standard) student.standard = standard;
            if (board) student.board = board;
            if (parentName) student.parentName = parentName;
            if (parentPhone) student.parentPhone = parentPhone;
            if (totalFees) student.totalFees = totalFees;

            await student.save();
            return res.json({ msg: "Student Profile Updated", user: student });
        }

        // --- B. TRY UPDATING TEACHER ---
        let teacher = await Teacher.findById(id);
        if (teacher) {
            const { name, email, contact, qualification, experience, baseSalary, subjects, classes } = req.body;

            if (name) teacher.name = name;
            if (email) teacher.email = email;
            if (contact) teacher.contact = contact;

            // Teacher Specifics
            if (qualification) teacher.qualification = qualification;
            if (experience) teacher.experience = experience;
            if (baseSalary) teacher.baseSalary = Number(baseSalary);

            // Array Handling
            if (subjects) {
                teacher.subjects = Array.isArray(subjects) ? subjects : subjects.split(',').map(s => s.trim());
            }
            if (classes) {
        if (Array.isArray(classes)) {
            // If the frontend already sent objects, just assign them
            teacher.classes = classes;
        } else {
            // If the frontend sent a string (e.g. "10th SSC, 12th CBSE")
            teacher.classes = classes.split(',').map(item => {
                const parts = item.trim().split(' '); // Split "10th SSC" -> ["10th", "SSC"]
                return {
                    standard: parts[0] || item.trim(),
                    board: parts[1] || 'General' // Default to 'General' if board is missing
                };
            });
        }
    }

            await teacher.save();
            return res.json({ msg: "Teacher Profile Updated", user: teacher });
        }

        return res.status(404).json({ msg: "User not found in Students or Teachers database" });

    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).send('Server Error');
    }
};

// =================================================
//  4. DELETE USER (Smart Delete)
// =================================================
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deletedStudent = await Student.findByIdAndDelete(id);
        if (deletedStudent) return res.json({ msg: 'Student Deleted Successfully' });

        const deletedTeacher = await Teacher.findByIdAndDelete(id);
        if (deletedTeacher) return res.json({ msg: 'Teacher Deleted Successfully' });

        return res.status(404).json({ msg: "User not found to delete" });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// =================================================
//  5. FEE REMINDER (Professional Email)
// =================================================
exports.sendFeeReminder = async (req, res) => {
    try {
        // Look in Student Table
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ msg: "Student not found" });

        const message = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #d32f2f; margin-bottom: 10px;">⚠️ Fee Payment Reminder</h2>
                <p>Dear <strong>${student.name}</strong>,</p>
                <p>We hope you are excelling in your studies at <strong>Cerrebro Tutorials</strong>.</p>
                
                <div style="background-color: #fff4f4; padding: 15px; border-left: 4px solid #d32f2f; margin: 20px 0;">
                    <p style="margin: 0; color: #b71c1c;"><strong>Status:</strong> Payment Pending</p>
                    <p style="margin: 5px 0 0; font-size: 14px;">Please check your records and clear the outstanding dues to ensure uninterrupted access to exams and materials.</p>
                </div>

                <p>If you have already made the payment, kindly ignore this email or send the receipt to the admin office.</p>
                <br>
                <p style="font-size: 12px; color: #777;">Best Regards,<br>Accounts Dept.<br>Cerrebro Tutorials</p>
            </div>
        `;

        await sendEmail({
            email: student.email,
            subject: '🔔 Action Required: Fee Payment Pending',
            message: message
        });

        res.json({ msg: `Reminder sent to ${student.name}` });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// =================================================
//  6. TEACHER SALARY MANAGEMENT
// =================================================
exports.updateTeacherSalary = async (req, res) => {
    try {
        const { month, status, amount } = req.body;
        
        // Look in Teacher Table
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) return res.status(404).json({ msg: "Teacher not found" });

        // Ensure array exists (In new model, it's at root, not inside teacherDetails)
        if (!teacher.salaryHistory) teacher.salaryHistory = [];

        // Check if record exists for this month
        const index = teacher.salaryHistory.findIndex(h => h.month === month);

        const salaryRecord = {
            month,
            status,
            amount: Number(amount),
            paidDate: status === 'Paid' ? new Date() : null
        };

        if (index > -1) {
            // Update existing
            teacher.salaryHistory[index] = salaryRecord;
        } else {
            // Add new
            teacher.salaryHistory.push(salaryRecord);
        }

        // We don't need markModified usually for root arrays, but keeping it is safe
        teacher.markModified('salaryHistory'); 
        await teacher.save();
        
        res.json({ msg: "Salary Updated", salaryHistory: teacher.salaryHistory });

    } catch (err) {
        console.error("Salary Error:", err);
        res.status(500).send('Server Error');
    }
};

// 1. Search existing students by name
exports.searchStudents = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.json([]);

        // 👇 Changed 'User' to 'Student'
        // I also removed "role: 'student'" assuming your Student model only contains students anyway!
        const students = await Student.find({
            name: { $regex: query, $options: 'i' } // 'i' makes it case-insensitive
        })
        .select('name profilePic email') // Fetch name, photo, and email to help identify them
        .limit(5); // Only return top 5 matches to keep the dropdown clean

        res.json(students);
    } catch (err) {
        console.error("Search error:", err);
        res.status(500).json({ message: "Error searching students" });
    }
};


exports.addAchiever = async (req, res) => {
    try {
        // Safety Check: Ensure req.body exists (Multer parsed it successfully)
        if (!req.body) {
            return res.status(400).json({ message: "Form data missing. Multer failed to parse." });
        }

        const { name, photoUrl, percentage, examName, year } = req.body;
        
        // Default to the provided photoUrl string (if they selected an existing student)
        let finalPhotoUrl = photoUrl || '';

        // If a physical file was uploaded via Multer, override the URL
        if (req.file) {
            // Because your Multer routes to 'uploads/admin_profiles' based on the baseUrl:
            // We use req.file.path and format it so the frontend can read it safely
            finalPhotoUrl = `/${req.file.path.replace(/\\/g, '/')}`; 
        }

        const newAchiever = new Achiever({
            name,
            photoUrl: finalPhotoUrl,
            percentage,
            examName,
            year: year || new Date().getFullYear().toString()
        });

        await newAchiever.save();
        res.status(201).json({ message: "Achiever added successfully!", achiever: newAchiever });
    } catch (err) {
        console.error("Save error:", err);
        res.status(500).json({ message: "Failed to add achiever" });
    }
};
// 3. Get all achievers (for the admin table)
exports.getAchievers = async (req, res) => {
    try {
        const achievers = await Achiever.find().sort({ createdAt: -1 });
        res.json(achievers);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch achievers" });
    }
};