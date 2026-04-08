const Message = require('../models/Message');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin'); 
const mongoose = require('mongoose');
// 1. Get Chat History
// 1. Get Chat History (WITH PAGINATION)
exports.getHistory = async (req, res) => {
    try {
        const { partnerId } = req.params;
        const myId = req.user.id;

        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20; // 20 messages per chunk
        const skip = (page - 1) * limit;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: partnerId },
                { senderId: partnerId, receiverId: myId }
            ]
        })
        .sort({ createdAt: -1 }) // Sort newest first to easily get the latest chunk
        .skip(skip)
        .limit(limit);

        // Reverse the array so the oldest in this chunk is at the top (for UI rendering)
        res.json(messages.reverse());
    } catch (err) {
        console.error("Error in getHistory:", err);
        res.status(500).send("Server Error");
    }
};

// 2. Get Contacts for Teacher
exports.getContactsForTeacher = async (req, res) => {
    try {
        // 👇 1. Extract BOTH class (standard) and board from the query
        const { type, class: standard, board } = req.query; 
        
        let contacts = [];

        if (type === 'students' && standard) {
             // 👇 2. Build a dynamic query
             let query = { standard: standard };
             
             // Only add board to filter if the frontend sent it
             if (board) {
                 query.board = board;
             }

             // Find students matching BOTH standard and board
             contacts = await Student.find(query)
                .select('name profilePic _id standard board role');
        } 
        else if (type === 'admins') {
             // Find all admins
             contacts = await Admin.find().select('name profilePic _id role');
        }

        res.json(contacts);
    } catch (err) {
        console.error("Fetch Contacts Error:", err);
        res.status(500).send("Server Error");
    }
};
// ... existing imports

// 3. Get Contacts for Admin (All Teachers OR Class-wise Students)
exports.getContactsForAdmin = async (req, res) => {
    try {
        const { type, class: standard } = req.query; // type='teachers' or 'students'
        
        let contacts = [];

        if (type === 'teachers') {
             // Fetch ALL Teachers
             contacts = await Teacher.find().select('name profilePic _id email');
        } 
        else if (type === 'students') {
             // Fetch Students (Must provide class to prevent loading thousands)
             if (standard) {
                contacts = await Student.find({ standard: standard }).select('name profilePic _id rollNo');
             } else {
                // Optional: Return empty or recent chats if no class selected
                contacts = [];
             }
        }

        res.json(contacts);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

// 👇 1. Get Unread Counts
exports.getUnreadCounts = async (req, res) => {
    try {
        // Find all unread messages sent TO this user
        const unread = await Message.aggregate([
            { $match: { receiverId: new mongoose.Types.ObjectId(req.user.id), isRead: false } },
            { $group: { _id: "$senderId", count: { $sum: 1 } } }
        ]);
        
        // Format into a clean object: { senderId: count }
        const counts = {};
        unread.forEach(u => { counts[u._id.toString()] = u.count; });
        
        res.json(counts);
    } catch (err) {
        res.status(500).send("Server Error");
    }
};

// 👇 2. Mark Messages as Read
exports.markAsRead = async (req, res) => {
    try {
        const { senderId } = req.body;
        await Message.updateMany(
            { senderId: senderId, receiverId: req.user.id, isRead: false },
            { $set: { isRead: true } }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).send("Server Error");
    }
};


// 4. Get Contacts for Student (Teachers assigned to their class)
exports.getContactsForStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.user.id);
        if (!student) return res.status(404).json({ msg: "Student not found" });

        // Safely get the student's class
        const studentClass = student.standard || student.class || student.className;

        if (!studentClass) {
            return res.json([]); // Return empty if no class
        }

        // 👇 FIX IS HERE: We strictly query "classes.standard". 
        // We removed the string fallback to prevent Mongoose CastErrors.
        const teachers = await Teacher.find({
            "classes.standard": studentClass
        }).select('name profilePic _id subjects');

        res.json(teachers);
    } catch (err) {
        console.error("Error in getContactsForStudent:", err);
        res.status(500).send("Server Error");
    }
};


// ... existing imports

// 👇 7. Get Recent Chats (Like WhatsApp)
exports.getRecentChats = async (req, res) => {
    try {
        const myId = new mongoose.Types.ObjectId(req.user.id);

        // Find distinct users we have chatted with recently
        const recentMessages = await Message.aggregate([
            {
                $match: {
                    $or: [{ senderId: myId }, { receiverId: myId }]
                }
            },
            {
                $sort: { createdAt: -1 } // Sort by newest first
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$senderId", myId] },
                            "$receiverId",
                            "$senderId"
                        ]
                    },
                    lastMessageAt: { $first: "$createdAt" },
                    role: {
                        $first: {
                            $cond: [
                                { $eq: ["$senderId", myId] },
                                "$receiverRole",
                                "$senderRole"
                            ]
                        }
                    }
                }
            },
            {
                $sort: { lastMessageAt: -1 } // Sort groups by newest message
            },
            { $limit: 20 } // Get top 20 recent chats
        ]);

        // Now populate the user details (Name, Profile Pic)
        const recentContacts = await Promise.all(recentMessages.map(async (chat) => {
            let user = null;
            if (chat.role === 'student') user = await Student.findById(chat._id).select('name profilePic _id standard');
            else if (chat.role === 'teacher') user = await Teacher.findById(chat._id).select('name profilePic _id');
            else if (chat.role === 'admin') user = await Admin.findById(chat._id).select('name profilePic _id');

            if(user) {
                 return {
                    _id: user._id,
                    name: user.name,
                    profilePic: user.profilePic,
                    role: chat.role,
                    standard: user.standard, // Optional for students
                    lastMessageAt: chat.lastMessageAt
                };
            }
            return null;
        }));

        // Filter out nulls (in case a user was deleted)
        res.json(recentContacts.filter(c => c !== null));

    } catch (err) {
        console.error("Error in getRecentChats:", err);
        res.status(500).send("Server Error");
    }
};