// /components/SpriteAnimation.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Image, ImageSourcePropType, ViewStyle, StyleProp } from 'react-native';

type SpriteProps = {
  frames: Array<{
    filename: string;
    frame: { x: number; y: number; w: number; h: number };
    rotated: boolean;
    trimmed: boolean;
    spriteSourceSize: { x: number; y: number; w: number; h: number };
    sourceSize: { w: number; h: number };
  }>;
  source: ImageSourcePropType;
  spriteSheetSize: { w: number; h: number };
  style?: StyleProp<ViewStyle>;
};

export default function SpriteAnimation({ frames, source, spriteSheetSize, style }: SpriteProps) {
  const [frameIndex, setFrameIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setFrameIndex(0);
    intervalRef.current = setInterval(() => {
      setFrameIndex(prev => (prev + 1) % frames.length);
    }, 87);
    
    // Return a proper cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [frames]);

  const { x, y } = frames[frameIndex].frame;
  const { w, h } = frames[frameIndex].sourceSize;

  return (
    <View style={[{ width: w, height: h, overflow: 'hidden' }, style]}>
      <Image
        source={source}
        style={{
          position: 'absolute',
          width: spriteSheetSize.w,
          height: spriteSheetSize.h,
          marginLeft: -x,
          marginTop: -y,
        }}
        resizeMode="cover"
      />
    </View>
  );
}
