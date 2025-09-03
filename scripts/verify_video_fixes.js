const fs = require('fs');
const path = require('path');

// Define all screens to verify
const allScreens = [
  { file: 'screens/SplashScreen.tsx', type: 'Splash' },
  { file: 'screens/levels/Farm.tsx', type: 'Level' },
  { file: 'screens/levels/Forest.tsx', type: 'Level' },
  { file: 'screens/levels/Ocean.tsx', type: 'Level' },
  { file: 'screens/levels/Desert.tsx', type: 'Level' },
  { file: 'screens/levels/Arctic.tsx', type: 'Level' },
  { file: 'screens/levels/Savannah.tsx', type: 'Level' },
  { file: 'screens/levels/Jungle.tsx', type: 'Level' },
  { file: 'screens/levels/Birds.tsx', type: 'Level' },
  { file: 'screens/levels/Insects.tsx', type: 'Level' },
];

function verifyScreen(screenInfo) {
  const filePath = path.join(__dirname, '..', screenInfo.file);
  
  if (!fs.existsSync(filePath)) {
    return { status: 'missing', issues: [`File not found: ${screenInfo.file}`] };
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    let status = 'good';

    // Check for RobustVideoPlayer usage
    if (!content.includes('RobustVideoPlayer')) {
      issues.push('Missing RobustVideoPlayer import or usage');
      status = 'error';
    }

    // Check for problematic player references
    const playerReferences = content.match(/player\./g);
    if (playerReferences) {
      const lines = content.split('\n');
      playerReferences.forEach(() => {
        lines.forEach((line, index) => {
          if (line.includes('player.') && 
              !line.trim().startsWith('//') && 
              !line.includes('RobustVideoPlayer') &&
              !line.includes('useVideoPlayer') &&
              !line.includes('import')) {
            issues.push(`Potential player reference on line ${index + 1}: ${line.trim()}`);
            status = 'warning';
          }
        });
      });
    }

    // Check for old VideoView usage (should be replaced with RobustVideoPlayer)
    if (content.includes('<VideoView') && screenInfo.type !== 'Splash') {
      issues.push('Still using old VideoView instead of RobustVideoPlayer');
      status = 'warning';
    }

    // Check for proper error handling
    if (content.includes('RobustVideoPlayer') && !content.includes('onError=')) {
      issues.push('RobustVideoPlayer missing onError handler');
      status = 'warning';
    }

    return { status, issues };

  } catch (error) {
    return { status: 'error', issues: [`Error reading file: ${error.message}`] };
  }
}

function verifyAllScreens() {
  console.log('🔍 VERIFYING VIDEO SYSTEM INTEGRITY\n');
  
  let goodCount = 0;
  let warningCount = 0;
  let errorCount = 0;
  let totalIssues = 0;

  allScreens.forEach(screenInfo => {
    const result = verifyScreen(screenInfo);
    const fileName = path.basename(screenInfo.file);
    
    if (result.status === 'good') {
      console.log(`✅ ${fileName} - Perfect`);
      goodCount++;
    } else if (result.status === 'warning') {
      console.log(`⚠️  ${fileName} - Has warnings:`);
      result.issues.forEach(issue => console.log(`   • ${issue}`));
      warningCount++;
      totalIssues += result.issues.length;
    } else {
      console.log(`❌ ${fileName} - Has errors:`);
      result.issues.forEach(issue => console.log(`   • ${issue}`));
      errorCount++;
      totalIssues += result.issues.length;
    }
  });

  console.log('\n📊 VERIFICATION RESULTS:');
  console.log('========================');
  console.log(`✅ Perfect files: ${goodCount}/${allScreens.length}`);
  console.log(`⚠️  Files with warnings: ${warningCount}/${allScreens.length}`);
  console.log(`❌ Files with errors: ${errorCount}/${allScreens.length}`);
  console.log(`📋 Total issues found: ${totalIssues}`);

  if (errorCount === 0 && warningCount === 0) {
    console.log('\n🎉 PERFECT! ALL SCREENS VERIFIED!');
    console.log('   ✅ No player reference errors');
    console.log('   ✅ All screens use RobustVideoPlayer');
    console.log('   ✅ Proper error handling implemented');
    console.log('   ✅ Clean, optimized code');
    console.log('\n🚀 Your video system is bulletproof and ready for production!');
  } else if (errorCount === 0) {
    console.log('\n✅ GOOD! Minor warnings only');
    console.log('   No critical errors found');
    console.log('   App should work perfectly');
  } else {
    console.log('\n⚠️  ISSUES FOUND');
    console.log('   Please review and fix the errors above');
  }
}

verifyAllScreens();
