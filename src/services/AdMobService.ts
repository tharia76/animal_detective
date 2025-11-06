// Try to import AdMob, fallback gracefully if not available
let MobileAds: any = null;
let admobAvailable = false;

try {
  MobileAds = require('react-native-google-mobile-ads').MobileAds;
  admobAvailable = true;
} catch (error) {
  console.warn('AdMob native module not available - native module may not be linked');
  admobAvailable = false;
}

/**
 * AdMob Service for Animal Detective
 * Manages AdMob initialization and provides utility functions
 * Gracefully handles cases where AdMob native module is not linked
 */
class AdMobService {
  private isInitialized = false;

  /**
   * Initialize AdMob SDK
   */
  async initialize() {
    if (this.isInitialized) return;
    
    if (!admobAvailable || !MobileAds) {
      console.warn('⚠️ AdMob native module not available. Skipping initialization.');
      console.warn('💡 To enable AdMob: run "cd ios && pod install" and rebuild the app.');
      return;
    }
    
    try {
      // Check if App ID is configured properly before initializing
      // The SDK will crash if App ID is not valid (e.g., "YOUR_ADMOB_APP_ID")
      const adapterStatuses = await MobileAds().initialize();
      this.isInitialized = true;
      console.log('📱 AdMob initialized');
      console.log('Adapter statuses:', adapterStatuses);
    } catch (error: any) {
      // Check if error is related to missing/invalid App ID
      const errorMessage = error?.message || error?.toString() || '';
      if (errorMessage.includes('application ID') || errorMessage.includes('GADApplicationIdentifier')) {
        console.warn('⚠️ AdMob App ID not configured. Skipping AdMob initialization.');
        console.warn('💡 To fix: Update Info.plist (iOS) and AndroidManifest.xml (Android) with a valid AdMob App ID.');
        console.warn('💡 For testing, use: ca-app-pub-3940256099942544~1458002511');
        return; // Don't mark as initialized, but don't crash
      }
      
      console.warn('AdMob initialization error:', error);
      console.warn('💡 Ensure AdMob is properly configured and native modules are linked.');
    }
  }

  /**
   * Set request configuration (for GDPR, CCPA compliance, etc.)
   */
  async setRequestConfiguration(config: {
    maxAdContentRating?: 'G' | 'PG' | 'T' | 'MA';
    tagForChildDirectedTreatment?: boolean;
    tagForUnderAgeOfConsent?: boolean;
  }) {
    if (!admobAvailable || !MobileAds || !this.isInitialized) return;
    
    try {
      await MobileAds().setRequestConfiguration(config);
      console.log('📱 AdMob request configuration set');
    } catch (error) {
      console.warn('AdMob configuration error:', error);
    }
  }

  /**
   * Check if AdMob is initialized
   */
  getIsInitialized(): boolean {
    return this.isInitialized && admobAvailable;
  }

  /**
   * Check if AdMob is available
   */
  isAvailable(): boolean {
    return admobAvailable && MobileAds !== null;
  }
}

export default new AdMobService();

