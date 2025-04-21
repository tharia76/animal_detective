import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Image,
  ImageSourcePropType,
  ViewStyle,
  StyleProp,
  ImageStyle,
  Platform, // Import Platform
} from 'react-native';

type SpriteProps = {
  frames: Array<{
    filename: string; // filename might not be needed here, but keep for type consistency
    frame: { x: number; y: number; w: number; h: number };
  }>;
  source: ImageSourcePropType;
  spriteSheetSize: { w: number; h: number };
  style?: StyleProp<ViewStyle>;
  frameDuration?: number; // Optional prop for frame duration
};

const DEFAULT_FRAME_DURATION = 100; // Default duration in ms

export default function SpriteAnimation({
  frames,
  source,
  spriteSheetSize,
  style,
  frameDuration = DEFAULT_FRAME_DURATION, // Use prop or default
}: SpriteProps) {
  const imageRef = useRef<Image>(null);
  const frameIndex = useRef(0);
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

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

  // Animation loop using requestAnimationFrame for smoother timing synced with display refresh
  const animate = useCallback((time: number) => {
    // Ensure component is still mounted and frames exist
    if (!requestRef.current || !frames || frames.length === 0) return;

    if (previousTimeRef.current === undefined) {
      previousTimeRef.current = time; // Initialize on first frame
    }
    const deltaTime = time - previousTimeRef.current;

    // Check if enough time has passed to advance the frame
    if (deltaTime >= frameDuration) {
      // Calculate how many frames to advance (handles potential lag/frame drops)
      const framesToAdvance = Math.floor(deltaTime / frameDuration);
      // Adjust previous time for more precise frame timing, accounting for overshoot
      previousTimeRef.current = time - (deltaTime % frameDuration);

      // Advance frame index, wrapping around using modulo
      frameIndex.current = (frameIndex.current + framesToAdvance) % frames.length;
      const currentFrame = frames[frameIndex.current];

      if (currentFrame) {
        const { x, y } = currentFrame.frame;
        // Update transform using setNativeProps for performance, bypassing React state/render
        imageRef.current?.setNativeProps({
          style: {
            transform: [{ translateX: -x }, { translateY: -y }],
          } as ImageStyle,
        });
      }
    }

    // Continue the animation loop
    requestRef.current = requestAnimationFrame(animate);
  }, [frames, frameDuration]); // Dependencies for the animation callback

  useEffect(() => {
    // Reset animation state when frames or duration change
    frameIndex.current = 0;
    previousTimeRef.current = undefined; // Reset time for the new animation cycle

    // Set the very first frame immediately on mount/update
    if (frames && frames.length > 0) {
        const { x: initX, y: initY } = frames[0].frame;
        // Use setTimeout to ensure the ref is available and avoid potential race conditions on mount
        setTimeout(() => {
            imageRef.current?.setNativeProps({
                style: {
                    transform: [{ translateX: -initX }, { translateY: -initY }],
                } as ImageStyle,
            });
        }, 0);

        // Start the animation loop
        // Assign the request ID to the ref immediately after requesting the frame
        requestRef.current = requestAnimationFrame(animate);

    } else {
       // Optionally clear transform if no frames are provided
       setTimeout(() => {
           imageRef.current?.setNativeProps({
               style: { transform: [] } as ImageStyle,
           });
       }, 0);
    }

    // Cleanup function: Cancel the animation frame request when the component unmounts
    // or when the effect re-runs (due to changes in dependencies)
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = undefined; // Clear the ref to indicate animation is stopped
      }
    };
  }, [frames, animate]); // Rerun effect if frames array or animate function changes

  // If no frames or dimensions are calculated, render nothing to avoid layout issues
  if (maxW === 0 || maxH === 0) {
      return null; // Or return <View style={style} /> if a placeholder is needed
  }

  return (
    <View
      style={[{ width: maxW, height: maxH, overflow: 'hidden' }, style]}
      // Apply hardware acceleration hints for potentially smoother rendering on native platforms
      renderToHardwareTextureAndroid={Platform.OS === 'android'}
      shouldRasterizeIOS={Platform.OS === 'ios'}
    >
      <Image
        ref={imageRef}
        source={source}
        style={{
          position: 'absolute', // Position image absolutely within the clipping View
          width: spriteSheetSize.w, // Full width of the sprite sheet
          height: spriteSheetSize.h, // Full height of the sprite sheet
          // Initial transform is set via setNativeProps in useEffect to avoid flicker
        }}
        resizeMode="cover" // Assumes sprite sheet frames fill their area; adjust if needed
        fadeDuration={0} // Crucial: Prevent Android's default image fade-in animation
        // Consider adding onError prop for image loading errors
      />
    </View>
  );
}
