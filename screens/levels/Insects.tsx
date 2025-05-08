import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Asset } from 'expo-asset';
import { getAnimals } from '../../src/data/animals';
import { AnimalType } from '../../src/data/AnimalType';
import LevelScreenTemplate from '../../src/components/LevelScreenTemplate';

// Define Props for the screen
type InsectsScreenProps = {
    onBackToMenu: () => void;
    backgroundImageUri: string | null; // Accept URI prop
    skyBackgroundImageUri: string | null;
    
};

export default function InsectsScreen({ onBackToMenu, backgroundImageUri, skyBackgroundImageUri }: InsectsScreenProps) {
  const insectsAnimals = getAnimals().filter((animal: AnimalType) => animal.animalType === 'Insects');
  const [bgReady, setBgReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        await Asset.fromModule(require('../../src/assets/images/level-backgrounds/insect.png')).downloadAsync();
      } catch (err) {
        console.warn('Failed to preload insects image', err);
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
      levelName="Insects"
      animals={insectsAnimals}
      onBackToMenu={onBackToMenu}
      backgroundImageUri={backgroundImageUri}
      skyBackgroundImageUri={skyBackgroundImageUri}
    />
  );
}
