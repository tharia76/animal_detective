import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Asset } from 'expo-asset';
import { getAnimals } from '../../src/data/animals';
import { AnimalType } from '../../src/data/AnimalType';
import LevelScreenTemplate from '../../src/components/LevelScreenTemplate';
import { useLocalization } from '../../src/hooks/useLocalization';
import ScreenLoadingWrapper from '../../src/components/ScreenLoadingWrapper';

// Define Props for the screen
type DesertScreenProps = {
    onBackToMenu: () => void;
    backgroundImageUri: string | null; // Accept URI prop
    skyBackgroundImageUri: string | null;
    
};

export default function DesertScreen({ onBackToMenu, backgroundImageUri, skyBackgroundImageUri }: DesertScreenProps) {
  const { lang, t } = useLocalization();
  const [allAssetsLoaded, setAllAssetsLoaded] = useState(false);
  
  // Load the desert background image
  const DESERT_BG = require('../../src/assets/images/level-backgrounds/desert.webp');
  const [bgUri, setBgUri] = useState<string | null>(null);
  
  const desertAnimals = getAnimals(lang).filter((animal: AnimalType) => animal.animalType === 'Desert');

  useEffect(() => {
    const load = async () => {
      // Load the background image immediately
      const bgAsset = Asset.fromModule(DESERT_BG);
      setBgUri(bgAsset.uri);
      
      // Optional: download for caching
      bgAsset.downloadAsync().catch(() => {
        // Ignore errors - image will still display
      });
    };

    load();
  }, []);

  return (
    <ScreenLoadingWrapper
      loadingText={t('loading') || 'Loading Desert...'}
      backgroundColor="#f4e4bc"
      minLoadingTime={800}
      onAssetsLoaded={() => {
        requestAnimationFrame(() => {
          setAllAssetsLoaded(true);
        });
      }}
    >
      {allAssetsLoaded && bgUri ? (
        <LevelScreenTemplate
          levelName="Desert"
          animals={desertAnimals}
          onBackToMenu={onBackToMenu}
          backgroundImageUri={bgUri}
          skyBackgroundImageUri={skyBackgroundImageUri}
        />
      ) : (
        <View style={{ flex: 1, backgroundColor: '#FFDAB9', justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="orange" />
        </View>
      )}
    </ScreenLoadingWrapper>
  );
}
