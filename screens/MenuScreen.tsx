import React, { useEffect, useState, useCallback } from 'react';
import { View, Image, ActivityIndicator, useWindowDimensions, StyleSheet, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Asset } from 'expo-asset';
import * as RNIap from 'react-native-iap';
import { useDynamicStyles } from '../src/styles/styles';
import { useLocalization } from '../src/hooks/useLocalization';
import LanguageSelector from '../src/components/LanguageSelector';
import LevelTiles from '../src/components/LevelTiles';

type Props = {
  onSelectLevel: (level: string, language: string) => void;
  backgroundImageUri: string | null;
};

// Helper function to get background color based on level theme
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
    height: 280,
    resizeMode: 'contain',
  },
  // Portrait: logo above language selector
  portraitHeaderContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 0,
    zIndex: 10000,
    width: '100%',
  },
  portraitLogo: {
    width: 280,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  portraitLanguageSelector: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  tilesContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    marginTop: 80,
    marginLeft: 20,
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
  // New styles for landscape layout
  landscapeRow: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'stretch', // changed from 'center' to 'stretch'
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 1,
    paddingHorizontal: 48,
  },
  landscapeLeftCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start', // changed from 'center' to 'flex-start'
    minWidth: 200,
    maxWidth: 260,
    height: '100%',
  },
  landscapeLogoContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    marginTop: 0, // changed from 5 to 0 to push logo to very top
  },
  landscapeLangContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    // make the language selector smaller
    transform: [{ scale: 0.8 }],
    marginTop: 0, // add some space below logo
  },
  landscapeTilesCol: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
});

const LEVEL_BACKGROUNDS: Record<string, any> = {
  farm: require('../src/assets/images/level-backgrounds/farm.png'),
  forest: require('../src/assets/images/level-backgrounds/forest.png'),
  ocean: require('../src/assets/images/level-backgrounds/oceann.jpg'),
  desert: require('../src/assets/images/level-backgrounds/desert.jpg'),
  arctic: require('../src/assets/images/level-backgrounds/arctic.jpg'),
  insects: require('../src/assets/images/level-backgrounds/insect.png'),
  savannah: require('../src/assets/images/level-backgrounds/savannah.jpg'),
  jungle: require('../src/assets/images/level-backgrounds/jungle.jpg'),
  birds: require('../src/assets/images/level-backgrounds/birds.png'),
};

const BG_IMAGE = require('../src/assets/images/menu-screen.png');

export default function MenuScreen({ onSelectLevel, backgroundImageUri }: Props) {
  const navigation = useNavigation();

  const [bgLoaded, setBgLoaded] = useState(false);
  const [bgUri, setBgUri] = useState<string | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedLockedLevel, setSelectedLockedLevel] = useState<string | null>(null);
  const [products, setProducts] = useState<RNIap.Product[]>([]);

  const { t, lang, setLang } = useLocalization();
  const dynamicStyles = useDynamicStyles();

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const numColumns = isLandscape ? 3 : 3;

  // Bounded square size calculation
  const margin = 8;
  const portraitSize = (width * 0.9 / numColumns) - (margin * 2);
  const maxLandscape = height * 0.3;
  const itemSize = Math.min(portraitSize, maxLandscape);

  // Overlay heights: language selector is 50px tall at y=20, logo is 180px tall at y=80
  const LANG_SELECTOR_HEIGHT = 50; // approximate height of your language selector component
  const LANG_SELECTOR_TOP = 20;
  const LOGO_HEIGHT = 180;
  const LOGO_TOP = 80;
  const reservedHeight = LOGO_TOP + LOGO_HEIGHT;

  useEffect(() => {
    if (!lang) {
      setLang('en');
    }
  }, [lang, setLang]);

  useEffect(() => {
    navigation.setOptions({ headerShown: false, tabBarStyle: { display: 'none' } });
  }, [navigation]);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const bgAsset = Asset.fromModule(BG_IMAGE);
        await bgAsset.downloadAsync();
        setBgUri(bgAsset.localUri || bgAsset.uri);
        setBgLoaded(true);

        const farmAsset = Asset.fromModule(LEVEL_BACKGROUNDS.farm);
        const forestAsset = Asset.fromModule(LEVEL_BACKGROUNDS.forest);
        const oceanAsset = Asset.fromModule(LEVEL_BACKGROUNDS.ocean);
        const desertAsset = Asset.fromModule(LEVEL_BACKGROUNDS.desert);
        const arcticAsset = Asset.fromModule(LEVEL_BACKGROUNDS.arctic);
        const insectAsset = Asset.fromModule(LEVEL_BACKGROUNDS.insects);
        const savannahAsset = Asset.fromModule(LEVEL_BACKGROUNDS.savannah);
        const jungleAsset = Asset.fromModule(LEVEL_BACKGROUNDS.jungle);
        const birdsAsset = Asset.fromModule(LEVEL_BACKGROUNDS.birds);

        await Promise.all([
          farmAsset.downloadAsync(),
          forestAsset.downloadAsync(),
          oceanAsset.downloadAsync(),
          desertAsset.downloadAsync(),
          arcticAsset.downloadAsync(),
          insectAsset.downloadAsync(),
          savannahAsset.downloadAsync(),
          jungleAsset.downloadAsync(),
          birdsAsset.downloadAsync()
        ]);

        setImagesLoaded(true);
      } catch (error) {
        console.warn('Error preloading images:', error);
        setBgLoaded(true);
        setImagesLoaded(true);
      }
    };

    loadImages();
  }, []);

  const handleLevelSelect = useCallback((level: string, isLocked: boolean) => {
    if (!isLocked) {
      onSelectLevel(level, lang);
    } else {
      setSelectedLockedLevel(level);
      setShowPaymentModal(true);
    }
  }, [onSelectLevel, lang]);

  const allReady = bgLoaded && imagesLoaded;

  if (!allReady) {
    return (
      <View style={[dynamicStyles.menuContainer, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFDAB9' }]}>
        <ActivityIndicator size="large" color="orange" />
      </View>
    );
  }

  const levels = ['farm', 'forest', 'ocean', 'desert', 'arctic', 'insects', 'savannah', 'jungle', 'birds'];
  const languages = [
    { code: 'en', name: 'English'  },
    { code: 'ru', name: 'Русский' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
    { code: 'it', name: 'Italiano' },
    { code: 'tr', name: 'Türkçe' }
  ];

  // On landscape, put logo all the way to the top, language selector below, both in the left column, tiles on the right
  if (isLandscape) {
    return (
      <ImageBackground
        source={bgUri ? { uri: bgUri } : BG_IMAGE}
        style={{ flex: 1, position: 'relative' }}
        resizeMode="cover"
      >
        <View style={styles.landscapeRow}>
          {/* Left column: logo at very top, language selector below */}
          <View style={styles.landscapeLeftCol}>
            <View style={styles.landscapeLogoContainer} pointerEvents="none">
              <Image
                source={require('../src/assets/images/game-logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.landscapeLangContainer} pointerEvents="box-none">
              <LanguageSelector
                isLandscape={isLandscape}
                t={t}
                lang={lang}
                languages={languages}
                handleLanguageChange={setLang}
              />
            </View>
          </View>
          {/* Tiles on the right */}
          <View style={styles.landscapeTilesCol}>
            <LevelTiles
              levels={levels}
              numColumns={numColumns}
              isLandscape={isLandscape}
              itemSize={itemSize}
              margin={margin}
              LEVEL_BACKGROUNDS={LEVEL_BACKGROUNDS}
              handleLevelSelect={handleLevelSelect}
              styles={styles}
              getLevelBackgroundColor={getLevelBackgroundColor}
              t={t}
              // Add some vertical padding to center tiles
              ListHeaderComponent={<View style={{ height: 24 }} />}
              ListFooterComponent={<View style={{ height: 24 }} />}
            />
          </View>
        </View>
      </ImageBackground>
    );
  }

  // Portrait: logo above language selector, both at the top, then tiles below
  return (
    <ImageBackground
      source={bgUri ? { uri: bgUri } : BG_IMAGE}
      style={{ flex: 1, position: 'relative' }}
      resizeMode="cover"
    >
      {/* Header: logo above language selector */}
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
      {/* Tiles container: below header */}
      <View
        style={[
          styles.tilesContainer,
          { top: 220, flex: 1 } // 20 (marginTop) + 180 (logo) + 10 (logo marginBottom) + 10 (lang marginBottom)
        ]}
      >
        <LevelTiles
          levels={levels}
          numColumns={numColumns}
          isLandscape={isLandscape}
          itemSize={itemSize}
          margin={margin}
          LEVEL_BACKGROUNDS={LEVEL_BACKGROUNDS}
          handleLevelSelect={handleLevelSelect}
          styles={styles}
          getLevelBackgroundColor={getLevelBackgroundColor}
          t={t}
        />
      </View>
    </ImageBackground>
  );
}
