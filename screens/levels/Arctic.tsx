import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Asset } from 'expo-asset';
import { getAnimals } from '../../src/data/animals';
import { AnimalType } from '../../src/data/AnimalType';
import LevelScreenTemplate from '../../src/components/LevelScreenTemplate';
import { useLocalization } from '../../src/hooks/useLocalization';

type ArcticScreenProps = {
    onBackToMenu: () => void;
    backgroundImageUri: string | null;
    skyBackgroundImageUri: string | null;
};

export default function ArcticScreen({ onBackToMenu, backgroundImageUri, skyBackgroundImageUri }: ArcticScreenProps) {
  const { lang } = useLocalization();
  const [isReady, setIsReady] = useState(false);
  
  const ARCTIC_BG = require('../../src/assets/images/level-backgrounds/arctic.png');
  const bgUri = Asset.fromModule(ARCTIC_BG).uri || Asset.fromModule(ARCTIC_BG).localUri;
  const arcticAnimals = getAnimals(lang).filter((animal: AnimalType) => animal.animalType === 'Arctic');

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#b0e0e6', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4682B4" />
      </View>
    );
  }

  return (
    <LevelScreenTemplate
      levelName="Arctic"
      animals={arcticAnimals}
      onBackToMenu={onBackToMenu}
      backgroundImageUri={bgUri}
      skyBackgroundImageUri={skyBackgroundImageUri}
    />
  );
}
