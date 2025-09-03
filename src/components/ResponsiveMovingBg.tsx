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
        
        // For moving backgrounds, we want to fill the entire screen
        const containerHeight = deviceInfo.height;
        const containerWidth = deviceInfo.width;
        
        // Scale image to cover the entire screen
        const scaleX = containerWidth / originalWidth;
        const scaleY = containerHeight / originalHeight;
        const scale = Math.max(scaleX, scaleY) * 1.1; // Slight overscan to ensure coverage
        
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
    const overlap = 2; // Small overlap to hide seams
    
    // Center the image on the screen
    const leftOffset = -(imgWidth - deviceInfo.width) / 2;
    const topOffset = -(imgHeight - deviceInfo.height) / 2;
    
    return {
      position: 'absolute' as const,
      top: topOffset,
      left: leftOffset,
      width: imgWidth + overlap,
      height: imgHeight,
      transform: [baseTransform],
    };
  };

  console.log(`🎬 ResponsiveMovingBg render for ${levelName}:`, {
    imageSource: !!imageSource,
    deviceInfo: { width: deviceInfo.width, height: deviceInfo.height },
    imgDimensions: { width: imgWidth, height: imgHeight },
    positioning: {
      leftOffset: -(imgWidth - deviceInfo.width) / 2,
      topOffset: -(imgHeight - deviceInfo.height) / 2
    }
  });

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
      }
    ]}>
      {/* First scrolling image */}
      <Animated.Image
        source={imageSource}
        resizeMode="cover"
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