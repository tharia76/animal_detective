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

// Level-specific landscape positioning presets
export const LANDSCAPE_PRESETS = {
  // Forest level
  forest: {
    phone: {
      static: { topOffset: -0.8, heightMultiplier: 1, basePixels: 350 },
      moving: { topOffset: -0.3, heightMultiplier: 4.0, basePixels: 300 }
    },
    tablet: {
      static: { topOffset: -0.1, heightMultiplier: 2.5, basePixels: 400 },
      moving: { topOffset: -0.1, heightMultiplier: 0.65, basePixels: 300 }
    }
  },
  
  // Arctic level
  arctic: {
    phone: {
      static: { topOffset: -0.5, heightMultiplier: 1.5, basePixels: 200 },
      moving: { topOffset: -0.5, heightMultiplier: 1.5, basePixels: 300 }
    },
    tablet: {
      static: { topOffset: -1, heightMultiplier: 1, basePixels: 250 },
      moving: { topOffset: -0.2, heightMultiplier: 0.8, basePixels: 150 }
    }
  },
  
  // Savannah level
  savannah: {
    phone: {
      static: { topOffset: -0.9, heightMultiplier: 1.3, basePixels: 150 },
      moving: { topOffset: -0.3, heightMultiplier: 1.3, basePixels: 400 }
    },
    tablet: {
      static: { topOffset: -0.5, heightMultiplier: 1.5, basePixels: 250 },
      moving: { topOffset: -0.1, heightMultiplier: 1.1, basePixels: 150 }
    }
  },
  
  // Jungle level
  jungle: {
    phone: {
      static: { topOffset: -3, heightMultiplier: 0, basePixels: 300 },
      moving: { topOffset: -0.5, heightMultiplier: 1.8, basePixels: 400 }
    },
    tablet: {
      static: { topOffset: -1.5, heightMultiplier: -2, basePixels: 200 },
      moving: { topOffset: -0.1, heightMultiplier: 0.8, basePixels: 400 }
    }
  },
  
  // Birds level
  birds: {
    phone: {
      static: { topOffset: -1, heightMultiplier: 1, basePixels: 0 },
      moving: { topOffset: -0.1, heightMultiplier: 1.1, basePixels: 0 }
    },
    tablet: {
      static: { topOffset: -0.1, heightMultiplier: 0.1, basePixels: 0 },
      moving: { topOffset: -0.1, heightMultiplier: 1.1, basePixels: 0 }
    }
  },
  
  // Farm level
  farm: {
    phone: {
      static: { topOffset: -1, heightMultiplier: 1, basePixels: 350 },
      moving: { topOffset: -0.1, heightMultiplier: 1.1, basePixels: 350 }
    },
    tablet: {
      static: { topOffset: -0.1, heightMultiplier: 0.88, basePixels: 200 },
      moving: { topOffset: 0, heightMultiplier: 1.0, basePixels: 200 }
    }
  },
  
  // Ocean level
  ocean: {
    phone: {
      static: { topOffset: -0.1, heightMultiplier: 1.1, basePixels: 350 },
      moving: { topOffset: -0.1, heightMultiplier: 1.1, basePixels: 350 }
    },
    tablet: {
      static: { topOffset: 0, heightMultiplier: 1.0, basePixels: 200 },
      moving: { topOffset: 0, heightMultiplier: 1.0, basePixels: 200 }
    }
  },
  
  // Desert level
  desert: {
    phone: {
      static: { topOffset: -0.9, heightMultiplier: 1.1, basePixels: 350 },
      moving: { topOffset: -0.1, heightMultiplier: 1.1, basePixels: 350 }
    },
    tablet: {
      static: { topOffset: 0, heightMultiplier: 1.0, basePixels: 200 },
      moving: { topOffset: 0, heightMultiplier: 1.0, basePixels: 200 }
    }
  },
  
  // Insects level
  insects: {
    phone: {
      static: { topOffset: -0.8, heightMultiplier: 1.3, basePixels: 500 },
      moving: { topOffset: -0.3, heightMultiplier: 1.3, basePixels: 500 }
    },
    tablet: {
      static: { topOffset: -0.3, heightMultiplier: 1.3, basePixels: 350 },
      moving: { topOffset: -0.3, heightMultiplier: 1.3, basePixels: 350 }
    }
  }
};

// Get landscape-optimized background styles
export const getLandscapeBackgroundStyles = (
  levelName: string,
  isMoving: boolean
) => {
  const device = getLandscapeDeviceType();
  const level = levelName.toLowerCase();
  
  // Get preset for this level and device type
  const preset = LANDSCAPE_PRESETS[level as keyof typeof LANDSCAPE_PRESETS];
  if (!preset) {
    console.warn(`No landscape preset found for level: ${level}`);
    return { top: 0, height: device.height, position: 'absolute' as const, left: 0, right: 0, bottom: 0 };
  }
  
  const devicePreset = device.isTablet ? preset.tablet : preset.phone;
  const config = isMoving ? devicePreset.moving : devicePreset.static;
  
  // Calculate positioning
  const topOffset = device.height * config.topOffset;
  const heightExtension = config.basePixels + (device.height * Math.abs(config.topOffset));
  const finalHeight = device.height + heightExtension;
  
  return {
    top: topOffset,
    height: finalHeight,
    position: 'absolute' as const,
    left: 0,
    right: 0,
    bottom: 0
  };
};

// Get landscape-optimized background color
export const getLandscapeBackgroundColor = (levelName: string): string => {
  const colorMap: Record<string, string> = {
    forest: '#87CEEB',
    birds: '#87CEEB',
    jungle: '#1a3d1a',
    savannah: '#f4e4bc',
    ocean: '#006994',
    desert: '#f4e4bc',
    farm: '#87CEEB',
    arctic: '#87CEEB',
    insects: '#87CEEB'
  };
  return colorMap[levelName.toLowerCase()] || '#000';
};

// Helper to check if we should use landscape optimizations
export const shouldUseLandscapeOptimizations = (): boolean => {
  const { width, height } = Dimensions.get('window');
  return width > height; // Landscape mode
};
