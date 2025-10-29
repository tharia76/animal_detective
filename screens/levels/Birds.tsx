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
type BirdsScreenProps = {
    onBackToMenu: () => void;
    backgroundImageUri: string | null; // Accept URI prop
    skyBackgroundImageUri: string | null;
    
};

export default function BirdsScreen({ onBackToMenu, backgroundImageUri, skyBackgroundImageUri }: BirdsScreenProps) {
  const { lang, t } = useLocalization();
  
  // Load the birds background image
  const BIRDS_BG = require('../../src/assets/images/level-backgrounds/birds.webp');
  const [bgUri, setBgUri] = useState<string | null>(null);
  
  const birdsAnimals = getAnimals(lang).filter((animal: AnimalType) => animal.animalType === 'Birds');

  useEffect(() => {
    const load = async () => {
      // Load the background image immediately
      const bgAsset = Asset.fromModule(BIRDS_BG);
      setBgUri(bgAsset.uri);
      
      // Optional: download for caching
      bgAsset.downloadAsync().catch(() => {
        // Ignore errors - image will still display
      });
    };

    load();
  }, []);

  // Gather all assets to preload including animal sprites, sounds, UI images, feathers, etc.
  const birdsAssets = useMemo(() => {
    return getLevelAssets('Birds', birdsAnimals);
  }, [birdsAnimals]);

  return (
    <ScreenLoadingWrapper
      assetsToLoad={birdsAssets}
      loadingText={t('loading') || 'Loading Birds...'}
      backgroundColor="#87ceeb"
      minLoadingTime={800}
      onAssetsLoaded={() => {
        // Assets loaded, screen will be ready
      }}
    >
      {bgUri ? (
        <LevelScreenTemplate
          levelName="Birds"
          animals={birdsAnimals}
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
