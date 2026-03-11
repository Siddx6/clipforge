const https = require('https');
const fs = require('fs');
const path = require('path');

const CELEBRITY_VOICES = {
  'peter-griffin': 'TM:7yerwt1ygve7',
  'stewie-griffin': 'TM:dkn5p9p09ypq',
  'donald-trump': 'TM:0xt9gqjpyjm4',
  'elon-musk': 'TM:ehprm8e3q2h8',
  'homer-simpson': 'TM:pqmyqdj9n9n8',
  'spongebob': 'TM:w5p8vtybeex3',
  'morgan-freeman': 'TM:4e51jnkfcs76',
  'darth-vader': 'TM:9qkwb3wm88r5',
  'arnold': 'TM:bdgkc4xa8862',
  'cartman': 'TM:he3ehkqhtt16',
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const makeRequest = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
};

const downloadFile = (url, destPath) => {
  return new Promise((resolve, reject) => {
    const followRedirect = (currentUrl) => {
      const urlObj = new URL(currentUrl);
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0' }
      };

      https.get(options, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) {
          followRedirect(res.headers.location);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`Download failed with status: ${res.statusCode}`));
          return;
        }
        const file = fs.createWriteStream(destPath);
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          const stats = fs.statSync(destPath);
          console.log(`[FakeYou] Downloaded ${stats.size} bytes to ${destPath}`);
          if (stats.size < 1000) {
            reject(new Error(`Downloaded file too small: ${stats.size} bytes`));
            return;
          }
          resolve(destPath);
        });
        file.on('error', reject);
      }).on('error', reject);
    };

    followRedirect(url);
  });
};

const getVoiceToken = async (voiceKey) => {
  const searchTerms = {
    'donald-trump': 'donald trump',
    'peter-griffin': 'peter griffin',
    'stewie-griffin': 'stewie griffin',
    'elon-musk': 'elon musk',
    'homer-simpson': 'homer simpson',
    'spongebob': 'spongebob',
    'morgan-freeman': 'morgan freeman',
    'darth-vader': 'darth vader',
    'arnold': 'arnold schwarzenegger',
    'cartman': 'eric cartman',
  };

  const query = searchTerms[voiceKey];
  if (!query) throw new Error(`Unknown voice key: ${voiceKey}`);

  const res = await makeRequest({
    hostname: 'api.fakeyou.com',
    path: '/tts/list',
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });

  const models = res.data?.models || [];
  const match = models.find(m => m.title.toLowerCase().includes(query));
  if (!match) throw new Error(`No FakeYou voice found for: ${voiceKey}`);
  console.log(`[FakeYou] Found voice: ${match.title} → ${match.model_token}`);
  return match.model_token;
};

const generateCelebrityVoice = async (text, voiceKey, outputPath) => {
  let ttsModelToken = CELEBRITY_VOICES[voiceKey];

  try {
    ttsModelToken = await getVoiceToken(voiceKey);
  } catch (e) {
    console.log('[FakeYou] Live token lookup failed, using cached token:', e.message);
  }

  if (!ttsModelToken) throw new Error(`Unknown celebrity voice: ${voiceKey}`);

  console.log(`[FakeYou] Generating voice for: ${voiceKey} with token: ${ttsModelToken}`);

  const postData = JSON.stringify({
    tts_model_token: ttsModelToken,
    uuid_idempotency_token: `clipforge-${Date.now()}`,
    inference_text: text.substring(0, 500)
  });

  const submitRes = await makeRequest({
    hostname: 'api.fakeyou.com',
    path: '/tts/inference',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'Accept': 'application/json'
    }
  }, postData);

  if (!submitRes.data.success) {
    console.log('[FakeYou] Error response:', JSON.stringify(submitRes.data));
    throw new Error('FakeYou job submission failed');
  }

  const jobToken = submitRes.data.inference_job_token;
  console.log(`[FakeYou] Job submitted: ${jobToken}`);

  for (let i = 0; i < 24; i++) {
    await sleep(5000);
    const pollRes = await makeRequest({
      hostname: 'api.fakeyou.com',
      path: `/tts/job/${jobToken}`,
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    const state = pollRes.data?.state?.status;
    console.log(`[FakeYou] Job status: ${state}`);

    if (state === 'complete_success') {
      const audioPath = pollRes.data.state.maybe_public_bucket_wav_audio_path;
      const audioUrl = `https://fakeyou.com${audioPath}`;
      console.log(`[FakeYou] Downloading audio: ${audioUrl}`);
      await downloadFile(audioUrl, outputPath);
      return outputPath;
    }

    if (state === 'complete_failure' || state === 'dead') {
      throw new Error('FakeYou job failed');
    }
  }

  throw new Error('FakeYou job timed out');
};

module.exports = { generateCelebrityVoice, CELEBRITY_VOICES };