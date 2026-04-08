const Testimonial = require('../models/Testimonial');
const Achiever = require('../models/Achiever');
const Academic = require('../models/Academic'); 
const GalleryAlbum = require('../models/GalleryAlbum');
const Enquiry = require('../models/Enquiry');
const nodemailer = require('nodemailer');
const cloudinary = require('cloudinary').v2; // 👈 ADDED THIS IMPORT

// 1. Fetch Public Testimonials
exports.getPublicTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find({ isApproved: true })
                                              .sort({ createdAt: -1 })
                                              .limit(10);
        res.json(testimonials);
    } catch (err) {
        console.error("Error fetching testimonials:", err);
        res.status(500).send("Server Error");
    }
};

// 2. Fetch Public Classes
exports.getPublicClasses = async (req, res) => {
    try {
        const classes = await Academic.aggregate([
            { $group: { _id: { standard: "$className", board: "$board" } } },
            { $project: { _id: 0, standard: "$_id.standard", board: "$_id.board" } },
            { $sort: { standard: 1 } } 
        ]);
        res.json(classes);
    } catch (err) {
        console.error("Error fetching public classes:", err);
        res.status(500).send("Server Error");
    }
};

// 3. Fetch Public Achievers
exports.getPublicAchievers = async (req, res) => {
    try {
        const achievers = await Achiever.find()
                                        .sort({ percentage: -1, createdAt: -1 })
                                        .limit(8);
        res.json(achievers);
    } catch (err) {
        console.error("Error fetching achievers:", err);
        res.status(500).send("Server Error");
    }
};

// --- ADD ACHIEVER (New Function) ---
exports.addAchiever = async (req, res) => {
    try {
        const { name, percentage, examName, year, photoUrl } = req.body;
        let finalPhoto = photoUrl;

        // If a file was uploaded from the computer
        if (req.file) {
            finalPhoto = req.file.path;
        }

        const newAchiever = new Achiever({
            name,
            percentage,
            examName,
            year,
            photoUrl: finalPhoto
        });

        await newAchiever.save();
        res.status(201).json(newAchiever);
    } catch (err) {
        console.error("Add Achiever Error:", err);
        res.status(500).send("Server Error");
    }
};

// --- DELETE ACHIEVER (Updated for Cloudinary) ---
exports.deleteAchiever = async (req, res) => {
    try {
        const achiever = await Achiever.findById(req.params.id);

        if (!achiever) {
            return res.status(404).json({ msg: "Achiever not found" });
        }

        // Remove from Cloudinary if it's a cloud link
        if (achiever.photoUrl && achiever.photoUrl.includes('cloudinary')) {
            const parts = achiever.photoUrl.split('/');
            const publicId = `school_app/general/${parts[parts.length - 1].split('.')[0]}`;
            await cloudinary.uploader.destroy(publicId).catch(e => console.log("Cloudinary Delete Failed", e));
        }

        await achiever.deleteOne();
        res.json({ msg: "Achiever removed successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// 4. Fetch Public Gallery
exports.getPublicGallery = async (req, res) => {
    try {
        const albums = await GalleryAlbum.find().sort({ eventDate: -1 });
        res.json(albums);
    } catch (err) {
        console.error("Error fetching public gallery:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

// 5. Submit Enquiry
exports.submitEnquiry = async (req, res) => {
    try {
        const { fullName, className, schoolName, board, studentMobile, parentMobile, address, previousMarks, referenceSource } = req.body;

        const newEnquiry = new Enquiry({
            fullName, className, schoolName, board, studentMobile, parentMobile, address, previousMarks, referenceSource
        });
        await newEnquiry.save();

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: 'cerrebrotutorials@gmail.com',
                subject: `🎉 New Admission Enquiry: ${fullName}`,
                html: `<div style="font-family: sans-serif; padding: 20px;"><h2>New Enquiry Details</h2><p><b>Name:</b> ${fullName}</p><p><b>Class:</b> ${className}</p></div>`
            };

            await transporter.sendMail(mailOptions);
        }

        res.status(201).json({ message: "Enquiry submitted successfully!" });
    } catch (err) {
        console.error("Enquiry submission error:", err);
        res.status(500).json({ message: "Server error, please try again." });
    }
};