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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Asset } from 'expo-asset';
import * as RNIap from 'react-native-iap';
import { useAudioPlayer } from 'expo-audio';
import * as ScreenOrientation from 'expo-screen-orientation';
import Animated, { 
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
import LanguageSelector from '../src/components/LanguageSelector';
import LevelTiles from '../src/components/LevelTiles';

const menuBgSound = require('../src/assets/sounds/background_sounds/menu.mp3');
const BG_IMAGE = require('../src/assets/images/menu-screen.png');
const LEVELS = ['farm', 'forest', 'ocean', 'desert', 'arctic', 'insects', 'savannah', 'jungle', 'birds'];

// Responsive constants
const MIN_TILE_SIZE = 80;
const MAX_TILE_SIZE = 160;
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
    if (width >= 1024) return 5; // Large tablets
    if (width >= 768) return 4;  // Standard tablets
    return 3; // Small tablets/phones
  } else {
    if (width >= 500) return 4; // Large phones in portrait
    if (width >= 400) return 3; // Standard phones
    return 2; // Small phones
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
      marginTop: getResponsiveSpacing(20, scaleFactor),
      marginBottom: 0,
      zIndex: 10000,
      width: '100%',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      position: 'relative',
      paddingHorizontal: getResponsiveSpacing(16, scaleFactor),
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: getResponsiveSpacing(25, scaleFactor),
      marginHorizontal: getResponsiveSpacing(10, scaleFactor),
    },
    portraitLogo: {
      width: Math.min(getResponsiveSpacing(280, scaleFactor), width * 0.7),
      height: Math.min(getResponsiveSpacing(200, scaleFactor), height * 0.25),
      resizeMode: 'contain',
      marginBottom: getResponsiveSpacing(10, scaleFactor),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 10,
    },
    portraitLanguageSelector: {
      marginTop: 0,
      marginBottom: getResponsiveSpacing(10, scaleFactor),
      alignSelf: 'center',
      zIndex: 10001,
    },
    tilesContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingHorizontal: getResponsiveSpacing(20, scaleFactor),
      paddingTop: getResponsiveSpacing(20, scaleFactor),
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
      paddingHorizontal: getResponsiveSpacing(32, scaleFactor),
      paddingTop: getResponsiveSpacing(16, scaleFactor),
      paddingBottom: getResponsiveSpacing(8, scaleFactor),
      backgroundColor: 'transparent',
      zIndex: 2,
      position: 'relative',
    },
    landscapeLogo: {
      width: Math.min(getResponsiveSpacing(280, scaleFactor), width * 0.4),
      height: Math.min(getResponsiveSpacing(120, scaleFactor), height * 0.2),
      resizeMode: 'contain',
      marginBottom: getResponsiveSpacing(2, scaleFactor),
    },
    landscapeLangContainer: {
      position: 'absolute',
      right: getResponsiveSpacing(16, scaleFactor),
      top: getResponsiveSpacing(8, scaleFactor),
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
      marginTop: getResponsiveSpacing(8, scaleFactor),
      marginBottom: getResponsiveSpacing(20, scaleFactor),
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
      backgroundColor: '#FF6B9D',
      paddingHorizontal: getResponsiveSpacing(20, scaleFactor),
      paddingVertical: getResponsiveSpacing(8, scaleFactor),
      borderRadius: getResponsiveSpacing(22, scaleFactor),
      flex: 1,
      maxWidth: isLandscape ? 700 : 700,
      minHeight: getResponsiveSpacing(36, scaleFactor),
      shadowColor: '#FF6B9D',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 6,
      borderWidth: 2,
      borderColor: '#FFB4C6',
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
    restoreButton: {
      paddingHorizontal: getResponsiveSpacing(18, scaleFactor),
      paddingVertical: getResponsiveSpacing(8, scaleFactor),
      backgroundColor: '#87CEEB',
      borderRadius: getResponsiveSpacing(22, scaleFactor),
      borderWidth: 2,
      borderColor: '#B0E0E6',
      flex: 1,
      maxWidth: isLandscape ? 700 : 700,
      minHeight: getResponsiveSpacing(36, scaleFactor),
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#87CEEB',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 5,
      elevation: 5,
    },
    restoreButtonText: {
      color: '#FFFFFF',
      fontSize: getResponsiveFontSize(9, scaleFactor),
      fontWeight: '700',
      textAlign: 'center',
      textShadowColor: 'rgba(0,0,0,0.25)',
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
      backgroundColor: '#FF6B9D',
      paddingHorizontal: getResponsiveSpacing(28, scaleFactor),
      paddingVertical: getResponsiveSpacing(18, scaleFactor),
      borderRadius: getResponsiveSpacing(35, scaleFactor),
      marginBottom: getResponsiveSpacing(15, scaleFactor),
      width: '100%',
      minHeight: getResponsiveSpacing(60, scaleFactor),
      shadowColor: '#FF6B9D',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 12,
      borderWidth: 4,
      borderColor: '#FFB4C6',
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
    modalRestoreButton: {
      marginBottom: getResponsiveSpacing(15, scaleFactor),
      paddingHorizontal: getResponsiveSpacing(20, scaleFactor),
      paddingVertical: getResponsiveSpacing(14, scaleFactor),
      backgroundColor: '#87CEEB',
      borderRadius: getResponsiveSpacing(30, scaleFactor),
      borderWidth: 3,
      borderColor: '#B0E0E6',
      width: '100%',
      minHeight: getResponsiveSpacing(50, scaleFactor),
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#87CEEB',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    modalRestoreButtonText: {
      color: '#FFFFFF',
      fontSize: getResponsiveFontSize(16, scaleFactor),
      fontWeight: '800',
      textAlign: 'center',
      textShadowColor: 'rgba(0,0,0,0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
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
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

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

  // Lock to landscape orientation only
  useEffect(() => {
    const setupOrientation = async () => {
      try {
        // Simple, consistent landscape lock
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        console.log('MenuScreen: Orientation locked to landscape');
      } catch (error) {
        console.warn('MenuScreen: Orientation lock failed:', error);
      }
    };
    
    // Lock immediately
    setupOrientation();
    
    // Set up a listener to re-lock if orientation changes
    const subscription = ScreenOrientation.addOrientationChangeListener((event) => {
      console.log('MenuScreen: Orientation changed to:', event.orientationInfo.orientation);
      // If it's not landscape, force it back
      if (event.orientationInfo.orientation !== ScreenOrientation.Orientation.LANDSCAPE_LEFT && 
          event.orientationInfo.orientation !== ScreenOrientation.Orientation.LANDSCAPE_RIGHT) {
        console.log('MenuScreen: Re-locking to landscape...');
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      }
    });
    
    return () => {
      subscription?.remove();
    };
  }, []);

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
             {t('Unlock All Levels')} ({unlockPrice})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={responsiveStyles.restoreButton}
          onPress={handleRestore}
          disabled={purchaseInProgress}
        >
          <Text style={responsiveStyles.restoreButtonText}> {t('Restore Purchases')} </Text>
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
      >
        <View style={responsiveStyles.modalOverlay}>
          <View style={responsiveStyles.modalContent}>
            <Text style={responsiveStyles.modalTitle}>🔓 {t('Unlock All Levels')} 🔓</Text>
            <Text style={responsiveStyles.modalText}>
              🐾 {t('This level is locked. Unlock all levels to play!')} 🐾
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
                    ✨ {t('Unlock All Levels')} ({unlockPrice}) ✨
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={responsiveStyles.modalRestoreButton}
                  onPress={() => {
                    setShowUnlockModal(false);
                    handleRestore();
                  }}
                  disabled={purchaseInProgress}
                >
                  <Text style={responsiveStyles.modalRestoreButtonText}>🔄 {t('Restore Purchases')} 🔄</Text>
                </TouchableOpacity>
              </>
            )}
            <Pressable
              style={responsiveStyles.modalCloseButton}
              onPress={() => setShowUnlockModal(false)}
            >
              <Text style={responsiveStyles.modalCloseButtonText}>❌ {t('Close')} ❌</Text>
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
            backgroundColor: '#87CEEB',
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

  // sizing logic - Use current dimensions directly
  const currentWidth = width;
  const currentHeight = height;
  const currentIsLandscape = isLandscape;
  
  // Calculate responsive tile size with min/max constraints
  const currentNumColumns = getResponsiveColumns(currentWidth, currentIsLandscape);
  const availableWidth = currentWidth * 0.65;
  const calculatedSize = (availableWidth / currentNumColumns) - (RESPONSIVE_MARGIN * 2);
  const itemSize = Math.max(MIN_TILE_SIZE, Math.min(MAX_TILE_SIZE, calculatedSize));

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Русский' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
    { code: 'it', name: 'Italiano' },
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
      backgroundColor: '#87CEEB',
      width: '100%',
      height: '100%'
    }}>
      <ImageBackground
        key={`landscape-${currentWidth}x${currentHeight}`}
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
              paddingHorizontal: 32,
              paddingTop: 8,
              paddingBottom: 16,
              minHeight: currentHeight * 0.6,
              backgroundColor: 'transparent',
            }}
            showsVerticalScrollIndicator={true}
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
          {renderUnlockModal()}
        </View>
      </ImageBackground>
    </View>
  );
}
