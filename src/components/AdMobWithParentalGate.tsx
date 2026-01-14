import React, { useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import ParentalGate from './ParentalGate';
import AdMobInterstitial, { AdMobInterstitialRef } from './AdMobInterstitial';
import AdMobRewarded, { AdMobRewardedRef } from './AdMobRewarded';

/**
 * AdMobWithParentalGate - Wrapper for AdMob ads with Parental Gate
 * 
 * This component ensures that a parental gate is shown BEFORE displaying ads,
 * which is required for Kids Category apps on Apple App Store (Guideline 1.3).
 * 
 * Why before showing the ad?
 * - AdMob SDK doesn't allow preventing ad clicks after the ad is displayed
 * - The parental gate must be completed BEFORE the ad is shown
 * - This prevents children from accidentally leaving the app
 */

interface AdMobInterstitialWithGateProps {
  type: 'interstitial';
  adUnitId?: string;
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: Error) => void;
  onAdShown?: () => void;
  onAdClosed?: () => void;
  onAdClicked?: () => void;
  onParentalGateSuccess?: () => void;
  onParentalGateCancel?: () => void;
  autoLoad?: boolean;
  /**
   * If true, always requires parental gate before showing ad
   * If false, only requires parental gate for Kids Category apps
   * Default: true (always require for maximum safety)
   */
  requireParentalGate?: boolean;
}

interface AdMobRewardedWithGateProps {
  type: 'rewarded';
  adUnitId?: string;
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: Error) => void;
  onAdShown?: () => void;
  onRewarded?: (reward: { type: string; amount: number }) => void;
  onAdClosed?: () => void;
  onAdClicked?: () => void;
  onParentalGateSuccess?: () => void;
  onParentalGateCancel?: () => void;
  autoLoad?: boolean;
  /**
   * If true, always requires parental gate before showing ad
   * If false, only requires parental gate for Kids Category apps
   * Default: true (always require for maximum safety)
   */
  requireParentalGate?: boolean;
}

type AdMobWithParentalGateProps = AdMobInterstitialWithGateProps | AdMobRewardedWithGateProps;

export interface AdMobWithParentalGateRef {
  /**
   * Load the ad
   */
  load: () => void;
  
  /**
   * Show the ad with parental gate (if required)
   * This will show the parental gate first, then the ad
   */
  show: () => void;
  
  /**
   * Check if ad is loaded and ready to show
   */
  isLoaded: () => boolean;
}

const AdMobWithParentalGate = forwardRef<AdMobWithParentalGateRef, AdMobWithParentalGateProps>(
  (props, ref) => {
    const {
      type,
      adUnitId,
      onAdLoaded,
      onAdFailedToLoad,
      onAdShown,
      onAdClosed,
      onAdClicked,
      onParentalGateSuccess,
      onParentalGateCancel,
      autoLoad = true,
      requireParentalGate = true,
    } = props;

    const [showParentalGate, setShowParentalGate] = useState(false);
    const [pendingAdShow, setPendingAdShow] = useState(false);
    
    const adRef = useRef<AdMobInterstitialRef | AdMobRewardedRef>(null);

    // Handle parental gate success
    const handleParentalGateSuccess = useCallback(() => {
      console.log('✅ Parental gate passed - showing ad');
      setShowParentalGate(false);
      onParentalGateSuccess?.();
      
      // Now show the ad
      if (pendingAdShow && adRef.current) {
        adRef.current.show();
        setPendingAdShow(false);
      }
    }, [pendingAdShow, onParentalGateSuccess]);

    // Handle parental gate cancel
    const handleParentalGateCancel = useCallback(() => {
      console.log('❌ Parental gate cancelled - ad will not be shown');
      setShowParentalGate(false);
      setPendingAdShow(false);
      onParentalGateCancel?.();
    }, [onParentalGateCancel]);

    // Show ad with parental gate check
    const showAd = useCallback(() => {
      if (!adRef.current?.isLoaded()) {
        console.warn('⚠️ Ad not loaded yet');
        return;
      }

      if (requireParentalGate) {
        console.log('🔒 Showing parental gate before ad');
        setPendingAdShow(true);
        setShowParentalGate(true);
      } else {
        // No parental gate required, show ad directly
        adRef.current.show();
      }
    }, [requireParentalGate]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      load: () => adRef.current?.load(),
      show: showAd,
      isLoaded: () => adRef.current?.isLoaded() || false,
    }));

    // Render the appropriate ad component
    const renderAdComponent = () => {
      if (type === 'interstitial') {
        const interstitialProps = props as AdMobInterstitialWithGateProps;
        return (
          <AdMobInterstitial
            ref={adRef as React.RefObject<AdMobInterstitialRef>}
            adUnitId={adUnitId}
            autoLoad={autoLoad}
            onAdLoaded={onAdLoaded}
            onAdFailedToLoad={onAdFailedToLoad}
            onAdShown={onAdShown}
            onAdClosed={onAdClosed}
            onAdClicked={onAdClicked}
          />
        );
      } else if (type === 'rewarded') {
        const rewardedProps = props as AdMobRewardedWithGateProps;
        return (
          <AdMobRewarded
            ref={adRef as React.RefObject<AdMobRewardedRef>}
            adUnitId={adUnitId}
            autoLoad={autoLoad}
            onAdLoaded={onAdLoaded}
            onAdFailedToLoad={onAdFailedToLoad}
            onAdShown={onAdShown}
            onRewarded={rewardedProps.onRewarded}
            onAdClosed={onAdClosed}
            onAdClicked={onAdClicked}
          />
        );
      }
      return null;
    };

    return (
      <>
        {renderAdComponent()}
        
        {/* Parental Gate Modal */}
        <ParentalGate
          visible={showParentalGate}
          onSuccess={handleParentalGateSuccess}
          onCancel={handleParentalGateCancel}
          title="Parental Permission Required"
          message="This ad may take you outside the app. Please complete this challenge to continue:"
        />
      </>
    );
  }
);

AdMobWithParentalGate.displayName = 'AdMobWithParentalGate';

export default AdMobWithParentalGate;
