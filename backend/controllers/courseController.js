const Subject = require('../models/Subject');
const StudyMaterial = require('../models/StudyMaterial');
const Student = require('../models/Student'); // <--- 1. Import Student, NOT User

// GET SUBJECTS FOR LOGGED-IN STUDENT
exports.getMySubjects = async (req, res) => {
    try {
        // 2. Use 'Student.findById'
        const student = await Student.findById(req.user.id);
        if (!student) return res.status(404).json({ msg: "Student not found" });

        // 3. Update Data Access
        // OLD: student.studentDetails.standard
        // NEW: student.standard (Because we flattened the Student model)
        const subjects = await Subject.find({ standard: student.standard });
        
        res.json(subjects);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};

// GET MATERIAL FOR A SPECIFIC SUBJECT (No changes needed here usually)
exports.getSubjectMaterials = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const materials = await StudyMaterial.find({ subjectId: subjectId });
        
        const grouped = {
            Textbooks: materials.filter(m => m.type === 'Textbook'),
            Notes: materials.filter(m => m.type === 'Notes'),
            'Audio Notes': materials.filter(m => m.type === 'Audio'),
            'Video Lecture': materials.filter(m => m.type === 'Video')
        };
        
        res.json(grouped);
    } catch (error) {
        res.status(500).send("Server Error");
    }
};