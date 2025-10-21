import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Asset } from 'expo-asset';
import { getAnimals } from '../../src/data/animals';
import { AnimalType } from '../../src/data/AnimalType';
import LevelScreenTemplate from '../../src/components/LevelScreenTemplate';
import { useLocalization } from '../../src/hooks/useLocalization';
import ScreenLoadingWrapper from '../../src/components/ScreenLoadingWrapper';

// Define Props for the screen
type ArcticScreenProps = {
    onBackToMenu: () => void;
    backgroundImageUri: string | null; // Accept URI prop
    skyBackgroundImageUri: string | null;
    
};

export default function ArcticScreen({ onBackToMenu, backgroundImageUri, skyBackgroundImageUri }: ArcticScreenProps) {
  const { lang, t } = useLocalization();
  const [allAssetsLoaded, setAllAssetsLoaded] = useState(false);
  
  // Load the arctic background image
  const ARCTIC_BG = require('../../src/assets/images/level-backgrounds/arctic.webp');
  const [bgUri, setBgUri] = useState<string | null>(null);
  
  const arcticAnimals = getAnimals(lang).filter((animal: AnimalType) => animal.animalType === 'Arctic');

  useEffect(() => {
    const load = async () => {
      // Load the background image immediately
      const bgAsset = Asset.fromModule(ARCTIC_BG);
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
      loadingText={t('loading') || 'Loading Arctic...'}
      backgroundColor="#87CEEB"
      minLoadingTime={800}
      onAssetsLoaded={() => {
        requestAnimationFrame(() => {
          setAllAssetsLoaded(true);
        });
      }}
    >
      {allAssetsLoaded && bgUri ? (
        <View style={{ flex: 1 }}>
          <LevelScreenTemplate
            levelName="Arctic"
            animals={arcticAnimals}
            onBackToMenu={onBackToMenu}
            backgroundImageUri={bgUri}
            skyBackgroundImageUri={skyBackgroundImageUri}
          />
        </View>
      ) : (
        <View style={{ flex: 1, backgroundColor: '#FFDAB9', justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="orange" />
        </View>
      )}
    </ScreenLoadingWrapper>
  );
}
