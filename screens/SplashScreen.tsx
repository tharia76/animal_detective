// SplashScreen.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, Animated, Dimensions, TouchableOpacity, InteractionManager, Platform } from 'react-native';
import { useDynamicStyles } from '../src/styles/styles';
import { VideoView, useVideoPlayer } from 'expo-video';

// Using VideoView directly for simplicity
import { videoPreloader, VideoPreloadProgress } from '../src/utils/videoPreloader';
import { assetPreloader, AssetLoadingProgress } from '../src/utils/advancedAssetPreloader';
import { backgroundAssetManager } from '../src/utils/backgroundAssetManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = {
  titleAnim: Animated.Value;
  onLoadingComplete: () => void;
  loadingProgress?: number;
};

export default function SplashScreen({ titleAnim, onLoadingComplete, loadingProgress = 0 }: Props) {
  const dynamicStyles = useDynamicStyles();
  
  // Create video player directly
  const videoSource = require('../src/assets/intro_videos/splash.mp4');
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
    player.muted = false;
    
    console.log('🎬 Direct VideoPlayer: Initialized');
    
    // Simple autoplay
    setTimeout(async () => {
      try {
        await player.play();
        console.log('▶️ Direct VideoPlayer: Playing');
      } catch (error) {
        console.log('⚠️ Direct VideoPlayer: Autoplay failed, but continuing');
      }
    }, 200);
  });
  const [showSkipOption, setShowSkipOption] = useState(false);
  
  // Simple animated values for skip button
  const [fadeAnim] = useState(() => new Animated.Value(0));


  // Initial animations
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    
    // Show skip option after reasonable time - use InteractionManager to avoid warning
    const skipTimer = setTimeout(() => {
      InteractionManager.runAfterInteractions(() => {
        setShowSkipOption(true);
      });
    }, 8000);
    
    return () => clearTimeout(skipTimer);
  }, [fadeAnim]);
  
  // Skip to menu for faster startup
  const skipToPriority = useCallback(() => {
    setShowSkipOption(false);
    AsyncStorage.setItem('loadingPreference', 'fast');
    onLoadingComplete();
  }, [onLoadingComplete]);

  // Test video source accessibility
  useEffect(() => {
    const testVideoSource = async () => {
      try {
        const videoSource = require('../src/assets/intro_videos/splash.mp4');
        console.log('🎬 Splash video source loaded:', videoSource);
      } catch (error) {
        console.error('❌ Failed to load splash video source:', error);
      }
    };
    
    testVideoSource();
  }, []);

  // Simplified asset preloading without progress tracking
  useEffect(() => {
    const startPreloading = async () => {
      try {
        // Check if user prefers fast loading
        const userPreference = await AsyncStorage.getItem('loadingPreference');
        const useFastLoading = userPreference === 'fast';
        
        if (useFastLoading) {
          // Fast loading: Only essentials, continue in background
          await Promise.allSettled([
            videoPreloader.preloadEssentialVideos(() => {}),
            assetPreloader.preloadEssentialAssets(() => {})
          ]);
          
          // Transition after essentials are loaded
          setTimeout(() => {
            onLoadingComplete();
            
            // Queue remaining assets for background loading
            InteractionManager.runAfterInteractions(() => {
              const backgroundAssets = assetPreloader.getBackgroundAssets();
              backgroundAssetManager.queueAssets(
                [], // Videos handled by videoPreloader
                backgroundAssets.priority.concat(backgroundAssets.background),
                'medium'
              );
            });
          }, 500);
          
        } else {
          // Balanced loading: Load all assets
          await Promise.allSettled([
            videoPreloader.preloadAllVideos(() => {}),
            assetPreloader.preloadAllAssets(() => {})
          ]);
          
          setTimeout(() => {
            onLoadingComplete();
          }, 800);
        }
        
      } catch (error) {
        console.warn('Error during preloading:', error);
        // Fallback: quick transition
        setTimeout(() => {
          onLoadingComplete();
        }, 2000);
      }
    };
    
    startPreloading();
  }, [onLoadingComplete]);

  return (
    <View style={dynamicStyles.loadingContainer}>
      {/* Background video - direct VideoView */}
      <VideoView
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
        }}
        player={player}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        nativeControls={false}
        contentFit="cover"
        // Optimize for better quality rendering
        pointerEvents="auto"
      />
      

        

        

        
        {/* Skip Option - Only show skip button without progress bar */}
        {showSkipOption && (
          <Animated.View 
            style={[dynamicStyles.skipContainer, { opacity: fadeAnim }]}
          >
            <TouchableOpacity 
              style={dynamicStyles.skipButton}
              onPress={skipToPriority}
              activeOpacity={0.7}
            >
              <Text style={dynamicStyles.skipButtonText}>Skip to Menu</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      
        </View>

        
       
  );
}