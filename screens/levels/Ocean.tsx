import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Asset } from 'expo-asset';
import { getAnimals } from '../../src/data/animals';
import { AnimalType } from '../../src/data/AnimalType';
import LevelScreenTemplate from '../../src/components/LevelScreenTemplate';
import { useLocalization } from '../../src/hooks/useLocalization';

// Define Props for the screen
type OceanScreenProps = {
    onBackToMenu: () => void;
    backgroundImageUri: string | null; // Accept URI prop
    skyBackgroundImageUri: string | null;
    
};

export default function OceanScreen({ onBackToMenu, backgroundImageUri, skyBackgroundImageUri }: OceanScreenProps) {
  const { lang } = useLocalization();
  const oceanAnimals = getAnimals(lang).filter((animal: AnimalType) => animal.animalType === 'Ocean');
  const [bgReady, setBgReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        await Asset.fromModule(require('../../src/assets/images/level-backgrounds/ocean.png')).downloadAsync();
      } catch (err) {
        console.warn('Failed to preload ocean image', err);
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
      levelName="Ocean"
      animals={oceanAnimals}
      onBackToMenu={onBackToMenu}
      backgroundImageUri={backgroundImageUri}
      skyBackgroundImageUri={skyBackgroundImageUri}
    />
  );
}
