const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function recompressAnimals() {
  console.log('🎨 Fixing animal image quality...\n');
  
  const animalDir = './src/assets/images/animals/png';
  const backupDir = './src/assets/images_backup/animals/png';
  const results = { processed: 0, failed: 0, totalSaved: 0 };
  
  try {
    const animalFiles = await fs.readdir(animalDir);
    
    for (const file of animalFiles) {
      if (!file.match(/\.(png|jpg|jpeg)$/i)) continue;
      
      const originalPath = path.join(animalDir, file);
      const backupPath = path.join(backupDir, file);
      const tempPath = originalPath + '.tmp';
      
      try {
        // Check if backup exists
        const backupExists = await fs.access(backupPath).then(() => true).catch(() => false);
        if (!backupExists) {
          console.log(`⏭️  Skipping ${file} - no backup found`);
          continue;
        }
        
        // Get original file stats
        const originalStats = await fs.stat(originalPath);
        const backupStats = await fs.stat(backupPath);
        
        // Restore from backup with better quality settings
        await sharp(backupPath)
          .resize(512, 512, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .png({ 
            quality: 95,        // Much higher quality
            compressionLevel: 6, // Less aggressive compression
            adaptiveFiltering: true,
            force: true 
          })
          .toFile(tempPath);
        
        const newStats = await fs.stat(tempPath);
        const savedBytes = backupStats.size - newStats.size;
        const compressionRatio = Math.round((newStats.size / backupStats.size) * 100);
        
        // Replace original with new version
        await fs.rename(tempPath, originalPath);
        
        console.log(`✅ ${file}: ${formatBytes(backupStats.size)} → ${formatBytes(newStats.size)} (${compressionRatio}% of original)`);
        results.processed++;
        results.totalSaved += savedBytes;
        
      } catch (error) {
        console.error(`❌ Failed to process ${file}:`, error.message);
        results.failed++;
        
        // Clean up temp file if it exists
        try {
          await fs.unlink(tempPath);
        } catch (e) {}
      }
    }
    
    console.log('\n📊 Animal Quality Fix Results:');
    console.log(`✅ Processed: ${results.processed} animals`);
    console.log(`❌ Failed: ${results.failed} animals`);
    console.log(`💾 Total space used: ${formatBytes(-results.totalSaved)} (higher quality)`);
    console.log('\n🎨 Animals should now look much better!');
    
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

// Run the fix
recompressAnimals().catch(console.error);
