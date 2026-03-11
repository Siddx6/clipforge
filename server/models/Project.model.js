const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  template: {
    type: String,
    enum: ['reddit', 'dialogue', 'voiceover', 'lipsync', 'avatar', 'captions'],
    required: true
  },
  status: {
    type: String,
    enum: ['queued', 'processing', 'done', 'failed'],
    default: 'queued'
  },
  script: {
    type: String,
    default: ''
  },
  voiceId: {
    type: String,
    default: null
  },
  backgroundVideoUrl: {
    type: String,
    default: null
  },
  outputVideoUrl: {
    type: String,
    default: null
  },
  tokensUsed: {
    type: Number,
    default: 0
  },
  failReason: {          // ← ADD THIS
    type: String,
    default: null
  },
  metadata: {
    type: Object,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);