const { uploadVideo } = require('../services/storage.service');
const { Worker } = require('bullmq');
const path = require('path');
const fs = require('fs');
const Project = require('../models/Project.model');
const User = require('../models/User.model');
const { connection } = require('./queue');
const { generateVoiceover } = require('../services/elevenlabs.service');
const { composeVideo, mergeAudioFiles } = require('../services/ffmpeg.service');
const { getBackgroundVideo } = require('../services/pexels.service');
const { getWordTimings } = require('../services/assemblyai.service');
const { getTokenCost } = require('../utils/tokenCost');
const { downloadVideo } = require('../utils/downloadVideo');

const processVideo = async (job) => {
  const { projectId } = job.data;

  try {
    const project = await Project.findById(projectId);
    if (!project) throw new Error('Project not found');

    // ── STEP 0: Token check + deduction ───────────────────────────────────────
    const tokenCost = getTokenCost(project.template);
    const user = await User.findById(project.userId);

    if (!user) throw new Error('User not found');

    if (user.tokens < tokenCost) {
      await Project.findByIdAndUpdate(projectId, {
        status: 'failed',
        failReason: 'insufficient_tokens'
      });
      throw new Error(`Insufficient tokens: need ${tokenCost}, have ${user.tokens}`);
    }

    // Deduct tokens before processing starts
    await User.findByIdAndUpdate(user._id, { $inc: { tokens: -tokenCost } });
    console.log(`[Worker] ⚡ Deducted ${tokenCost} tokens from user ${user._id}`);

    await Project.findByIdAndUpdate(projectId, { status: 'processing' });
    await job.updateProgress(10);

    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    let audioPath;

    // ── DIALOGUE ──────────────────────────────────────────────────────────────
    if (project.template === 'dialogue') {
      console.log(`[Worker] Step 1/3: Generating dialogue voiceover for project ${projectId}`);

      const voice1 = project.metadata?.voice1 || '1';
      const voice2 = project.metadata?.voice2 || '4';

      const lines = (project.script || '')
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean);

      const audioParts = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const isChar2 = /^(character\s*2|char\s*2|c2|speaker\s*2|person\s*2):/i.test(line);
        const voiceId = isChar2 ? voice2 : voice1;
        const cleanLine = line.replace(/^[^:]+:\s*/i, '').trim();
        if (!cleanLine) continue;

        const partPath = path.join(uploadsDir, `audio_${projectId}_part${i}.mp3`);
        console.log(`[Worker] Line ${i + 1} → voice ${voiceId}: "${cleanLine.substring(0, 40)}..."`);
        await generateVoiceover(cleanLine, voiceId, partPath);
        audioParts.push(partPath);
      }

      if (audioParts.length === 0) throw new Error('No dialogue lines found');

      const mergedPath = path.join(uploadsDir, `audio_${projectId}.mp3`);
      if (audioParts.length === 1) {
        fs.renameSync(audioParts[0], mergedPath);
      } else {
        await mergeAudioFiles(audioParts, mergedPath);
        audioParts.forEach(p => { try { fs.unlinkSync(p); } catch {} });
      }

      audioPath = mergedPath;

    } else if (project.template === 'captions') {
      // ── CAPTIONS ──────────────────────────────────────────────────────────
      console.log(`[Worker] Step 1/3: Downloading user video for captions`);

      const videoUrl = project.script?.trim();
      if (!videoUrl || !videoUrl.startsWith('http')) {
        throw new Error('No valid video URL provided for captions template');
      }

      const inputVideoPath = path.join(uploadsDir, `input_${projectId}.mp4`);
      await downloadVideo(videoUrl, inputVideoPath);

      console.log(`[Worker] Extracting audio from video...`);
      audioPath = path.join(uploadsDir, `audio_${projectId}.mp3`);
      await new Promise((resolve, reject) => {
        const ffmpeg = require('fluent-ffmpeg');
        ffmpeg(inputVideoPath)
          .outputOptions(['-vn', '-acodec', 'mp3'])
          .output(audioPath)
          .on('end', resolve)
          .on('error', reject)
          .run();
      });

      project._inputVideoPath = inputVideoPath;

    } else {
      // ── ALL OTHER TEMPLATES ───────────────────────────────────────────────
      console.log(`[Worker] Step 1/3: Generating voiceover for project ${projectId}`);

      const cleanScript = (project.script || 'Hello welcome to ClipForge!')
        .split('\n')
        .map(line => line.replace(/^[^:]+:\s*/i, '').trim())
        .filter(Boolean)
        .join(' ... ');

      audioPath = await generateVoiceover(
        cleanScript,
        project.voiceId || '1',
        path.join(uploadsDir, `audio_${projectId}.mp3`)
      );
    }

    // Step 2 — Fetch background video
    let bgVideoPath;
    if (project.template === 'captions') {
      bgVideoPath = project._inputVideoPath;
      console.log(`[Worker] Step 2/3: Using user's video as background for captions`);
    } else {
      console.log(`[Worker] Step 2/3: Fetching background video`);
      const bgType = project.metadata?.bgVideo || 'subway-surfers';
      bgVideoPath = await getBackgroundVideo(bgType);
      console.log(`[Worker] ✅ Background ready`);
    }
    await job.updateProgress(60);

    // Step 3 — Get real word timings from AssemblyAI
    console.log(`[Worker] Step 3/4: Getting word timings from AssemblyAI`);
    const wordTimings = await getWordTimings(audioPath);

    // Step 4 — Compose video
    console.log(`[Worker] Step 4/4: Compositing video`);
    const videoPath = path.join(uploadsDir, `video_${projectId}.mp4`);
    const isCaption = project.template === 'captions';
    const resolutionStr = project.metadata?.resolution || '1080x1920';
    const [resWidth, resHeight] = resolutionStr.split('x').map(Number);

    await composeVideo(audioPath, videoPath, bgVideoPath, {
      width:           isCaption ? null : resWidth,
      height:          isCaption ? null : resHeight,
      script:          project.script || '',
      captionStyle:    project.metadata?.captionStyle    || 'highlight',
      captionColor:    project.metadata?.captionColor    || '#FFD700',
      captionFont:     project.metadata?.captionFont     || 'impact',
      captionPosition: project.metadata?.position        || 'bottom',
      wordTimings,
      keepOriginalSize: isCaption,
      watermark:       user.plan === 'free',
    });

    console.log(`[Worker] ✅ Video composed`);

    // Step 5 — Upload to Supabase Storage
    console.log(`[Worker] Step 5/5: Uploading video to cloud storage...`);
    const publicUrl = await uploadVideo(videoPath, projectId);
    console.log(`[Worker] ✅ Video uploaded to cloud`);

    await job.updateProgress(100);

    await Project.findByIdAndUpdate(projectId, {
      status:         'done',
      outputVideoUrl: publicUrl,
      tokensUsed:     tokenCost
    });

    console.log(`[Worker] ✅ Project ${projectId} completed — cost ${tokenCost} tokens`);
    return { success: true, projectId };

  } catch (error) {
    console.error(`[Worker] ❌ Project ${projectId} failed:`, error.message);
    const current = await Project.findById(projectId);
    if (current && current.status !== 'failed') {
      await Project.findByIdAndUpdate(projectId, { status: 'failed' });
    }
    throw error;
  }
};

const startWorker = () => {
  const worker = new Worker('video-generation', processVideo, {
    connection,
    concurrency: 3
  });

  worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job.id} failed:`, err.message);
  });

  console.log('[Worker] Video worker started');
  return worker;
};

module.exports = { startWorker };