import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, useWindowDimensions } from 'react-native';

interface SandGrain {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  delay: number;
  direction: 'left' | 'right';
  verticalSpeed: number;
}

const AnimatedSand: React.FC = () => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const sandAnimations = useRef<Animated.Value[]>([]).current;

  // Debug log to ensure component is rendering
  console.log('AnimatedSand rendering with screen dimensions:', screenWidth, screenHeight);

  // Create sand grains with different properties
  const sandGrains: SandGrain[] = React.useMemo(() => {
    const grainCount = 30; // Increased number of sand grains
    return Array.from({ length: grainCount }, (_, index) => ({
      id: index,
      x: Math.random() * screenWidth, // Random horizontal position
      y: Math.random() * screenHeight, // Random vertical position
      size: Math.random() * 8 + 3, // Increased size between 3-11 pixels
      speed: Math.random() * 3000 + 1500, // Faster speed between 1.5-4.5 seconds
      delay: Math.random() * 2000, // Random delay up to 2 seconds
      direction: Math.random() > 0.5 ? 'left' : 'right', // Random direction
      verticalSpeed: Math.random() * 2000 + 1000, // Random vertical movement
    }));
  }, [screenWidth, screenHeight]);

  // Initialize animations
  useEffect(() => {
    sandAnimations.length = 0; // Clear existing animations
    
    sandGrains.forEach((grain) => {
      const animValue = new Animated.Value(0);
      sandAnimations.push(animValue);

      const animateSand = () => {
        Animated.timing(animValue, {
          toValue: 1,
          duration: grain.speed,
          useNativeDriver: true,
          delay: grain.delay,
        }).start(() => {
          animValue.setValue(0);
          animateSand(); // Restart animation
        });
      };

      animateSand();
    });
  }, [sandGrains, sandAnimations]);

  const renderSandGrain = (grain: SandGrain, index: number) => {
    const animValue = sandAnimations[index];
    if (!animValue) return null;

    const horizontalDistance = grain.direction === 'left' ? -screenWidth - grain.size : screenWidth + grain.size;
    const verticalDistance = Math.random() * 100 - 50; // Random vertical movement

    // Different shades of orange for variety
    const orangeShades = [
      'rgba(255, 165, 0, 0.9)',   // Orange
      'rgba(255, 140, 0, 0.9)',   // Dark Orange
      'rgba(255, 127, 0, 0.9)',   // Orange Red
      'rgba(255, 99, 71, 0.9)',   // Tomato
      'rgba(255, 69, 0, 0.9)',    // Red Orange
      'rgba(255, 215, 0, 0.9)',   // Gold
      'rgba(255, 193, 37, 0.9)',  // Goldenrod
      'rgba(255, 160, 122, 0.9)', // Light Salmon
    ];
    
    const randomOrange = orangeShades[Math.floor(Math.random() * orangeShades.length)];

    return (
      <Animated.View
        key={grain.id}
        style={[
          styles.sandGrain,
          {
            left: grain.x,
            top: grain.y,
            width: grain.size,
            height: grain.size,
            borderRadius: grain.size / 2,
            backgroundColor: randomOrange,
            transform: [
              {
                translateX: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, horizontalDistance],
                }),
              },
              {
                translateY: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, verticalDistance],
                }),
              },
              {
                scale: animValue.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.5, 1, 0.3],
                }),
              },
            ],
            opacity: animValue.interpolate({
              inputRange: [0, 0.1, 0.9, 1],
              outputRange: [0, 0.8, 0.8, 0],
            }),
          },
        ]}
      />
    );
  };

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {sandGrains.map((grain, index) => renderSandGrain(grain, index))}
    </View>
  );
};

const styles = StyleSheet.create({
  sandGrain: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 165, 0, 0.9)', // Default orange color
    borderWidth: 2,
    borderColor: 'rgba(255, 140, 0, 1)', // Darker orange border
    shadowColor: '#FF8C00',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5,
  },
});

export default AnimatedSand; 