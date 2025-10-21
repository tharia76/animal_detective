import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Asset } from 'expo-asset';
import { getAnimals } from '../../src/data/animals';
import { AnimalType } from '../../src/data/AnimalType';
import LevelScreenTemplate from '../../src/components/LevelScreenTemplate';
import { useLocalization } from '../../src/hooks/useLocalization';
import ScreenLoadingWrapper from '../../src/components/ScreenLoadingWrapper';

// Define Props for the screen
type JungleScreenProps = {
    onBackToMenu: () => void;
    backgroundImageUri: string | null; // Accept URI prop
    skyBackgroundImageUri: string | null;
    
};

export default function JungleScreen({ onBackToMenu, backgroundImageUri, skyBackgroundImageUri }: JungleScreenProps) {
  const { lang, t } = useLocalization();
  const [allAssetsLoaded, setAllAssetsLoaded] = useState(false);
  
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



  return (
    <ScreenLoadingWrapper
      loadingText={t('loading') || 'Loading Jungle...'}
      backgroundColor="#1a3d1a"
      minLoadingTime={800}
      onAssetsLoaded={() => {
        requestAnimationFrame(() => {
          setAllAssetsLoaded(true);
        });
      }}
    >
      {allAssetsLoaded && bgUri ? (
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
