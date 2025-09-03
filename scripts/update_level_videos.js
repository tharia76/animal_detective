const fs = require('fs');
const path = require('path');

// Define level screens and their corresponding video files
const levelScreens = [
  { file: 'Forest.tsx', video: 'forest.mp4', color: '#1a4a1a' },
  { file: 'Ocean.tsx', video: 'water.mp4', color: '#1a4a6b' },
  { file: 'Desert.tsx', video: 'desert-vid.mp4', color: '#8b6914' },
  { file: 'Arctic.tsx', video: 'arctic-vid.mp4', color: '#4a6b8b' },
  { file: 'Savannah.tsx', video: 'savan-vid.mp4', color: '#8b6b14' },
  { file: 'Jungle.tsx', video: 'jungless.mp4', color: '#2d5016' },
  { file: 'Birds.tsx', video: 'birds-vid.mp4', color: '#87ceeb' },
  { file: 'Insects.tsx', video: 'insects-vid.mp4', color: '#4a5d23' },
];

function updateLevelScreen(screenInfo) {
  const filePath = path.join(__dirname, '../screens/levels', screenInfo.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${screenInfo.file}`);
    return false;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already updated
    if (content.includes('RobustVideoPlayer')) {
      console.log(`⏭️  ${screenInfo.file} - Already updated`);
      return true;
    }

    console.log(`🔄 Updating ${screenInfo.file}...`);

    // Add RobustVideoPlayer import
    if (!content.includes("import RobustVideoPlayer")) {
      content = content.replace(
        "import { Ionicons } from '@expo/vector-icons';",
        "import { Ionicons } from '@expo/vector-icons';\nimport RobustVideoPlayer from '../../src/components/RobustVideoPlayer';"
      );
    }

    // Replace VideoView with RobustVideoPlayer
    const videoViewRegex = /<VideoView\s+style={styles\.fullscreenVideo}\s+player={player}\s+allowsFullscreen={false}\s+allowsPictureInPicture={false}\s+nativeControls={false}\s+contentFit="fill"\s+pointerEvents="none"\s*\/>/;
    
    if (videoViewRegex.test(content)) {
      content = content.replace(
        videoViewRegex,
        `<RobustVideoPlayer
          source={require('../../src/assets/intro_videos/${screenInfo.video}')}
          style={styles.fullscreenVideo}
          loop={false}
          muted={false}
          autoPlay={true}
          contentFit="fill"
          fallbackColor="${screenInfo.color}"
          onLoad={() => console.log('✅ ${screenInfo.file.replace('.tsx', '')} video loaded')}
          onError={(error) => console.error('❌ ${screenInfo.file.replace('.tsx', '')} video error:', error)}
          onVideoEnd={() => {
            console.log('🏁 ${screenInfo.file.replace('.tsx', '')} video ended');
            setShowVideo(false);
            setGameStarted(true);
          }}
        />`
      );
    }

    // Remove old video player setup
    const videoPlayerRegex = /\/\/ Video player setup[\s\S]*?player\.volume = getGlobalVolume\(\).*?\n\s*\}\);\n/;
    if (videoPlayerRegex.test(content)) {
      content = content.replace(
        videoPlayerRegex,
        '  // Video handling is now managed by RobustVideoPlayer\n'
      );
    }

    // Remove old video end detection logic
    const videoEndRegex = /\/\/ Listen for video end[\s\S]*?return \(\) => \{[\s\S]*?\};\n\s*\}, \[player, showVideo\]\);\n/;
    if (videoEndRegex.test(content)) {
      content = content.replace(
        videoEndRegex,
        '  // Video end handling is now managed by RobustVideoPlayer\'s onVideoEnd callback\n'
      );
    }

    // Write updated content
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${screenInfo.file} - Successfully updated`);
    return true;

  } catch (error) {
    console.error(`❌ Error updating ${screenInfo.file}:`, error.message);
    return false;
  }
}

function updateAllLevelScreens() {
  console.log('🎬 UPDATING LEVEL SCREENS TO USE ROBUSTVIDEOPLAYERR\n');
  
  let successCount = 0;
  let failCount = 0;

  levelScreens.forEach(screenInfo => {
    if (updateLevelScreen(screenInfo)) {
      successCount++;
    } else {
      failCount++;
    }
  });

  console.log('\n📊 UPDATE RESULTS:');
  console.log('==================');
  console.log(`✅ Successfully updated: ${successCount}/${levelScreens.length}`);
  console.log(`❌ Failed to update: ${failCount}/${levelScreens.length}`);

  if (successCount === levelScreens.length) {
    console.log('\n🎉 ALL LEVEL SCREENS UPDATED!');
    console.log('   All video intros now use RobustVideoPlayer for:');
    console.log('   • Automatic retry on failure');
    console.log('   • Graceful error handling');
    console.log('   • Skip video fallback option');
    console.log('   • Better loading indicators');
  }
}

updateAllLevelScreens();
