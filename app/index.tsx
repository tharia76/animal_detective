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
  const [loadingProgress, setLoadingProgress] = useState(0);


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
      // Load only essential audio assets for fastest startup
      const audioAssets = [
        // Menu music (essential for immediate playback)
        require('../src/assets/sounds/background_sounds/menu.mp3'),
        // Most common level music (farm and forest)
        require('../src/assets/sounds/background_sounds/farm_bg.mp3'),
        require('../src/assets/sounds/background_sounds/forest_bg.mp3'),
      ];

      console.log(`🎵 Preloading ${audioAssets.length} audio assets...`);
      await Asset.loadAsync(audioAssets);
      console.log('🎵 All audio assets preloaded successfully!');
      
      return true;
    } catch (error) {
      console.warn('🎵 Error preloading audio assets:', error);
      return false;
    }
  }, []);

  // Handle splash completion - optimized for maximum speed with progress
  const handleSplashComplete = useCallback(async () => {
    console.log('🚀 Splash animation complete - starting FAST asset loading!');
    
    // Mark assets as ready immediately for instant UI
    setAssetsReady(true);
    setLoadingProgress(100);
    console.log('⚡ Assets marked ready - UI can load immediately!');
    
    // Start transition to menu immediately (no delay)
    setShowSplash(false);
    console.log('⚡ Transitioning to menu immediately!');
    
    // Load audio assets in parallel in the background (non-blocking)
    Promise.all([
      loadAudioAssets().catch(e => console.warn('Audio preload failed:', e)),
      BackgroundMusicManager.initializeForProduction().catch(e => console.warn('BGM init failed:', e))
    ]).then(() => {
      // After audio is ready, preload all music in background
      BackgroundMusicManager.preloadAllMusic().catch(e => console.warn('Music preload failed:', e));
      console.log('🎵 Background audio loading completed!');
    });
    
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
    // Safety check: Only allow farm level by default (unless unlocked)
    const isUnlockedLevel = level === 'farm';
    const hasUnlockedAll = await AsyncStorage.getItem('unlocked_all_levels') === 'true';
    
    if (!isUnlockedLevel && !hasUnlockedAll) {
      console.warn('Attempted to access locked level:', level, '- blocking access');
      return; // Don't open locked levels
    }
    
    // Track level selection
    const isLocked = !isUnlockedLevel && !hasUnlockedAll;
    
    // Set selected level immediately to avoid black flash
    setSelectedLevel(level);
    
    // Preload level assets during loading
    const preloadAssets = async () => {
      try {
        // Track level selection
        const isUnlocked = true; // Assuming levels are unlocked by default
        
        // Also send detailed event to backend
        AsyncStorage.getItem('userId').then(userId => {
          ApiService.trackLevelStartedDetailed(
            userId || 'anonymous',
            level,
            {
              level_name: level,
              level_id: level.toLowerCase(),
              content_id: level.toLowerCase(),
              content_type: 'level',
              is_unlocked: isUnlocked,
              action: 'level_started',
              timestamp: Date.now(),
            }
          ).catch(() => {});
        }).catch(() => {});
        
        // Preload level progress from AsyncStorage
        const progressKey = `animalProgress_${level.toLowerCase()}`;
        const indexKey = `animalCurrentIndex_${level.toLowerCase()}`;
        const visitedCountKey = `visitedCount_${level.toLowerCase()}`;
        
        const [savedProgress, savedIndex, visitedCount] = await Promise.all([
          AsyncStorage.getItem(progressKey),
          AsyncStorage.getItem(indexKey),
          AsyncStorage.getItem(visitedCountKey)
        ]);
        
        // Preload background image for this level
        const MOVING_BG_MAP: Record<string, any> = {
          'farm': require('../src/assets/images/level-backgrounds/farm.png'),
          'forest': require('../src/assets/images/level-backgrounds/forest.png'),
          'ocean': require('../src/assets/images/level-backgrounds/ocean.png'),
          'desert': require('../src/assets/images/level-backgrounds/desert.png'),
          'arctic': require('../src/assets/images/level-backgrounds/arctic.png'),
          'insects': require('../src/assets/images/level-backgrounds/insect.png'),
          'savannah': require('../src/assets/images/level-backgrounds/savannah.png'),
          'jungle': require('../src/assets/images/level-backgrounds/jungle.png'),
          'birds': require('../src/assets/images/level-backgrounds/birds.png'),
        };
        
        // Preload background image immediately (highest priority)
        if (MOVING_BG_MAP[levelKey]) {
          // Preload immediately and wait for it to complete before continuing
          const bgImage = MOVING_BG_MAP[levelKey];
          Asset.loadAsync([bgImage]).then(() => {
            console.log(`✅ Preloaded background image for ${level}`);
          }).catch((error) => {
            console.warn('Error preloading background image:', error);
          });
        }
        
        // Store preloaded data in global cache for instant access
        global._preloadedAssets = global._preloadedAssets || {};
        global._preloadedAssets[level] = {
          progressKey,
          indexKey,
          visitedCountKey,
          savedProgress,
          savedIndex,
          visitedCount,
          preloadedAt: Date.now()
        };
        
        console.log(`📦 Preloaded level data for ${level}`);
      } catch (error) {
        console.warn('Error preloading assets:', error);
      }
    };
    
    // Start preloading immediately
    preloadAssets();
  }, []);

  const handleBackToMenu = useCallback(() => {
    // Go back to menu immediately to avoid black flash
    setSelectedLevel(null);
  }, []);

  if (showSplash || !assetsReady) {
    return <SplashScreen titleAnim={titleAnim} onLoadingComplete={handleSplashComplete} loadingProgress={loadingProgress} />;
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
      <View style={{ 
        flex: 1, 
        backgroundColor: '#FFDAB9',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%'
      }}>
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
      </View>
    </>
  );
}
