import { Dimensions, Platform } from 'react-native';

const { width: screenW, height: screenH } = Dimensions.get('window');

// Device detection functions - optimized for landscape mode
export const isTablet = (): boolean => {
  const { width, height } = Dimensions.get('window');
  const minDimension = Math.min(width, height);
  const maxDimension = Math.max(width, height);
  
  // iPad detection based on actual screen sizes
  // iPad mini: 768x1024, iPad: 768x1024, iPad Pro: 834x1194, 1024x1366
  // iPhone max sizes are around 430x932 for iPhone 14 Pro Max
  return minDimension >= 768 || maxDimension >= 1024;
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

// Responsive scaling functions - optimized for landscape
export const getScaleFactor = (width: number, height: number): number => {
  const baseWidth = 375; // iPhone base width
  const baseHeight = 667; // iPhone base height
  
  if (isTablet()) {
    // Tablet scaling - optimized for landscape
    const tabletBaseWidth = 1024; // Use landscape width as base
    const tabletBaseHeight = 768; // Use portrait height as base
    const widthScale = width / tabletBaseWidth;
    const heightScale = height / tabletBaseHeight;
    return Math.min(widthScale, heightScale, 1.5); // Cap at 1.5x for tablets
  } else {
    // Phone scaling - optimized for landscape
    const phoneBaseWidth = 667; // Use landscape height as base (rotated)
    const phoneBaseHeight = 375; // Use portrait width as base (rotated)
    const widthScale = width / phoneBaseWidth;
    const heightScale = height / phoneBaseHeight;
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

// Device-specific responsive functions - optimized for landscape
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

// Responsive breakpoints - optimized for landscape mode
export const BREAKPOINTS = {
  SMALL_PHONE: 375,
  LARGE_PHONE: 414,
  TABLET: 768,
  LARGE_TABLET: 1024,
};

// Responsive grid helpers - optimized for landscape
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

// Landscape-specific helpers
export const getLandscapeOptimizedSpacing = (baseSpacing: number): number => {
  const scaleFactor = getScaleFactor(screenW, screenH);
  if (isLandscape()) {
    return isTablet() 
      ? Math.round(baseSpacing * scaleFactor * 1.1) // 10% more spacing on landscape tablets
      : Math.round(baseSpacing * scaleFactor * 0.9); // 10% less spacing on landscape phones
  }
  return getResponsiveSpacing(baseSpacing, scaleFactor);
};

export const getLandscapeOptimizedFontSize = (baseSize: number): number => {
  const scaleFactor = getScaleFactor(screenW, screenH);
  if (isLandscape()) {
    return isTablet()
      ? Math.min(baseSize * scaleFactor * 1.15, baseSize * 1.5) // Larger on landscape tablets
      : Math.max(baseSize * scaleFactor * 0.95, baseSize * 0.7); // Smaller on landscape phones
  }
  return getResponsiveFontSize(baseSize, scaleFactor);
};

// Export current screen dimensions
export { screenW, screenH }; 