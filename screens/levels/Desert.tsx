import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Asset } from 'expo-asset';
import { getAnimals } from '../../src/data/animals';
import { AnimalType } from '../../src/data/AnimalType';
import LevelScreenTemplate from '../../src/components/LevelScreenTemplate';
import { useLocalization } from '../../src/hooks/useLocalization';

// Define Props for the screen
type DesertScreenProps = {
    onBackToMenu: () => void;
    backgroundImageUri: string | null; // Accept URI prop
    skyBackgroundImageUri: string | null;
    
};

export default function DesertScreen({ onBackToMenu, backgroundImageUri, skyBackgroundImageUri }: DesertScreenProps) {
  const { lang } = useLocalization();
  const desertAnimals = getAnimals(lang).filter((animal: AnimalType) => animal.animalType === 'Desert');
  const [bgReady, setBgReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        await Asset.fromModule(require('../../src/assets/images/level-backgrounds/desert.png')).downloadAsync();
      } catch (err) {
        console.warn('Failed to preload desert image', err);
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
      levelName="Desert"
      animals={desertAnimals}
      onBackToMenu={onBackToMenu}
      backgroundImageUri={backgroundImageUri}
      skyBackgroundImageUri={skyBackgroundImageUri}
    />
  );
}
