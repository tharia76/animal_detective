import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, useWindowDimensions } from 'react-native';

interface Snowflake {
  id: number;
  x: number;
  size: number;
  speed: number;
  delay: number;
  swayAmount: number;
  swaySpeed: number;
}

const AnimatedSnow: React.FC = () => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const snowAnimations = useRef<Animated.Value[]>([]).current;
  const swayAnimations = useRef<Animated.Value[]>([]).current;

  // Create snowflakes with different properties
  const snowflakes: Snowflake[] = React.useMemo(() => {
    const flakeCount = 40; // Number of snowflakes
    return Array.from({ length: flakeCount }, (_, index) => ({
      id: index,
      x: Math.random() * screenWidth, // Random horizontal position
      size: Math.random() * 6 + 2, // Random size between 2-8
      speed: Math.random() * 4000 + 3000, // Random speed between 3-7 seconds
      delay: Math.random() * 3000, // Random delay up to 3 seconds
      swayAmount: Math.random() * 50 + 20, // Random sway amount between 20-70
      swaySpeed: Math.random() * 2000 + 1000, // Random sway speed
    }));
  }, [screenWidth]);

  // Initialize animations
  useEffect(() => {
    snowAnimations.length = 0; // Clear existing animations
    swayAnimations.length = 0; // Clear existing sway animations
    
    snowflakes.forEach((flake) => {
      const fallAnim = new Animated.Value(0);
      const swayAnim = new Animated.Value(0);
      snowAnimations.push(fallAnim);
      swayAnimations.push(swayAnim);

      const animateSnow = () => {
        // Falling animation
        Animated.timing(fallAnim, {
          toValue: 1,
          duration: flake.speed,
          useNativeDriver: true,
          delay: flake.delay,
        }).start(() => {
          fallAnim.setValue(0);
          animateSnow(); // Restart animation
        });

        // Swaying animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(swayAnim, {
              toValue: 1,
              duration: flake.swaySpeed,
              useNativeDriver: true,
            }),
            Animated.timing(swayAnim, {
              toValue: 0,
              duration: flake.swaySpeed,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };

      animateSnow();
    });
  }, [snowflakes, snowAnimations, swayAnimations]);

  const renderSnowflake = (flake: Snowflake, index: number) => {
    const fallAnim = snowAnimations[index];
    const swayAnim = swayAnimations[index];
    if (!fallAnim || !swayAnim) return null;

    // Different snowflake shapes and colors
    const snowflakeStyles = [
      { backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: flake.size / 2 }, // Circle
      { backgroundColor: 'rgba(240, 248, 255, 0.8)', borderRadius: 0 }, // Square
      { backgroundColor: 'rgba(255, 250, 250, 0.9)', borderRadius: flake.size / 4 }, // Rounded square
    ];
    
    const randomStyle = snowflakeStyles[Math.floor(Math.random() * snowflakeStyles.length)];

    return (
      <Animated.View
        key={flake.id}
        style={[
          styles.snowflake,
          randomStyle,
          {
            left: flake.x,
            width: flake.size,
            height: flake.size,
            transform: [
              {
                translateY: fallAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-flake.size, screenHeight + flake.size],
                }),
              },
              {
                translateX: swayAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-flake.swayAmount, flake.swayAmount],
                }),
              },
              {
                rotate: fallAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
            opacity: fallAnim.interpolate({
              inputRange: [0, 0.1, 0.9, 1],
              outputRange: [0, 1, 1, 0],
            }),
          },
        ]}
      />
    );
  };

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {snowflakes.map((flake, index) => renderSnowflake(flake, index))}
    </View>
  );
};

const styles = StyleSheet.create({
  snowflake: {
    position: 'absolute',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default AnimatedSnow; 