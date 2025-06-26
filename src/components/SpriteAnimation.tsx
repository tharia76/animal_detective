import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Image,
  ImageSourcePropType,
  ViewStyle,
  StyleProp,
  ImageStyle,
  Platform,
  Animated,
} from 'react-native';

type SpriteProps = {
  frames: Array<{
    filename: string;
    frame: { x: number; y: number; w: number; h: number };
  }>;
  source: ImageSourcePropType;
  spriteSheetSize: { w: number; h: number };
  style?: StyleProp<ViewStyle>;
  frameDuration?: number;
};

const DEFAULT_FRAME_DURATION = 100;

export default function SpriteAnimation({
  frames,
  source,
  spriteSheetSize,
  style,
  frameDuration = DEFAULT_FRAME_DURATION,
}: SpriteProps) {
  const frameIndex = useRef(0);
  const requestRef = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number | undefined>(undefined);
  
  // Use Animated values for smooth transforms
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // Calculate max dimensions for the container view based on frame sizes
  const { w: maxW, h: maxH } = useMemo(() => {
    if (!frames || frames.length === 0) return { w: 0, h: 0 };
    return frames.reduce(
      (acc, f) => ({
        w: Math.max(acc.w, f.frame.w),
        h: Math.max(acc.h, f.frame.h),
      }),
      { w: 0, h: 0 }
    );
  }, [frames]);

  // Animation loop using requestAnimationFrame for smoother timing
  const animate = useCallback((time: number) => {
    if (!requestRef.current || !frames || frames.length === 0) return;

    if (previousTimeRef.current === undefined) {
      previousTimeRef.current = time;
    }
    const deltaTime = time - previousTimeRef.current;

    if (deltaTime >= frameDuration) {
      const framesToAdvance = Math.floor(deltaTime / frameDuration);
      previousTimeRef.current = time - (deltaTime % frameDuration);

      frameIndex.current = (frameIndex.current + framesToAdvance) % frames.length;
      const currentFrame = frames[frameIndex.current];

      if (currentFrame) {
        const { x, y } = currentFrame.frame;
        
        // Use Animated.timing for smooth frame transitions
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: -x,
            duration: 0, // Instant change for sprite frames
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -y,
            duration: 0, // Instant change for sprite frames
            useNativeDriver: true,
          }),
        ]).start();
      }
    }

    requestRef.current = requestAnimationFrame(animate);
  }, [frames, frameDuration, translateX, translateY]);

  useEffect(() => {
    frameIndex.current = 0;
    previousTimeRef.current = undefined;

    if (frames && frames.length > 0) {
      const { x: initX, y: initY } = frames[0].frame;
      
      // Set initial position
      translateX.setValue(-initX);
      translateY.setValue(-initY);

      // Start the animation loop
      requestRef.current = requestAnimationFrame(animate);
    } else {
      translateX.setValue(0);
      translateY.setValue(0);
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = undefined;
      }
    };
  }, [frames, animate, translateX, translateY]);

  if (maxW === 0 || maxH === 0) {
    return null;
  }

  return (
    <View
      style={[{ overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }, style]}
      renderToHardwareTextureAndroid={Platform.OS === 'android'}
      shouldRasterizeIOS={Platform.OS === 'ios'}
    >
      <View
        style={{
          width: maxW,
          height: maxH,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Animated.Image
          source={source}
          style={{
            position: 'absolute',
            width: spriteSheetSize.w,
            height: spriteSheetSize.h,
            transform: [
              { translateX },
              { translateY },
            ],
          }}
          resizeMode="cover"
          fadeDuration={0}
        />
      </View>
    </View>
  );
}
