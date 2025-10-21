import React, { useEffect, useState, useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Asset } from 'expo-asset';
import { getAnimals } from '../../src/data/animals';
import { AnimalType } from '../../src/data/AnimalType';
import LevelScreenTemplate from '../../src/components/LevelScreenTemplate';
import { useLocalization } from '../../src/hooks/useLocalization';
import ScreenLoadingWrapper from '../../src/components/ScreenLoadingWrapper';

// Define Props for the screen
type FarmScreenProps = {
    onBackToMenu: () => void;
    backgroundImageUri: string | null; // Accept URI prop
    skyBackgroundImageUri: string | null;
    onScreenReady?: () => void;
};

export default function FarmScreen({ onBackToMenu, backgroundImageUri, skyBackgroundImageUri, onScreenReady }: FarmScreenProps) {
  const { t, lang } = useLocalization();
  const [allAssetsLoaded, setAllAssetsLoaded] = useState(false);
  
  // Load the farm background image
  const FARM_BG = require('../../src/assets/images/level-backgrounds/farm.webp');
  const [bgUri, setBgUri] = useState<string | null>(null);
  
  const farmAnimals = getAnimals(lang).filter((animal: AnimalType) => animal.animalType === 'Farm');

  useEffect(() => {
    // Load the background image immediately
    const loadBackground = async () => {
      const bgAsset = Asset.fromModule(FARM_BG);
      
      try {
        // Ensure the background is downloaded before marking ready
        await bgAsset.downloadAsync();
      } catch (error) {
        // Ignore errors - local assets will still work
      }
      
      setBgUri(bgAsset.uri);
      
      // Very small delay to ensure background is rendered
      setTimeout(() => {
        // Notify parent that screen is ready
        if (onScreenReady) {
          onScreenReady();
        }
      }, 10);
    };
    
    loadBackground();
  }, [onScreenReady]);

  // Gather all assets to preload including animal sprites
  const farmAssets = useMemo(() => {
    const assets = [
      FARM_BG,
    ];
    
    // Add farm animal sprites to ensure they're loaded
    farmAnimals.forEach(animal => {
      if (animal.source) {
        assets.push(animal.source);
      }
    });
    
    return assets;
  }, [farmAnimals]);

  // Wrap entire component with loading wrapper
  return (
    <ScreenLoadingWrapper
      assetsToLoad={farmAssets}
      loadingText={t('loading') || 'Loading Farm...'}
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
            levelName="Farm"
            animals={farmAnimals}
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
