import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity, Image } from 'react-native';
import { Asset } from 'expo-asset';
import { Ionicons } from '@expo/vector-icons';

interface FallbackVideoPlayerProps {
  source: any;
  style?: any;
  loop?: boolean;
  muted?: boolean;
  autoPlay?: boolean;
  onLoadStart?: () => void;
  onLoad?: () => void;
  onError?: (error: any) => void;
  onVideoEnd?: () => void;
  fallbackColor?: string;
}

export default function FallbackVideoPlayer({
  source,
  style,
  loop = false,
  muted = false,
  autoPlay = true,
  onLoadStart,
  onLoad,
  onError,
  onVideoEnd,
  fallbackColor = '#000'
}: FallbackVideoPlayerProps) {
  const [loadingState, setLoadingState] = useState<'loading' | 'loaded' | 'error' | 'skipped'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [assetInfo, setAssetInfo] = useState<any>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadAsset = async () => {
      try {
        onLoadStart?.();
        console.log('🎬 Loading video asset...');
        
        // Set timeout
        loadingTimeoutRef.current = setTimeout(() => {
          console.warn('⏰ Asset loading timeout');
          setLoadingState('error');
          setErrorMessage('Video loading took too long. The video file may be corrupted or too large.');
        }, 8000);

        if (typeof source === 'number') {
          const asset = Asset.fromModule(source);
          console.log('📦 Asset info:', {
            name: asset.name,
            type: asset.type,
            uri: asset.uri,
            localUri: asset.localUri,
            width: asset.width,
            height: asset.height
          });
          
          await asset.downloadAsync();
          setAssetInfo(asset);
          
          if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
          }
          
          console.log('✅ Asset downloaded successfully:', asset.localUri);
          setLoadingState('loaded');
          onLoad?.();
          
          // Auto-continue after successful load if autoPlay is true
          if (autoPlay) {
            console.log('🎬 Auto-continuing video simulation...');
            // For splash video, continue immediately to avoid blocking the user
            const isSplashVideo = asset.name?.includes('splash');
            const delay = isSplashVideo ? 100 : 5000; // 5 seconds for level videos
            
            console.log('▶️ Video would play now');
            setTimeout(() => {
              console.log('🏁 Simulating video end');
              const levelMatch = asset.name?.match(/(\w+)-vid/);
              const levelName = levelMatch ? levelMatch[1].charAt(0).toUpperCase() + levelMatch[1].slice(1) : 'Video';
              console.log(`🏁 ${levelName} video ended`);
              onVideoEnd?.();
            }, delay);
          }
        } else {
          console.log('🔗 Using URI source:', source);
          setLoadingState('loaded');
          onLoad?.();
        }
      } catch (error: any) {
        console.error('❌ Asset loading failed:', error);
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
        setLoadingState('error');
        setErrorMessage(error.message || 'Failed to load video asset');
        onError?.(error);
      }
    };

    loadAsset();

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [source]);

  const handleSkip = () => {
    console.log('⏭️ User skipped video');
    setLoadingState('skipped');
    onVideoEnd?.();
  };

  const handleRetry = () => {
    console.log('🔄 Retrying asset load...');
    setLoadingState('loading');
    setErrorMessage('');
  };

  // Skipped state
  if (loadingState === 'skipped') {
    return (
      <View style={[style, { backgroundColor: fallbackColor, justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="play-skip-forward" size={48} color="#4CAF50" />
        <Text style={{ color: '#fff', fontSize: 16, marginTop: 10 }}>Video Skipped</Text>
      </View>
    );
  }

  // Error state with detailed info
  if (loadingState === 'error') {
    return (
      <View style={[style, { 
        backgroundColor: fallbackColor, 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: 20
      }]}>
        <Ionicons name="warning" size={48} color="#ff6b6b" />
        <Text style={{ 
          color: '#fff', 
          fontSize: 18, 
          textAlign: 'center',
          marginTop: 15,
          fontWeight: 'bold'
        }}>
          Video Loading Failed
        </Text>
        <Text style={{ 
          color: '#ccc', 
          fontSize: 14, 
          textAlign: 'center',
          marginTop: 10,
          marginBottom: 20
        }}>
          {errorMessage}
        </Text>
        
        <TouchableOpacity 
          onPress={handleRetry}
          style={{
            backgroundColor: '#4CAF50',
            paddingHorizontal: 25,
            paddingVertical: 12,
            borderRadius: 25,
            marginBottom: 10
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Try Again</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleSkip}
          style={{
            backgroundColor: '#2196F3',
            paddingHorizontal: 25,
            paddingVertical: 12,
            borderRadius: 25
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Skip Video</Text>
        </TouchableOpacity>

        {assetInfo && (
          <View style={{ marginTop: 20, padding: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 5 }}>
            <Text style={{ color: '#fff', fontSize: 12, textAlign: 'center' }}>
              Debug Info: {assetInfo.name} ({assetInfo.type})
            </Text>
            {assetInfo.localUri && (
              <Text style={{ color: '#ccc', fontSize: 10, textAlign: 'center', marginTop: 5 }}>
                Path: {assetInfo.localUri.substring(0, 50)}...
              </Text>
            )}
          </View>
        )}
      </View>
    );
  }

  // Loading state
  if (loadingState === 'loading') {
    return (
      <View style={[style, { 
        backgroundColor: fallbackColor, 
        justifyContent: 'center', 
        alignItems: 'center' 
      }]}>
        <ActivityIndicator size="large" color="#FF8C00" />
        <Text style={{ 
          color: '#fff', 
          marginTop: 15, 
          fontSize: 16,
          textAlign: 'center'
        }}>
          Preparing video...
        </Text>
        <Text style={{ 
          color: '#ccc', 
          marginTop: 5, 
          fontSize: 14,
          textAlign: 'center'
        }}>
          This may take a moment
        </Text>
        
        <TouchableOpacity 
          onPress={handleSkip}
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            paddingHorizontal: 20,
            paddingVertical: 8,
            borderRadius: 20,
            marginTop: 20
          }}
        >
          <Text style={{ color: '#fff', fontSize: 14 }}>Skip Video</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Loaded state - for splash video, show minimal UI and auto-continue
  const isSplashVideo = assetInfo?.name?.includes('splash');
  
  if (isSplashVideo) {
    // For splash video, show minimal loading state and auto-continue
    return (
      <View style={[style, { 
        backgroundColor: fallbackColor, 
        justifyContent: 'center', 
        alignItems: 'center' 
      }]}>
        <ActivityIndicator size="large" color="#FF8C00" />
        <Text style={{ 
          color: '#fff', 
          fontSize: 16, 
          textAlign: 'center',
          marginTop: 15
        }}>
          Loading...
        </Text>
      </View>
    );
  }

  // Loaded state - show success message for other videos
  return (
    <View style={[style, { 
      backgroundColor: fallbackColor, 
      justifyContent: 'center', 
      alignItems: 'center' 
    }]}>
      <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
      <Text style={{ 
        color: '#fff', 
        fontSize: 18, 
        textAlign: 'center',
        marginTop: 15,
        fontWeight: 'bold'
      }}>
        Video Ready!
      </Text>
      <Text style={{ 
        color: '#ccc', 
        fontSize: 14, 
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 20
      }}>
        Video asset loaded successfully
      </Text>
      
      {assetInfo && (
        <View style={{ padding: 15, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, marginBottom: 20 }}>
          <Text style={{ color: '#fff', fontSize: 14, textAlign: 'center', marginBottom: 5 }}>
            📹 {assetInfo.name}
          </Text>
          <Text style={{ color: '#ccc', fontSize: 12, textAlign: 'center' }}>
            {assetInfo.width}×{assetInfo.height} • {assetInfo.type}
          </Text>
          {assetInfo.localUri && (
            <Text style={{ color: '#4CAF50', fontSize: 10, textAlign: 'center', marginTop: 5 }}>
              ✅ Downloaded to device
            </Text>
          )}
        </View>
      )}
      
      <TouchableOpacity 
        onPress={() => {
          console.log('▶️ Video would play now');
          setTimeout(() => {
            console.log('🏁 Simulating video end');
            onVideoEnd?.();
          }, 3000); // Simulate 3-second video
        }}
        style={{
          backgroundColor: '#FF6B35',
          paddingHorizontal: 25,
          paddingVertical: 12,
          borderRadius: 25,
          marginBottom: 10
        }}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Continue</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={handleSkip}
        style={{
          backgroundColor: 'rgba(255,255,255,0.2)',
          paddingHorizontal: 20,
          paddingVertical: 8,
          borderRadius: 20
        }}
      >
        <Text style={{ color: '#fff', fontSize: 14 }}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
}