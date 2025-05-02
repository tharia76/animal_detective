import React from 'react';
import { View, TouchableOpacity, Image, Text, ScrollView } from 'react-native';
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
};

/**
 * Custom grid/row renderer for level tiles.
 * Avoids FlatList to prevent nested VirtualizedList warning when used inside ScrollView.
 */
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
}: LevelTilesProps) {
  // In landscape, always horizontal, all tiles in one row
  // In portrait, grid with numColumns columns
  const isHorizontal = isLandscape ? true : !!horizontal;
  const columns = isLandscape ? 1 : numColumns;

  // Helper to chunk array into rows
  function chunk<T>(arr: T[], size: number): T[][] {
    const res: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      res.push(arr.slice(i, i + size));
    }
    return res;
  }

  if (isHorizontal) {
    // Render all tiles in a single row (landscape)
    // Use ScrollView with horizontal, bounces={false}, and alwaysBounceHorizontal={false}
    return (
      <ScrollView
        horizontal
        bounces={false}
        alwaysBounceHorizontal={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexDirection: 'row', flexWrap: 'nowrap' }}
      >
        {levels.map((level) => {
          const isLocked = level !== 'farm' && level !== 'forest' && level !== 'ocean' && level !== 'desert' && level !== 'arctic' && level !== 'insects' && level !== 'savannah' && level !== 'jungle' && level !== 'birds';
          return (
            <TouchableOpacity
              key={level}
              onPress={() => handleLevelSelect(level, isLocked)}
              style={{
                width: itemSize,
                height: itemSize,
                margin,
                borderRadius: 15,
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
                  borderRadius: 15,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
                resizeMode="cover"
              />
              {isLocked && (
                <View style={styles.lockOverlay}>
                  <Ionicons name="lock-closed" size={24} color="white" />
                </View>
              )}
              {/* Label fixed to the bottom of the tile */}
              <View
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  paddingVertical: 6,
                  paddingHorizontal: 8,
                  backgroundColor: getLevelBackgroundColor(level),
                  borderBottomLeftRadius: 15,
                  borderBottomRightRadius: 15,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: isLandscape ? 14 : 16,
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  {t(level)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  } else {
    // Portrait: render as grid
    const rows = chunk(levels, columns);
    return (
      <View>
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
              const isLocked = false;
              return (
                <TouchableOpacity
                  key={level}
                  onPress={() => handleLevelSelect(level, isLocked)}
                  style={{
                    width: itemSize,
                    height: itemSize,
                    marginRight: colIdx < columns - 1 ? margin : 0,
                    borderRadius: 15,
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
                      borderRadius: 15,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                    }}
                    resizeMode="cover"
                  />
                  {isLocked && (
                    <View style={styles.lockOverlay}>
                      <Ionicons name="lock-closed" size={24} color="white" />
                    </View>
                  )}
                  {/* Label fixed to the bottom of the tile */}
                  <View
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: 0,
                      paddingVertical: 6,
                      paddingHorizontal: 8,
                      backgroundColor: getLevelBackgroundColor(level),
                      borderBottomLeftRadius: 15,
                      borderBottomRightRadius: 15,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: isLandscape ? 14 : 16,
                        fontWeight: 'bold',
                        color: 'white',
                      }}
                    >
                      {t(level)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  }
}
