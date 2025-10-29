import React, { useEffect, useState, useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Asset } from 'expo-asset';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAnimals } from '../../src/data/animals';
import { AnimalType } from '../../src/data/AnimalType';
import LevelScreenTemplate from '../../src/components/LevelScreenTemplate';
import { useLocalization } from '../../src/hooks/useLocalization';
import ScreenLoadingWrapper from '../../src/components/ScreenLoadingWrapper';
import { getLevelAssets } from '../../src/utils/getLevelAssets';

// Define Props for the screen
type ForestScreenProps = {
    onBackToMenu: () => void;
    backgroundImageUri: string | null; // Accept URI prop
    skyBackgroundImageUri: string | null;
    
};

export default function ForestScreen({ onBackToMenu, backgroundImageUri, skyBackgroundImageUri }: ForestScreenProps) {
  const { lang, t } = useLocalization();
  
  // Load the forest background image
  const FOREST_BG = require('../../src/assets/images/level-backgrounds/forest.webp');
  const [bgUri, setBgUri] = useState<string | null>(null);
  
  const forestAnimals = getAnimals(lang).filter((animal: AnimalType) => animal.animalType === 'Forest');
  const [initialIndex, setInitialIndex] = useState<number | undefined>(undefined);

  useEffect(() => {
    const load = async () => {
      // Load the background image immediately
      const bgAsset = Asset.fromModule(FOREST_BG);
      setBgUri(bgAsset.uri);
      
      // Optional: download for caching
      bgAsset.downloadAsync().catch(() => {
        // Ignore errors - image will still display
      });
    };

    load();
  }, []);

  // Load initial animal index based on progress
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('animalProgress_forest');
        if (saved) {
          const arr = JSON.parse(saved);
          if (Array.isArray(arr) && arr.length > 0) {
            
            // Calculate the correct initial index based on progress
            const visitedSet = new Set<number>(arr);
            let indexToShow = 0;
            if (forestAnimals.length > 0) {
              if (visitedSet.size < forestAnimals.length) {
                // Find first unvisited animal
                for (let i = 0; i < forestAnimals.length; i++) {
                  if (!visitedSet.has(i)) { 
                    indexToShow = i; 
                    break; 
                  }
                }
              } else {
                // All visited: try to restore saved index
                const indexKey = 'animalCurrentIndex_forest';
                const savedIndexStr = await AsyncStorage.getItem(indexKey);
                const parsed = parseInt(savedIndexStr ?? '', 10);
                if (!isNaN(parsed) && parsed >= 0 && parsed < forestAnimals.length) {
                  indexToShow = parsed;
                }
              }
            }
            setInitialIndex(indexToShow);
          } else {
            // No progress yet, start with first animal
            setInitialIndex(0);
          }
        } else {
          // No saved progress, start with first animal
          setInitialIndex(0);
        }
      } catch (e) {
        // Error case, start with first animal
        setInitialIndex(0);
      }
    })();
  }, [forestAnimals.length]);

  // Gather all assets to preload including animal sprites, sounds, UI images, leaves, etc.
  const forestAssets = useMemo(() => {
    return getLevelAssets('Forest', forestAnimals);
  }, [forestAnimals]);

  return (
    <ScreenLoadingWrapper
      assetsToLoad={forestAssets}
      loadingText={t('loading') || 'Loading Forest...'}
      backgroundColor="#87CEEB"
      minLoadingTime={800}
      onAssetsLoaded={() => {
        // Assets loaded, screen will be ready
      }}
    >
      {bgUri && typeof initialIndex === 'number' ? (
        <LevelScreenTemplate
          levelName="Forest"
          animals={forestAnimals}
          onBackToMenu={onBackToMenu}
          backgroundImageUri={bgUri}
          skyBackgroundImageUri={skyBackgroundImageUri}
          initialIndex={initialIndex}
        />
      ) : (
        <View style={{ flex: 1, backgroundColor: '#FFDAB9', justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="orange" />
        </View>
      )}
    </ScreenLoadingWrapper>
  );
}
