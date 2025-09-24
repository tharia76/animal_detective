export const unstable_settings = {
  initialRouteName: '/',
};

export const screenOptions = {
  headerShown: false,
};

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Animated, useWindowDimensions, ImageBackground, View, ActivityIndicator, Platform, Dimensions, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RobustVideoPlayer from '../src/components/RobustVideoPlayer';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
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
import { getAnimals } from '../src/data/animals';
import BackgroundMusicManager from '../src/services/BackgroundMusicManager';

export default function App() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [showSplash, setShowSplash] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [titleAnim] = useState(() => new Animated.Value(0));
  const [assetsReady, setAssetsReady] = useState(false);
  const [fadeAnim] = useState(() => new Animated.Value(1));


  
  // Force landscape on mount - especially for iPad
  useEffect(() => {
    const forceOrientation = async () => {
      try {
        // Check if we're on iPad
        const screen = Dimensions.get('screen');
        const isTablet = Platform.OS === 'ios' && (screen.width >= 768 || screen.height >= 768);
        
        if (isTablet) {
          console.log('iPad detected in App component - forcing landscape');
          // For iPad, try multiple approaches
          await ScreenOrientation.unlockAsync();
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
          
          // Also try to set the orientation directly
          const currentOrientation = await ScreenOrientation.getOrientationAsync();
          if (currentOrientation !== ScreenOrientation.Orientation.LANDSCAPE_LEFT && 
              currentOrientation !== ScreenOrientation.Orientation.LANDSCAPE_RIGHT) {
            // Force a specific landscape orientation
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
          }
        }
      } catch (error) {
        console.warn('Failed to force orientation in App:', error);
      }
    };
    
    forceOrientation();
  }, []);


  // Preload all audio assets for better performance
  const loadAudioAssets = useCallback(async () => {
    console.log('🎵 Starting audio asset preloading...');
    try {
      const audioAssets = [
        // Menu music
        require('../src/assets/sounds/background_sounds/menu.mp3'),
        // Level background music
        require('../src/assets/sounds/background_sounds/farm_bg.mp3'),
        require('../src/assets/sounds/background_sounds/forest_bg.mp3'),
        require('../src/assets/sounds/background_sounds/jungle_bg.mp3'),
        require('../src/assets/sounds/background_sounds/desert_bg.mp3'),
        require('../src/assets/sounds/background_sounds/ocean_bg.mp3'),
        require('../src/assets/sounds/background_sounds/savannah_bg.mp3'),
        require('../src/assets/sounds/background_sounds/arctic_bg.mp3'),
        require('../src/assets/sounds/background_sounds/birds_bg.mp3'),
        require('../src/assets/sounds/background_sounds/insects_bg.mp3'),
        // Common UI sounds (if they exist)
        // require('../src/assets/sounds/ui/button_click.mp3'),
        // require('../src/assets/sounds/ui/level_complete.mp3'),
        // require('../src/assets/sounds/ui/animal_found.mp3'),
      ];

      console.log(`🎵 Preloading ${audioAssets.length} audio assets...`);
      const startTime = Date.now();
      await Asset.loadAsync(audioAssets);
      const endTime = Date.now();
      console.log(`🎵 All audio assets preloaded successfully! (${endTime - startTime}ms)`);
      
      return true;
    } catch (error) {
      console.warn('🎵 Error preloading audio assets:', error);
      return false;
    }
  }, []);

  // Handle splash completion - all images and audio are now loaded
  const handleSplashComplete = useCallback(async () => {
    console.log('🎉 Splash animation complete - starting asset loading!');
    
    try {
      // Preload audio assets first
      const audioLoaded = await loadAudioAssets();
      
      if (audioLoaded) {
        console.log('🎵 Audio preloading completed successfully');
      } else {
        console.warn('🎵 Audio preloading had issues, but continuing...');
      }
      
      // Initialize background music for production
      await BackgroundMusicManager.initializeForProduction();
      console.log('🎵 BackgroundMusicManager initialized for production');
      
      // Preload all music for maximum performance (since assets are already loaded)
      await BackgroundMusicManager.preloadAllMusic();
      console.log('🎵 All music preloaded for maximum performance');
      
    } catch (e) {
      console.warn('Failed to initialize background music for production:', e);
    }
    
    // Mark assets as ready
    setAssetsReady(true);
    console.log('🎉 All assets loaded and ready!');
    
    // Add a small delay to let users see the splash video, then transition to menu
    setTimeout(() => {
      setShowSplash(false);
    }, 1500); // 1.5 second delay for smooth transition
  }, [loadAudioAssets]);

  // Remove the massive preloading - everything loads during splash now
  useEffect(() => {
    // Assets are now loaded during splash animation
    // Just mark as ready when splash completes
  }, []);

  useEffect(() => {
    Animated.timing(titleAnim, {
      toValue: 1,
      duration: 5500,
      useNativeDriver: true,
    }).start();

    // DEBUG: Disable automatic splash timeout to keep splash screen visible
    // const timer = setTimeout(() => {
    //   setShowSplash(false);
    // }, 8000);

    // return () => clearTimeout(timer);
  }, []);

  // Instant loading overlay with asset preloading
  const handleSelectLevel = useCallback(async (level: string) => {
    // Safety check: Only allow farm level or if user has unlocked all levels
    // This prevents locked levels from being accessed even if they somehow get through
    
    // TEMPORARY: Allow all levels for testing
    /* ORIGINAL CODE - RESTORE AFTER TESTING
    const isFarmLevel = level === 'farm';
    const hasUnlockedAll = await AsyncStorage.getItem('unlocked_all_levels') === 'true';
    
    if (!isFarmLevel && !hasUnlockedAll) {
      console.warn('Attempted to access locked level:', level, '- blocking access');
      return; // Don't open locked levels
    }
    */
    
    // Set selected level immediately to avoid black flash
    setSelectedLevel(level);
    // Reset fade animation to ensure smooth transition
    fadeAnim.setValue(1);
    
    // Preload level assets during loading
    const preloadAssets = async () => {
      try {
        // Preload level progress from AsyncStorage
        const progressKey = `animalProgress_${level.toLowerCase()}`;
        const indexKey = `animalCurrentIndex_${level.toLowerCase()}`;
        const visitedCountKey = `visitedCount_${level.toLowerCase()}`;
        
        await Promise.all([
          AsyncStorage.getItem(progressKey),
          AsyncStorage.getItem(indexKey),
          AsyncStorage.getItem(visitedCountKey)
        ]);
        
        // Preload animal data for the level (avoid hook calls in async functions)
        // Just preload the AsyncStorage data, animal data will load normally
        
        // Store preloaded data in global cache for instant access
        global._preloadedAssets = global._preloadedAssets || {};
        global._preloadedAssets[level] = {
          progressKey,
          indexKey,
          visitedCountKey,
          // Animal data will be loaded by the level screen itself
          preloadedAt: Date.now()
        };
        
        // Assets preloaded silently
      } catch (error) {
        console.warn('Error preloading assets:', error);
      }
    };
    
    // Start preloading immediately
    preloadAssets();
  }, [fadeAnim]);

  const handleBackToMenu = useCallback(() => {
    // Go back to menu immediately to avoid black flash
    setSelectedLevel(null);
    // Reset fade animation to ensure smooth transition
    fadeAnim.setValue(1);
  }, [fadeAnim]);

  if (showSplash || !assetsReady) {
    return <SplashScreen titleAnim={titleAnim} onLoadingComplete={handleSplashComplete} />;
  }

  // Helper to get the correct moving background for the selected level
  const getMovingBgUri = (level: string | null) => {
    if (!level) return null;
    return null; // No moving backgrounds for now, as they are preloaded
  };

  // Pick the right URI for the backdrop
  const bgUri = selectedLevel
    ? {
        farm: null, // No preloaded images for now
        forest: null,
        arctic: null,
        ocean: null,
        savannah: null,
        desert: null,
        jungle: null,
        insects: null,
        birds: null,
      }[selectedLevel] || null
    : null; // No preloaded menu image for now

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
            backgroundImageUri={null} // No preloaded menu image for now
          />
        );
    }
  };

  return (
    <>
      <StatusBar hidden />
      <View style={{ flex: 1, backgroundColor: '#FFDAB9' }}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          {selectedLevel == null ? (
            assetsReady ? (
              <MenuScreen
                onSelectLevel={handleSelectLevel}
                backgroundImageUri={null} // No preloaded menu image for now
              />
            ) : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFDAB9' }}>
                <ActivityIndicator size="large" color="orange" />
              </View>
            )
          ) : (
            renderLevelScreen()
          )}
        </Animated.View>
      </View>
    </>
  );
}
