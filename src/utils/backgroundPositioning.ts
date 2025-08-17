import { getResponsiveSpacing, getScaleFactor } from './responsive';
import { getLandscapeBackgroundStyles, getLandscapeBackgroundColor as getLandscapeColor } from './landscapeBackgrounds';

export interface LevelAdjustments {
  tablet: number;
  phone: number;
}

export interface BasePixels {
  tablet: number;
  phone: number;
}

export interface BackgroundStyles {
  top: number;
  height: number;
  position: 'absolute';
  left: number;
  right: number;
  bottom: number;
}

// Device type detection
const getDeviceType = (screenW: number, screenH: number) => {
  const minDimension = Math.min(screenW, screenH);
  const isTablet = minDimension >= 768;
  return { isTablet, isPhone: !isTablet };
};

// Level-specific positioning configurations
const LEVEL_CONFIGS = {
  forest: {
    adjustments: { tablet: -0.35, phone: 0.3 },
    basePixels: { tablet: 300, phone: 350 },
    movingAdjustments: { tablet: 1.5, phone: 3.0 },
    movingBasePixels: { tablet: 400, phone: 300 }
  },
  arctic: {
    adjustments: { tablet: -0.2, phone: 0.5 },
    basePixels: { tablet: 150, phone: 200 },
    movingAdjustments: { tablet: 0.8, phone: 0.5 },
    movingBasePixels: { tablet: 250, phone: 300 }
  },
  savannah: {
    adjustments: { tablet: -0.1, phone: 0.3 },
    basePixels: { tablet: 150, phone: 150 },
    movingAdjustments: { tablet: 0.5, phone: 0.5 },
    movingBasePixels: { tablet: 250, phone: 400 }
  },
  jungle: {
    adjustments: { tablet: -0.2, phone: 0.5 },
    basePixels: { tablet: 400, phone: 600 },
    movingAdjustments: { tablet: 0.8, phone: 0.8 },
    movingBasePixels: { tablet: 400, phone: 400 }
  },
  birds: {
    adjustments: { tablet: 0.1, phone: 0.1 },
    basePixels: { tablet: 0, phone: 0 },
    movingAdjustments: { tablet: 0.1, phone: 0.1 },
    movingBasePixels: { tablet: 0, phone: 0 }
  },
  farm: {
    adjustments: { tablet: -0.12, phone: 0.1 },
    basePixels: { tablet: 200, phone: 350 },
    movingAdjustments: { tablet: 0, phone: 0.1 },
    movingBasePixels: { tablet: 200, phone: 350 }
  },
  ocean: {
    adjustments: { tablet: 0, phone: 0.1 },
    basePixels: { tablet: 200, phone: 350 },
    movingAdjustments: { tablet: 0, phone: 0.1 },
    movingBasePixels: { tablet: 200, phone: 350 }
  },
  desert: {
    adjustments: { tablet: 0, phone: 0.1 },
    basePixels: { tablet: 200, phone: 350 },
    movingAdjustments: { tablet: 0, phone: 0.1 },
    movingBasePixels: { tablet: 200, phone: 350 }
  },
  insects: {
    adjustments: { tablet: 0.3, phone: 0.3 },
    basePixels: { tablet: 350, phone: 500 },
    movingAdjustments: { tablet: 0.3, phone: 0.3 },
    movingBasePixels: { tablet: 350, phone: 500 }
  }
};

export const getBackgroundStyles = (
  isMoving: boolean,
  levelName: string,
  screenW: number,
  screenH: number,
  isLandscape: boolean
): BackgroundStyles => {
  // If in landscape mode, use the optimized landscape system
  if (isLandscape) {
    return getLandscapeBackgroundStyles(levelName, isMoving);
  }

  // Fallback to legacy system for portrait mode
  const { isTablet, isPhone } = getDeviceType(screenW, screenH);
  const level = levelName.toLowerCase();
  
  console.log('getBackgroundStyles called (portrait fallback):', {
    isMoving,
    isTablet,
    isPhone,
    isLandscape,
    level,
    screenW,
    screenH
  });

  // Get level configuration
  const config = LEVEL_CONFIGS[level as keyof typeof LEVEL_CONFIGS] || {
    adjustments: { tablet: 0, phone: 0 },
    basePixels: { tablet: 0, phone: 0 },
    movingAdjustments: { tablet: 0, phone: 0 },
    movingBasePixels: { tablet: 0, phone: 0 }
  };

  // Select appropriate values based on moving state
  const adjustments = isMoving ? config.movingAdjustments : config.adjustments;
  const basePixels = isMoving ? config.movingBasePixels : config.basePixels;

  let topOffset = 0;
  let heightExtension = 0;

  if (isPhone) {
    // Portrait phones
    const upPercent = adjustments.phone;
    const basePixel = basePixels.phone;
    topOffset = -(basePixel + (screenH * upPercent));
    heightExtension = basePixel + (screenH * upPercent);
  } else {
    // Tablets
    const upPercent = adjustments.tablet;
    const basePixel = basePixels.tablet;
    topOffset = -(basePixel + (screenH * upPercent));
    heightExtension = basePixel + (screenH * upPercent);
  }

  // Calculate final height
  const finalHeight = topOffset < 0 
    ? screenH + heightExtension + Math.abs(topOffset)
    : screenH + heightExtension;

  const result: BackgroundStyles = {
    top: topOffset,
    height: finalHeight,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  };

  return result;
};

// Helper function to get level background color
export const getLevelBackgroundColor = (levelName: string): string => {
  // Use landscape-optimized colors when possible
  return getLandscapeColor(levelName);
};
