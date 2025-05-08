export const unstable_settings = {
  initialRouteName: '/',
};

export const screenOptions = {
  headerShown: false,
};

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Animated, useWindowDimensions, ImageBackground } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import MenuScreen from '../screens/MenuScreen';
import SplashScreen from '../screens/SplashScreen';
import FarmScreen from '../screens/levels/Farm';
import { useFonts } from 'expo-font';
import { Asset } from 'expo-asset';
import ForestScreen from '../screens/levels/Forest';
import '../src/localization/i18next';
import ArcticScreen from '../screens/levels/Arctic';
import OceanScreen from '../screens/levels/Ocean';
import DesertScreen from '../screens/levels/Desert';
import SavannahScreen from '../screens/levels/Savannah';
import JungleScreen from '../screens/levels/Jungle';
import InsectsScreen from '../screens/levels/Insects';
import BirdsScreen from '../screens/levels/Birds';

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
  const [arcticBgUri, setArcticBgUri] = useState<string | null>(null);
  const [oceanBgUri, setOceanBgUri] = useState<string | null>(null);
  const [savannahBgUri, setSavannahBgUri] = useState<string | null>(null);
  const [desertBgUri, setDesertBgUri] = useState<string | null>(null);
  const [jungleBgUri, setJungleBgUri] = useState<string | null>(null);
  const [insectsBgUri, setInsectsBgUri] = useState<string | null>(null);
  const [birdsBgUri, setBirdsBgUri] = useState<string | null>(null);
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
        const farm = Asset.fromModule(require('../src/assets/images/level-backgrounds/farm.png'));
        const menu = Asset.fromModule(require('../src/assets/images/menu-screen.png'));
        const forest = Asset.fromModule(require('../src/assets/images/level-backgrounds/forest.png'));
        // For moving backgrounds, you can use different images if you have them
        const movingFarm = Asset.fromModule(require('../src/assets/images/level-backgrounds/farm.png'));
        const movingForest = Asset.fromModule(require('../src/assets/images/level-backgrounds/forest.png'));
        const arctic = Asset.fromModule(require('../src/assets/images/level-backgrounds/arctic.jpg'));
        const ocean = Asset.fromModule(require('../src/assets/images/level-backgrounds/ocean.jpg'));
        const savannah = Asset.fromModule(require('../src/assets/images/level-backgrounds/savannah.jpg'));
        const desert = Asset.fromModule(require('../src/assets/images/level-backgrounds/desert.jpg'));
        const jungle = Asset.fromModule(require('../src/assets/images/level-backgrounds/jungle.jpg'));
        const insects = Asset.fromModule(require('../src/assets/images/level-backgrounds/insect.png'));
        const birds = Asset.fromModule(require('../src/assets/images/level-backgrounds/birds.png'));
        // const movingOcean = Asset.fromModule(require('../src/assets/images/ocean.jpg'));

        await Promise.all([
          farm.downloadAsync(),
          menu.downloadAsync(),
          forest.downloadAsync(),
          movingFarm.downloadAsync(),
          movingForest.downloadAsync(),
          ocean.downloadAsync(),
          savannah.downloadAsync(),
          desert.downloadAsync(),
          jungle.downloadAsync(),
          insects.downloadAsync(),
          birds.downloadAsync(),
          // movingOcean.downloadAsync(),
        ]);

        setFarmBgUri(farm.localUri || farm.uri);
        setMenuBgUri(menu.localUri || menu.uri);
        setForestBgUri(forest.localUri || forest.uri);
        setArcticBgUri(arctic.localUri || arctic.uri);
        setOceanBgUri(ocean.localUri || ocean.uri);
        setSavannahBgUri(savannah.localUri || savannah.uri);
        setDesertBgUri(desert.localUri || desert.uri);
        setJungleBgUri(jungle.localUri || jungle.uri);
        setInsectsBgUri(insects.localUri || insects.uri);
        setBirdsBgUri(birds.localUri || birds.uri);
        setMovingBgUris({
          farm: movingFarm.localUri || movingFarm.uri,
          forest: movingForest.localUri || movingForest.uri,
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

  // Pick the right URI for the backdrop
  const bgUri = selectedLevel
    ? {
        farm: farmBgUri,
        forest: forestBgUri,
        arctic: arcticBgUri,
        ocean: oceanBgUri,
        savannah: savannahBgUri,
        desert: desertBgUri,
        jungle: jungleBgUri,
        insects: insectsBgUri,
        birds: birdsBgUri,
      }[selectedLevel] || null
    : menuBgUri;

  // Render the correct LevelScreen component
  const renderLevelScreen = () => {
    switch (selectedLevel) {
      case 'farm':
        return (
          <FarmScreen
            onBackToMenu={handleBackToMenu}
            backgroundImageUri={bgUri}
            skyBackgroundImageUri={getMovingBgUri('farm')}
          />
        );
      case 'forest':
        return (
          <ForestScreen
            onBackToMenu={handleBackToMenu}
            backgroundImageUri={bgUri}
            skyBackgroundImageUri={getMovingBgUri('forest')}
          />
        );
      case 'arctic':
        return (
          <ArcticScreen
            onBackToMenu={handleBackToMenu}
            backgroundImageUri={bgUri}
            skyBackgroundImageUri={getMovingBgUri('arctic')}
          />
        );
      case 'ocean':
        return (
          <OceanScreen
            onBackToMenu={handleBackToMenu}
            backgroundImageUri={bgUri}
            skyBackgroundImageUri={getMovingBgUri('ocean')}
          />
        );
      case 'savannah':
        return (
          <SavannahScreen
            onBackToMenu={handleBackToMenu}
            backgroundImageUri={bgUri}
            skyBackgroundImageUri={getMovingBgUri('savannah')}
          />
        );
      case 'desert':
        return (
          <DesertScreen
            onBackToMenu={handleBackToMenu}
            backgroundImageUri={bgUri}
            skyBackgroundImageUri={getMovingBgUri('desert')}
          />
        );
      case 'jungle':
        return (
          <JungleScreen
            onBackToMenu={handleBackToMenu}
            backgroundImageUri={bgUri}
            skyBackgroundImageUri={getMovingBgUri('jungle')}
          />
        );
      case 'insects':
        return (
          <InsectsScreen
            onBackToMenu={handleBackToMenu}
            backgroundImageUri={bgUri}
            skyBackgroundImageUri={getMovingBgUri('insects')}
          />
        );
      case 'birds':
        return (
          <BirdsScreen
            onBackToMenu={handleBackToMenu}
            backgroundImageUri={bgUri}
            skyBackgroundImageUri={getMovingBgUri('birds')}
          />
        );
      default:
        return (
          <MenuScreen
            onSelectLevel={handleSelectLevel}
            backgroundImageUri={menuBgUri}
          />
        );
    }
  };

  return (
    <>
      <StatusBar hidden />
      <ImageBackground
        source={bgUri ? { uri: bgUri } : undefined}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <Animated.View style={{ flex: 1, opacity: screenOpacity }}>
          {selectedLevel == null ? (
            <MenuScreen
              onSelectLevel={handleSelectLevel}
              backgroundImageUri={menuBgUri}
            />
          ) : (
            renderLevelScreen()
          )}
        </Animated.View>
      </ImageBackground>
    </>
  );
}
