import React, { useEffect, useMemo } from 'react';
import {
  View,
  Image,
  ImageSourcePropType,
  ViewStyle,
  StyleProp,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';

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

const DEFAULT_FRAME_DURATION = Platform.OS === 'android' ? 130 : 85;

export default function SpriteAnimationOptimized({
  frames,
  source,
  spriteSheetSize,
  style,
  frameDuration = DEFAULT_FRAME_DURATION,
}: SpriteProps) {
  // Calculate max dimensions
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

  // Shared values for reanimated - runs on UI thread
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!frames || frames.length === 0) return;

    // Animate through all frames with step easing for crisp frame changes
    const totalDuration = frameDuration * frames.length;
    
    progress.value = withRepeat(
      withTiming(frames.length, {
        duration: totalDuration,
        easing: Easing.linear,
      }),
      -1, // infinite
      false
    );

    return () => {
      cancelAnimation(progress);
    };
  }, [frames, frameDuration, progress]);

  // Animated style that updates on UI thread
  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    if (!frames || frames.length === 0) return {};

    // Floor to get discrete frame index for crisp animation
    const frameIndex = Math.floor(progress.value) % frames.length;
    const currentFrame = frames[frameIndex];

    if (!currentFrame || !currentFrame.frame) return {};

    return {
      transform: [
        { translateX: -currentFrame.frame.x },
        { translateY: -currentFrame.frame.y },
      ],
    };
  }, [frames]);

  if (maxW === 0 || maxH === 0 || !frames || frames.length === 0) {
    return null;
  }

  return (
    <View
      style={[{ overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }, style]}
      collapsable={false}
      renderToHardwareTextureAndroid={true}
      shouldRasterizeIOS={true}
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
          style={[
            {
              position: 'absolute',
              width: spriteSheetSize.w,
              height: spriteSheetSize.h,
            },
            animatedStyle,
          ]}
          resizeMode="cover"
          fadeDuration={0}
        />
      </View>
    </View>
  );
}

