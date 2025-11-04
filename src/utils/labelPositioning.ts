import { Dimensions } from 'react-native';
import { isTablet, isPhone } from './responsive';

// Device type detection for landscape mode
export const getLandscapeDeviceType = () => {
  const { width, height } = Dimensions.get('window');
  const minDimension = Math.min(width, height);
  const maxDimension = Math.max(width, height);
  
  // In landscape mode, we care about the shorter dimension for device type
  const isTabletDevice = minDimension >= 768;
  const isPhoneDevice = !isTabletDevice;
  
  return {
    isTablet: isTabletDevice,
    isPhone: isPhoneDevice,
    width: maxDimension, // Landscape width
    height: minDimension, // Landscape height
    minDimension,
    maxDimension
  };
};

// Universal label positioning configuration for landscape mode
export const LANDSCAPE_LABEL_CONFIG = {
  phone: {
    topOffset: -0.01,
    fontSize: 30,  // Increased from 18
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 18
  },
  tablet: {
    topOffset: 0.05, // Reduced from 0.1 to move labels down on iPads
    fontSize: 56,  // Increased to match phone size
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 24
  }
};

export interface LabelPositioningConfig {
  topOffset: number;
  fontSize: number;
  paddingVertical: number;
  paddingHorizontal: number;
  borderRadius: number;
}

export interface LabelPositioningResult {
  top: number;
  marginTop?: number; // Additional top position override for specific level adjustments
  fontSize: number;
  paddingVertical: number;
  paddingHorizontal: number;
  borderRadius: number;
}

/**
 * Get label positioning configuration for landscape mode
 * All levels use the same positioning configuration
 */
export const getLabelPositioning = (
  levelName: string,
  screenW: number,
  screenH: number,
  isLandscape: boolean
): LabelPositioningResult => {
  // Check if this is an iPhone (not tablet) for portrait mode adjustments
  const isPhoneDevice = Math.min(screenW, screenH) < 768;
  
  // Special adjustments for Desert and Ocean levels on iPhones
  if (!isLandscape && isPhoneDevice && (levelName.toLowerCase() === 'desert' || levelName.toLowerCase() === 'ocean')) {
    return {
      top: 0,
      marginTop: screenH * 0.8, // Override top position to push label down by 80% on iPhone Desert/Ocean
      fontSize: 50,  // Increased to match landscape
      paddingVertical: 20,
      paddingHorizontal: 32,
      borderRadius: 24
    };
  }
  
  // Only apply landscape positioning when in landscape mode
  if (!isLandscape) {
    // For iPads in portrait mode, add a small marginTop to move labels down
    const isTabletDevice = Math.min(screenW, screenH) >= 768;
    return {
      top: 0,
      marginTop: isTabletDevice ? screenH * 0.05 : 0, // Move labels down 5% on iPads in portrait
      fontSize: 50,  // Increased to match landscape
      paddingVertical: 20,
      paddingHorizontal: 32,
      borderRadius: 24
    };
  }

  const { isTablet, isPhone } = getLandscapeDeviceType();
  const deviceType = isTablet ? 'tablet' : 'phone';
  
  
  // Get the configuration for the device type
  const config = LANDSCAPE_LABEL_CONFIG[deviceType];
  
  // Calculate top position based on screen height and offset
  const top = - screenH * config.topOffset;
  
  return {
    top,
    fontSize: config.fontSize,
    paddingVertical: config.paddingVertical,
    paddingHorizontal: config.paddingHorizontal,
    borderRadius: config.borderRadius
  };
};

/**
 * Check if label should be rendered based on current state
 */
export const shouldRenderLabel = (
  showName: boolean,
  currentAnimal: any,
  isTransitioning: boolean,
  canRenderLabel: boolean
): boolean => {
  return Boolean(showName && currentAnimal && !isTransitioning && canRenderLabel);
};
