const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');

const BACKGROUND_QUERIES = {
  'subway-surfers': 'parkour running urban',
  'minecraft': 'minecraft gameplay',
  'gta-driving': 'city driving night',
  'satisfying': 'satisfying sand cutting',
  'nature': 'nature forest aerial',
  'space': 'space stars galaxy'
};

const downloadVideo = (url, destPath) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        https.get(response.headers.location, (redirected) => {
          redirected.pipe(file);
          file.on('finish', () => { file.close(); resolve(destPath); });
        }).on('error', reject);
        return;
      }
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(destPath); });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
};

const getBackgroundVideo = async (bgType = 'subway-surfers') => {
  const bgDir = path.join(__dirname, '../uploads/backgrounds');
  if (!fs.existsSync(bgDir)) fs.mkdirSync(bgDir, { recursive: true });

  const cachedPath = path.join(bgDir, `${bgType}.mp4`);
  if (fs.existsSync(cachedPath)) {
    console.log(`[Pexels] Using cached background: ${bgType}`);
    return cachedPath;
  }

  const query = BACKGROUND_QUERIES[bgType] || 'nature landscape';
  console.log(`[Pexels] Fetching video for: ${query}`);

  const response = await axios.get('https://api.pexels.com/videos/search', {
    headers: { Authorization: process.env.PEXELS_API_KEY },
    params: { query, per_page: 5, orientation: 'portrait' }
  });

  const videos = response.data.videos;
  if (!videos || videos.length === 0) throw new Error('No videos found on Pexels');

  const video = videos[0];
  const videoFile = video.video_files.find(f => f.quality === 'hd') || video.video_files[0];

  console.log(`[Pexels] Downloading: ${videoFile.link}`);
  await downloadVideo(videoFile.link, cachedPath);
  console.log(`[Pexels] ✅ Background downloaded: ${bgType}`);

  return cachedPath;
};

module.exports = { getBackgroundVideo };