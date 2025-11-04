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
      const adapterStatuses = await MobileAds().initialize();
      this.isInitialized = true;
      console.log('📱 AdMob initialized');
      console.log('Adapter statuses:', adapterStatuses);
    } catch (error) {
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

