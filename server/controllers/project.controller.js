const Project = require('../models/Project.model');
const User = require('../models/User.model');
const { videoQueue } = require('../workers/queue');

const TOKEN_COSTS = {
  reddit: 8,
  dialogue: 10,
  voiceover: 5,
  lipsync: 25,
  avatar: 20,
  captions: 3
};

// @route GET /api/v1/projects
const getProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const projects = await Project.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Project.countDocuments({ userId: req.user._id });

    res.json({ projects, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/v1/projects
const createProject = async (req, res) => {
  try {
    const { title, template, script, voiceId, backgroundVideoUrl, metadata } = req.body;

    if (!title || !template) {
      return res.status(400).json({ message: 'Title and template are required' });
    }

    const project = await Project.create({
      userId: req.user._id,
      title,
      template,
      script,
      voiceId,
      backgroundVideoUrl,
      metadata: metadata || {}
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/v1/projects/:id
const getProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/v1/projects/:id
const updateProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const { title, script, voiceId, backgroundVideoUrl, metadata } = req.body;
    if (title) project.title = title;
    if (script) project.script = script;
    if (voiceId) project.voiceId = voiceId;
    if (backgroundVideoUrl) project.backgroundVideoUrl = backgroundVideoUrl;
    if (metadata) project.metadata = metadata;

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/v1/projects/:id
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    await project.deleteOne();
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/v1/projects/:id/generate
const generateProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const tokenCost = TOKEN_COSTS[project.template] || 5;
    if (req.user.tokens < tokenCost) {
      return res.status(402).json({
        message: `Not enough tokens. This template costs ${tokenCost} tokens but you only have ${req.user.tokens}.`,
        code: 'INSUFFICIENT_TOKENS',
        required: tokenCost,
        available: req.user.tokens
      });
    }

    project.status = 'queued';
    await project.save();

    await videoQueue.add('generate', { projectId: project._id.toString() }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 }
    });

    res.json({ message: 'Generation queued', project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/v1/projects/:id/status
const getProjectStatus = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user._id })
      .select('status outputVideoUrl tokensUsed failReason');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProjects, createProject, getProject, updateProject, deleteProject, generateProject, getProjectStatus };