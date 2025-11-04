import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, useWindowDimensions } from 'react-native';

interface LightningBoltData {
  id: number;
  x: number;
  paths: { x: number; y: number }[];
  delay: number;
}

const AnimatedThunder: React.FC = () => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const flashAnim = useRef(new Animated.Value(0)).current;
  const [lightningBolts, setLightningBolts] = useState<LightningBoltData[]>([]);
  const animationRefs = useRef<Map<number, Animated.Value>>(new Map());

  // Create lightning bolt paths in Z shape at top of screen
  const createLightningBolt = (startX: number): LightningBoltData => {
    const paths: { x: number; y: number }[] = [];
    const topSectionHeight = screenHeight * 0.3; // Top 30% of screen
    const segmentCount = 4; // Z shape needs 4 points: top-left, top-right, bottom-left, bottom-right
    
    // Start at top-left
    let currentX = startX;
    let currentY = 0;
    paths.push({ x: currentX, y: currentY });
    
    // Move right across top
    currentX = startX + 150 + Math.random() * 100;
    currentY = 0;
    paths.push({ x: currentX, y: currentY });
    
    // Diagonal down-left (creating the Z shape)
    currentX = startX - 50 + Math.random() * 50;
    currentY = topSectionHeight * 0.5 + Math.random() * 30;
    paths.push({ x: currentX, y: currentY });
    
    // End at bottom-right of top section
    currentX = startX + 100 + Math.random() * 100;
    currentY = topSectionHeight;
    paths.push({ x: currentX, y: currentY });
    
    return {
      id: Math.random(),
      x: startX,
      paths,
      delay: Math.random() * 200,
    };
  };

  // Thunder flash and lightning animation
  useEffect(() => {
    const animateThunder = () => {
      // Calculate random delay between flashes (3-8 seconds)
      const delay = Math.random() * 5000 + 3000;
      
      setTimeout(() => {
        // Create new lightning bolts
        const boltCount = 1 + Math.floor(Math.random() * 2); // 1-2 bolts
        const newBolts: LightningBoltData[] = [];
        
        for (let i = 0; i < boltCount; i++) {
          const startX = Math.random() * screenWidth;
          const bolt = createLightningBolt(startX);
          const boltAnim = new Animated.Value(0);
          
          newBolts.push(bolt);
          animationRefs.current.set(bolt.id, boltAnim);
          
          // Animate lightning bolt appearance
          Animated.sequence([
            Animated.timing(boltAnim, {
              toValue: 1,
              duration: 80,
              useNativeDriver: true,
            }),
            Animated.timing(boltAnim, {
              toValue: 0,
              duration: 120,
              useNativeDriver: true,
            }),
          ]).start(() => {
            // Remove bolt and animation after animation
            animationRefs.current.delete(bolt.id);
            setLightningBolts((prev) => prev.filter((b) => b.id !== bolt.id));
          });
        }
        
        // Update state with new bolts
        setLightningBolts(newBolts);

        // Quick flash sequence: flash on, then off quickly
        // Removed flash overlay - only showing lightning bolts
        Animated.sequence([
          // Minimal delay to sync with lightning
          Animated.timing(flashAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Clear lightning bolts and animations after animation completes
          animationRefs.current.clear();
          setLightningBolts([]);
          // Restart the cycle
          animateThunder();
        });
      }, delay);
    };

    animateThunder();
  }, [flashAnim, screenWidth, screenHeight]);

  const renderLightningBolt = (bolt: LightningBoltData, index: number) => {
    const boltAnim = animationRefs.current.get(bolt.id);
    if (!boltAnim) return null;

    const opacity = boltAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 1, 0.8],
    });

    // Create path string for SVG-like rendering using lines
    const pathElements = [];
    for (let i = 0; i < bolt.paths.length - 1; i++) {
      const start = bolt.paths[i];
      const end = bolt.paths[i + 1];
      
      pathElements.push(
        <View
          key={i}
          style={{
            position: 'absolute',
            left: start.x,
            top: start.y,
            width: Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)),
            height: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            transform: [
              {
                rotate: `${Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI)}deg`,
              },
            ],
            opacity,
            shadowColor: 'rgba(173, 216, 230, 0.8)',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 8,
            elevation: 10,
          }}
        />
      );
    }

    return (
      <Animated.View
        key={bolt.id}
        style={[
          styles.lightningContainer,
          {
            opacity,
          },
        ]}
      >
        {pathElements}
      </Animated.View>
    );
  };

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {/* Lightning bolts only - no flash overlay */}
      {lightningBolts.map((bolt, index) => renderLightningBolt(bolt, index))}
    </View>
  );
};

const styles = StyleSheet.create({
  thunderFlash: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Bright white flash
    top: 0,
    left: 0,
  },
  lightningContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

export default AnimatedThunder;


