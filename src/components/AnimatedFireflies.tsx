import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, useWindowDimensions } from 'react-native';

interface Firefly {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  delay: number;
  glowIntensity: number;
  glowSpeed: number;
  flightPath: 'circle' | 'zigzag' | 'random';
}

const AnimatedFireflies: React.FC = () => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const flightAnimations = useRef<Animated.Value[]>([]).current;
  const glowAnimations = useRef<Animated.Value[]>([]).current;

  // Create fireflies with different properties
  const fireflies: Firefly[] = React.useMemo(() => {
    const fireflyCount = 20; // Number of fireflies
    return Array.from({ length: fireflyCount }, (_, index) => ({
      id: index,
      x: Math.random() * screenWidth, // Random horizontal position
      y: Math.random() * screenHeight, // Random vertical position
      size: Math.random() * 4 + 2, // Random size between 2-6
      speed: Math.random() * 5000 + 3000, // Random speed between 3-8 seconds
      delay: Math.random() * 2000, // Random delay up to 2 seconds
      glowIntensity: Math.random() * 0.5 + 0.5, // Random glow intensity
      glowSpeed: Math.random() * 1000 + 500, // Random glow speed
      flightPath: ['circle', 'zigzag', 'random'][Math.floor(Math.random() * 3)] as 'circle' | 'zigzag' | 'random',
    }));
  }, [screenWidth, screenHeight]);

  // Initialize animations
  useEffect(() => {
    flightAnimations.length = 0; // Clear existing animations
    glowAnimations.length = 0; // Clear existing glow animations
    
    fireflies.forEach((firefly) => {
      const flightAnim = new Animated.Value(0);
      const glowAnim = new Animated.Value(0);
      flightAnimations.push(flightAnim);
      glowAnimations.push(glowAnim);

      const animateFirefly = () => {
        // Flight animation - using native driver
        Animated.timing(flightAnim, {
          toValue: 1,
          duration: firefly.speed,
          useNativeDriver: true,
          delay: firefly.delay,
        }).start(() => {
          flightAnim.setValue(0);
          animateFirefly(); // Restart animation
        });

        // Glow animation - using JS driver for opacity and shadow
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: firefly.glowSpeed,
              useNativeDriver: false,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: firefly.glowSpeed,
              useNativeDriver: false,
            }),
          ])
        ).start();
      };

      animateFirefly();
    });
  }, [fireflies, flightAnimations, glowAnimations]);

  const renderFirefly = (firefly: Firefly, index: number) => {
    const flightAnim = flightAnimations[index];
    const glowAnim = glowAnimations[index];
    if (!flightAnim || !glowAnim) return null;

    // Different flight paths
    let transformX, transformY;
    const radius = 50 + Math.random() * 100; // Random flight radius

    switch (firefly.flightPath) {
      case 'circle':
        transformX = flightAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, radius * Math.cos(2 * Math.PI)],
        });
        transformY = flightAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, radius * Math.sin(2 * Math.PI)],
        });
        break;
      case 'zigzag':
        transformX = flightAnim.interpolate({
          inputRange: [0, 0.25, 0.5, 0.75, 1],
          outputRange: [0, 30, -20, 40, 0],
        });
        transformY = flightAnim.interpolate({
          inputRange: [0, 0.25, 0.5, 0.75, 1],
          outputRange: [0, -20, 30, -10, 0],
        });
        break;
      default: // random
        transformX = flightAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, (Math.random() - 0.5) * 100],
        });
        transformY = flightAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, (Math.random() - 0.5) * 100],
        });
    }

    return (
      <Animated.View
        key={firefly.id}
        style={[
          styles.fireflyContainer,
          {
            left: firefly.x,
            top: firefly.y,
            transform: [
              { translateX: transformX },
              { translateY: transformY },
            ],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.firefly,
            {
              width: firefly.size,
              height: firefly.size,
              borderRadius: firefly.size / 2,
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, firefly.glowIntensity],
              }),
              shadowOpacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.2, 0.8],
              }),
              shadowRadius: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [2, 8],
              }),
            },
          ]}
        />
      </Animated.View>
    );
  };

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {fireflies.map((firefly, index) => renderFirefly(firefly, index))}
    </View>
  );
};

const styles = StyleSheet.create({
  fireflyContainer: {
    position: 'absolute',
  },
  firefly: {
    backgroundColor: 'rgba(255, 255, 0, 0.9)', // Yellow glow
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 0, 0.6)',
    shadowColor: '#FFFF00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 3,
  },
});

export default AnimatedFireflies; 