import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Asset } from 'expo-asset';
import { getAnimals } from '../../src/data/animals';
import { AnimalType } from '../../src/data/AnimalType';
import LevelScreenTemplate from '../../src/components/LevelScreenTemplate';
import { useLocalization } from '../../src/hooks/useLocalization';

type FarmScreenProps = {
    onBackToMenu: () => void;
    backgroundImageUri: string | null;
    skyBackgroundImageUri: string | null;
    onScreenReady?: () => void;
};

export default function FarmScreen({ onBackToMenu, backgroundImageUri, skyBackgroundImageUri, onScreenReady }: FarmScreenProps) {
  const { lang } = useLocalization();
  const [isReady, setIsReady] = useState(false);
  
  const FARM_BG = require('../../src/assets/images/level-backgrounds/farm.png');
  const bgUri = Asset.fromModule(FARM_BG).uri || Asset.fromModule(FARM_BG).localUri;
  const farmAnimals = getAnimals(lang).filter((animal: AnimalType) => animal.animalType === 'Farm');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
      onScreenReady?.();
    }, 200);
    return () => clearTimeout(timer);
  }, [onScreenReady]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#90ee90', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#228B22" />
      </View>
    );
  }

  return (
    <LevelScreenTemplate
      levelName="Farm"
      animals={farmAnimals}
      onBackToMenu={onBackToMenu}
      backgroundImageUri={bgUri}
      skyBackgroundImageUri={skyBackgroundImageUri}
    />
  );
}
