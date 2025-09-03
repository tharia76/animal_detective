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
};

export default function SplashScreen({ titleAnim, onLoadingComplete }: Props) {
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
  const [videoProgress, setVideoProgress] = useState<VideoPreloadProgress>({
    loaded: 0,
    total: 11,
    percentage: 0,
    currentVideo: '',
    isComplete: false,
    phase: 'critical',
    estimatedTime: 0
  });
  const [assetProgress, setAssetProgress] = useState<AssetLoadingProgress>({
    loaded: 0,
    total: 0,
    percentage: 0,
    currentAsset: '',
    isComplete: false,
    phase: 'critical',
    criticalComplete: false,
    priorityComplete: false,
    estimatedTime: 0
  });
  
  const [loadingStrategy, setLoadingStrategy] = useState<'fast' | 'balanced' | 'thorough'>('balanced');
  const [showSkipOption, setShowSkipOption] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<'starting' | 'critical' | 'priority' | 'background' | 'complete'>('starting');
  
  // Smooth animated values for better UX
  const [progressAnim] = useState(() => new Animated.Value(0));
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [scaleAnim] = useState(() => new Animated.Value(0.8));
  
  // Combined loading progress with intelligent weighting
  const totalLoadingProgress = {
    loaded: videoProgress.loaded + assetProgress.loaded,
    total: videoProgress.total + assetProgress.total,
    percentage: Math.round(((videoProgress.loaded + assetProgress.loaded) / (videoProgress.total + assetProgress.total)) * 100),
    isComplete: videoProgress.isComplete && assetProgress.isComplete,
    estimatedTime: Math.max(videoProgress.estimatedTime, assetProgress.estimatedTime),
    canSkipToPriority: assetProgress.criticalComplete && videoProgress.phase !== 'critical'
  };

  // Animate progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: totalLoadingProgress.percentage / 100,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [totalLoadingProgress.percentage]);

  // Initial animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start();
    
    // Show skip option after reasonable time
    const skipTimer = setTimeout(() => {
      setShowSkipOption(true);
    }, 8000);
    
    return () => clearTimeout(skipTimer);
  }, []);
  
  // Determine loading strategy based on device and previous performance
  const determineLoadingStrategy = useCallback(async () => {
    try {
      const strategy = assetPreloader.getLoadingStrategy();
      setLoadingStrategy(strategy);
      
      // Check if user prefers fast loading
      const userPreference = await AsyncStorage.getItem('loadingPreference');
      if (userPreference === 'fast') {
        setLoadingStrategy('fast');
      }
      

      return strategy;
    } catch (error) {
      // Fallback to balanced strategy
      return 'balanced';
    }
  }, []);

  // Skip to priority phase for faster startup
  const skipToPriority = useCallback(() => {

    setShowSkipOption(false);
    setLoadingStrategy('fast');
    AsyncStorage.setItem('loadingPreference', 'fast');
  }, []);

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

  // Progressive asset preloading with intelligent strategy
  useEffect(() => {

    
    const startPreloading = async () => {
      try {
        const strategy = await determineLoadingStrategy();

        
        setLoadingPhase('critical');
        
        if (strategy === 'fast') {
          // Fast loading: Only essentials, continue in background

          
          const [videosResult, assetsResult] = await Promise.allSettled([
            videoPreloader.preloadEssentialVideos((progress) => {
              setVideoProgress(progress);
            }),
            assetPreloader.preloadEssentialAssets((progress) => {
              setAssetProgress(progress);
            })
          ]);
          
          // Transition after essentials are loaded
          setTimeout(() => {

            setLoadingPhase('complete');
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
          
        } else if (strategy === 'balanced') {
          // Balanced loading: Phased approach

          
          const [videosResult, assetsResult] = await Promise.allSettled([
            videoPreloader.preloadAllVideos((progress) => {
              setVideoProgress(progress);
              setLoadingPhase(progress.phase);
            }),
            assetPreloader.preloadAllAssets((progress) => {
              setAssetProgress(progress);
              if (progress.phase !== loadingPhase) {
                setLoadingPhase(progress.phase);
              }
            })
          ]);
          
          setTimeout(() => {

            setLoadingPhase('complete');
            onLoadingComplete();
          }, 800);
          
        } else {
          // Thorough loading: Everything upfront

          
          const [videosResult, assetsResult] = await Promise.allSettled([
            videoPreloader.preloadAllVideos((progress) => {
              setVideoProgress(progress);
            }),
            assetPreloader.preloadAllAssets((progress) => {
              setAssetProgress(progress);
            })
          ]);
          
          setTimeout(() => {

            setLoadingPhase('complete');
            onLoadingComplete();
          }, 1200);
        }
        
      } catch (error) {

        // Fallback: quick transition
        setTimeout(() => {
          setLoadingPhase('complete');
          onLoadingComplete();
        }, 2000);
      }
    };
    
    startPreloading();
  }, [onLoadingComplete, determineLoadingStrategy, loadingPhase]);

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
      
      {/* Optimized loading interface */}
      <Animated.View style={{
        position: 'absolute',
        bottom: 80,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 30,
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }]
      }}>


        {/* Enhanced activity indicator */}
        <View style={{ marginBottom: 15 }}>
          <ActivityIndicator size="large" color="#FF8C00" />
        </View>
        
        {/* Simple loading message */}
        <Text style={{
          color: '#FF8C00',
          fontSize: 18,
          fontWeight: 'bold',
          marginBottom: 8,
          textAlign: 'center'
        }}>
          Loading... {totalLoadingProgress.percentage || 0}%
        </Text>
        

        

        
        {/* Enhanced progress bar with animation */}
        <View style={{
          width: '100%',
          height: 6,
          backgroundColor: 'rgba(255, 140, 0, 0.2)',
          borderRadius: 3,
          marginBottom: 15,
          overflow: 'hidden',
        }}>
          <Animated.View style={{
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
            height: '100%',
            backgroundColor: '#FF8C00',
            borderRadius: 3,
            shadowColor: '#FF8C00',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 4,
            elevation: 4,
          }} />
        </View>
        

        
        {/* Skip option for impatient users */}
        {showSkipOption && !totalLoadingProgress.isComplete && (
          <TouchableOpacity
            onPress={skipToPriority}
            style={{
              marginTop: 20,
              paddingHorizontal: 20,
              paddingVertical: 8,
              backgroundColor: 'rgba(255, 140, 0, 0.2)',
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#FF8C00',
            }}
          >
            <Text style={{
              color: '#FF8C00',
              fontSize: 14,
              fontWeight: '600'
            }}>
              Skip to Game ⚡
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}