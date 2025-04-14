export const unstable_settings = {
  initialRouteName: '/',
};

export const screenOptions = {
  headerShown: false,
};

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import MenuScreen from '../screens/MenuScreen';
import SplashScreen from '../screens/SplashScreen';
import FarmScreen from '../screens/levels/farm/Farm';
import { useFonts } from 'expo-font';
import { Asset } from 'expo-asset';
import ForestScreen from '../screens/levels/farm/Forest';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const titleAnim = useRef(new Animated.Value(0)).current;
  const [assetsReady, setAssetsReady] = useState(false);
  const [farmBgUri, setFarmBgUri] = useState<string | null>(null);
  const [menuBgUri, setMenuBgUri] = useState<string | null>(null);
  const [forestBgUri, setForestBgUri] = useState<string | null>(null);
  const [oceanBgUri, setOceanBgUri] = useState<string | null>(null);

  // Animation state for screen transitions
  const screenOpacityAnim = useRef(new Animated.Value(1)).current; // Start fully visible

  const [fontsLoaded] = useFonts({
    'ComicNeue': require('../assets/fonts/custom.ttf'),
    'TitleFont': require('../assets/fonts/orange.ttf'),
  });

  useEffect(() => {
    const preloadAssets = async () => {
      try {
        const farm = Asset.fromModule(require('../assets/images/farm.jpg'));
        const menu = Asset.fromModule(require('../assets/images/animal-detective.png'));
        const forest = Asset.fromModule(require('../assets/images/forest.jpg'));
        // const ocean = Asset.fromModule(require('../assets/images/ocean.jpg'));

        await Promise.all([
          farm.downloadAsync(),
          menu.downloadAsync(),
          forest.downloadAsync(),
          // ocean.downloadAsync(),
        ]);

        setFarmBgUri(farm.localUri || farm.uri);
        setMenuBgUri(menu.localUri || menu.uri);
        setForestBgUri(forest.localUri || forest.uri);
        // setOceanBgUri(ocean.localUri || ocean.uri);
        setAssetsReady(true);
      } catch (error) {
        console.error("Error preloading assets:", error);
        setAssetsReady(true);
      }
    };

    if (fontsLoaded) {
      preloadAssets();
    }
  }, [fontsLoaded]);

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

  // Function to handle screen transitions with fade
  const transitionScreen = useCallback((updateStateCallback: () => void) => {
    Animated.timing(screenOpacityAnim, {
      toValue: 0, // Fade out
      duration: 250, // Adjust duration as needed
      useNativeDriver: true,
    }).start(() => {
      updateStateCallback(); // Change the state (selectedLevel)
      Animated.timing(screenOpacityAnim, {
        toValue: 1, // Fade in
        duration: 250, // Adjust duration
        useNativeDriver: true,
      }).start();
    });
  }, [screenOpacityAnim]); // Dependency array

  // Updated handlers using the transition function
  const handleSelectLevel = useCallback((level: string | null) => {
    transitionScreen(() => setSelectedLevel(level));
  }, [transitionScreen]); // Dependency array

  const handleBackToMenu = useCallback(() => {
    transitionScreen(() => setSelectedLevel(null));
  }, [transitionScreen]); // Dependency array

  if (showSplash || !fontsLoaded || !assetsReady) {
    return <SplashScreen titleAnim={titleAnim} fontsLoaded={fontsLoaded} />;
  }

  return (
    <>
      <StatusBar hidden />
      {/* Wrap the conditional rendering in an Animated.View */}
      <Animated.View style={{ flex: 1, opacity: screenOpacityAnim }}>
        {!selectedLevel ? (
          <MenuScreen
            onSelectLevel={handleSelectLevel} // Use updated handler
            backgroundImageUri={menuBgUri}
          />
        ) : selectedLevel === 'Farm' ? (
          <FarmScreen
            onBackToMenu={handleBackToMenu} // Use updated handler
            backgroundImageUri={farmBgUri}
          />
        ) : selectedLevel === 'Forest' ? (
          <ForestScreen
            onBackToMenu={handleBackToMenu} // Use updated handler
            backgroundImageUri={forestBgUri}
          />
        ) : ( // Fallback remains MenuScreen
          <MenuScreen
            onSelectLevel={handleSelectLevel} // Use updated handler
            backgroundImageUri={menuBgUri}
          />
        )}
      </Animated.View>
    </>
  );
}
