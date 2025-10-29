import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, useWindowDimensions } from 'react-native';

interface Raindrop {
  id: number;
  x: number;
  length: number;
  width: number;
  speed: number;
  delay: number;
  opacity: number;
}

const AnimatedRain: React.FC = () => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const rainAnimations = useRef<Animated.Value[]>([]).current;

  // Create raindrops with different properties
  const raindrops: Raindrop[] = React.useMemo(() => {
    const dropCount = 80; // Increased number of raindrops for better visibility
    return Array.from({ length: dropCount }, (_, index) => ({
      id: index,
      x: Math.random() * screenWidth, // Random horizontal position
      length: Math.random() * 25 + 20, // Longer raindrops: 20-45 pixels
      width: Math.random() * 2 + 1.5, // Thicker raindrops: 1.5-3.5 pixels
      speed: Math.random() * 800 + 600, // Random speed between 600-1400ms (fast!)
      delay: Math.random() * 2000, // Random delay up to 2 seconds
      opacity: Math.random() * 0.3 + 0.6, // Higher opacity: 0.6-0.9
    }));
  }, [screenWidth]);

  // Initialize animations
  useEffect(() => {
    rainAnimations.length = 0; // Clear existing animations
    
    raindrops.forEach((drop) => {
      const fallAnim = new Animated.Value(0);
      rainAnimations.push(fallAnim);

      const animateRain = () => {
        // Falling animation - straight down, fast
        Animated.timing(fallAnim, {
          toValue: 1,
          duration: drop.speed,
          useNativeDriver: true,
          delay: drop.delay,
        }).start(() => {
          fallAnim.setValue(0);
          animateRain(); // Restart animation
        });
      };

      animateRain();
    });
  }, [raindrops, rainAnimations]);

  const renderRaindrop = (drop: Raindrop, index: number) => {
    const fallAnim = rainAnimations[index];
    if (!fallAnim) return null;

    return (
      <Animated.View
        key={drop.id}
        style={[
          styles.raindrop,
          {
            left: drop.x,
            width: drop.width,
            height: drop.length,
            opacity: drop.opacity,
            transform: [
              {
                translateY: fallAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-drop.length * 2, screenHeight + drop.length],
                }),
              },
            ],
          },
        ]}
      />
    );
  };

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {raindrops.map((drop, index) => renderRaindrop(drop, index))}
    </View>
  );
};

const styles = StyleSheet.create({
  raindrop: {
    position: 'absolute',
    backgroundColor: 'rgba(220, 240, 255, 0.85)', // Brighter, whiter rain with higher opacity
    borderRadius: 50, // Elongated shape
    shadowColor: 'rgba(255, 255, 255, 0.6)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default AnimatedRain;

