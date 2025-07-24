// SplashScreen.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, Animated } from 'react-native';
import { useDynamicStyles } from '../src/styles/styles';
import { VideoView, useVideoPlayer } from 'expo-video';

type Props = {
  titleAnim: Animated.Value;
};

export default function SplashScreen({ titleAnim }: Props) {
  // 1️⃣ Hoist your hook: only call it once, at the top level
  const dynamicStyles = useDynamicStyles();
  
  // Video player setup for splash video
  const player = useVideoPlayer(require('../src/assets/intro_videos/splash.mp4'), player => {
    player.loop = true; // Loop the splash video
    player.muted = false; // Play with sound
  });

  // Start playing the video when component mounts
  useEffect(() => {
    player.play();
    
    // Cleanup function to pause video when component unmounts
    return () => {
      try {
        if (player) {
          player.pause();
        }
      } catch (error) {
        // Ignore cleanup errors - video player may already be disposed
        console.warn('Video player cleanup error (safe to ignore):', error);
      }
    };
  }, [player]);

  return (
    <View style={dynamicStyles.loadingContainer}>
      {/* Background video */}
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
      />
      
      {/* Just the loading indicator */}
      <ActivityIndicator 
        size="large" 
        color="orange" 
        style={{ zIndex: 1 }}
      />
    </View>
  );
}
