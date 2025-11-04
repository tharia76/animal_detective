import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  getDeviceInfo, 
  getResponsiveBackgroundStyles,
  DeviceInfo 
} from '../utils/responsiveBackgroundSystem';

interface ResponsiveMovingBgProps {
  backgroundImageUri: string | number | null;
  movingDirection: 'left' | 'right';
  levelName: string;
  containerHeight?: number;
  containerWidth?: number;
}

const ResponsiveMovingBg: React.FC<ResponsiveMovingBgProps> = ({
  backgroundImageUri,
  movingDirection,
  levelName,
  containerHeight,
  containerWidth,
}) => {
  const safeAreaInsets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();
  
  // Get device info and responsive positioning
  const deviceInfo: DeviceInfo = useMemo(() => {
    return getDeviceInfo(safeAreaInsets);
  }, [safeAreaInsets, screenW, screenH]);

  // We don't need responsive positioning for moving backgrounds as they fill the entire screen

  // Animation settings
  const SCROLL_DURATION = 20000; // 20s per full cycle
  
  // Image dimensions state
  const [imgWidth, setImgWidth] = useState<number>(screenW);
  const [imgHeight, setImgHeight] = useState<number>(screenH);
  const [scrollX] = useState(() => new Animated.Value(0));

  // Helper function to determine image source format
  const getImageSource = () => {
    if (!backgroundImageUri) return undefined;
    
    if (typeof backgroundImageUri === 'number') {
      return backgroundImageUri;
    }
    
    return { uri: backgroundImageUri };
  };

  const imageSource = getImageSource();

  // Get image dimensions and calculate scaling for full screen coverage
  useEffect(() => {
    let mounted = true;
    
    if (backgroundImageUri) {
      const calculateDimensions = (originalWidth: number, originalHeight: number) => {
        if (!mounted) return;
        
        // For moving backgrounds, we want to fill the entire screen including safe areas
        const containerHeight = deviceInfo.height + safeAreaInsets.top + safeAreaInsets.bottom;
        const containerWidth = deviceInfo.width + safeAreaInsets.left + safeAreaInsets.right;
        
        // Scale image to cover the entire screen - use Math.max to ensure full coverage
        const scaleX = containerWidth / originalWidth;
        const scaleY = containerHeight / originalHeight;
        const scale = Math.max(scaleX, scaleY) * 1.1; // Add 10% extra to ensure full coverage
        
        const scaledWidth = originalWidth * scale;
        const scaledHeight = originalHeight * scale;
        
        setImgWidth(scaledWidth);
        setImgHeight(scaledHeight);
        
        console.log(`🎬 MovingBg dimensions for ${levelName}:`, {
          original: { width: originalWidth, height: originalHeight },
          screen: { width: containerWidth, height: containerHeight },
          scale,
          final: { width: scaledWidth, height: scaledHeight },
          deviceInfo: {
            type: deviceInfo.deviceType,
            orientation: deviceInfo.isLandscape ? 'landscape' : 'portrait'
          }
        });
      };

      if (typeof backgroundImageUri === 'number') {
        try {
          const resolved = Image.resolveAssetSource(backgroundImageUri);
          if (resolved) {
            calculateDimensions(resolved.width, resolved.height);
          }
        } catch (error) {
          console.warn('Error resolving moving bg asset source:', error);
          setImgWidth(deviceInfo.width);
          setImgHeight(deviceInfo.height);
        }
      } else {
        Image.getSize(
          backgroundImageUri,
          (width, height) => {
            calculateDimensions(width, height);
          },
          (error) => {
            console.warn('Error getting moving bg image size:', error);
            setImgWidth(deviceInfo.width);
            setImgHeight(deviceInfo.height);
          }
        );
      }
    }
    
    return () => {
      mounted = false;
    };
  }, [backgroundImageUri, deviceInfo, levelName]);

  // Animation effect
  useEffect(() => {
    let isMounted = true;
    
    const animate = () => {
      scrollX.setValue(0);
      Animated.timing(scrollX, {
        toValue: imgWidth,
        duration: SCROLL_DURATION,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && isMounted) {
          animate();
        }
      });
    };
    
    animate();
    
    return () => {
      isMounted = false;
      scrollX.stopAnimation();
    };
  }, [scrollX, imgWidth]);

  // Calculate transforms for seamless scrolling
  const getTransforms = () => {
    if (movingDirection === 'left') {
      return {
        first: {
          inputRange: [0, imgWidth],
          outputRange: [-imgWidth, 0],
        },
        second: {
          inputRange: [0, imgWidth],
          outputRange: [0, imgWidth],
        },
      };
    } else {
      return {
        first: {
          inputRange: [0, imgWidth],
          outputRange: [0, -imgWidth],
        },
        second: {
          inputRange: [0, imgWidth],
          outputRange: [imgWidth, 0],
        },
      };
    }
  };

  const { first, second } = getTransforms();

  // Apply positioning for fullscreen images
  const getImageStyle = (baseTransform: any) => {
    const overlap = 10; // Generous overlap to hide seams
    
    // Center the image on the screen, accounting for safe areas
    const totalWidth = deviceInfo.width + safeAreaInsets.left + safeAreaInsets.right;
    const totalHeight = deviceInfo.height + safeAreaInsets.top + safeAreaInsets.bottom;
    
    let leftOffset = -(imgWidth - totalWidth) / 2;
    let topOffset = -(imgHeight - totalHeight) / 2;
    
    // Apply general phone positioning - move moving backgrounds up on phones
    const isMobileDevice = deviceInfo.deviceType === 'phone' || deviceInfo.deviceType === 'foldable';
    
    if (isMobileDevice && levelName?.toLowerCase() !== 'farm') {
      // Move moving background up 3% on phones for all levels except farm
      const phoneOffset = deviceInfo.isLandscape ? 
        deviceInfo.height * -0.03 :  // 3% up in landscape
        deviceInfo.height * -0.03;   // 3% up in portrait
      topOffset = topOffset + phoneOffset;
      
      console.log(`📱 MOVING BG - Phone positioning applied for ${levelName}:`, { 
        originalTopOffset: -(imgHeight - totalHeight) / 2,
        phoneOffset,
        finalTopOffset: topOffset,
        deviceType: deviceInfo.deviceType,
        isLandscape: deviceInfo.isLandscape,
        screenSize: { width: deviceInfo.width, height: deviceInfo.height }
      });
    }

    // Apply custom positioning for Savannah level to show more ground
    if (levelName?.toLowerCase() === 'savannah') {
      if (isMobileDevice) {
        // Savannah-specific adjustment: move background down more noticeably (reduced)
        const savannahOffset = deviceInfo.isLandscape ? 
          deviceInfo.height * -0.1 :  // 10% up in landscape (on top of general phone offset)
          deviceInfo.height * 0.1;    // 10% down in portrait (on top of general phone offset)
        topOffset = topOffset + savannahOffset;
        
        console.log('🦁🦁🦁 SAVANNAH MOVING BG - Mobile positioning applied:', { 
          originalTopOffset: -(imgHeight - totalHeight) / 2,
          generalPhoneOffset: deviceInfo.isLandscape ? deviceInfo.height * 0.05 : deviceInfo.height * 0.1,
          savannahOffset,
          finalTopOffset: topOffset,
          deviceType: deviceInfo.deviceType,
          isLandscape: deviceInfo.isLandscape,
          screenSize: { width: deviceInfo.width, height: deviceInfo.height }
        });
      }
    }

    // Apply custom positioning for specific levels to show more ground
    if (levelName?.toLowerCase() === 'forest') {
      if (isMobileDevice) {
        // Forest-specific adjustment: move background down more noticeably (reduced)
        const forestOffset = deviceInfo.isLandscape ? 
          deviceInfo.height * 0.02 :   // 2% down in landscape (on top of general phone offset)
          deviceInfo.height * 0.15;    // 15% down in portrait (on top of general phone offset)
        topOffset = topOffset + forestOffset;
        
        console.log('🌲🌲🌲 FOREST MOVING BG - Mobile positioning applied:', { 
          originalTopOffset: -(imgHeight - totalHeight) / 2,
          generalPhoneOffset: deviceInfo.isLandscape ? deviceInfo.height * 0.05 : deviceInfo.height * 0.1,
          forestOffset,
          finalTopOffset: topOffset,
          deviceType: deviceInfo.deviceType,
          isLandscape: deviceInfo.isLandscape,
          screenSize: { width: deviceInfo.width, height: deviceInfo.height }
        });
      }
      
      // In landscape, ensure the background fills the entire screen from top
      if (deviceInfo.isLandscape) {
        topOffset = 0; // Start from top to fill entire screen
        
        console.log('🌲🌲🌲 FOREST MOVING BG - Landscape fullscreen positioning applied:', { 
          originalTopOffset: -(imgHeight - totalHeight) / 2,
          finalTopOffset: topOffset,
          deviceType: deviceInfo.deviceType,
          isLandscape: deviceInfo.isLandscape,
          screenSize: { width: deviceInfo.width, height: deviceInfo.height },
          imgDimensions: { width: imgWidth, height: imgHeight }
        });
      }
    }

    // Apply custom positioning for Farm level - ensure full screen coverage in landscape
    if (levelName?.toLowerCase() === 'farm') {
      if (deviceInfo.isLandscape) {
        // In landscape, always position image from top (0) to fill entire screen
        // The image is scaled to cover, so it will be larger than container
        topOffset = 0;
        
        console.log('🚜🚜🚜 FARM MOVING BG - Landscape fullscreen positioning applied:', { 
          originalTopOffset: -(imgHeight - totalHeight) / 2,
          safeAreaInsetsTop: safeAreaInsets.top,
          safeAreaInsetsBottom: safeAreaInsets.bottom,
          deviceInfoHeight: deviceInfo.height,
          containerHeight,
          totalHeight,
          imgHeight,
          finalTopOffset: topOffset,
          imageCoversScreen: imgHeight >= containerHeight,
          deviceType: deviceInfo.deviceType,
          isLandscape: deviceInfo.isLandscape,
          screenSize: { width: deviceInfo.width, height: deviceInfo.height },
          imgDimensions: { width: imgWidth, height: imgHeight }
        });
      }
    }

    // Apply custom positioning for Ocean level - ensure full screen coverage in landscape
    if (levelName?.toLowerCase() === 'ocean') {
      if (deviceInfo.isLandscape) {
        // In landscape, always position image from top (0) to fill entire screen
        // The image is scaled to cover, so it will be larger than container
        topOffset = 0;
        
        console.log('🌊🌊🌊 OCEAN MOVING BG - Landscape fullscreen positioning applied:', { 
          originalTopOffset: -(imgHeight - totalHeight) / 2,
          safeAreaInsetsTop: safeAreaInsets.top,
          safeAreaInsetsBottom: safeAreaInsets.bottom,
          deviceInfoHeight: deviceInfo.height,
          totalHeight,
          imgHeight,
          finalTopOffset: topOffset,
          deviceType: deviceInfo.deviceType,
          isLandscape: deviceInfo.isLandscape,
          screenSize: { width: deviceInfo.width, height: deviceInfo.height },
          imgDimensions: { width: imgWidth, height: imgHeight }
        });
      }
    }

    // Apply custom positioning for Desert level - ensure full screen coverage in landscape
    if (levelName?.toLowerCase() === 'desert') {
      if (deviceInfo.isLandscape) {
        // In landscape, always position image from top (0) to fill entire screen
        // The image is scaled to cover, so it will be larger than container
        topOffset = 0;
        
        console.log('🏜️🏜️🏜️ DESERT MOVING BG - Landscape fullscreen positioning applied:', { 
          originalTopOffset: -(imgHeight - totalHeight) / 2,
          safeAreaInsetsTop: safeAreaInsets.top,
          safeAreaInsetsBottom: safeAreaInsets.bottom,
          deviceInfoHeight: deviceInfo.height,
          totalHeight,
          imgHeight,
          finalTopOffset: topOffset,
          deviceType: deviceInfo.deviceType,
          isLandscape: deviceInfo.isLandscape,
          screenSize: { width: deviceInfo.width, height: deviceInfo.height },
          imgDimensions: { width: imgWidth, height: imgHeight }
        });
      }
    }

    // Apply custom positioning for Arctic level - ensure full screen coverage in landscape
    if (levelName?.toLowerCase() === 'arctic') {
      if (deviceInfo.isLandscape) {
        topOffset = 0;
        
        console.log('❄️❄️❄️ ARCTIC MOVING BG - Landscape fullscreen positioning applied:', { 
          originalTopOffset: -(imgHeight - totalHeight) / 2,
          safeAreaInsetsTop: safeAreaInsets.top,
          safeAreaInsetsBottom: safeAreaInsets.bottom,
          deviceInfoHeight: deviceInfo.height,
          totalHeight,
          imgHeight,
          finalTopOffset: topOffset,
          deviceType: deviceInfo.deviceType,
          isLandscape: deviceInfo.isLandscape,
          screenSize: { width: deviceInfo.width, height: deviceInfo.height },
          imgDimensions: { width: imgWidth, height: imgHeight }
        });
      }
    }

    // Apply custom positioning for Insects level - ensure full screen coverage in landscape
    if (levelName?.toLowerCase() === 'insects') {
      if (deviceInfo.isLandscape) {
        topOffset = 0;
        
        console.log('🐛🐛🐛 INSECTS MOVING BG - Landscape fullscreen positioning applied:', { 
          originalTopOffset: -(imgHeight - totalHeight) / 2,
          safeAreaInsetsTop: safeAreaInsets.top,
          safeAreaInsetsBottom: safeAreaInsets.bottom,
          deviceInfoHeight: deviceInfo.height,
          totalHeight,
          imgHeight,
          finalTopOffset: topOffset,
          deviceType: deviceInfo.deviceType,
          isLandscape: deviceInfo.isLandscape,
          screenSize: { width: deviceInfo.width, height: deviceInfo.height },
          imgDimensions: { width: imgWidth, height: imgHeight }
        });
      }
    }

    // Apply custom positioning for Savannah level - ensure full screen coverage in landscape
    if (levelName?.toLowerCase() === 'savannah') {
      if (deviceInfo.isLandscape) {
        // Override any mobile-specific positioning in landscape
        topOffset = 0;
        
        console.log('🦁🦁🦁 SAVANNAH MOVING BG - Landscape fullscreen positioning applied:', { 
          originalTopOffset: -(imgHeight - totalHeight) / 2,
          safeAreaInsetsTop: safeAreaInsets.top,
          safeAreaInsetsBottom: safeAreaInsets.bottom,
          deviceInfoHeight: deviceInfo.height,
          totalHeight,
          imgHeight,
          finalTopOffset: topOffset,
          deviceType: deviceInfo.deviceType,
          isLandscape: deviceInfo.isLandscape,
          screenSize: { width: deviceInfo.width, height: deviceInfo.height },
          imgDimensions: { width: imgWidth, height: imgHeight }
        });
      }
    }

    // Apply custom positioning for Jungle level - ensure full screen coverage in landscape
    if (levelName?.toLowerCase() === 'jungle') {
      if (deviceInfo.isLandscape) {
        topOffset = 0;
        
        console.log('🌴🌴🌴 JUNGLE MOVING BG - Landscape fullscreen positioning applied:', { 
          originalTopOffset: -(imgHeight - totalHeight) / 2,
          safeAreaInsetsTop: safeAreaInsets.top,
          safeAreaInsetsBottom: safeAreaInsets.bottom,
          deviceInfoHeight: deviceInfo.height,
          totalHeight,
          imgHeight,
          finalTopOffset: topOffset,
          deviceType: deviceInfo.deviceType,
          isLandscape: deviceInfo.isLandscape,
          screenSize: { width: deviceInfo.width, height: deviceInfo.height },
          imgDimensions: { width: imgWidth, height: imgHeight }
        });
      }
    }

    // Apply custom positioning for Birds level - ensure full screen coverage in landscape
    if (levelName?.toLowerCase() === 'birds') {
      if (deviceInfo.isLandscape) {
        topOffset = 0;
        
        console.log('🐦🐦🐦 BIRDS MOVING BG - Landscape fullscreen positioning applied:', { 
          originalTopOffset: -(imgHeight - totalHeight) / 2,
          safeAreaInsetsTop: safeAreaInsets.top,
          safeAreaInsetsBottom: safeAreaInsets.bottom,
          deviceInfoHeight: deviceInfo.height,
          totalHeight,
          imgHeight,
          finalTopOffset: topOffset,
          deviceType: deviceInfo.deviceType,
          isLandscape: deviceInfo.isLandscape,
          screenSize: { width: deviceInfo.width, height: deviceInfo.height },
          imgDimensions: { width: imgWidth, height: imgHeight }
        });
      }
    }
    
    return {
      position: 'absolute' as const,
      top: topOffset,
      left: leftOffset,
      width: imgWidth + overlap,
      height: imgHeight + overlap,
      transform: [baseTransform],
    };
  };

  console.log(`🎬 ResponsiveMovingBg render for ${levelName}:`, {
    imageSource: !!imageSource,
    deviceInfo: { width: deviceInfo.width, height: deviceInfo.height },
    imgDimensions: { width: imgWidth, height: imgHeight },
    safeAreaInsets,
    positioning: {
      leftOffset: -(imgWidth - (deviceInfo.width + safeAreaInsets.left + safeAreaInsets.right)) / 2,
      topOffset: -(imgHeight - (deviceInfo.height + safeAreaInsets.top + safeAreaInsets.bottom)) / 2
    }
  });

  // Add extra debug for Forest
  if (levelName?.toLowerCase() === 'forest') {
    console.log('🌲🌲🌲 FOREST LEVEL DETECTED IN MOVING BG!', {
      levelName,
      deviceType: deviceInfo.deviceType,
      isMobileDevice: deviceInfo.deviceType === 'phone' || deviceInfo.deviceType === 'foldable',
      screenDimensions: { width: deviceInfo.width, height: deviceInfo.height }
    });
  }

  // Don't render anything if no image source (after all hooks are called)
  if (!imageSource) {
    return null;
  }

  return (
    <View style={[
      StyleSheet.absoluteFillObject,
      {
        overflow: 'hidden',
        backgroundColor: 'transparent',
        // Extend beyond safe areas to cover notch area
        top: -safeAreaInsets.top,
        bottom: -safeAreaInsets.bottom,
        left: -safeAreaInsets.left,
        right: -safeAreaInsets.right,
      }
    ]}>
      {/* First scrolling image */}
      <Animated.Image
        source={imageSource}
        resizeMode="cover"
        fadeDuration={0}
        style={getImageStyle({
          translateX: scrollX.interpolate({
            inputRange: first.inputRange,
            outputRange: first.outputRange,
            extrapolate: 'clamp',
          }),
        })}
      />
      
      {/* Second scrolling image for seamless loop */}
      <Animated.Image
        source={imageSource}
        resizeMode="cover"
        fadeDuration={0}
        style={getImageStyle({
          translateX: scrollX.interpolate({
            inputRange: second.inputRange,
            outputRange: second.outputRange,
            extrapolate: 'clamp',
          }),
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
});

export default ResponsiveMovingBg;