import React, { useEffect, useState, useCallback } from 'react';
import { View, Image, ActivityIndicator, useWindowDimensions, StyleSheet, ImageBackground, ScrollView } from 'react-native';
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
    height: 120,
    resizeMode: 'contain',
  },
  // Portrait: logo above language selector (now column layout)
  portraitHeaderContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 0,
    zIndex: 10000,
    width: '100%',
    flexDirection: 'column', // changed to column for logo above language selector
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
    // Optionally add backgroundColor: 'rgba(255,255,255,0.2)' for visibility
  },
  landscapeTilesGrid: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 8,
    paddingBottom: 16,
    zIndex: 1,
    // Remove flexDirection: 'row', flexWrap: 'wrap' for FlatList
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
  const levels = ['farm', 'forest', 'ocean', 'desert', 'arctic', 'insects', 'savannah', 'jungle', 'birds'];

  // For landscape, use a grid (3 columns), for portrait 3 columns
  const numColumns = 3;

  // Bounded square size calculation
  const margin = 5;
  const portraitSize = (width * 0.9 / 3) - (margin * 2);
  // For landscape, fit 3 columns, but use height for max size
  const maxLandscape = height * 0.4;
  const landscapeSize = (width * 0.65 / numColumns) - (margin * 2);
  const itemSize = isLandscape ? landscapeSize : portraitSize;

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

  const languages = [
    { code: 'en', name: 'English'  },
    { code: 'ru', name: 'Русский' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
    { code: 'it', name: 'Italiano' },
    { code: 'tr', name: 'Türkçe' }
  ];

  // On landscape, logo centered, language selector at top right, then grid of menu tiles, whole screen scrollable
  if (isLandscape) {
    return (
      <ImageBackground
        source={bgUri ? { uri: bgUri } : BG_IMAGE}
        style={{ flex: 1, position: 'relative' }}
        resizeMode="cover"
      >
        <View style={{ flex: 1 }}>
          {/* Language selector at top right */}
          <View style={styles.landscapeLangContainer}>
            <LanguageSelector
              isLandscape={isLandscape}
              t={t}
              lang={lang}
              languages={languages}
              handleLanguageChange={setLang}
            />
          </View>
          {/* Centered logo */}
          <View style={styles.landscapeHeaderContainer}>
            <Image
              source={require('../src/assets/images/game-logo.png')}
              style={styles.landscapeLogo}
              resizeMode="contain"
            />
          </View>
          {/* Grid of menu tiles, scrollable, 3 per row, centered */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              flexGrow: 1,
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingHorizontal: 32,
              paddingTop: 8,
              paddingBottom: 16,
              minHeight: itemSize + margin * 2,
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
          </ScrollView>
        </View>
      </ImageBackground>
    );
  }

  // Portrait: logo at top center, language selector centered below logo, then tiles below
  return (
    <ImageBackground
      source={bgUri ? { uri: bgUri } : BG_IMAGE}
      style={{ flex: 1, position: 'relative' }}
      resizeMode="cover"
    >
      {/* Header: logo at top center, language selector centered below */}
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
          { top: 270, flex: 1 } // 20 (marginTop) + 200 (logo) + 10 (logo marginBottom) + 40 (language selector + margin)
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
