import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Asset } from 'expo-asset';
import { getAnimals } from '../../src/data/animals';
import { AnimalType } from '../../src/data/AnimalType';
import LevelScreenTemplate from '../../src/components/LevelScreenTemplate';
import { useLocalization } from '../../src/hooks/useLocalization';

type SavannahScreenProps = {
    onBackToMenu: () => void;
    backgroundImageUri: string | null;
    skyBackgroundImageUri: string | null;
};

export default function SavannahScreen({ onBackToMenu, backgroundImageUri, skyBackgroundImageUri }: SavannahScreenProps) {
  const { lang } = useLocalization();
  const [isReady, setIsReady] = useState(false);
  
  const SAVANNAH_BG = require('../../src/assets/images/level-backgrounds/savannah.png');
  const bgUri = Asset.fromModule(SAVANNAH_BG).uri || Asset.fromModule(SAVANNAH_BG).localUri;
  const savannahAnimals = getAnimals(lang).filter((animal: AnimalType) => animal.animalType === 'Savannah');

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#deb887', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#CD853F" />
      </View>
    );
  }

  return (
    <LevelScreenTemplate
      levelName="Savannah"
      animals={savannahAnimals}
      onBackToMenu={onBackToMenu}
      backgroundImageUri={bgUri}
      skyBackgroundImageUri={skyBackgroundImageUri}
    />
  );
}
