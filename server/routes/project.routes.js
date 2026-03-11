const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', projectController.getProjects);
router.post('/', projectController.createProject);
router.get('/:id', projectController.getProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);
router.post('/:id/generate', projectController.generateProject);
router.get('/:id/status', projectController.getProjectStatus);

module.exports = router;