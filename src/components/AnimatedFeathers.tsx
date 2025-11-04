import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, useWindowDimensions, Image } from 'react-native';

interface Feather {
  id: number;
  x: number;
  size: number;
  speed: number;
  delay: number;
  rotationSpeed: number;
  swayAmount: number;
  featherType: 'feather1' | 'feather2' | 'feather3';
}

const AnimatedFeathers: React.FC = () => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const featherAnimations = useRef<Animated.Value[]>([]).current;
  const rotationAnimations = useRef<Animated.Value[]>([]).current;
  const swayAnimations = useRef<Animated.Value[]>([]).current;

  // Detect if device is tablet/iPad
  const isTablet = Math.min(screenWidth, screenHeight) >= 768;

  // Create feathers with different properties
  const feathers: Feather[] = React.useMemo(() => {
    const featherCount = 15; // Number of falling feathers
    // Bigger sizes on iPads: 40-80 pixels vs 20-50 on phones
    const minSize = isTablet ? 40 : 20;
    const maxSize = isTablet ? 80 : 50;
    return Array.from({ length: featherCount }, (_, index) => ({
      id: index,
      x: Math.random() * screenWidth, // Random horizontal position
      size: Math.random() * (maxSize - minSize) + minSize, // Random size between minSize-maxSize
      speed: Math.random() * 8000 + 4000, // Random speed between 4-12 seconds
      delay: Math.random() * 3000, // Random delay up to 3 seconds
      rotationSpeed: Math.random() * 3000 + 2000, // Random rotation speed
      swayAmount: Math.random() * 60 + 20, // Random sway amount
      featherType: ['feather1', 'feather2', 'feather3'][Math.floor(Math.random() * 3)] as 'feather1' | 'feather2' | 'feather3',
    }));
  }, [screenWidth, screenHeight, isTablet]);

  // Initialize animations
  useEffect(() => {
    featherAnimations.length = 0; // Clear existing animations
    rotationAnimations.length = 0; // Clear existing rotation animations
    swayAnimations.length = 0; // Clear existing sway animations
    
    feathers.forEach((feather) => {
      const fallAnim = new Animated.Value(0);
      const rotationAnim = new Animated.Value(0);
      const swayAnim = new Animated.Value(0);
      
      featherAnimations.push(fallAnim);
      rotationAnimations.push(rotationAnim);
      swayAnimations.push(swayAnim);

      const animateFeather = () => {
        // Falling animation - using native driver
        Animated.timing(fallAnim, {
          toValue: 1,
          duration: feather.speed,
          useNativeDriver: true,
          delay: feather.delay,
        }).start(() => {
          fallAnim.setValue(0);
          animateFeather(); // Restart animation
        });

        // Rotation animation - using native driver
        Animated.loop(
          Animated.timing(rotationAnim, {
            toValue: 1,
            duration: feather.rotationSpeed,
            useNativeDriver: true,
          })
        ).start();

        // Sway animation - using native driver
        Animated.loop(
          Animated.sequence([
            Animated.timing(swayAnim, {
              toValue: 1,
              duration: feather.rotationSpeed * 0.7,
              useNativeDriver: true,
            }),
            Animated.timing(swayAnim, {
              toValue: 0,
              duration: feather.rotationSpeed * 0.7,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };

      animateFeather();
    });
  }, [feathers, featherAnimations, rotationAnimations, swayAnimations]);

  const getFeatherImage = (featherType: string) => {
    switch (featherType) {
      case 'feather1':
        return require('../assets/images/level-backgrounds/feathers/1.png');
      case 'feather2':
        return require('../assets/images/level-backgrounds/feathers/2.png');
      case 'feather3':
        return require('../assets/images/level-backgrounds/feathers/3.png');
      default:
        return require('../assets/images/level-backgrounds/feathers/1.png');
    }
  };

  const renderFeather = (feather: Feather, index: number) => {
    const fallAnim = featherAnimations[index];
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
      outputRange: [-feather.swayAmount, feather.swayAmount],
    });

    // Rotation animation
    const rotate = rotationAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <Animated.View
        key={feather.id}
        style={[
          styles.featherContainer,
          {
            left: feather.x,
            transform: [
              { translateY },
              { translateX },
              { rotate },
            ],
          },
        ]}
      >
        <Image
          source={getFeatherImage(feather.featherType)}
          style={[
            styles.feather,
            {
              width: feather.size,
              height: feather.size,
            },
          ]}
          resizeMode="contain"
        />
      </Animated.View>
    );
  };

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {feathers.map((feather, index) => renderFeather(feather, index))}
    </View>
  );
};

const styles = StyleSheet.create({
  featherContainer: {
    position: 'absolute',
  },
  feather: {
    opacity: 0.8,
  },
});

export default AnimatedFeathers;

