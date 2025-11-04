import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Asset } from 'expo-asset';
import { getAnimals } from '../../src/data/animals';
import { AnimalType } from '../../src/data/AnimalType';
import LevelScreenTemplate from '../../src/components/LevelScreenTemplate';
import { useLocalization } from '../../src/hooks/useLocalization';

type OceanScreenProps = {
    onBackToMenu: () => void;
    backgroundImageUri: string | null;
    skyBackgroundImageUri: string | null;
};

export default function OceanScreen({ onBackToMenu, backgroundImageUri, skyBackgroundImageUri }: OceanScreenProps) {
  const { lang } = useLocalization();
  const [isReady, setIsReady] = useState(false);
  
  const OCEAN_BG = require('../../src/assets/images/level-backgrounds/ocean.png');
  const bgUri = Asset.fromModule(OCEAN_BG).uri || Asset.fromModule(OCEAN_BG).localUri;
  const oceanAnimals = getAnimals(lang).filter((animal: AnimalType) => animal.animalType === 'Ocean');

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#006994', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4682B4" />
      </View>
    );
  }

  return (
    <LevelScreenTemplate
      levelName="Ocean"
      animals={oceanAnimals}
      onBackToMenu={onBackToMenu}
      backgroundImageUri={bgUri}
      skyBackgroundImageUri={skyBackgroundImageUri}
    />
  );
}
