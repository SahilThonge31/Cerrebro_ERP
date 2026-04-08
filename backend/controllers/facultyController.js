const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const Assignment = require('../models/Assignment');
const bcrypt = require('bcryptjs'); 

exports.getDashboard = async (req, res) => {
    try {
        const teacherId = req.user.id;

        // 1. Fetch Teacher Details
        const teacher = await Teacher.findById(teacherId)
            .select('-password -salaryHistory -baseSalary');

        if (!teacher) {
            return res.status(404).json({ msg: "Teacher profile not found" });
        }

        // 2. FIX: Extract only the "standard" names for the student count query
        // teacher.classes is now [{standard: "10th", board: "SSC"}, ...]
        const classNamesOnly = teacher.classes.map(c => typeof c === 'string' ? c : c.standard);

        // 3. Calculate "Total Students" using the extracted string array
        const totalStudents = await Student.countDocuments({ 
            standard: { $in: classNamesOnly } 
        });

        // 4. Construct Clean Response
        const dashboardData = {
            _id: teacher._id,
            name: teacher.name,
            email: teacher.email,
            contact: teacher.contact,
            address: teacher.address,
            profilePic: teacher.profilePic || '', 
            qualification: teacher.qualification || 'Not Specified',
            experience: teacher.experience || '0 Years',
            
            subjects: teacher.subjects || [],
            classes: teacher.classes || [], // Sends the full objects [{standard, board}]

            // 👇 CRITICAL FIX: Ensure the Header Dropdown gets a flat "assignedClasses" array
            assignedClasses: teacher.classes.map((cls, idx) => ({
                standard: typeof cls === 'string' ? cls : cls.standard,
                board: typeof cls === 'string' ? 'General' : cls.board,
                subject: teacher.subjects[idx] || teacher.subjects[0] || 'General'
            })),

            stats: {
                totalStudents: totalStudents,
                assignedClassesCount: teacher.classes.length,
                totalSubjects: teacher.subjects.length
            }
        };

        res.json(dashboardData);

    } catch (err) {
        console.error("Faculty Dashboard Error:", err.message);
        res.status(500).send("Server Error");
    }
};

exports.getMyStudents = async (req, res) => {
    try {
        // 👇 1. Extract BOTH standard and board from the frontend request
        const { standard, board } = req.query; 

        if (!standard || standard === 'all') {
            return res.json([]); 
        }

        // 👇 2. Build a dynamic query based on what was sent
        let query = { standard: standard };
        if (board) {
            query.board = board; // Only add board to the filter if it exists
        }

        // FETCH ALL NECESSARY FIELDS
        const students = await Student.find(query)
            .select('name rollNumber rollNum email contact profilePic parentName parentPhone address dob gender board standard') 
            .sort({ rollNumber: 1, rollNum: 1 }); 

        res.json(students);

    } catch (err) {
        console.error("Fetch Students Error:", err);
        res.status(500).send("Server Error");
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const teacherId = req.user.id;
        
        // Step A: Fetch Teacher to know their assigned classes
        const teacher = await Teacher.findById(teacherId);
        if(!teacher) return res.status(404).json({ msg: "Teacher not found" });

        // Step B: Build the Query
        // We want notices that are:
        // 1. Directed to 'teacher' OR 'all'
        // 2. AND are either Global (no class) OR match one of the teacher's classes
        const query = {
            recipientRole: { $in: ['teacher', 'all'] }, 
            $or: [
                { standard: null }, // Global notices
                { standard: { $in: teacher.classes } } // Notices for their assigned classes (e.g. 10th)
            ]
        };

        const notifications = await Notification.find(query).sort({ createdAt: -1 });

        // Step C: Format "isRead" for the frontend
        // We check if the teacher's ID is inside the 'isReadBy' array
        const formattedNotifications = notifications.map(notif => ({
            ...notif._doc,
            isRead: notif.isReadBy ? notif.isReadBy.includes(teacherId) : false 
        }));

        res.json(formattedNotifications);

    } catch (err) {
        console.error("Notification Fetch Error:", err);
        res.status(500).send("Server Error");
    }
};

// 2. Mark Notification as Read (Correct Array Logic)
exports.markNotificationRead = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const notifId = req.params.id;

        // Use $addToSet so we don't duplicate the ID if clicked twice
        // We do NOT use { isRead: true } because that would mark it read for EVERYONE
        await Notification.findByIdAndUpdate(notifId, {
            $addToSet: { isReadBy: teacherId } 
        });

        res.json({ msg: "Marked as read" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

exports.getClassStudents = async (req, res) => {
    try {
        // The frontend sends "class" as a query param (e.g., ?class=9th)
        // We use req.query['class'] because 'class' is a reserved word in JS sometimes
        const standard = req.query.class; 
        const board = req.query.board; // Optional: stricter filtering

        if (!standard) {
            return res.status(400).json({ msg: "Class parameter is required" });
        }

        let query = { standard: standard };
        
        // If board is provided, filter by that too
        if (board) query.board = board;

        // Select only necessary fields to make it faster
        const students = await Student.find(query)
            .select('name rollNumber email standard board')
            .sort({ rollNumber: 1 }); // Sort by Roll Number

        res.json(students);

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const teacher = await Teacher.findById(teacherId);

        if (!teacher) return res.status(404).json({ msg: "Teacher not found" });

        // 1. Get Student Count (for their primary class)
        // Assuming teacher.classes[0] is their main class object or string
        let studentCount = 0;
        let primaryClass = "N/A";
        
        if (teacher.classes.length > 0) {
            const cls = teacher.classes[0]; // { standard: "10th", board: "CBSE" } or just "10th"
            const standard = typeof cls === 'object' ? cls.standard : cls;
            primaryClass = standard;
            
            studentCount = await Student.countDocuments({ standard: standard });
        }

        // 2. Get Active Assignments (Created by this teacher)
        const assignmentCount = await Assignment.countDocuments({ createdBy: teacherId });

        // 3. Get Recent Notices (Global or Teacher-specific)
        const notices = await Notification.find({
            recipientRole: { $in: ['teacher', 'all'] }
        }).sort({ createdAt: -1 }).limit(3);

        res.json({
            studentCount,
            primaryClass,
            assignmentCount,
            notices,
            teacherName: teacher.name
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};


// 👇 GET FULL PROFILE
exports.getProfile = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.user.id).select('-password');
        if (!teacher) return res.status(404).json({ msg: "Teacher not found" });
        res.json(teacher);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

// --- UPDATE PROFILE PICTURE ---
exports.updateProfilePic = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ msg: "No image uploaded" });

        // 👇 NEW LOGIC: Cloudinary automatically provides the live, secure URL
        const cloudUrl = req.file.path;

        // UPDATE DATABASE
        const teacher = await Teacher.findByIdAndUpdate(
            req.user.id,
            { $set: { profilePic: cloudUrl } }, // Saves the Cloudinary link!
            { new: true }
        ).select('-password');

        res.json(teacher);

    } catch (err) {
        console.error("Cloudinary Upload Error:", err);
        res.status(500).send("Server Error");
    }
};

// --- UPDATE PROFILE DETAILS (No changes needed here!) ---
exports.updateProfileDetails = async (req, res) => {
    try {
        // Destructure all possible fields from frontend
        const { 
            mobile,          // Frontend sends 'mobile'
            address, 
            bio, 
            qualifications,  // Frontend sends 'qualifications' (plural)
            notificationPreferences // Frontend sends the toggle object
        } = req.body;
        
        // Build update object dynamically
        const updateFields = {};

        // Map Frontend names to Schema names
        if (mobile) updateFields.contact = mobile; // 👈 Map 'mobile' to 'contact'
        if (address) updateFields.address = address;
        if (bio) updateFields.bio = bio;
        if (qualifications) updateFields.qualification = qualifications; // 👈 Map plural to singular
        
        // Handle Notification Toggles (Merging with existing)
        if (notificationPreferences) {
            updateFields.notificationPreferences = notificationPreferences;
        }

        const teacher = await Teacher.findByIdAndUpdate(
            req.user.id,
            { $set: updateFields },
            { new: true, runValidators: true } // Return updated doc & validate
        ).select('-password');

        if (!teacher) {
            return res.status(404).json({ msg: "Teacher not found" });
        }

        res.json(teacher);
    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).send("Server Error");
    }
};
// 👇 2. CHANGE PASSWORD
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // Get user with password
        const teacher = await Teacher.findById(req.user.id);
        
        // Check Current Password
        const isMatch = await bcrypt.compare(currentPassword, teacher.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Incorrect current password" });
        }

        // Hash New Password
        const salt = await bcrypt.genSalt(10);
        teacher.password = await bcrypt.hash(newPassword, salt);
        
        await teacher.save();
        res.json({ msg: "Password updated successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

// @desc    Update Teacher Profile (Bio, Contact, Qualifications, Notifications)
exports.updateTeacherProfile = async (req, res) => {
    try {
        // notificationPreferences is coming from your handleToggle function
        const { mobile, address, bio, qualifications, notificationPreferences } = req.body;

        const updateFields = {};
        if (mobile !== undefined) updateFields.contact = mobile;
        if (address !== undefined) updateFields.address = address;
        if (bio !== undefined) updateFields.bio = bio;
        if (qualifications !== undefined) updateFields.qualification = qualifications;
        
        // 👇 This line saves the toggles
        if (notificationPreferences !== undefined) {
            updateFields.notificationPreferences = notificationPreferences;
        }

        const teacher = await Teacher.findByIdAndUpdate(
            req.user.id,
            { $set: updateFields },
            { new: true, runValidators: true } // runValidators ensures the Boolean type is checked
        ).select('-password');

        if (!teacher) return res.status(404).json({ msg: "Teacher not found" });

        res.json(teacher);
    } catch (err) {
        console.error("Update Error:", err.message);
        res.status(500).send("Server Error");
    }
};