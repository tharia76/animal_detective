// Test Firebase Analytics Integration
import analytics from '@react-native-firebase/analytics';

export const testFirebase = async () => {
  try {
    console.log('🔥 Testing Firebase Analytics...');
    
    // Test basic event logging
    await analytics().logEvent('test_event', {
      test: true,
      timestamp: new Date().toISOString(),
      platform: 'test'
    });
    
    console.log('✅ Firebase Analytics is working!');
    return true;
  } catch (error) {
    console.error('❌ Firebase Analytics error:', error);
    return false;
  }
};

// Test app open tracking
export const testAppOpen = async () => {
  try {
    await analytics().logAppOpen();
    console.log('✅ App open tracked successfully!');
    return true;
  } catch (error) {
    console.error('❌ App open tracking error:', error);
    return false;
  }
};
