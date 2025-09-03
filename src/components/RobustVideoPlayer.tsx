import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Asset } from 'expo-asset';
import { Ionicons } from '@expo/vector-icons';
import FallbackVideoPlayer from './FallbackVideoPlayer';

// Disable ExpoAVVideoPlayer since expo-av is not available
let ExpoAVVideoPlayer: any = null;
console.log('ExpoAVVideoPlayer disabled - using direct fallback for faster loading');

interface RobustVideoPlayerProps {
  source: any;
  style?: any;
  loop?: boolean;
  muted?: boolean;
  autoPlay?: boolean;
  contentFit?: 'contain' | 'cover' | 'fill';
  onLoadStart?: () => void;
  onLoad?: () => void;
  onError?: (error: any) => void;
  onVideoEnd?: () => void;
  showControls?: boolean;
  fallbackColor?: string;
}

export default function RobustVideoPlayer({
  source,
  style,
  loop = false,
  muted = false,
  autoPlay = true,
  contentFit = 'cover',
  onLoadStart,
  onLoad,
  onError,
  onVideoEnd,
  showControls = false,
  fallbackColor = '#000'
}: RobustVideoPlayerProps) {
  const [loadingState, setLoadingState] = useState<'loading' | 'loaded' | 'error' | 'fallback'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerType, setPlayerType] = useState<'expo-video' | 'expo-av' | 'fallback'>('expo-video');
  const maxRetries = 1;
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Create video player with simplified error handling (always call this hook)
  const player = useVideoPlayer(source, (player) => {
    try {
      console.log('🎬 Initializing video player for source:', typeof source === 'number' ? 'module' : source);
      player.loop = loop;
      player.muted = muted;
      
      // Simplified status listener
      const unsubscribe = player.addListener('statusChange', (status) => {
        // Properties 'isLoaded' and 'duration' may not exist on status, so we log only what is safe
        console.log('🎬 Video status:', {
          error: status.error?.message
        });
        if ((status as any).isLoaded) {
          console.log('✅ Video ready to play');
          setLoadingState('loaded');
          setErrorMessage('');
          onLoad?.();
          
          if (autoPlay) {
            console.log('🎬 Attempting to start video playback...');
            
            // Try muted autoplay first (more likely to succeed)
            const attemptAutoplay = async () => {
              try {
                // First try muted autoplay
                const originalMuted = player.muted;
                player.muted = true;
                await player.play();
                setIsPlaying(true);
                console.log('▶️ Video started (muted autoplay)');
                
                // After a short delay, try to unmute if originally unmuted
                if (!originalMuted) {
                  setTimeout(() => {
                    player.muted = false;
                    console.log('🔊 Video unmuted');
                  }, 1000);
                }
              } catch (error: any) {
                console.log('⚠️ Autoplay failed, will show play button:', error?.message);
                // Reset muted state and let user manually start
                player.muted = muted;
              }
            };
            
            // Try to play after a short delay to ensure video is ready
            setTimeout(attemptAutoplay, 200);
          }
        }
        
        if (status.error) {
          console.error('❌ [expo-video] Video loading failed:', status.error.message);
          setLoadingState('error');
          setErrorMessage(status.error.message);
          onError?.(status.error);
        }
      });

      // Simplified playback listener - using statusChange instead of playbackStatusUpdate
      const playbackUnsubscribe = player.addListener('statusChange', (status: any) => {
        if (status.didJustFinish && !loop) {
          console.log('🏁 Video completed');
          setIsPlaying(false);
          onVideoEnd?.();
        }
      });

      return () => {
        unsubscribe?.remove?.();
        playbackUnsubscribe?.remove?.();
      };
    } catch (error) {
      console.error('❌ [expo-video] Player initialization failed:', error);
      console.log('🔄 Using fallback player immediately...');
      setPlayerType('fallback');
      onError?.(error);
    }
  }) || null;

  // Check if expo-video is available and working
  useEffect(() => {
    if (!player) {
      console.warn('⚠️ expo-video player not available, using fallback immediately');
      setPlayerType('fallback');
    }
  }, [player]);

  // Preload asset to ensure it's cached
  useEffect(() => {
    let mounted = true;
    
    const preloadAsset = async () => {
      try {
        onLoadStart?.();
        setLoadingState('loading');
        console.log('🎬 Preloading video asset...');
        
        if (typeof source === 'number') {
          const asset = Asset.fromModule(source);
          await asset.downloadAsync();
          
          if (mounted) {
            console.log('✅ Asset preloaded, ready for expo-video');
          }
        } else {
          console.log('🔗 Using URI source directly');
        }
      } catch (error) {
        console.error('❌ Asset preload failed:', error);
        if (mounted) {
          console.warn('⚠️ Preload failed, but expo-video may still work');
        }
      }
    };

    preloadAsset();

    return () => {
      mounted = false;
    };
  }, [source, retryCount]);

  // Initialize loading state with timeout
  useEffect(() => {
    // Give more time for video to load (3 seconds for splash video)
    loadingTimeoutRef.current = setTimeout(() => {
      if (loadingState === 'loading') {
        console.warn('⏰ [expo-video] Loading timeout - trying expo-video with more time');
        // Don't immediately fallback, give expo-video more time
        setLoadingState('error');
      }
    }, 3000); // Increased to 3 seconds for proper video loading
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [source, retryCount, playerType]);
  
  // Clear timeout when video loads successfully
  useEffect(() => {
    if (loadingState === 'loaded' && loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  }, [loadingState]);

  const handleRetry = () => {
    console.log('🔄 Retrying video load...');
    setLoadingState('loading');
    setErrorMessage('');
    // Force re-render by updating a dependency
    setRetryCount(prev => prev + 1);
  };

  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        await player.pause();
        setIsPlaying(false);
        console.log('⏸️ Video paused by user');
      } else {
        await player.play();
        setIsPlaying(true);
        console.log('▶️ Video started by user');
      }
    } catch (error) {
      console.error('❌ Play/pause error:', error);
      // If play fails, try muted play
      if (!isPlaying) {
        try {
          const originalMuted = player.muted;
          player.muted = true;
          await player.play();
          setIsPlaying(true);
          console.log('▶️ Video started muted');
          
          // Try to unmute after a delay
          setTimeout(() => {
            player.muted = originalMuted;
          }, 1000);
        } catch (mutedError) {
          console.error('❌ Even muted play failed:', mutedError);
        }
      }
    }
  };


  const handleAssetFallback = () => {
    setLoadingState('fallback');
    onVideoEnd?.(); // Treat as if video ended
  };

  // Handlers for expo-av player
  const handleExpoAVLoad = () => {
    console.log('✅ [expo-av] Video loaded successfully');
    setLoadingState('loaded');
    onLoad?.();
  };

  const handleExpoAVError = (error: any) => {
    console.error('❌ [expo-av] Video failed:', error);
    console.log('🔄 Switching to fallback player');
    setPlayerType('fallback');
  };

  const handleExpoAVEnd = () => {
    console.log('🏁 [expo-av] Video ended');
    onVideoEnd?.();
  };

  // Error state
  if (loadingState === 'error') {
    return (
      <View style={[style, { 
        backgroundColor: fallbackColor, 
        justifyContent: 'center', 
        alignItems: 'center' 
      }]}>
        <Ionicons name="videocam-off" size={48} color="#ff6b6b" />
        <Text style={{ 
          color: '#fff', 
          fontSize: 16, 
          textAlign: 'center',
          paddingHorizontal: 20,
          marginTop: 10,
          fontWeight: 'bold'
        }}>
          Unable to load video
        </Text>
        <Text style={{ 
          color: '#ccc', 
          fontSize: 14, 
          textAlign: 'center',
          paddingHorizontal: 20,
          marginTop: 5
        }}>
          You can skip the video or try again
        </Text>
        <TouchableOpacity 
          onPress={handleRetry}
          style={{
            backgroundColor: '#4CAF50',
            paddingHorizontal: 25,
            paddingVertical: 12,
            borderRadius: 25,
            marginTop: 20,
            marginBottom: 10
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Try Again</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => setPlayerType('fallback')}
          style={{
            backgroundColor: '#2196F3',
            paddingHorizontal: 25,
            paddingVertical: 12,
            borderRadius: 25
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Skip Video</Text>
        </TouchableOpacity>
       
      </View>
    );
  }

  // Fallback state (no video)
  if (loadingState === 'fallback') {
    return (
      <View style={[style, { backgroundColor: fallbackColor }]} />
    );
  }

  // Use expo-av player if expo-video fails (disabled - not available)
  if (playerType === 'expo-av') {
    console.log('ExpoAV player requested but not available, using fallback');
    return (
      <FallbackVideoPlayer
        source={source}
        style={style}
        loop={loop}
        muted={muted}
        autoPlay={autoPlay}
        onLoadStart={onLoadStart}
        onLoad={onLoad}
        onError={onError}
        onVideoEnd={onVideoEnd}
        fallbackColor={fallbackColor}
      />
    );
  }

  // Use fallback player if both expo-video and expo-av fail
  if (playerType === 'fallback') {
    return (
      <FallbackVideoPlayer
        source={source}
        style={style}
        loop={loop}
        muted={muted}
        autoPlay={autoPlay}
        onLoadStart={onLoadStart}
        onLoad={onLoad}
        onError={onError}
        onVideoEnd={onVideoEnd}
        fallbackColor={fallbackColor}
      />
    );
  }

  return (
    <View style={style}>
      {/* Loading indicator */}
      {loadingState === 'loading' && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: fallbackColor,
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1
        }}>
          <ActivityIndicator size="large" color="#FF8C00" />
          <Text style={{ 
            color: '#fff', 
            marginTop: 10, 
            fontSize: 16 
          }}>
            Loading video...
          </Text>
        </View>
      )}
      
      {/* Video player */}
      <VideoView
        style={style}
        player={player}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        nativeControls={false}
        contentFit={contentFit}
        pointerEvents="auto"
      />
      
      {/* Play button when video is ready but not playing */}
      {loadingState === 'loaded' && !isPlaying && (
        <TouchableOpacity
          onPress={handlePlayPause}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: -40,
            marginLeft: -40,
            backgroundColor: 'rgba(0,0,0,0.8)',
            borderRadius: 40,
            width: 80,
            height: 80,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5
          }}
        >
          <Ionicons 
            name="play" 
            size={40} 
            color="#fff" 
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>
      )}
      
      {/* Custom controls */}
      {showControls && loadingState === 'loaded' && (
        <TouchableOpacity
          onPress={handlePlayPause}
          style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            backgroundColor: 'rgba(0,0,0,0.7)',
            borderRadius: 25,
            width: 50,
            height: 50,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={24} 
            color="#fff" 
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
