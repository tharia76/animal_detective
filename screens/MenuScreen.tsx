import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
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
  InteractionManager,
} from 'react-native';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Asset } from 'expo-asset';
import { useAudioPlayer, createAudioPlayer } from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CommonActions } from '@react-navigation/native';
import PurchaseService from '../src/services/PurchaseService';

import ReAnimated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
  withRepeat,
  withSequence,
  Easing
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDynamicStyles } from '../src/styles/styles';
import { useLocalization } from '../src/hooks/useLocalization';
import { useForceOrientation } from '../src/hooks/useForceOrientation';
import LanguageSelector from '../src/components/LanguageSelector';
import LevelTiles from '../src/components/LevelTiles';
import AnimatedFireflies from '../src/components/AnimatedFireflies';
import AnimatedFlyingAnimals from '../src/components/AnimatedFlyingAnimals';
import { setGlobalVolume } from '../src/components/LevelScreenTemplate';
import { useLevelCompletion } from '../src/hooks/useLevelCompletion';
import { getAnimals } from '../src/data/animals';
import { ImageCache } from '../src/utils/ImageCache';
import { ImageRegistry } from '../src/utils/PersistentImageRegistry';
import { preloadImages } from '../src/utils/preloadImages';
import ScreenLoadingWrapper from '../src/components/ScreenLoadingWrapper';
import FacebookAnalytics from '../src/services/FacebookAnalytics';
import ParentalGate from '../src/components/ParentalGate';
import Constants from 'expo-constants';


// Menu music now handled by BackgroundMusicManager
const BG_IMAGE = require('../src/assets/images/menu-screen.png');
const LEVELS = ['farm', 'forest', 'ocean', 'desert', 'arctic', 'insects', 'savannah', 'jungle', 'birds'];

// Product ID for unlocking all levels
const PRODUCT_ID = 'animalDetectiveUnclock'; // Used for both iOS and Android

// Responsive tile size constants for different orientations
const MIN_TILE_SIZE_LANDSCAPE = 120;
const MAX_TILE_SIZE_LANDSCAPE = 200;
const MIN_TILE_SIZE_PORTRAIT = 140;  // Slightly bigger minimum for portrait
const MAX_TILE_SIZE_PORTRAIT = 180; // Slightly bigger maximum for portrait
const RESPONSIVE_MARGIN = 6;

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
      // Remove negative margins that might hide the button
      marginLeft: 0,
      marginRight: 0,
      // Ensure visibility
      zIndex: 1000,
      position: 'relative',
      // Add some padding to make it more visible
      padding: 10,
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
      // Purchase button styling
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    unlockButtonText: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: getResponsiveFontSize(isLandscape && width >= 900 ? 14 : 9, scaleFactor), // Bigger font on tablet landscape
      textAlign: 'center',
      letterSpacing: 0.3,
      textShadowColor: 'rgba(255,255,255,0.3)',
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
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    modalContent: {
      backgroundColor: '#FFF8DC',
      borderRadius: getResponsiveSpacing(25, scaleFactor),
      padding: getResponsiveSpacing(20, scaleFactor),
      alignItems: 'center',
      width: '100%',
      maxWidth: Math.min(450, width * 0.9), // Wider for better phone display
      maxHeight: Math.min(400, height * 0.7), // Less tall - limit height
      shadowColor: '#FF8C00',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 15,
      elevation: 15,
      borderWidth: 3,
      borderColor: '#FF8C00',
      overflow: 'visible', // Allow shadows to show
    },
    modalTitle: {
      fontSize: getResponsiveFontSize(10, scaleFactor), // Smaller for phones
      fontWeight: '900',
      marginBottom: getResponsiveSpacing(8, scaleFactor), // Even less spacing
      color: 'black',
      textAlign: 'center',
      textShadowColor: 'rgba(0,0,0,0.2)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 3,
    },
    modalText: {
      fontSize: getResponsiveFontSize(12, scaleFactor), // Smaller for phones
      color: '#8B4513',
      marginBottom: getResponsiveSpacing(12, scaleFactor), // Even less spacing
      textAlign: 'center',
      lineHeight: getResponsiveFontSize(18, scaleFactor), // Even more reduced line height
      fontWeight: '600',
    },
    modalUnlockButton: {
      backgroundColor: '#4CAF50',
      paddingHorizontal: getResponsiveSpacing(8, scaleFactor), // Much smaller padding
      paddingVertical: getResponsiveSpacing(4, scaleFactor), // Much smaller padding
      borderRadius: getResponsiveSpacing(8, scaleFactor), // Much smaller radius
      marginBottom: getResponsiveSpacing(3, scaleFactor), // Much less margin
      width: '100%',
      maxWidth: '100%', // Ensure button doesn't exceed container width
      minHeight: getResponsiveSpacing(22, scaleFactor), // Much smaller height
      shadowColor: '#4CAF50',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'visible', // Allow shadows to show
    },
    modalUnlockButtonText: {
      color: '#FFFFFF',
      fontWeight: '500', // Lighter weight
      fontSize: getResponsiveFontSize(10, scaleFactor), // Much smaller text
      textAlign: 'center',
      letterSpacing: 0.1, // Minimal letter spacing
      textShadowColor: 'rgba(255,255,255,0.1)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 1,
    },
    modalCloseButton: {
      marginTop: getResponsiveSpacing(6, scaleFactor), // Even less margin
      padding: getResponsiveSpacing(8, scaleFactor), // Even less padding
      minHeight: getResponsiveSpacing(35, scaleFactor), // Even smaller height
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 192, 203, 0.3)',
      borderRadius: getResponsiveSpacing(20, scaleFactor), // Smaller radius
    },
    modalCloseButtonText: {
      color: 'black',
      fontSize: getResponsiveFontSize(14, scaleFactor), // Smaller for phones
      textAlign: 'center',
      fontWeight: '700',
    },
    modalTopRightCloseButton: {
      position: 'absolute',
      top: getResponsiveSpacing(10, scaleFactor),
      right: getResponsiveSpacing(10, scaleFactor),
      width: getResponsiveSpacing(30, scaleFactor),
      height: getResponsiveSpacing(30, scaleFactor),
      borderRadius: getResponsiveSpacing(15, scaleFactor),
      backgroundColor: 'rgba(255, 107, 107, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
      controlPanelContainer: {
        width: '80%',
        maxWidth: Math.min(1200, width * 0.95),
        height: getResponsiveSpacing(isLandscape ? 240 : 280, scaleFactor),
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: getResponsiveSpacing(20, scaleFactor),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
        marginTop: getResponsiveSpacing(10, scaleFactor),
        marginBottom: getResponsiveSpacing(8, scaleFactor),
        overflow: 'hidden',
      },
      controlPanelBg: {
        width: '100%',
        height: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: getResponsiveSpacing(16, scaleFactor),
        paddingTop: getResponsiveSpacing(isLandscape ? -200 : 20, scaleFactor),
        paddingBottom: getResponsiveSpacing(isLandscape ? 20 : 20, scaleFactor),
        gap: getResponsiveSpacing(12, scaleFactor),
      },
      controlPanelLogo: {
        width: Math.min(getResponsiveSpacing(isLandscape ? 240 : 260, scaleFactor), width * 0.6),
        height: Math.min(getResponsiveSpacing(isLandscape ? 120 : 140, scaleFactor), height * 0.2),
        maxHeight: '100%',
        resizeMode: 'cover',
      },
      controlPanelImage: {
        borderRadius: getResponsiveSpacing(20, scaleFactor),
      },
      controlPanelContent: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: getResponsiveSpacing(16, scaleFactor),
      },
      controlPanelItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      },
      controlPanelRightGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: getResponsiveSpacing(10, scaleFactor),
      },
      controlPanelIconButton: {
        backgroundColor: '#ffffff',
        borderRadius: getResponsiveSpacing(18, scaleFactor),
        padding: getResponsiveSpacing(10, scaleFactor),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
      },
      settingsButtonContainer: {
        width: getResponsiveSpacing(isLandscape ? 56 : 50, scaleFactor),
        height: getResponsiveSpacing(isLandscape ? 56 : 50, scaleFactor),
        borderRadius: getResponsiveSpacing(isLandscape ? 28 : 25, scaleFactor),
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      settingsButtonImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
      },
  });
};

// Helper function to play button sound
const playButtonSound = (volume: number) => {
  if (volume > 0) {
    try {
      const buttonPlayer = createAudioPlayer(require('../src/assets/sounds/other/button.mp3'));
      
      // Set volume before playing to avoid blocking
      buttonPlayer.volume = volume;
      
      // Add listener before playing
      buttonPlayer.addListener('playbackStatusUpdate', (status: any) => {
        if (status.didJustFinish) {
          try {
            buttonPlayer.remove();
          } catch (removeError) {
            console.warn('Error removing button sound:', removeError);
          }
        }
      });
      
      // Play after setting up listener
      buttonPlayer.play();
    } catch (error) {
      console.warn('Error playing button sound:', error);
    }
  }
};

interface MenuScreenProps {
  onSelectLevel: (level: string) => void;
  backgroundImageUri?: string | null;
  onScreenReady?: () => void;
}

export default function MenuScreen({ onSelectLevel, backgroundImageUri, onScreenReady }: MenuScreenProps) {
  const { isLevelCompleted, unmarkLevelCompleted, clearAllCompletions } = useLevelCompletion();
  // IMPORTANT: All hooks must be at the top level and in consistent order
  const navigation = useNavigation();
  const { t, lang, setLang } = useLocalization();
  

  const dynStyles = useDynamicStyles();
  const { width, height, isLandscape } = useForceOrientation(); // Use forced landscape dimensions
  const insets = useSafeAreaInsets();
  
  // Selected level state
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  
  // Unlock modal state
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [lockedLevelClicked, setLockedLevelClicked] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [productPrice, setProductPrice] = useState<string | null>(null);

  // Get animals data for level tile subtitles
  const animals = getAnimals(lang);

  // Calculate responsive values (memoized for performance)
  const scaleFactor = useMemo(() => getScaleFactor(width, height), [width, height]);
  const numColumns = useMemo(() => getResponsiveColumns(width, isLandscape), [width, isLandscape]);

  // Create responsive styles (memoized)
  const responsiveStyles = useMemo(() => 
    createResponsiveStyles(scaleFactor, width, height, isLandscape),
    [scaleFactor, width, height, isLandscape]
  );

  // sizing logic - Force landscape dimensions (memoized)
  const { currentWidth, currentHeight, currentIsLandscape, isTablet, currentNumColumns, itemSize } = useMemo(() => {
    const currentWidth = width;
    const currentHeight = height;
    const currentIsLandscape = true; // Always force landscape layout
    const isTablet = currentWidth >= 900;
    
    // Calculate responsive tile size with min/max constraints
    const currentNumColumns = getResponsiveColumns(currentWidth, currentIsLandscape);
    const availableWidth = currentIsLandscape 
      ? currentWidth * 0.75  // More space in landscape
      : currentWidth * 0.70; // Less space in portrait for smaller tiles
    const calculatedSize = (availableWidth / currentNumColumns) - (RESPONSIVE_MARGIN * 2);
    
    // Use different tile size constraints based on orientation and device
    let minTileSize, maxTileSize;
    
    if (currentIsLandscape && currentWidth >= 1024) {
      // Large tablet landscape - bigger tiles
      minTileSize = 280;
      maxTileSize = 380;
    } else if (currentIsLandscape && currentWidth >= 900 && currentWidth < 1024) {
      // iPhone Pro Max landscape - optimized tile size
      minTileSize = 144;
      maxTileSize = 202;
    } else if (currentIsLandscape) {
      // Regular phone landscape
      minTileSize = MIN_TILE_SIZE_LANDSCAPE;
      maxTileSize = MAX_TILE_SIZE_LANDSCAPE;
    } else {
      // Portrait mode
      minTileSize = MIN_TILE_SIZE_PORTRAIT;
      maxTileSize = MAX_TILE_SIZE_PORTRAIT;
    }
    
    const itemSize = Math.max(minTileSize, Math.min(maxTileSize, calculatedSize));
    
    return { currentWidth, currentHeight, currentIsLandscape, isTablet, currentNumColumns, itemSize };
  }, [width, height]);
  


  // Animated gradient values
  const gradientPosition = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  
  // Bounce animation values
  const bounceScale = useSharedValue(1);
  const bounceScale2 = useSharedValue(1);

  // Use dimensions directly for more stable layouts
  const [visitedCounts, setVisitedCounts] = useState<Record<string, number>>({});

  // Settings modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [volume, setVolume] = useState(0.8); // Default volume at 80%
  const [volumeLoaded, setVolumeLoaded] = useState(false); // Track if volume is loaded from storage
  
  // Payment state
  const [iapInitialized, setIapInitialized] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [purchaseInProgress, setPurchaseInProgress] = useState(false);
  const [unlocked, setUnlocked] = useState<boolean>(false);
  const [showParentalGate, setShowParentalGate] = useState(false);
  const modalTransitionRef = useRef(false);
  
  // Load unlocked state from storage on mount
  // No longer auto-unlocks in debug mode - levels stay locked except farm, forest, ocean
  // Force clear any existing unlock state to ensure proper locking
  useEffect(() => {
    const loadUnlockedState = async () => {
      try {
        // Force clear unlock state to ensure proper locking
        // Only keep unlock if user actually purchased it (will be restored via restorePurchases)
        await AsyncStorage.removeItem('unlocked_all_levels');
        setUnlocked(false);
        console.log('🔒 Cleared unlock state - only farm, forest, ocean unlocked');
      } catch (error) {
        console.warn('Error loading unlocked state:', error);
      }
    };
    loadUnlockedState();
  }, []);
  
  // Save unlocked state to storage when it changes
  const saveUnlockedState = useCallback(async (isUnlocked: boolean) => {
    try {
      await AsyncStorage.setItem('unlocked_all_levels', isUnlocked.toString());
    } catch (error) {
      console.warn('Error saving unlocked state:', error);
    }
  }, []);

  // Modal state for locked level
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  
  // Debug: Log modal state changes
  useEffect(() => {
    console.log('🔍 Unlock Modal State:', { showUnlockModal, showParentalGate, visible: showUnlockModal && !showParentalGate });
  }, [showUnlockModal, showParentalGate]);

  // IAP: Initialize and get products
  useEffect(() => {
    let purchaseUpdateSubscription: any;
    let purchaseErrorSubscription: any;

    async function initIAP() {
      // Skip IAP initialization in Expo Go (where native modules aren't available)
      // Check if we're in Expo Go - executionEnvironment is 'storeClient' in Expo Go
      const isExpoGo = Constants.executionEnvironment === 'storeClient';
      
      if (isExpoGo) {
        console.log('Skipping IAP initialization in Expo Go');
        setIapInitialized(true);
        return;
      }

      // Only try to require react-native-iap if we're not in Expo Go
      let RNIap: any = null;
      try {
        RNIap = require('react-native-iap');
      } catch (e: any) {
        // If require fails, we're likely in an environment without native modules
        console.warn('react-native-iap not available:', e?.message || e);
        setIapInitialized(true);
        return;
      }

      // Check if RNIap is available
      if (!RNIap || !RNIap.initConnection) {
        console.warn('react-native-iap not available - IAP features disabled');
        setIapInitialized(true); // Set to true to allow app to continue
        return;
      }

      try {
        console.log('Initializing IAP connection...');
        try {
          await RNIap.initConnection();
          console.log('IAP connection successful');
          setIapInitialized(true);
        } catch (initError: any) {
          // Silently handle initialization errors (e.g., Expo Go)
          if (initError.message?.includes('native module') ||
              initError.code === 'MODULE_NOT_FOUND') {
            console.warn('IAP not available in this environment');
            setIapInitialized(true); // Set to true to allow app to continue
            return;
          }
          throw initError; // Re-throw if it's a different error
        }

        // Get product info
        console.log('Requesting products for SKU:', PRODUCT_ID);
        try {
          const products = await RNIap.getProducts({ skus: [PRODUCT_ID] });
          console.log('Received products:', products);
          if (products && products.length > 0) {
            setProducts(products);
          } else {
            console.warn('No products found for SKU:', PRODUCT_ID);
            // Don't show alert - silently handle
          }
        } catch (productError: any) {
          // Silently handle product errors (IAP may not be available)
          console.warn('Error fetching products:', productError);
        }

        // Check if already purchased
        try {
          const purchases = await RNIap.getAvailablePurchases();
          const hasUnlock = purchases.some(
            (purchase) =>
              purchase.productId === PRODUCT_ID ||
              purchase.productId === PRODUCT_ID.replace('.unlockall', '.unlockall') // fallback
          );
          if (hasUnlock) {
            setUnlocked(true);
            saveUnlockedState(true);
          }
        } catch (purchaseError: any) {
          // Silently handle purchase check errors
          console.warn('Error checking purchases:', purchaseError);
        }

        // Listen for purchase updates
        try {
          purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase) => {
            const receipt = purchase.transactionReceipt;
            if (receipt) {
              try {
                // For iOS transactions, we need to finish them properly
                await RNIap.finishTransaction({ purchase, isConsumable: false });
                if (purchase.productId === PRODUCT_ID) {
                  setUnlocked(true);
                  saveUnlockedState(true);
                  setPurchaseInProgress(false);
                  Alert.alert(
                    t('thankYou') || 'Thank You!',
                    t('allLevelsNowUnlocked') || 'All levels are now unlocked!'
                  );
                }
              } catch (err) {
                console.warn('finishTransaction error', err);
                setPurchaseInProgress(false);
              }
            }
          });

          purchaseErrorSubscription = RNIap.purchaseErrorListener((error) => {
            setPurchaseInProgress(false);
            console.warn('Purchase error:', error);
            
            // Handle specific purchase errors
            if (error.code === 'E_USER_CANCELLED') {
              // User cancelled purchase - no need to show error
              return;
            }
            
            Alert.alert(
              t('purchaseError') || 'Purchase Error',
              error.message || t('somethingWentWrong') || 'Something went wrong. Please try again.'
            );
          });
        } catch (listenerError: any) {
          // Silently handle listener setup errors
          console.warn('Error setting up purchase listeners:', listenerError);
        }
      } catch (e: any) {
        // Catch any other errors silently
        console.warn('IAP initialization error:', e);
        setIapInitialized(true);
        // Don't show alert for initialization errors to avoid blocking the app
      }
    }

    initIAP();

    return () => {
      try {
        purchaseUpdateSubscription && purchaseUpdateSubscription.remove();
        purchaseErrorSubscription && purchaseErrorSubscription.remove();
        // Try to get RNIap locally for cleanup
        try {
          const RNIap = require('react-native-iap');
          if (RNIap && RNIap.endConnection) {
            RNIap.endConnection();
          }
        } catch (e) {
          // Module not available, skip cleanup
        }
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Wrapper function for language change with button sound
  const handleLanguageChange = useCallback((code: string) => {
    playButtonSound(volume);
    setLang(code);
  }, [setLang, volume]);

  


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
      // Menu music volume now handled by BackgroundMusicManager
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
      // Menu music volume now handled by BackgroundMusicManager
      saveVolumeToStorage(clampedVolume); // Save to persistent storage
    } catch (error) {
      console.warn('Error setting volume:', error);
    }
  }, [saveVolumeToStorage]);
  
  // Handle volume change from slider
  const handleVolumeChange = useCallback((newVolume: number) => {
    console.log('Volume changing to:', newVolume);
    console.log('Current volume state:', volume);
    setVolume(newVolume);
    setGlobalVolume(newVolume);
    // Menu music volume now handled by BackgroundMusicManager
    saveVolumeToStorage(newVolume);
  }, [saveVolumeToStorage, volume]);

  // Load volume from storage on app start
  useEffect(() => {
    loadVolumeFromStorage();
  }, [loadVolumeFromStorage]);
  

  


  // Placeholder for volume update effect - moved after player declaration


  // Menu music now handled by BackgroundMusicManager - no separate player needed
  
  // Update menu background music volume when volume changes (only after volume is loaded)
  // Menu music volume now handled by BackgroundMusicManager
  useEffect(() => {
    if (!volumeLoaded) return; // Don't apply until volume is loaded from storage
    
    // Update BackgroundMusicManager volume instead of separate menu player
    const { BackgroundMusicManager } = require('../src/services/BackgroundMusicManager');
    BackgroundMusicManager.getInstance().setGlobalVolume(volume);
    console.log('Updated BackgroundMusicManager volume to:', volume);
    
    // Global volume is set in setVolumeSafely, but ensure it's set here too for direct volume changes
    setGlobalVolume(volume);
  }, [volume, volumeLoaded]);


  // Animated styles for gradient buttons with pulse
  const animatedGradientStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
    };
  });
  
  // Bounce animation styles
  const bounceStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: bounceScale.value }],
    };
  });
  
  const bounceStyle2 = useAnimatedStyle(() => {
    return {
      transform: [{ scale: bounceScale2.value }],
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

  // Menu music now handled by BackgroundMusicManager - no separate player needed

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
    
    // Bounce animations for unlock buttons
    bounceScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 800, easing: Easing.out(Easing.quad) }),
        withTiming(0.98, { duration: 400, easing: Easing.in(Easing.quad) }),
        withTiming(1, { duration: 600, easing: Easing.out(Easing.bounce) })
      ),
      -1,
      false
    );
    
    // Second bounce animation with slight delay
    setTimeout(() => {
      bounceScale2.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 800, easing: Easing.out(Easing.quad) }),
          withTiming(0.98, { duration: 400, easing: Easing.in(Easing.quad) }),
          withTiming(1, { duration: 600, easing: Easing.out(Easing.bounce) })
        ),
        -1,
        false
      );
    }, 1000);
  }, []);

  // Menu music now handled by BackgroundMusicManager - start menu music immediately
  useEffect(() => {
    // Register user interaction immediately to enable audio playback
    try {
      console.log('⚡ Registering user interaction for audio playback');
      const { BackgroundMusicManager } = require('../src/services/BackgroundMusicManager');
      BackgroundMusicManager.getInstance().registerUserInteraction();
      
      // Start menu music immediately after registering interaction
      console.log('⚡ Starting menu music immediately');
      BackgroundMusicManager.getInstance().playBackgroundMusic('menu');
    } catch (e) {
      console.warn('Failed to start menu music:', e);
    }
    
    return () => {
      // Menu music cleanup is handled by BackgroundMusicManager
    };
  }, [volume]); // Only depend on volume changes

  // Menu music cleanup now handled by BackgroundMusicManager

  // Load visited counts for each level from AsyncStorage (non-blocking)
  useEffect(() => {
    // Start with empty counts - menu renders immediately
    // Load counts in background without blocking render
    const loadVisitedCounts = async () => {
      try {
        const entries = await Promise.all(
          LEVELS.map(async (lvl) => {
            try {
              const key = `animalProgress_${lvl}`;
              const saved = await AsyncStorage.getItem(key);
              const arr = saved ? JSON.parse(saved) : [];
              const count = Array.isArray(arr) ? arr.length : 0;
              return [lvl, count] as const;
            } catch {
              return [lvl, 0] as const;
            }
          })
        );
        
        const map: Record<string, number> = {};
        for (const [lvl, count] of entries) {
          map[lvl] = count;
        }
        
        setVisitedCounts(map);
      } catch (e) {
        console.warn('Error loading visited counts:', e);
      }
    };

    // Load in background - don't block initial render
    loadVisitedCounts();
  }, []);

  // Menu music focus/blur now handled by BackgroundMusicManager
  useEffect(() => {
    const onFocus = () => {
      try {
        console.log('🎵 Menu focused - ensuring menu music is playing');
        const { BackgroundMusicManager } = require('../src/services/BackgroundMusicManager');
        // Stop any level background music and start menu music
        BackgroundMusicManager.getInstance().playBackgroundMusic('menu');
      } catch (e) {
        console.warn('Failed to resume menu music on focus:', e);
      }
    };

    const fSub = navigation.addListener('focus', onFocus);
    return () => {
      try {
        fSub && fSub();
      } catch (e) {}
    };
  }, [navigation]);

  // Handle toggling level completion status
  const handleToggleCompletion = useCallback(
    async (level: string, isCompleted: boolean) => {
      playButtonSound(volume);
      try {
        if (!isCompleted) {
          // Unmark as completed
          await unmarkLevelCompleted(level);
          
          // Clear animal progress for this level
          const progressKey = `animalProgress_${level.toLowerCase()}`;
          await AsyncStorage.removeItem(progressKey);
          console.log(`🗑️ Cleared animal progress for ${level} when unchecking completion`);

          // Immediately reset progress count in UI for this level
          setVisitedCounts((prev) => ({
            ...prev,
            [level]: 0,
          }));
        }
        // Note: We don't mark as completed here, that only happens when the congrats modal shows
      } catch (error) {
        console.warn('Error toggling level completion:', error);
      }
    },
    [unmarkLevelCompleted, volume]
  );

  // Handle resetting all levels
  const handleResetAllLevels = useCallback(async () => {
    try {
      // Show confirmation dialog
      Alert.alert(
        t('resetAllLevels'),
        t('resetAllLevelsConfirmation'),
        [
          {
            text: t('cancel'),
            style: 'cancel',
          },
          {
            text: t('reset'),
            style: 'destructive',
            onPress: async () => {
              try {
                // Reset completion status for all levels using the dedicated function
                await clearAllCompletions();
                
                // Clear animal progress for each level
                for (const level of LEVELS) {
                  const progressKey = `animalProgress_${level.toLowerCase()}`;
                  await AsyncStorage.removeItem(progressKey);
                }
                
                // Clear unlock status to restore locks
                await AsyncStorage.removeItem('unlocked_all_levels');
                setUnlocked(false);
                
                console.log('🗑️ Reset all levels, cleared all animal progress, and restored locks');
                
                // Reset UI visited counts for all levels immediately
                setVisitedCounts(() => {
                  const reset: Record<string, number> = {};
                  for (const lvl of LEVELS) reset[lvl] = 0;
                  return reset;
                });
                
                // Show success message
                Alert.alert(
                  t('resetComplete'),
                  t('allLevelsReset')
                );
              } catch (error) {
                console.warn('Error resetting all levels:', error);
                Alert.alert(
                  t('error'),
                  t('resetError')
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      console.warn('Error showing reset confirmation:', error);
    }
  }, [t, clearAllCompletions]);

  // also stop when you select a level - instant navigation
  const handleSelect = useCallback(
    (level, isLocked) => {
      console.log('🔍 handleSelect called:', { level, isLocked, unlocked });
      playButtonSound(volume);
      
      // Register user interaction for audio playback
      const { BackgroundMusicManager } = require('../src/services/BackgroundMusicManager');
      BackgroundMusicManager.getInstance().onUserInteraction();
      
      // If level is locked and user hasn't unlocked all levels, show unlock modal and STOP
      if (isLocked && !unlocked) {
        console.log('🔒 Level is locked - showing unlock modal');
        setShowUnlockModal(true);
        // Track analytics for locked level attempt
        FacebookAnalytics.trackLevelSelected(level, true);
        return; // CRITICAL: Don't proceed to open the level
      }
      
      // Track level selection in analytics
      FacebookAnalytics.trackLevelSelected(level, false);
      
      // Show destination background immediately
      setSelectedLevel(level);
      
      // Stop ALL audio before transitioning to level - NUCLEAR OPTION
      try { 
        console.log('🎵 NUCLEAR STOP: Stopping ALL audio before level transition');
        BackgroundMusicManager.globalStopAllAudio(); // Stop everything globally (including menu music)
        console.log('🎵 All audio stopped before transitioning to level');
        
        // Start level music immediately after user interaction is registered
        setTimeout(() => {
          console.log(`🎵 Starting level music for ${level} after user interaction`);
          BackgroundMusicManager.getInstance().playBackgroundMusic(level).catch(e => {
            console.warn(`Failed to start level music for ${level}:`, e);
          });
        }, 200); // Small delay to ensure audio session is reset
      } catch (e) {
        console.warn('Error stopping audio before level transition:', e);
      }
      
      if (typeof onSelectLevel === 'function') {
        onSelectLevel(level);
      }
    },
    [onSelectLevel, volume, unlocked]
  );
  
  // Handle unlock all levels
  const handleUnlockAll = useCallback(async () => {
    try {
      playButtonSound(volume);
      setIsPurchasing(true);
      
      // Purchase unlock all levels
      const success = await PurchaseService.purchaseUnlockAll();
      
      if (success) {
        // Update state immediately
        setUnlockedAllLevels(true);
        
        // Close modal
        setShowUnlockModal(false);
        setLockedLevelClicked(null);
        
        // Show success message
        Alert.alert(
          t('unlockAllLevels') || 'Unlock All Missions',
          t('allLevelsNowUnlocked') || 'All missions are now open!'
        );
      } else {
        // User canceled or purchase failed
        Alert.alert(
          t('purchaseError') || 'Purchase Error',
          t('couldNotCompletePurchase') || 'Uh-oh! Purchase didn\'t go through.'
        );
      }
    } catch (error) {
      console.warn('Error purchasing unlock all:', error);
      Alert.alert(
        t('purchaseError') || 'Purchase Error',
        t('couldNotCompletePurchase') || 'Uh-oh! Purchase didn\'t go through.'
      );
    } finally {
      setIsPurchasing(false);
    }
  }, [volume, t]);

  // Restore purchases
  const handleRestore = useCallback(async () => {
    let RNIap: any = null;
    try {
      RNIap = require('react-native-iap');
    } catch (e) {
      Alert.alert(
        t('error') || 'Error',
        'In-app purchases are not available in this environment.'
      );
      return;
    }

    if (!RNIap || !RNIap.getAvailablePurchases) {
      Alert.alert(
        t('error') || 'Error',
        'In-app purchases are not available in this environment.'
      );
      return;
    }

    setPurchaseInProgress(true);
    try {
      const purchases = await RNIap.getAvailablePurchases();
      const hasUnlock = purchases.some(
        (purchase) =>
          purchase.productId === PRODUCT_ID ||
          purchase.productId === PRODUCT_ID.replace('.unlockall', '.unlockall')
      );
      if (hasUnlock) {
        setUnlocked(true);
        saveUnlockedState(true);
        Alert.alert(
          t('restored') || 'Purchases Restored',
          t('allLevelsNowUnlocked') || 'All levels are now unlocked!'
        );
      } else {
        Alert.alert(
          t('noPreviousPurchases') || 'No Previous Purchases',
          t('noPurchasesFound') || 'No previous purchases were found to restore.'
        );
      }
    } catch (e) {
      console.warn('Restore purchases error:', e);
      Alert.alert(
        t('error') || 'Error',
        t('couldNotRestorePurchases') || 'Could not restore purchases. Please try again.'
      );
    }
    setPurchaseInProgress(false);
  }, [t, saveUnlockedState]);

  // Show parental gate before purchase
  const handleUnlock = useCallback(() => {
    console.log('🔓 handleUnlock called');
    console.log('🔓 purchaseInProgress:', purchaseInProgress);
    console.log('🔓 showUnlockModal:', showUnlockModal);
    
    if (purchaseInProgress) {
      console.log('🔓 Purchase in progress, returning');
      return;
    }
    
    if (modalTransitionRef.current) {
      console.log('🔓 Modal transition in progress, returning');
      return;
    }
    
    // Play button sound
    playButtonSound(volume);
    
    // Set flag to prevent multiple calls
    modalTransitionRef.current = true;
    
    // Close unlock modal first
    setShowUnlockModal(false);
    
    // Wait for modal to fully dismiss before showing parental gate
    console.log('🔓 Scheduling parental gate in 500ms');
    setTimeout(() => {
      console.log('🔓 Showing parental gate now');
      setShowParentalGate(true);
      modalTransitionRef.current = false;
    }, 500);
  }, [purchaseInProgress, volume, showUnlockModal]);

  // Actual purchase handler (called after parental gate success)
  const handlePurchase = useCallback(async () => {
    let RNIap: any = null;
    try {
      RNIap = require('react-native-iap');
    } catch (e) {
      Alert.alert(
        t('error') || 'Error',
        'In-app purchases are not available in this environment.'
      );
      return;
    }

    if (!RNIap || !RNIap.requestPurchase) {
      Alert.alert(
        t('error') || 'Error',
        'In-app purchases are not available in this environment.'
      );
      return;
    }

    setPurchaseInProgress(true);
    
    try {
      if (Platform.OS === 'ios') {
        // For iOS, use standard In-App Purchase through react-native-iap
        await RNIap.requestPurchase({ 
          sku: PRODUCT_ID,
          andDangerouslyFinishTransactionAutomaticallyIOS: false // Let us handle transaction completion
        });
      } else {
        // For Android, use Google Play Billing
        await RNIap.requestPurchase({ sku: PRODUCT_ID });
      }
    } catch (e) {
      console.warn('Purchase error:', e);
      setPurchaseInProgress(false);
      // Show user-friendly error message
      Alert.alert(
        t('purchaseError') || 'Purchase Error',
        t('couldNotCompletePurchase') || 'Could not complete purchase. Please try again.'
      );
    }
  }, [t]);


  // Handle parental gate success
  const handleParentalGateSuccess = useCallback(() => {
    setShowParentalGate(false);
    handlePurchase();
  }, [handlePurchase]);

  // Handle parental gate cancel
  const handleParentalGateCancel = useCallback(() => {
    setShowParentalGate(false);
    modalTransitionRef.current = false;
    // No alert needed - user intentionally cancelled by closing the modal
  }, []);

  // Remove the loading check since ScreenLoadingWrapper handles it
  // The wrapper will show loading state until all assets are loaded

  const languages = [
     { code: 'en', name: 'English' },
     { code: 'ru', name: 'Русский' },
     { code: 'tr', name: 'Türkçe' },
   ];

  // Explicit sizing for Settings modal and absolute centering
  const settingsModalWidth = isTablet ? Math.round(currentWidth * 0.8) : Math.round(currentWidth * 0.94);
  const settingsModalHeight = isTablet
    ? Math.round(currentHeight * 0.5)
    : Math.min(Math.round(currentHeight * 0.88), currentHeight - 32);
  const settingsModalTop = Math.max(0, Math.round((currentHeight - settingsModalHeight) / 2));
  const settingsModalLeft = Math.max(0, Math.round((currentWidth - settingsModalWidth) / 2));
 
  // Lock all levels except farm, forest, and ocean (or if user has unlocked all)
  // Debug mode still respects locking (only farm, forest, ocean unlocked)
  const getIsLocked = (level: string) => {
    // If user has unlocked all levels, nothing is locked
    if (unlocked) {
      return false;
    }
    // Unlock farm, forest, and ocean only
    if (level === 'farm' || level === 'forest' || level === 'ocean') {
      return false;
    }
    // Lock all other levels
    return true;
  };

  // Gather all menu assets to preload
  const menuAssets = useMemo(() => {
    const assets = [
      BG_IMAGE,
      // All level background images (for tiles)
      ...Object.values(LEVEL_BACKGROUNDS),
      // Settings icon
      require('../src/assets/images/settings.png'),
      // Level-specific images (for level tiles)
      require('../src/assets/images/cow_level.png'),
      require('../src/assets/images/forest_level.png'),
      require('../src/assets/images/ocean_level.png'),
      require('../src/assets/images/desert_level.png'),
      require('../src/assets/images/arctic_level.png'),
      require('../src/assets/images/insect_level.png'),
      require('../src/assets/images/savannah_level.png'),
      require('../src/assets/images/jungle_level.png'),
      require('../src/assets/images/bird_level.png'),
    ];
    return assets;
  }, []);

  return (
    <ScreenLoadingWrapper
      assetsToLoad={menuAssets}
      loadingText={t('loading') || 'Loading...'}
      backgroundColor="#FFDAB9"
      minLoadingTime={600}
      onAssetsLoaded={() => {
        if (onScreenReady) {
          onScreenReady();
        }
      }}
    >
      <View style={{
        flex: 1, 
        backgroundColor: '#FFDAB9',
        width: '100%',
        height: '100%'
      }}>
        {/* Menu content */}
        {(
          <ImageBackground
            source={backgroundImageUri ? { uri: backgroundImageUri } : BG_IMAGE}
            style={{ 
              flex: 1, 
              backgroundColor: '#ffdab9', // Solid fallback color
              width: '100%',
              height: '100%',
            }}
            imageStyle={{ opacity: 0.65 }}
            fadeDuration={0} // No fade animation
            resizeMode="cover"
            defaultSource={BG_IMAGE} // Preload default image
          >
          <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            {/* Animated Fireflies Background */}
            <AnimatedFireflies />
            {/* Animated Flying Animals Background */}
            <AnimatedFlyingAnimals />


          {currentIsLandscape ? (
            // LANDSCAPE LAYOUT
            <>
              {/* Settings button only (top-right) */}
              <View style={{ 
                position: 'absolute', 
                top: getResponsiveSpacing(12, scaleFactor), 
                right: getResponsiveSpacing(12, scaleFactor), 
                zIndex: 1000 
              }}>
                <TouchableOpacity
                  style={responsiveStyles.settingsButtonContainer}
                  onPress={() => {
                    playButtonSound(volume);
                    setShowSettingsModal(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Image
                    source={require('../src/assets/images/settings.png')}
                    style={responsiveStyles.settingsButtonImage}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={{ flex: 1, backgroundColor: 'transparent' }}
                contentContainerStyle={{
                  flexGrow: 1,
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  paddingHorizontal: getResponsiveSpacing(32, scaleFactor),
                  paddingTop: getResponsiveSpacing(24, scaleFactor),
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
                  {/* Info text above tiles */}
                  <View
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: 20,
                      paddingHorizontal: getResponsiveSpacing(16, scaleFactor),
                      paddingVertical: getResponsiveSpacing(16, scaleFactor),
                      marginBottom: getResponsiveSpacing(16, scaleFactor),
                      marginHorizontal: getResponsiveSpacing(20, scaleFactor),
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: getResponsiveSpacing(8, scaleFactor),
                      flexWrap: 'wrap',
                      maxWidth: '90%',
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
                    key="landscape-tiles-stable"
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
                    animals={animals}
                    visitedCounts={visitedCounts}
                  />
                </View>
              </ScrollView>
            </>
          ) : (
            // PORTRAIT LAYOUT
            <>
              {/* Notebook button moved into control panel in portrait */}

              <ScrollView
                style={[responsiveStyles.scrollView, {
                  marginLeft: insets.left,
                  marginRight: insets.right,
                }]}
                contentContainerStyle={[
                  responsiveStyles.scrollContent, 
                  { 
                    paddingTop: insets.top + getResponsiveSpacing(24, scaleFactor),
                    paddingBottom: insets.bottom + getResponsiveSpacing(120, scaleFactor), // Extra space for control panel
                  }
                ]}
                showsVerticalScrollIndicator={false}
              >
                {/* Tiles container */}
                <View style={responsiveStyles.tilesContainer}>
                  {/* Info text above tiles */}
                  <View
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: 25,
                      paddingHorizontal: getResponsiveSpacing(32, scaleFactor),
                      paddingVertical: getResponsiveSpacing(20, scaleFactor),
                      marginBottom: getResponsiveSpacing(20, scaleFactor),
                      marginHorizontal: getResponsiveSpacing(20, scaleFactor),
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: getResponsiveSpacing(12, scaleFactor),
                      flexWrap: 'wrap',
                      maxWidth: '90%',
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
                    key="portrait-tiles-stable"
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
                    animals={animals}
                    visitedCounts={visitedCounts}
                  />
                  
                </View>
              </ScrollView>
            </>
          )}
          
          {/* Settings Full Screen */}
          {showSettingsModal && volume !== undefined && typeof volume === 'number' && (
            <View style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#ffdab9',
              zIndex: 1000,
            }}>
              <ImageBackground
                source={backgroundImageUri ? { uri: backgroundImageUri } : BG_IMAGE}
                style={{ 
                  flex: 1, 
                  backgroundColor: 'transparent',
                }}
                imageStyle={{ opacity: 0.65 }}
                fadeDuration={0}
                resizeMode="cover"
              >
                <View style={{
                  flex: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  marginTop: Math.max(insets.top, getResponsiveSpacing(16, scaleFactor)),
                  marginBottom: Math.max(insets.bottom, getResponsiveSpacing(16, scaleFactor)),
                  marginLeft: Math.max(insets.left, getResponsiveSpacing(16, scaleFactor)),
                  marginRight: Math.max(insets.right, getResponsiveSpacing(16, scaleFactor)),
                  borderRadius: isTablet ? 35 : 25,
                  overflow: 'hidden',
                  elevation: 15,
                  shadowColor: '#FF8C00',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.4,
                  shadowRadius: 12,
                  borderWidth: 2,
                  borderColor: 'rgba(255, 140, 0, 0.2)',
                }}>
                {/* Fixed Header */}
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: isTablet ? 28 : 20,
                  paddingBottom: isTablet ? 20 : 16,
                  borderBottomWidth: 3,
                  borderBottomColor: '#FF8C00',
                  backgroundColor: 'rgba(255, 140, 0, 0.08)',
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                      backgroundColor: 'rgba(255, 140, 0, 0.15)',
                      borderRadius: 15,
                      padding: 8,
                      marginRight: 12,
                    }}>
                      <Ionicons 
                        name="settings" 
                        size={isTablet ? 26 : 22} 
                        color="#612915" 
                      />
                    </View>
                    <Text style={{
                      fontSize: isTablet ? 26 : 20,
                      fontWeight: '800',
                      color: '#612915',
                      textShadowColor: 'rgba(255, 140, 0, 0.3)',
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 2,
                    }}>
                      {t('settings') || 'Settings'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      playButtonSound(volume);
                      setShowSettingsModal(false);
                    }}
                    style={{ 
                      padding: isTablet ? 14 : 10,
                      backgroundColor: '#FF8C00',
                      borderRadius: 22,
                      elevation: 4,
                      shadowColor: '#FF8C00',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                    }}
                  >
                    <Ionicons 
                      name="close" 
                      size={isTablet ? 22 : 18} 
                      color="white" 
                    />
                  </TouchableOpacity>
                </View>

                {/* Scrollable Content */}
                <ScrollView 
                  style={{ 
                    flex: 1,
                    backgroundColor: 'transparent',
                  }}
                  contentContainerStyle={{ 
                    padding: isTablet ? 32 : 20,
                    paddingTop: isTablet ? 24 : 16,
                    paddingBottom: isTablet ? 20 : 24,
                    flexGrow: 1, // Ensure content can grow to trigger scrolling
                  }}
                  showsVerticalScrollIndicator={true}
                  bounces={true}
                  scrollEnabled={true}
                  nestedScrollEnabled={true}
                >


                  {/* Language Section */}
                  <View style={{ marginBottom: 40 }}>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 15,
                      paddingHorizontal: 8,
                    }}>
                      <View style={{
                        width: 4,
                        height: 20,
                        backgroundColor: '#FF8C00',
                        borderRadius: 2,
                        marginRight: 12,
                      }} />
                      <Text style={{
                        fontSize: 18,
                        fontWeight: '700',
                        color: '#612915',
                        textShadowColor: 'rgba(255, 140, 0, 0.2)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 1,
                      }}>
                        {t('language')}
                      </Text>
                    </View>
                    <LanguageSelector
                      isLandscape={false}
                      t={t}
                      lang={lang}
                      languages={languages}
                      handleLanguageChange={handleLanguageChange}
                    />
                  </View>

                  {/* Volume Section */}
                  <View style={{ marginBottom: 40 }}>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 20,
                      paddingHorizontal: 8,
                    }}>
                      <View style={{
                        width: 4,
                        height: 20,
                        backgroundColor: '#FF8C00',
                        borderRadius: 2,
                        marginRight: 12,
                      }} />
                      <Text style={{
                        fontSize: 18,
                        fontWeight: '700',
                        color: '#612915',
                        textShadowColor: 'rgba(255, 140, 0, 0.2)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 1,
                      }}>
                        {t('volume')}: {isNaN(volume) ? '0' : Math.round((volume || 0) * 100)}%
                      </Text>
                    </View>

                    {/* Volume Slider */}
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 20,
                      backgroundColor: 'rgba(255, 140, 0, 0.05)',
                      borderRadius: 15,
                      padding: 15,
                      borderWidth: 1,
                      borderColor: 'rgba(255, 140, 0, 0.1)',
                    }}>
                      <TouchableOpacity
                        onPress={() => {
                          playButtonSound(volume);
                          setVolumeSafely(0);
                        }}
                        style={{ 
                          marginRight: 12,
                          padding: 8,
                          backgroundColor: (volume || 0) === 0 ? 'rgba(255, 140, 0, 0.2)' : 'transparent',
                          borderRadius: 12,
                        }}
                      >
                        <Ionicons 
                          name="volume-mute" 
                          size={22}
                          color={(volume || 0) === 0 ? '#FF8C00' : '#666'}
                        />
                      </TouchableOpacity>
                  
                      {/* Volume Slider */}
                      <View style={{
                        flex: 1,
                        height: 36,
                        justifyContent: 'center',
                        marginHorizontal: 10,
                        paddingVertical: 8,
                      }}>
                        <Slider
                          style={{ width: '100%', height: 40 }}
                          minimumValue={0}
                          maximumValue={1}
                          value={volume || 0}
                          onValueChange={(value) => {
                            console.log('Slider value changed to:', value);
                            handleVolumeChange(value);
                          }}
                          onSlidingComplete={(value) => {
                            console.log('Slider completed at:', value);
                            handleVolumeChange(value);
                          }}
                          minimumTrackTintColor="#FF8C00"
                          maximumTrackTintColor="#E0E0E0"
                          thumbTintColor="white"
                        />
                      </View>
                      
                      <TouchableOpacity
                        onPress={() => {
                          playButtonSound(volume);
                          setVolumeSafely(1.0);
                        }}
                        style={{ 
                          marginLeft: 12,
                          padding: 8,
                          backgroundColor: (volume || 0) === 1.0 ? 'rgba(255, 140, 0, 0.2)' : 'transparent',
                          borderRadius: 12,
                        }}
                      >
                        <Ionicons 
                          name="volume-high" 
                          size={22}
                          color={(volume || 0) === 1.0 ? '#FF8C00' : '#666'}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Reset All Levels Section */}
                  <View style={{ marginBottom: 40 }}>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 20,
                      paddingHorizontal: 8,
                    }}>
                      <View style={{
                        width: 4,
                        height: 20,
                        backgroundColor: '#FF6B6B',
                        borderRadius: 2,
                        marginRight: 12,
                      }} />
                      <Text style={{
                        fontSize: 18,
                        fontWeight: '700',
                        color: '#612915',
                        textShadowColor: 'rgba(255, 107, 107, 0.2)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 1,
                      }}>
                        {t('gameProgress') || 'Game Progress'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        playButtonSound(volume);
                        handleResetAllLevels();
                      }}
                      style={{
                        backgroundColor: '#FF6B6B',
                        borderRadius: 18,
                        padding: 16,
                        alignItems: 'center',
                        minHeight: 50,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        shadowColor: '#FF6B6B',
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.4,
                        shadowRadius: 6,
                        elevation: 5,
                        borderWidth: 1,
                        borderColor: 'rgba(255, 107, 107, 0.3)',
                      }}
                    >
                      <Ionicons 
                        name="refresh-circle" 
                        size={20} 
                        color="white" 
                        style={{ marginRight: 8 }}
                      />
                      <Text style={{
                        color: 'white',
                        fontSize: 16,
                        fontWeight: 'bold',
                      }}>
                        {t('resetAllLevels') || 'Reset All Levels'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Done Button */}
                  <TouchableOpacity
                    onPress={() => {
                      playButtonSound(volume);
                      setShowSettingsModal(false);
                    }}
                    style={{
                      backgroundColor: '#FF8C00',
                      borderRadius: 25,
                      padding: 18,
                      alignItems: 'center',
                      minHeight: 60,
                      marginTop: 25,
                      elevation: 6,
                      shadowColor: '#FF8C00',
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.4,
                      shadowRadius: 8,
                      borderWidth: 2,
                      borderColor: 'rgba(255, 140, 0, 0.3)',
                    }}
                  >
                    <Text style={{
                      color: 'white',
                      fontSize: 20,
                      fontWeight: '800',
                      textShadowColor: 'rgba(0, 0, 0, 0.2)',
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 2,
                    }}>
                      {t('done')}
                    </Text>
                  </TouchableOpacity>

                  {/* Extra space at bottom for better scroll experience */}
                  <View style={{ height: isTablet ? 10 : 16 }} />
                </ScrollView>
              </View>
              </ImageBackground>
            </View>
          )}
          {/* Close the top-level transparent View opened after ImageBackground start */}
        </View>
      </ImageBackground>
      )}
      
      {/* Unlock Modal */}
      <Modal
        visible={showUnlockModal && !showParentalGate}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          playButtonSound(volume);
          setShowUnlockModal(false);
        }}
        supportedOrientations={['landscape', 'landscape-left', 'landscape-right']}
        statusBarTranslucent={true}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: isTablet ? 40 : 15,
            paddingVertical: isTablet ? 40 : 20,
            zIndex: 99999,
          }}
          onPress={() => {
            playButtonSound(volume);
            setShowUnlockModal(false);
          }}
        >
          <Pressable
            style={{
              backgroundColor: '#FFF8DC',
              borderRadius: isTablet ? 30 : 22,
              padding: isTablet ? 30 : 18,
              alignItems: 'center',
              width: '100%',
              maxWidth: isTablet ? 700 : 550,
              shadowColor: '#FF8C00',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.35,
              shadowRadius: 15,
              elevation: 15,
              borderWidth: 3,
              borderColor: '#FF8C00',
            }}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <TouchableOpacity
              onPress={() => {
                playButtonSound(volume);
                setShowUnlockModal(false);
              }}
              style={{
                position: 'absolute',
                top: isTablet ? 15 : 8,
                right: isTablet ? 15 : 8,
                padding: 6,
                zIndex: 10,
              }}
            >
              <Ionicons name="close-circle" size={isTablet ? 36 : 28} color="#612915" />
            </TouchableOpacity>
            
            {/* Lock Icon */}
            <View style={{ marginTop: isTablet ? 10 : 5, marginBottom: isTablet ? 16 : 10 }}>
              <Ionicons name="lock-closed" size={isTablet ? 60 : 45} color="#FF8C00" />
            </View>
            
            {/* Title */}
            <Text style={{
              fontSize: isTablet ? 26 : 18,
              fontWeight: '900',
              marginBottom: isTablet ? 10 : 6,
              color: '#612915',
              textAlign: 'center',
              textShadowColor: 'rgba(0,0,0,0.2)',
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 3,
            }}>
              {t('unlockLevel') || 'Unlock Mission'}
            </Text>
            
            {/* Message */}
            <Text style={{
              fontSize: isTablet ? 16 : 13,
              color: '#8B4513',
              marginBottom: isTablet ? 18 : 12,
              textAlign: 'center',
              lineHeight: isTablet ? 22 : 18,
              fontWeight: '600',
              paddingHorizontal: isTablet ? 10 : 5,
            }}>
              {t('unlockMessage') || 'Unlock all missions to access all levels and more!'}
            </Text>
            
            {/* IAP Information */}
            <View style={{
              backgroundColor: 'rgba(255, 140, 0, 0.15)',
              borderRadius: 12,
              padding: isTablet ? 12 : 10,
              marginBottom: isTablet ? 16 : 12,
              width: '70%',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: 'rgba(255, 140, 0, 0.3)',
            }}>
              <Text style={{
                fontSize: isTablet ? 18 : 14,
                fontWeight: 'bold',
                color: '#612915',
                marginBottom: isTablet ? 6 : 4,
              }}>
                {t('unlockAllMissions') || 'Unlock All Missions'}
              </Text>
              <Text style={{
                fontSize: isTablet ? 32 : 26,
                fontWeight: 'bold',
                color: '#FF8C00',
              }}>
                {products.length > 0 && products[0].localizedPrice ? products[0].localizedPrice : '$0.99'}
              </Text>
            </View>
            
            {/* Purchase Button */}
            <TouchableOpacity
              onPress={handleUnlock}
              disabled={purchaseInProgress}
              style={{
                backgroundColor: purchaseInProgress ? '#CCCCCC' : '#FF8C00',
                borderRadius: isTablet ? 28 : 22,
                padding: isTablet ? 18 : 12,
                alignItems: 'center',
                width: '100%',
                marginBottom: isTablet ? 10 : 8,
                shadowColor: '#FF8C00',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 6,
                borderWidth: 2,
                borderColor: 'rgba(255, 140, 0, 0.3)',
              }}
            >
              {purchaseInProgress ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={{
                  color: 'white',
                  fontSize: isTablet ? 22 : 17,
                  fontWeight: '800',
                  textShadowColor: 'rgba(0, 0, 0, 0.2)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}>
                  {Platform.OS === 'ios' ? (t('appStorePay') || 'Get it now') : (t('googlePlayPay') || 'Get it now')}
                </Text>
              )}
            </TouchableOpacity>
            
            {/* Restore Purchases Button */}
            <TouchableOpacity
              onPress={handleRestore}
              style={{
                padding: isTablet ? 10 : 6,
                alignItems: 'center',
              }}
            >
              <Text style={{
                color: '#612915',
                fontSize: isTablet ? 15 : 11,
                textDecorationLine: 'underline',
                fontWeight: '600',
              }}>
                {t('restorePurchases') || 'Restore Purchases'}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
      
      {/* Parental Gate Modal */}
      <ParentalGate
        visible={showParentalGate}
        onSuccess={handleParentalGateSuccess}
        onCancel={handleParentalGateCancel}
        title="Parental Permission Required"
        message="Please complete this challenge to access the store:"
      />
    </View>
    </ScreenLoadingWrapper>
  );
}
