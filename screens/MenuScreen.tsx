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
import * as RNIap from 'react-native-iap';
import { useAudioPlayer, createAudioPlayer } from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CommonActions } from '@react-navigation/native';

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
import { useDynamicStyles } from '../src/styles/styles';
import { useLocalization } from '../src/hooks/useLocalization';
import { useForceOrientation } from '../src/hooks/useForceOrientation';
import LanguageSelector from '../src/components/LanguageSelector';
import LevelTiles from '../src/components/LevelTiles';
import AnimatedFireflies from '../src/components/AnimatedFireflies';
import { setGlobalVolume } from '../src/components/LevelScreenTemplate';
import { useLevelCompletion } from '../src/hooks/useLevelCompletion';
import { getAnimals } from '../src/data/animals';
import { ImageCache } from '../src/utils/ImageCache';
import { ImageRegistry } from '../src/utils/PersistentImageRegistry';
import { preloadImages } from '../src/utils/preloadImages';
import ScreenLoadingWrapper from '../src/components/ScreenLoadingWrapper';
import ParentalGate from '../src/components/ParentalGate';


const menuBgSound = require('../src/assets/sounds/background_sounds/menu.mp3');
const BG_IMAGE = require('../src/assets/images/menu-screen.webp');
const LEVELS = ['farm', 'forest', 'ocean', 'desert', 'arctic', 'insects', 'savannah', 'jungle', 'birds'];

// Responsive tile size constants for different orientations
const MIN_TILE_SIZE_LANDSCAPE = 120;
const MAX_TILE_SIZE_LANDSCAPE = 200;
const MIN_TILE_SIZE_PORTRAIT = 140;  // Slightly bigger minimum for portrait
const MAX_TILE_SIZE_PORTRAIT = 180; // Slightly bigger maximum for portrait
const RESPONSIVE_MARGIN = 6;

// Apple App Store product id for unlocking all levels except Farm
const APPLE_PRODUCT_ID = 'animalDetectiveUnclock'; // Replace with your actual product id

const LEVEL_BACKGROUNDS: Record<string, any> = {
  farm: require('../src/assets/images/level-backgrounds/farm.webp'),
  forest: require('../src/assets/images/level-backgrounds/forest.webp'),
  ocean: require('../src/assets/images/level-backgrounds/ocean.webp'),
  desert: require('../src/assets/images/level-backgrounds/desert.webp'),
  arctic: require('../src/assets/images/level-backgrounds/arctic.webp'),
  insects: require('../src/assets/images/level-backgrounds/insect.webp'),
  savannah: require('../src/assets/images/level-backgrounds/savannah.webp'),
  jungle: require('../src/assets/images/level-backgrounds/jungle.webp'),
  birds: require('../src/assets/images/level-backgrounds/birds.webp'),
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
      backgroundColor: 'rgba(255, 0, 0, 0.1)', // Temporary red background for debugging
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
      // Apple Pay specific styling
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

const lockedLevels = LEVELS.filter(l => l !== 'farm');

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
  
  // Selected level state
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

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
    
    return { currentWidth, currentHeight, currentIsLandscape, isTablet, currentNumColumns, itemSize };
  }, [width, height]);
  


  // Animated gradient values
  const gradientPosition = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  
  // Bounce animation values
  const bounceScale = useSharedValue(1);
  const bounceScale2 = useSharedValue(1);

  // Use dimensions directly for more stable layouts
  const [layoutReady, setLayoutReady] = useState(true); // Set to true since wrapper handles loading

  const [bgReady, setBgReady] = useState(true); // Set to true since wrapper handles loading
  const [bgUri, setBgUri] = useState<string | null>(null);
  const [imgsReady, setImgsReady] = useState(true); // Set to true since wrapper handles loading
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [visitedCounts, setVisitedCounts] = useState<Record<string, number>>({});

  // Payment state
  const [iapInitialized, setIapInitialized] = useState(false);

  // Settings modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [volume, setVolume] = useState(0.8); // Default volume at 80%
  const [volumeLoaded, setVolumeLoaded] = useState(false); // Track if volume is loaded from storage
  

  
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
  
  // Handle volume change from slider
  const handleVolumeChange = useCallback((newVolume: number) => {
    console.log('Volume changing to:', newVolume);
    console.log('Current volume state:', volume);
    setVolume(newVolume);
    setGlobalVolume(newVolume);
    saveVolumeToStorage(newVolume);
  }, [saveVolumeToStorage, volume]);

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
  const [showParentalGate, setShowParentalGate] = useState(false);
  
  // Load unlocked state from storage on mount
  useEffect(() => {
    const loadUnlockedState = async () => {
      try {
        const stored = await AsyncStorage.getItem('unlocked_all_levels');
        if (stored === 'true') {
          setUnlocked(true);
        }
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

  // Use a ref to always get the latest player instance
  const playerRef = useRef<any>(null);
  const player = useAudioPlayer(menuBgSound);
  


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

  // Handle layout ready state - instant
  useEffect(() => {
    setLayoutReady(true);
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

  // Notify parent when screen is ready
  useEffect(() => {
    if (assetsLoaded && onScreenReady) {
      onScreenReady();
    }
  }, [onScreenReady, assetsLoaded]);

  // Load visited counts for each level from AsyncStorage (optimized)
  useEffect(() => {
    const loadVisitedCounts = async () => {
      try {
        // Load all at once for instant results
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

    // Load immediately - no delays
    loadVisitedCounts();
  }, []);

  // play on focus, stop on blur
  useEffect(() => {
    const onFocus = () => {
      try {
        // Reset state when coming back
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
    // Stop immediately before navigating away to avoid overlap during transitions
    const brSub = navigation.addListener('beforeRemove', () => {
      stopAndUnload();
    });
    return () => {
      try {
        fSub && fSub();
        bSub && bSub();
        brSub && brSub();
      } catch (e) {}
      stopAndUnload();
    };
  }, [navigation, stopAndUnload]);

  // IAP: Initialize and get products with Apple Pay support
  useEffect(() => {
    let purchaseUpdateSubscription: any;
    let purchaseErrorSubscription: any;

    async function initIAP() {
      if (Platform.OS !== 'ios') {
        setIapInitialized(true);
        return;
      }
      
      try {
        console.log('Initializing IAP connection...');
        await RNIap.initConnection();
        console.log('IAP connection successful');
        setIapInitialized(true);

        // Get product info
        console.log('Requesting products for SKU:', APPLE_PRODUCT_ID);
        try {
          const products = await RNIap.getProducts({ skus: [APPLE_PRODUCT_ID] });
          console.log('Received products:', products);
          if (products && products.length > 0) {
            setProducts(products);
          } else {
            console.warn('No products found for SKU:', APPLE_PRODUCT_ID);
            Alert.alert(
              'Product Not Found',
              `Product "${APPLE_PRODUCT_ID}" not found in App Store. Please check your App Store Connect configuration.`
            );
          }
        } catch (productError) {
          console.error('Error fetching products:', productError);
          Alert.alert(
            'Product Error',
            `Failed to fetch product information: ${productError.message || 'Unknown error'}`
          );
        }

        // Check if already purchased
        const purchases = await RNIap.getAvailablePurchases();
        const hasUnlock = purchases.some(
          (purchase) =>
            purchase.productId === APPLE_PRODUCT_ID ||
            purchase.productId === APPLE_PRODUCT_ID.replace('.unlockall', '.unlockall') // fallback
        );
        if (hasUnlock) {
          setUnlocked(true);
          saveUnlockedState(true);
        }

        // Listen for purchase updates
        purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase) => {
          const receipt = purchase.transactionReceipt;
          if (receipt) {
            try {
              // For Apple Pay transactions, we need to finish them properly
              await RNIap.finishTransaction({ purchase, isConsumable: false });
              if (purchase.productId === APPLE_PRODUCT_ID) {
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
          
          // Handle specific Apple Pay errors
          if (error.code === 'E_USER_CANCELLED') {
            // User cancelled Apple Pay - no need to show error
            return;
          }
          
          Alert.alert(
            t('purchaseError') || 'Purchase Error',
            error.message || t('somethingWentWrong') || 'Something went wrong. Please try again.'
          );
        });
      } catch (e) {
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
        RNIap.endConnection();
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Restore purchases with Apple Pay support
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
  }, [t]);

  // Show parental gate before purchase
  const handleUnlock = useCallback(() => {
    if (purchaseInProgress) {
      return;
    }
    
    if (!iapInitialized) {
      Alert.alert(
        'IAP Not Ready',
        'In-App Purchase system is not ready yet. Please wait a moment and try again.'
      );
      return;
    }
    
    // Show parental gate first
    setShowParentalGate(true);
  }, [purchaseInProgress, iapInitialized]);

  // Actual purchase handler (called after parental gate success)
  const handlePurchase = useCallback(async () => {
    setPurchaseInProgress(true);
    
    try {
      if (Platform.OS === 'ios') {
        // For iOS, use Apple Pay through react-native-iap
        // This will automatically present Apple Pay if available
        await RNIap.requestPurchase({ 
          sku: APPLE_PRODUCT_ID,
          andDangerouslyFinishTransactionAutomaticallyIOS: false // Let us handle transaction completion
        });
      } else {
        // For other platforms, use standard IAP
        await RNIap.requestPurchase({ sku: APPLE_PRODUCT_ID });
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
  }, [t, products]);

  // Handle parental gate success
  const handleParentalGateSuccess = useCallback(() => {
    setShowParentalGate(false);
    handlePurchase();
  }, [handlePurchase]);

  // Handle parental gate cancel
  const handleParentalGateCancel = useCallback(() => {
    setShowParentalGate(false);
  }, []);

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
                
                console.log('🗑️ Reset all levels and cleared all animal progress');
                
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
      playButtonSound(volume);
      
      // If level is locked and user hasn't unlocked all levels, show unlock modal and STOP
      if (isLocked && !unlocked) {
        console.log('Level is locked, showing unlock modal instead of opening level:', level);
        setShowUnlockModal(true);
        return; // CRITICAL: Don't proceed to open the level
      }
      
      // Only proceed if level is unlocked
      console.log('Level is unlocked, proceeding to open:', level);
      
      // Show destination background immediately
      setSelectedLevel(level);
      
      // Instant navigation - no delays
      try { 
        stopAndUnload(); 
      } catch {}
      
      if (typeof onSelectLevel === 'function') {
        onSelectLevel(level);
      }
    },
    [onSelectLevel, stopAndUnload, volume, unlocked]
  );

  // Get price string for unlock button with sale pricing
  const unlockPrice =
    products && products.length > 0 && products[0].localizedPrice
      ? products[0].localizedPrice
      : t('salePrice');
  
  const originalPrice = t('originalPrice');
  const salePrice = t('salePrice');



  // Modal for locked level
  const renderUnlockModal = () => {
    if (!showUnlockModal) return null;
    
    // Detect landscape mode where we want vertical button layout
    const isPhoneLandscape = isLandscape; // Use landscape orientation regardless of device size
    
    // Detect if this is a phone (smaller screen)
    const isPhone = Math.min(width, height) < 600; // Phones typically have smaller dimensions
    
    return (
      <Modal
        visible={showUnlockModal}
        animationType="fade"
        transparent
        presentationStyle="overFullScreen"
        statusBarTranslucent
        hardwareAccelerated
        onRequestClose={() => setShowUnlockModal(false)}
        supportedOrientations={['landscape', 'landscape-left', 'landscape-right', 'portrait', 'portrait-upside-down']}
      >
        <View style={responsiveStyles.modalOverlay} pointerEvents="auto">
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={[
              responsiveStyles.modalContent,
              isPhone && {
                maxWidth: Math.min(380, width * 0.95), // Wider for phones
                maxHeight: Math.min(350, height * 0.8), // Less tall for phones
                padding: getResponsiveSpacing(15, scaleFactor), // Less padding for phones
              }
            ]}>
            {/* Top Right Close Button */}
            <TouchableOpacity
              style={[
                responsiveStyles.modalTopRightCloseButton,
                isPhone && {
                  width: getResponsiveSpacing(25, scaleFactor),
                  height: getResponsiveSpacing(25, scaleFactor),
                  top: getResponsiveSpacing(8, scaleFactor),
                  right: getResponsiveSpacing(8, scaleFactor),
                }
              ]}
              onPress={() => {
                playButtonSound(volume);
                setShowUnlockModal(false);
              }}
            >
              <Text style={{
                color: '#FFFFFF',
                fontSize: isPhone ? getResponsiveFontSize(14, scaleFactor) : getResponsiveFontSize(16, scaleFactor),
                fontWeight: 'bold',
              }}>×</Text>
            </TouchableOpacity>
            
            <Text style={[
              responsiveStyles.modalTitle,
              isPhone && { fontSize: getResponsiveFontSize(12, scaleFactor) } // Much smaller title for phones
            ]}>{t('unlockAllLevelsToPlay')}</Text>
            <Text style={[
              responsiveStyles.modalText,
              isPhone && { 
                fontSize: getResponsiveFontSize(10, scaleFactor), // Much smaller text for phones
                marginBottom: getResponsiveSpacing(10, scaleFactor), // Even less spacing for phones
                lineHeight: getResponsiveFontSize(12, scaleFactor) // Tighter line height for phones
              } // Smaller text for phones
            ]}>
              {t('thisLevelIsLocked')}
            </Text>
            {Platform.OS === 'ios' && !unlocked && (
              <>
                <TouchableOpacity
                  style={[
                    responsiveStyles.modalUnlockButton, 
                    { 
                      backgroundColor: '#FF8C00',
                      shadowColor: '#FF8C00',
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.6,
                      shadowRadius: 15,
                      elevation: 12,
                      borderWidth: 3,
                      borderColor: '#FF6B00',
                      borderRadius: getResponsiveSpacing(15, scaleFactor),
                      minHeight: getResponsiveSpacing(45, scaleFactor),
                      paddingHorizontal: getResponsiveSpacing(20, scaleFactor),
                      paddingVertical: getResponsiveSpacing(12, scaleFactor),
                    },
                    isPhone && {
                      paddingHorizontal: getResponsiveSpacing(6, scaleFactor), // Much smaller padding
                      paddingVertical: getResponsiveSpacing(3, scaleFactor), // Much smaller vertical padding
                      minHeight: getResponsiveSpacing(20, scaleFactor), // Much smaller height
                      marginBottom: getResponsiveSpacing(2, scaleFactor), // Much less margin
                    }
                  ]}
                    onPress={() => {
                      playButtonSound(volume);
                      setShowUnlockModal(false);
                      handleUnlock();
                    }}
                    disabled={purchaseInProgress}
                  >
                    {purchaseInProgress ? (
                      // Show loading indicator during Apple Pay processing
                      <View style={{ alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text style={[responsiveStyles.modalUnlockButtonText, { 
                          marginTop: 1, 
                          fontSize: isPhone ? getResponsiveFontSize(8, scaleFactor) : responsiveStyles.modalUnlockButtonText.fontSize - 1, 
                          textShadowColor: 'rgba(0,0,0,0.7)', 
                          textShadowRadius: 1 
                        }]}>
                          {t('processing') || 'Processing...'}
                        </Text>
                      </View>
                    ) : isPhoneLandscape ? (
                      // Phone landscape: Stack icon and text vertically, centered
                      <View style={{ alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                        <Ionicons 
                          name="lock-open" 
                          size={isPhone ? getResponsiveFontSize(10, scaleFactor) : responsiveStyles.modalUnlockButtonText.fontSize + 2} 
                          color="#FFFFFF" 
                        />
                        <View style={{ alignItems: 'center', paddingVertical: isPhone ? 1 : 4 }}>
                          {/* Sale Badge */}
                          <View style={{
                            backgroundColor: '#FF4444',
                            paddingHorizontal: isPhone ? 6 : 12,
                            paddingVertical: isPhone ? 1 : 3,
                            borderRadius: isPhone ? 6 : 12,
                            marginBottom: isPhone ? 3 : 6,
                            shadowColor: '#FF4444',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 4,
                            elevation: 4,
                          }}>
                            <Text style={{
                              color: 'white',
                              fontSize: responsiveStyles.modalUnlockButtonText.fontSize - 4,
                              fontWeight: '800',
                              letterSpacing: 0.5,
                            }}>
{t('limitedSale')}
                            </Text>
                          </View>
                          
                          {/* Main Title */}
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                           
                            <Text style={[responsiveStyles.modalUnlockButtonText, { 
                              fontSize: responsiveStyles.modalUnlockButtonText.fontSize,
                              fontWeight: '700',
                              color: 'white',
                              textAlign: 'center',
                              textShadowColor: 'rgba(0,0,0,0.3)',
                              textShadowRadius: 2,
                            }]}>
                              {t('unlockAllMissions')}
                            </Text>
                          </View>
                          
                          {/* Pricing Section */}
                          <View style={{ 
                            flexDirection: 'row', 
                            alignItems: 'baseline', 
                            justifyContent: 'center',
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 20,
                            marginTop: 2,
                          }}>
                            <Text style={{ 
                              fontSize: responsiveStyles.modalUnlockButtonText.fontSize + 4, 
                              fontWeight: '900',
                              color: '#000000',
                              textShadowColor: 'rgba(0,0,0,0.5)', 
                              textShadowRadius: 3,
                              letterSpacing: 0.5,
                            }}>
                              {salePrice}
                            </Text>
                            <View style={{ marginLeft: 8, alignItems: 'center' }}>
                              <Text style={{ 
                                fontSize: responsiveStyles.modalUnlockButtonText.fontSize - 3, 
                                textDecorationLine: 'line-through',
                                color: '#000000',
                                fontWeight: '600',
                                textShadowColor: 'rgba(0,0,0,0.3)', 
                                textShadowRadius: 1,
                              }}>
                                {originalPrice}
                              </Text>
                              <Text style={{
                                fontSize: responsiveStyles.modalUnlockButtonText.fontSize - 5,
                                color: '#4CAF50',
                                fontWeight: '700',
                                marginTop: 1,
                              }}>
{t('save40')}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    ) : (
                      // Other orientations: Keep original horizontal layout
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, zIndex: 1 }}>
                        <Ionicons 
                          name="lock-open" 
                          size={responsiveStyles.modalUnlockButtonText.fontSize} 
                          color="#FFFFFF" 
                        />
                        <View style={{ alignItems: 'center', paddingVertical: isPhone ? 1 : 4 }}>
                          {/* Sale Badge */}
                          <View style={{
                            backgroundColor: '#FF4444',
                            paddingHorizontal: isPhone ? 6 : 12,
                            paddingVertical: isPhone ? 1 : 3,
                            borderRadius: isPhone ? 6 : 12,
                            marginBottom: isPhone ? 3 : 6,
                            shadowColor: '#FF4444',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 4,
                            elevation: 4,
                          }}>
                            <Text style={{
                              color: 'white',
                              fontSize: responsiveStyles.modalUnlockButtonText.fontSize - 4,
                              fontWeight: '800',
                              letterSpacing: 0.5,
                            }}>
{t('limitedSale')}
                            </Text>
                          </View>
                          
                          {/* Main Title */}
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                            <Image
                              source={require('../src/assets/images/unlock.png')}
                              style={{
                                width: responsiveStyles.modalUnlockButtonText.fontSize + 8,
                                height: responsiveStyles.modalUnlockButtonText.fontSize + 8,
                                marginRight: 8,
                              }}
                              resizeMode="contain"
                              fadeDuration={0}
                            />
                            <Text style={[responsiveStyles.modalUnlockButtonText, { 
                              fontSize: responsiveStyles.modalUnlockButtonText.fontSize,
                              fontWeight: '700',
                              color: 'white',
                              textAlign: 'center',
                              textShadowColor: 'rgba(0,0,0,0.3)',
                              textShadowRadius: 2,
                            }]}>
                              {t('unlockAllMissions')}
                            </Text>
                          </View>
                          
                          {/* Pricing Section */}
                          <View style={{ 
                            flexDirection: 'row', 
                            alignItems: 'baseline', 
                            justifyContent: 'center',
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 20,
                            marginTop: 2,
                          }}>
                            <Text style={{ 
                              fontSize: responsiveStyles.modalUnlockButtonText.fontSize + 4, 
                              fontWeight: '900',
                              color: '#000000',
                              textShadowColor: 'rgba(0,0,0,0.5)', 
                              textShadowRadius: 3,
                              letterSpacing: 0.5,
                            }}>
                              {salePrice}
                            </Text>
                            <View style={{ marginLeft: 8, alignItems: 'center' }}>
                              <Text style={{ 
                                fontSize: responsiveStyles.modalUnlockButtonText.fontSize - 3, 
                                textDecorationLine: 'line-through',
                                color: '#000000',
                                fontWeight: '600',
                                textShadowColor: 'rgba(0,0,0,0.3)', 
                                textShadowRadius: 1,
                              }}>
                                {originalPrice}
                              </Text>
                              <Text style={{
                                fontSize: responsiveStyles.modalUnlockButtonText.fontSize - 5,
                                color: '#4CAF50',
                                fontWeight: '700',
                                marginTop: 1,
                              }}>
{t('save40')}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                
              </>
            )}
          </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

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
 
  // Determine locked state for each level
  const getIsLocked = (level: string) => {
    console.log('getIsLocked called for level:', level, 'unlocked:', unlocked);
    if (level === 'farm') return false;
    
    // If user has purchased unlock, all levels are unlocked
    if (unlocked) {
      console.log('User has unlocked all levels, returning false for:', level);
      return false;
    }
    
    // Show locked styling for all other levels when not unlocked
    console.log('Returning true (locked) for level:', level);
    return true;
  };

  // Gather all assets that need to be preloaded
  const menuAssets = useMemo(() => {
    const assets = [
      BG_IMAGE,
      ...Object.values(LEVEL_BACKGROUNDS)
    ];
    return assets;
  }, []);

  return (
    <ScreenLoadingWrapper
      assetsToLoad={menuAssets}
      loadingText={t('loading') || 'Loading...'}
      backgroundColor="#FFDAB9"
      minLoadingTime={600} // Give time for level tiles to load
      onAssetsLoaded={() => setAssetsLoaded(true)}
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
        >
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
          {/* Animated Fireflies Background - only render after layout is ready */}
          {layoutReady && <AnimatedFireflies />}


          {currentIsLandscape ? (
            // LANDSCAPE LAYOUT
            <>
              {/* Settings button only (top-right) */}
              <View style={{ position: 'absolute', top: getResponsiveSpacing(12, scaleFactor), right: getResponsiveSpacing(12, scaleFactor), zIndex: 1000 }}>
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
                      {Platform.OS === 'ios' && !unlocked && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: getResponsiveSpacing(10, scaleFactor) }}>
                        
                          <ReAnimated.View style={bounceStyle}>
                            <TouchableOpacity
                              onPress={() => {
                                playButtonSound(volume);
                                handleUnlock();
                              }}
                              disabled={purchaseInProgress}
                              activeOpacity={0.9}
                              style={{ 
                                borderRadius: getResponsiveSpacing(18, scaleFactor),
                                backgroundColor: '#FF8C00',
                                paddingHorizontal: getResponsiveSpacing(12, scaleFactor),
                                paddingVertical: getResponsiveSpacing(6, scaleFactor),
                                elevation: 2,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.2,
                                shadowRadius: 2,
                              }}
                            >
                            <View style={{ alignItems: 'center', paddingVertical: 2 }}>
                              {/* Compact Sale Badge */}
                              <View style={{
                                backgroundColor: '#FF4444',
                                paddingHorizontal: 6,
                                paddingVertical: 1,
                                borderRadius: 8,
                                marginBottom: 2,
                              }}>
                                <Text style={{
                                  color: 'white',
                                  fontSize: getResponsiveFontSize(7, scaleFactor),
                                  fontWeight: '800',
                                  letterSpacing: 0.3,
                                }}>
                                  {t('sale')}
                                </Text>
                              </View>
                              
                              {/* Compact Title */}
                              <Text style={{ 
                                color: 'white', 
                                fontWeight: '700', 
                                fontSize: getResponsiveFontSize(8, scaleFactor), 
                                textShadowColor: 'rgba(0,0,0,0.4)', 
                                textShadowRadius: 2,
                                textAlign: 'center',
                                marginBottom: 1,
                              }}>
                                {t('unlockAllMissions')}
                              </Text>
                              
                              {/* Compact Pricing */}
                              <View style={{ 
                                flexDirection: 'row', 
                                alignItems: 'center',
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                                borderRadius: 10,
                              }}>
                                <Text style={{ 
                                  color: '#000000', 
                                  fontWeight: '900', 
                                  fontSize: getResponsiveFontSize(10, scaleFactor), 
                                  textShadowColor: 'rgba(0,0,0,0.5)', 
                                  textShadowRadius: 2,
                                }}>
                                  {salePrice}
                                </Text>
                                <Text style={{ 
                                  color: '#000000', 
                                  fontWeight: '600', 
                                  fontSize: getResponsiveFontSize(7, scaleFactor), 
                                  textDecorationLine: 'line-through', 
                                  marginLeft: 4,
                                  textShadowColor: 'rgba(0,0,0,0.3)', 
                                  textShadowRadius: 1,
                                }}>
                                  {originalPrice}
                                </Text>
                              </View>
                            </View>

                          </TouchableOpacity>
                        </ReAnimated.View>
                        </View>
                      )}
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
                style={responsiveStyles.scrollView}
                contentContainerStyle={[responsiveStyles.scrollContent, { paddingTop: getResponsiveSpacing(24, scaleFactor) }]}
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
                      {Platform.OS === 'ios' && !unlocked && (
                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: getResponsiveSpacing(12, scaleFactor) }}>
                          <Image
                            source={require('../src/assets/images/unlock.png')}
                            style={{
                              width: 56,
                              height: 56,
                              marginRight: getResponsiveSpacing(14, scaleFactor),
                            }}
                            resizeMode="contain"
                            fadeDuration={0}
                          />
                          <ReAnimated.View style={bounceStyle2}>
                            <TouchableOpacity
                              onPress={() => {
                                playButtonSound(volume);
                                handleUnlock();
                              }}
                              disabled={purchaseInProgress}
                              activeOpacity={0.9}
                              style={{ 
                                borderRadius: getResponsiveSpacing(20, scaleFactor),
                                backgroundColor: '#FF8C00',
                                paddingHorizontal: getResponsiveSpacing(16, scaleFactor),
                                paddingVertical: getResponsiveSpacing(8, scaleFactor),
                                elevation: 2,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.2,
                                shadowRadius: 2,
                              }}
                            >
                            <View style={{ alignItems: 'center', paddingVertical: 3 }}>
                              {/* Compact Sale Badge */}
                              <View style={{
                                backgroundColor: '#FF4444',
                                paddingHorizontal: 8,
                                paddingVertical: 2,
                                borderRadius: 10,
                                marginBottom: 3,
                              }}>
                                <Text style={{
                                  color: 'white',
                                  fontSize: getResponsiveFontSize(8, scaleFactor),
                                  fontWeight: '800',
                                  letterSpacing: 0.3,
                                }}>
                                  {t('sale')}
                                </Text>
                              </View>
                              
                              {/* Compact Title */}
                              <Text style={{ 
                                color: 'white', 
                                fontWeight: '700', 
                                fontSize: getResponsiveFontSize(10, scaleFactor), 
                                textShadowColor: 'rgba(0,0,0,0.4)', 
                                textShadowRadius: 2,
                                textAlign: 'center',
                                marginBottom: 2,
                              }}>
                                {t('unlockAllMissions')}
                              </Text>
                              
                              {/* Compact Pricing */}
                              <View style={{ 
                                flexDirection: 'row', 
                                alignItems: 'center',
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                paddingHorizontal: 8,
                                paddingVertical: 3,
                                borderRadius: 12,
                              }}>
                                <Text style={{ 
                                  color: '#000000', 
                                  fontWeight: '900', 
                                  fontSize: getResponsiveFontSize(12, scaleFactor), 
                                  textShadowColor: 'rgba(0,0,0,0.5)', 
                                  textShadowRadius: 2,
                                }}>
                                  {salePrice}
                                </Text>
                                <Text style={{ 
                                  color: '#000000', 
                                  fontWeight: '600', 
                                  fontSize: getResponsiveFontSize(9, scaleFactor), 
                                  textDecorationLine: 'line-through', 
                                  marginLeft: 6,
                                  textShadowColor: 'rgba(0,0,0,0.3)', 
                                  textShadowRadius: 1,
                                }}>
                                  {originalPrice}
                                </Text>
                              </View>
                            </View>

                            </TouchableOpacity>
                          </ReAnimated.View>
                        </View>
                      )}
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
          {renderUnlockModal()}
          
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
                  margin: getResponsiveSpacing(16, scaleFactor),
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
    </View>
    
    {/* Parental Gate Modal */}
    <ParentalGate
      visible={showParentalGate}
      onSuccess={handleParentalGateSuccess}
      onCancel={handleParentalGateCancel}
    />
    </ScreenLoadingWrapper>
  );
}
