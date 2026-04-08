const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// --- 1. CONFIGURATION ---
// Ensure this matches your .env exactly
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- 2. STORAGE ENGINE ---
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Use originalUrl for safer path detection
        const urlPath = (req.originalUrl || "").toLowerCase();
        let folderName = 'school_app/general';

        if (urlPath.includes('gallery')) {
            folderName = 'school_app/gallery';
        } else if (urlPath.includes('student') || urlPath.includes('profile')) {
            folderName = 'school_app/profiles/students';
        } else if (urlPath.includes('teacher') || urlPath.includes('faculty')) {
            folderName = 'school_app/profiles/teachers';
        } else if (urlPath.includes('timetable')) {
            folderName = 'school_app/timetables';
        }

        // Remove extension and special characters from filename
        const cleanFileName = file.originalname
            .split('.')[0]
            .replace(/[^a-z0-9]/gi, '-');

        return {
            folder: folderName,
            public_id: `${Date.now()}-${cleanFileName}`,
            resource_type: 'auto', // 👈 'auto' handles PDF, JPG, and MP4 automatically
            // ❌ Removed 'format' and 'allowed_formats' here. 
            // Forcing them inside params is what usually causes the [object Object] 500 error.
        };
    },
});

// --- 3. FILE FILTER ---
const fileFilter = (req, file, cb) => {
    // Basic check for common types
    if (file.mimetype.startsWith('image/') || 
        file.mimetype === 'application/pdf' || 
        file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type!'), false);
    }
};

module.exports = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});