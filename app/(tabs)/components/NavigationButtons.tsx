import React, { useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { styles } from '../../styles/styles';

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

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 20 }}>
      <TouchableOpacity
        style={[styles.navButton, { backgroundColor: bgColor }]}
        onPress={handlePrev}
        activeOpacity={0.7}
        disabled={isTransitioning || currentAnimalIndex === 0}
      >
        <Animated.View style={leftArrowStyle}>
          <Ionicons
            name="arrow-back"
            size={34}
            color={isTransitioning || currentAnimalIndex === 0 ? 'rgba(0,0,0,0.5)' : 'black'}
          />
        </Animated.View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navButton, { backgroundColor: bgColor }]}
        onPress={handleNext}
        activeOpacity={0.7}
        disabled={isTransitioning}
      >
        <Animated.View style={rightArrowStyle}>
          <Ionicons
            name="arrow-forward"
            size={34}
            color={isTransitioning ? 'rgba(0,0,0,0.5)' : 'black'}
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

export default NavigationButtons;