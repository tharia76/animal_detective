import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Image,
  ActivityIndicator,
  useWindowDimensions,
  StyleSheet,
  ImageBackground,
  ScrollView,
  Alert,
  Platform,
  TouchableOpacity,
  Text,
  Modal,
  Pressable,
  PanResponder,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Asset } from 'expo-asset';
import * as RNIap from 'react-native-iap';
import { useAudioPlayer } from 'expo-audio';

import ReAnimated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { useDynamicStyles } from '../src/styles/styles';
import { useLocalization } from '../src/hooks/useLocalization';
import { useForceOrientation } from '../src/hooks/useForceOrientation';
import LanguageSelector from '../src/components/LanguageSelector';
import LevelTiles from '../src/components/LevelTiles';
import { setGlobalVolume } from '../src/components/LevelScreenTemplate';

const menuBgSound = require('../src/assets/sounds/background_sounds/menu.mp3');
const BG_IMAGE = require('../src/assets/images/menu-screen.png');
const LEVELS = ['farm', 'forest', 'ocean', 'desert', 'arctic', 'insects', 'savannah', 'jungle', 'birds'];

// Responsive tile size constants for different orientations
const MIN_TILE_SIZE_LANDSCAPE = 80;
const MAX_TILE_SIZE_LANDSCAPE = 160;
const MIN_TILE_SIZE_PORTRAIT = 100;  // Slightly bigger minimum for portrait
const MAX_TILE_SIZE_PORTRAIT = 140; // Slightly bigger maximum for portrait
const RESPONSIVE_MARGIN = 6;

// Apple App Store product id for unlocking all levels except Farm
const APPLE_PRODUCT_ID = 'animalDetective'; // Replace with your actual product id

const LEVEL_BACKGROUNDS: Record<string, any> = {
  farm: require('../src/assets/images/level-backgrounds/farm.png'),
  forest: require('../src/assets/images/level-backgrounds/forest.png'),
  ocean: require('../src/assets/images/level-backgrounds/ocean.png'),
  desert: require('../src/assets/images/level-backgrounds/desert.png'),
  arctic: require('../src/assets/images/level-backgrounds/arctic.png'),
  insects: require('../src/assets/images/level-backgrounds/insect.png'),
  savannah: require('../src/assets/images/level-backgrounds/savannah.png'),
  jungle: require('../src/assets/images/level-backgrounds/jungle.png'),
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

// Responsive helper functions
const getResponsiveColumns = (width: number, isLandscape: boolean): number => {
  if (isLandscape) {
    if (width >= 1024) return 4; // Large tablets
    if (width >= 768) return 3;  // Standard tablets
    return 3; // Small tablets/phones
  } else {
    if (width >= 600) return 4; // Large phones/small tablets in portrait - more columns for smaller tiles
    if (width >= 400) return 3; // Standard phones - more columns for smaller tiles
    return 3; // Small phones - more columns for smaller tiles
  }
};

const getScaleFactor = (width: number, height: number): number => {
  const baseWidth = 375; // iPhone 6/7/8 width
  const scale = Math.min(width / baseWidth, 1.5); // Cap at 1.5x scaling
  return Math.max(scale, 0.8); // Minimum 0.8x scaling
};

const getResponsiveFontSize = (baseSize: number, scaleFactor: number): number => {
  return Math.round(baseSize * scaleFactor);
};

const getResponsiveSpacing = (baseSpacing: number, scaleFactor: number): number => {
  return Math.round(baseSpacing * scaleFactor);
};

// Create responsive styles
const createResponsiveStyles = (scaleFactor: number, width: number, height: number, isLandscape: boolean) => {
  return StyleSheet.create({
    lockOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: getResponsiveSpacing(25, scaleFactor),
    },
    logo: {
      width: getResponsiveSpacing(280, scaleFactor),
      height: getResponsiveSpacing(120, scaleFactor),
      resizeMode: 'contain',
    },
    portraitHeaderContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: getResponsiveSpacing(15, scaleFactor),
      marginBottom: getResponsiveSpacing(15, scaleFactor),
      zIndex: 10000,
      width: '100%',
      flexDirection: 'column',
      position: 'relative',
      paddingHorizontal: getResponsiveSpacing(25, scaleFactor),
      paddingVertical: getResponsiveSpacing(20, scaleFactor),
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderRadius: getResponsiveSpacing(25, scaleFactor),
      marginHorizontal: 'auto',
      alignSelf: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
    portraitLogo: {
      width: Math.min(getResponsiveSpacing(500, scaleFactor), width * 1.2),
      height: Math.min(getResponsiveSpacing(300, scaleFactor), height * 0.35),
      resizeMode: 'contain',
      marginBottom: getResponsiveSpacing(5, scaleFactor),
      alignSelf: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 10,
    },
    portraitLanguageSelector: {
      marginTop: 0,
      marginBottom: 0,
      alignSelf: 'center',
      zIndex: 10001,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    tilesContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingHorizontal: getResponsiveSpacing(20, scaleFactor),
      paddingTop: getResponsiveSpacing(10, scaleFactor),
      paddingBottom: getResponsiveSpacing(20, scaleFactor),
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
      paddingBottom: getResponsiveSpacing(20, scaleFactor),
    },
    landscapeHeaderContainer: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      paddingHorizontal: getResponsiveSpacing(32, scaleFactor),
      paddingTop: getResponsiveSpacing(16, scaleFactor),
      paddingBottom: getResponsiveSpacing(8, scaleFactor),
      backgroundColor: 'transparent',
      zIndex: 2,
      position: 'relative',
    },
    landscapeLogo: {
      width: Math.min(getResponsiveSpacing(300, scaleFactor), width * 0.9),
      height: Math.min(getResponsiveSpacing(200, scaleFactor), height * 0.3),
      resizeMode: 'cover',
              marginBottom: getResponsiveSpacing(0, scaleFactor),
    },
    landscapeLangContainer: {
      position: 'absolute',
      right: getResponsiveSpacing(16, scaleFactor),
      top: getResponsiveSpacing(40, scaleFactor),
      zIndex: 10001,
    },
    landscapeTilesGrid: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: getResponsiveSpacing(32, scaleFactor),
      paddingTop: getResponsiveSpacing(8, scaleFactor),
      paddingBottom: getResponsiveSpacing(16, scaleFactor),
      zIndex: 1,
    },
    unlockButtonsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: getResponsiveSpacing(0, scaleFactor),
      marginBottom: getResponsiveSpacing(5, scaleFactor),
      paddingHorizontal: getResponsiveSpacing(2, scaleFactor),
      paddingVertical: getResponsiveSpacing(2, scaleFactor),
      gap: getResponsiveSpacing(12, scaleFactor),
      width: '100%',
      maxWidth: isLandscape ? 600 : 420,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderRadius: getResponsiveSpacing(22, scaleFactor),
      marginHorizontal: getResponsiveSpacing(20, scaleFactor),
    },
    unlockButton: {
      backgroundColor: '#4CAF50',
      paddingHorizontal: getResponsiveSpacing(20, scaleFactor),
      paddingVertical: getResponsiveSpacing(8, scaleFactor),
      borderRadius: getResponsiveSpacing(22, scaleFactor),
      flex: 1,
      maxWidth: isLandscape ? 700 : 700,
      minHeight: getResponsiveSpacing(36, scaleFactor),
      shadowColor: '#4CAF50',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 6,
      borderWidth: 2,
      borderColor: '#81C784',
      justifyContent: 'center',
      alignItems: 'center',
    },
    unlockButtonText: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: getResponsiveFontSize(9, scaleFactor),
      textAlign: 'center',
      letterSpacing: 0.3,
      textShadowColor: 'rgba(0,0,0,0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(139, 69, 19, 0.4)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 100000,
      paddingHorizontal: getResponsiveSpacing(20, scaleFactor),
    },
    modalContent: {
      backgroundColor: '#FFF8DC',
      borderRadius: getResponsiveSpacing(35, scaleFactor),
      padding: getResponsiveSpacing(35, scaleFactor),
      alignItems: 'center',
      width: '100%',
      maxWidth: Math.min(400, width * 0.9),
      shadowColor: '#FF6B9D',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 15,
      elevation: 15,
      borderWidth: 4,
      borderColor: '#FFB4C6',
    },
    modalTitle: {
      fontSize: getResponsiveFontSize(26, scaleFactor),
      fontWeight: '900',
      marginBottom: getResponsiveSpacing(15, scaleFactor),
      color: '#FF6B9D',
      textAlign: 'center',
      textShadowColor: 'rgba(0,0,0,0.2)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 3,
    },
    modalText: {
      fontSize: getResponsiveFontSize(18, scaleFactor),
      color: '#8B4513',
      marginBottom: getResponsiveSpacing(25, scaleFactor),
      textAlign: 'center',
      lineHeight: getResponsiveFontSize(24, scaleFactor),
      fontWeight: '600',
    },
    modalUnlockButton: {
      backgroundColor: '#4CAF50',
      paddingHorizontal: getResponsiveSpacing(28, scaleFactor),
      paddingVertical: getResponsiveSpacing(18, scaleFactor),
      borderRadius: getResponsiveSpacing(35, scaleFactor),
      marginBottom: getResponsiveSpacing(15, scaleFactor),
      width: '100%',
      minHeight: getResponsiveSpacing(60, scaleFactor),
      shadowColor: '#4CAF50',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 12,
      borderWidth: 4,
      borderColor: '#81C784',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalUnlockButtonText: {
      color: '#FFFFFF',
      fontWeight: '900',
      fontSize: getResponsiveFontSize(18, scaleFactor),
      textAlign: 'center',
      letterSpacing: 0.8,
      textShadowColor: 'rgba(0,0,0,0.4)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    modalCloseButton: {
      marginTop: getResponsiveSpacing(10, scaleFactor),
      padding: getResponsiveSpacing(12, scaleFactor),
      minHeight: getResponsiveSpacing(50, scaleFactor),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 192, 203, 0.3)',
      borderRadius: getResponsiveSpacing(25, scaleFactor),
    },
    modalCloseButtonText: {
      color: '#8B4513',
      fontSize: getResponsiveFontSize(16, scaleFactor),
      textAlign: 'center',
      fontWeight: '700',
    },
  });
};

const lockedLevels = LEVELS.filter(l => l !== 'farm');

export default function MenuScreen({ onSelectLevel, backgroundImageUri }) {
  // IMPORTANT: All hooks must be at the top level and in consistent order
  const navigation = useNavigation();
  const { t, lang, setLang } = useLocalization();
  const dynStyles = useDynamicStyles();
  const { width, height, isLandscape } = useForceOrientation(); // Use forced landscape dimensions

  // Calculate responsive values
  const scaleFactor = getScaleFactor(width, height);
  const numColumns = getResponsiveColumns(width, isLandscape);

  // Use dimensions directly for more stable layouts
  const [layoutReady, setLayoutReady] = useState(false);

  const [bgReady, setBgReady] = useState(false);
  const [bgUri, setBgUri] = useState<string | null>(null);
  const [imgsReady, setImgsReady] = useState(false);

  // Payment state
  const [iapInitialized, setIapInitialized] = useState(false);

  // Settings modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [volume, setVolume] = useState(0.8); // Default volume at 80%
  const sliderWidth = useRef(200);

  // Update menu background music volume when volume changes
  useEffect(() => {
    if (playerRef.current) {
      try {
        playerRef.current.volume = volume;
      } catch (e) {
        console.warn('Failed to set menu music volume:', e);
      }
    }
    // Also update global volume for all levels
    setGlobalVolume(volume);
  }, [volume]);

  // Slidable segments handler
  const handleSliderInteraction = useCallback((event) => {
    const { locationX } = event.nativeEvent;
    const ratio = Math.max(0, Math.min(1, locationX / sliderWidth.current));
    // Snap to nearest 5% increment (20 segments)
    const snappedVolume = Math.round(ratio * 19) / 19;
    setVolume(snappedVolume);
  }, []);

  // Create slidable segments
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        handleSliderInteraction(event);
      },
      onPanResponderMove: (event) => {
        handleSliderInteraction(event);
      },
      onPanResponderRelease: () => {
        // Nothing needed on release
      },
    })
  ).current;
  const [products, setProducts] = useState<RNIap.Product[]>([]);
  const [purchaseInProgress, setPurchaseInProgress] = useState(false);
  const [unlocked, setUnlocked] = useState<boolean>(false);

  // Modal state for locked level
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  // Use a ref to always get the latest player instance
  const playerRef = useRef<any>(null);
  const player = useAudioPlayer(menuBgSound);

  // Create responsive styles
  const responsiveStyles = createResponsiveStyles(scaleFactor, width, height, isLandscape);

  // Handle layout ready state to prevent black screen during rotation
  useEffect(() => {
    const timer = setTimeout(() => {
      setLayoutReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [width, height, isLandscape]);

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
                file = require('../src/assets/images/level-backgrounds/ocean.png');
                break;
              case 'desert':
                file = require('../src/assets/images/level-backgrounds/desert.png');
                break;
              case 'arctic':
                file = require('../src/assets/images/level-backgrounds/arctic.png');
                break;
              case 'savannah':
                file = require('../src/assets/images/level-backgrounds/savannah.png');
                break;
              case 'jungle':
                file = require('../src/assets/images/level-backgrounds/jungle.png');
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

  // IAP: Initialize and get products
  useEffect(() => {
    let purchaseUpdateSubscription: any;
    let purchaseErrorSubscription: any;

    async function initIAP() {
      if (Platform.OS !== 'ios') {
        setIapInitialized(true);
        return;
      }
      try {
        await RNIap.initConnection();
        setIapInitialized(true);

        // Get product info
        const products = await RNIap.getProducts({ skus: [APPLE_PRODUCT_ID] });
        setProducts(products);

        // Check if already purchased
        const purchases = await RNIap.getAvailablePurchases();
        const hasUnlock = purchases.some(
          (purchase) =>
            purchase.productId === APPLE_PRODUCT_ID ||
            purchase.productId === APPLE_PRODUCT_ID.replace('.unlockall', '.unlockall') // fallback
        );
        if (hasUnlock) setUnlocked(true);

        // Listen for purchase updates
        purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase) => {
          const receipt = purchase.transactionReceipt;
          if (receipt) {
            try {
              await RNIap.finishTransaction({ purchase, isConsumable: false });
              if (purchase.productId === APPLE_PRODUCT_ID) {
                setUnlocked(true);
                Alert.alert(t('Thank you!'), t('All levels are now unlocked.'));
              }
            } catch (err) {
              console.warn('finishTransaction error', err);
            }
          }
        });

        purchaseErrorSubscription = RNIap.purchaseErrorListener((error) => {
          setPurchaseInProgress(false);
          Alert.alert(t('Purchase Error'), error.message || t('Something went wrong.'));
        });
      } catch (e) {
        setIapInitialized(true);
        // Alert.alert(t('Error'), t('Could not connect to App Store.'));
      }
    }

    initIAP();

    return () => {
      try {
        purchaseUpdateSubscription && purchaseUpdateSubscription.remove();
        purchaseErrorSubscription && purchaseErrorSubscription.remove();
        RNIap.endConnection();
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Restore purchases
  const handleRestore = useCallback(async () => {
    setPurchaseInProgress(true);
    try {
      const purchases = await RNIap.getAvailablePurchases();
      const hasUnlock = purchases.some(
        (purchase) =>
          purchase.productId === APPLE_PRODUCT_ID ||
          purchase.productId === APPLE_PRODUCT_ID.replace('.unlockall', '.unlockall')
      );
      if (hasUnlock) {
        setUnlocked(true);
        Alert.alert(t('Restored'), t('All levels are now unlocked.'));
      } else {
        Alert.alert(t('No Purchases'), t('No previous purchases found.'));
      }
    } catch (e) {
      // Alert.alert(t('Error'), t('Could not restore purchases.'));
    }
    setPurchaseInProgress(false);
  }, [t]);

  // Purchase handler
  const handleUnlock = useCallback(async () => {
    if (purchaseInProgress) return;
    setPurchaseInProgress(true);
    try {
      await RNIap.requestPurchase({ sku: APPLE_PRODUCT_ID });

    } catch (e) {
      // Alert.alert(t('Error'), t('Could not complete purchase.'));
    }
    setPurchaseInProgress(false);
  }, [purchaseInProgress, t]);

  // also stop when you select a level
  const handleSelect = useCallback(
    (level, isLocked) => {
      stopAndUnload();
      if (!isLocked) {
        // Defensive: ensure onSelectLevel is a function
        if (typeof onSelectLevel === 'function') {
          onSelectLevel(level);
        }
      } else {
        // Show modal for locked level
        setShowUnlockModal(true);
      }
    },
    [onSelectLevel, stopAndUnload]
  );

  // Get price string for unlock button
  const unlockPrice =
    products && products.length > 0 && products[0].localizedPrice
      ? products[0].localizedPrice
      : '$5.99';

  // Render unlock/restore buttons
  const renderUnlockButtons = () => {
    if (unlocked || Platform.OS !== 'ios') return null;
    return (
      <View style={responsiveStyles.unlockButtonsContainer}>
        <TouchableOpacity
          style={responsiveStyles.unlockButton}
          onPress={handleUnlock}
          disabled={purchaseInProgress}
        >
          <Text style={responsiveStyles.unlockButtonText}>
             {t('unlockAllLevels')} ({unlockPrice})
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Modal for locked level
  const renderUnlockModal = () => {
    if (!showUnlockModal) return null;
    return (
      <Modal
        visible={showUnlockModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowUnlockModal(false)}
        supportedOrientations={['landscape', 'landscape-left', 'landscape-right']}
      >
        <View style={responsiveStyles.modalOverlay}>
          <View style={responsiveStyles.modalContent}>
            <Text style={responsiveStyles.modalTitle}>🔓 {t('unlockAllLevelsToPlay')} 🔓</Text>
                          <Text style={responsiveStyles.modalText}>
                🐾 {t('thisLevelIsLocked')} 🐾
              </Text>
            {Platform.OS === 'ios' && !unlocked && (
              <>
                <TouchableOpacity
                  style={responsiveStyles.modalUnlockButton}
                  onPress={() => {
                    setShowUnlockModal(false);
                    handleUnlock();
                  }}
                  disabled={purchaseInProgress}
                >
                  <Text style={responsiveStyles.modalUnlockButtonText}>
                    ✨ {t('unlockAllLevels')} ({unlockPrice}) ✨
                  </Text>
                </TouchableOpacity>
              </>
            )}
            <Pressable
              style={responsiveStyles.modalCloseButton}
              onPress={() => setShowUnlockModal(false)}
            >
              <Text style={responsiveStyles.modalCloseButtonText}>❌ {t('close')} ❌</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  };

  if (!bgReady || !imgsReady || !iapInitialized || !layoutReady) {
    return (
      <View
        style={[
          dynStyles.menuContainer,
          { 
            justifyContent: 'center', 
            alignItems: 'center', 
            backgroundColor: '#ffdab9',
            flex: 1,
            width: '100%',
            height: '100%'
          },
        ]}
      >
        <ActivityIndicator size="large" color="orange" />
      </View>
    );
  }

  // sizing logic - Force landscape dimensions
  const currentWidth = width;
  const currentHeight = height;
  const currentIsLandscape = true; // Always force landscape layout
  
  // Calculate responsive tile size with min/max constraints
  const currentNumColumns = getResponsiveColumns(currentWidth, currentIsLandscape);
  const availableWidth = currentIsLandscape 
    ? currentWidth * 0.75  // More space in landscape
    : currentWidth * 0.70; // Less space in portrait for smaller tiles
  const calculatedSize = (availableWidth / currentNumColumns) - (RESPONSIVE_MARGIN * 2);
  
  // Use different tile size constraints based on orientation
  const minTileSize = currentIsLandscape ? MIN_TILE_SIZE_LANDSCAPE : MIN_TILE_SIZE_PORTRAIT;
  const maxTileSize = currentIsLandscape ? MAX_TILE_SIZE_LANDSCAPE : MAX_TILE_SIZE_PORTRAIT;
  const itemSize = Math.max(minTileSize, Math.min(maxTileSize, calculatedSize));

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Русский' },
    { code: 'tr', name: 'Türkçe' },
  ];

  // Determine locked state for each level
  const getIsLocked = (level: string) => {
    if (level === 'farm') return false;
    if (level === 'arctic') return false;
    if (level === 'desert') return false;
    if (level === 'savannah') return false;
    if (level === 'jungle') return false;
    if (level === 'birds') return false;
    if (level === 'insects') return false;
    if (level === 'forest') return false;
    if (level === 'ocean') return false;

    return !unlocked;
  };

  return (
    <View style={{
      flex: 1, 
      backgroundColor: '#ffdab9',
      width: '100%',
      height: '100%'
    }}>
      <ImageBackground
        key={`${currentIsLandscape ? 'landscape' : 'portrait'}-${currentWidth}x${currentHeight}`}
        source={
          backgroundImageUri
            ? { uri: backgroundImageUri }
            : bgUri
            ? { uri: bgUri }
            : BG_IMAGE
        }
        style={{ 
          flex: 1, 
          backgroundColor: 'transparent',
          width: '100%',
          height: '100%'
        }}
        resizeMode="cover"
      >
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
          {currentIsLandscape ? (
            // LANDSCAPE LAYOUT
            <>
              {/* Settings Button - Top Right */}
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  top: getResponsiveSpacing(20, scaleFactor),
                  right: getResponsiveSpacing(20, scaleFactor),
                  zIndex: 10002,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: 25,
                  padding: getResponsiveSpacing(10, scaleFactor),
                  elevation: 3,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3,
                }}
                onPress={() => setShowSettingsModal(true)}
              >
                <Text style={{ fontSize: 24 }}>⚙️</Text>
              </TouchableOpacity>

              <View style={responsiveStyles.landscapeLangContainer}>
                <LanguageSelector
                  isLandscape={currentIsLandscape}
                  t={t}
                  lang={lang}
                  languages={languages}
                  handleLanguageChange={setLang}
                />
              </View>
              <View style={responsiveStyles.landscapeHeaderContainer}>
                <Image
                  source={require('../src/assets/images/game-logo.png')}
                  style={responsiveStyles.landscapeLogo}
                  resizeMode="contain"
                />
              </View>
              <ScrollView
                style={{ flex: 1, backgroundColor: 'transparent' }}
                contentContainerStyle={{
                  flexGrow: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: getResponsiveSpacing(32, scaleFactor),
                  paddingTop: getResponsiveSpacing(8, scaleFactor),
                  paddingBottom: getResponsiveSpacing(16, scaleFactor),
                  minHeight: currentHeight * 0.6,
                  backgroundColor: 'transparent',
                }}
                showsVerticalScrollIndicator={false}
              >
                <View
                  style={{
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'transparent',
                  }}
                >
                  {renderUnlockButtons()}
                  <LevelTiles
                    key={`landscape-tiles-${currentWidth}x${currentHeight}-${itemSize}`}
                    levels={LEVELS}
                    numColumns={currentNumColumns}
                    isLandscape={currentIsLandscape}
                    itemSize={itemSize}
                    margin={RESPONSIVE_MARGIN}
                    LEVEL_BACKGROUNDS={LEVEL_BACKGROUNDS}
                    handleLevelSelect={(level: string) => handleSelect(level, getIsLocked(level))}
                    styles={responsiveStyles}
                    getLevelBackgroundColor={getLevelBackgroundColor}
                    t={t}
                    getIsLocked={getIsLocked}
                  />
                </View>
              </ScrollView>
            </>
          ) : (
            // PORTRAIT LAYOUT
            <>
              {/* Settings Button - Top Right */}
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  top: getResponsiveSpacing(20, scaleFactor),
                  right: getResponsiveSpacing(20, scaleFactor),
                  zIndex: 10002,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: 25,
                  padding: getResponsiveSpacing(10, scaleFactor),
                  elevation: 3,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3,
                }}
                onPress={() => setShowSettingsModal(true)}
              >
                <Text style={{ fontSize: 24 }}>⚙️</Text>
              </TouchableOpacity>

              <ScrollView
                style={responsiveStyles.scrollView}
                contentContainerStyle={responsiveStyles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Header with logo and language selector */}
                <View style={responsiveStyles.portraitHeaderContainer}>
                  <Image
                    source={require('../src/assets/images/game-logo.png')}
                    style={responsiveStyles.portraitLogo}
                    resizeMode="contain"
                  />
                  <View style={responsiveStyles.portraitLanguageSelector}>
                    <LanguageSelector
                      isLandscape={currentIsLandscape}
                      t={t}
                      lang={lang}
                      languages={languages}
                      handleLanguageChange={setLang}
                    />
                  </View>
                </View>

                {/* Tiles container */}
                <View style={responsiveStyles.tilesContainer}>
                  {renderUnlockButtons()}
                  <LevelTiles
                    key={`portrait-tiles-${currentWidth}x${currentHeight}-${itemSize}`}
                    levels={LEVELS}
                    numColumns={currentNumColumns}
                    isLandscape={currentIsLandscape}
                    itemSize={itemSize}
                    margin={RESPONSIVE_MARGIN}
                    LEVEL_BACKGROUNDS={LEVEL_BACKGROUNDS}
                    handleLevelSelect={(level: string) => handleSelect(level, getIsLocked(level))}
                    styles={responsiveStyles}
                    getLevelBackgroundColor={getLevelBackgroundColor}
                    t={t}
                    getIsLocked={getIsLocked}
                  />
                </View>
              </ScrollView>
            </>
          )}
          {renderUnlockModal()}

          {/* Settings Modal */}
          <Modal
            visible={showSettingsModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowSettingsModal(false)}
          >
            <View style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <View style={{
                backgroundColor: 'white',
                borderRadius: 20,
                padding: getResponsiveSpacing(30, scaleFactor),
                margin: getResponsiveSpacing(20, scaleFactor),
                width: '80%',
                maxWidth: 400,
                elevation: 5,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
              }}>
                {/* Settings Header */}
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: getResponsiveSpacing(20, scaleFactor),
                }}>
                  <Text style={{
                    fontSize: getResponsiveFontSize(24, scaleFactor),
                    fontWeight: 'bold',
                    color: '#612915',
                  }}>
                    {t('settings') || 'Settings'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowSettingsModal(false)}
                    style={{
                      padding: 5,
                    }}
                  >
                    <Text style={{ fontSize: 24, color: '#666' }}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Language Selector */}
                <View style={{ marginBottom: getResponsiveSpacing(50, scaleFactor), }}>
                  <Text style={{
                    fontSize: getResponsiveFontSize(14, scaleFactor),
                    fontWeight: 'bold',
                    color: '#612915',
                    marginBottom: getResponsiveSpacing(10, scaleFactor),
                  }}>
                    {t('language') || 'Language'}
                  </Text>
                  <LanguageSelector
                    
                    isLandscape={false}
                    t={t}
                    lang={lang}
                    languages={languages}
                    handleLanguageChange={setLang}
                  />
                </View>

                                {/* Volume Control */}
                <View style={{ marginBottom: getResponsiveSpacing(20, scaleFactor) }}>
                  <Text style={{
                    fontSize: getResponsiveFontSize(18, scaleFactor),
                    fontWeight: 'bold',
                    color: '#612915',
                    marginBottom: getResponsiveSpacing(15, scaleFactor),
                  }}>
                    {t('volume') || 'Volume'}: {Math.round(volume * 100)}%
                  </Text>
                  
                  {/* Ultra Simple Clickable Slider */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: getResponsiveSpacing(5, scaleFactor),
                  }}>
                    <Text style={{ marginRight: 10, fontSize: 16 }}>🔈</Text>
                    
                    {/* Slidable Segments Bar */}
                    <View style={{
                      flex: 1,
                      height: 60, // Increased from 40 to 60
                      justifyContent: 'center',
                      marginHorizontal: getResponsiveSpacing(10, scaleFactor),
                      paddingVertical: getResponsiveSpacing(10, scaleFactor), // Added padding for better touch area
                    }}
                    onLayout={(event) => {
                      sliderWidth.current = event.nativeEvent.layout.width;
                    }}
                    >
                      <View style={{
                        height: 32, // Increased from 20 to 32
                        backgroundColor: '#E0E0E0',
                        borderRadius: 16, // Adjusted radius for new height
                        flexDirection: 'row',
                        overflow: 'hidden',
                        elevation: 2, // Added shadow for depth
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.2,
                        shadowRadius: 2,
                      }}
                      {...panResponder.panHandlers}
                      >
                        {Array.from({ length: 20 }, (_, i) => {
                          const segmentValue = i / 19; // 0 to 1 in 20 steps
                          const isActive = segmentValue <= volume;
                          return (
                            <TouchableOpacity
                              key={i}
                              style={{
                                flex: 1,
                                height: '100%',
                                backgroundColor: isActive ? '#FF8C00' : 'transparent',
                                borderRightWidth: i < 19 ? 1 : 0,
                                borderRightColor: 'rgba(255,255,255,0.3)',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                              onPress={() => setVolume(segmentValue)}
                            >
                              <View style={{
                                width: 3, // Increased from 2 to 3
                                height: '70%', // Increased from 60% to 70%
                                backgroundColor: isActive ? 'white' : '#999',
                                borderRadius: 2, // Increased radius
                              }} />
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                    
                    <Text style={{ marginLeft: 10, fontSize: 16 }}>🔊</Text>
                  </View>
                  
                  {/* Quick Volume Buttons */}
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: getResponsiveSpacing(15, scaleFactor),
                  }}>
                    <TouchableOpacity
                      onPress={() => setVolume(0)}
                      style={{
                        backgroundColor: '#E0E0E0',
                        borderRadius: 15,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                      }}
                    >
                      <Text style={{ fontSize: 12, color: '#666' }}>Mute</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setVolume(0.5)}
                      style={{
                        backgroundColor: '#FFE4B5',
                        borderRadius: 15,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                      }}
                    >
                      <Text style={{ fontSize: 12, color: '#666' }}>50%</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setVolume(1.0)}
                      style={{
                        backgroundColor: '#FF8C00',
                        borderRadius: 15,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                      }}
                    >
                      <Text style={{ fontSize: 12, color: 'white' }}>Max</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Close Button */}
                <TouchableOpacity
                  onPress={() => setShowSettingsModal(false)}
                  style={{
                    backgroundColor: '#73c2b9',
                    borderRadius: 15,
                    padding: getResponsiveSpacing(12, scaleFactor),
                    alignItems: 'center',
                    marginTop: getResponsiveSpacing(10, scaleFactor),
                  }}
                >
                  <Text style={{
                    color: 'white',
                    fontSize: getResponsiveFontSize(16, scaleFactor),
                    fontWeight: 'bold',
                  }}>
                    {t('done') || 'Done'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </ImageBackground>
    </View>
  );
}
