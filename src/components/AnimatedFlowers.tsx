import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, useWindowDimensions, Image } from 'react-native';

interface Flower {
  id: number;
  x: number;
  size: number;
  speed: number;
  delay: number;
  rotationSpeed: number;
  swayAmount: number;
  flowerType: 'flower1' | 'flower2' | 'flower3';
}

const AnimatedFlowers: React.FC = () => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const flowerAnimations = useRef<Animated.Value[]>([]).current;
  const rotationAnimations = useRef<Animated.Value[]>([]).current;
  const swayAnimations = useRef<Animated.Value[]>([]).current;

  // Create flowers with different properties
  const flowers: Flower[] = React.useMemo(() => {
    const flowerCount = 18; // Number of falling flowers
    return Array.from({ length: flowerCount }, (_, index) => ({
      id: index,
      x: Math.random() * screenWidth, // Random horizontal position
      size: Math.random() * 30 + 25, // Random size between 25-55 pixels
      speed: Math.random() * 9000 + 5000, // Random speed between 5-14 seconds (gentle fall)
      delay: Math.random() * 3500, // Random delay up to 3.5 seconds
      rotationSpeed: Math.random() * 3500 + 2000, // Random rotation speed
      swayAmount: Math.random() * 70 + 25, // Random sway amount between 25-95
      flowerType: ['flower1', 'flower2', 'flower3'][Math.floor(Math.random() * 3)] as 'flower1' | 'flower2' | 'flower3',
    }));
  }, [screenWidth, screenHeight]);

  // Initialize animations
  useEffect(() => {
    flowerAnimations.length = 0; // Clear existing animations
    rotationAnimations.length = 0; // Clear existing rotation animations
    swayAnimations.length = 0; // Clear existing sway animations
    
    flowers.forEach((flower) => {
      const fallAnim = new Animated.Value(0);
      const rotationAnim = new Animated.Value(0);
      const swayAnim = new Animated.Value(0);
      
      flowerAnimations.push(fallAnim);
      rotationAnimations.push(rotationAnim);
      swayAnimations.push(swayAnim);

      const animateFlower = () => {
        // Falling animation - using native driver
        Animated.timing(fallAnim, {
          toValue: 1,
          duration: flower.speed,
          useNativeDriver: true,
          delay: flower.delay,
        }).start(() => {
          fallAnim.setValue(0);
          animateFlower(); // Restart animation
        });

        // Rotation animation - using native driver
        Animated.loop(
          Animated.timing(rotationAnim, {
            toValue: 1,
            duration: flower.rotationSpeed,
            useNativeDriver: true,
          })
        ).start();

        // Sway animation - using native driver (gentle swaying for flowers)
        Animated.loop(
          Animated.sequence([
            Animated.timing(swayAnim, {
              toValue: 1,
              duration: flower.rotationSpeed * 0.75,
              useNativeDriver: true,
            }),
            Animated.timing(swayAnim, {
              toValue: 0,
              duration: flower.rotationSpeed * 0.75,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };

      animateFlower();
    });
  }, [flowers, flowerAnimations, rotationAnimations, swayAnimations]);

  const getFlowerImage = (flowerType: string) => {
    switch (flowerType) {
      case 'flower1':
        return require('../assets/images/level-backgrounds/flowers/1.png');
      case 'flower2':
        return require('../assets/images/level-backgrounds/flowers/2.png');
      case 'flower3':
        return require('../assets/images/level-backgrounds/flowers/3.png');
      default:
        return require('../assets/images/level-backgrounds/flowers/1.png');
    }
  };

  const renderFlower = (flower: Flower, index: number) => {
    const fallAnim = flowerAnimations[index];
    const rotationAnim = rotationAnimations[index];
    const swayAnim = swayAnimations[index];
    if (!fallAnim || !rotationAnim || !swayAnim) return null;

    // Falling animation
    const translateY = fallAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-100, screenHeight + 100],
    });

    // Sway animation - gentle swaying for flowers
    const translateX = swayAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-flower.swayAmount, flower.swayAmount],
    });

    // Rotation animation - gentle tumbling
    const rotate = rotationAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <Animated.View
        key={flower.id}
        style={[
          styles.flowerContainer,
          {
            left: flower.x,
            transform: [
              { translateY },
              { translateX },
              { rotate },
            ],
          },
        ]}
      >
        <Image
          source={getFlowerImage(flower.flowerType)}
          style={[
            styles.flower,
            {
              width: flower.size,
              height: flower.size,
            },
          ]}
          resizeMode="contain"
        />
      </Animated.View>
    );
  };

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {flowers.map((flower, index) => renderFlower(flower, index))}
    </View>
  );
};

const styles = StyleSheet.create({
  flowerContainer: {
    position: 'absolute',
  },
  flower: {
    opacity: 0.9, // Bright and colorful flowers
  },
});

export default AnimatedFlowers;

