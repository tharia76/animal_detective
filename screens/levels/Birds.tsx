import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Asset } from 'expo-asset';
import { getAnimals } from '../../src/data/animals';
import { AnimalType } from '../../src/data/AnimalType';
import LevelScreenTemplate from '../../src/components/LevelScreenTemplate';
import { useLocalization } from '../../src/hooks/useLocalization';

type BirdsScreenProps = {
    onBackToMenu: () => void;
    backgroundImageUri: string | null;
    skyBackgroundImageUri: string | null;
};

export default function BirdsScreen({ onBackToMenu, backgroundImageUri, skyBackgroundImageUri }: BirdsScreenProps) {
  const { lang } = useLocalization();
  const [isReady, setIsReady] = useState(false);
  
  const BIRDS_BG = require('../../src/assets/images/level-backgrounds/birds.png');
  const bgUri = Asset.fromModule(BIRDS_BG).uri || Asset.fromModule(BIRDS_BG).localUri;
  const birdsAnimals = getAnimals(lang).filter((animal: AnimalType) => animal.animalType === 'Birds');

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#87ceeb', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4682B4" />
      </View>
    );
  }

  return (
    <LevelScreenTemplate
      levelName="Birds"
      animals={birdsAnimals}
      onBackToMenu={onBackToMenu}
      backgroundImageUri={bgUri}
      skyBackgroundImageUri={skyBackgroundImageUri}
    />
  );
}
