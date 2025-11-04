import React, { useEffect, useRef, useMemo, useState } from 'react';
import { View, TouchableOpacity, Image, Text, ScrollView, Animated, Easing, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type LevelTilesProps = {
  levels: string[];
  numColumns: number;
  isLandscape: boolean;
  itemSize: number;
  margin: number;
  LEVEL_BACKGROUNDS: Record<string, any>;
  handleLevelSelect: (level: string, isLocked: boolean) => void;
  styles: any;
  getLevelBackgroundColor: (level: string) => string;
  t: (key: string) => string;
  ListHeaderComponent?: React.ReactNode;
  ListFooterComponent?: React.ReactNode;
  horizontal?: boolean;
  getIsLocked?: (level: string) => boolean; // Make optional
  isLevelCompleted?: (level: string) => boolean; // Add completion check function
  onToggleCompletion?: (level: string, isCompleted: boolean) => void; // Add toggle function
  animals?: any[]; // Add animals array to count animals per level
  visitedCounts?: Record<string, number>; // Per-level visited counts
};

/**
 * Custom grid/row renderer for level tiles.
 * Avoids FlatList to prevent nested VirtualizedList warning when used inside ScrollView.
 */

interface AnimatedTileProps {
  level: string;
  itemSize: number;
  margin: number;
  colIdx: number;
  columns: number;
  isLocked: boolean;
  LEVEL_BACKGROUNDS: Record<string, any>;
  styles: any;
  getLevelBackgroundColor: (level: string) => string;
  isLandscape: boolean;
  t: (key: string) => string;
  handleLevelSelect: (level: string, isLocked: boolean) => void;
  isCompleted?: boolean;
  onToggleCompletion?: (level: string, isCompleted: boolean) => void;
  animals?: any[];
  visitedCount?: number;
}

// Animated Tile Component with Glowing Border - Memoized to prevent re-renders
const AnimatedTile = React.memo(({ 
  level, 
  itemSize, 
  margin, 
  colIdx, 
  columns, 
  isLocked, 
  LEVEL_BACKGROUNDS, 
  styles, 
  getLevelBackgroundColor, 
  isLandscape, 
  t, 
  handleLevelSelect,
  isCompleted,
  onToggleCompletion,
  animals,
  visitedCount
}: AnimatedTileProps) => {
  const [glowAnim] = useState(() => new Animated.Value(0));
  const [pulseAnim] = useState(() => new Animated.Value(1));
  const [pressAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    // Create a smooth, continuous glow animation with easing
    const glowSequence = Animated.sequence([
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: false,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 3000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: false,
      }),
    ]);

    // Create a very subtle, smooth pulse animation
    const pulseSequence = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.015,
        duration: 2500,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 2500,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    // Start animations immediately for faster loading
    Animated.loop(glowSequence).start();
    Animated.loop(pulseSequence).start();
  }, [glowAnim, pulseAnim]);

  // Get level-specific glow colors
  const getLevelGlowColors = (level: string, isLocked: boolean) => {
    if (isLocked) {
      return ['rgba(255, 100, 100, 0.3)', 'rgba(255, 100, 100, 0.8)']; // Red for locked
    }
    
    switch (level) {
      case 'farm': return ['rgba(213, 159, 73, 0.3)', 'rgba(213, 159, 73, 0.8)'];
      case 'forest': return ['rgba(50, 205, 50, 0.3)', 'rgba(50, 205, 50, 0.8)'];
      case 'ocean': return ['rgba(30, 191, 255, 0.3)', 'rgba(30, 191, 255, 0.8)'];
      case 'desert': return ['rgba(255, 165, 40, 0.3)', 'rgba(255, 165, 40, 0.8)'];
      case 'arctic': return ['rgba(180, 220, 255, 0.3)', 'rgba(180, 220, 255, 0.8)'];
      case 'insects': return ['rgba(120, 180, 50, 0.3)', 'rgba(120, 180, 50, 0.8)'];
      case 'savannah': return ['rgba(220, 200, 60, 0.3)', 'rgba(220, 200, 60, 0.8)'];
      case 'jungle': return ['rgba(40, 150, 40, 0.3)', 'rgba(40, 150, 40, 0.8)'];
      case 'birds': return ['rgba(255, 140, 255, 0.3)', 'rgba(255, 140, 255, 0.8)'];
      default: return ['rgba(200, 200, 200, 0.3)', 'rgba(200, 200, 200, 0.8)'];
    }
  };

  const [dimColor, brightColor] = getLevelGlowColors(level, isLocked);
  
  const animatedBorderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [dimColor, brightColor],
  });

  const animatedShadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.5],
  });

  // Get level-specific shadow color
  const getShadowColor = (level: string, isLocked: boolean) => {
    if (isLocked) return '#ff6464'; // Red for locked
    
    switch (level) {
      case 'farm': return '#d59f49';
      case 'forest': return '#32cd32';
      case 'ocean': return '#1ebfff';
      case 'desert': return '#ffa528';
      case 'arctic': return '#b4dcff';
      case 'insects': return '#78b432';
      case 'savannah': return '#dcc83c';
      case 'jungle': return '#289628';
      case 'birds': return '#ff8cff';
      default: return '#c8c8c8';
    }
  };

  // Calculate animal count for this level
  const levelAnimalCount = animals ? animals.filter((animal: any) => 
    animal.animalType.toLowerCase() === level.toLowerCase()
  ).length : 0;

  const visited = Math.max(0, Math.min(visitedCount ?? 0, levelAnimalCount));
  const progress = levelAnimalCount > 0 ? visited / levelAnimalCount : 0;

  // Get level-specific text color
  const getLevelTextColor = (level: string) => {
    switch (level) {
      case 'farm': return '#8B4513'; // Saddle brown
      case 'forest': return '#228B22'; // Forest green
      case 'ocean': return '#0066CC'; // Ocean blue
      case 'desert': return '#D2691E'; // Chocolate/desert orange
      case 'arctic': return '#4169E1'; // Royal blue
      case 'insects': return '#556B2F'; // Dark olive green
      case 'savannah': return '#DAA520'; // Goldenrod
      case 'jungle': return '#006400'; // Dark green
      case 'birds': return '#9932CC'; // Dark orchid/purple
      default: return '#333333';
    }
  };



  return (
    <Animated.View
      style={{
        transform: [{ scale: Animated.multiply(pulseAnim, pressAnim) }],
      }}
    >
      <Animated.View
                 style={{
           width: itemSize,
           height: itemSize,
           marginRight: colIdx < columns - 1 ? margin : 0,
          borderRadius: 28,
          borderWidth: 4,
           borderColor: 'rgba(255, 255, 255, 0.8)', // Bright frosted white border
           shadowColor: getShadowColor(level, isLocked),
           shadowOffset: { width: 0, height: 10 },
           shadowOpacity: 0.5,
           shadowRadius: 20,
           elevation: 15,
           backgroundColor: 'rgba(255, 255, 255, 0.2)', // Subtle white background for glassy effect
         }}
      >
        <TouchableOpacity
          onPress={() => handleLevelSelect(level, isLocked)}
          onPressIn={() => {
            // Disable press animation to prevent visual flicker
            // Animated.timing(pressAnim, { toValue: 0.98, duration: 90, useNativeDriver: true }).start();
          }}
          onPressOut={() => {
            // Disabled
            // Animated.timing(pressAnim, { toValue: 1, duration: 120, useNativeDriver: true }).start();
          }}
                     style={{
             width: '100%',
             height: '100%',
             borderRadius: 24,
             overflow: 'hidden',
             backgroundColor: getLevelBackgroundColor(level), // Use level color as placeholder
           }}
          activeOpacity={1}
        >
          <Image
            source={LEVEL_BACKGROUNDS[level]}
            style={{
               width: itemSize,
               height: itemSize,
               borderRadius: 24,
               position: 'absolute',
               top: 0,
               left: 0,
               backgroundColor: getLevelBackgroundColor(level), // Fallback color
               opacity: 1.0, // Full opacity for vibrant colors
             }}
            resizeMode="cover"
            fadeDuration={0} // No fade for instant display
            defaultSource={LEVEL_BACKGROUNDS[level]} // Preload image
          />
          {/* Subtle glassy overlay for depth without dulling colors */}
          <LinearGradient
            colors={[ 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)', 'rgba(255,255,255,0.08)' ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />
                               {isLocked && (
            <View style={[styles.lockOverlay, { borderRadius: 24 }] }>
              <View style={{ marginBottom: 100 }}>
                <Ionicons name="lock-closed" size={40} color="white" />
              </View>
            </View>
          )}
          
          {/* Level-specific images in top left corner */}
          {level === 'farm' && (
            <Image
              source={require('../assets/images/cow_level.png')}
              style={{
                position: 'absolute',
                top: -10,
                left: -10,
                width: itemSize * 0.5,
                height: itemSize * 0.5,
                zIndex: 5,
                transform: [{ rotate: '-15deg' }],
              }}
              resizeMode="contain"
            />
          )}
          {level === 'forest' && (
            <Image
              source={require('../assets/images/forest_level.png')}
              style={{
                position: 'absolute',
                top: -10,
                left: -10,
                width: itemSize * 0.5,
                height: itemSize * 0.5,
                zIndex: 5,
                transform: [{ rotate: '-15deg' }],
              }}
              resizeMode="contain"
            />
          )}
          {level === 'ocean' && (
            <Image
              source={require('../assets/images/ocean_level.png')}
              style={{
                position: 'absolute',
                top: -10,
                left: -10,
                width: itemSize * 0.5,
                height: itemSize * 0.5,
                zIndex: 5,
                transform: [{ rotate: '-15deg' }],
              }}
              resizeMode="contain"
            />
          )}
          {level === 'desert' && (
            <Image
              source={require('../assets/images/desert_level.png')}
              style={{
                position: 'absolute',
                top: -10,
                left: -10,
                width: itemSize * 0.5,
                height: itemSize * 0.5,
                zIndex: 5,
                transform: [{ rotate: '-15deg' }],
              }}
              resizeMode="contain"
            />
          )}
          {level === 'arctic' && (
            <Image
              source={require('../assets/images/arctic_level.png')}
              style={{
                position: 'absolute',
                top: -10,
                left: -10,
                width: itemSize * 0.5,
                height: itemSize * 0.5,
                zIndex: 5,
                transform: [{ rotate: '-15deg' }],
              }}
              resizeMode="contain"
            />
          )}
          {level === 'insects' && (
            <Image
              source={require('../assets/images/insect_level.png')}
              style={{
                position: 'absolute',
                top: -10,
                left: -10,
                width: itemSize * 0.5,
                height: itemSize * 0.5,
                zIndex: 5,
                transform: [{ rotate: '-15deg' }],
              }}
              resizeMode="contain"
            />
          )}
          {level === 'savannah' && (
            <Image
              source={require('../assets/images/savannah_level.png')}
              style={{
                position: 'absolute',
                top: -10,
                left: -10,
                width: itemSize * 0.5,
                height: itemSize * 0.5,
                zIndex: 5,
                transform: [{ rotate: '-15deg' }],
              }}
              resizeMode="contain"
            />
          )}
          {level === 'jungle' && (
            <Image
              source={require('../assets/images/jungle_level.png')}
              style={{
                position: 'absolute',
                top: -10,
                left: -10,
                width: itemSize * 0.5,
                height: itemSize * 0.5,
                zIndex: 5,
                transform: [{ rotate: '-15deg' }],
              }}
              resizeMode="contain"
            />
          )}
          {level === 'birds' && (
            <Image
              source={require('../assets/images/bird_level.png')}
              style={{
                position: 'absolute',
                top: -10,
                left: -10,
                width: itemSize * 0.5,
                height: itemSize * 0.5,
                zIndex: 5,
                transform: [{ rotate: '-15deg' }],
              }}
              resizeMode="contain"
            />
          )}
          
          {/* Completion Checkmark - top right corner */}
          {isCompleted && (
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 32,
                height: 32,
                backgroundColor: 'rgba(34, 197, 94, 0.9)', // Green background
                borderRadius: 16,
                borderWidth: 2,
                borderColor: 'white',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 5,
              }}
              onPress={() => {
                if (onToggleCompletion) {
                  onToggleCompletion(level, false); // Toggle to incomplete
                }
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark" size={20} color="white" />
            </TouchableOpacity>
          )}
          {/* Label in the center of the tile with pill background */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                paddingVertical: 14,
                paddingHorizontal: 28,
                backgroundColor: 'rgba(255, 255, 255, 0.85)', // More opaque for better text readability
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
                borderWidth: 2,
                borderColor: 'rgba(255, 255, 255, 0.95)', // Brighter frosted border
              }}
            >
              <Text
                allowFontScaling={false}
                style={{
                  fontSize: isLandscape && itemSize >= 280 ? 30 : isLandscape ? 22 : 24, // Increased font sizes
                  fontWeight: 'bold',
                  fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
                  color: getLevelTextColor(level), // Unique color for each level
                  textAlign: 'center',
                  width: Math.floor(itemSize * 0.8),
                  textRendering: 'optimizeLegibility' as any,
                  textShadowColor: 'rgba(255,255,255,0.8)',
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 3,
                }}
              >
                {t(level)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Bottom progress bar */}
        {levelAnimalCount > 0 && (
          <View
            style={{
              position: 'absolute',
              left: 8,
              right: 8,
              bottom: 6,
              height:30,
              borderRadius: 15,
              backgroundColor: 'rgba(255,255,255,0.9)', // Bright white glassy background
              borderWidth: 2,
              borderColor: 'rgba(255, 255, 255, 1)', // Solid white frosted border
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Animated.View
              style={{
                width: `${progress * 100}%`,
                height: '100%',
                borderRadius: 15,
                backgroundColor: '#4CAF50' // Vibrant green progress indicator
              }}
            />
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color: '#1a1a1a',
                  fontSize: 12,
                  fontWeight: 'bold',
                  textShadowColor: 'rgba(255,255,255,0.8)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                {visited}/{levelAnimalCount}
              </Text>
            </View>
          </View>
        )}

        {/* Progress text moved inside the progress bar */}
      </Animated.View>
    </Animated.View>
  );
});

AnimatedTile.displayName = 'AnimatedTile';

const LevelTiles = React.memo(({
  levels,
  numColumns,
  isLandscape,
  itemSize,
  margin,
  LEVEL_BACKGROUNDS,
  handleLevelSelect,
  styles,
  getLevelBackgroundColor,
  t,
  horizontal,
  getIsLocked,
  isLevelCompleted,
  onToggleCompletion,
  animals,
  visitedCounts,
}: LevelTilesProps) => {
  // In both portrait and landscape, use 3 columns per row
  const columns = 3;
  
  // Use item size immediately for instant rendering
  const stableItemSize = useRef(itemSize);
  
  // Update stable size immediately
  useEffect(() => {
    stableItemSize.current = itemSize;
  }, [itemSize]);

  // Helper to chunk array into rows (memoized)
  const rows = useMemo(() => {
    const chunk = <T,>(arr: T[], size: number): T[][] => {
      const res: T[][] = [];
      for (let i = 0; i < arr.length; i += size) {
        res.push(arr.slice(i, i + size));
      }
      return res;
    };
    return chunk(levels, columns);
  }, [levels, columns]);

  // Use getIsLocked if provided, otherwise lock all except 'farm' (optimized - no console logs)
  const safeGetIsLocked = (level: string) => {
    return typeof getIsLocked === 'function' ? getIsLocked(level) : level !== 'farm';
  };

  return (
    <ScrollView
      horizontal={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexDirection: 'column', flexGrow: 1 }}
    >
      {rows.map((row, rowIdx) => (
        <View
          key={rowIdx}
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            marginBottom: margin,
          }}
        >
          {row.map((level, colIdx) => {
            const isLocked = safeGetIsLocked(level);
            const isCompleted = isLevelCompleted ? isLevelCompleted(level) : false;
            const visitedCount = visitedCounts ? visitedCounts[level] ?? 0 : 0;
            return (
              <AnimatedTile
                key={level}
                level={level}
                itemSize={stableItemSize.current}
                margin={margin}
                colIdx={colIdx}
                columns={columns}
                isLocked={isLocked}
                LEVEL_BACKGROUNDS={LEVEL_BACKGROUNDS}
                styles={styles}
                getLevelBackgroundColor={getLevelBackgroundColor}
                isLandscape={isLandscape}
                t={t}
                handleLevelSelect={handleLevelSelect}
                isCompleted={isCompleted}
                onToggleCompletion={onToggleCompletion}
                animals={animals}
                visitedCount={visitedCount}
              />
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
});

LevelTiles.displayName = 'LevelTiles';

export default LevelTiles;
