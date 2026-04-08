const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    instituteName: { type: String, default: 'Cerrebro Tutorials' },
    address: { type: String, default: 'BalKrushna Building, Near Power House Gym, Manjiri BK Road, Gopalpatti, Hadapsar, Pune-412307' },
    contact: { type: String, default: '+91 7058161172' },
    currentSession: { type: String, default: '2025-2026' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);