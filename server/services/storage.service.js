require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const uploadVideo = async (filePath, projectId) => {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = `video_${projectId}.mp4`;

    console.log(`[Storage] Uploading ${fileName} to Supabase...`);

    const { data, error } = await supabase.storage
      .from('videos')
      .upload(fileName, fileBuffer, {
        contentType: 'video/mp4',
        upsert: true
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('videos')
      .getPublicUrl(fileName);

    console.log(`[Storage] ✅ Uploaded: ${urlData.publicUrl}`);
    return urlData.publicUrl;
  } catch (err) {
    console.error(`[Storage] ❌ Upload failed:`, err.message);
    throw err;
  }
};

module.exports = { uploadVideo };