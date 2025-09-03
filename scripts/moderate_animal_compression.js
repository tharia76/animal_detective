const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function moderateAnimalCompression() {
  console.log('🎨 Applying moderate compression to maintain quality...\n');
  
  const animalDir = './src/assets/images/animals/png';
  const results = { processed: 0, failed: 0, totalSaved: 0 };
  
  try {
    const animalFiles = await fs.readdir(animalDir);
    
    for (const file of animalFiles) {
      if (!file.match(/\.(png|jpg|jpeg)$/i)) continue;
      
      const originalPath = path.join(animalDir, file);
      const tempPath = originalPath + '.tmp';
      
      try {
        // Get original file stats
        const originalStats = await fs.stat(originalPath);
        
        // Skip if file is already reasonably sized
        if (originalStats.size < 300000) { // 300KB
          console.log(`⏭️  Skipping ${file} - already good size (${formatBytes(originalStats.size)})`);
          continue;
        }
        
        // Apply moderate compression with good quality
        await sharp(originalPath)
          .resize(512, 512, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .png({ 
            quality: 90,        // High quality (was 85 before)
            compressionLevel: 6, // Moderate compression (was 9 before)
            adaptiveFiltering: true,
            force: true 
          })
          .toFile(tempPath);
        
        const newStats = await fs.stat(tempPath);
        const savedBytes = originalStats.size - newStats.size;
        const savedPercent = Math.round((savedBytes / originalStats.size) * 100);
        
        // Only replace if we saved significant space but kept good quality
        if (savedPercent > 10 && newStats.size > 150000) { // At least 150KB final size
          await fs.rename(tempPath, originalPath);
          console.log(`✅ ${file}: ${formatBytes(originalStats.size)} → ${formatBytes(newStats.size)} (saved ${savedPercent}%, kept quality)`);
          results.processed++;
          results.totalSaved += savedBytes;
        } else {
          // Keep original if compression is too aggressive
          await fs.unlink(tempPath);
          console.log(`⏭️  ${file}: Keeping original to maintain quality`);
        }
        
      } catch (error) {
        console.error(`❌ Failed to process ${file}:`, error.message);
        results.failed++;
        
        // Clean up temp file if it exists
        try {
          await fs.unlink(tempPath);
        } catch (e) {}
      }
    }
    
    console.log('\n📊 Moderate Compression Results:');
    console.log(`✅ Compressed: ${results.processed} animals`);
    console.log(`❌ Failed: ${results.failed} animals`);
    console.log(`💾 Total saved: ${formatBytes(results.totalSaved)}`);
    console.log('\n🎨 Animals should now have good quality AND reasonable file sizes!');
    
  } catch (error) {
    console.error('Error processing animals:', error);
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Run the moderate compression
moderateAnimalCompression().catch(console.error);
