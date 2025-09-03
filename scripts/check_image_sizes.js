const fs = require('fs');
const path = require('path');

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function checkImageSizes(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  const images = [];
  
  files.forEach(file => {
    if (file.isDirectory()) {
      images.push(...checkImageSizes(path.join(dir, file.name)));
    } else if (file.name.match(/\.(png|jpg|jpeg)$/i)) {
      const filePath = path.join(dir, file.name);
      const stats = fs.statSync(filePath);
      images.push({
        path: filePath.replace(process.cwd() + '/', ''),
        size: stats.size,
        sizeFormatted: formatBytes(stats.size)
      });
    }
  });
  
  return images;
}

// Check all images
const allImages = checkImageSizes('./src/assets/images');

// Sort by size descending
allImages.sort((a, b) => b.size - a.size);

console.log('\n🖼️  IMAGE SIZE REPORT\n');
console.log('Images larger than 500KB (need optimization):');
console.log('================================================\n');

let problemCount = 0;
allImages.forEach(img => {
  if (img.size > 500000) { // 500KB
    console.log(`❌ ${img.sizeFormatted.padEnd(10)} ${img.path}`);
    problemCount++;
  }
});

console.log(`\n\nTotal problematic images: ${problemCount}`);
console.log('\nRecommendations:');
console.log('- Level backgrounds should be max 300-500KB');
console.log('- Animal sprites should be max 50-100KB');
console.log('- Use tools like TinyPNG or ImageOptim to compress');
console.log('- Consider using WebP format for better compression');
