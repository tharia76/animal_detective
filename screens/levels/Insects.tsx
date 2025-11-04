import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Asset } from 'expo-asset';
import { getAnimals } from '../../src/data/animals';
import { AnimalType } from '../../src/data/AnimalType';
import LevelScreenTemplate from '../../src/components/LevelScreenTemplate';
import { useLocalization } from '../../src/hooks/useLocalization';

type InsectsScreenProps = {
    onBackToMenu: () => void;
    backgroundImageUri: string | null;
    skyBackgroundImageUri: string | null;
};

export default function InsectsScreen({ onBackToMenu, backgroundImageUri, skyBackgroundImageUri }: InsectsScreenProps) {
  const { lang } = useLocalization();
  const [isReady, setIsReady] = useState(false);
  
  const INSECTS_BG = require('../../src/assets/images/level-backgrounds/insect.png');
  const bgUri = Asset.fromModule(INSECTS_BG).uri || Asset.fromModule(INSECTS_BG).localUri;
  const insectsAnimals = getAnimals(lang).filter((animal: AnimalType) => animal.animalType === 'Insects');

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#90ee90', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#228B22" />
      </View>
    );
  }

  return (
    <LevelScreenTemplate
      levelName="Insects"
      animals={insectsAnimals}
      onBackToMenu={onBackToMenu}
      backgroundImageUri={bgUri}
      skyBackgroundImageUri={skyBackgroundImageUri}
    />
  );
}
