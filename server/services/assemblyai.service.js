const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.ASSEMBLYAI_API_KEY;
const BASE_URL = 'https://api.assemblyai.com/v2';

// Step 1 — Upload audio file to AssemblyAI
const uploadAudio = async (audioPath) => {
  const audioData = fs.readFileSync(audioPath);
  const response = await axios.post(`${BASE_URL}/upload`, audioData, {
    headers: {
      authorization: process.env.ASSEMBLYAI_API_KEY,
      'content-type': 'application/octet-stream'
    }
  });
  return response.data.upload_url;
};

// Step 2 — Submit transcription job with word-level timestamps
const submitTranscription = async (audioUrl) => {
  const response = await axios.post(`${BASE_URL}/transcript`, {
    audio_url: audioUrl,
    speech_models: ['universal-2'],
  }, {
    headers: { authorization: process.env.ASSEMBLYAI_API_KEY }
  });
  return response.data.id;
};

// Step 3 — Poll until transcription is complete
const pollTranscription = async (transcriptId) => {
  const url = `${BASE_URL}/transcript/${transcriptId}`;
  while (true) {
    const response = await axios.get(url, {
      headers: { authorization: process.env.ASSEMBLYAI_API_KEY }
    });
    const { status, words, error } = response.data;

    if (status === 'completed') return words; // array of { text, start, end }
    if (status === 'error') throw new Error(`AssemblyAI error: ${error}`);

    // Wait 2 seconds before polling again
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
};

// Main function — returns word timings like:
// [{ word: 'hello', start: 0.0, end: 0.5 }, ...]
const getWordTimings = async (audioPath) => {
  try {
    console.log('[AssemblyAI] Uploading audio...');
    const uploadUrl = await uploadAudio(audioPath);

    console.log('[AssemblyAI] Submitting transcription job...');
    const transcriptId = await submitTranscription(uploadUrl);

    console.log('[AssemblyAI] Waiting for transcription...');
    const words = await pollTranscription(transcriptId);

    // Convert from milliseconds to seconds to match FFmpeg format
    const timings = words.map(w => ({
      word: w.text,
      start: w.start / 1000,
      end: w.end / 1000
    }));

    console.log(`[AssemblyAI] ✅ Got ${timings.length} word timings`);
    return timings;

  } catch (err) {
    console.error('[AssemblyAI] ❌ Failed:', err.message);
    console.error('[AssemblyAI] ❌ Details:', err.response?.data);
    return null;
  }
};

module.exports = { getWordTimings };