// FastImage wrapper for better image performance
import React, { useState, useEffect } from 'react';
import { Image, ImageProps, View, ActivityIndicator } from 'react-native';
import { Asset } from 'expo-asset';

interface FastImageProps extends ImageProps {
  source: any;
  showLoadingIndicator?: boolean;
}

export default function FastImage({ 
  source, 
  style, 
  showLoadingIndicator = false,
  ...props 
}: FastImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    // For local images, get the URI immediately
    if (typeof source === 'number') {
      const asset = Asset.fromModule(source);
      setImageUri(asset.uri);
      
      // Optional: Download for better performance
      asset.downloadAsync()
        .then(() => {
          if (asset.localUri) {
            setImageUri(asset.localUri);
          }
        })
        .catch(() => {
          // Ignore errors - use module URI
        });
    } else if (source?.uri) {
      setImageUri(source.uri);
    }
  }, [source]);

  if (!imageUri) {
    return showLoadingIndicator ? (
      <View style={[style, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="small" color="#999" />
      </View>
    ) : null;
  }

  return (
    <Image
      {...props}
      source={{ uri: imageUri }}
      style={style}
      onLoadStart={() => setIsLoading(true)}
      onLoadEnd={() => setIsLoading(false)}
      fadeDuration={0}
      cache="force-cache"
    />
  );
}
