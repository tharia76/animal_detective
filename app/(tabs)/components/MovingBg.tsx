// FarmMovingBg.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  Image,
} from 'react-native';

const { width: screenW, height: screenH } = Dimensions.get('window');
// SLOW IT DOWN: Increase duration to 40s per full cycle
const SCROLL_DURATION = 20000; // 40s per full cycle

export default function MovingBg({
  backgroundImageUri,
  movingDirection,
}: {
  backgroundImageUri: string | null;
  movingDirection: 'left' | 'right';
}) {
  const [imgWidth, setImgWidth] = useState<number>(screenW);
  const [imgHeight, setImgHeight] = useState<number>(screenH);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Get the real image size to avoid cropping/cutting
  useEffect(() => {
    let mounted = true;
    if (backgroundImageUri) {
      Image.getSize(
        backgroundImageUri,
        (width, height) => {
          if (mounted) {
            // Scale image to fill screen height, keep aspect ratio
            const scale = screenH / height;
            setImgWidth(width * scale);
            setImgHeight(screenH);
          }
        },
        () => {
          // fallback to screen size
          setImgWidth(screenW);
          setImgHeight(screenH);
        }
      );
    }
    return () => {
      mounted = false;
    };
  }, [backgroundImageUri]);

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

  return (
    <View style={styles.container}>
      <Animated.Image
        source={{ uri: backgroundImageUri || '' }}
        resizeMode="cover"
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            width: imgWidth + overlap,
            height: imgHeight,
            transform: [
              {
                translateX: scrollX.interpolate({
                  inputRange: first.inputRange,
                  outputRange: first.outputRange,
                  extrapolate: 'clamp',
                }),
              },
            ],
          },
        ]}
      />
      <Animated.Image
        source={{ uri: backgroundImageUri || '' }}
        resizeMode="cover"
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            width: imgWidth + overlap,
            height: imgHeight,
            transform: [
              {
                translateX: scrollX.interpolate({
                  inputRange: second.inputRange,
                  outputRange: second.outputRange,
                  extrapolate: 'clamp',
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: screenW,
    height: screenH,
    overflow: 'hidden',
    backgroundColor: 'transparent', // Remove any black bg
  },
});
