#!/usr/bin/env node

/**
 * Video Quality Improvement Script
 * 
 * This script helps improve video quality by re-encoding videos with better settings.
 * Current videos are 640x360 with low bitrate (~400-500kbps).
 * 
 * Recommended improvements:
 * - Resolution: 1280x720 (HD) or 1920x1080 (Full HD)
 * - Bitrate: 2000-4000 kbps for much better quality
 * - Profile: High profile H.264 for better compression efficiency
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const VIDEO_DIR = path.join(__dirname, '../src/assets/intro_videos');
const BACKUP_DIR = path.join(VIDEO_DIR, 'low_quality_backup');
const OUTPUT_DIR = path.join(VIDEO_DIR, 'high_quality_output');

// Create directories
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Video quality presets
const QUALITY_PRESETS = {
  'hd': {
    resolution: '1280x720',
    bitrate: '2500k',
    description: 'HD Quality (1280x720, 2.5Mbps)'
  },
  'fhd': {
    resolution: '1920x1080', 
    bitrate: '4000k',
    description: 'Full HD Quality (1920x1080, 4Mbps)'
  },
  'improved_sd': {
    resolution: '960x540',
    bitrate: '1500k', 
    description: 'Improved SD Quality (960x540, 1.5Mbps)'
  }
};

function checkFFmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    console.error('❌ FFmpeg not found. Please install FFmpeg first:');
    console.error('   macOS: brew install ffmpeg');
    console.error('   Ubuntu: sudo apt install ffmpeg');
    console.error('   Windows: Download from https://ffmpeg.org/download.html');
    return false;
  }
}

function analyzeCurrentVideos() {
  console.log('🔍 Analyzing current video quality...\n');
  
  const videoFiles = fs.readdirSync(VIDEO_DIR)
    .filter(file => file.endsWith('.mp4'))
    .filter(file => !file.includes('backup') && !file.includes('output'));
  
  videoFiles.forEach(file => {
    const filePath = path.join(VIDEO_DIR, file);
    try {
      const probe = execSync(`ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`, { encoding: 'utf8' });
      const data = JSON.parse(probe);
      const videoStream = data.streams.find(s => s.codec_type === 'video');
      
      if (videoStream) {
        const sizeKB = Math.round(fs.statSync(filePath).size / 1024);
        console.log(`📹 ${file}:`);
        console.log(`   Resolution: ${videoStream.width}x${videoStream.height}`);
        console.log(`   Bitrate: ${Math.round(videoStream.bit_rate / 1000)}kbps`);
        console.log(`   Duration: ${parseFloat(data.format.duration).toFixed(1)}s`);
        console.log(`   File size: ${sizeKB}KB`);
        console.log('');
      }
    } catch (error) {
      console.error(`❌ Error analyzing ${file}:`, error.message);
    }
  });
}

function improveVideoQuality(inputFile, preset = 'improved_sd') {
  const config = QUALITY_PRESETS[preset];
  const inputPath = path.join(VIDEO_DIR, inputFile);
  const outputPath = path.join(OUTPUT_DIR, inputFile);
  const backupPath = path.join(BACKUP_DIR, inputFile);
  
  console.log(`🎬 Improving ${inputFile} with ${config.description}...`);
  
  try {
    // Backup original
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(inputPath, backupPath);
      console.log(`   ✅ Backed up original to ${path.relative(process.cwd(), backupPath)}`);
    }
    
    // Re-encode with better quality
    const ffmpegCmd = [
      'ffmpeg',
      '-i', `"${inputPath}"`,
      '-c:v libx264',
      '-profile:v high',
      '-level 4.0',
      '-pix_fmt yuv420p',
      '-s', config.resolution,
      '-b:v', config.bitrate,
      '-maxrate', `${parseInt(config.bitrate) * 1.2}k`,
      '-bufsize', `${parseInt(config.bitrate) * 2}k`,
      '-preset medium',
      '-crf 18',
      '-movflags +faststart',
      '-y',
      `"${outputPath}"`
    ].join(' ');
    
    console.log(`   🔄 Encoding...`);
    execSync(ffmpegCmd, { stdio: 'pipe' });
    
    // Compare file sizes
    const originalSize = Math.round(fs.statSync(inputPath).size / 1024);
    const newSize = Math.round(fs.statSync(outputPath).size / 1024);
    
    console.log(`   ✅ Complete! ${originalSize}KB → ${newSize}KB (${((newSize/originalSize - 1) * 100).toFixed(0)}% change)`);
    
    return outputPath;
    
  } catch (error) {
    console.error(`   ❌ Error improving ${inputFile}:`, error.message);
    return null;
  }
}

function showUsageInstructions() {
  console.log('\n📋 USAGE INSTRUCTIONS:\n');
  console.log('1. Install FFmpeg if not already installed:');
  console.log('   macOS: brew install ffmpeg');
  console.log('   Ubuntu: sudo apt install ffmpeg\n');
  
  console.log('2. Run this script to improve video quality:');
  console.log('   node scripts/improve_video_quality.js\n');
  
  console.log('3. Quality presets available:');
  Object.entries(QUALITY_PRESETS).forEach(([key, config]) => {
    console.log(`   ${key}: ${config.description}`);
  });
  
  console.log('\n4. After encoding, replace original files with improved versions:');
  console.log('   - Check output in: src/assets/intro_videos/high_quality_output/');
  console.log('   - Originals backed up to: src/assets/intro_videos/low_quality_backup/');
  console.log('   - Copy improved files back to: src/assets/intro_videos/\n');
  
  console.log('💡 TIP: Start with "improved_sd" preset for good quality/size balance');
}

// Main execution
function main() {
  console.log('🎬 Video Quality Improvement Tool\n');
  
  if (!checkFFmpeg()) {
    showUsageInstructions();
    return;
  }
  
  analyzeCurrentVideos();
  
  const args = process.argv.slice(2);
  const preset = args[0] || 'improved_sd';
  
  if (!QUALITY_PRESETS[preset]) {
    console.error(`❌ Invalid preset: ${preset}`);
    console.log('Available presets:', Object.keys(QUALITY_PRESETS).join(', '));
    return;
  }
  
  console.log(`🚀 Starting quality improvement with "${preset}" preset...\n`);
  
  const videoFiles = fs.readdirSync(VIDEO_DIR)
    .filter(file => file.endsWith('.mp4'))
    .filter(file => !file.includes('backup') && !file.includes('output'));
  
  let successCount = 0;
  
  videoFiles.forEach(file => {
    const result = improveVideoQuality(file, preset);
    if (result) successCount++;
  });
  
  console.log(`\n🎉 Completed! Improved ${successCount}/${videoFiles.length} videos`);
  console.log(`📁 Check results in: ${path.relative(process.cwd(), OUTPUT_DIR)}`);
  
  if (successCount > 0) {
    console.log('\n📋 Next steps:');
    console.log('1. Test the improved videos in your app');
    console.log('2. If satisfied, copy them back to src/assets/intro_videos/');
    console.log('3. The originals are safely backed up in low_quality_backup/');
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  analyzeCurrentVideos,
  improveVideoQuality,
  QUALITY_PRESETS
};
