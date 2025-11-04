import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, useWindowDimensions } from 'react-native';

interface RainDrop {
  id: number;
  x: number;
  size: number;
  speed: number;
  delay: number;
  length: number; // Length of the rain drop
}

const AnimatedRain: React.FC = () => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const rainAnimations = useRef<Animated.Value[]>([]).current;

  // Create rain drops with different properties
  const rainDrops: RainDrop[] = React.useMemo(() => {
    const dropCount = 50; // Number of rain drops
    return Array.from({ length: dropCount }, (_, index) => ({
      id: index,
      x: Math.random() * screenWidth, // Random horizontal position
      size: Math.random() * 2 + 1, // Random width between 1-3 pixels
      speed: Math.random() * 800 + 400, // Random speed between 400-1200ms
      delay: Math.random() * 1000, // Random delay up to 1 second
      length: Math.random() * 30 + 20, // Random length between 20-50 pixels
    }));
  }, [screenWidth]);

  // Initialize animations
  useEffect(() => {
    rainAnimations.length = 0; // Clear existing animations
    
    rainDrops.forEach((drop) => {
      const animValue = new Animated.Value(0);
      rainAnimations.push(animValue);

      const animateRain = () => {
        Animated.timing(animValue, {
          toValue: 1,
          duration: drop.speed,
          useNativeDriver: true,
          delay: drop.delay,
        }).start(() => {
          animValue.setValue(0);
          animateRain(); // Restart animation
        });
      };

      animateRain();
    });
  }, [rainDrops, rainAnimations]);

  const renderRainDrop = (drop: RainDrop, index: number) => {
    const animValue = rainAnimations[index];
    if (!animValue) return null;

    return (
      <Animated.View
        key={drop.id}
        style={[
          styles.rainDrop,
          {
            left: drop.x,
            width: drop.size,
            height: drop.length,
            transform: [
              {
                translateY: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-drop.length, screenHeight + drop.length],
                }),
              },
            ],
            opacity: animValue.interpolate({
              inputRange: [0, 0.1, 0.9, 1],
              outputRange: [0, 0.9, 0.9, 0],
            }),
          },
        ]}
      />
    );
  };

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {rainDrops.map((drop, index) => renderRainDrop(drop, index))}
    </View>
  );
};

const styles = StyleSheet.create({
  rainDrop: {
    position: 'absolute',
    backgroundColor: 'rgba(173, 216, 230, 0.8)', // Light blue/gray color for rain
    shadowColor: 'rgba(135, 206, 235, 0.6)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default AnimatedRain;

