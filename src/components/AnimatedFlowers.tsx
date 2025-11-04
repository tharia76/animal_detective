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

  // Detect if device is tablet/iPad
  const isTablet = Math.min(screenWidth, screenHeight) >= 768;

  // Create flowers with different properties
  const flowers: Flower[] = React.useMemo(() => {
    const flowerCount = 15; // Number of falling flowers
    // Bigger sizes on iPads: 40-80 pixels vs 20-50 on phones
    const minSize = isTablet ? 40 : 20;
    const maxSize = isTablet ? 80 : 50;
    return Array.from({ length: flowerCount }, (_, index) => ({
      id: index,
      x: Math.random() * screenWidth, // Random horizontal position
      size: Math.random() * (maxSize - minSize) + minSize, // Random size between minSize-maxSize
      speed: Math.random() * 8000 + 4000, // Random speed between 4-12 seconds
      delay: Math.random() * 3000, // Random delay up to 3 seconds
      rotationSpeed: Math.random() * 3000 + 2000, // Random rotation speed
      swayAmount: Math.random() * 60 + 20, // Random sway amount
      flowerType: ['flower1', 'flower2', 'flower3'][Math.floor(Math.random() * 3)] as 'flower1' | 'flower2' | 'flower3',
    }));
  }, [screenWidth, screenHeight, isTablet]);

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

        // Sway animation - using native driver
        Animated.loop(
          Animated.sequence([
            Animated.timing(swayAnim, {
              toValue: 1,
              duration: flower.rotationSpeed * 0.7,
              useNativeDriver: true,
            }),
            Animated.timing(swayAnim, {
              toValue: 0,
              duration: flower.rotationSpeed * 0.7,
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

    // Sway animation
    const translateX = swayAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-flower.swayAmount, flower.swayAmount],
    });

    // Rotation animation
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
    opacity: 0.8,
  },
});

export default AnimatedFlowers;

