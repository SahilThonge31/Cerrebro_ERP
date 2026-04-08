const Academic = require('../models/Academic');
const Material = require('../models/Material'); 
const Admin = require('../models/Admin');    // <--- 1. Import Admin
const Teacher = require('../models/Teacher'); // <--- 2. Import Teacher

// --- 1. GET ALL (With Dual Board Auto-Seed) ---
exports.getAcademics = async (req, res) => {
    try {
        const { board } = req.query; 
        
        let query = {};
        if (board) query.board = board;

        // 1. Fetch current data
        let academics = await Academic.find(query).sort({ className: 1 });

        // 2. CHECK: If we asked for CBSE (or All) but got nothing, let's seed the missing board
        if (academics.length === 0) {
            
            // Define Defaults
            const sscDefaults = [
                { className: "8th", board: "SSC", subjects: [{ name: "English" }, { name: "Maths" }, { name: "Science" }] },
                { className: "9th", board: "SSC", subjects: [{ name: "English" }, { name: "Maths 1" }, { name: "Maths 2" }, { name: "Science" }] },
                { className: "10th", board: "SSC", subjects: [{ name: "English" }, { name: "Maths 1" }, { name: "Maths 2" }, { name: "Science 1" }, { name: "Science 2" }] },
                { className: "11th", board: "SSC", subjects: [{ name: "Physics" }, { name: "Chemistry" }, { name: "Maths" }, { name: "Biology" }] },
                { className: "12th", board: "SSC", subjects: [{ name: "Physics" }, { name: "Chemistry" }, { name: "Maths" }, { name: "Biology" }] }
            ];

            const cbseDefaults = [
                { className: "8th", board: "CBSE", subjects: [{ name: "English" }, { name: "Maths" }, { name: "Science" }] },
                { className: "9th", board: "CBSE", subjects: [{ name: "English" }, { name: "Maths" }, { name: "Science" }] },
                { className: "10th", board: "CBSE", subjects: [{ name: "English" }, { name: "Maths" }, { name: "Science" }] }
            ];

            let toInsert = [];
            
            const cbseCount = await Academic.countDocuments({ board: 'CBSE' });
            if (cbseCount === 0 && (board === 'CBSE' || !board)) {
                toInsert = [...toInsert, ...cbseDefaults];
            }

            const sscCount = await Academic.countDocuments({ board: 'SSC' });
            if (sscCount === 0 && (board === 'SSC' || !board)) {
                toInsert = [...toInsert, ...sscDefaults];
            }

            if (toInsert.length > 0) {
                await Academic.insertMany(toInsert);
                academics = await Academic.find(query).sort({ className: 1 });
            }
        }

        res.json(academics);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// --- 2. ADD SUBJECT (Fix: Use Admin model) ---
exports.addSubject = async (req, res) => {
    try {
        const { className, board, subjectName, teacherName } = req.body; 
        
        // FIX: Find Admin instead of User
        const admin = await Admin.findById(req.user.id);
        
        const academic = await Academic.findOne({ className, board }); 
        if (!academic) return res.status(404).json({ msg: "Class/Board not found" });

        if (academic.subjects.some(s => s.name === subjectName)) {
            return res.status(400).json({ msg: "Subject already exists" });
        }

        academic.subjects.push({ name: subjectName, teacherName: teacherName || "Not Assigned" });
        academic.updatedBy = admin ? admin.name : "System";
        academic.lastUpdated = Date.now();

        await academic.save();
        res.json(academic);
    } catch (err) { res.status(500).send('Server Error'); }
};

// --- 3. REMOVE SUBJECT ---
exports.removeSubject = async (req, res) => {
    try {
        const { className, board, subjectName } = req.body;
        const academic = await Academic.findOne({ className, board });
        if (!academic) return res.status(404).json({ msg: "Class not found" });

        academic.subjects = academic.subjects.filter(s => s.name !== subjectName);
        await academic.save();
        res.json(academic);
    } catch (err) { res.status(500).send('Server Error'); }
};

// --- 4. GET SUBJECT MATERIALS ---
exports.getMaterials = async (req, res) => {
    try {
        const { board, className, subject } = req.query;
        const materials = await Material.find({ board, className, subject }).sort({ createdAt: -1 });
        res.json(materials);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// --- 5. DELETE MATERIAL ---
exports.deleteMaterial = async (req, res) => {
    try {
        await Material.findByIdAndDelete(req.params.id);
        res.json({ msg: "Content Deleted" });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};


// --- 7. UPLOAD MATERIAL (Fix: Check Admin OR Teacher) ---
exports.addMaterial = async (req, res) => {
    try {
        const { title, description, type, board, className, subject, linkUrl } = req.body;
        
        // Default to the provided link (if it's a YouTube link, etc.)
        let finalUrl = linkUrl;
        
        // Grab the secure Cloudinary URL if a file was uploaded
        if (req.file) {
            finalUrl = req.file.path; 
        }

        // Determine who is uploading (Admin or Teacher)
        let uploaderName = "Unknown";
        let uploaderId = req.user.id;

        if (req.user.role === 'admin') {
            const admin = await Admin.findById(req.user.id);
            if (admin) uploaderName = admin.name;
        } else if (req.user.role === 'teacher') {
            const teacher = await Teacher.findById(req.user.id);
            if (teacher) uploaderName = teacher.name;
        }
        
        const newMaterial = new Material({
            title,
            description,
            fileUrl: finalUrl, 
            type: type, // 👈 THE FIX: Now it will correctly save as "Textbook" or "Notes"
            board,
            className,
            subject,
            uploadedBy: uploaderName,
            teacherId: uploaderId
        });

        await newMaterial.save();
        res.json(newMaterial);

    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).send('Server Error');
    }
};