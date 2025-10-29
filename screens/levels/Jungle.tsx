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
type JungleScreenProps = {
    onBackToMenu: () => void;
    backgroundImageUri: string | null; // Accept URI prop
    skyBackgroundImageUri: string | null;
    
};

export default function JungleScreen({ onBackToMenu, backgroundImageUri, skyBackgroundImageUri }: JungleScreenProps) {
  const { lang, t } = useLocalization();
  
  // Load the jungle background image
  const JUNGLE_BG = require('../../src/assets/images/level-backgrounds/jungle.webp');
  const [bgUri, setBgUri] = useState<string | null>(null);
  
  const jungleAnimals = getAnimals(lang).filter((animal: AnimalType) => animal.animalType === 'Jungle');

  useEffect(() => {
    const load = async () => {
      // Load the background image immediately
      const bgAsset = Asset.fromModule(JUNGLE_BG);
      setBgUri(bgAsset.uri);
      
      // Optional: download for caching
      bgAsset.downloadAsync().catch(() => {
        // Ignore errors - image will still display
      });
    };

    load();
  }, []);

  // Gather all assets to preload including animal sprites, sounds, UI images, rain, etc.
  const jungleAssets = useMemo(() => {
    return getLevelAssets('Jungle', jungleAnimals);
  }, [jungleAnimals]);

  return (
    <ScreenLoadingWrapper
      assetsToLoad={jungleAssets}
      loadingText={t('loading') || 'Loading Jungle...'}
      backgroundColor="#1a3d1a"
      minLoadingTime={800}
      onAssetsLoaded={() => {
        // Assets loaded, screen will be ready
      }}
    >
      {bgUri ? (
        <LevelScreenTemplate
          levelName="Jungle"
          animals={jungleAnimals}
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
