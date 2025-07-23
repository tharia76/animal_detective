import { useWindowDimensions } from 'react-native';
import { useEffect, useState } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';

export const useForceOrientation = () => {
  const { width, height } = useWindowDimensions();
  const [forcedDimensions, setForcedDimensions] = useState({ width, height });
  
  useEffect(() => {
    // Always ensure width > height for landscape
    const maxDim = Math.max(width, height);
    const minDim = Math.min(width, height);
    
    setForcedDimensions({
      width: maxDim,
      height: minDim
    });
  }, [width, height]);
  
  // Lock orientation on mount
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE)
      .catch(error => console.warn('Failed to lock orientation:', error));
    
    return () => {
      ScreenOrientation.unlockAsync()
        .catch(error => console.warn('Failed to unlock orientation:', error));
    };
  }, []);
  
  return {
    width: forcedDimensions.width,
    height: forcedDimensions.height,
    isLandscape: true // Always return true for landscape
  };
}; 