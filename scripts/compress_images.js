const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function compressImage(inputPath, outputPath, options = {}) {
  const ext = path.extname(inputPath).toLowerCase();
  
  try {
    const metadata = await sharp(inputPath).metadata();
    
    // Determine target dimensions based on file type
    let maxWidth, maxHeight, quality;
    
    if (inputPath.includes('level-backgrounds')) {
      // Level backgrounds - medium quality, reasonable size
      maxWidth = 1024;
      maxHeight = 768;
      quality = 85;
    } else if (inputPath.includes('animals/png')) {
      // Animal sprites - smaller size
      maxWidth = 512;
      maxHeight = 512;
      quality = 90;
    } else if (inputPath.includes('congrats') || inputPath.includes('mission')) {
      // UI elements - medium size
      maxWidth = 800;
      maxHeight = 800;
      quality = 90;
    } else {
      // Default - reasonable size
      maxWidth = 1024;
      maxHeight = 1024;
      quality = 85;
    }
    
    // Only resize if larger than target
    const shouldResize = metadata.width > maxWidth || metadata.height > maxHeight;
    
    let pipeline = sharp(inputPath);
    
    if (shouldResize) {
      pipeline = pipeline.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    if (ext === '.png') {
      await pipeline
        .png({ 
          quality: quality,
          compressionLevel: 9,
          adaptiveFiltering: true,
          force: true 
        })
        .toFile(outputPath);
    } else if (ext === '.jpg' || ext === '.jpeg') {
      await pipeline
        .jpeg({ 
          quality: quality,
          progressive: true,
          force: true 
        })
        .toFile(outputPath);
    }
    
    return { success: true, inputPath, outputPath };
  } catch (error) {
    console.error(`Error compressing ${inputPath}:`, error.message);
    return { success: false, inputPath, error: error.message };
  }
}

async function compressAllImages() {
  console.log('🎯 Starting image compression...\n');
  
  const imageDir = './src/assets/images';
  const backupDir = './src/assets/images_backup';
  const results = { compressed: 0, failed: 0, totalSaved: 0 };
  
  // Create backup directory
  try {
    await fs.mkdir(backupDir, { recursive: true });
  } catch (e) {
    console.error('Failed to create backup directory');
    return;
  }
  
  async function processDirectory(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        await processDirectory(fullPath);
      } else if (entry.name.match(/\.(png|jpg|jpeg)$/i)) {
        const stats = await fs.stat(fullPath);
        
        // Skip if already small
        if (stats.size < 100000 && !fullPath.includes('level-backgrounds')) {
          continue;
        }
        
        // Create backup
        const backupPath = fullPath.replace('./src/assets/images', backupDir);
        const backupDirPath = path.dirname(backupPath);
        await fs.mkdir(backupDirPath, { recursive: true });
        await fs.copyFile(fullPath, backupPath);
        
        // Compress to temp file first
        const tempPath = fullPath + '.tmp';
        const result = await compressImage(fullPath, tempPath);
        
        if (result.success) {
          const newStats = await fs.stat(tempPath);
          const savedBytes = stats.size - newStats.size;
          const savedPercent = Math.round((savedBytes / stats.size) * 100);
          
          if (savedPercent > 5) { // Only replace if we saved more than 5%
            await fs.rename(tempPath, fullPath);
            console.log(`✅ ${entry.name}: ${formatBytes(stats.size)} → ${formatBytes(newStats.size)} (saved ${savedPercent}%)`);
            results.compressed++;
            results.totalSaved += savedBytes;
          } else {
            await fs.unlink(tempPath);
            console.log(`⏭️  ${entry.name}: Already optimized`);
          }
        } else {
          results.failed++;
          try {
            await fs.unlink(tempPath);
          } catch (e) {}
        }
      }
    }
  }
  
  await processDirectory(imageDir);
  
  console.log('\n📊 Compression Results:');
  console.log(`✅ Compressed: ${results.compressed} images`);
  console.log(`❌ Failed: ${results.failed} images`);
  console.log(`💾 Total saved: ${formatBytes(results.totalSaved)}`);
  console.log(`\n📁 Original images backed up to: ${backupDir}`);
  console.log('\n⚠️  If something went wrong, you can restore from the backup directory');
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Run compression
compressAllImages().catch(console.error);
