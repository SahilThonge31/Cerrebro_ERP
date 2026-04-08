const mongoose = require('mongoose');

const galleryAlbumSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    eventDate: { type: Date, default: Date.now },
    coverImage: { type: String, required: true }, // The main thumbnail
    media: [{
        type: { type: String, enum: ['image', 'video'], required: true },
        url: { type: String, required: true }
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, { timestamps: true });

module.exports = mongoose.model('GalleryAlbum', galleryAlbumSchema);