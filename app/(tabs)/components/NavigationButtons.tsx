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
import { useDynamicStyles } from '../../styles/styles';

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

  // Get orientation
  const { width, height } = useWindowDimensions();
  const isPortrait = height >= width;
  const dynamicStyles = useDynamicStyles();

  useEffect(() => {
    leftAnim.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 250 }),
        withTiming(0, { duration: 250 }),
        withTiming(-8, { duration: 250 }),
        withTiming(0, { duration: 250 })
      ),
      -1,
      false
    );
    rightAnim.value = withRepeat(
      withSequence(
        withTiming(8, { duration: 250 }),
        withTiming(0, { duration: 250 }),
        withTiming(8, { duration: 250 }),
        withTiming(0, { duration: 250 })
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

  // Layout for portrait: row, for landscape: column, and adjust alignment
  const containerStyle = isPortrait
    ? {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: 20,
        gap: 200, // bring buttons closer together (React Native 0.71+)
      }
    : {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: 20,
        gap: 300, // bring buttons closer together
      };

  // navButton style, now using StyleSheet for consistency and easier override
  const navButtonStyle = [
    styles.navButton,
    { backgroundColor: bgColor }
  ];

  return (
    <View style={containerStyle as ViewStyle}>
      {isPortrait ? (
        <>
          {/* Left arrow on the left in portrait */}
          <TouchableOpacity
            onPress={handlePrev}
            activeOpacity={0.7}
            disabled={isTransitioning || currentAnimalIndex === 0}
            style={navButtonStyle}
          >
            <Animated.View style={leftArrowStyle}>
              <Ionicons
                name="arrow-back"
                size={34}
                color={isTransitioning || currentAnimalIndex === 0 ? 'rgba(0,0,0,0.5)' : 'black'}
              />
            </Animated.View>
          </TouchableOpacity>
          {/* Right arrow on the right in portrait */}
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.7}
            disabled={isTransitioning}
            style={navButtonStyle}
          >
            <Animated.View style={rightArrowStyle}>
              <Ionicons
                name="arrow-forward"
                size={34}
                color={isTransitioning ? 'rgba(0,0,0,0.5)' : 'black'}
              />
            </Animated.View>
          </TouchableOpacity>
        </>
      ) : (
        <>
          {/* Left arrow on the left in landscape */}
          <TouchableOpacity
            onPress={handlePrev}
            activeOpacity={0.7}
            disabled={isTransitioning || currentAnimalIndex === 0}
            style={navButtonStyle}
          >
            <Animated.View style={leftArrowStyle}>
              <Ionicons
                name="arrow-back"
                size={34}
                color={isTransitioning || currentAnimalIndex === 0 ? 'rgba(0,0,0,0.5)' : 'black'}
              />
            </Animated.View>
          </TouchableOpacity>
          {/* Right arrow on the right in landscape */}
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.7}
            disabled={isTransitioning}
            style={navButtonStyle}
          >
            <Animated.View style={rightArrowStyle}>
              <Ionicons
                name="arrow-forward"
                size={34}
                color={isTransitioning ? 'rgba(0,0,0,0.5)' : 'black'}
              />
            </Animated.View>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  navButton: {
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 10,
  },
});

export default NavigationButtons;