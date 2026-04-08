const mongoose = require('mongoose');

const teacherAttendanceSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    
    // We store only ABSENT teachers. 
    // If a teacher is NOT in this list, they are PRESENT.
    absentTeachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }],
    
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
});

// Ensure one record per day
teacherAttendanceSchema.index({ date: 1 }, { unique: true });

module.exports = mongoose.model('TeacherAttendance', teacherAttendanceSchema);