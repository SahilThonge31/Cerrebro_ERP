const Admin = require('../models/Admin');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const { sendEmailOTP, sendMobileOTP } = require('../utils/notificationService');


// Temporary Store for OTPs
let otpStore = {}; 

// =================================================
//  PART 1: OTP & VERIFICATION LOGIC
// =================================================

exports.verifyEmail = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Email required" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = otp; 

    try {
        await sendEmailOTP(email, otp);
        res.json({ msg: "OTP sent to Email" });
    } catch (err) {
        res.status(500).json({ msg: "Failed to send Email" });
    }
};

exports.verifyMobile = async (req, res) => {
    const { contact } = req.body;
    if (!contact) return res.status(400).json({ msg: "Mobile Number required" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[contact] = otp; 

    try {
        await sendMobileOTP(contact, otp);
        res.json({ msg: "OTP sent to Mobile" });
    } catch (err) {
        res.status(500).json({ msg: "Failed to send SMS" });
    }
};

exports.checkEmailOtp = (req, res) => {
    const { email, otp } = req.body;
    if (parseInt(otp) === otpStore[email]) return res.json({ msg: "Email Verified! ✅" });
    return res.status(400).json({ msg: "Incorrect Email OTP ❌" });
};

exports.checkMobileOtp = (req, res) => {
    const { contact, otp } = req.body;
    if (parseInt(otp) === otpStore[contact]) return res.json({ msg: "Mobile Verified! ✅" });
    return res.status(400).json({ msg: "Incorrect Mobile OTP ❌" });
};

// =================================================
//  PART 2: REGISTRATION LOGIC (Smart Collection Switching)
// =================================================

exports.registerUser = async (req, res) => {
    try {
        // 1. Extract 'studentDetails' and 'teacherDetails' from the body
        const { 
            emailOtp, mobileOtp, name, email, contact, role, address,
            studentDetails, teacherDetails // <--- THESE CONTAIN THE MISSING DATA
        } = req.body;

        // 2. Verify OTPs (Unchanged)
        if (parseInt(emailOtp) !== otpStore[email]) return res.status(400).json({ msg: "Invalid Email OTP!" });
        if (parseInt(mobileOtp) !== otpStore[contact]) return res.status(400).json({ msg: "Invalid Mobile OTP!" });

        // 3. Check if user exists (Unchanged)
        const existingAdmin = await Admin.findOne({ email });
        const existingTeacher = await Teacher.findOne({ email });
        const existingStudent = await Student.findOne({ email });

        if (existingAdmin || existingTeacher || existingStudent) {
            return res.status(400).json({ msg: "User already exists in the system!" });
        }

        // 4. Generate Credentials (Unchanged)
        const rawPassword = Math.random().toString(36).slice(-8);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(rawPassword, salt);

        // 5. Save to the CORRECT Collection based on Role
        let newUser;

        if (role === 'student') {
            const rollNumber = "S-" + Date.now().toString().slice(-6);
            
            // ✅ FIX: Spread 'studentDetails' to get board, standard, parentName, etc.
            newUser = new Student({
                name, 
                email, 
                contact, 
                address, 
                password: hashedPassword,
                role: 'student',
                rollNumber: rollNumber,
                
                // This injects: board, standard, parentName, parentPhone, dob, gender
                ...studentDetails 
            });

        } else if (role === 'teacher') {
            
            // ✅ FIX: Spread 'teacherDetails' here too
            newUser = new Teacher({
                name, 
                email, 
                contact, 
                address, 
                password: hashedPassword,
                role: 'teacher',
                
                // This injects: qualification, experience, baseSalary, subjects, classes
                ...teacherDetails
            });

        } else if (role === 'admin') {
            newUser = new Admin({
                name, email, contact, password: hashedPassword
            });
        } else {
            return res.status(400).json({ msg: "Invalid Role Selected" });
        }

        await newUser.save();

        // 6. Send Email (Unchanged)
        const emailMessage = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #6a1b9a;">Welcome to Cerrebro Tutorials!</h2>
                <p>Dear <strong>${name}</strong>,</p>
                <p>Your official account has been successfully created.</p>
                
                <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #333;">🔐 Your Login Credentials</h3>
                    <p><strong>Role:</strong> ${role.toUpperCase()}</p>
                    <p><strong>Username:</strong> ${email}</p>
                    <p><strong>Temporary Password:</strong> <span style="background: #fff; padding: 2px 6px; border: 1px solid #ccc; border-radius: 3px;">${rawPassword}</span></p>
                </div>

                <p style="font-size: 12px; color: #777;">Best Regards,<br>Admin Team</p>
            </div>
        `;

        await sendEmail({
            email: email,
            subject: '🎉 Welcome! Your Cerrebro Account Details',
            message: emailMessage
        });

        // Cleanup
        delete otpStore[email];
        delete otpStore[contact];

        res.status(201).json({ msg: "User Registered & Credentials Sent Successfully!" });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// =================================================
//  PART 3: UNIVERSAL LOGIN LOGIC (Checks all 3 tables)
// =================================================

exports.loginUser = async (req, res) => {
    console.log("👉 Login Attempt:", req.body.email);

    try {
        const { email, password } = req.body;
        let user = null;
        let role = '';

        // Step 1: Check Admin Table
        user = await Admin.findOne({ email });
        if (user) role = 'admin';

        // Step 2: If not Admin, Check Teacher Table
        if (!user) {
            user = await Teacher.findOne({ email });
            if (user) role = 'teacher';
        }

        // Step 3: If not Teacher, Check Student Table
        if (!user) {
            user = await Student.findOne({ email });
            if (user) role = 'student';
        }

        // Step 4: If still no user found
        if (!user) {
            return res.status(400).json({ msg: 'User not found in any record' });
        }

        // Step 5: Verify Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Password' });
        }

        // Step 6: Generate Token
        const payload = { 
            user: { 
                id: user.id, 
                role: role 
            } 
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5d' },
            async (err, token) => {
                if (err) throw err;

                // --- 7. SEND LOGIN ALERT EMAIL ---
                console.log(`📧 Sending Login Alert to ${role}: ${user.email}`);
                const loginTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

                const emailMessage = `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #ddd; border-radius: 10px;">
                        <h2 style="color: #6a1b9a;">🔐 New Login Detected</h2>
                        <p>Dear <strong>${user.name}</strong>,</p>
                        <p>We noticed a successful login to your <strong>Cerrebro Tutorials</strong> account.</p>
                        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>👤 Role:</strong> ${role.toUpperCase()}</p>
                            <p style="margin: 5px 0;"><strong>📅 Time:</strong> ${loginTime}</p>
                        </div>
                        <p style="color: #d32f2f; font-size: 12px;">
                            🛑 If this wasn't you, please contact support immediately.
                        </p>
                    </div>
                `;

                try {
                    await sendEmail({
                        email: user.email,
                        subject: `🔐 Security Alert: Login Detected`,
                        message: emailMessage
                    });
                } catch (emailError) {
                    console.error("⚠️ Email Failed (Continuing login anyway):", emailError.message);
                }

                res.json({ token, role, name: user.name, msg: "Login Successful" });
            }
        );

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).send('Server Error');
    }
};

// =================================================
//  PART 4: GET CURRENT USER PROFILE
// =================================================

exports.getMe = async (req, res) => {
    try {
        const { id, role } = req.user; 
        let user = null;

        if (role === 'admin') user = await Admin.findById(id).select('-password');
        else if (role === 'teacher') user = await Teacher.findById(id).select('-password');
        else if (role === 'student') user = await Student.findById(id).select('-password');

        if (!user) return res.status(404).json({ msg: "User details not found" });
        res.json(user);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};


// --- UPDATE PROFILE DETAILS ---
exports.updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        // Find user by ID (from token)
        let user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: "User not found" });

        user.name = name || user.name;
        user.email = email || user.email;
        
        await user.save();
        res.json({ msg: "Profile Updated Successfully", user });

    } catch (err) {
        console.error("Profile Update Error:", err);
        res.status(500).send("Server Error");
    }
};

// 5. Change Password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        const user = await User.findById(req.user.id);
        
        // Check Old Password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Incorrect Current Password" });

        // Hash New Password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        
        await user.save();
        res.json({ msg: "Password Changed Successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

// --- UPLOAD AVATAR ---
exports.uploadAvatar = async (req, res) => {
    try {
        // Validation: Ensure an image was uploaded via Cloudinary
        if (!req.file) {
            return res.status(400).json({ msg: "No file uploaded" });
        }

        const { id, role } = req.user; 
        
        // 👇 NEW: Cloudinary automatically provides the live, secure URL
        const profilePicUrl = req.file.path;
        
        let userModel;
        // Identify which collection to update
        if (role === 'admin') userModel = Admin;
        else if (role === 'teacher') userModel = Teacher;
        else if (role === 'student') userModel = Student;

        if (!userModel) return res.status(400).json({ msg: "Invalid user role" });

        // 👇 UPDATE THE CORRECT DATABASE COLLECTION
        const updatedUser = await userModel.findByIdAndUpdate(
            id, 
            { $set: { profilePic: profilePicUrl } }, // Saves the Cloudinary link to MongoDB!
            { new: true } // Returns the updated document
        );

        res.json({ 
            msg: "Avatar Updated Successfully", 
            profilePic: updatedUser.profilePic 
        });

    } catch (err) {
        console.error("Cloudinary Upload Error:", err.message);
        res.status(500).send("Server Error");
    }
};

exports.loadUser = async (req, res) => {
    try {
        let user;
        // Check which collection the user belongs to based on role in token
        if (req.user.role === 'admin') {
            user = await Admin.findById(req.user.id).select('-password');
        } else if (req.user.role === 'teacher') {
            user = await Teacher.findById(req.user.id).select('-password');
        } else if (req.user.role === 'student') {
            user = await Student.findById(req.user.id).select('-password');
        }

        if (!user) return res.status(404).json({ msg: "User not found" });
        
        // Return standardized user object
        res.json(user); 
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};