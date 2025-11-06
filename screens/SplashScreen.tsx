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
  const [currentProgress, setCurrentProgress] = useState(0);
  
  // Simple animated values for skip button
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [progressAnim] = useState(() => new Animated.Value(0));


  // Update progress bar animation when currentProgress changes
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: currentProgress / 100,
      duration: 300,
      useNativeDriver: false, // width animation doesn't support native driver
    }).start();
  }, [currentProgress, progressAnim]);

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

  // Asset preloading with progress tracking
  useEffect(() => {
    const startPreloading = async () => {
      try {
        // Initialize progress
        setCurrentProgress(10);
        
        // Check if user prefers fast loading
        const userPreference = await AsyncStorage.getItem('loadingPreference');
        const useFastLoading = userPreference === 'fast';
        
        // Progress update function
        const updateProgress = (progress: number) => {
          setCurrentProgress(Math.min(progress, 100));
        };
        
        if (useFastLoading) {
          // Fast loading: Only essentials, continue in background
          updateProgress(20);
          
          // Preload videos with progress callback
          const videoPromise = videoPreloader.preloadEssentialVideos((progress) => {
            // progress.percentage is 0-100, map to 20-50% of total
            updateProgress(20 + (progress.percentage * 0.3));
          });
          
          updateProgress(30);
          
          // Preload assets with progress callback
          const assetPromise = assetPreloader.preloadEssentialAssets((progress) => {
            // progress.percentage is 0-100, map to 50-80% of total
            updateProgress(50 + (progress.percentage * 0.3));
          });
          
          await Promise.allSettled([videoPromise, assetPromise]);
          updateProgress(90);
          
          // Transition after essentials are loaded
          setTimeout(() => {
            updateProgress(100);
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
          updateProgress(20);
          
          // Preload videos with progress callback
          const videoPromise = videoPreloader.preloadAllVideos((progress) => {
            // progress.percentage is 0-100, map to 20-60% of total
            updateProgress(20 + (progress.percentage * 0.4));
          });
          
          updateProgress(30);
          
          // Preload assets with progress callback
          const assetPromise = assetPreloader.preloadAllAssets((progress) => {
            // progress.percentage is 0-100, map to 60-90% of total
            updateProgress(60 + (progress.percentage * 0.3));
          });
          
          await Promise.allSettled([videoPromise, assetPromise]);
          updateProgress(95);
          
          setTimeout(() => {
            updateProgress(100);
            onLoadingComplete();
          }, 800);
        }
        
      } catch (error) {
        console.warn('Error during preloading:', error);
        // Fallback: quick transition with progress
        setCurrentProgress(100);
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

      {/* Loading Progress Bar */}
      <View style={{
        position: 'absolute',
        bottom: 120,
        left: 60,
        right: 60,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Progress Bar Container */}
        <View style={{
          width: '70%',
          height: 6,
          backgroundColor: '#FFFFFF',
          borderRadius: 3,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 5,
          borderWidth: 1,
          borderColor: 'rgba(0, 0, 0, 0.1)',
        }}>
          {/* Progress Bar Fill */}
          <Animated.View
            style={{
              height: '100%',
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: '#FF8C00',
              borderRadius: 3,
            }}
          />
        </View>
        {/* Progress Percentage Text */}
        <Text style={{
          marginTop: 6,
          color: '#FFFFFF',
          fontSize: 12,
          fontWeight: 'bold',
          textShadowColor: 'rgba(0, 0, 0, 0.7)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 3,
        }}>
          {Math.round(currentProgress)}%
        </Text>
      </View>

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