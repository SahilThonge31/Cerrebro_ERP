const Advertisement = require('../models/Advertisement');

// --- 1. GET ALL ADS ---
exports.getAds = async (req, res) => {
    try {
        // Fetch all ads, sorted by newest first
        const ads = await Advertisement.find().sort({ createdAt: -1 });
        res.json(ads);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- 2. CREATE AD (Handles Image Logic) ---
exports.createAd = async (req, res) => {
    try {
        // Validation: Ensure an image was uploaded via Cloudinary
        if (!req.file) {
            return res.status(400).json({ msg: "Please upload an image" });
        }

        const { title, link } = req.body;
        
        // 👇 NEW: Cloudinary automatically provides the live, secure URL
        const imageUrl = req.file.path;

        const newAd = new Advertisement({
            title,
            imageUrl, // Saves the Cloudinary link to MongoDB!
            link
        });

        await newAd.save();
        res.status(201).json(newAd);

    } catch (error) {
        console.error("Cloudinary Ad Upload Error:", error);
        res.status(500).json({ error: "Failed to create advertisement" });
    }
};

// --- 3. DELETE AD ---
exports.deleteAd = async (req, res) => {
    try {
        const ad = await Advertisement.findById(req.params.id);
        if (!ad) return res.status(404).json({ msg: "Ad not found" });

        await Advertisement.findByIdAndDelete(req.params.id);
        res.json({ msg: "Ad Deleted Successfully" });
        
        // Pro-Tip for the future: If you ever want to delete the image from 
        // Cloudinary to save storage space, you would use cloudinary.uploader.destroy() here!
    } catch (error) {
        console.error("Error deleting ad:", error.message);
        res.status(500).json({ error: error.message });
    }
};