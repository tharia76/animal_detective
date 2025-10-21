import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Asset } from 'expo-asset';

interface OptimizedVideoProps {
  source: any;
  style?: any;
  loop?: boolean;
  muted?: boolean;
  autoPlay?: boolean;
  contentFit?: 'contain' | 'cover' | 'fill';
  onLoadStart?: () => void;
  onLoad?: () => void;
  onError?: (error: any) => void;
  showLoadingIndicator?: boolean;
}

export default function OptimizedVideo({
  source,
  style,
  loop = false,
  muted = false,
  autoPlay = true,
  contentFit = 'cover',
  onLoadStart,
  onLoad,
  onError,
  showLoadingIndicator = true
}: OptimizedVideoProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Create video player with error handling
  const player = useVideoPlayer(source, (player) => {
    try {
      player.loop = loop;
      player.muted = muted;
      
      // Add status listener for better error handling
      const unsubscribe = player.addListener('statusChange', (status) => {
        console.log('🎬 Video status:', status);
        
        if ((status as any).isLoaded) {
          console.log('✅ Video loaded successfully');
          setIsLoading(false);
          setHasError(false);
          onLoad?.();
          
          if (autoPlay) {
            player.play();
          }
        }
        
        if (status.error) {
          console.error('❌ Video error:', status.error);
          setIsLoading(false);
          setHasError(true);
          setErrorMessage(status.error.message || 'Video failed to load');
          onError?.(status.error);
        }
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ Video player setup error:', error);
      setIsLoading(false);
      setHasError(true);
      setErrorMessage('Failed to initialize video player');
      onError?.(error);
    }
  });

  // Preload video asset
  useEffect(() => {
    const preloadVideo = async () => {
      try {
        onLoadStart?.();
        console.log('🎬 Preloading video asset...');
        
        if (typeof source === 'number') {
          const asset = Asset.fromModule(source);
          await asset.downloadAsync();
          console.log('✅ Video asset preloaded:', asset.name);
        }
      } catch (error) {
        console.error('❌ Video preload error:', error);
        setHasError(true);
        setErrorMessage('Failed to preload video');
        onError?.(error);
      }
    };

    preloadVideo();
  }, [source]);

  if (hasError) {
    return (
      <View style={[style, { 
        backgroundColor: '#000', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }]}>
        <Text style={{ 
          color: '#ff6b6b', 
          fontSize: 16, 
          textAlign: 'center',
          paddingHorizontal: 20
        }}>
          Video Error: {errorMessage}
        </Text>
      </View>
    );
  }

  return (
    <View style={style}>
      {showLoadingIndicator && isLoading && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#000',
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
      
      <VideoView
        style={style}
        player={player}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        nativeControls={false}
        contentFit={contentFit}
        pointerEvents="none"
      />
    </View>
  );
}
