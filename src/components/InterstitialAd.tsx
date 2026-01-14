import React, { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UNLOCK_ALL_LEVELS_KEY = 'unlocked_all_levels';
const REMOVE_ADS_SUBSCRIPTION_KEY = 'remove_ads_subscription';

// Try to import AdMob components, fallback gracefully if not available
let InterstitialAd: any = null;
let TestIds: any = null;
let MobileAds: any = null;
let admobAvailable = false;

try {
  const mobileAds = require('react-native-google-mobile-ads');
  InterstitialAd = mobileAds.InterstitialAd;
  TestIds = mobileAds.TestIds;
  MobileAds = mobileAds.MobileAds;
  admobAvailable = true;
  console.log('📱 AdMob module loaded successfully');
} catch (error) {
  console.warn('📱 AdMob InterstitialAd not available - native module may not be linked');
  console.warn('📱 Note: AdMob requires a development build (npx expo run:ios/android) - it will not work in Expo Go');
  admobAvailable = false;
}

interface InterstitialAdComponentProps {
  adUnitId?: string;
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: Error) => void;
  onAdDismissed?: () => void;
  onAdShown?: () => void;
  showOnMount?: boolean; // If true, show ad immediately when component mounts
}

/**
 * Interstitial Ad Component
 * Shows full-screen ads between content
 * Automatically hides if user has purchased unlock all levels or ad-free subscription
 */
const InterstitialAdComponent: React.FC<InterstitialAdComponentProps> = ({
  adUnitId = __DEV__ 
    ? (TestIds?.INTERSTITIAL || 'ca-app-pub-3940256099942544/1033173712')
    : 'ca-app-pub-3872152208332642/2154839631',
  onAdLoaded,
  onAdFailedToLoad,
  onAdDismissed,
  onAdShown,
  showOnMount = false,
}) => {
  const interstitialAdRef = useRef<any>(null);
  const [isAdFree, setIsAdFree] = React.useState<boolean>(false);
  const [isUnlocked, setIsUnlocked] = React.useState<boolean>(false);
  const [isChecking, setIsChecking] = React.useState<boolean>(true);
  const hasShownAdRef = useRef<boolean>(false);

  // Check if user has purchased unlock all or ad-free subscription
  useEffect(() => {
    const checkPurchaseStatus = async () => {
      try {
        const [unlocked, adFree] = await Promise.all([
          AsyncStorage.getItem(UNLOCK_ALL_LEVELS_KEY),
          AsyncStorage.getItem(REMOVE_ADS_SUBSCRIPTION_KEY),
        ]);
        
        setIsUnlocked(unlocked === 'true');
        setIsAdFree(adFree === 'true');
      } catch (error) {
        console.warn('Failed to check purchase status:', error);
      } finally {
        setIsChecking(false);
      }
    };
    checkPurchaseStatus();
  }, []);

  // Initialize AdMob and load interstitial ad
  useEffect(() => {
    // Don't load ad if user has purchased unlock all or ad-free subscription
    if (isAdFree || isUnlocked || isChecking) {
      console.log('📱 Interstitial ad skipped - isAdFree:', isAdFree, 'isUnlocked:', isUnlocked, 'isChecking:', isChecking);
      return;
    }

    // Don't load if AdMob is not available
    if (!admobAvailable || !InterstitialAd) {
      console.warn('📱 AdMob not available - admobAvailable:', admobAvailable, 'InterstitialAd:', !!InterstitialAd);
      console.warn('📱 ⚠️ AdMob requires a development build. Run: npx expo run:ios or npx expo run:android');
      return;
    }

    // Initialize AdMob if needed
    const initAdMob = async () => {
      try {
        if (MobileAds) {
          await MobileAds().initialize();
          console.log('📱 AdMob initialized');
        }
      } catch (error) {
        console.warn('📱 AdMob initialization error (may already be initialized):', error);
      }
    };

    initAdMob();

    console.log('📱 Creating interstitial ad with unit ID:', adUnitId);

    try {
      // Create interstitial ad instance
      const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: false,
      });

      // Set up event listeners
      const unsubscribeLoaded = interstitial.addAdEventListener('loaded', () => {
        console.log('📱 ✅ Interstitial ad loaded successfully');
        onAdLoaded?.();
        
        // If showOnMount is true and we haven't shown yet, show it now
        if (showOnMount && !hasShownAdRef.current) {
          setTimeout(async () => {
            try {
              const isLoaded = await interstitial.loaded();
              if (isLoaded) {
                console.log('📱 Showing interstitial ad (loaded callback)');
                await interstitial.show();
                hasShownAdRef.current = true;
              }
            } catch (err: any) {
              console.warn('Error showing ad in loaded callback:', err);
            }
          }, 500);
        }
      });

      const unsubscribeError = interstitial.addAdEventListener('error', (error: any) => {
        console.warn('📱 ❌ Interstitial ad error:', error);
        onAdFailedToLoad?.(error);
      });

      const unsubscribeOpened = interstitial.addAdEventListener('opened', () => {
        console.log('📱 ✅ Interstitial ad opened/shown');
        onAdShown?.();
      });

      const unsubscribeClosed = interstitial.addAdEventListener('closed', () => {
        console.log('📱 Interstitial ad closed');
        onAdDismissed?.();
        hasShownAdRef.current = false; // Reset so it can show again if needed
        // Reload ad for next time
        interstitial.load();
      });

      // Load the ad
      console.log('📱 Loading interstitial ad...');
      interstitial.load();

      // Store reference for cleanup
      interstitialAdRef.current = {
        interstitial,
        unsubscribeLoaded,
        unsubscribeError,
        unsubscribeOpened,
        unsubscribeClosed,
      };

      // Cleanup function
      return () => {
        try {
          if (interstitialAdRef.current) {
            interstitialAdRef.current.unsubscribeLoaded?.();
            interstitialAdRef.current.unsubscribeError?.();
            interstitialAdRef.current.unsubscribeOpened?.();
            interstitialAdRef.current.unsubscribeClosed?.();
          }
        } catch (error) {
          console.warn('Error cleaning up interstitial ad:', error);
        }
      };
    } catch (error) {
      console.warn('📱 ❌ Error creating interstitial ad:', error);
      onAdFailedToLoad?.(error as Error);
    }
  }, [adUnitId, isAdFree, isUnlocked, isChecking, showOnMount, onAdLoaded, onAdFailedToLoad, onAdShown, onAdDismissed]);

  // Show ad on mount if requested (fallback if loaded event doesn't trigger)
  useEffect(() => {
    if (showOnMount && !isAdFree && !isUnlocked && !isChecking && !hasShownAdRef.current) {
      const showAd = async () => {
        try {
          // Wait a bit longer for ad to load
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const interstitial = interstitialAdRef.current?.interstitial;
          if (!interstitial) {
            console.log('📱 Interstitial not ready yet, waiting...');
            // Try again after a delay
            setTimeout(showAd, 2000);
            return;
          }

          // Check if ad is loaded
          const isLoaded = await interstitial.loaded();
          console.log('📱 Checking if ad is loaded:', isLoaded);
          
          if (isLoaded) {
            console.log('📱 Showing interstitial ad (showOnMount effect)');
            await interstitial.show();
            hasShownAdRef.current = true;
          } else {
            console.log('📱 Ad not loaded yet, waiting...');
            // Wait a bit more and try again
            setTimeout(async () => {
              try {
                const loaded = await interstitial.loaded();
                console.log('📱 Re-checking if ad is loaded:', loaded);
                if (loaded) {
                  console.log('📱 Showing interstitial ad (retry)');
                  await interstitial.show();
                  hasShownAdRef.current = true;
                } else {
                  console.warn('📱 Ad still not loaded after retry');
                }
              } catch (err: any) {
                console.warn('📱 Error loading/showing interstitial ad:', err);
              }
            }, 3000);
          }
        } catch (error) {
          console.warn('📱 Error showing interstitial ad:', error);
        }
      };
      
      // Start trying to show ad after component mounts
      const timer = setTimeout(showAd, 1000);
      return () => clearTimeout(timer);
    }
  }, [showOnMount, isAdFree, isUnlocked, isChecking]);

  // Don't render anything - this component only manages ad lifecycle
  return null;
};

/**
 * Hook to show interstitial ad programmatically
 */
export const useInterstitialAd = (adUnitId?: string) => {
  const interstitialAdRef = useRef<any>(null);
  const [isAdFree, setIsAdFree] = React.useState<boolean>(false);
  const [isUnlocked, setIsUnlocked] = React.useState<boolean>(false);

  useEffect(() => {
    const checkPurchaseStatus = async () => {
      try {
        const [unlocked, adFree] = await Promise.all([
          AsyncStorage.getItem(UNLOCK_ALL_LEVELS_KEY),
          AsyncStorage.getItem(REMOVE_ADS_SUBSCRIPTION_KEY),
        ]);
        
        setIsUnlocked(unlocked === 'true');
        setIsAdFree(adFree === 'true');
      } catch (error) {
        console.warn('Failed to check purchase status:', error);
      }
    };
    checkPurchaseStatus();
  }, []);

  const showAd = React.useCallback(async () => {
    // Don't show ad if user has purchased unlock all or ad-free subscription
    if (isAdFree || isUnlocked) {
      return false;
    }

    if (!admobAvailable || !InterstitialAd) {
      return false;
    }

    try {
      const unitId = adUnitId || (__DEV__ 
        ? (TestIds?.INTERSTITIAL || 'ca-app-pub-3940256099942544/1033173712')
        : 'ca-app-pub-3872152208332642/2154839631');

      // Create or reuse interstitial ad
      if (!interstitialAdRef.current) {
        interstitialAdRef.current = InterstitialAd.createForAdRequest(unitId);
        await interstitialAdRef.current.load();
      }

      const interstitial = interstitialAdRef.current;
      const isLoaded = await interstitial.loaded();

      if (isLoaded) {
        await interstitial.show();
        // Reload for next time
        interstitial.load();
        return true;
      } else {
        // Try to load and show
        await interstitial.load();
        const loaded = await interstitial.loaded();
        if (loaded) {
          await interstitial.show();
          interstitial.load(); // Reload for next time
          return true;
        }
      }
    } catch (error) {
      console.warn('Error showing interstitial ad:', error);
    }

    return false;
  }, [adUnitId, isAdFree, isUnlocked]);

  return { showAd, isAdFree, isUnlocked };
};

export default InterstitialAdComponent;
