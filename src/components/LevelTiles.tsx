import React from 'react';
import { FlatList, TouchableOpacity, Image, View, Text } from 'react-native';
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
};

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
}: LevelTilesProps) {
  return (
    <FlatList
      data={levels}
      numColumns={numColumns}
      renderItem={({ item: level }) => {
        const isLocked = level !== 'farm' && level !== 'forest';
        return (
          <TouchableOpacity
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
      }}
      keyExtractor={l => l}
    />
  );
}
