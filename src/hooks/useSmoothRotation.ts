import { useEffect, useState, useRef } from 'react';
import { useWindowDimensions, Platform } from 'react-native';
import { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';

export interface SmoothRotationConfig {
  // Spring animation config
  damping?: number;
  stiffness?: number;
  mass?: number;
  // Timing for scale animation
  scaleDuration?: number;
  // Transition timeout
  transitionDuration?: number;
  // Minimum dimension change to trigger rotation
  threshold?: number;
}

const defaultConfig: SmoothRotationConfig = {
  damping: 20,
  stiffness: 300,
  mass: 0.8,
  scaleDuration: 200,
  transitionDuration: 400,
  threshold: 50,
};

export function useSmoothRotation(config: SmoothRotationConfig = {}) {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  
  // Merge config with defaults
  const finalConfig = { ...defaultConfig, ...config };
  
  // Animation values
  const rotationProgress = useSharedValue(0);
  const rotationScale = useSharedValue(1);
  
  // State tracking
  const [dimensions, setDimensions] = useState({ width, height });
  const [isRotating, setIsRotating] = useState(false);
  const rotationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Smooth rotation handling
  useEffect(() => {
    const hasRotated = 
      Math.abs(dimensions.width - width) > finalConfig.threshold! || 
      Math.abs(dimensions.height - height) > finalConfig.threshold!;
    
    // Check if orientation actually changed
    const oldIsLandscape = dimensions.width > dimensions.height;
    const newIsLandscape = width > height;
    const orientationChanged = oldIsLandscape !== newIsLandscape;
    
    if (hasRotated && orientationChanged) {
      // Clear existing timeout
      if (rotationTimeoutRef.current) {
        clearTimeout(rotationTimeoutRef.current);
      }
      
      // Start smooth rotation animation
      setIsRotating(true);
      
      // iOS-style rotation animation with spring physics
      rotationProgress.value = withSpring(1, {
        damping: finalConfig.damping!,
        stiffness: finalConfig.stiffness!,
        mass: finalConfig.mass!,
        overshootClamping: false,
        restSpeedThreshold: 0.001,
        restDisplacementThreshold: 0.001,
      });
      
      // Subtle scale animation during rotation
      rotationScale.value = withTiming(0.98, { duration: finalConfig.scaleDuration! }, () => {
        rotationScale.value = withSpring(1, {
          damping: 15,
          stiffness: 400,
        });
      });
      
      // Update dimensions smoothly
      setDimensions({ width, height });
      
      // Reset rotation state after animation
      rotationTimeoutRef.current = setTimeout(() => {
        setIsRotating(false);
        rotationProgress.value = 0;
      }, finalConfig.transitionDuration!);
      
    } else if (!orientationChanged && hasRotated) {
      // If dimensions changed but orientation didn't, update immediately
      setDimensions({ width, height });
    }

    return () => {
      if (rotationTimeoutRef.current) {
        clearTimeout(rotationTimeoutRef.current);
      }
    };
  }, [width, height, dimensions, rotationProgress, rotationScale, finalConfig]);

  // Animated styles for smooth iOS-like rotation
  const animatedStyle = useAnimatedStyle(() => {
    const progress = rotationProgress.value;
    const scale = rotationScale.value;
    
    return {
      transform: [
        { scale: scale },
        ...(Platform.OS === 'ios' ? [{
          rotateX: interpolate(
            progress,
            [0, 0.5, 1],
            [0, -2, 0],
            Extrapolate.CLAMP
          ) + 'deg'
        }] : [])
      ],
      opacity: 1, // Keep full opacity to prevent flashing
    };
  }, []);

  // Get stable dimensions during rotation
  const getStableDimensions = () => ({
    width: isRotating ? dimensions.width : width,
    height: isRotating ? dimensions.height : height,
    isLandscape: (isRotating ? dimensions.width : width) > (isRotating ? dimensions.height : height)
  });

  return {
    animatedStyle,
    isRotating,
    stableDimensions: getStableDimensions(),
    currentDimensions: { width, height, isLandscape }
  };
} 