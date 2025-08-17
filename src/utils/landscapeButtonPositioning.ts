import { Dimensions } from 'react-native';
import { isTablet, getScaleFactor, getResponsiveSpacing } from './responsive';

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

// Button positioning presets for landscape mode
export const LANDSCAPE_BUTTON_PRESETS = {
  // Home button positioning
  homeButton: {
    phone: {
      top: 30,
      right: 100,
      paddingVertical: 18,
      paddingHorizontal: 25,
      borderRadius: 35,
      iconSize: 30
    },
    tablet: {
      top: 30,
      right: 100,
      paddingVertical: 20,
      paddingHorizontal: 30,
      borderRadius: 40,
      iconSize: 40
    }
  },
  
  // Document button positioning
  documentButton: {
    phone: {
      top: 100,
      right: 100,
      paddingVertical: 18,
      paddingHorizontal: 25,
      borderRadius: 35,
      iconSize: 30
    },
    tablet: {
      top: 120,
      right: 100,
      paddingVertical: 20,
      paddingHorizontal: 30,
      borderRadius: 40,
      iconSize: 40
    }
  },
  
  // Badge positioning
  badge: {
    phone: {
      top: 80, // Positioned above document button
      right: 0, // Slightly to the left of document button
      minWidth: 95,
      height: 54,
      borderRadius: 32,
      borderWidth: 4
    },
    tablet: {
      top: 20, // Positioned above document button
      right: 0, // Slightly to the left of document button
      minWidth: 130,
      height: 78,
      borderRadius: 48,
      borderWidth: 6
    }
  },
  
  // Video intro button positioning
  videoButtons: {
    phone: {
      top: 20,
      right: 20,
      gap: 15,
      skipButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 25,
        minWidth: 100
      },
      homeButton: {
        backgroundColor: 'orange',
        paddingHorizontal: 16,
        paddingVertical: 20,
        borderRadius: 25,
        minWidth: 100
      }
    },
    tablet: {
      top: 20, // Updated to match your desired positioning
      right: 100, // Updated to match your desired positioning
      gap: 15,
      skipButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 25,
        minWidth: 100
      },
      homeButton: {
        backgroundColor: 'orange',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 25,
        minWidth: 100
      }
    }
  }
};

// Get landscape button styles for home button
export const getHomeButtonLandscapeStyles = (screenW: number, screenH: number) => {
  const deviceType = getLandscapeDeviceType();
  const scaleFactor = getScaleFactor(screenW, screenH);
  const preset = LANDSCAPE_BUTTON_PRESETS.homeButton[deviceType.isTablet ? 'tablet' : 'phone'];
  
  // Apply iPad-specific adjustments
  const ipadOffset = screenW >= 1000 ? screenH * 0.05 : 0;
  
  return {
    position: 'absolute' as const,
    top: getResponsiveSpacing(preset.top, scaleFactor) + ipadOffset,
    right: getResponsiveSpacing(preset.right, scaleFactor),
    backgroundColor: 'orange',
    paddingVertical: getResponsiveSpacing(preset.paddingVertical, scaleFactor),
    paddingHorizontal: getResponsiveSpacing(preset.paddingHorizontal, scaleFactor),
    borderRadius: getResponsiveSpacing(preset.borderRadius, scaleFactor),
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    zIndex: 10001
  };
};

// Get landscape button styles for document button
export const getDocumentButtonLandscapeStyles = (screenW: number, screenH: number) => {
  const deviceType = getLandscapeDeviceType();
  const scaleFactor = getScaleFactor(screenW, screenH);
  const preset = LANDSCAPE_BUTTON_PRESETS.documentButton[deviceType.isTablet ? 'tablet' : 'phone'];
  
  // Apply iPad-specific adjustments
  const ipadOffset = screenW >= 1000 ? screenH * 0.05 : 0;
  
  return {
    position: 'absolute' as const,
    top: getResponsiveSpacing(preset.top, scaleFactor) + ipadOffset,
    right: getResponsiveSpacing(preset.right, scaleFactor),
    backgroundColor: '#9370DB', // Purple color
    paddingVertical: getResponsiveSpacing(preset.paddingVertical, scaleFactor),
    paddingHorizontal: getResponsiveSpacing(preset.paddingHorizontal, scaleFactor),
    borderRadius: getResponsiveSpacing(preset.borderRadius, scaleFactor),
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    zIndex: 10001
  };
};

// Get landscape badge styles
export const getBadgeLandscapeStyles = (screenW: number, screenH: number, isCompleted: boolean = false) => {
  const deviceType = getLandscapeDeviceType();
  const scaleFactor = getScaleFactor(screenW, screenH);
  const preset = LANDSCAPE_BUTTON_PRESETS.badge[deviceType.isTablet ? 'tablet' : 'phone'];
  
  // Apply iPad-specific adjustments
  const ipadOffset = screenW >= 1000 ? screenH * 0.1 : 0;
  
  return {
    position: 'absolute' as const,
    top: getResponsiveSpacing(preset.top, scaleFactor) + ipadOffset,
    right: preset.right,
    backgroundColor: isCompleted ? '#FF69B4' : 'yellow', // Pink when complete, yellow otherwise
    borderRadius: preset.borderRadius,
    minWidth: preset.minWidth,
    height: preset.height,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: preset.borderWidth,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 18,
    // Keep badge visible and in same position regardless of completion state
    opacity: 1
  };
};

// Get landscape icon sizes
export const getLandscapeIconSize = (screenW: number, baseSize: number = 30) => {
  return screenW >= 900 ? baseSize + 10 : baseSize;
};

// Get landscape button spacing
export const getLandscapeButtonSpacing = (screenW: number, screenH: number) => {
  const deviceType = getLandscapeDeviceType();
  const scaleFactor = getScaleFactor(screenW, screenH);
  
  if (deviceType.isTablet) {
    return {
      homeToDocument: getResponsiveSpacing(120, scaleFactor),
      documentToBadge: getResponsiveSpacing(50, scaleFactor)
    };
  } else {
    return {
      homeToDocument: getResponsiveSpacing(80, scaleFactor),
      documentToBadge: getResponsiveSpacing(50, scaleFactor)
    };
  }
};

// Get landscape video button styles
export const getVideoButtonLandscapeStyles = (screenW: number, screenH: number) => {
  const deviceType = getLandscapeDeviceType();
  const scaleFactor = getScaleFactor(screenW, screenH);
  const preset = LANDSCAPE_BUTTON_PRESETS.videoButtons[deviceType.isTablet ? 'tablet' : 'phone'];
  
  return {
    container: {
      position: 'absolute' as const,
      top: preset.top,
      right: preset.right,
      flexDirection: 'row' as const,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      gap: preset.gap,
      zIndex: 2
    },
    skipButton: {
      backgroundColor: preset.skipButton.backgroundColor,
      paddingHorizontal: preset.skipButton.paddingHorizontal,
      paddingVertical: preset.skipButton.paddingVertical,
      borderRadius: preset.skipButton.borderRadius,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 8,
      minWidth: preset.skipButton.minWidth,
      justifyContent: 'center' as const
    },
    homeButton: {
      backgroundColor: preset.homeButton.backgroundColor,
      paddingHorizontal: preset.homeButton.paddingHorizontal,
      paddingVertical: preset.homeButton.paddingVertical,
      borderRadius: preset.homeButton.borderRadius,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 8,
      minWidth: preset.homeButton.minWidth,
      justifyContent: 'center' as const
    }
  };
};

// Get all landscape button positions at once
export const getAllLandscapeButtonPositions = (screenW: number, screenH: number, isCompleted: boolean = false) => {
  return {
    homeButton: getHomeButtonLandscapeStyles(screenW, screenH),
    documentButton: getDocumentButtonLandscapeStyles(screenW, screenH),
    badge: getBadgeLandscapeStyles(screenW, screenH, isCompleted),
    videoButtons: getVideoButtonLandscapeStyles(screenW, screenH),
    iconSize: getLandscapeIconSize(screenW),
    spacing: getLandscapeButtonSpacing(screenW, screenH)
  };
};
