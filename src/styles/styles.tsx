import { useWindowDimensions, StyleSheet, Platform, Dimensions } from 'react-native';
import { useMemo } from 'react';
import {
  isTablet,
  isSmallPhone,
  isLargePhone,
  getScaleFactor,
  getResponsiveSpacing,
  getResponsiveFontSize,
  getResponsiveIconSize,
  getResponsivePadding,
  getResponsiveMargin,
  isPortrait,
  isLandscape,
  getSafeAreaTop,
  getSafeAreaBottom,
} from '../utils/responsive';

// Device detection and responsive scaling
// const { width: screenW, height: screenH } = Dimensions.get('window');

// Device type detection
// const isTabletDevice = isTablet();

// const isPhone = () => {
//   return !isTablet();
// };

// const isSmallPhoneDevice = isSmallPhone();
// const isLargePhoneDevice = isLargePhone();

// Responsive scaling functions
// const getScaleFactor = (width: number, height: number): number => {
//   const baseWidth = 375; // iPhone base width
//   const baseHeight = 667; // iPhone base height
  
//   if (isTablet()) {
//     // Tablet scaling
//     const tabletBaseWidth = 768;
//     const tabletBaseHeight = 1024;
//     const widthScale = width / tabletBaseWidth;
//     const heightScale = height / tabletBaseHeight;
//     return Math.min(widthScale, heightScale, 1.5); // Cap at 1.5x for tablets
//   } else {
//     // Phone scaling
//     const widthScale = width / baseWidth;
//     const heightScale = height / baseHeight;
//     const scale = Math.min(widthScale, heightScale);
    
//     if (isSmallPhone()) {
//       return Math.max(scale, 0.8); // Minimum 0.8x for small phones
//     } else if (isLargePhone()) {
//       return Math.min(scale, 1.2); // Maximum 1.2x for large phones
//     }
//     return scale;
//   }
// };

// const getResponsiveSpacing = (baseSpacing: number, scaleFactor: number): number => {
//   return Math.round(baseSpacing * scaleFactor);
// };

// const getResponsiveFontSize = (baseSize: number, scaleFactor: number): number => {
//   const scaledSize = baseSize * scaleFactor;
//   // Ensure minimum and maximum font sizes
//   return Math.max(Math.min(scaledSize, baseSize * 1.5), baseSize * 0.7);
// };

// const getResponsiveIconSize = (baseSize: number, scaleFactor: number): number => {
//   return Math.round(baseSize * scaleFactor);
// };

export function useDynamicStyles() {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const isLandscapeMode = screenW > screenH;
  const isTabletDevice = isTablet();
  const isSmallPhoneDevice = isSmallPhone();
  const isLargePhoneDevice = isLargePhone();
  const scaleFactor = getScaleFactor(screenW, screenH);

  return useMemo(() => {
    // Base styles that work for all orientations
    const baseStyles = {
      container: {
        flex: 1,
        position: 'relative' as const,
        backgroundColor: 'transparent',
        padding: 0, // Remove all padding to avoid white space
        margin: 0, // Remove all margin to avoid white space
        width: '100%',
        height: '100%',
      },
      loadingContainer: {
        flex: 1,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        backgroundColor: '#FFDAB9',
      },
      background: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
      },
      foreground: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
        elevation: 1,
      },
      backgroundImageStyle: {
        flex: 1,
        backgroundColor: '#FFDAB9',
      },
      frameWindow: {
        overflow: 'hidden' as const,
      },
      spriteImage: {
        position: 'absolute' as const,
        left: 0,
        top: 0,
      },
      menuContainer: {
        flex: 1,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        backgroundColor: '#73c2b9',
      },
      menuTitle: {
        fontSize: getResponsiveFontSize(20, scaleFactor),
        fontWeight: 'bold' as const,
        marginBottom: getResponsiveMargin(20, scaleFactor),
        marginTop: getResponsiveMargin(20, scaleFactor),
        marginRight: getResponsiveMargin(10, scaleFactor),
        color: '#612915',
      },
      animalName: {
        fontSize: getResponsiveFontSize(isTabletDevice ? 56 : 30, scaleFactor), // Match labelPositioning config
        marginTop: 0,
        fontWeight: Platform.OS === 'ios' ? ('800' as const) : ('700' as const),
        fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto', // High-quality fonts
        backgroundColor: '#FFEA00', // Solid yellow for crisp rendering
        paddingVertical: getResponsivePadding(isTabletDevice ? 24 : 20, scaleFactor), // Increased padding for larger font
        paddingHorizontal: getResponsivePadding(isTabletDevice ? 48 : 40, scaleFactor), // Increased padding for larger font
        borderRadius: getResponsiveSpacing(isTabletDevice ? 35 : 28, scaleFactor), // Better border radius
        textAlign: 'center' as const,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        borderWidth: isTabletDevice ? 6 : 5,
        borderColor: '#FFD700',
        minWidth: getResponsiveSpacing(isTabletDevice ? 200 : 150, scaleFactor), // Ensure minimum width
        ...(Platform.OS === 'ios' ? {
          textRendering: 'optimizeLegibility' as any,
        } : {}),
      },
      loadingText: {
        marginTop: getResponsiveMargin(10, scaleFactor),
        fontSize: getResponsiveFontSize(18, scaleFactor),
        color: '#333',
      },
    };

    // Dynamic styles for all orientations
    return StyleSheet.create({
      ...baseStyles,
      container: {
        flex: 1,
        backgroundColor: 'transparent',
        padding: getResponsiveSpacing(isTabletDevice ? 20 : 15, scaleFactor), // Better padding on tablets
      },
      content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: getResponsiveSpacing(isTabletDevice ? 30 : 20, scaleFactor), // Better padding on tablets
        paddingBottom: getResponsiveSpacing(isTabletDevice ? 30 : 20, scaleFactor), // Better padding on tablets
        paddingHorizontal: getResponsiveSpacing(isTabletDevice ? 25 : 15, scaleFactor), // Add horizontal padding
      },
      animalCard: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: screenH * (isTabletDevice ? 0.75 : (isLandscapeMode ? 0.7 : 0.6)), // Better proportions for all devices
        marginTop: isTabletDevice ? '25%' : '35%', // Better positioning for tablets vs phones
        paddingHorizontal: getResponsiveSpacing(isTabletDevice ? 40 : 20, scaleFactor), // Add horizontal padding
      },
      animalNameWrapper: {
        position: 'absolute',
        top: isTabletDevice 
           ? -Math.max(getResponsiveSpacing(40, scaleFactor), screenH * 0.1) // Better positioning on tablets
          : -Math.max(getResponsiveSpacing(50, scaleFactor), screenH * 0.08), // Better positioning on phones
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: getResponsiveSpacing(isTabletDevice ? 20 : 15, scaleFactor), // Add horizontal padding
      },
      animalImage: {
        width: isTabletDevice 
          ? Math.min(screenW * 0.85, screenH * 0.95) 
          : screenW * 0.95, // Make images much wider on phones
        height: screenH * (isTabletDevice ? 0.9 : 0.85), // Better proportions
        resizeMode: 'contain',
        marginTop: isTabletDevice ? '5%' : '8%', // Better spacing
        transform: [{ 
          scale: isTabletDevice 
            ? 1.6 
            : (isLandscapeMode ? 1.0 : 0.85) // Better scaling for all orientations
        }],
      },
      animalLoadingContainer: {
        width: Math.min(screenW * (isTabletDevice ? 0.3 : 0.4), screenH * 0.8),
        height: screenH * (isTabletDevice ? 0.7 : 0.6),
        justifyContent: 'center',
        alignItems: 'center',
      },
      soundButton: {
        position: 'absolute',
        top: getResponsiveSpacing(65, scaleFactor) + (isTabletDevice && isLandscapeMode ? screenH * 0.1 : 0), // Move down 10% on tablet landscape (same level as instruction bubble)
        left: getResponsiveSpacing(45, scaleFactor), // Match home button distance from edge
        backgroundColor: 'orange', // Match home button color
        paddingVertical: getResponsiveSpacing(isTabletDevice && isLandscapeMode ? 25 : isTabletDevice ? 15 : 20, scaleFactor), // Bigger on tablet landscape
        paddingHorizontal: getResponsiveSpacing(isTabletDevice && isLandscapeMode ? 35 : isTabletDevice ? 22 : 28, scaleFactor), // Bigger on tablet landscape
        borderRadius: getResponsiveSpacing(isTabletDevice && isLandscapeMode ? 45 : isTabletDevice ? 30 : 35, scaleFactor), // Bigger on tablet landscape
        flexDirection: 'row', // Match home button layout
        alignItems: 'center', // Match home button alignment
        justifyContent: 'center', // Match home button alignment
        elevation: 3, // Match home button elevation
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        zIndex: 10001, // Increased to be higher than navigation buttons (10000)
      },
      homeButton: {
        position: 'absolute',
        top: getResponsiveSpacing(isTabletDevice ? -10 : 70, scaleFactor) + (isTabletDevice && isLandscapeMode ? screenH * 0.05 : 0), // Updated positioning
        right: getResponsiveSpacing(isTabletDevice ? 100 : 100, scaleFactor), // Updated right positioning
        backgroundColor: 'orange', // Orange background for home button
        paddingVertical: getResponsiveSpacing(isTabletDevice ? 20 : 18, scaleFactor), // Better sizing
        paddingHorizontal: getResponsiveSpacing(isTabletDevice ? 30 : 25, scaleFactor), // Better sizing
        borderRadius: getResponsiveSpacing(isTabletDevice ? 40 : 35, scaleFactor), // Better border radius
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        zIndex: 10001, // Increased to be higher than navigation buttons (10000)
      },
      backToMenuButton: {
        backgroundColor: '#FFD4A3', // Orange to match the new button colors
        paddingVertical: getResponsiveSpacing(isTabletDevice ? 20 : 18, scaleFactor), // Better sizing
        paddingHorizontal: getResponsiveSpacing(isTabletDevice ? 30 : 25, scaleFactor), // Better sizing
        borderRadius: getResponsiveSpacing(isTabletDevice ? 40 : 35, scaleFactor), // Better border radius
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        position: 'absolute',
        top: getResponsiveSpacing(isTabletDevice ? 100 : 70, scaleFactor) + (isTabletDevice && isLandscapeMode ? screenH * 0.05 : 0), // Updated positioning
        right: getResponsiveSpacing(isTabletDevice ? 120 : 100, scaleFactor), // Better right positioning
        zIndex: 10001, // Increased to be higher than navigation buttons (10000)
      },
      levelGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        width: '100%',
        paddingHorizontal: getResponsiveSpacing(20, scaleFactor),
      },
      levelButton: {
        width: Math.min(screenW * (isTabletDevice ? 0.15 : 0.25), getResponsiveSpacing(120, scaleFactor)),
        aspectRatio: 1,
        borderRadius: getResponsiveSpacing(15, scaleFactor),
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 4,
        margin: getResponsiveSpacing(5, scaleFactor),
      },
      levelButtonBackground: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: getResponsiveSpacing(15, scaleFactor),
        resizeMode: 'cover',
      },
      levelText: {
        color: 'white',
        fontSize: getResponsiveFontSize(12, scaleFactor),
        fontWeight: 'bold',
        textAlign: 'center',
        paddingVertical: getResponsiveSpacing(4, scaleFactor),
        paddingHorizontal: getResponsiveSpacing(8, scaleFactor),
        borderRadius: getResponsiveSpacing(15, scaleFactor),
        overflow: 'hidden',
      },
      navButton: {
        backgroundColor: 'blue',
        paddingVertical: getResponsiveSpacing(6, scaleFactor),
        paddingHorizontal: getResponsiveSpacing(12, scaleFactor),
        borderRadius: getResponsiveSpacing(20, scaleFactor),
        marginHorizontal: getResponsiveSpacing(10, scaleFactor),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        width: getResponsiveSpacing(80, scaleFactor),
        height: getResponsiveSpacing(50, scaleFactor),
      },
      buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: getResponsiveFontSize(14, scaleFactor),
      },
      instructionBubble: {
        position: 'absolute',
        top: isLandscapeMode 
          ? getResponsiveSpacing(40, scaleFactor) + (isTabletDevice ? screenH * 0.05 : 0) // Moved up from 70 to 40, and tablet offset from 10% to 5%
          : getResponsiveSpacing(120, scaleFactor), // Moved up from 200 to 120 in mobile portrait
        left: '15%',
        right: '15%',
        backgroundColor: 'transparent',
        borderRadius: getResponsiveSpacing(25, scaleFactor),
        shadowColor: '#FF8C00',
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 8,
        zIndex: 10001, // Increased to be higher than navigation buttons (10000)
        borderWidth: 3,
        borderColor: '#FFA500',
        marginBottom: getResponsiveSpacing(18, scaleFactor),
        overflow: 'hidden',
      },
      instructionBubbleGradient: {
        flex: 1,
        borderRadius: getResponsiveSpacing(25, scaleFactor),
        justifyContent: 'center',
        alignItems: 'center',
      },
      instructionText: {
        fontSize: getResponsiveFontSize(isTabletDevice ? 20 : 16, scaleFactor), // Bigger on tablets
        color: '#333',
        textAlign: 'center',
        marginBottom: getResponsiveSpacing(isTabletDevice ? 15 : 10, scaleFactor), // Better spacing on tablets
        marginTop: getResponsiveSpacing(isTabletDevice ? 8 : 5, scaleFactor), // Better spacing on tablets
        fontWeight: 'bold',
        paddingHorizontal: getResponsiveSpacing(isTabletDevice ? 20 : 15, scaleFactor), // Add horizontal padding
      },
      // Additional responsive improvements
      tabletOptimized: {
        paddingHorizontal: getResponsiveSpacing(10, scaleFactor),
        paddingVertical: getResponsiveSpacing(10, scaleFactor),
      },
      phoneOptimized: {
        paddingHorizontal: getResponsiveSpacing(20, scaleFactor),
        paddingVertical: getResponsiveSpacing(20, scaleFactor),
      },
    });
  }, [screenW, screenH, isLandscapeMode, isTabletDevice, isSmallPhoneDevice, isLargePhoneDevice, scaleFactor]);
}

