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
  
  // Combined loading progress with intelligent weighting and smooth updates
  const totalLoadingProgress = {
    loaded: videoProgress.loaded + assetProgress.loaded,
    total: Math.max(videoProgress.total + assetProgress.total, 1), // Prevent division by zero
    percentage: loadingProgress > 0 ? loadingProgress : Math.min(Math.round(((videoProgress.loaded + assetProgress.loaded) / Math.max(videoProgress.total + assetProgress.total, 1)) * 100), 100),
    isComplete: loadingProgress >= 100 || (videoProgress.isComplete && assetProgress.isComplete),
    estimatedTime: Math.max(videoProgress.estimatedTime, assetProgress.estimatedTime),
    canSkipToPriority: assetProgress.criticalComplete && videoProgress.phase !== 'critical'
  };

  // Animate progress bar with smooth transitions (useNativeDriver: false for width animations)
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: totalLoadingProgress.percentage / 100,
      duration: 300,
      useNativeDriver: false, // Must be false for width animations
    }).start();
  }, [totalLoadingProgress.percentage]);

  // Add pulsing animation for progress bar when loading
  const [pulseAnim] = useState(() => new Animated.Value(1));
  useEffect(() => {
    if (totalLoadingProgress.percentage > 0 && totalLoadingProgress.percentage < 100) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
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
      

        

        

        
        {/* Enhanced progress bar with animation */}
        <Animated.View 
          style={[
            dynamicStyles.progressContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {/* Progress Pill Container */}
          <View style={dynamicStyles.progressPillContainer}>
            <View style={dynamicStyles.progressBarBackground}>
              <Animated.View 
                style={[
                  dynamicStyles.progressBarFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                      extrapolate: 'clamp',
                    }),
                  }
                ]}
              >
                <Animated.View 
                  style={[
                    {
                      flex: 1,
                      backgroundColor: '#FF6B35',
                      borderRadius: 18, // Match pill shape
                    },
                    {
                      transform: [{ scale: pulseAnim }],
                    }
                  ]}
                />
              </Animated.View>
            </View>
          </View>
          
          {/* Progress Text Removed - Clean Minimal Design */}
          
          {/* Skip Option */}
          {showSkipOption && totalLoadingProgress.percentage < 80 && (
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
        </Animated.View>
      
        </View>

        
       
  );
}