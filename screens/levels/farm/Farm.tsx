import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Asset } from 'expo-asset';
import { animals } from '../../../app/(tabs)/data/animals';
import LevelScreenTemplate from '../../../app/(tabs)/components/LevelScreenTemplate';

export default function FarmScreen({
  onBackToMenu,
  backgroundUri,
}: {
  onBackToMenu: () => void;
  backgroundUri: string | null;
}) {
  const farmAnimals = animals.filter(animal => animal.animalType === 'Farm');

  if (!backgroundUri) {
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
      backgroundImage={{ uri: backgroundUri }}
      onBackToMenu={onBackToMenu}
    />
  );
}
