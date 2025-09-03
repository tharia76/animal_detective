const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function improveAnimalQuality() {
  console.log('🎨 Improving animal image quality...\n');
  
  const animalDir = './src/assets/images/animals/png';
  const results = { processed: 0, failed: 0 };
  
  try {
    const animalFiles = await fs.readdir(animalDir);
    
    for (const file of animalFiles) {
      if (!file.match(/\.(png|jpg|jpeg)$/i)) continue;
      
      const originalPath = path.join(animalDir, file);
      const tempPath = originalPath + '.tmp';
      
      try {
        // Get original file stats
        const originalStats = await fs.stat(originalPath);
        
        // Skip if file is already large enough (likely good quality)
        if (originalStats.size > 200000) { // 200KB
          console.log(`⏭️  Skipping ${file} - already good size (${formatBytes(originalStats.size)})`);
          continue;
        }
        
        // Reprocess with much better quality settings
        await sharp(originalPath)
          .resize(512, 512, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .png({ 
            quality: 100,        // Maximum quality
            compressionLevel: 3, // Minimal compression
            adaptiveFiltering: true,
            force: true 
          })
          .toFile(tempPath);
        
        const newStats = await fs.stat(tempPath);
        
        // Only replace if the new version is significantly larger (better quality)
        if (newStats.size > originalStats.size * 1.5) {
          await fs.rename(tempPath, originalPath);
          console.log(`✅ ${file}: ${formatBytes(originalStats.size)} → ${formatBytes(newStats.size)} (improved quality)`);
          results.processed++;
        } else {
          // Remove temp file and keep original
          await fs.unlink(tempPath);
          console.log(`⏭️  ${file}: No significant improvement possible`);
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
    
    console.log('\n📊 Animal Quality Improvement Results:');
    console.log(`✅ Improved: ${results.processed} animals`);
    console.log(`❌ Failed: ${results.failed} animals`);
    console.log('\n🎨 Animals should now look much better!');
    console.log('\n💡 Tip: If quality is still poor, you may need to replace with higher resolution source images.');
    
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

// Run the improvement
improveAnimalQuality().catch(console.error);
