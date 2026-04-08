const GalleryAlbum = require('../models/GalleryAlbum');
// Note: 'fs' and 'path' imports removed since we no longer manage local files!

// ==========================================
// 1. Create Album (With Cover Image)
// ==========================================
exports.createAlbum = async (req, res) => {
    try {
        const { title, description, eventDate } = req.body;
        
        if (!req.file) return res.status(400).json({ msg: "Cover image is required" });

        // 👇 NEW LOGIC: Cloudinary provides the secure URL directly
        const coverUrl = req.file.path;

        const newAlbum = new GalleryAlbum({
            title,
            description,
            eventDate,
            coverImage: coverUrl, // Saves the Cloudinary link
            media: [], // Empty initially
            createdBy: req.user.id
        });

        await newAlbum.save();
        res.json(newAlbum);

    } catch (err) {
        console.error("Error creating album:", err);
        res.status(500).send("Server Error");
    }
};

// ==========================================
// 2. Add Media to Album (Multiple Files)
// ==========================================
exports.addMedia = async (req, res) => {
    try {
        const { id } = req.params;
        const album = await GalleryAlbum.findById(id);
        
        if (!album) return res.status(404).json({ msg: "Album not found" });
        if (!req.files || req.files.length === 0) return res.status(400).json({ msg: "No files uploaded" });

        // 👇 NEW LOGIC: Map through the array of Cloudinary files
        const newMedia = req.files.map(file => ({
            type: file.mimetype.startsWith('video') ? 'video' : 'image',
            url: file.path // Saves the Cloudinary link for each file in the array
        }));

        album.media.push(...newMedia);
        await album.save();

        res.json(album);
    } catch (err) {
        console.error("Error adding media:", err);
        res.status(500).send("Server Error");
    }
};

// ==========================================
// 3. Get All Albums
// ==========================================
exports.getAlbums = async (req, res) => {
    try {
        const albums = await GalleryAlbum.find().sort({ eventDate: -1 });
        res.json(albums);
    } catch (err) {
        console.error("Error fetching albums:", err);
        res.status(500).send("Server Error");
    }
};

// ==========================================
// 4. Delete Album
// ==========================================
exports.deleteAlbum = async (req, res) => {
    try {
        const album = await GalleryAlbum.findById(req.params.id);
        if (!album) return res.status(404).json({ msg: "Not found" });

        // We only delete from the database now. Cloudinary hosts the files.
        await album.deleteOne();
        res.json({ msg: "Album Removed" });
    } catch (err) {
        console.error("Error deleting album:", err);
        res.status(500).send("Server Error");
    }
};

// ==========================================
// 5. Delete Media (Individual photo/video)
// ==========================================
exports.deleteMedia = async (req, res) => {
    try {
        const { id, mediaId } = req.params;
        const album = await GalleryAlbum.findById(id);
        
        if (!album) return res.status(404).json({ msg: "Album not found" });

        // Filter out the media item
        album.media = album.media.filter(m => m._id.toString() !== mediaId);
        
        await album.save();

        // 👇 REMOVED: All the fs.existsSync and fs.unlinkSync logic is gone!
        // The frontend will update instantly, and you don't risk crashing the server 
        // trying to delete a file that might be locked or missing locally.

        res.json(album); // Return updated album to frontend
    } catch (err) {
        console.error("Error deleting media:", err);
        res.status(500).send("Server Error");
    }
};