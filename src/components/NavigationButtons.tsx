import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, useWindowDimensions, StyleSheet, ViewStyle } from 'react-native';
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

  // Responsive navigation button style - much smaller in mobile portrait
  const baseButtonSize = isTabletDevice 
    ? 120 
    : (isLandscape ? 140 : 80); // Much smaller buttons in mobile portrait
  const baseIconSize = isTabletDevice 
    ? 65 
    : (isLandscape ? 75 : 35); // Much smaller icons in mobile portrait
  
  // Add safety bounds to prevent excessive scaling
  const safeScaleFactor = Math.max(0.5, Math.min(scaleFactor, 2.0));
  const minButtonSize = isLandscape ? 60 : 45; // Smaller minimum for portrait
  const minIconSize = isLandscape ? 30 : 20; // Smaller minimum for portrait
  const buttonSize = Math.max(minButtonSize, Math.min(200, getResponsiveSpacing(baseButtonSize, safeScaleFactor)));
  const iconSize = Math.max(minIconSize, Math.min(100, getResponsiveSpacing(baseIconSize, safeScaleFactor)));

  const navButtonStyle = [
    styles.navButton,
    { 
      width: buttonSize,
      height: buttonSize,
      borderRadius: buttonSize / 2,
    }
  ];

        // Container style optimized for current orientation
  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    bottom: getResponsiveSpacing(isLandscape ? 120 : 80, scaleFactor), // Higher in portrait
    left: '10%', // Spread buttons further apart
    right: '10%', // Spread buttons further apart
    paddingHorizontal: getResponsiveSpacing(30, scaleFactor), // More padding for extra spacing
    zIndex: 10000,
  };

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
        onPress={handlePrevPress}
        activeOpacity={0.7}
        disabled={isTransitioning || currentAnimalIndex === 0 || buttonsDisabled}
        style={navButtonStyle}
      >
        <LinearGradient
          colors={isTransitioning || currentAnimalIndex === 0 || buttonsDisabled ? ['#ccc', '#999'] : leftGradientColors}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View style={leftArrowStyle}>
            <Ionicons
              name="arrow-back"
              size={iconSize}
              color={isTransitioning || currentAnimalIndex === 0 || buttonsDisabled ? 'rgba(0,0,0,0.4)' : 'white'}
            />
          </Animated.View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Right arrow button */}
      <TouchableOpacity
        onPress={handleNextPress}
        activeOpacity={0.7}
        disabled={isTransitioning || (levelCompleted && currentAnimalIndex >= totalAnimals - 1) || buttonsDisabled || nextButtonDisabled}
        style={navButtonStyle}
      >
        <LinearGradient
          colors={isTransitioning || (levelCompleted && currentAnimalIndex >= totalAnimals - 1) || buttonsDisabled || nextButtonDisabled ? ['#ccc', '#999'] : rightGradientColors}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View style={rightArrowStyle}>
            <Ionicons
              name="arrow-forward"
              size={iconSize}
              color={isTransitioning || (levelCompleted && currentAnimalIndex >= totalAnimals - 1) || buttonsDisabled || nextButtonDisabled ? 'rgba(0,0,0,0.4)' : 'white'}
            />
          </Animated.View>
        </LinearGradient>
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