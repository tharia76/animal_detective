import React, { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

// Try to import AdMob components, fallback gracefully if not available
let InterstitialAd: any = null;
let AdEventType: any = null;
let TestIds: any = null;
let admobAvailable = false;

try {
  const mobileAds = require('react-native-google-mobile-ads');
  InterstitialAd = mobileAds.InterstitialAd;
  AdEventType = mobileAds.AdEventType;
  TestIds = mobileAds.TestIds;
  admobAvailable = true;
} catch (error) {
  console.warn('AdMob Interstitial components not available - native module may not be linked');
  admobAvailable = false;
}

interface AdMobInterstitialProps {
  /**
   * Ad Unit ID. Use TestIds.INTERSTITIAL for testing.
   * Replace with your actual Families-certified ad unit ID for production.
   */
  adUnitId?: string;
  
  /**
   * Callback when ad is loaded and ready to show
   */
  onAdLoaded?: () => void;
  
  /**
   * Callback when ad fails to load
   */
  onAdFailedToLoad?: (error: Error) => void;
  
  /**
   * Callback when ad is shown
   */
  onAdShown?: () => void;
  
  /**
   * Callback when ad is closed
   */
  onAdClosed?: () => void;
  
  /**
   * Callback when ad is clicked
   */
  onAdClicked?: () => void;
  
  /**
   * Auto-load ad when component mounts
   * Default: true
   */
  autoLoad?: boolean;
}

/**
 * AdMob Interstitial Ad Component
 * 
 * IMPORTANT: Follow Families policy guidelines:
 * - Never show interstitials on app launch
 * - Only show on natural breaks (e.g., end of level)
 * - Space interstitials (e.g., max once per few minutes)
 * - No accidental clicks - ensure clear close buttons
 * 
 * Usage:
 * ```tsx
 * const interstitialRef = useRef<AdMobInterstitialRef>(null);
 * 
 * <AdMobInterstitial
 *   ref={interstitialRef}
 *   adUnitId="ca-app-pub-3940256099942544/1033173712"
 *   onAdLoaded={() => console.log('Interstitial loaded')}
 *   onAdClosed={() => console.log('Interstitial closed')}
 * />
 * 
 * // Later, show the ad:
 * interstitialRef.current?.show();
 * ```
 */
export interface AdMobInterstitialRef {
  /**
   * Load the interstitial ad
   */
  load: () => void;
  
  /**
   * Show the interstitial ad (only if loaded)
   */
  show: () => void;
  
  /**
   * Check if ad is loaded and ready to show
   */
  isLoaded: () => boolean;
}

const AdMobInterstitialComponent = React.forwardRef<AdMobInterstitialRef, AdMobInterstitialProps>(
  ({ 
    adUnitId = TestIds?.INTERSTITIAL || 'ca-app-pub-3940256099942544/1033173712',
    onAdLoaded,
    onAdFailedToLoad,
    onAdShown,
    onAdClosed,
    onAdClicked,
    autoLoad = true,
  }, ref) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const interstitialAdRef = useRef<any>(null);

    const loadAd = () => {
      if (!admobAvailable || !InterstitialAd) {
        console.warn('AdMob Interstitial not available');
        return;
      }

      try {
        // Create new interstitial ad instance
        interstitialAdRef.current = InterstitialAd.createForAdRequest(adUnitId, {
          requestNonPersonalizedAdsOnly: true, // Required for Families-certified apps
        });

        // Set up event listeners
        const unsubscribeLoaded = interstitialAdRef.current.addAdEventListener(
          AdEventType.LOADED,
          () => {
            setIsLoaded(true);
            console.log('📱 Interstitial ad loaded');
            onAdLoaded?.();
          }
        );

        const unsubscribeFailed = interstitialAdRef.current.addAdEventListener(
          AdEventType.ERROR,
          (error: any) => {
            setIsLoaded(false);
            console.warn('📱 Interstitial ad failed to load:', error);
            onAdFailedToLoad?.(error);
          }
        );

        const unsubscribeShown = interstitialAdRef.current.addAdEventListener(
          AdEventType.OPENED,
          () => {
            console.log('📱 Interstitial ad shown');
            onAdShown?.();
          }
        );

        const unsubscribeClosed = interstitialAdRef.current.addAdEventListener(
          AdEventType.CLOSED,
          () => {
            setIsLoaded(false);
            console.log('📱 Interstitial ad closed');
            onAdClosed?.();
            // Reload ad for next time
            loadAd();
          }
        );

        const unsubscribeClicked = interstitialAdRef.current.addAdEventListener(
          AdEventType.CLICKED,
          () => {
            console.log('📱 Interstitial ad clicked');
            onAdClicked?.();
          }
        );

        // Load the ad
        interstitialAdRef.current.load();

        // Cleanup function
        return () => {
          unsubscribeLoaded();
          unsubscribeFailed();
          unsubscribeShown();
          unsubscribeClosed();
          unsubscribeClicked();
        };
      } catch (error) {
        console.warn('Failed to create interstitial ad:', error);
        onAdFailedToLoad?.(error as Error);
      }
    };

    const showAd = () => {
      if (!isLoaded || !interstitialAdRef.current) {
        console.warn('Interstitial ad not loaded yet');
        return;
      }

      try {
        interstitialAdRef.current.show();
      } catch (error) {
        console.warn('Failed to show interstitial ad:', error);
      }
    };

    // Expose methods via ref
    React.useImperativeHandle(ref, () => ({
      load: loadAd,
      show: showAd,
      isLoaded: () => isLoaded,
    }));

    // Auto-load on mount if enabled
    useEffect(() => {
      if (autoLoad) {
        loadAd();
      }
    }, [adUnitId, autoLoad]);

    // Component doesn't render anything visible
    return null;
  }
);

AdMobInterstitialComponent.displayName = 'AdMobInterstitial';

export default AdMobInterstitialComponent;


