// EndlessRoad.tsx
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';

const { width } = Dimensions.get('window');
const ROAD_HEIGHT    = 60;
const LOOP_DURATION  = 300;    // Reduced from 1200 to make animation faster
const STRIPE_SPACING = 80;    // we'll still use this to calculate pattern width
const TUFT_COUNT     = 12;

// how many tuft positions we need to cover the screen + a bit extra
const tuftSpacing   = width / TUFT_COUNT;
const patternWidth  = width + tuftSpacing; // one "pattern" width

export default function EndlessRoad() {
  const animX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // start with the tufts offset one pattern to the left
    animX.setValue(-patternWidth);

    // animate them back to 0, looped
    Animated.loop(
      Animated.timing(animX, {
        toValue: 0,
        duration: LOOP_DURATION * (patternWidth / tuftSpacing),
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [animX]);

  return (
    <View style={styles.container}>
      {/* Grass background */}
      <View style={styles.grass} />

      {/* Road base */}
      <View style={styles.roadContainer}>
        <View style={styles.roadSurface} />

        {/* Moving grass tufts (wrap in Animated.View to scroll) */}
        <Animated.View
          style={[
            styles.tuftsContainer,
            {
              width: patternWidth * 2,        // two patterns side-by-side
              transform: [{ translateX: animX }],
            }
          ]}
        >
          {Array.from({ length: TUFT_COUNT * 2 }).map((_, i) => (
            <View
              key={`tuft-${i}`}
              style={[
                styles.tuft,
                { left: i * tuftSpacing }
              ]}
            />
          ))}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: ROAD_HEIGHT + 40,
    overflow: 'hidden',
    marginTop: 20,
  },
  grass: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#7CCD5F',
  },
  roadContainer: {
    position: 'absolute',
    width: '100%',
    height: ROAD_HEIGHT,
    top: 20,
  },
  roadSurface: {
    position: 'absolute',
    width: '100%',
    height: ROAD_HEIGHT,
    backgroundColor: '#A67C52',
  },
  tuftsContainer: {
    position: 'absolute',
    height: ROAD_HEIGHT,
  },
  tuft: {
    position: 'absolute',
    width: 8,
    height: 15,
    backgroundColor: '#6DB354',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    top: 0,
  },
});
