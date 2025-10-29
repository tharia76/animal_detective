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
    
    // Ensure full coverage by using Math.min to keep images covering the screen
    // Add extra buffer (-5) to prevent any gaps
    let leftOffset = Math.min(0, -(imgWidth - totalWidth) / 2) - 5;
    let topOffset = Math.min(0, -(imgHeight - totalHeight) / 2) - 5;

    // Apply custom positioning for specific levels to show more ground
    if (levelName?.toLowerCase() === 'forest') {
      const isMobileDevice = deviceInfo.deviceType === 'phone' || deviceInfo.deviceType === 'foldable';
      
      if (isMobileDevice) {
        // Move background down more noticeably - treat foldable same as phone
        const groundOffset = deviceInfo.isLandscape ? 
          deviceInfo.height * - 0.1 :   // 40% down in landscape
          deviceInfo.height * 0.5;    // 50% down in portrait
        topOffset = topOffset + groundOffset;
        
        console.log('🌲🌲🌲 FOREST MOVING BG - Mobile positioning applied:', { 
          originalTopOffset: -(imgHeight - totalHeight) / 2,
          groundOffset,
          finalTopOffset: topOffset,
          deviceType: deviceInfo.deviceType,
          isLandscape: deviceInfo.isLandscape,
          screenSize: { width: deviceInfo.width, height: deviceInfo.height }
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