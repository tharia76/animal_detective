export const unstable_settings = {
  initialRouteName: '/',
};

export const screenOptions = {
  headerShown: false,
};

import React, { useState, useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import MenuScreen from '../screens/MenuScreen';
import SplashScreen from '../screens/SplashScreen';
import FarmScreen from '../screens/levels/farm/Farm';
import { useFonts } from 'expo-font';
import { Asset } from 'expo-asset';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const titleAnim = useRef(new Animated.Value(0)).current;
  const [assetsReady, setAssetsReady] = useState(false);
  const [farmBgUri, setFarmBgUri] = useState<string | null>(null);
  const [menuBgUri, setMenuBgUri] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    'ComicNeue': require('../assets/fonts/custom.ttf'),
    'TitleFont': require('../assets/fonts/orange.ttf'),
  });

  useEffect(() => {
    const preloadAssets = async () => {
      const farm = Asset.fromModule(require('../assets/images/farm.jpg'));
      const menu = Asset.fromModule(require('../assets/images/animal-detective.png'));

      await Promise.all([
        farm.downloadAsync(),
        menu.downloadAsync(),
      ]);

      setFarmBgUri(farm.localUri || farm.uri);
      setMenuBgUri(menu.localUri || menu.uri);
      setAssetsReady(true);
    };

    preloadAssets();
  }, []);

  useEffect(() => {
    Animated.timing(titleAnim, {
      toValue: 1,
      duration: 5500,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <StatusBar hidden />
      {showSplash ? (
        <SplashScreen titleAnim={titleAnim} fontsLoaded={fontsLoaded} />
      ) : !selectedLevel ? (
        <MenuScreen onSelectLevel={setSelectedLevel} />
      ) : selectedLevel === 'Farm' ? (
        <FarmScreen onBackToMenu={() => setSelectedLevel(null)} backgroundUri={farmBgUri} />
      ) : (
        <MenuScreen onSelectLevel={setSelectedLevel} />
      )}
    </>
  );
}
