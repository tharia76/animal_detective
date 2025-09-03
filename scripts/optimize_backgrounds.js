const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function optimizeBackgrounds() {
  console.log('🖼️  Optimizing background images for faster loading...\n');
  
  const results = { processed: 0, failed: 0, totalSaved: 0 };
  
  // Define background images to optimize
  const backgroundImages = [
    // Level backgrounds
    { path: './src/assets/images/level-backgrounds/farm.png', maxSize: 1024, quality: 85 },
    { path: './src/assets/images/level-backgrounds/forest.png', maxSize: 1024, quality: 85 },
    { path: './src/assets/images/level-backgrounds/ocean.png', maxSize: 1024, quality: 85 },
    { path: './src/assets/images/level-backgrounds/desert.png', maxSize: 1024, quality: 85 },
    { path: './src/assets/images/level-backgrounds/arctic.png', maxSize: 1024, quality: 85 },
    { path: './src/assets/images/level-backgrounds/jungle.png', maxSize: 1024, quality: 85 },
    { path: './src/assets/images/level-backgrounds/savannah.png', maxSize: 1024, quality: 85 },
    { path: './src/assets/images/level-backgrounds/birds.png', maxSize: 1024, quality: 85 },
    { path: './src/assets/images/level-backgrounds/insect.png', maxSize: 1024, quality: 85 },
    
    // Menu and UI backgrounds
    { path: './src/assets/images/menu-screen.png', maxSize: 1200, quality: 90 },
    { path: './src/assets/images/congrats-bg.png', maxSize: 800, quality: 85 },
    { path: './src/assets/images/congrats.png', maxSize: 600, quality: 90 },
  ];
  
  for (const bgImage of backgroundImages) {
    try {
      const originalPath = bgImage.path;
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
      if (originalStats.size < 50000) { // 50KB
        console.log(`⏭️  Skipping ${path.basename(originalPath)} - already very small (${formatBytes(originalStats.size)})`);
        continue;
      }
      
      // Get image metadata
      const metadata = await sharp(originalPath).metadata();
      
      // Calculate optimal dimensions (maintain aspect ratio)
      let { width, height } = metadata;
      const maxDimension = Math.max(width, height);
      
      if (maxDimension > bgImage.maxSize) {
        const scale = bgImage.maxSize / maxDimension;
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      
      // Optimize the background image
      await sharp(originalPath)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .png({ 
          quality: bgImage.quality,
          compressionLevel: 8, // Good compression
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
      console.error(`❌ Failed to process ${path.basename(bgImage.path)}:`, error.message);
      results.failed++;
      
      // Clean up temp file if it exists
      try {
        await fs.unlink(bgImage.path + '.tmp');
      } catch (e) {}
    }
  }
  
  console.log('\n📊 Background Optimization Results:');
  console.log(`✅ Optimized: ${results.processed} backgrounds`);
  console.log(`❌ Failed: ${results.failed} backgrounds`);
  console.log(`💾 Total saved: ${formatBytes(results.totalSaved)}`);
  console.log('\n🚀 Backgrounds should now load much faster!');
  console.log('\n💡 Optimizations applied:');
  console.log('   • Level backgrounds: Max 1024px, 85% quality');
  console.log('   • Menu screen: Max 1200px, 90% quality');
  console.log('   • UI elements: Optimized for fast loading');
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Run the optimization
optimizeBackgrounds().catch(console.error);
