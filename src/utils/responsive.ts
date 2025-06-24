import { Dimensions, Platform } from 'react-native';

const { width: screenW, height: screenH } = Dimensions.get('window');

// Device detection functions
export const isTablet = (): boolean => {
  const { width, height } = Dimensions.get('window');
  const aspectRatio = height / width;
  return aspectRatio <= 1.6;
};

export const isPhone = (): boolean => {
  return !isTablet();
};

export const isSmallPhone = (): boolean => {
  const { width, height } = Dimensions.get('window');
  return Math.min(width, height) < 375;
};

export const isLargePhone = (): boolean => {
  const { width, height } = Dimensions.get('window');
  return Math.min(width, height) >= 414;
};

export const isIOS = (): boolean => {
  return Platform.OS === 'ios';
};

export const isAndroid = (): boolean => {
  return Platform.OS === 'android';
};

// Responsive scaling functions
export const getScaleFactor = (width: number, height: number): number => {
  const baseWidth = 375; // iPhone base width
  const baseHeight = 667; // iPhone base height
  
  if (isTablet()) {
    // Tablet scaling
    const tabletBaseWidth = 768;
    const tabletBaseHeight = 1024;
    const widthScale = width / tabletBaseWidth;
    const heightScale = height / tabletBaseHeight;
    return Math.min(widthScale, heightScale, 1.5); // Cap at 1.5x for tablets
  } else {
    // Phone scaling
    const widthScale = width / baseWidth;
    const heightScale = height / baseHeight;
    const scale = Math.min(widthScale, heightScale);
    
    if (isSmallPhone()) {
      return Math.max(scale, 0.8); // Minimum 0.8x for small phones
    } else if (isLargePhone()) {
      return Math.min(scale, 1.2); // Maximum 1.2x for large phones
    }
    return scale;
  }
};

export const getResponsiveSpacing = (baseSpacing: number, scaleFactor: number): number => {
  return Math.round(baseSpacing * scaleFactor);
};

export const getResponsiveFontSize = (baseSize: number, scaleFactor: number): number => {
  const scaledSize = baseSize * scaleFactor;
  // Ensure minimum and maximum font sizes
  return Math.max(Math.min(scaledSize, baseSize * 1.5), baseSize * 0.7);
};

export const getResponsiveIconSize = (baseSize: number, scaleFactor: number): number => {
  return Math.round(baseSize * scaleFactor);
};

// Device-specific responsive functions
export const getResponsivePadding = (basePadding: number, scaleFactor: number): number => {
  if (isTablet()) {
    return Math.round(basePadding * scaleFactor * 1.2); // Slightly more padding on tablets
  }
  return getResponsiveSpacing(basePadding, scaleFactor);
};

export const getResponsiveMargin = (baseMargin: number, scaleFactor: number): number => {
  if (isTablet()) {
    return Math.round(baseMargin * scaleFactor * 1.1); // Slightly more margin on tablets
  }
  return getResponsiveSpacing(baseMargin, scaleFactor);
};

// Screen dimension helpers
export const getScreenDimensions = () => {
  return { width: screenW, height: screenH };
};

export const isPortrait = (): boolean => {
  return screenH >= screenW;
};

export const isLandscape = (): boolean => {
  return screenW > screenH;
};

// Responsive breakpoints
export const BREAKPOINTS = {
  SMALL_PHONE: 375,
  LARGE_PHONE: 414,
  TABLET: 768,
  LARGE_TABLET: 1024,
};

// Responsive grid helpers
export const getResponsiveColumns = (width: number, isLandscape: boolean): number => {
  if (isTablet()) {
    return isLandscape ? 4 : 3;
  } else {
    return isLandscape ? 3 : 2;
  }
};

export const getResponsiveTileSize = (width: number, height: number, isLandscape: boolean): number => {
  const scaleFactor = getScaleFactor(width, height);
  const baseSize = isLandscape ? 80 : 100;
  
  if (isTablet()) {
    return Math.min(getResponsiveSpacing(baseSize, scaleFactor), isLandscape ? 120 : 140);
  } else {
    return Math.min(getResponsiveSpacing(baseSize, scaleFactor), isLandscape ? 100 : 120);
  }
};

// Safe area helpers for different devices
export const getSafeAreaTop = (): number => {
  if (isIOS()) {
    return isTablet() ? 20 : 44; // Status bar height varies on iOS
  } else {
    return isTablet() ? 24 : 24; // Android status bar
  }
};

export const getSafeAreaBottom = (): number => {
  if (isIOS()) {
    return isTablet() ? 20 : 34; // Home indicator on newer iPhones
  } else {
    return isTablet() ? 24 : 0; // Android navigation bar
  }
};

// Export current screen dimensions
export { screenW, screenH }; 