import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, useWindowDimensions } from 'react-native';

interface Bubble {
  id: number;
  x: number;
  size: number;
  speed: number;
  delay: number;
}

const AnimatedBubbles: React.FC = () => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const bubbleAnimations = useRef<Animated.Value[]>([]).current;

  // Create bubbles with different properties
  const bubbles: Bubble[] = React.useMemo(() => {
    const bubbleCount = 15; // Number of bubbles
    return Array.from({ length: bubbleCount }, (_, index) => ({
      id: index,
      x: Math.random() * screenWidth, // Random horizontal position
      size: Math.random() * 20 + 10, // Random size between 10-30
      speed: Math.random() * 3000 + 2000, // Random speed between 2-5 seconds
      delay: Math.random() * 2000, // Random delay up to 2 seconds
    }));
  }, [screenWidth]);

  // Initialize animations
  useEffect(() => {
    bubbleAnimations.length = 0; // Clear existing animations
    
    bubbles.forEach((bubble) => {
      const animValue = new Animated.Value(0);
      bubbleAnimations.push(animValue);

      const animateBubble = () => {
        Animated.timing(animValue, {
          toValue: 1,
          duration: bubble.speed,
          useNativeDriver: true,
          delay: bubble.delay,
        }).start(() => {
          animValue.setValue(0);
          animateBubble(); // Restart animation
        });
      };

      animateBubble();
    });
  }, [bubbles, bubbleAnimations]);

  const renderBubble = (bubble: Bubble, index: number) => {
    const animValue = bubbleAnimations[index];
    if (!animValue) return null;

    return (
      <Animated.View
        key={bubble.id}
        style={[
          styles.bubble,
          {
            left: bubble.x,
            width: bubble.size,
            height: bubble.size,
            borderRadius: bubble.size / 2,
            transform: [
              {
                translateY: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [screenHeight + bubble.size, -bubble.size],
                }),
              },
              {
                scale: animValue.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.3, 1, 0.8],
                }),
              },
            ],
            opacity: animValue.interpolate({
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
      {bubbles.map((bubble, index) => renderBubble(bubble, index))}
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default AnimatedBubbles; 