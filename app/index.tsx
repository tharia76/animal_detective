export const unstable_settings = {
  initialRouteName: '/',
};

export const screenOptions = {
  headerShown: false,
};

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Animated, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import MenuScreen from '../screens/MenuScreen';
import SplashScreen from '../screens/SplashScreen';
import FarmScreen from '../screens/levels/farm/Farm';
import { useFonts } from 'expo-font';
import { Asset } from 'expo-asset';
import ForestScreen from '../screens/levels/farm/Forest';
import './localization/i18next';

export default function App() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [showSplash, setShowSplash] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const titleAnim = useRef(new Animated.Value(0)).current;
  const [assetsReady, setAssetsReady] = useState(false);
  const [farmBgUri, setFarmBgUri] = useState<string | null>(null);
  const [menuBgUri, setMenuBgUri] = useState<string | null>(null);
  const [forestBgUri, setForestBgUri] = useState<string | null>(null);

  // Store moving backgrounds for each level
  const [movingBgUris, setMovingBgUris] = useState<Record<string, string | null>>({
    farm: null,
    forest: null,
    // ocean: null,
  });

  // Animation state for screen transitions
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const preloadAssets = async () => {
      try {
        const farm = Asset.fromModule(require('../assets/images/level-backgrounds/farm.png'));
        const menu = Asset.fromModule(require('../assets/images/menu-screen.png'));
        const forest = Asset.fromModule(require('../assets/images/level-backgrounds/forest.png'));
        // For moving backgrounds, you can use different images if you have them
        const movingFarm = Asset.fromModule(require('../assets/images/level-backgrounds/farm.png'));
        const movingForest = Asset.fromModule(require('../assets/images/level-backgrounds/forest.png'));
        // const ocean = Asset.fromModule(require('../assets/images/ocean.jpg'));
        // const movingOcean = Asset.fromModule(require('../assets/images/ocean.jpg'));

        await Promise.all([
          farm.downloadAsync(),
          menu.downloadAsync(),
          forest.downloadAsync(),
          movingFarm.downloadAsync(),
          movingForest.downloadAsync(),
          // ocean.downloadAsync(),
          // movingOcean.downloadAsync(),
        ]);

        setFarmBgUri(farm.localUri || farm.uri);
        setMenuBgUri(menu.localUri || menu.uri);
        setForestBgUri(forest.localUri || forest.uri);

        setMovingBgUris({
          farm: movingFarm.localUri || movingFarm.uri,
          forest: movingForest.localUri || movingForest.uri,
          // ocean: movingOcean.localUri || movingOcean.uri,
        });

        // setOceanBgUri(ocean.localUri || ocean.uri);
        setAssetsReady(true);
      } catch (error) {
        console.error("Error preloading assets:", error);
        setAssetsReady(true);
      }
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

  // Function to handle screen transitions with fade
  const transitionScreen = useCallback((cb: () => void) => {
    Animated.timing(screenOpacity, { toValue:0, duration:250, useNativeDriver:true })
      .start(() => {
        cb();
        Animated.timing(screenOpacity, { toValue:1, duration:250, useNativeDriver:true }).start();
      });
  }, [screenOpacity]);

  // Updated handlers using the transition function
  const handleSelectLevel = useCallback((level: string) => {
    transitionScreen(() => setSelectedLevel(level));
  }, [transitionScreen]);

  const handleBackToMenu = useCallback(() => {
    transitionScreen(() => setSelectedLevel(null));
  }, [transitionScreen]);

  if (showSplash || !assetsReady) {
    return <SplashScreen titleAnim={titleAnim} />;
  }

  // Helper to get the correct moving background for the selected level
  const getMovingBgUri = (level: string | null) => {
    if (!level) return null;
    return movingBgUris[level] || null;
  };

  return (
    <>
      <StatusBar hidden />
      {/* Wrap the conditional rendering in an Animated.View */}
      <Animated.View style={{ flex: 1, opacity: screenOpacity }}>
        {!selectedLevel ? (
          <MenuScreen
            onSelectLevel={handleSelectLevel}
            backgroundImageUri={menuBgUri}
          />
        ) : selectedLevel === 'farm' ? (
          <FarmScreen
            onBackToMenu={handleBackToMenu}
            backgroundImageUri={farmBgUri}
            skyBackgroundImageUri={getMovingBgUri('farm')}
          />
        ) : selectedLevel === 'forest' ? (
          <ForestScreen
            onBackToMenu={handleBackToMenu}
            backgroundImageUri={forestBgUri}
            skyBackgroundImageUri={getMovingBgUri('forest')}
          />
        ) : ( // Fallback remains MenuScreen
          <MenuScreen
            onSelectLevel={handleSelectLevel}
            backgroundImageUri={menuBgUri}
          />
        )}
      </Animated.View>
    </>
  );
}
