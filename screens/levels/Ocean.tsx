import React, { useEffect, useState, useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Asset } from 'expo-asset';
import { getAnimals } from '../../src/data/animals';
import { AnimalType } from '../../src/data/AnimalType';
import LevelScreenTemplate from '../../src/components/LevelScreenTemplate';
import { useLocalization } from '../../src/hooks/useLocalization';
import ScreenLoadingWrapper from '../../src/components/ScreenLoadingWrapper';
import { getLevelAssets } from '../../src/utils/getLevelAssets';

// Define Props for the screen
type OceanScreenProps = {
    onBackToMenu: () => void;
    backgroundImageUri: string | null; // Accept URI prop
    skyBackgroundImageUri: string | null;
    
};

export default function OceanScreen({ onBackToMenu, backgroundImageUri, skyBackgroundImageUri }: OceanScreenProps) {
  const { lang, t } = useLocalization();
  
  // Load the ocean background image
  const OCEAN_BG = require('../../src/assets/images/level-backgrounds/ocean.webp');
  const [bgUri, setBgUri] = useState<string | null>(null);
  
  const oceanAnimals = getAnimals(lang).filter((animal: AnimalType) => animal.animalType === 'Ocean');

  useEffect(() => {
    const load = async () => {
      // Load the background image immediately
      const bgAsset = Asset.fromModule(OCEAN_BG);
      setBgUri(bgAsset.uri);
      
      // Optional: download for caching
      bgAsset.downloadAsync().catch(() => {
        // Ignore errors - image will still display
      });
    };

    load();
  }, []);

  // Gather all assets to preload including animal sprites, sounds, UI images, etc.
  const oceanAssets = useMemo(() => {
    return getLevelAssets('Ocean', oceanAnimals);
  }, [oceanAnimals]);

  return (
    <ScreenLoadingWrapper
      assetsToLoad={oceanAssets}
      loadingText={t('loading') || 'Loading Ocean...'}
      backgroundColor="#006994"
      minLoadingTime={800}
      onAssetsLoaded={() => {
        // Assets loaded, screen will be ready
      }}
    >
      {bgUri ? (
        <LevelScreenTemplate
          levelName="Ocean"
          animals={oceanAnimals}
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
