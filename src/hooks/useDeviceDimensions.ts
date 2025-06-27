import { useWindowDimensions, Platform, Dimensions } from 'react-native';

export const useDeviceDimensions = () => {
  const window = useWindowDimensions();
  
  // Get the screen dimensions (not window dimensions)
  const screen = Dimensions.get('screen');
  
  // For iPad, we want to use the full screen dimensions
  // and scale the content appropriately
  const isTablet = Platform.OS === 'ios' && (screen.width >= 768 || screen.height >= 768);
  
  if (isTablet) {
    // On iPad, use the full screen dimensions to avoid black bars
    return {
      width: screen.width,
      height: screen.height,
      scale: Math.min(screen.width / 375, screen.height / 812), // Scale based on iPhone dimensions
      isTablet: true,
      isLandscape: screen.width > screen.height,
    };
  }
  
  // On phones, use window dimensions as usual
  return {
    width: window.width,
    height: window.height,
    scale: 1,
    isTablet: false,
    isLandscape: window.width > window.height,
  };
}; 