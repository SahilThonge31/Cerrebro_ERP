// FIX 1: Rename this variable to 'Student' so it matches the code below
const Student = require('../models/Student'); 
const sendEmail = require('../utils/sendEmail');

// --- 1. GET ALL STUDENTS ---
exports.getAllStudents = async (req, res) => {
    try {
        // Use 'Student' here
        const students = await Student.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });
        res.json(students);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// --- 2. DELETE STUDENT ---
exports.deleteStudent = async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Student Deleted Successfully' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// --- 3. UPDATE STUDENT (Fixed for Flat Structure) ---
exports.updateStudent = async (req, res) => {
    try {
        const { name, email, contact, standard, board } = req.body;
        let user = await Student.findById(req.params.id);
        
        if (!user || user.role !== 'student') return res.status(404).json({ msg: "Student not found" });

        if (name) user.name = name;
        if (email) user.email = email;
        if (contact) user.contact = contact;
        
        // FIX 2: No more 'studentDetails'. Update directly.
        if (standard) user.standard = standard;
        if (board) user.board = board;

        await user.save();
        res.json({ msg: "Student Profile Updated", user });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// --- 4. FEE REMINDER ---
exports.sendFeeReminder = async (req, res) => {
    try {
        const user = await Student.findById(req.params.id);
        if (!user || user.role !== 'student') return res.status(404).json({ msg: "Student not found" });

        const message = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #d32f2f;">Fee Payment Pending</h2>
                <p>Dear <strong>${user.name}</strong>,</p>
                <p>This is a reminder regarding your pending tuition fees at Cerrebro Tutorials.</p>
                <p>Please clear your dues to ensure uninterrupted access to your classes.</p>
                <p>Regards,<br>Admin Team</p>
            </div>
        `;

        await sendEmail({ email: user.email, subject: '🔔 Fee Payment Reminder', message });
        res.json({ msg: `Reminder sent to ${user.name}` });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// --- 5. UPLOAD PROFILE PICTURE ---
exports.uploadProfilePic = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ msg: "No image uploaded" });

        

        // 1. GET THE SECURE CLOUD URL
        // Cloudinary automatically attaches the live URL to req.file.path
        const cloudUrl = req.file.path; 

        // 2. UPDATE DATABASE
        const student = await Student.findByIdAndUpdate(
            req.user.id, 
            { $set: { profilePic: cloudUrl } }, // Saves the full Cloudinary link
            { new: true }
        );

        res.json({ 
            msg: "Profile picture updated successfully in the cloud!", 
            profilePic: student.profilePic // Sends the cloud link back to the frontend
        });

    } catch (err) {
    // ✅ Replace your entire catch with this
    console.log("=== FULL ERROR START ===");
    console.log(err);
    console.log("=== FULL ERROR END ===");
    
    res.status(500).json({ 
        msg: "Server Error", 
        devError: err.message, // This sends the real error to your browser console
        cloudinaryError: err.http_code // This tells us if Cloudinary blocked it
    });
}
};

exports.updateProfile = async (req, res) => {
    try {
        const { mobile, parentMobile, address, bio, notificationPreferences } = req.body;

        // Create update object
        const updateData = {};
        if (mobile !== undefined) updateData.contact = mobile;
        if (parentMobile !== undefined) updateData.parentPhone = parentMobile;
        if (address !== undefined) updateData.address = address;
        if (bio !== undefined) updateData.bio = bio;
        if (notificationPreferences !== undefined) updateData.notificationPreferences = notificationPreferences;

        const student = await Student.findByIdAndUpdate(
            req.user.id, // Derived from your auth middleware
            { $set: updateData },
            { new: true } // Returns the updated document
        ).select('-password');

        if (!student) {
            return res.status(404).json({ msg: "Student not found" });
        }

        res.json(student);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// Get Student Profile
exports.getProfile = async (req, res) => {
    try {
        const student = await Student.findById(req.user.id).select('-password');
        res.json(student);
    } catch (err) {
        res.status(500).send("Server Error");
    }
};