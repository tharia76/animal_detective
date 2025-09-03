import React, { useState, useEffect } from 'react';
import { View, Image, ActivityIndicator, ImageBackground } from 'react-native';
import { Asset } from 'expo-asset';

interface OptimizedImageProps {
  source: any;
  style?: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  children?: React.ReactNode;
  isBackground?: boolean;
}

export default function OptimizedImage({ 
  source, 
  style, 
  resizeMode = 'cover',
  children,
  isBackground = false
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // For static requires, we can render immediately
  if (typeof source === 'number' && !isBackground) {
    return (
      <Image
        source={source}
        style={style}
        resizeMode={resizeMode}
        onError={() => {
          console.warn('Image failed to load:', source);
          setError(true);
        }}
      />
    );
  }

  if (typeof source === 'number' && isBackground) {
    return (
      <ImageBackground
        source={source}
        style={style}
        resizeMode={resizeMode}
        onError={() => {
          console.warn('Background image failed to load:', source);
          setError(true);
        }}
      >
        {children}
      </ImageBackground>
    );
  }

  // Show placeholder for failed images
  if (error) {
    return (
      <View style={[style, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
        {/* Placeholder */}
      </View>
    );
  }

  return isBackground ? (
    <ImageBackground source={source} style={style} resizeMode={resizeMode}>
      {children}
    </ImageBackground>
  ) : (
    <Image source={source} style={style} resizeMode={resizeMode} />
  );
}
