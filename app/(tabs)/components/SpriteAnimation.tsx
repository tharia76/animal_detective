import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Image,
  ImageSourcePropType,
  ViewStyle,
  StyleProp,
  ImageStyle,
} from 'react-native';

type SpriteProps = {
  frames: Array<{
    filename: string;
    frame: { x: number; y: number; w: number; h: number };
  }>;
  source: ImageSourcePropType;
  spriteSheetSize: { w: number; h: number };
  style?: StyleProp<ViewStyle>;
};

export default function SpriteAnimation({
  frames,
  source,
  spriteSheetSize,
  style,
}: SpriteProps) {
  const imageRef = useRef<Image>(null);

  const { w: maxW, h: maxH } = useMemo(
    () =>
      frames.reduce(
        (acc, f) => ({
          w: Math.max(acc.w, f.frame.w),
          h: Math.max(acc.h, f.frame.h),
        }),
        { w: 0, h: 0 }
      ),
    [frames]
  );

  useEffect(() => {
    let idx = 0;
    const FRAME_DURATION = 100;

    // set the very first frame right away
    const { x: initX, y: initY } = frames[0].frame;
    imageRef.current?.setNativeProps({
      style: {
        transform: [{ translateX: -initX }, { translateY: -initY }],
      } as ImageStyle,
    });

    const id = setInterval(() => {
      idx = (idx + 1) % frames.length;
      const { x, y } = frames[idx].frame;
      imageRef.current?.setNativeProps({
        style: {
          transform: [{ translateX: -x }, { translateY: -y }],
        } as ImageStyle,
      });
    }, FRAME_DURATION);

    return () => clearInterval(id);
  }, []);

  return (
    <View
      style={[{ width: maxW, height: maxH, overflow: 'hidden' }, style]}
      // ← apply hardware rasterization on the View wrapper
      renderToHardwareTextureAndroid
      shouldRasterizeIOS
    >
      <Image
        ref={imageRef}
        source={source}
        style={{
          position: 'absolute',
          width: spriteSheetSize.w,
          height: spriteSheetSize.h,
        }}
        resizeMode="cover"
      />
    </View>
  );
}
