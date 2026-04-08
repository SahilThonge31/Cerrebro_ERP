const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/cloudUpload');
const controller = require('../controllers/assignmentController');

router.post('/create', auth, upload.single('file'), controller.createAssignment);
router.get('/view', auth, controller.getAssignments);
router.delete('/:id', auth, controller.deleteAssignment);

module.exports = router;