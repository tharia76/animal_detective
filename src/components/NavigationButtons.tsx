import React, { useEffect } from 'react';
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
}

// Device detection functions
const isTablet = () => {
  const { width, height } = require('react-native').Dimensions.get('window');
  const aspectRatio = height / width;
  return aspectRatio <= 1.6;
};

const getScaleFactor = (width: number, height: number): number => {
  const baseWidth = 375;
  const baseHeight = 667;
  
  if (isTablet()) {
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
  bgColor
}) => {
  // Animate the arrows with a subtle left-right wiggle
  const leftAnim = useSharedValue(0);
  const rightAnim = useSharedValue(0);

  // Get orientation and dimensions
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isTabletDevice = isTablet();
  const dynamicStyles = useDynamicStyles();
  const scaleFactor = getScaleFactor(width, height);

  useEffect(() => {
    leftAnim.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 300 }),
        withTiming(0, { duration: 300 }),
        withTiming(-6, { duration: 300 }),
        withTiming(0, { duration: 300 })
      ),
      -1,
      false
    );
    rightAnim.value = withRepeat(
      withSequence(
        withTiming(6, { duration: 300 }),
        withTiming(0, { duration: 300 }),
        withTiming(6, { duration: 300 }),
        withTiming(0, { duration: 300 })
      ),
      -1,
      false
    );
  }, [leftAnim, rightAnim]);

  const leftArrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: leftAnim.value }],
  }));

  const rightArrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: rightAnim.value }],
  }));

  // Responsive navigation button style - made bigger
  const navButtonStyle = [
    styles.navButton,
    { 
      width: getResponsiveSpacing(120, scaleFactor), // Increased from 80
      height: getResponsiveSpacing(120, scaleFactor), // Increased from 80
      borderRadius: getResponsiveSpacing(60, scaleFactor), // Increased from 40
    }
  ];

  // Responsive icon size - made bigger
  const iconSize = getResponsiveSpacing(65, scaleFactor); // Increased from 45

  // Container style optimized for landscape orientation
  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    bottom: getResponsiveSpacing(120, scaleFactor),
    left: '20%',
    right: '20%',
    paddingHorizontal: getResponsiveSpacing(20, scaleFactor),
    zIndex: 10,
  };

  // Gradient colors for the buttons
  const leftGradientColors = ['#FF6B6B', '#4ECDC4', '#45B7D1'] as const; // Red to teal to blue
  const rightGradientColors = ['#A8E6CF', '#FFD93D', '#FF6B6B'] as const; // Green to yellow to red

  return (
    <View style={containerStyle}>
      {/* Left arrow button */}
      <TouchableOpacity
        onPress={handlePrev}
        activeOpacity={0.7}
        disabled={isTransitioning || currentAnimalIndex === 0}
        style={navButtonStyle}
      >
        <LinearGradient
          colors={isTransitioning || currentAnimalIndex === 0 ? ['#ccc', '#999'] : leftGradientColors}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View style={leftArrowStyle}>
            <Ionicons
              name="arrow-back"
              size={iconSize}
              color={isTransitioning || currentAnimalIndex === 0 ? 'rgba(0,0,0,0.4)' : 'white'}
            />
          </Animated.View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Right arrow button */}
      <TouchableOpacity
        onPress={handleNext}
        activeOpacity={0.7}
        disabled={isTransitioning}
        style={navButtonStyle}
      >
        <LinearGradient
          colors={isTransitioning ? ['#ccc', '#999'] : rightGradientColors}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View style={rightArrowStyle}>
            <Ionicons
              name="arrow-forward"
              size={iconSize}
              color={isTransitioning ? 'rgba(0,0,0,0.4)' : 'white'}
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