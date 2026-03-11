const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
const fs = require('fs');
const path = require('path');

// All voices using Edge TTS — celebrity-style labels
const VOICE_MAP = {
  // Celebrity-style voices
  'peter-griffin':  { voice: 'en-US-ChristopherNeural', pitch: '-10Hz', rate: '-5%' },
  'stewie-griffin': { voice: 'en-GB-RyanNeural',        pitch: '+15Hz', rate: '+10%' },
  'donald-trump':   { voice: 'en-US-GuyNeural',         pitch: '-5Hz',  rate: '-10%' },
  'elon-musk':      { voice: 'en-US-EricNeural',        pitch: '0Hz',   rate: '-5%' },
  'homer-simpson':  { voice: 'en-US-ChristopherNeural', pitch: '-15Hz', rate: '-8%' },
  'spongebob':      { voice: 'en-US-AndrewNeural',      pitch: '+20Hz', rate: '+15%' },
  'morgan-freeman': { voice: 'en-US-ChristopherNeural', pitch: '-20Hz', rate: '-15%' },
  'darth-vader':    { voice: 'en-GB-RyanNeural',        pitch: '-30Hz', rate: '-20%' },
  'arnold':         { voice: 'en-US-GuyNeural',         pitch: '-8Hz',  rate: '-12%' },
  'cartman':        { voice: 'en-US-AndrewNeural',      pitch: '+10Hz', rate: '+5%' },
  // Neutral voices
  '1': { voice: 'en-US-ChristopherNeural', pitch: '0Hz', rate: '0%' },
  '2': { voice: 'en-US-GuyNeural',         pitch: '0Hz', rate: '0%' },
  '3': { voice: 'en-US-EricNeural',        pitch: '0Hz', rate: '0%' },
  '4': { voice: 'en-US-JennyNeural',       pitch: '0Hz', rate: '0%' },
  '5': { voice: 'en-GB-SoniaNeural',       pitch: '0Hz', rate: '0%' },
  '6': { voice: 'en-AU-WilliamNeural',     pitch: '0Hz', rate: '0%' },
};

const generateVoiceover = async (script, voiceId = '1', outputPath) => {
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const filePath = outputPath || path.join(uploadsDir, `audio_${Date.now()}.mp3`);
  const config = VOICE_MAP[voiceId] || VOICE_MAP['1'];

  console.log(`[TTS] Generating voice: ${voiceId} → ${config.voice}`);

  const fileName = `tts_${Date.now()}`;
  const outputDir = path.join(uploadsDir, fileName);
  fs.mkdirSync(outputDir, { recursive: true });

  const tts = new MsEdgeTTS();
  await tts.setMetadata(config.voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  await tts.toFile(outputDir, script);

  const generatedFile = path.join(outputDir, 'audio.mp3');
  if (fs.existsSync(generatedFile)) {
    fs.renameSync(generatedFile, filePath);
    fs.rmdirSync(outputDir);
  }

  return filePath;
};

const CELEBRITY_VOICE_IDS = [
  'peter-griffin', 'stewie-griffin', 'donald-trump', 'elon-musk',
  'homer-simpson', 'spongebob', 'morgan-freeman', 'darth-vader', 'arnold', 'cartman'
];

module.exports = { generateVoiceover, CELEBRITY_VOICE_IDS, VOICE_MAP };