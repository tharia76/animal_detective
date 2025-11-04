import { Dimensions, Platform } from 'react-native';
// Note: useSafeAreaInsets should be imported where needed

export interface DeviceInfo {
  width: number;
  height: number;
  isLandscape: boolean;
  isTablet: boolean;
  isPhone: boolean;
  aspectRatio: number;
  pixelDensity: number;
  deviceType: 'phone' | 'tablet' | 'foldable';
  screenCategory: 'small' | 'medium' | 'large' | 'xlarge';
  safeAreaTop: number;
  safeAreaBottom: number;
  safeAreaLeft: number;
  safeAreaRight: number;
}

export interface BackgroundStyles {
  position: 'absolute';
  top: number;
  left: number;
  right: number;
  width: number;
  height: number;
  resizeMode: 'cover' | 'contain' | 'stretch' | 'repeat';
  transform?: Array<{ scale?: number; translateX?: number; translateY?: number; }>;
}

// Device detection with comprehensive coverage
export const getDeviceInfo = (safeAreaInsets?: any): DeviceInfo => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const { width: realWidth, height: realHeight } = Dimensions.get('screen');
  
  const isLandscape = screenWidth > screenHeight;
  const minDimension = Math.min(screenWidth, screenHeight);
  const maxDimension = Math.max(screenWidth, screenHeight);
  const aspectRatio = maxDimension / minDimension;
  
  // Enhanced device type detection
  const isTablet = minDimension >= 768;
  const isPhone = !isTablet;
  
  // Detect foldable devices
  const isFoldable = aspectRatio > 2.0 || (realWidth > screenWidth * 1.5) || (realHeight > screenHeight * 1.5);
  
  // Screen size categories
  let screenCategory: 'small' | 'medium' | 'large' | 'xlarge';
  if (minDimension < 400) screenCategory = 'small';
  else if (minDimension < 600) screenCategory = 'medium';
  else if (minDimension < 900) screenCategory = 'large';
  else screenCategory = 'xlarge';
  
  // Calculate pixel density
  const pixelDensity = Platform.select({
    ios: require('react-native').PixelRatio.get(),
    android: require('react-native').PixelRatio.get(),
    default: 2
  });

  return {
    width: screenWidth,
    height: screenHeight,
    isLandscape,
    isTablet,
    isPhone,
    aspectRatio,
    pixelDensity,
    deviceType: isFoldable ? 'foldable' : isTablet ? 'tablet' : 'phone',
    screenCategory,
    safeAreaTop: safeAreaInsets?.top || 0,
    safeAreaBottom: safeAreaInsets?.bottom || 0,
    safeAreaLeft: safeAreaInsets?.left || 0,
    safeAreaRight: safeAreaInsets?.right || 0,
  };
};

// Advanced level background configurations - ALL LEVELS NOW USE SAME POSITIONING
const LEVEL_BACKGROUND_CONFIGS = {
  forest: {
    baseConfig: {
      aspectRatioOptimal: 1.78, // 16:9 optimized
      verticalAlignment: 'center', // top, center, bottom
      horizontalAlignment: 'center', // left, center, right
      scaleStrategy: 'cover', // cover, contain, stretch, smart
    },
    deviceOverrides: {
      phone: {
        portrait: { topOffset: -0.03, scale: 1.0, verticalAlignment: 'center' },
        landscape: { topOffset: -0.03, scale: 1.0, verticalAlignment: 'center' }
      },
      tablet: {
        portrait: { topOffset: 0, scale: 1.0, verticalAlignment: 'center' },
        landscape: { topOffset: 0, scale: 1.0, verticalAlignment: 'center' }
      },
      foldable: {
        portrait: { topOffset: -0.03, scale: 1.05, verticalAlignment: 'center' },
        landscape: { topOffset: -0.03, scale: 1.0, verticalAlignment: 'center' }
      }
    }
  },
  
  ocean: {
    baseConfig: {
      aspectRatioOptimal: 1.78,
      verticalAlignment: 'center',
      horizontalAlignment: 'center',
      scaleStrategy: 'cover',
    },
    deviceOverrides: {
      phone: {
        portrait: { topOffset: -0.03, scale: 1.0, verticalAlignment: 'center' },
        landscape: { topOffset: -0.03, scale: 1.0, verticalAlignment: 'center' }
      },
      tablet: {
        portrait: { topOffset: 0, scale: 1.0, verticalAlignment: 'center' },
        landscape: { topOffset: 0, scale: 1.0, verticalAlignment: 'center' }
      },
      foldable: {
        portrait: { topOffset: -0.03, scale: 1.05, verticalAlignment: 'center' },
        landscape: { topOffset: -0.03, scale: 1.0, verticalAlignment: 'center' }
      }
    }
  },
  
  desert: {
    baseConfig: {
      aspectRatioOptimal: 1.78,
      verticalAlignment: 'center',
      horizontalAlignment: 'center',
      scaleStrategy: 'cover',
    },
    deviceOverrides: {
      phone: {
        portrait: { topOffset: -0.03, scale: 1.0, verticalAlignment: 'center' },
        landscape: { topOffset: -0.03, scale: 1.0, verticalAlignment: 'center' }
      },
      tablet: {
        portrait: { topOffset: 0, scale: 1.0, verticalAlignment: 'center' },
        landscape: { topOffset: 0, scale: 1.0, verticalAlignment: 'center' }
      },
      foldable: {
        portrait: { topOffset: -0.03, scale: 1.05, verticalAlignment: 'center' },
        landscape: { topOffset: -0.03, scale: 1.0, verticalAlignment: 'center' }
      }
    }
  },
  
  arctic: {
    baseConfig: {
      aspectRatioOptimal: 1.78,
      verticalAlignment: 'center',
      horizontalAlignment: 'center',
      scaleStrategy: 'cover',
    },
    deviceOverrides: {
      phone: {
        portrait: { topOffset: -0.03, scale: 1.0, verticalAlignment: 'center' },
        landscape: { topOffset: -0.03, scale: 1.0, verticalAlignment: 'center' }
      },
      tablet: {
        portrait: { topOffset: 0, scale: 1.0, verticalAlignment: 'center' },
        landscape: { topOffset: 0, scale: 1.0, verticalAlignment: 'center' }
      },
      foldable: {
        portrait: { topOffset: -0.03, scale: 1.05, verticalAlignment: 'center' },
        landscape: { topOffset: -0.03, scale: 1.0, verticalAlignment: 'center' }
      }
    }
  },
  
  jungle: {
    baseConfig: {
      aspectRatioOptimal: 1.78,
      verticalAlignment: 'center',
      horizontalAlignment: 'center',
      scaleStrategy: 'cover',
    },
    deviceOverrides: {
      phone: {
        portrait: { topOffset: -0.03, scale: 1.0, verticalAlignment: 'center' },
        landscape: { topOffset: -0.03, scale: 1.0, verticalAlignment: 'center' }
      },
      tablet: {
        portrait: { topOffset: 0, scale: 1.0, verticalAlignment: 'center' },
        landscape: { topOffset: 0, scale: 1.0, verticalAlignment: 'center' }
      },
      foldable: {
        portrait: { topOffset: -0.03, scale: 1.05, verticalAlignment: 'center' },
        landscape: { topOffset: -0.03, scale: 1.0, verticalAlignment: 'center' }
      }
    }
  },
  
  savannah: {
    baseConfig: {
      aspectRatioOptimal: 1.78,
      verticalAlignment: 'center',
      horizontalAlignment: 'center',
      scaleStrategy: 'cover',
    },
    deviceOverrides: {
      phone: {
        portrait: { topOffset: -0.03, scale: 1.0, verticalAlignment: 'center' },
        landscape: { topOffset: -0.03, scale: 1.0, verticalAlignment: 'center' }
      },
      tablet: {
        portrait: { topOffset: 0, scale: 1.0, verticalAlignment: 'center' },
        landscape: { topOffset: 0, scale: 1.0, verticalAlignment: 'center' }
      },
      foldable: {
        portrait: { topOffset: -0.03, scale: 1.05, verticalAlignment: 'center' },
        landscape: { topOffset: -0.03, scale: 1.0, verticalAlignment: 'center' }
      }
    }
  },
  
  farm: {
    baseConfig: {
      aspectRatioOptimal: 1.78,
      verticalAlignment: 'center',
      horizontalAlignment: 'center',
      scaleStrategy: 'cover',
    },
    deviceOverrides: {
      phone: {
        portrait: { topOffset: -0.03, scale: 1.0, verticalAlignment: 'center' },
        landscape: { topOffset: -0.03, scale: 1.0, verticalAlignment: 'center' }
      },
      tablet: {
        portrait: { topOffset: 0, scale: 1.0, verticalAlignment: 'center' },
        landscape: { topOffset: 0, scale: 1.0, verticalAlignment: 'center' }
      },
      foldable: {
        portrait: { topOffset: -0.03, scale: 1.05, verticalAlignment: 'center' },
        landscape: { topOffset: -0.03, scale: 1.0, verticalAlignment: 'center' }
      }
    }
  },
  
  birds: {
    baseConfig: {
      aspectRatioOptimal: 1.78,
      verticalAlignment: 'center',
      horizontalAlignment: 'center',
      scaleStrategy: 'cover',
    },
    deviceOverrides: {
      phone: {
        portrait: { topOffset: -0.03, scale: 1.0, verticalAlignment: 'center' },
        landscape: { topOffset: -0.03, scale: 1.0, verticalAlignment: 'center' }
      },
      tablet: {
        portrait: { topOffset: 0, scale: 1.0, verticalAlignment: 'center' },
        landscape: { topOffset: 0, scale: 1.0, verticalAlignment: 'center' }
      },
      foldable: {
        portrait: { topOffset: -0.03, scale: 1.05, verticalAlignment: 'center' },
        landscape: { topOffset: -0.03, scale: 1.0, verticalAlignment: 'center' }
      }
    }
  },
  
  insects: {
    baseConfig: {
      aspectRatioOptimal: 1.78,
      verticalAlignment: 'center',
      horizontalAlignment: 'center',
      scaleStrategy: 'cover',
    },
    deviceOverrides: {
      phone: {
        portrait: { topOffset: -0.03, scale: 1.0, verticalAlignment: 'center' },
        landscape: { topOffset: -0.03, scale: 1.0, verticalAlignment: 'center' }
      },
      tablet: {
        portrait: { topOffset: 0, scale: 1.0, verticalAlignment: 'center' },
        landscape: { topOffset: 0, scale: 1.0, verticalAlignment: 'center' }
      },
      foldable: {
        portrait: { topOffset: -0.03, scale: 1.05, verticalAlignment: 'center' },
        landscape: { topOffset: -0.03, scale: 1.0, verticalAlignment: 'center' }
      }
    }
  }
};

// Calculate responsive background styles
export const getResponsiveBackgroundStyles = (
  levelName: string,
  deviceInfo: DeviceInfo,
  isMovingBg: boolean = false
): BackgroundStyles => {
  const level = levelName.toLowerCase();
  const config = LEVEL_BACKGROUND_CONFIGS[level as keyof typeof LEVEL_BACKGROUND_CONFIGS];
  
  if (level === 'savannah') {
    console.log('🦁 SAVANNAH PROCESSING:', { level, configExists: !!config, deviceType: deviceInfo.deviceType, isLandscape: deviceInfo.isLandscape });
  }
  
  if (!config) {
    console.warn(`No configuration found for level: ${level}`);
    return getDefaultBackgroundStyles(deviceInfo);
  }
  
  // Get device-specific overrides
  const orientation = deviceInfo.isLandscape ? 'landscape' : 'portrait';
  const deviceOverride = config.deviceOverrides[deviceInfo.deviceType]?.[orientation];
  
  // Base calculations
  const { width, height, safeAreaTop, safeAreaBottom, safeAreaLeft, safeAreaRight } = deviceInfo;
  
  // Apply device overrides or use base config
  const topOffset = deviceOverride?.topOffset || 0;
  const scale = deviceOverride?.scale || 1.0;
  const verticalAlignment = deviceOverride?.verticalAlignment || config.baseConfig.verticalAlignment;
  
  // Calculate positioning based on alignment and safe areas
  let top = 0;
  let calculatedHeight = height + safeAreaTop + safeAreaBottom;
  
  // Apply vertical alignment - ensure notch area is covered
  switch (verticalAlignment) {
    case 'top':
      top = -safeAreaTop + (height * topOffset);
      calculatedHeight = height + safeAreaTop + safeAreaBottom + Math.abs(height * topOffset);
      break;
    case 'bottom':
      top = height * topOffset;
      calculatedHeight = height + safeAreaTop + safeAreaBottom + Math.abs(height * topOffset);
      break;
    case 'center':
    default:
      top = -safeAreaTop + (height * topOffset);
      calculatedHeight = height + Math.abs(height * topOffset) + safeAreaTop + safeAreaBottom;
      break;
  }
  
  // Apply scale adjustments
  if (scale !== 1.0) {
    const scaledHeight = calculatedHeight * scale;
    const heightDifference = scaledHeight - calculatedHeight;
    top -= heightDifference / 2; // Center the scaled image
    calculatedHeight = scaledHeight;
  }
  
  // Handle safe areas for landscape
  const leftOffset = deviceInfo.isLandscape ? safeAreaLeft : 0;
  const rightOffset = deviceInfo.isLandscape ? safeAreaRight : 0;
  
  const styles: BackgroundStyles = {
    position: 'absolute',
    top: Math.round(top),
    left: leftOffset,
    right: rightOffset,
    width: width + leftOffset + rightOffset, // Ensure full width coverage
    height: Math.round(calculatedHeight),
    resizeMode: 'cover',
  };
  
  // Add transform if scaling is needed
  if (scale !== 1.0) {
    styles.transform = [{ scale }];
  }
  
  console.log(`🦁 SAVANNAH DEBUG - Background styles for ${level} (${deviceInfo.deviceType} ${orientation}):`, {
    top: styles.top,
    height: styles.height,
    scale,
    topOffset,
    verticalAlignment,
    configFound: !!config,
    deviceOverride: deviceOverride,
    deviceInfo: {
      width,
      height,
      aspectRatio: deviceInfo.aspectRatio,
      safeArea: { top: safeAreaTop, bottom: safeAreaBottom, left: safeAreaLeft, right: safeAreaRight }
    }
  });
  
  return styles;
};

// Default fallback styles
const getDefaultBackgroundStyles = (deviceInfo: DeviceInfo): BackgroundStyles => ({
  position: 'absolute',
  top: -deviceInfo.safeAreaTop,
  left: deviceInfo.isLandscape ? deviceInfo.safeAreaLeft : 0,
  right: deviceInfo.isLandscape ? deviceInfo.safeAreaRight : 0,
  width: deviceInfo.width + (deviceInfo.isLandscape ? deviceInfo.safeAreaLeft + deviceInfo.safeAreaRight : 0),
  height: deviceInfo.height + deviceInfo.safeAreaTop + deviceInfo.safeAreaBottom,
  resizeMode: 'cover',
});

// Get level background color (for fallback)
export const getResponsiveLevelBackgroundColor = (levelName: string): string => {
  const colorMap: Record<string, string> = {
    forest: '#2d5a3d',
    birds: '#87ceeb',
    jungle: '#1a4d1a',
    savannah: '#deb887',
    ocean: '#006994',
    desert: '#f4a460',
    farm: '#87ceeb',
    arctic: '#b0e0e6',
    insects: '#90ee90'
  };
  return colorMap[levelName.toLowerCase()] || '#87ceeb';
};

// Helper function for using responsive backgrounds (import useSafeAreaInsets where needed)
export const createResponsiveBackgroundData = (levelName: string, safeAreaInsets: any, isMovingBg: boolean = false) => {
  const deviceInfo = getDeviceInfo(safeAreaInsets);
  const styles = getResponsiveBackgroundStyles(levelName, deviceInfo, isMovingBg);
  const backgroundColor = getResponsiveLevelBackgroundColor(levelName);
  
  return {
    styles,
    backgroundColor,
    deviceInfo
  };
};