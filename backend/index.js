const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const connectDB = require('./config/db');
const Message = require('../backend/models/Message');

// 1. Configuration & DB Connection
dotenv.config();
connectDB();

// 2. Initialize App & Server
const app = express();
const server = http.createServer(app);

// 3. Global Middleware
app.use(express.json());
app.use(cors());

// 4. Initialize Socket.io
const io = socketIo(server, {
    cors: {
        origin: [
            "http://localhost:5173", 
            "http://localhost:5174", 
            "http://localhost:5175",
            "http://localhost:5176"
        ], 
        methods: ["GET", "POST"],
        credentials: true
    }
});

// 5. API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/student/profile', require('./routes/studentProfileRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/academic', require('./routes/academicRoutes'));
app.use('/api/ads', require('./routes/adRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/fees', require('./routes/feeRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/timetable', require('./routes/timetableRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/support', require('./routes/supportRoutes'));
app.use('/api/finance', require('./routes/financeRoutes'));
app.use('/api/exams', require('./routes/examRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/data', require('./routes/dataRoutes'));
app.use('/api/faculty', require('./routes/facultyRoutes'));
app.use('/api/results', require('./routes/resultRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/public', require('./routes/publicRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/ai', require('./routes/ai'));


// 6. Static Files & Base Route
// 👇 UPDATED: Commented out local uploads since we are using Cloudinary now!
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.send('Cerrebro API is Running...');
});

// Global Error Handler - Place this AFTER all your routes
app.use((err, req, res, next) => {
    console.error("--- SERVER ERROR ---");
    console.error(err); // This prints the REAL error in your terminal
    
    res.status(500).json({
        msg: "Internal Server Error",
        error: err.message || "Unknown Error",
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});

// ==========================================
// 7. REAL-TIME SOCKET.IO LOGIC
// ==========================================
const onlineUsers = new Map();

io.on('connection', (socket) => {
    
    // User Connects
    socket.on('join', (userId) => {
        if (!userId) return;
        
        const idStr = String(userId); 
        socket.userId = idStr; // <-- OPTIMIZATION: Attach ID directly to socket
        
        onlineUsers.set(idStr, socket.id);
        
        io.emit('user_status', { userId: idStr, status: 'online' });
        
        const currentlyOnline = Array.from(onlineUsers.keys());
        socket.emit('initial_online_users', currentlyOnline);
    });

    // Send Message
    socket.on('send_message', async (data) => {
        try {
            const { senderId, senderRole, receiverId, receiverRole, message } = data;
            if (!message || message.trim() === "") return; // Prevent empty DB saves

            const newMessage = new Message({ senderId, senderRole, receiverId, receiverRole, message });
            await newMessage.save();

            const receiverSocketId = onlineUsers.get(String(receiverId));
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('receive_message', data);
            }
        } catch (err) {
            console.error("Socket Error saving message:", err.message);
        }
    });

    // Typing Indicators
    socket.on('typing', (data) => {
        const receiverSocketId = onlineUsers.get(String(data.receiverId));
        if (receiverSocketId) io.to(receiverSocketId).emit('display_typing', { senderId: String(data.senderId) });
    });

    socket.on('stop_typing', (data) => {
        const receiverSocketId = onlineUsers.get(String(data.receiverId));
        if (receiverSocketId) io.to(receiverSocketId).emit('hide_typing', { senderId: String(data.senderId) });
    });

    // User Disconnects
    socket.on('disconnect', () => {
        // <-- OPTIMIZATION: O(1) direct lookup instead of O(N) loop
        if (socket.userId && onlineUsers.has(socket.userId)) {
            onlineUsers.delete(socket.userId);
            io.emit('user_status', { userId: socket.userId, status: 'offline' });
        }
    });
});

// 8. Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server & Socket running on port ${PORT}`);
});