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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Asset } from 'expo-asset';
import * as RNIap from 'react-native-iap';
import { useAudioPlayer } from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import ReAnimated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
  withRepeat,
  withSequence
} from 'react-native-reanimated';
import { useDynamicStyles } from '../src/styles/styles';
import { useLocalization } from '../src/hooks/useLocalization';
import { useForceOrientation } from '../src/hooks/useForceOrientation';
import LanguageSelector from '../src/components/LanguageSelector';
import LevelTiles from '../src/components/LevelTiles';
import AnimatedFireflies from '../src/components/AnimatedFireflies';
import { setGlobalVolume } from '../src/components/LevelScreenTemplate';
import { useLevelCompletion } from '../src/hooks/useLevelCompletion';

const menuBgSound = require('../src/assets/sounds/background_sounds/menu.mp3');
const BG_IMAGE = require('../src/assets/images/menu-screen.png');
const LEVELS = ['farm', 'forest', 'ocean', 'desert', 'arctic', 'insects', 'savannah', 'jungle', 'birds'];

// Responsive tile size constants for different orientations
const MIN_TILE_SIZE_LANDSCAPE = 120;
const MAX_TILE_SIZE_LANDSCAPE = 200;
const MIN_TILE_SIZE_PORTRAIT = 140;  // Slightly bigger minimum for portrait
const MAX_TILE_SIZE_PORTRAIT = 180; // Slightly bigger maximum for portrait
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
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: getResponsiveSpacing(25, scaleFactor),
      zIndex: 10,
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
      flexDirection: 'row',
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
      gap: 0,
    },
    portraitLogo: {
      width: Math.min(getResponsiveSpacing(405, scaleFactor), width * 0.81),
      height: Math.min(getResponsiveSpacing(243, scaleFactor), height * 0.3375),
      resizeMode: 'contain',
      marginBottom: 0,
      marginTop: 0,
      marginLeft: -250,
      marginRight: -20,
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
      flexDirection: 'row',
      paddingHorizontal: getResponsiveSpacing(32, scaleFactor),
      paddingTop: getResponsiveSpacing(16, scaleFactor),
      paddingBottom: getResponsiveSpacing(8, scaleFactor),
      backgroundColor: 'transparent',
      zIndex: 2,
      position: 'relative',
      gap: 0,
    },
    landscapeLogo: {
      width: Math.min(getResponsiveSpacing(338, scaleFactor), width * 0.675),
      height: Math.min(getResponsiveSpacing(203, scaleFactor), height * 0.3375),
      resizeMode: 'contain',
      marginBottom: 0,
      marginTop: 0,
      marginLeft: -150,
      marginRight: 0,
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
      paddingHorizontal: getResponsiveSpacing(5, scaleFactor),
      paddingTop: getResponsiveSpacing(8, scaleFactor),
      paddingBottom: getResponsiveSpacing(16, scaleFactor),
      zIndex: 1,
    },
    unlockButtonsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 0,
      marginBottom: 0,
      paddingHorizontal: 0,
      paddingVertical: 0,
      gap: 0,
      backgroundColor: 'transparent',
      borderRadius: 0,
      marginHorizontal: 0,
      marginLeft: isLandscape && width >= 900 ? -80 : -120, // Less negative margin
      marginRight: 0,
    },
    unlockButton: {
      backgroundColor: '#4CAF50',
      paddingHorizontal: getResponsiveSpacing(isLandscape && width >= 900 ? 12 : 8, scaleFactor), // Reduced padding
      paddingVertical: getResponsiveSpacing(isLandscape && width >= 900 ? 8 : 6, scaleFactor), // Reduced padding
      borderRadius: getResponsiveSpacing(isLandscape && width >= 900 ? 20 : 15, scaleFactor), // Smaller border radius
      maxWidth: isLandscape ? (width >= 900 ? 200 : 160) : 140, // Much smaller max width
      minHeight: getResponsiveSpacing(isLandscape && width >= 900 ? 36 : 28, scaleFactor), // Smaller height
      shadowColor: '#4CAF50',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 6,
      justifyContent: 'center',
      alignItems: 'center',
    },
    unlockButtonText: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: getResponsiveFontSize(isLandscape && width >= 900 ? 14 : 9, scaleFactor), // Bigger font on tablet landscape
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

interface MenuScreenProps {
  onSelectLevel: (level: string) => void;
  backgroundImageUri?: string | null;
}

export default function MenuScreen({ onSelectLevel, backgroundImageUri }: MenuScreenProps) {
  const { isLevelCompleted, unmarkLevelCompleted } = useLevelCompletion();
  // IMPORTANT: All hooks must be at the top level and in consistent order
  const navigation = useNavigation();
  const { t, lang, setLang } = useLocalization();
  const dynStyles = useDynamicStyles();
  const { width, height, isLandscape } = useForceOrientation(); // Use forced landscape dimensions

  // Calculate responsive values
  const scaleFactor = getScaleFactor(width, height);
  const numColumns = getResponsiveColumns(width, isLandscape);

  // Animated gradient values
  const gradientPosition = useSharedValue(0);
  const pulseScale = useSharedValue(1);

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
  const [volumeLoaded, setVolumeLoaded] = useState(false); // Track if volume is loaded from storage
  const sliderWidth = useRef(200);

  // Volume storage functions
  const saveVolumeToStorage = useCallback(async (volumeValue: number) => {
    try {
      await AsyncStorage.setItem('gameVolume', volumeValue.toString());
    } catch (error) {
      console.warn('Error saving volume to storage:', error);
    }
  }, []);

  const loadVolumeFromStorage = useCallback(async () => {
    try {
      const savedVolume = await AsyncStorage.getItem('gameVolume');
      if (savedVolume !== null) {
        const volumeValue = parseFloat(savedVolume);
        if (!isNaN(volumeValue) && volumeValue >= 0 && volumeValue <= 1) {
          setVolume(volumeValue);
          setGlobalVolume(volumeValue); // Apply to global system immediately
        }
      }
    } catch (error) {
      console.warn('Error loading volume from storage:', error);
    } finally {
      setVolumeLoaded(true); // Mark as loaded regardless of success/failure
    }
  }, []);

  // Safe volume setter with bounds checking
  const setVolumeSafely = useCallback((newVolume: number) => {
    try {
      const clampedVolume = Math.max(0, Math.min(1, newVolume));
      setVolume(clampedVolume);
      setGlobalVolume(clampedVolume); // Apply globally immediately
      saveVolumeToStorage(clampedVolume); // Save to persistent storage
    } catch (error) {
      console.warn('Error setting volume:', error);
    }
  }, [saveVolumeToStorage]);

  // Improved gesture handler for volume slider
  const handleVolumeGesture = useCallback((event) => {
    try {
      const { locationX } = event.nativeEvent;
      if (!sliderWidth.current || sliderWidth.current <= 0) {
        return;
      }
      
      // Calculate volume based on touch position
      const ratio = Math.max(0, Math.min(1, locationX / sliderWidth.current));
      // Snap to 10% increments to match our 10 segments
      const snappedVolume = Math.round(ratio * 10) / 10;
      setVolumeSafely(snappedVolume);
    } catch (error) {
      console.warn('Error in volume gesture:', error);
    }
  }, [setVolumeSafely]);

  // Create gesture responder
  const volumePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: handleVolumeGesture,
      onPanResponderMove: handleVolumeGesture,
      onPanResponderRelease: () => {
        // Optional: Add haptic feedback here
      },
    })
  ).current;

  // Load volume from storage on app start
  useEffect(() => {
    loadVolumeFromStorage();
  }, [loadVolumeFromStorage]);

  // Update menu background music volume when volume changes (only after volume is loaded)
  useEffect(() => {
    if (!volumeLoaded) return; // Don't apply until volume is loaded from storage
    
    if (playerRef.current) {
      try {
        playerRef.current.volume = volume;
      } catch (e) {
        console.warn('Failed to set menu music volume:', e);
      }
    }
    // Global volume is set in setVolumeSafely, but ensure it's set here too for direct volume changes
    setGlobalVolume(volume);
  }, [volume, volumeLoaded]);


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

  // Animated styles for gradient buttons with pulse
  const animatedGradientStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
    };
  });

  // Get gradient start/end positions based on animation
  const getGradientPositions = () => {
    const progress = gradientPosition.value;
    return {
      start: { x: progress, y: 0 },
      end: { x: 1 - progress, y: 1 },
    };
  };

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

  // Initialize gradient animations
  useEffect(() => {
    // Continuous gradient position animation
    gradientPosition.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000 }),
        withTiming(0, { duration: 3000 })
      ),
      -1,
      false
    );

    // Pulse animation
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      false
    );
  }, []);

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

  // Handle toggling level completion status
  const handleToggleCompletion = useCallback(
    async (level: string, isCompleted: boolean) => {
      try {
        if (!isCompleted) {
          // Unmark as completed
          await unmarkLevelCompleted(level);
        }
        // Note: We don't mark as completed here, that only happens when the congrats modal shows
      } catch (error) {
        console.warn('Error toggling level completion:', error);
      }
    },
    [unmarkLevelCompleted]
  );

  // also stop when you select a level
  const handleSelect = useCallback(
    (level, isLocked) => {
      stopAndUnload();
      // Always allow navigation regardless of locked state (visual only)
      if (typeof onSelectLevel === 'function') {
        onSelectLevel(level);
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
    
    // Detect landscape mode where we want vertical button layout
    const isPhoneLandscape = isLandscape; // Use landscape orientation regardless of device size
    
    return (
      <View style={responsiveStyles.unlockButtonsContainer}>
        <ReAnimated.View style={animatedGradientStyle}>
          <TouchableOpacity
            style={[responsiveStyles.unlockButton, { backgroundColor: 'transparent' }]}
            onPress={handleUnlock}
            disabled={purchaseInProgress}
          >
            <LinearGradient
              colors={['#4CAF50', '#66BB6A', '#FF8C00', '#FFA500', '#66BB6A', '#4CAF50']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: getResponsiveSpacing(isLandscape && width >= 900 ? 30 : 22, scaleFactor),
              }}
            />
            {isPhoneLandscape ? (
              // Landscape: Stack icon and text vertically, centered
              <View style={{ alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                <Ionicons 
                  name="lock-open" 
                  size={responsiveStyles.unlockButtonText.fontSize + 2} 
                  color="#FFFFFF" 
                />
                <Text style={[responsiveStyles.unlockButtonText, { marginTop: 2, fontSize: responsiveStyles.unlockButtonText.fontSize - 1, textShadowColor: 'rgba(0,0,0,0.7)', textShadowRadius: 3 }]}>
                  {t('unlockAllLevels')} ({unlockPrice})
                </Text>
              </View>
            ) : (
              // Other orientations: Keep original horizontal layout
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, zIndex: 1 }}>
                <Ionicons 
                  name="lock-open" 
                  size={responsiveStyles.unlockButtonText.fontSize} 
                  color="#FFFFFF" 
                />
                <Text style={[responsiveStyles.unlockButtonText, { textShadowColor: 'rgba(0,0,0,0.7)', textShadowRadius: 3 }]}>
                  {t('unlockAllLevels')} ({unlockPrice})
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </ReAnimated.View>
      </View>
    );
  };

  // Modal for locked level
  const renderUnlockModal = () => {
    if (!showUnlockModal) return null;
    
    // Detect landscape mode where we want vertical button layout
    const isPhoneLandscape = isLandscape; // Use landscape orientation regardless of device size
    
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
                <ReAnimated.View style={animatedGradientStyle}>
                  <TouchableOpacity
                    style={[responsiveStyles.modalUnlockButton, { backgroundColor: 'transparent' }]}
                    onPress={() => {
                      setShowUnlockModal(false);
                      handleUnlock();
                    }}
                    disabled={purchaseInProgress}
                  >
                    <LinearGradient
                      colors={['#4CAF50', '#66BB6A', '#FF8C00', '#FFA500', '#66BB6A', '#4CAF50']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: getResponsiveSpacing(35, scaleFactor),
                      }}
                    />
                    {isPhoneLandscape ? (
                      // Phone landscape: Stack icon and text vertically, centered
                      <View style={{ alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                        <Ionicons 
                          name="lock-open" 
                          size={responsiveStyles.modalUnlockButtonText.fontSize + 2} 
                          color="#FFFFFF" 
                        />
                        <Text style={[responsiveStyles.modalUnlockButtonText, { marginTop: 2, fontSize: responsiveStyles.modalUnlockButtonText.fontSize - 1, textShadowColor: 'rgba(0,0,0,0.7)', textShadowRadius: 3 }]}>
                          ✨ {t('unlockAllLevels')} ({unlockPrice}) ✨
                        </Text>
                      </View>
                    ) : (
                      // Other orientations: Keep original horizontal layout
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, zIndex: 1 }}>
                        <Ionicons 
                          name="lock-open" 
                          size={responsiveStyles.modalUnlockButtonText.fontSize} 
                          color="#FFFFFF" 
                        />
                        <Text style={[responsiveStyles.modalUnlockButtonText, { textShadowColor: 'rgba(0,0,0,0.7)', textShadowRadius: 3 }]}>
                          ✨ {t('unlockAllLevels')} ({unlockPrice}) ✨
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </ReAnimated.View>
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
  
  // Use different tile size constraints based on orientation and device
  let minTileSize, maxTileSize;
  
  if (currentIsLandscape && currentWidth >= 900) {
    // Tablet landscape - bigger tiles
    minTileSize = 280;
    maxTileSize = 380;
  } else if (currentIsLandscape) {
    // Phone landscape
    minTileSize = MIN_TILE_SIZE_LANDSCAPE;
    maxTileSize = MAX_TILE_SIZE_LANDSCAPE;
  } else {
    // Portrait mode
    minTileSize = MIN_TILE_SIZE_PORTRAIT;
    maxTileSize = MAX_TILE_SIZE_PORTRAIT;
  }
  
  const itemSize = Math.max(minTileSize, Math.min(maxTileSize, calculatedSize));

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Русский' },
    { code: 'tr', name: 'Türkçe' },
  ];

  // Determine locked state for each level (visual only, not functional)
  const getIsLocked = (level: string) => {
    console.log('getIsLocked called for level:', level);
    if (level === 'farm') return false;
    
    // Show locked styling for all other levels but keep them functional
    console.log('Returning true (locked) for level:', level);
    return true;
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
          {/* Animated Fireflies Background */}
          <AnimatedFireflies />
          
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
                  padding: getResponsiveSpacing(16, scaleFactor),
                  elevation: 3,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3,
                }}
                onPress={() => {
                  try {
                    setShowSettingsModal(true);
                  } catch (error) {
                    console.warn('Error opening settings modal:', error);
                  }
                }}
              >
                <Ionicons name="settings" size={32} color="#612915" />
              </TouchableOpacity>

             

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
                {/* Header with logo and unlock button */}
                <View style={[responsiveStyles.landscapeHeaderContainer, { 
                  marginTop: getResponsiveSpacing(100, scaleFactor) + (isLandscape && width >= 900 ? height * 0.3 : 0) // Move down 30% on tablet landscape
                }]}>
                  <Image
                    source={require('../src/assets/images/game-logo.png')}
                    style={responsiveStyles.landscapeLogo}
                    resizeMode="contain"
                  />
                  {renderUnlockButtons()}
                </View>

                <View
                  style={{
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'transparent',
                  }}
                >
                  {/* Info text above tiles */}
                  <View
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: 25,
                      paddingHorizontal: getResponsiveSpacing(24, scaleFactor),
                      paddingVertical: getResponsiveSpacing(12, scaleFactor),
                      marginBottom: getResponsiveSpacing(20, scaleFactor),
                      marginHorizontal: getResponsiveSpacing(20, scaleFactor),
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: getResponsiveFontSize(12, scaleFactor),
                        fontWeight: '600',
                        color: '#612915',
                        textAlign: 'center',
                        fontFamily: 'System',
                      }}
                    >
                      {t('pickWorldMessage')}
                    </Text>
                  </View>
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
                    isLevelCompleted={isLevelCompleted}
                    onToggleCompletion={handleToggleCompletion}
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
                  padding: getResponsiveSpacing(16, scaleFactor),
                  elevation: 3,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3,
                }}
                onPress={() => {
                  try {
                    setShowSettingsModal(true);
                  } catch (error) {
                    console.warn('Error opening settings modal:', error);
                  }
                }}
              >
                <Ionicons name="settings" size={32} color="#612915" />
              </TouchableOpacity>

              {/* Notebook Button - Under Settings */}
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  top: getResponsiveSpacing(90, scaleFactor),
                  right: getResponsiveSpacing(20, scaleFactor),
                  zIndex: 10002,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: 25,
                  padding: getResponsiveSpacing(16, scaleFactor),
                  elevation: 3,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3,
                }}
                onPress={() => {
                  try {
                    console.log('Notebook button pressed');
                    // Add notebook functionality here
                  } catch (error) {
                    console.warn('Error opening notebook:', error);
                  }
                }}
              >
                <Ionicons name="book" size={32} color="#612915" />
              </TouchableOpacity>

              <ScrollView
                style={responsiveStyles.scrollView}
                contentContainerStyle={responsiveStyles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Header with logo and unlock button */}
                <View style={responsiveStyles.portraitHeaderContainer}>
                  <Image
                    source={require('../src/assets/images/game-logo.png')}
                    style={responsiveStyles.portraitLogo}
                    resizeMode="contain"
                  />
                  {renderUnlockButtons()}
                </View>

                {/* Tiles container */}
                <View style={responsiveStyles.tilesContainer}>
                  {/* Info text above tiles */}
                  <View
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: 25,
                      paddingHorizontal: getResponsiveSpacing(24, scaleFactor),
                      paddingVertical: getResponsiveSpacing(12, scaleFactor),
                      marginBottom: getResponsiveSpacing(20, scaleFactor),
                      marginHorizontal: getResponsiveSpacing(20, scaleFactor),
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: getResponsiveFontSize(18, scaleFactor),
                        fontWeight: '600',
                        color: '#612915',
                        textAlign: 'center',
                        fontFamily: 'System',
                      }}
                    >
                      {t('pickWorldMessage')}
                    </Text>
                  </View>
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
                    isLevelCompleted={isLevelCompleted}
                    onToggleCompletion={handleToggleCompletion}
                  />
                </View>
              </ScrollView>
            </>
          )}
          {renderUnlockModal()}

          {/* Settings Modal */}
          {showSettingsModal && volume !== undefined && typeof volume === 'number' && (
          <Modal
            visible={showSettingsModal}
            transparent={true}
            animationType="fade"
            supportedOrientations={['landscape', 'landscape-left', 'landscape-right']}
            onRequestClose={() => {
              try {
                setShowSettingsModal(false);
              } catch (error) {
                console.warn('Error closing settings modal:', error);
              }
            }}
          >
            <View style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingVertical: currentIsLandscape && currentWidth >= 900 ? 40 : 60, // Less vertical padding on tablet landscape
            }}>
                             <View style={{
                 backgroundColor: 'white',
                 borderRadius: currentIsLandscape && currentWidth >= 900 ? 30 : 20, // Bigger border radius on tablet landscape
                 width: currentIsLandscape && currentWidth >= 900 ? '80%' : '90%', // Slightly narrower on tablet landscape for better proportions
                 height: currentHeight * (currentIsLandscape && currentWidth >= 900 ? 0.5 : 0.7), // Much shorter on tablet landscape
                 maxHeight: currentHeight - 120, // Ensure it never exceeds screen bounds
                 elevation: 5,
                 shadowColor: '#000',
                 shadowOffset: { width: 0, height: 2 },
                 shadowOpacity: 0.25,
                 shadowRadius: 4,
               }}>
                {/* Fixed Header */}
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: currentIsLandscape && currentWidth >= 900 ? 30 : 20, // Bigger padding on tablet landscape
                  paddingBottom: currentIsLandscape && currentWidth >= 900 ? 15 : 10, // Bigger bottom padding on tablet landscape
                  borderBottomWidth: 1,
                  borderBottomColor: '#f0f0f0',
                }}>
                  <Text style={{
                    fontSize: currentIsLandscape && currentWidth >= 900 ? 28 : 20, // Bigger font on tablet landscape
                    fontWeight: 'bold',
                    color: '#612915',
                  }}>
                    {t('settings') || 'Settings'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowSettingsModal(false)}
                    style={{ padding: currentIsLandscape && currentWidth >= 900 ? 8 : 5 }} // Bigger padding on tablet landscape
                  >
                    <Text style={{ fontSize: currentIsLandscape && currentWidth >= 900 ? 32 : 24, color: '#666' }}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Scrollable Content */}
                <ScrollView 
                  style={{ 
                    flex: 1,
                    backgroundColor: 'transparent',
                  }}
                  contentContainerStyle={{ 
                    padding: currentIsLandscape && currentWidth >= 900 ? 30 : 20, // Bigger padding on tablet landscape
                    paddingTop: currentIsLandscape && currentWidth >= 900 ? 20 : 15, // Bigger top padding on tablet landscape
                    paddingBottom: currentIsLandscape && currentWidth >= 900 ? 10 : 30, // Further reduced bottom padding on tablet landscape
                    flexGrow: 1, // Ensure content can grow to trigger scrolling
                  }}
                  showsVerticalScrollIndicator={true}
                  bounces={true}
                  scrollEnabled={true}
                  nestedScrollEnabled={true}
                >


                  {/* Language Section */}
                  <View style={{ marginBottom: 25 }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: '#612915',
                      marginBottom: 10,
                    }}>
                      {t('language')}
                    </Text>
                    <LanguageSelector
                      isLandscape={false}
                      t={t}
                      lang={lang}
                      languages={languages}
                      handleLanguageChange={setLang}
                    />
                  </View>

                  {/* Volume Section */}
                  <Text style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: '#612915',
                    marginBottom: 15,
                  }}>
                    {t('volume')}: {isNaN(volume) ? '0' : Math.round((volume || 0) * 100)}%
                  </Text>

                {/* Volume Slider */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 15,
                }}>
                  <TouchableOpacity
                    onPress={() => setVolumeSafely(0)}
                    style={{ 
                      marginRight: 10,
                      padding: 5,
                    }}
                  >
                    <Ionicons 
                      name="volume-mute" 
                      size={20}
                      color={(volume || 0) === 0 ? '#FF8C00' : '#666'}
                    />
                  </TouchableOpacity>
                  
                  {/* Volume Segments Bar */}
                  <View style={{
                    flex: 1,
                    height: 24,
                    justifyContent: 'center',
                    marginHorizontal: 10,
                    paddingVertical: 5,
                  }}>
                    <View style={{
                      height: 24,
                      backgroundColor: '#E0E0E0',
                      borderRadius: 12,
                      flexDirection: 'row',
                      overflow: 'hidden',
                      elevation: 2,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.2,
                      shadowRadius: 2,
                    }}>
                      {Array.from({ length: 10 }, (_, i) => {
                        const segmentValue = (i + 1) / 10;
                        const isActive = segmentValue <= (volume || 0);
                        return (
                          <TouchableOpacity
                            key={i}
                            style={{
                              flex: 1,
                              height: '100%',
                              backgroundColor: isActive ? '#FF8C00' : 'transparent',
                              borderRightWidth: i < 9 ? 1 : 0,
                              borderRightColor: 'rgba(255,255,255,0.3)',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                            onPress={() => setVolumeSafely(segmentValue)}
                            activeOpacity={0.7}
                          >
                            <View style={{
                              width: 2,
                              height: '70%',
                              backgroundColor: isActive ? 'white' : '#999',
                              borderRadius: 1,
                            }} />
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    onPress={() => setVolumeSafely(1.0)}
                    style={{ 
                      marginLeft: 10,
                      padding: 5,
                    }}
                  >
                    <Ionicons 
                      name="volume-high" 
                      size={20}
                      color={(volume || 0) === 1.0 ? '#FF8C00' : '#666'}
                    />
                  </TouchableOpacity>
                </View>

                  {/* About Section */}
                  <View style={{ marginTop: 25, marginBottom: 20 }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: '#612915',
                      marginBottom: 10,
                    }}>
                      {t('about')}
                    </Text>
                    <View style={{
                      backgroundColor: 'rgba(115, 194, 185, 0.1)',
                      padding: 15,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: 'rgba(115, 194, 185, 0.3)',
                    }}>
                      <Text style={{
                        fontSize: 14,
                        color: '#444',
                        lineHeight: 20,
                        textAlign: 'left',
                      }}>
                        {t('aboutDescription')}
                      </Text>
                    </View>
                  </View>

                  {/* Done Button */}
                  <TouchableOpacity
                    onPress={() => setShowSettingsModal(false)}
                    style={{
                      backgroundColor: '#73c2b9',
                      borderRadius: 15,
                      padding: 12,
                      alignItems: 'center',
                      minHeight: 44,
                      marginTop: 10,
                    }}
                  >
                    <Text style={{
                      color: 'white',
                      fontSize: 16,
                      fontWeight: 'bold',
                    }}>
                      {t('done')}
                    </Text>
                  </TouchableOpacity>

                  {/* Extra space at bottom for better scroll experience */}
                  <View style={{ height: currentIsLandscape && currentWidth >= 900 ? 10 : 40 }} />
                </ScrollView>
              </View>
            </View>
          </Modal>
          )}
        </View>
      </ImageBackground>
    </View>
  );
}
