import React from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';

// Try to import AdMob components, fallback gracefully if not available
let BannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;
let admobAvailable = false;

try {
  const mobileAds = require('react-native-google-mobile-ads');
  BannerAd = mobileAds.BannerAd;
  BannerAdSize = mobileAds.BannerAdSize;
  TestIds = mobileAds.TestIds;
  admobAvailable = true;
} catch (error) {
  console.warn('AdMob components not available - native module may not be linked');
  admobAvailable = false;
}

interface AdMobBannerProps {
  /**
   * Ad Unit ID. Use TestIds.BANNER for testing.
   * Replace with your actual ad unit ID for production.
   */
  adUnitId?: string;
  
  /**
   * Banner ad size. Defaults to BANNER.
   */
  size?: BannerAdSize;
  
  /**
   * Additional request options
   */
  requestOptions?: {
    requestNonPersonalizedAdsOnly?: boolean;
    keywords?: string[];
  };
  
  /**
   * Callback when ad is loaded
   */
  onAdLoaded?: () => void;
  
  /**
   * Callback when ad fails to load
   */
  onAdFailedToLoad?: (error: Error) => void;
  
  /**
   * Callback when ad is clicked
   */
  onAdClicked?: () => void;
  
  /**
   * Callback when ad is closed
   */
  onAdClosed?: () => void;
  
  /**
   * Callback when ad impression is recorded
   */
  onAdImpression?: () => void;
  
  /**
   * Custom styles for the banner container
   */
  style?: object;
}

/**
 * AdMob Banner Ad Component
 * 
 * Usage:
 * ```tsx
 * <AdMobBanner
 *   adUnitId="ca-app-pub-3940256099942544/6300978111"
 *   size={BannerAdSize.BANNER}
 *   onAdLoaded={() => console.log('Ad loaded')}
 * />
 * ```
 */
const AdMobBanner: React.FC<AdMobBannerProps> = ({
  adUnitId = TestIds?.BANNER || 'ca-app-pub-3940256099942544/6300978111', // Use test ID by default
  size = BannerAdSize?.BANNER || 'BANNER',
  requestOptions,
  onAdLoaded,
  onAdFailedToLoad,
  onAdClicked,
  onAdClosed,
  onAdImpression,
  style,
}) => {
  // If AdMob is not available, render a placeholder or nothing
  if (!admobAvailable || !BannerAd) {
    if (__DEV__) {
      return (
        <View style={[styles.container, style]}>
          <Text style={styles.placeholder}>
            AdMob not available{'\n'}
            Run "cd ios && pod install" to enable
          </Text>
        </View>
      );
    }
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={adUnitId}
        size={size}
        requestOptions={requestOptions}
        onAdLoaded={onAdLoaded}
        onAdFailedToLoad={onAdFailedToLoad}
        onAdClicked={onAdClicked}
        onAdClosed={onAdClosed}
        onAdImpression={onAdImpression}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  placeholder: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    padding: 8,
  },
});

export default AdMobBanner;

