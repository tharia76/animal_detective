import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Asset } from 'expo-asset';
import { animals } from '../../../app/(tabs)/data/animals';
import { AnimalType } from '../../../app/(tabs)/data/AnimalType';
import LevelScreenTemplate from '../../../app/(tabs)/components/LevelScreenTemplate';

// Define Props for the screen
type FarmScreenProps = {
    onBackToMenu: () => void;
    backgroundImageUri: string | null; // Accept URI prop
    skyBackgroundImageUri: string | null;
};

export default function FarmScreen({ onBackToMenu, backgroundImageUri, skyBackgroundImageUri }: FarmScreenProps) {
  const farmAnimals = animals.filter((animal: AnimalType) => animal.animalType === 'Farm');
  const [bgReady, setBgReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        await Asset.fromModule(require('../../../assets/images/level-backgrounds/farm.png')).downloadAsync();
      } catch (err) {
        console.warn('Failed to preload farm image', err);
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
      levelName="Farm"
      animals={farmAnimals}
      onBackToMenu={onBackToMenu}
      backgroundImageUri={backgroundImageUri}
      skyBackgroundImageUri={skyBackgroundImageUri}
    />
  );
}
