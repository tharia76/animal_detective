// LazyImage - Uses persistent image registry for instant display
import React from 'react';
import { Image } from 'react-native';
import { ImageRegistry } from '../utils/PersistentImageRegistry';

interface LazyImageProps {
  source: any;
  style?: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  cacheKey?: string; // Cache key for persistent registry
}

// Completely memoized component - uses pre-rendered images from registry
const LazyImage = React.memo(({ 
  source, 
  style, 
  resizeMode = 'cover',
  cacheKey
}: LazyImageProps) => {
  // Try to get pre-rendered image from registry first
  if (cacheKey && ImageRegistry.hasImage(cacheKey)) {
    const persistentImage = ImageRegistry.getPersistentImage(cacheKey, style);
    if (persistentImage) {
      return persistentImage;
    }
  }

  // Fallback to direct rendering if not in registry
  return (
    <Image
      source={source}
      style={style}
      resizeMode={resizeMode}
      fadeDuration={0} // No fade animation for instant display
    />
  );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;
