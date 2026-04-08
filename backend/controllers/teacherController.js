const User = require('../models/Teacher');

exports.getAllTeachers = async (req, res) => {
    try {
        const teachers = await User.find({ role: 'teacher' }).select('-password').sort({ createdAt: -1 });
        res.json(teachers);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.deleteTeacher = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Teacher Deleted Successfully' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.updateTeacher = async (req, res) => {
    try {
        const { name, email, contact, subjects, classes, experience, baseSalary, qualification } = req.body;
        let user = await User.findById(req.params.id);

        if (!user || user.role !== 'teacher') return res.status(404).json({ msg: "Teacher not found" });

        if (name) user.name = name;
        if (email) user.email = email;
        if (contact) user.contact = contact;

        if (!user.teacherDetails) user.teacherDetails = {};
        if (qualification) user.teacherDetails.qualification = qualification;
        if (experience) user.teacherDetails.experience = experience;
        if (baseSalary) user.teacherDetails.baseSalary = Number(baseSalary);
        
        if (subjects) user.teacherDetails.subjects = Array.isArray(subjects) ? subjects : subjects.split(',');
        if (classes) user.teacherDetails.classes = Array.isArray(classes) ? classes : classes.split(',');

        user.markModified('teacherDetails');
        await user.save();
        res.json({ msg: "Teacher Profile Updated", user });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// backend/controllers/adminController.js

exports.updateTeacherSalary = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { month, amount, status } = req.body;

        // 1. Find the Teacher
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) return res.status(404).json({ msg: "Teacher not found" });

        // 2. Check if Salary Record for this Month already exists
        // We use .toString() because sometimes ObjectId comparisons fail otherwise
        const existingRecordIndex = teacher.salaryHistory.findIndex(
            (record) => record.month === month
        );

        if (existingRecordIndex !== -1) {
            // SCENARIO A: UPDATE EXISTING RECORD
            teacher.salaryHistory[existingRecordIndex].amount = amount;
            teacher.salaryHistory[existingRecordIndex].status = status;
            teacher.salaryHistory[existingRecordIndex].paidDate = status === 'Paid' ? new Date() : null;
        } else {
            // SCENARIO B: PUSH NEW RECORD
            teacher.salaryHistory.push({
                month,
                amount,
                status,
                paidDate: status === 'Paid' ? new Date() : null
            });
        }

        // 3. FORCE SAVE (This is the crucial step often missed)
        // Mongoose sometimes doesn't detect array changes inside subdocuments
        teacher.markModified('salaryHistory'); 
        
        await teacher.save();

        res.json({ msg: "Salary Updated Successfully", salaryHistory: teacher.salaryHistory });

    } catch (err) {
        console.error("Salary Update Error:", err);
        res.status(500).send("Server Error");
    }
};

exports.updateTeacherProfile = async (req, res) => {
    try {
        const { mobile, address, bio, qualifications, notificationPreferences } = req.body;

        // Create update object based on Schema keys
        const updateFields = {};
        if (mobile !== undefined) updateFields.contact = mobile;
        if (address !== undefined) updateFields.address = address;
        if (bio !== undefined) updateFields.bio = bio;
        if (qualifications !== undefined) updateFields.qualification = qualifications;
        if (notificationPreferences !== undefined) updateFields.notificationPreferences = notificationPreferences;

        const teacher = await Teacher.findByIdAndUpdate(
            req.user.id,
            { $set: updateFields },
            { new: true }
        ).select('-password');

        res.json(teacher);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};