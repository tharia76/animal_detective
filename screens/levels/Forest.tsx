import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Asset } from 'expo-asset';
import { getAnimals } from '../../src/data/animals';
import { AnimalType } from '../../src/data/AnimalType';
import LevelScreenTemplate from '../../src/components/LevelScreenTemplate';

// Define Props for the screen
type ForestScreenProps = {
    onBackToMenu: () => void;
    backgroundImageUri: string | null; // Accept URI prop
    skyBackgroundImageUri: string | null;
    
};

export default function ForestScreen({ onBackToMenu, backgroundImageUri, skyBackgroundImageUri }: ForestScreenProps) {
  const forestAnimals = getAnimals().filter((animal: AnimalType) => animal.animalType === 'Forest');
  const [bgReady, setBgReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        await Asset.fromModule(require('../../src/assets/images/level-backgrounds/forest.png')).downloadAsync();
      } catch (err) {
        console.warn('Failed to preload forest image', err);
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
      levelName="Forest"
      animals={forestAnimals}
      onBackToMenu={onBackToMenu}
      backgroundImageUri={backgroundImageUri}
      skyBackgroundImageUri={skyBackgroundImageUri}
    />
  );
}
