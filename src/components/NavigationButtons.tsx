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
import { useDynamicStyles } from '../styles/styles';

interface NavigationButtonsProps {
  handlePrev: () => void;
  handleNext: () => void;
  isTransitioning: boolean;
  currentAnimalIndex: number;
  bgColor: string;
}

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
  const isPortrait = height >= width;
  const isLandscape = width > height;
  const dynamicStyles = useDynamicStyles();

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

  // Responsive navigation button style
  const navButtonStyle = [
    styles.navButton,
    { 
      backgroundColor: bgColor,
      width: isLandscape ? 50 : 60,
      height: isLandscape ? 50 : 60,
    }
  ];

  // Responsive icon size
  const iconSize = isLandscape ? 28 : 34;

  // Container style optimized for both orientations
  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    bottom: isLandscape ? 20 : 30,
    left: isLandscape ? '20%' : '10%',
    right: isLandscape ? '20%' : '10%',
    paddingHorizontal: isLandscape ? 20 : 40,
    zIndex: 10,
  };

  return (
    <View style={containerStyle}>
      {/* Left arrow button */}
      <TouchableOpacity
        onPress={handlePrev}
        activeOpacity={0.7}
        disabled={isTransitioning || currentAnimalIndex === 0}
        style={navButtonStyle}
      >
        <Animated.View style={leftArrowStyle}>
          <Ionicons
            name="arrow-back"
            size={iconSize}
            color={isTransitioning || currentAnimalIndex === 0 ? 'rgba(0,0,0,0.4)' : 'black'}
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Right arrow button */}
      <TouchableOpacity
        onPress={handleNext}
        activeOpacity={0.7}
        disabled={isTransitioning}
        style={navButtonStyle}
      >
        <Animated.View style={rightArrowStyle}>
          <Ionicons
            name="arrow-forward"
            size={iconSize}
            color={isTransitioning ? 'rgba(0,0,0,0.4)' : 'black'}
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navButton: {
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});

export default NavigationButtons;