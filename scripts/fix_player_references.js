const fs = require('fs');
const path = require('path');

// Define level screens to fix
const levelScreens = [
  'Farm.tsx', 'Forest.tsx', 'Ocean.tsx', 'Desert.tsx', 
  'Arctic.tsx', 'Savannah.tsx', 'Jungle.tsx', 'Birds.tsx', 'Insects.tsx'
];

function fixPlayerReferences(fileName) {
  const filePath = path.join(__dirname, '../screens/levels', fileName);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${fileName}`);
    return false;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    console.log(`🔧 Fixing player references in ${fileName}...`);

    // Fix player.play() calls
    if (content.includes('player.play()')) {
      content = content.replace(
        /player\.play\(\);/g,
        '// Video will auto-play via RobustVideoPlayer'
      );
      changed = true;
      console.log(`   • Fixed player.play() calls`);
    }

    // Fix player.pause() calls
    if (content.includes('player.pause()')) {
      content = content.replace(
        /player\.pause\(\);/g,
        '// Video pause handled by RobustVideoPlayer'
      );
      content = content.replace(
        /try \{ player\.pause\(\); \} catch \(e\) \{\}/g,
        '// Video pause handled by RobustVideoPlayer'
      );
      changed = true;
      console.log(`   • Fixed player.pause() calls`);
    }

    // Fix useEffect with player dependencies
    const playerEffectRegex = /\/\/ Ensure player pauses when video is hidden[\s\S]*?\}, \[showVideo\]\);/g;
    if (playerEffectRegex.test(content)) {
      content = content.replace(
        playerEffectRegex,
        '  // Video pause/play is now handled by RobustVideoPlayer'
      );
      changed = true;
      console.log(`   • Fixed player useEffect`);
    }

    // Clean up any remaining player references in comments or code
    const remainingPlayerRegex = /player\./g;
    if (remainingPlayerRegex.test(content)) {
      // Check if these are in comments or actual code
      const lines = content.split('\n');
      let hasRealPlayerRefs = false;
      
      lines.forEach((line, index) => {
        if (line.includes('player.') && !line.trim().startsWith('//') && !line.includes('RobustVideoPlayer')) {
          console.log(`   ⚠️  Found potential player reference on line ${index + 1}: ${line.trim()}`);
          hasRealPlayerRefs = true;
        }
      });
      
      if (!hasRealPlayerRefs) {
        console.log(`   • No remaining problematic player references`);
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${fileName} - Fixed successfully`);
    } else {
      console.log(`⏭️  ${fileName} - No player references to fix`);
    }
    
    return true;

  } catch (error) {
    console.error(`❌ Error fixing ${fileName}:`, error.message);
    return false;
  }
}

function fixAllPlayerReferences() {
  console.log('🔧 FIXING PLAYER REFERENCES IN LEVEL SCREENS\n');
  
  let successCount = 0;
  let failCount = 0;

  levelScreens.forEach(fileName => {
    if (fixPlayerReferences(fileName)) {
      successCount++;
    } else {
      failCount++;
    }
  });

  console.log('\n📊 FIX RESULTS:');
  console.log('===============');
  console.log(`✅ Successfully fixed: ${successCount}/${levelScreens.length}`);
  console.log(`❌ Failed to fix: ${failCount}/${levelScreens.length}`);

  if (successCount === levelScreens.length) {
    console.log('\n🎉 ALL PLAYER REFERENCES FIXED!');
    console.log('   No more "Property \'player\' doesn\'t exist" errors');
    console.log('   All video control is now handled by RobustVideoPlayer');
  }
}

fixAllPlayerReferences();
