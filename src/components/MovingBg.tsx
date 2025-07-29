// FarmMovingBg.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useDynamicStyles } from '../styles/styles';

// 1️⃣ Hoist your hook: only call it once, at the top level
const MovingBg = ({
  backgroundImageUri,
  movingDirection,
  containerHeight,
  containerWidth,
}: {
  backgroundImageUri: string | number | null;
  movingDirection: 'left' | 'right';
  containerHeight?: number;
  containerWidth?: number;
}) => {
  const dynamicStyles = useDynamicStyles();
  const { width: screenW, height: screenH } = useWindowDimensions();
  // Use containerHeight/Width if provided, otherwise use screen dimensions
  const effectiveHeight = containerHeight || screenH;
  const effectiveWidth = containerWidth || screenW;
  // SLOW IT DOWN: Increase duration to 40s per full cycle
  const SCROLL_DURATION = 20000; // 40s per full cycle

  // Track orientation
  const isPortrait = screenH >= screenW;

  // Default to screen size, but update after image loads
  const [imgWidth, setImgWidth] = useState<number>(screenW);
  const [imgHeight, setImgHeight] = useState<number>(screenH);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Helper function to determine image source format
  const getImageSource = () => {
    if (!backgroundImageUri) return undefined;
    
    // If it's a number, it's a require() asset
    if (typeof backgroundImageUri === 'number') {
      return backgroundImageUri;
    }
    
    // If it's a string, it's a URI
    return { uri: backgroundImageUri };
  };

  const imageSource = getImageSource();

  // Don't render anything if no image source
  if (!imageSource) {
    return null;
  }

  // Get the real image size to avoid cropping/cutting
  useEffect(() => {
    let mounted = true;
    if (backgroundImageUri) {
      // Handle require() assets differently from URI strings
      if (typeof backgroundImageUri === 'number') {
        // For require() assets, use Image.resolveAssetSource
        try {
          const resolved = Image.resolveAssetSource(backgroundImageUri);
          if (mounted && resolved) {
            // For portrait: scale to fill height, for landscape: scale to fill width
            if (isPortrait) {
              const scale = effectiveHeight / resolved.height;
              setImgWidth(resolved.width * scale);
              setImgHeight(effectiveHeight);
            } else {
              const scale = effectiveWidth / resolved.width;
              setImgWidth(effectiveWidth);
              setImgHeight(resolved.height * scale);
            }
          }
        } catch (error) {
          console.warn('Error resolving asset source:', error);
          // Fallback to screen size
          setImgWidth(effectiveWidth);
          setImgHeight(effectiveHeight);
        }
      } else {
        // For URI strings, use Image.getSize
        Image.getSize(
          backgroundImageUri,
          (width, height) => {
            if (mounted) {
              // For portrait: scale to fill height, for landscape: scale to fill width
              if (isPortrait) {
                const scale = effectiveHeight / height;
                setImgWidth(width * scale);
                setImgHeight(effectiveHeight);
              } else {
                const scale = effectiveWidth / width;
                setImgWidth(effectiveWidth);
                setImgHeight(height * scale);
              }
            }
          },
          () => {
            // fallback to screen size
            setImgWidth(effectiveWidth);
            setImgHeight(effectiveHeight);
          }
        );
      }
    }
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backgroundImageUri, effectiveHeight, effectiveWidth, screenW, isPortrait]);

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

  // To hide the black line, slightly overlap the images by a fraction of a pixel
  const overlap = 5;

  // Directional logic for seamless loop
  // If movingDirection is 'left', images move leftward (right to left)
  // If movingDirection is 'right', images move rightward (left to right)
  const getTransforms = () => {
    if (movingDirection === 'left') {
      // Move left to right: animate from -imgWidth to 0
      return [
        {
          first: {
            inputRange: [0, imgWidth],
            outputRange: [-imgWidth, 0],
          },
          second: {
            inputRange: [0, imgWidth],
            outputRange: [0, imgWidth],
          },
        },
      ];
    } else {
      // Move right to left: animate from 0 to -imgWidth
      return [
        {
          first: {
            inputRange: [0, imgWidth],
            outputRange: [0, -imgWidth],
          },
          second: {
            inputRange: [0, imgWidth],
            outputRange: [imgWidth, 0],
          },
        },
      ];
    }
  };

  const [{ first, second }] = getTransforms();

  // For landscape, center vertically if image is not as tall as screen
  // For portrait, center horizontally if image is not as wide as screen
  const getImageStyle = (base: any) => {
    if (isPortrait) {
      // Portrait: image fills height, may be wider than screen
      return {
        ...base,
        top: 0,
        left: (screenW - imgWidth) / 2, // center horizontally if needed
        width: imgWidth + overlap,
        height: imgHeight,
      };
    } else {
      // Landscape: image fills width, may be shorter than screen
      return {
        ...base,
        top: containerHeight ? 0 : (effectiveHeight - imgHeight) / 2, // If custom height, start at top; otherwise center
        left: 0,
        width: imgWidth + overlap,
        height: imgHeight,
      };
    }
  };

  return (
    <View style={[styles.container]}>
      <Animated.Image
        source={imageSource}
        resizeMode="cover"
        style={[
          getImageStyle({
            position: 'absolute',
            transform: [
              {
                translateX: scrollX.interpolate({
                  inputRange: first.inputRange,
                  outputRange: first.outputRange,
                  extrapolate: 'clamp',
                }),
              },
            ],
          }),
        ]}
      />
      <Animated.Image
        source={imageSource}
        resizeMode="cover"
        style={[
          getImageStyle({
            position: 'absolute',
            transform: [
              {
                translateX: scrollX.interpolate({
                  inputRange: second.inputRange,
                  outputRange: second.outputRange,
                  extrapolate: 'clamp',
                }),
              },
            ],
          }),
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: 'transparent', // Changed from black to transparent
  },
});

export default MovingBg;
