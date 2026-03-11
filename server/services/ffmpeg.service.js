const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

if (process.platform === 'win32') {
  ffmpeg.setFfmpegPath('C:\\ffmpeg\\bin\\ffmpeg.exe');
  ffmpeg.setFfprobePath('C:\\ffmpeg\\bin\\ffprobe.exe');
}
// Get audio duration in seconds
const getAudioDuration = (audioPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(audioPath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata.format.duration || 30);
    });
  });
};

// Generate word-level subtitle timestamps
const generateSubtitleTimings = (script, duration) => {
  const words = script
    .replace(/^[^:]+:\s*/gim, '') // strip character prefixes
    .replace(/\.{2,}/g, ' ') // strip ... separators
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return [];

  const timePerWord = duration / words.length;
  return words.map((word, i) => ({
    word: word.replace(/['"\\:]/g, ''), // escape special chars for ffmpeg
    start: i * timePerWord,
    end: (i + 1) * timePerWord
  }));
};

// Map frontend font names → system font file paths that FFmpeg can find on Windows
const FONT_MAP = {
  'impact':      'C\\:/Windows/Fonts/impact.ttf',
  'arial':       'C\\:/Windows/Fonts/arialbd.ttf',
  'montserrat':  'C\\:/Windows/Fonts/arialbd.ttf',
  'syne':        'C\\:/Windows/Fonts/arialbd.ttf',
};

// Convert hex color (#RRGGBB) → FFmpeg color string (0xRRGGBB or named)
const hexToFfmpegColor = (hex) => {
  if (!hex || !hex.startsWith('#')) return 'yellow';
  return '0x' + hex.replace('#', '');
};

// Build FFmpeg drawtext filter for subtitles
const buildSubtitleFilter = (timings, width, height, style = 'highlight', color = '#FFD700', font = 'impact', position = 'bottom') => {
  if (timings.length === 0) return null;

  const yMap = { bottom: 0.72, center: 0.50, top: 0.15 };
  const y = Math.round(height * (yMap[position] || 0.72)); // 72% down the screen
  const fontSize = Math.round(width * 0.075); // responsive font size
  const fontFile = FONT_MAP[font] || FONT_MAP['impact'];
  const mainColor = hexToFfmpegColor(color);

  const filters = timings.map(({ word, start, end }) => {
    const safeWord = word
      .replace(/'/g, "\u2019") // smart quote instead of single quote
      .replace(/\\/g, '')
      .replace(/:/g, '')
      .substring(0, 30);

    const enable = `between(t,${start.toFixed(3)},${end.toFixed(3)})`;
    // Common font options appended to every drawtext call
    const fontOpts = `:fontfile='${fontFile}'`;

    if (style === 'highlight') {
      return [
        // Shadow layer
        `drawtext=text='${safeWord}'${fontOpts}:fontsize=${fontSize}:fontcolor=black@0.9:x=(w-text_w)/2:y=${y + 4}:enable='${enable}'`,
        // Main text — user-selected color
        `drawtext=text='${safeWord}'${fontOpts}:fontsize=${fontSize}:fontcolor=${mainColor}:x=(w-text_w)/2:y=${y}:enable='${enable}'`
      ].join(',');
    } else if (style === 'bounce') {
      // Slightly larger, with thick black outline via shadow offset layers
      return [
        `drawtext=text='${safeWord}'${fontOpts}:fontsize=${fontSize + 6}:fontcolor=black@0.9:x=(w-text_w)/2+3:y=${y + 3}:enable='${enable}'`,
        `drawtext=text='${safeWord}'${fontOpts}:fontsize=${fontSize + 6}:fontcolor=${mainColor}:x=(w-text_w)/2:y=${y - 4}:enable='${enable}'`
      ].join(',');
    } else if (style === 'fade') {
      return [
        `drawtext=text='${safeWord}'${fontOpts}:fontsize=${fontSize}:fontcolor=black@0.8:x=(w-text_w)/2:y=${y + 3}:enable='${enable}'`,
        `drawtext=text='${safeWord}'${fontOpts}:fontsize=${fontSize}:fontcolor=${mainColor}:x=(w-text_w)/2:y=${y}:enable='${enable}'`
      ].join(',');
    } else {
      // karaoke / default
      return [
        `drawtext=text='${safeWord}'${fontOpts}:fontsize=${fontSize}:fontcolor=black@0.8:x=(w-text_w)/2:y=${y + 3}:enable='${enable}'`,
        `drawtext=text='${safeWord}'${fontOpts}:fontsize=${fontSize}:fontcolor=${mainColor}:x=(w-text_w)/2:y=${y}:enable='${enable}'`
      ].join(',');
    }
  });

  return filters.join(',');
};

const composeVideo = async (audioPath, outputPath, bgVideoPath, options = {}) => {
 const {
    width = 1080,
    height = 1920,
    script = '',
    captionStyle    = 'highlight',
    captionColor    = '#FFD700',
    captionFont     = 'impact',
    captionPosition = 'bottom',
    wordTimings     = null,
    keepOriginalSize = false,
    watermark       = false,
  } = options;

  return new Promise(async (resolve, reject) => {
    try {
     // Get audio duration for timing
      const duration = await getAudioDuration(audioPath);
      console.log(`[FFmpeg] Audio duration: ${duration.toFixed(2)}s`);

      // For captions template, detect actual video dimensions
      let actualWidth = width || 1080;
      let actualHeight = height || 1920;
      if (keepOriginalSize) {
        await new Promise((resolve) => {
          ffmpeg.ffprobe(bgVideoPath, (err, metadata) => {
            if (!err && metadata?.streams) {
              const videoStream = metadata.streams.find(s => s.codec_type === 'video');
              if (videoStream) {
                actualWidth = videoStream.width || 1080;
                actualHeight = videoStream.height || 1920;
                console.log(`[FFmpeg] Detected video dimensions: ${actualWidth}x${actualHeight}`);
              }
            }
            resolve();
          });
        });
      }

      // Use real word timings from AssemblyAI if available, otherwise fall back to fake
      const timings = wordTimings && wordTimings.length > 0
        ? wordTimings
        : generateSubtitleTimings(script, duration);
      console.log(`[FFmpeg] Using ${wordTimings ? 'real' : 'fake'} word timings — ${timings.length} words`);

      // Build subtitle filter
      const subtitleFilter = timings.length > 0
        ? buildSubtitleFilter(timings, actualWidth, actualHeight, captionStyle, captionColor, captionFont, captionPosition)
        : null;

      // Base video filter
      const scaleFilter = keepOriginalSize
        ? `scale=trunc(iw/2)*2:trunc(ih/2)*2`
        : `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}`;

      // Watermark filter for free plan users
      const watermarkFilter = watermark
        ? `drawtext=text='Made with ClipForge':fontsize=44:fontcolor=white@0.4:x=20:y=20:fontfile='${FONT_MAP['arial']}'`
        : null;

      // Combine all filters
      const filters = [scaleFilter, subtitleFilter, watermarkFilter].filter(Boolean);
      const vf = filters.join(',');

      ffmpeg()
        .input(bgVideoPath)
        .inputOptions(['-stream_loop', '-1'])
        .input(audioPath)
        .outputOptions([
          '-map', '0:v:0',
          '-map', '1:a:0',
          '-vf', vf,
          '-c:v', 'libx264',
          '-preset', 'fast',
          '-crf', '23',
          '-c:a', 'aac',
          '-shortest',
          '-movflags', '+faststart',
          '-pix_fmt', 'yuv420p'
        ])
        .output(outputPath)
        .on('start', () => console.log('[FFmpeg] Started'))
        .on('progress', (p) => console.log(`[FFmpeg] Progress: ${Math.round(p.percent || 0)}%`))
        .on('end', () => {
          console.log('[FFmpeg] ✅ Video composed successfully');
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error('[FFmpeg] ❌ Error:', err.message);
          reject(new Error(`FFmpeg error: ${err.message}`));
        })
        .run();

    } catch (err) {
      reject(err);
    }
  });
};

const mergeAudioFiles = async (audioParts, outputPath) => {
  return new Promise((resolve, reject) => {
    const listFile = outputPath + '_list.txt';
    const fileList = audioParts.map(p => `file '${p.replace(/\\/g, '/')}'`).join('\n');
    fs.writeFileSync(listFile, fileList);

    ffmpeg()
      .input(listFile)
      .inputOptions(['-f', 'concat', '-safe', '0'])
      .outputOptions(['-c', 'copy'])
      .output(outputPath)
      .on('start', () => console.log('[FFmpeg] Merging audio parts...'))
      .on('end', () => {
        fs.unlinkSync(listFile);
        console.log('[FFmpeg] ✅ Audio merged');
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('[FFmpeg] ❌ Merge error:', err.message);
        reject(new Error(`FFmpeg merge error: ${err.message}`));
      })
      .run();
  });
};

module.exports = { composeVideo, mergeAudioFiles };