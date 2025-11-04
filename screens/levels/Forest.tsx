import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Asset } from 'expo-asset';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAnimals } from '../../src/data/animals';
import { AnimalType } from '../../src/data/AnimalType';
import LevelScreenTemplate from '../../src/components/LevelScreenTemplate';
import { useLocalization } from '../../src/hooks/useLocalization';

type ForestScreenProps = {
    onBackToMenu: () => void;
    backgroundImageUri: string | null;
    skyBackgroundImageUri: string | null;
};

export default function ForestScreen({ onBackToMenu, backgroundImageUri, skyBackgroundImageUri }: ForestScreenProps) {
  const { lang } = useLocalization();
  const [isReady, setIsReady] = useState(false);
  
  const FOREST_BG = require('../../src/assets/images/level-backgrounds/forest.png');
  const bgUri = Asset.fromModule(FOREST_BG).uri || Asset.fromModule(FOREST_BG).localUri;
  const forestAnimals = getAnimals(lang).filter((animal: AnimalType) => animal.animalType === 'Forest');
  const [initialIndex, setInitialIndex] = useState<number>(0);

  useEffect(() => {
    const init = async () => {
      try {
        // Load saved progress quickly
        const saved = await AsyncStorage.getItem('animalProgress_forest');
        let indexToShow = 0;
        
        if (saved) {
          const arr = JSON.parse(saved);
          if (Array.isArray(arr) && arr.length > 0) {
            const visitedSet = new Set<number>(arr);
            if (forestAnimals.length > 0) {
              if (visitedSet.size < forestAnimals.length) {
                for (let i = 0; i < forestAnimals.length; i++) {
                  if (!visitedSet.has(i)) { 
                    indexToShow = i; 
                    break; 
                  }
                }
              } else {
                const indexKey = 'animalCurrentIndex_forest';
                const savedIndexStr = await AsyncStorage.getItem(indexKey);
                const parsed = parseInt(savedIndexStr ?? '', 10);
                if (!isNaN(parsed) && parsed >= 0 && parsed < forestAnimals.length) {
                  indexToShow = parsed;
                }
              }
            }
          }
        }
        setInitialIndex(indexToShow);
        
        // Brief delay for loading screen
        setTimeout(() => {
          setIsReady(true);
        }, 200);
      } catch (error) {
        console.error('Error loading Forest progress:', error);
        setIsReady(true);
      }
    };

    init();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#2d5a3d', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#228B22" />
      </View>
    );
  }

  // Gather all assets to preload including animal sprites, sounds, UI images, leaves, etc.
  const forestAssets = useMemo(() => {
    return getLevelAssets('Forest', forestAnimals);
  }, [forestAnimals]);

  return (
    <LevelScreenTemplate
      levelName="Forest"
      animals={forestAnimals}
      onBackToMenu={onBackToMenu}
      backgroundImageUri={bgUri}
      skyBackgroundImageUri={skyBackgroundImageUri}
      initialIndex={initialIndex}
    />
  );
}
