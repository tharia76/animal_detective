import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, useWindowDimensions, StyleSheet, ViewStyle, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useDynamicStyles } from '../styles/styles';

interface NavigationButtonsProps {
  handlePrev: () => void;
  handleNext: () => void;
  isTransitioning: boolean;
  currentAnimalIndex: number;
  bgColor: string;
  totalAnimals?: number;
  levelCompleted?: boolean;
  buttonsDisabled?: boolean;
  nextButtonDisabled?: boolean; // New prop to control next button specifically
  hasClickedCurrentAnimal?: boolean; // New prop to track if current animal is clicked
  visitedAnimals?: Set<number>; // New prop to track visited animals
}

// Device detection functions
const isTablet = (width: number, height: number) => {
  const minDimension = Math.min(width, height);
  const maxDimension = Math.max(width, height);
  return minDimension >= 768 || maxDimension >= 1024;
};

const getScaleFactor = (width: number, height: number): number => {
  const baseWidth = 375;
  const baseHeight = 667;
  
  if (isTablet(width, height)) {
    const tabletBaseWidth = 768;
    const tabletBaseHeight = 1024;
    const widthScale = width / tabletBaseWidth;
    const heightScale = height / tabletBaseHeight;
    return Math.min(widthScale, heightScale, 1.5);
  } else {
    const widthScale = width / baseWidth;
    const heightScale = height / baseHeight;
    return Math.min(widthScale, heightScale);
  }
};

const getResponsiveSpacing = (baseSpacing: number, scaleFactor: number): number => {
  return Math.round(baseSpacing * scaleFactor);
};

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  handlePrev,
  handleNext,
  isTransitioning,
  currentAnimalIndex,
  bgColor,
  totalAnimals = 0,
  levelCompleted = false,
  buttonsDisabled = false,
  nextButtonDisabled = false,
  hasClickedCurrentAnimal = false,
  visitedAnimals = new Set(),
}) => {
  // Animate the arrows with a subtle left-right wiggle
  const leftAnim = useSharedValue(0);
  const rightAnim = useSharedValue(0);
  
  // Add throttling to prevent rapid taps
  const lastTapTime = useRef(0);
  const TAP_THROTTLE_MS = 100; // Allow faster taps while still preventing spam

  // Get orientation and dimensions
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isTabletDevice = isTablet(width, height);
  const dynamicStyles = useDynamicStyles();
  const scaleFactor = getScaleFactor(width, height);

  // Add glow effect for clicked animals
  const glowOpacity = useSharedValue(0);
  
  useEffect(() => {
    if (hasClickedCurrentAnimal) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 1000 }),
          withTiming(0.1, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      glowOpacity.value = 0;
    }
  }, [hasClickedCurrentAnimal, glowOpacity]);

  useEffect(() => {
    // Reduce animation complexity on phones to prevent memory issues
    const animationDuration = isTabletDevice ? 220 : 260;
    const animationScale = isTabletDevice ? 6 : 4; // Smaller movement on phones
    
    leftAnim.value = withRepeat(
      withSequence(
        withTiming(-animationScale, { duration: animationDuration }),
        withTiming(0, { duration: animationDuration }),
        withTiming(-animationScale, { duration: animationDuration }),
        withTiming(0, { duration: animationDuration })
      ),
      -1,
      false
    );
    rightAnim.value = withRepeat(
      withSequence(
        withTiming(animationScale, { duration: animationDuration }),
        withTiming(0, { duration: animationDuration }),
        withTiming(animationScale, { duration: animationDuration }),
        withTiming(0, { duration: animationDuration })
      ),
      -1,
      false
    );
  }, [leftAnim, rightAnim, isTabletDevice]);

  const leftArrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: leftAnim.value }],
  }));

  const rightArrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: rightAnim.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: glowOpacity.value,
    shadowRadius: 10,
    elevation: glowOpacity.value * 10,
  }));

  // Responsive navigation button style - much smaller in mobile portrait
  // Larger buttons for iPads/tablets
  const baseButtonSize = isTabletDevice 
    ? 160  // Increased from 120 to 160 for iPads
    : (isLandscape ? 140 : 80); // Much smaller buttons in mobile portrait
  const baseIconSize = isTabletDevice 
    ? 85  // Increased from 65 to 85 for iPads
    : (isLandscape ? 75 : 35); // Much smaller icons in mobile portrait
  
  // Add safety bounds to prevent excessive scaling
  const safeScaleFactor = Math.max(0.5, Math.min(scaleFactor, 2.0));
  const minButtonSize = isLandscape ? 60 : 45; // Smaller minimum for portrait
  const minIconSize = isLandscape ? 30 : 20; // Smaller minimum for portrait
  const maxButtonSize = isTabletDevice ? 220 : 200; // Larger max for tablets
  const maxIconSize = isTabletDevice ? 120 : 100; // Larger max for tablets
  const buttonSize = Math.max(minButtonSize, Math.min(maxButtonSize, getResponsiveSpacing(baseButtonSize, safeScaleFactor)));
  const iconSize = Math.max(minIconSize, Math.min(maxIconSize, getResponsiveSpacing(baseIconSize, safeScaleFactor)));

  const navButtonStyle = [
    styles.navButton,
    { 
      width: buttonSize,
      height: buttonSize,
      borderRadius: buttonSize / 2,
    }
  ];

  // Container style optimized for current orientation - no longer needed for positioning
  const containerStyle: ViewStyle = {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10000,
  };

  // Calculate button positions to eliminate dead space
  // On tablets, position buttons more towards the center
  const leftButtonLeft = isTabletDevice 
    ? getResponsiveSpacing(300, scaleFactor) 
    : getResponsiveSpacing(200, scaleFactor);
  const rightButtonRight = isTabletDevice 
    ? getResponsiveSpacing(300, scaleFactor) 
    : getResponsiveSpacing(200, scaleFactor);
  // Adjust button bottom positioning - move up on tablets
  const buttonBottom = isTabletDevice 
    ? getResponsiveSpacing(isLandscape ? 30 : 100, scaleFactor) // Much higher up on tablets (positive values)
    : getResponsiveSpacing(isLandscape ? 20 : 20, scaleFactor); // Better positioning for phones

  // Debug logging for tablet positioning
  if (isTabletDevice) {
    console.log('NavigationButtons tablet positioning:', {
      isTabletDevice,
      isLandscape,
      width,
      height,
      leftButtonLeft,
      rightButtonRight,
      buttonBottom,
      scaleFactor
    });
  }

  // Add visual debugging - log the actual button positions
  console.log('NavigationButtons button positions:', {
    leftButton: { left: leftButtonLeft, bottom: buttonBottom },
    rightButton: { right: rightButtonRight, bottom: buttonBottom },
    screenDimensions: { width, height },
    isTablet: isTabletDevice,
    isLandscape
  });

  // Gradient colors for the buttons
  const leftGradientColors = ['#FF6B6B', '#4ECDC4', '#45B7D1'] as const; // Red to teal to blue
  const rightGradientColors = ['#A8E6CF', '#FFD93D', '#FF6B6B'] as const; // Green to yellow to red

  // Add touch event handlers with logging
  const handlePrevPress = () => {
    try {
      const now = Date.now();
      if (now - lastTapTime.current < TAP_THROTTLE_MS) {
        return;
      }
      lastTapTime.current = now;
      
      handlePrev();
    } catch (error) {
      console.error('NavigationButtons: handlePrevPress error:', error);
    }
  };

  const handleNextPress = () => {
    try {
      const now = Date.now();
      if (now - lastTapTime.current < TAP_THROTTLE_MS) {
        return;
      }
      lastTapTime.current = now;
      
      handleNext();
    } catch (error) {
      console.error('NavigationButtons: handleNextPress error:', error);
    }
  };

  return (
    <View style={containerStyle}>
      {/* Left arrow button */}
      <TouchableOpacity
        onPress={handleNextPress}
        activeOpacity={0.7}
        disabled={isTransitioning || currentAnimalIndex >= totalAnimals - 1 || buttonsDisabled || !hasClickedCurrentAnimal}
        style={[navButtonStyle, { 
          position: 'absolute', 
          left: isTabletDevice ? width * 0.2 : leftButtonLeft, // Move closer to center on tablets
          bottom: buttonBottom 
        }]}
      >
        <View
          style={[styles.gradientBackground, {
            backgroundColor: isTransitioning || currentAnimalIndex >= totalAnimals - 1 || buttonsDisabled || !hasClickedCurrentAnimal ? '#ccc' : '#2196F3'
          }]}
        >
          <Animated.View style={leftArrowStyle}>
            <Text
              style={{
                color: isTransitioning || currentAnimalIndex >= totalAnimals - 1 || buttonsDisabled || !hasClickedCurrentAnimal ? 'rgba(0,0,0,0.4)' : (hasClickedCurrentAnimal ? 'white' : 'white'),
                fontSize: iconSize,
                fontWeight: 'bold',
              }}
            >
              →
            </Text>
          </Animated.View>
          {hasClickedCurrentAnimal && (
            <View style={{
              position: 'absolute',
              top: -2,
              left: -2,
              right: -2,
              bottom: -2,
              borderRadius: 62,
              borderWidth: 2,
              borderColor: '#4CAF50',
              opacity: 0.6,
            }} />
          )}
        </View>
      </TouchableOpacity>

      {/* Right arrow button */}
      <TouchableOpacity
        onPress={handlePrevPress}
        activeOpacity={0.7}
        disabled={isTransitioning || currentAnimalIndex === 0 || buttonsDisabled || !visitedAnimals.has(currentAnimalIndex - 1)}
        style={[navButtonStyle, { 
          position: 'absolute', 
          right: isTabletDevice ? width * 0.2 : rightButtonRight, // Move closer to center on tablets
          bottom: buttonBottom 
        }]}
      >
        <View
          style={[styles.gradientBackground, {
            backgroundColor: isTransitioning || currentAnimalIndex === 0 || buttonsDisabled || !visitedAnimals.has(currentAnimalIndex - 1) ? '#ccc' : '#FF4757'
          }]}
        >
          <Animated.View style={rightArrowStyle}>
            <Text
              style={{
                color: isTransitioning || currentAnimalIndex === 0 || buttonsDisabled || !visitedAnimals.has(currentAnimalIndex - 1) ? '#333333' : '#000000',
                fontSize: iconSize,
                fontWeight: 'bold',
              }}
            >
              ←
            </Text>
          </Animated.View>
          {!isTransitioning && currentAnimalIndex > 0 && !buttonsDisabled && visitedAnimals.has(currentAnimalIndex - 1) && (
            <View style={{
              position: 'absolute',
              top: -2,
              left: -2,
              right: -2,
              bottom: -2,
              borderRadius: 62,
              borderWidth: 2,
              borderColor: '#4ECDC4',
              opacity: 0.6,
            }} />
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navButton: {
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    overflow: 'hidden',
  },
  gradientBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 60,
  },
});

export default NavigationButtons;