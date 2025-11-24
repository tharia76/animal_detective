import React, { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

// Try to import AdMob components, fallback gracefully if not available
let RewardedAd: any = null;
let RewardedAdEventType: any = null;
let TestIds: any = null;
let admobAvailable = false;

try {
  const mobileAds = require('react-native-google-mobile-ads');
  RewardedAd = mobileAds.RewardedAd;
  RewardedAdEventType = mobileAds.RewardedAdEventType;
  TestIds = mobileAds.TestIds;
  admobAvailable = true;
} catch (error) {
  console.warn('AdMob Rewarded components not available - native module may not be linked');
  admobAvailable = false;
}

interface AdMobRewardedProps {
  /**
   * Ad Unit ID. Use TestIds.REWARDED for testing.
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
   * Callback when user earns reward
   * @param reward - The reward object with type and amount
   */
  onRewarded?: (reward: { type: string; amount: number }) => void;
  
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
 * AdMob Rewarded Ad Component
 * 
 * IMPORTANT: Follow Families policy guidelines:
 * - Rewarded ads should be optional (never required to progress)
 * - Use for kid-friendly rewards (cosmetics, hints, etc.)
 * - Consider adding a parental gate before showing rewarded ads
 * - Never use "watch ads to progress" walls for kids
 * 
 * Usage:
 * ```tsx
 * const rewardedRef = useRef<AdMobRewardedRef>(null);
 * 
 * <AdMobRewarded
 *   ref={rewardedRef}
 *   adUnitId="ca-app-pub-3940256099942544/5224354917"
 *   onRewarded={(reward) => {
 *     console.log('Reward earned:', reward);
 *     // Grant reward to user
 *   }}
 *   onAdClosed={() => console.log('Rewarded ad closed')}
 * />
 * 
 * // Later, show the ad:
 * rewardedRef.current?.show();
 * ```
 */
export interface AdMobRewardedRef {
  /**
   * Load the rewarded ad
   */
  load: () => void;
  
  /**
   * Show the rewarded ad (only if loaded)
   */
  show: () => void;
  
  /**
   * Check if ad is loaded and ready to show
   */
  isLoaded: () => boolean;
}

const AdMobRewardedComponent = React.forwardRef<AdMobRewardedRef, AdMobRewardedProps>(
  ({ 
    adUnitId = TestIds?.REWARDED || 'ca-app-pub-3940256099942544/5224354917',
    onAdLoaded,
    onAdFailedToLoad,
    onAdShown,
    onRewarded,
    onAdClosed,
    onAdClicked,
    autoLoad = true,
  }, ref) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const rewardedAdRef = useRef<any>(null);

    const loadAd = () => {
      if (!admobAvailable || !RewardedAd) {
        console.warn('AdMob Rewarded not available');
        return;
      }

      try {
        // Create new rewarded ad instance
        rewardedAdRef.current = RewardedAd.createForAdRequest(adUnitId, {
          requestNonPersonalizedAdsOnly: true, // Required for Families-certified apps
        });

        // Set up event listeners
        const unsubscribeLoaded = rewardedAdRef.current.addAdEventListener(
          RewardedAdEventType.LOADED,
          () => {
            setIsLoaded(true);
            console.log('📱 Rewarded ad loaded');
            onAdLoaded?.();
          }
        );

        const unsubscribeFailed = rewardedAdRef.current.addAdEventListener(
          RewardedAdEventType.ERROR,
          (error: any) => {
            setIsLoaded(false);
            console.warn('📱 Rewarded ad failed to load:', error);
            onAdFailedToLoad?.(error);
          }
        );

        const unsubscribeShown = rewardedAdRef.current.addAdEventListener(
          RewardedAdEventType.OPENED,
          () => {
            console.log('📱 Rewarded ad shown');
            onAdShown?.();
          }
        );

        const unsubscribeRewarded = rewardedAdRef.current.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD,
          (reward: { type: string; amount: number }) => {
            console.log('📱 Reward earned:', reward);
            onRewarded?.(reward);
          }
        );

        const unsubscribeClosed = rewardedAdRef.current.addAdEventListener(
          RewardedAdEventType.CLOSED,
          () => {
            setIsLoaded(false);
            console.log('📱 Rewarded ad closed');
            onAdClosed?.();
            // Reload ad for next time
            loadAd();
          }
        );

        const unsubscribeClicked = rewardedAdRef.current.addAdEventListener(
          RewardedAdEventType.CLICKED,
          () => {
            console.log('📱 Rewarded ad clicked');
            onAdClicked?.();
          }
        );

        // Load the ad
        rewardedAdRef.current.load();

        // Cleanup function
        return () => {
          unsubscribeLoaded();
          unsubscribeFailed();
          unsubscribeShown();
          unsubscribeRewarded();
          unsubscribeClosed();
          unsubscribeClicked();
        };
      } catch (error) {
        console.warn('Failed to create rewarded ad:', error);
        onAdFailedToLoad?.(error as Error);
      }
    };

    const showAd = () => {
      if (!isLoaded || !rewardedAdRef.current) {
        console.warn('Rewarded ad not loaded yet');
        return;
      }

      try {
        rewardedAdRef.current.show();
      } catch (error) {
        console.warn('Failed to show rewarded ad:', error);
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

AdMobRewardedComponent.displayName = 'AdMobRewarded';

export default AdMobRewardedComponent;


