import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Asset } from 'expo-asset';
import { getAnimals } from '../../../src/data/animals';
import { AnimalType } from '../../../src/data/AnimalType';
import LevelScreenTemplate from '../../../src/components/LevelScreenTemplate';

// Define Props for the screen
type ArcticScreenProps = {
    onBackToMenu: () => void;
    backgroundImageUri: string | null; // Accept URI prop
    skyBackgroundImageUri: string | null;
    
};

export default function ArcticScreen({ onBackToMenu, backgroundImageUri, skyBackgroundImageUri }: ArcticScreenProps) {
  const arcticAnimals = getAnimals().filter((animal: AnimalType) => animal.animalType === 'Arctic');
  const [bgReady, setBgReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        await Asset.fromModule(require('../../../src/assets/images/level-backgrounds/arctic.jpg')).downloadAsync();
      } catch (err) {
        console.warn('Failed to preload arctic image', err);
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
      levelName="Arctic"
      animals={arcticAnimals}
      onBackToMenu={onBackToMenu}
      backgroundImageUri={backgroundImageUri}
      skyBackgroundImageUri={skyBackgroundImageUri}
    />
  );
}
