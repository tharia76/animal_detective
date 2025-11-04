import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Asset } from 'expo-asset';
import { getAnimals } from '../../src/data/animals';
import { AnimalType } from '../../src/data/AnimalType';
import LevelScreenTemplate from '../../src/components/LevelScreenTemplate';
import { useLocalization } from '../../src/hooks/useLocalization';

type JungleScreenProps = {
    onBackToMenu: () => void;
    backgroundImageUri: string | null;
    skyBackgroundImageUri: string | null;
};

export default function JungleScreen({ onBackToMenu, backgroundImageUri, skyBackgroundImageUri }: JungleScreenProps) {
  const { lang } = useLocalization();
  const [isReady, setIsReady] = useState(false);
  
  const JUNGLE_BG = require('../../src/assets/images/level-backgrounds/jungle.png');
  const bgUri = Asset.fromModule(JUNGLE_BG).uri || Asset.fromModule(JUNGLE_BG).localUri;
  const jungleAnimals = getAnimals(lang).filter((animal: AnimalType) => animal.animalType === 'Jungle');

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#1a4d1a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#228B22" />
      </View>
    );
  }

  return (
    <LevelScreenTemplate
      levelName="Jungle"
      animals={jungleAnimals}
      onBackToMenu={onBackToMenu}
      backgroundImageUri={bgUri}
      skyBackgroundImageUri={skyBackgroundImageUri}
    />
  );
}
