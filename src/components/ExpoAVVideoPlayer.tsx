import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Asset } from 'expo-asset';
import { Ionicons } from '@expo/vector-icons';

interface ExpoAVVideoPlayerProps {
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

export default function ExpoAVVideoPlayer({
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
}: ExpoAVVideoPlayerProps) {
  const [loadingState, setLoadingState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoSource, setVideoSource] = useState<string | any>(null);
  const videoRef = useRef<Video>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Preload asset and get URI
  useEffect(() => {
    let mounted = true;
    
    const preloadAsset = async () => {
      try {
        onLoadStart?.();
        setLoadingState('loading');
        console.log('🎬 [expo-av] Preloading video asset...');
        
        // Set loading timeout
        loadingTimeoutRef.current = setTimeout(() => {
          if (mounted && loadingState === 'loading') {
            console.warn('⏰ [expo-av] Video loading timeout');
            setLoadingState('error');
            onError?.(new Error('Video loading timeout'));
          }
        }, 1000); // Reduced from 5 seconds to 1 second
        
        if (typeof source === 'number') {
          const asset = Asset.fromModule(source);
          await asset.downloadAsync();
          
          if (mounted) {
            console.log('✅ [expo-av] Asset preloaded:', asset.localUri || asset.uri);
            setVideoSource({ uri: asset.localUri || asset.uri });
          }
        } else {
          console.log('🔗 [expo-av] Using URI source directly:', source);
          setVideoSource(source);
        }
      } catch (error) {
        console.error('❌ [expo-av] Asset preload failed:', error);
        if (mounted) {
          setLoadingState('error');
          onError?.(error);
        }
      }
    };

    preloadAsset();

    return () => {
      mounted = false;
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [source]);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      if (loadingState === 'loading') {
        console.log('✅ [expo-av] Video loaded successfully');
        setLoadingState('loaded');
        onLoad?.();
        
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }

        // Start playing if autoPlay is enabled
        if (autoPlay && !isPlaying) {
          console.log('🎬 [expo-av] Starting autoplay...');
          videoRef.current?.playAsync().then(() => {
            setIsPlaying(true);
            console.log('▶️ [expo-av] Video playing');
          }).catch((error) => {
            console.warn('⚠️ [expo-av] Autoplay failed:', error);
          });
        }
      }

      setIsPlaying(status.isPlaying);

      // Handle video end
      if (status.didJustFinish && !loop) {
        console.log('🏁 [expo-av] Video completed');
        setIsPlaying(false);
        onVideoEnd?.();
      }
    } else if (status.error) {
      console.error('❌ [expo-av] Playback error:', status.error);
      setLoadingState('error');
      onError?.(status.error);
    }
  };

  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        await videoRef.current?.pauseAsync();
        console.log('⏸️ [expo-av] Video paused');
      } else {
        await videoRef.current?.playAsync();
        console.log('▶️ [expo-av] Video resumed');
      }
    } catch (error) {
      console.error('❌ [expo-av] Play/pause error:', error);
    }
  };

  const handleRetry = () => {
    console.log('🔄 [expo-av] Retrying video load...');
    setLoadingState('loading');
    // Force re-render by updating source
    setVideoSource(null);
    setTimeout(() => setVideoSource(typeof source === 'number' ? source : source), 100);
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
          Video playback failed
        </Text>
        <Text style={{ 
          color: '#ccc', 
          fontSize: 14, 
          textAlign: 'center',
          paddingHorizontal: 20,
          marginTop: 5
        }}>
          Unable to play video with expo-av
        </Text>
        <TouchableOpacity 
          onPress={handleRetry}
          style={{
            backgroundColor: '#4CAF50',
            paddingHorizontal: 25,
            paddingVertical: 12,
            borderRadius: 25,
            marginTop: 20
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => onVideoEnd?.()}
          style={{
            backgroundColor: '#2196F3',
            paddingHorizontal: 25,
            paddingVertical: 12,
            borderRadius: 25,
            marginTop: 10
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Skip Video</Text>
        </TouchableOpacity>
      </View>
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
      {videoSource && (
        <Video
          ref={videoRef}
          style={style}
          source={videoSource}
          shouldPlay={false} // We handle play manually
          isLooping={loop}
          isMuted={muted}
          resizeMode={contentFit === 'cover' ? ResizeMode.COVER : 
                     contentFit === 'contain' ? ResizeMode.CONTAIN : 
                     ResizeMode.STRETCH}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          useNativeControls={false}
        />
      )}
      
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