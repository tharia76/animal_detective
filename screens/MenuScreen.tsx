import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Image,
  ActivityIndicator,
  useWindowDimensions,
  StyleSheet,
  ImageBackground,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Asset } from 'expo-asset';
import * as RNIap from 'react-native-iap';
import { useAudioPlayer } from 'expo-audio';
import { useDynamicStyles } from '../src/styles/styles';
import { useLocalization } from '../src/hooks/useLocalization';
import LanguageSelector from '../src/components/LanguageSelector';
import LevelTiles from '../src/components/LevelTiles';

const menuBgSound = require('../src/assets/sounds/menu.mp3');
const BG_IMAGE = require('../src/assets/images/menu-screen.png');
const LEVELS = ['farm', 'forest', 'ocean', 'desert', 'arctic', 'insects', 'savannah', 'jungle', 'birds'];
const NUM_COLS = 3;
const MARGIN = 3;

const LEVEL_BACKGROUNDS: Record<string, any> = {
  farm: require('../src/assets/images/level-backgrounds/farm.png'),
  forest: require('../src/assets/images/level-backgrounds/forest.png'),
  ocean: require('../src/assets/images/level-backgrounds/ocean.jpg'),
  desert: require('../src/assets/images/level-backgrounds/desert.jpg'),
  arctic: require('../src/assets/images/level-backgrounds/arctic.jpg'),
  insects: require('../src/assets/images/level-backgrounds/insect.png'),
  savannah: require('../src/assets/images/level-backgrounds/savannah.jpg'),
  jungle: require('../src/assets/images/level-backgrounds/jungle.jpg'),
  birds: require('../src/assets/images/level-backgrounds/birds.png'),
};

const getLevelBackgroundColor = (level: string): string => {
  switch (level) {
    case 'farm': return 'rgba(113, 89, 43, 0.8)';
    case 'forest': return 'rgba(34, 139, 34, 0.8)';
    case 'ocean': return 'rgba(0, 191, 255, 0.8)';
    case 'desert': return 'rgba(189, 113, 14, 0.8)';
    case 'arctic': return 'rgba(137, 190, 207, 0.8)';
    case 'insects': return 'rgba(69, 95, 16, 0.8)';
    case 'savannah': return 'rgba(181, 163, 25, 0.8)';
    case 'jungle': return 'rgba(0, 100, 0, 0.8)';
    case 'birds': return 'rgba(217, 111, 222, 0.8)';
    default: return 'rgba(200, 200, 200, 0.8)';
  }
};

const styles = StyleSheet.create({
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  logo: {
    width: 280,
    height: 120,
    resizeMode: 'contain',
  },
  portraitHeaderContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 0,
    zIndex: 10000,
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  portraitLogo: {
    width: 280,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  portraitLanguageSelector: {
    marginTop: 0,
    marginBottom: 10,
    alignSelf: 'center',
    zIndex: 10001,
  },
  tilesContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    marginTop: 80,
    marginLeft: 25,
    marginRight: 10,
  },
  tilesContainerLandscape: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    left: 0,
    right: 0,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: '100%',
  },
  landscapeHeaderContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: 'transparent',
    zIndex: 2,
    position: 'relative',
  },
  landscapeLogo: {
    width: 280,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 2,
  },
  landscapeLangContainer: {
    position: 'absolute',
    right: 16,
    top: 8,
    zIndex: 10001,
  },
  landscapeTilesGrid: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 8,
    paddingBottom: 16,
    zIndex: 1,
  },
});

export default function MenuScreen({ onSelectLevel, backgroundImageUri }) {
  const navigation = useNavigation();
  const { t, lang, setLang } = useLocalization();
  const dynStyles = useDynamicStyles();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [bgReady, setBgReady] = useState(false);
  const [bgUri, setBgUri] = useState<string | null>(null);
  const [imgsReady, setImgsReady] = useState(false);

  // Use a ref to always get the latest player instance
  const playerRef = useRef<any>(null);
  const player = useAudioPlayer(menuBgSound);

  // Keep playerRef in sync with player
  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  // Play immediately on mount, and cleanup on unmount
  useEffect(() => {
    try {
      player.play();
    } catch (e) {
      console.warn('Failed to play menu bg sound', e);
    }
    return () => {
      try {
        if (playerRef.current && playerRef.current.playing) {
          playerRef.current.pause();
        }
        if (playerRef.current) {
          playerRef.current.remove();
        }
      } catch (e) {
        // Defensive: ignore errors on cleanup
      }
    };
  }, [player]);

  // helper to fully stop & unload
  const stopAndUnload = useCallback(() => {
    try {
      if (playerRef.current && playerRef.current.playing) {
        playerRef.current.pause();
      }
      if (playerRef.current) {
        playerRef.current.remove();
      }
    } catch (e) {
      // Defensive: ignore errors on cleanup
    }
  }, []);

  // preload images
  useEffect(() => {
    (async () => {
      try {
        const bgAsset = Asset.fromModule(BG_IMAGE);
        await bgAsset.downloadAsync();
        setBgUri(bgAsset.localUri ?? bgAsset.uri);
        setBgReady(true);

        // preload each level background
        await Promise.all(
          LEVELS.map((l) => {
            let file;
            switch (l) {
              case 'ocean':
                file = require('../src/assets/images/level-backgrounds/ocean.jpg');
                break;
              case 'desert':
                file = require('../src/assets/images/level-backgrounds/desert.jpg');
                break;
              case 'arctic':
                file = require('../src/assets/images/level-backgrounds/arctic.jpg');
                break;
              case 'savannah':
                file = require('../src/assets/images/level-backgrounds/savannah.jpg');
                break;
              case 'jungle':
                file = require('../src/assets/images/level-backgrounds/jungle.jpg');
                break;
              case 'birds':
                file = require('../src/assets/images/level-backgrounds/birds.png');
                break;
              case 'insects':
                file = require('../src/assets/images/level-backgrounds/insect.png');
                break;
              case 'farm':
                file = require('../src/assets/images/level-backgrounds/farm.png');
                break;
              case 'forest':
                file = require('../src/assets/images/level-backgrounds/forest.png');
                break;
              default:
                file = require('../src/assets/images/level-backgrounds/farm.png');
            }
            return Asset.fromModule(file).downloadAsync();
          })
        );
        setImgsReady(true);
      } catch (e) {
        console.warn('Error preloading images:', e);
        setBgReady(true);
        setImgsReady(true);
      }
    })();
  }, []);

  // play on focus, stop on blur
  useEffect(() => {
    const onFocus = () => {
      try {
        if (playerRef.current) playerRef.current.play();
      } catch (e) {
        // Defensive: ignore
      }
    };
    const onBlur = () => {
      stopAndUnload();
    };

    const fSub = navigation.addListener('focus', onFocus);
    const bSub = navigation.addListener('blur', onBlur);
    return () => {
      try {
        fSub && fSub();
        bSub && bSub();
      } catch (e) {}
      stopAndUnload();
    };
  }, [navigation, stopAndUnload]);

  // also stop when you select a level
  const handleSelect = useCallback((level, isLocked) => {
    stopAndUnload();
    if (!isLocked) {
      // Defensive: ensure onSelectLevel is a function
      if (typeof onSelectLevel === 'function') {
        onSelectLevel(level);
      }
    }
  }, [onSelectLevel, stopAndUnload]);

  if (!bgReady || !imgsReady) {
    return (
      <View
        style={[
          dynStyles.menuContainer,
          { justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFDAB9' },
        ]}
      >
        <ActivityIndicator size="large" color="orange" />
      </View>
    );
  }

  // sizing logic
  const portraitSize = (width * 0.9 / NUM_COLS) - (MARGIN * 2);
  const landscapeSize = (width * 0.65 / NUM_COLS) - (MARGIN * 2);
  const itemSize = isLandscape ? landscapeSize : portraitSize;

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Русский' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
    { code: 'it', name: 'Italiano' },
    { code: 'tr', name: 'Türkçe' },
  ];

  if (isLandscape) {
    return (
      <ImageBackground
        source={
          backgroundImageUri
            ? { uri: backgroundImageUri }
            : bgUri
            ? { uri: bgUri }
            : BG_IMAGE
        }
        style={{ flex: 1, position: 'relative' }}
        resizeMode="cover"
      >
        <View style={{ flex: 1 }}>
          <View style={styles.landscapeLangContainer}>
            <LanguageSelector
              isLandscape={isLandscape}
              t={t}
              lang={lang}
              languages={languages}
              handleLanguageChange={setLang}
            />
          </View>
          <View style={styles.landscapeHeaderContainer}>
            <Image
              source={require('../src/assets/images/game-logo.png')}
              style={styles.landscapeLogo}
              resizeMode="contain"
            />
          </View>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              flexGrow: 1,
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingHorizontal: 32,
              paddingTop: 8,
              paddingBottom: 16,
              minHeight: itemSize + MARGIN * 2,
            }}
            showsVerticalScrollIndicator={true}
          >
            <View
              style={{
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LevelTiles
                levels={LEVELS}
                numColumns={NUM_COLS}
                isLandscape={isLandscape}
                itemSize={itemSize}
                margin={MARGIN}
                LEVEL_BACKGROUNDS={LEVEL_BACKGROUNDS}
                handleLevelSelect={handleSelect}
                styles={styles}
                getLevelBackgroundColor={getLevelBackgroundColor}
                t={t}
              />
            </View>
          </ScrollView>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={
        backgroundImageUri
          ? { uri: backgroundImageUri }
          : bgUri
          ? { uri: bgUri }
          : BG_IMAGE
      }
      style={{ flex: 1, position: 'relative' }}
      resizeMode="cover"
    >
      <View style={styles.portraitHeaderContainer} pointerEvents="box-none">
        <Image
          source={require('../src/assets/images/game-logo.png')}
          style={styles.portraitLogo}
          resizeMode="contain"
        />
        <View style={styles.portraitLanguageSelector}>
          <LanguageSelector
            isLandscape={isLandscape}
            t={t}
            lang={lang}
            languages={languages}
            handleLanguageChange={setLang}
          />
        </View>
      </View>
      <View
        style={[
          styles.tilesContainer,
          { top: 270, flex: 1 }
        ]}
      >
        <LevelTiles
          levels={LEVELS}
          numColumns={NUM_COLS}
          isLandscape={isLandscape}
          itemSize={itemSize}
          margin={MARGIN}
          LEVEL_BACKGROUNDS={LEVEL_BACKGROUNDS}
          handleLevelSelect={handleSelect}
          styles={styles}
          getLevelBackgroundColor={getLevelBackgroundColor}
          t={t}
        />
      </View>
    </ImageBackground>
  );
}
