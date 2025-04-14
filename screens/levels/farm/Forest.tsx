import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Asset } from 'expo-asset';
import { animals } from '../../../app/(tabs)/data/animals';
import { AnimalType } from '../../../app/(tabs)/data/AnimalType';
import LevelScreenTemplate from '../../../app/(tabs)/components/LevelScreenTemplate';

type ForestScreenProps = {
  onBackToMenu: () => void;
  backgroundImageUri: string | null;
};

export default function ForestScreen({
  onBackToMenu,
  backgroundImageUri,
}: ForestScreenProps) {
  const forestAnimals = animals.filter((animal: AnimalType) => animal.animalType === 'Forest');
  // Check if there are any forest animals available
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading or any initialization if needed
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
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
    />
  );
}
