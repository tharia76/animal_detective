import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Asset } from 'expo-asset';
import { getAnimals } from '../../src/data/animals';
import { AnimalType } from '../../src/data/AnimalType';
import LevelScreenTemplate from '../../src/components/LevelScreenTemplate';
import { useLocalization } from '../../src/hooks/useLocalization';

// Define Props for the screen
type DesertScreenProps = {
    onBackToMenu: () => void;
    backgroundImageUri: string | null;
    skyBackgroundImageUri: string | null;
};

export default function DesertScreen({ onBackToMenu, backgroundImageUri, skyBackgroundImageUri }: DesertScreenProps) {
  const { lang } = useLocalization();
  const [isReady, setIsReady] = useState(false);
  
  // Get background URI - already preloaded from SplashScreen
  const DESERT_BG = require('../../src/assets/images/level-backgrounds/desert.png');
  const bgAsset = Asset.fromModule(DESERT_BG);
  const bgUri = bgAsset.uri || bgAsset.localUri;
  
  const desertAnimals = getAnimals(lang).filter((animal: AnimalType) => animal.animalType === 'Desert');

  useEffect(() => {
    // Show loading screen very briefly, then render
    // Assets are preloaded at app startup
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  // Show brief loading screen
  if (!isReady) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: '#f4a460', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <ActivityIndicator size="large" color="#8B4513" />
      </View>
    );
  }

  // Render level - all assets preloaded
  return (
    <LevelScreenTemplate
      levelName="Desert"
      animals={desertAnimals}
      onBackToMenu={onBackToMenu}
      backgroundImageUri={bgUri}
      skyBackgroundImageUri={skyBackgroundImageUri}
    />
  );
}
