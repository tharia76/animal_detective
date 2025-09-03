import React, { useState, useEffect } from 'react';
import { ImageBackground, View, ActivityIndicator } from 'react-native';
import { Asset } from 'expo-asset';

interface FastBackgroundProps {
  source: any;
  style?: any;
  children?: React.ReactNode;
  showLoader?: boolean;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
}

export default function FastBackground({ 
  source, 
  style, 
  children,
  showLoader = false,
  resizeMode = 'cover'
}: FastBackgroundProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    // For static requires, get URI immediately
    if (typeof source === 'number') {
      const asset = Asset.fromModule(source);
      setImageUri(asset.uri);
      
      // Download in background for better caching
      asset.downloadAsync()
        .then(() => {
          if (asset.localUri) {
            setImageUri(asset.localUri);
          }
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    } else if (source?.uri) {
      setImageUri(source.uri);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [source]);

  if (!imageUri) {
    return (
      <View style={[style, { backgroundColor: '#f0f0f0' }]}>
        {showLoader && (
          <View style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: [{ translateX: -12 }, { translateY: -12 }] 
          }}>
            <ActivityIndicator size="small" color="#999" />
          </View>
        )}
        {children}
      </View>
    );
  }

  return (
    <ImageBackground
      source={{ uri: imageUri }}
      style={style}
      resizeMode={resizeMode}
      onLoadEnd={() => setIsLoading(false)}
    >
      {showLoader && isLoading && (
        <View style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: [{ translateX: -12 }, { translateY: -12 }] 
        }}>
          <ActivityIndicator size="small" color="#999" />
        </View>
      )}
      {children}
    </ImageBackground>
  );
}
