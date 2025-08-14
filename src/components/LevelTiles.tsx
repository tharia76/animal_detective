import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Image, Text, ScrollView, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
// Animated Tile Component with Glowing Border
function AnimatedTile({ 
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
}: {
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
}) {
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

    // Add a slight delay for each tile to create a wave effect
    const delay = Math.random() * 1000;
    
    setTimeout(() => {
      Animated.loop(glowSequence).start();
      Animated.loop(pulseSequence).start();
    }, delay);
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

  // Debug logging
  console.log('AnimatedTile rendering:', { level, isLocked });

  return (
    <Animated.View
      style={{
        transform: [{ scale: pulseAnim }],
      }}
    >
      <Animated.View
                 style={{
           width: itemSize,
           height: itemSize,
           marginRight: colIdx < columns - 1 ? margin : 0,
          borderRadius: 25,
          borderWidth: 6,
           borderColor: animatedBorderColor,
           shadowColor: getShadowColor(level, isLocked),
           shadowOffset: { width: 0, height: 0 },
           shadowOpacity: animatedShadowOpacity,
           shadowRadius: 8,
           elevation: 10,
         }}
      >
        <TouchableOpacity
          onPress={() => handleLevelSelect(level, isLocked)}
                     style={{
             width: '100%',
             height: '100%',
             borderRadius: 22,
             overflow: 'hidden',
             backgroundColor: '#fff2',
           }}
          activeOpacity={0.7}
        >
          <Image
            source={LEVEL_BACKGROUNDS[level]}
                         style={{
               width: itemSize,
               height: itemSize,
               borderRadius: 22,
               position: 'absolute',
               top: 0,
               left: 0,
             }}
            resizeMode="cover"
          />
                               {isLocked && (
            <View style={[styles.lockOverlay, { borderRadius: 22 }]}>
              <Ionicons name="lock-closed" size={40} color="white" />
            </View>
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
                paddingVertical: 20,
                paddingHorizontal: 40,
                backgroundColor: getLevelBackgroundColor(level),
                borderRadius: 30,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  fontSize: isLandscape && itemSize >= 280 ? 28 : isLandscape ? 20 : 22, // Bigger font on tablet landscape (large tiles)
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                {t(level)}
              </Text>
              
              {/* Subtitle showing mission status */}
              {levelAnimalCount > 0 && (
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: isLandscape && itemSize >= 280 ? 16 : isLandscape ? 12 : 14,
                    fontWeight: '500',
                    color: 'rgba(255, 255, 255, 0.9)',
                    marginTop: 4,
                    textAlign: 'center',
                  }}
                >
                  {isCompleted ? t('missionComplete') : t('animalsToDiscover').replace('{count}', levelAnimalCount.toString())}
                </Text>
              )}
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
              height:36,
              borderRadius: 13,
              backgroundColor: 'rgba(255,255,255,0.4)'
            }}
          >
            <Animated.View
              style={{
                width: `${progress * 100}%`,
                height: '100%',
                borderRadius: 13,
                backgroundColor: 'rgba(226, 70, 43, 0.98)'
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
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: '700',
                  textShadowColor: 'rgba(0,0,0,0.4)',
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
}

export default function LevelTiles({
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
}: LevelTilesProps) {
  // In both portrait and landscape, use 3 columns per row
  const columns = 3;
  
  // Stabilize layout during rapid dimension changes
  const stableItemSize = useRef(itemSize);
  const stabilityTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Only update stable size if itemSize has been consistent for a short period
  useEffect(() => {
    if (stabilityTimer.current) {
      clearTimeout(stabilityTimer.current);
    }
    
    stabilityTimer.current = setTimeout(() => {
      stableItemSize.current = itemSize;
    }, 100);
    
    return () => {
      if (stabilityTimer.current) {
        clearTimeout(stabilityTimer.current);
      }
    };
  }, [itemSize]);

  // Helper to chunk array into rows
  function chunk<T>(arr: T[], size: number): T[][] {
    const res: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      res.push(arr.slice(i, i + size));
    }
    return res;
  }

  // Always render as grid, 3 in a row for both portrait and landscape
  const rows = chunk(levels, columns);

  // Use getIsLocked if provided, otherwise lock all except 'farm'
  const safeGetIsLocked = (level: string) => {
    console.log('LevelTiles safeGetIsLocked called for level:', level, 'getIsLocked type:', typeof getIsLocked);
    const result = typeof getIsLocked === 'function' ? getIsLocked(level) : level !== 'farm';
    console.log('safeGetIsLocked result for', level, ':', result);
    return result;
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
}
