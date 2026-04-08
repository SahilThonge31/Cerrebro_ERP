const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getMySubjects, getSubjectMaterials } = require('../controllers/courseController');

router.get('/subjects', auth, getMySubjects);
router.get('/materials/:subjectId', auth, getSubjectMaterials);

module.exports = router;