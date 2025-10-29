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

  // Create feathers with different properties
  const feathers: Feather[] = React.useMemo(() => {
    const featherCount = 20; // Number of falling feathers (more than leaves for birds)
    return Array.from({ length: featherCount }, (_, index) => ({
      id: index,
      x: Math.random() * screenWidth, // Random horizontal position
      size: Math.random() * 35 + 25, // Random size between 25-60 (slightly larger than leaves)
      speed: Math.random() * 10000 + 5000, // Random speed between 5-15 seconds (slower, feathers are lighter)
      delay: Math.random() * 4000, // Random delay up to 4 seconds
      rotationSpeed: Math.random() * 4000 + 2500, // Random rotation speed (slower rotation)
      swayAmount: Math.random() * 80 + 30, // Random sway amount (more sway than leaves)
      featherType: ['feather1', 'feather2', 'feather3'][Math.floor(Math.random() * 3)] as 'feather1' | 'feather2' | 'feather3',
    }));
  }, [screenWidth, screenHeight]);

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

        // Sway animation - using native driver (more gentle sway for feathers)
        Animated.loop(
          Animated.sequence([
            Animated.timing(swayAnim, {
              toValue: 1,
              duration: feather.rotationSpeed * 0.8,
              useNativeDriver: true,
            }),
            Animated.timing(swayAnim, {
              toValue: 0,
              duration: feather.rotationSpeed * 0.8,
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

    // Sway animation - more gentle swaying for feathers
    const translateX = swayAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-feather.swayAmount, feather.swayAmount],
    });

    // Rotation animation - gentle rotation for floating effect
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
    opacity: 0.85, // Slightly more opaque than leaves
  },
});

export default AnimatedFeathers;

