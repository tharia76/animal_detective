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
    topOffset: -0.1,
    fontSize: 18,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16
  },
  tablet: {
    topOffset: -0.15,
    fontSize: 25,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16
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
  // Only apply landscape positioning when in landscape mode
  if (!isLandscape) {
    return {
      top: 0,
      fontSize: 18,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 16
    };
  }

  const { isTablet, isPhone } = getLandscapeDeviceType();
  const deviceType = isTablet ? 'tablet' : 'phone';
  
  // Get the configuration for the device type
  const config = LANDSCAPE_LABEL_CONFIG[deviceType];
  
  // Calculate top position based on screen height and offset
  const top = screenH * config.topOffset;
  
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
