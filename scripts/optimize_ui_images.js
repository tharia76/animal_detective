const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function optimizeUIImages() {
  console.log('🎨 Optimizing UI images for faster loading...\n');
  
  const results = { processed: 0, failed: 0, totalSaved: 0 };
  
  // Define UI images to optimize
  const uiImages = [
    { path: './src/assets/images/discovered_number.png', maxSize: 400, quality: 90 },
    { path: './src/assets/images/icon.png', maxSize: 512, quality: 95 },
    { path: './src/assets/images/game-logo.png', maxSize: 300, quality: 90 },
    { path: './src/assets/images/mission-completed.png', maxSize: 300, quality: 90 },
    { path: './src/assets/images/settings.png', maxSize: 200, quality: 90 },
    { path: './src/assets/images/tap.png', maxSize: 150, quality: 90 },
  ];
  
  for (const uiImage of uiImages) {
    try {
      const originalPath = uiImage.path;
      const tempPath = originalPath + '.tmp';
      
      // Check if file exists
      try {
        await fs.access(originalPath);
      } catch (error) {
        console.log(`⏭️  Skipping ${path.basename(originalPath)} - file not found`);
        continue;
      }
      
      // Get original file stats
      const originalStats = await fs.stat(originalPath);
      
      // Skip if already very small
      if (originalStats.size < 30000) { // 30KB
        console.log(`⏭️  Skipping ${path.basename(originalPath)} - already very small (${formatBytes(originalStats.size)})`);
        continue;
      }
      
      // Get image metadata
      const metadata = await sharp(originalPath).metadata();
      
      // Calculate optimal dimensions (maintain aspect ratio)
      let { width, height } = metadata;
      const maxDimension = Math.max(width, height);
      
      if (maxDimension > uiImage.maxSize) {
        const scale = uiImage.maxSize / maxDimension;
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      
      // Optimize the UI image
      await sharp(originalPath)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .png({ 
          quality: uiImage.quality,
          compressionLevel: 8,
          adaptiveFiltering: true,
          force: true 
        })
        .toFile(tempPath);
      
      const newStats = await fs.stat(tempPath);
      const savedBytes = originalStats.size - newStats.size;
      const savedPercent = Math.round((savedBytes / originalStats.size) * 100);
      
      // Only replace if we saved significant space
      if (savedPercent > 5) {
        await fs.rename(tempPath, originalPath);
        console.log(`✅ ${path.basename(originalPath)}: ${formatBytes(originalStats.size)} → ${formatBytes(newStats.size)} (saved ${savedPercent}%)`);
        results.processed++;
        results.totalSaved += savedBytes;
      } else {
        // Keep original if no significant improvement
        await fs.unlink(tempPath);
        console.log(`⏭️  ${path.basename(originalPath)}: Already well optimized`);
      }
      
    } catch (error) {
      console.error(`❌ Failed to process ${path.basename(uiImage.path)}:`, error.message);
      results.failed++;
      
      // Clean up temp file if it exists
      try {
        await fs.unlink(uiImage.path + '.tmp');
      } catch (e) {}
    }
  }
  
  console.log('\n📊 UI Image Optimization Results:');
  console.log(`✅ Optimized: ${results.processed} UI images`);
  console.log(`❌ Failed: ${results.failed} UI images`);
  console.log(`💾 Total saved: ${formatBytes(results.totalSaved)}`);
  console.log('\n🚀 UI images should now load much faster!');
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Run the optimization
optimizeUIImages().catch(console.error);
