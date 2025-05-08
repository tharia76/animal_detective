import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Asset } from 'expo-asset';
import { getAnimals } from '../../src/data/animals';
import { AnimalType } from '../../src/data/AnimalType';
import LevelScreenTemplate from '../../src/components/LevelScreenTemplate';

// Define Props for the screen
type SavannahScreenProps = {
    onBackToMenu: () => void;
    backgroundImageUri: string | null; // Accept URI prop
    skyBackgroundImageUri: string | null;
    
};

export default function SavannahScreen({ onBackToMenu, backgroundImageUri, skyBackgroundImageUri }: SavannahScreenProps) {
  const savannahAnimals = getAnimals().filter((animal: AnimalType) => animal.animalType === 'Savannah');
  const [bgReady, setBgReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        await Asset.fromModule(require('../../src/assets/images/level-backgrounds/savannah.jpg')).downloadAsync();
      } catch (err) {
        console.warn('Failed to preload savannah image', err);
      }
      setBgReady(true);
    };

    load();
  }, []);

  if (!bgReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFDAB9', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="orange" />
      </View>
    );
  }

  return (
    <LevelScreenTemplate
      levelName="Savannah"
      animals={savannahAnimals}
      onBackToMenu={onBackToMenu}
      backgroundImageUri={backgroundImageUri}
      skyBackgroundImageUri={skyBackgroundImageUri}
    />
  );
}
