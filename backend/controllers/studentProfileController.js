const Student = require('../models/Student'); // Ensure path is correct
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// 1. Get Student Profile
exports.getProfile = async (req, res) => {
    try {
        const student = await Student.findById(req.user.id).select('-password');
        if (!student) return res.status(404).json({ msg: 'Student not found' });
        res.json(student);
    } catch (err) {
        console.error("Profile Fetch Error:", err);
        res.status(500).send('Server Error');
    }
};

// 2. Update General Info & Notifications
exports.updateProfile = async (req, res) => {
    try {
        const { mobile, parentMobile, address, bio, notificationPreferences } = req.body;
        
        let student = await Student.findById(req.user.id);
        if (!student) return res.status(404).json({ msg: 'Student not found' });

        // Update fields if they are provided in the request
        if (mobile) student.contact = mobile;
        if (parentMobile) student.parentContact = parentMobile;
        if (address) student.address = address;
        if (bio !== undefined) student.bio = bio;
        
        if (notificationPreferences) {
            student.notificationPreferences = { 
                ...student.notificationPreferences, 
                ...notificationPreferences 
            };
        }

        await student.save();
        res.json({ msg: 'Profile updated successfully', student });
    } catch (err) {
        console.error("Profile Update Error:", err);
        res.status(500).send('Server Error');
    }
};

// 3. Change Password & Send Email
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // 1. Find the student
        const student = await Student.findById(req.user.id);
        if (!student) return res.status(404).json({ msg: 'Student not found' });

        // 2. Check if current password matches
        const isMatch = await bcrypt.compare(currentPassword, student.password);
        if (!isMatch) return res.status(400).json({ msg: 'Incorrect current password' });

        // 3. Hash new password and save
        const salt = await bcrypt.genSalt(10);
        student.password = await bcrypt.hash(newPassword, salt);
        await student.save();

        // 4. Send the Email Notification with the New Password
        // Note: Ensure your Student model has an 'email' field!
        if (student.email && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const mailOptions = {
                from: `"Cerrebro Tutorials" <${process.env.EMAIL_USER}>`,
                to: student.email,
                subject: `🔒 Security Alert: Your Password Was Changed`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; background-color: #F8FAFC;">
                        <div style="max-w: 600px; margin: auto; background: white; padding: 30px; border-radius: 10px; border-top: 5px solid #6FCB6C; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <h2 style="color: #0F172A; margin-bottom: 20px;">Password Changed Successfully</h2>
                            <p style="color: #334155; font-size: 16px;">Hello ${student.name || 'Student'},</p>
                            <p style="color: #334155; font-size: 16px;">Your password for your Cerrebro Tutorials dashboard has been successfully updated.</p>
                            
                            <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; padding: 15px; border-radius: 8px; margin: 25px 0; text-align: center;">
                                <p style="color: #64748b; font-size: 14px; margin-bottom: 5px;">Your New Password:</p>
                                <strong style="color: #0F172A; font-size: 20px; letter-spacing: 2px;">${newPassword}</strong>
                            </div>
                            
                            <p style="color: #ef4444; font-size: 14px; font-weight: bold;">If you did not make this change, please contact administration immediately.</p>
                        </div>
                    </div>
                `
            };

            // Send the email asynchronously (we don't 'await' here so the UI updates instantly for the user)
            transporter.sendMail(mailOptions).catch(err => console.error("Failed to send password email:", err));
        }

        // 5. Respond to frontend
        res.json({ msg: 'Password changed successfully' });
        
    } catch (err) {
        console.error("Password Change Error:", err);
        res.status(500).send('Server Error');
    }
};