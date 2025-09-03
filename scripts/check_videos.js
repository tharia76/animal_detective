const fs = require('fs');
const path = require('path');

const videosDir = path.join(__dirname, '../src/assets/intro_videos');

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function checkVideos() {
  console.log('🎬 VIDEO ANALYSIS REPORT\n');
  
  if (!fs.existsSync(videosDir)) {
    console.error('❌ Videos directory not found:', videosDir);
    return;
  }

  const files = fs.readdirSync(videosDir);
  const videoFiles = files.filter(file => file.match(/\.(mp4|mov|avi|mkv)$/i));
  
  if (videoFiles.length === 0) {
    console.log('❌ No video files found in', videosDir);
    return;
  }

  console.log('📊 Video Files Found:');
  console.log('=====================\n');
  
  let totalSize = 0;
  let largeVideos = [];
  
  videoFiles.forEach(file => {
    const filePath = path.join(videosDir, file);
    const stats = fs.statSync(filePath);
    const sizeInMB = stats.size / (1024 * 1024);
    
    totalSize += stats.size;
    
    console.log(`📹 ${file}:`);
    console.log(`   Size: ${formatBytes(stats.size)} (${sizeInMB.toFixed(2)} MB)`);
    
    if (sizeInMB > 3) {
      largeVideos.push({ file, size: stats.size, sizeMB: sizeInMB });
      console.log(`   ⚠️  Large file - consider optimization`);
    } else if (sizeInMB > 1) {
      console.log(`   ⚡ Medium size - good for mobile`);
    } else {
      console.log(`   ✅ Optimal size for mobile`);
    }
    console.log('');
  });
  
  console.log('📈 SUMMARY:');
  console.log('===========');
  console.log(`Total videos: ${videoFiles.length}`);
  console.log(`Total size: ${formatBytes(totalSize)} (${(totalSize / (1024 * 1024)).toFixed(2)} MB)`);
  console.log(`Large videos (>3MB): ${largeVideos.length}`);
  
  if (largeVideos.length > 0) {
    console.log('\n🎯 OPTIMIZATION RECOMMENDATIONS:');
    console.log('=================================');
    largeVideos.forEach(video => {
      console.log(`📹 ${video.file} (${video.sizeMB.toFixed(2)} MB):`);
      console.log(`   • Reduce resolution to 720p or lower`);
      console.log(`   • Lower bitrate to 1-2 Mbps`);
      console.log(`   • Use H.264 codec for better compression`);
      console.log(`   • Target size: 1-2 MB for intro videos`);
    });
    
    console.log('\n🛠️  OPTIMIZATION TOOLS:');
    console.log('   • FFmpeg: ffmpeg -i input.mp4 -vf scale=1280:720 -b:v 1M output.mp4');
    console.log('   • HandBrake (GUI): https://handbrake.fr/');
    console.log('   • Online tools: CloudConvert, Clipchamp');
  } else {
    console.log('\n✅ All videos are well optimized for mobile!');
  }
  
  console.log('\n🎬 VIDEO LOADING TIPS:');
  console.log('======================');
  console.log('• Videos should be included in assetBundlePatterns');
  console.log('• Use expo-video for better performance');
  console.log('• Preload critical videos during splash screen');
  console.log('• Add error handling for video loading failures');
  console.log('• Consider progressive loading for large videos');
}

checkVideos();
