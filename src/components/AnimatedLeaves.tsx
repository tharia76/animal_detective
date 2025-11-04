import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, useWindowDimensions, Image } from 'react-native';

interface Leaf {
  id: number;
  x: number;
  size: number;
  speed: number;
  delay: number;
  rotationSpeed: number;
  swayAmount: number;
  leafType: 'leaf1' | 'leaf2' | 'leaf3';
}

const AnimatedLeaves: React.FC = () => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const leafAnimations = useRef<Animated.Value[]>([]).current;
  const rotationAnimations = useRef<Animated.Value[]>([]).current;
  const swayAnimations = useRef<Animated.Value[]>([]).current;

  // Detect if device is tablet/iPad
  const isTablet = Math.min(screenWidth, screenHeight) >= 768;

  // Create leaves with different properties
  const leaves: Leaf[] = React.useMemo(() => {
    const leafCount = 15; // Number of falling leaves
    // Bigger sizes on iPads: 40-80 pixels vs 20-50 on phones
    const minSize = isTablet ? 40 : 20;
    const maxSize = isTablet ? 80 : 50;
    return Array.from({ length: leafCount }, (_, index) => ({
      id: index,
      x: Math.random() * screenWidth, // Random horizontal position
      size: Math.random() * (maxSize - minSize) + minSize, // Random size between minSize-maxSize
      speed: Math.random() * 8000 + 4000, // Random speed between 4-12 seconds
      delay: Math.random() * 3000, // Random delay up to 3 seconds
      rotationSpeed: Math.random() * 3000 + 2000, // Random rotation speed
      swayAmount: Math.random() * 60 + 20, // Random sway amount
      leafType: ['leaf1', 'leaf2', 'leaf3'][Math.floor(Math.random() * 3)] as 'leaf1' | 'leaf2' | 'leaf3',
    }));
  }, [screenWidth, screenHeight, isTablet]);

  // Initialize animations
  useEffect(() => {
    leafAnimations.length = 0; // Clear existing animations
    rotationAnimations.length = 0; // Clear existing rotation animations
    swayAnimations.length = 0; // Clear existing sway animations
    
    leaves.forEach((leaf) => {
      const fallAnim = new Animated.Value(0);
      const rotationAnim = new Animated.Value(0);
      const swayAnim = new Animated.Value(0);
      
      leafAnimations.push(fallAnim);
      rotationAnimations.push(rotationAnim);
      swayAnimations.push(swayAnim);

      const animateLeaf = () => {
        // Falling animation - using native driver
        Animated.timing(fallAnim, {
          toValue: 1,
          duration: leaf.speed,
          useNativeDriver: true,
          delay: leaf.delay,
        }).start(() => {
          fallAnim.setValue(0);
          animateLeaf(); // Restart animation
        });

        // Rotation animation - using native driver
        Animated.loop(
          Animated.timing(rotationAnim, {
            toValue: 1,
            duration: leaf.rotationSpeed,
            useNativeDriver: true,
          })
        ).start();

        // Sway animation - using native driver
        Animated.loop(
          Animated.sequence([
            Animated.timing(swayAnim, {
              toValue: 1,
              duration: leaf.rotationSpeed * 0.7,
              useNativeDriver: true,
            }),
            Animated.timing(swayAnim, {
              toValue: 0,
              duration: leaf.rotationSpeed * 0.7,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };

      animateLeaf();
    });
  }, [leaves, leafAnimations, rotationAnimations, swayAnimations]);

  const getLeafImage = (leafType: string) => {
    switch (leafType) {
      case 'leaf1':
        return require('../assets/images/level-backgrounds/leaves/leaf1.png');
      case 'leaf2':
        return require('../assets/images/level-backgrounds/leaves/leaf2.png');
      case 'leaf3':
        return require('../assets/images/level-backgrounds/leaves/leaf3.png');
      default:
        return require('../assets/images/level-backgrounds/leaves/leaf1.png');
    }
  };

  const renderLeaf = (leaf: Leaf, index: number) => {
    const fallAnim = leafAnimations[index];
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
      outputRange: [-leaf.swayAmount, leaf.swayAmount],
    });

    // Rotation animation
    const rotate = rotationAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <Animated.View
        key={leaf.id}
        style={[
          styles.leafContainer,
          {
            left: leaf.x,
            transform: [
              { translateY },
              { translateX },
              { rotate },
            ],
          },
        ]}
      >
        <Image
          source={getLeafImage(leaf.leafType)}
          style={[
            styles.leaf,
            {
              width: leaf.size,
              height: leaf.size,
            },
          ]}
          resizeMode="contain"
        />
      </Animated.View>
    );
  };

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {leaves.map((leaf, index) => renderLeaf(leaf, index))}
    </View>
  );
};

const styles = StyleSheet.create({
  leafContainer: {
    position: 'absolute',
  },
  leaf: {
    opacity: 0.8,
  },
});

export default AnimatedLeaves; 