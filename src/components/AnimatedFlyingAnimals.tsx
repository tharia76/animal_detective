import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, useWindowDimensions, Image, Easing } from 'react-native';

interface FlyingAnimal {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  delay: number;
  image: any;
  flightPath: 'circle' | 'zigzag' | 'wave' | 'diagonal';
  opacity: number;
}

// Import all flying animal images
const flyingAnimalImages = [
  require('../assets/images/flying_animals/bear.png'),
  require('../assets/images/flying_animals/bunny.png'),
  require('../assets/images/flying_animals/cat.png'),
  require('../assets/images/flying_animals/dog.png'),
  require('../assets/images/flying_animals/dol.png'),
  require('../assets/images/flying_animals/eleph.png'),
  require('../assets/images/flying_animals/fox.png'),
  require('../assets/images/flying_animals/jelly.png'),
  require('../assets/images/flying_animals/lion.png'),
  require('../assets/images/flying_animals/monkey.png'),
  require('../assets/images/flying_animals/octopus.png'),
  require('../assets/images/flying_animals/panda.png'),
  require('../assets/images/flying_animals/peng.png'),
  require('../assets/images/flying_animals/seahorse.png'),
  require('../assets/images/flying_animals/seaxlion.png'),
  require('../assets/images/flying_animals/star.png'),
  require('../assets/images/flying_animals/tortoise.png'),
  require('../assets/images/flying_animals/whale.png'),
];

const AnimatedFlyingAnimals: React.FC = () => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const flightAnimations = useRef<Animated.Value[]>([]).current;

  // Create flying animals with different properties
  const flyingAnimals: FlyingAnimal[] = React.useMemo(() => {
    const animalCount = 15; // Number of flying animals
    return Array.from({ length: animalCount }, (_, index) => ({
      id: index,
      x: Math.random() * screenWidth, // Random horizontal position
      y: Math.random() * screenHeight, // Random vertical position
      size: Math.random() * 50 + 35, // Random size between 35-85
      speed: Math.random() * 12000 + 10000, // Random speed between 10-22 seconds for smoother movement
      delay: Math.random() * 5000, // Random delay up to 5 seconds
      image: flyingAnimalImages[Math.floor(Math.random() * flyingAnimalImages.length)],
      flightPath: ['circle', 'zigzag', 'wave', 'diagonal'][Math.floor(Math.random() * 4)] as 'circle' | 'zigzag' | 'wave' | 'diagonal',
      opacity: Math.random() * 0.3 + 0.35, // Random opacity between 0.35-0.65 for background effect
    }));
  }, [screenWidth, screenHeight]);

  // Initialize animations
  useEffect(() => {
    flightAnimations.length = 0; // Clear existing animations
    
    flyingAnimals.forEach((animal) => {
      const flightAnim = new Animated.Value(0);
      flightAnimations.push(flightAnim);

      const animateAnimal = () => {
        Animated.timing(flightAnim, {
          toValue: 1,
          duration: animal.speed,
          useNativeDriver: true,
          delay: animal.delay,
          easing: Easing.inOut(Easing.ease), // Smooth easing for natural movement
        }).start(() => {
          flightAnim.setValue(0);
          animateAnimal(); // Restart animation
        });
      };

      animateAnimal();
    });
  }, [flyingAnimals, flightAnimations]);

  const renderFlyingAnimal = (animal: FlyingAnimal, index: number) => {
    const flightAnim = flightAnimations[index];
    if (!flightAnim) return null;

    // Different flight paths with larger movements
    let transformX, transformY, rotation;
    
    // Calculate large movement ranges based on screen size
    const horizontalRange = screenWidth * 0.6; // Move across 60% of screen width
    const verticalRange = screenHeight * 0.4; // Move across 40% of screen height
    
    // Random direction multipliers for variety
    const xDirection = (Math.random() > 0.5 ? 1 : -1);
    const yDirection = (Math.random() > 0.5 ? 1 : -1);

    switch (animal.flightPath) {
      case 'circle':
        // Large circular motion
        const circleRadius = Math.min(horizontalRange, verticalRange) * 0.6;
        transformX = flightAnim.interpolate({
          inputRange: [0, 0.25, 0.5, 0.75, 1],
          outputRange: [
            0,
            circleRadius * xDirection,
            0,
            -circleRadius * xDirection,
            0
          ],
        });
        transformY = flightAnim.interpolate({
          inputRange: [0, 0.25, 0.5, 0.75, 1],
          outputRange: [
            0,
            0,
            circleRadius * yDirection,
            0,
            0
          ],
        });
        rotation = flightAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        });
        break;
      case 'zigzag':
        // Large zigzag across screen
        transformX = flightAnim.interpolate({
          inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
          outputRange: [0, horizontalRange * 0.3 * xDirection, -horizontalRange * 0.2 * xDirection, horizontalRange * 0.4 * xDirection, -horizontalRange * 0.1 * xDirection, 0],
        });
        transformY = flightAnim.interpolate({
          inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
          outputRange: [0, -verticalRange * 0.3 * yDirection, verticalRange * 0.4 * yDirection, -verticalRange * 0.2 * yDirection, verticalRange * 0.1 * yDirection, 0],
        });
        rotation = flightAnim.interpolate({
          inputRange: [0, 0.25, 0.5, 0.75, 1],
          outputRange: ['0deg', '-20deg', '20deg', '-15deg', '0deg'],
        });
        break;
      case 'wave':
        // Smooth wave motion across screen
        transformX = flightAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, horizontalRange * xDirection],
        });
        transformY = flightAnim.interpolate({
          inputRange: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1],
          outputRange: [
            0,
            -verticalRange * 0.3 * yDirection,
            0,
            verticalRange * 0.3 * yDirection,
            0,
            -verticalRange * 0.3 * yDirection,
            0,
            verticalRange * 0.3 * yDirection,
            0
          ],
        });
        rotation = flightAnim.interpolate({
          inputRange: [0, 0.25, 0.5, 0.75, 1],
          outputRange: ['0deg', '15deg', '0deg', '-15deg', '0deg'],
        });
        break;
      default: // diagonal
        // Large diagonal movement
        transformX = flightAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, horizontalRange * xDirection],
        });
        transformY = flightAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, verticalRange * yDirection],
        });
        rotation = flightAnim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: ['0deg', '25deg', '0deg'],
        });
    }

    return (
      <Animated.View
        key={animal.id}
        style={[
          styles.animalContainer,
          {
            left: animal.x,
            top: animal.y,
            transform: [
              { translateX: transformX },
              { translateY: transformY },
              { rotate: rotation },
            ],
          },
        ]}
      >
        <Image
          source={animal.image}
          style={[
            styles.animalImage,
            {
              width: animal.size,
              height: animal.size,
              opacity: animal.opacity,
            },
          ]}
          resizeMode="contain"
        />
      </Animated.View>
    );
  };

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {flyingAnimals.map((animal, index) => renderFlyingAnimal(animal, index))}
    </View>
  );
};

const styles = StyleSheet.create({
  animalContainer: {
    position: 'absolute',
  },
  animalImage: {
    // Images will be styled dynamically
  },
});

export default AnimatedFlyingAnimals;

