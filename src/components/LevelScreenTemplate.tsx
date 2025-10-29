import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  Animated,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Dimensions,
  useWindowDimensions,
  InteractionManager,
} from 'react-native';
import { Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Asset } from 'expo-asset';
import {
  useAudioPlayer,
  createAudioPlayer,
} from 'expo-audio';

import SpriteAnimation from './SpriteAnimation';
import InstructionBubble from './InstructionBubble';
import { useDynamicStyles } from '../styles/styles';
import NavigationButtons from './NavigationButtons';
import DiscoverScreen from './DiscoverScreen';
import MovingBg from './MovingBg';
import ResponsiveMovingBg from './ResponsiveMovingBg';
import AnimatedBubbles from './AnimatedBubbles';
import AnimatedSand from './AnimatedSand';
import AnimatedSnow from './AnimatedSnow';
import AnimatedFireflies from './AnimatedFireflies';
import AnimatedLeaves from './AnimatedLeaves';
import AnimatedRain from './AnimatedRain';
import AnimatedFeathers from './AnimatedFeathers';
import AnimatedFlowers from './AnimatedFlowers';
// --- Add localization import ---
import { useLocalization } from '../hooks/useLocalization';
// --- Add smooth rotation hook ---
import { useSmoothRotation } from '../hooks/useSmoothRotation';
  import { useLevelCompletion } from '../hooks/useLevelCompletion';
import AnimatedReanimated from 'react-native-reanimated';
  import { getResponsiveSpacing, getScaleFactor, isTablet } from '../utils/responsive';
import { getBackgroundStyles, getLevelBackgroundColor } from '../utils/backgroundPositioning';
import ResponsiveLevelBackground from './ResponsiveLevelBackground';
import { getResponsiveBackgroundStyles, getDeviceInfo } from '../utils/responsiveBackgroundSystem';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getLabelPositioning, shouldRenderLabel } from '../utils/labelPositioning';
import { getAllLandscapeButtonPositions } from '../utils/landscapeButtonPositioning';
import BackgroundMusicManager, { BackgroundMusicManager as BGMClass } from '../services/BackgroundMusicManager';
import FacebookAnalytics from '../services/FacebookAnalytics';

  // Water Progress Bar Component
  const WaterProgressBar = ({ progress, totalAnimals, level, isCompleted }: { progress: number; totalAnimals: number; level: string; isCompleted?: boolean }) => {
    const [waterHeight] = useState(() => new Animated.Value(0));
    const { width: screenW, height: screenH } = useWindowDimensions();
    const isLandscape = screenW > screenH;
    
    // Animate water level when progress changes
    useEffect(() => {
      const targetHeight = (progress / totalAnimals) * 100;
      Animated.timing(waterHeight, {
        toValue: targetHeight,
        duration: 400,
        useNativeDriver: false,
      }).start();
    }, [progress, totalAnimals, waterHeight]);

    // Get level-appropriate colors
    const getLevelColors = () => {
      switch (level.toLowerCase()) {
        case 'ocean':
          return {
            waterColor: 'rgba(30, 144, 255, 0.7)',
            containerColor: 'rgba(70, 130, 180, 0.3)',
            bubbleColor: 'rgba(173, 216, 230, 0.8)'
          };
        case 'forest':
          return {
            waterColor: 'rgba(34, 139, 34, 0.7)',
            containerColor: 'rgba(107, 142, 35, 0.3)',
            bubbleColor: 'rgba(144, 238, 144, 0.8)'
          };

        case 'desert':
          return {
            waterColor: 'rgba(255, 165, 0, 0.7)',
            containerColor: 'rgba(210, 180, 140, 0.3)',
            bubbleColor: 'rgba(255, 218, 185, 0.8)'
          };
        case 'jungle':
          return {
            waterColor: 'rgba(0, 100, 0, 0.7)',
            containerColor: 'rgba(85, 107, 47, 0.3)',
            bubbleColor: 'rgba(152, 251, 152, 0.8)'
          };
        case 'savannah':
          return {
            waterColor: 'rgba(218, 165, 32, 0.7)',
            containerColor: 'rgba(244, 164, 96, 0.3)',
            bubbleColor: 'rgba(255, 228, 181, 0.8)'
          };
        case 'farm':
          return {
            waterColor: 'rgba(50, 205, 50, 0.7)',
            containerColor: 'rgba(124, 252, 0, 0.3)',
            bubbleColor: 'rgba(173, 255, 47, 0.8)'
          };
        case 'birds':
          return {
            waterColor: 'rgba(135, 206, 235, 0.7)',
            containerColor: 'rgba(176, 196, 222, 0.3)',
            bubbleColor: 'rgba(230, 230, 250, 0.8)'
          };
        case 'insects':
          return {
            waterColor: 'rgba(255, 20, 147, 0.7)',
            containerColor: 'rgba(255, 182, 193, 0.3)',
            bubbleColor: 'rgba(255, 240, 245, 0.8)'
          };
        default:
          return {
            waterColor: 'rgba(30, 144, 255, 0.7)',
            containerColor: 'rgba(70, 130, 180, 0.3)',
            bubbleColor: 'rgba(173, 216, 230, 0.8)'
          };
      }
    };

    const colors = getLevelColors();
    
    // Responsive sizing
    const barWidth = Math.min(screenW * 0.08, 60);
    const barHeight = Math.min(screenH * 0.25, 200);
    
    // Position based on device and orientation
    const getPosition = () => {
      const isPhone = Math.min(screenW, screenH) < 768;
      
      if (isLandscape) {
        return {
          position: 'absolute' as const,
          top: isPhone ? screenH * 0.15 : screenH * 0.2,
          right: isPhone ? 15 : 30,
          width: barWidth,
          height: barHeight,
        };
      } else {
        return {
          position: 'absolute' as const,
          top: isPhone ? screenH * 0.1 : screenH * 0.15,
          right: isPhone ? 10 : 20,
          width: barWidth,
          height: barHeight,
        };
      }
    };

    return (
      <View style={[
        getPosition(),
        {
          backgroundColor: colors.containerColor,
          borderRadius: 15,
          borderWidth: 2,
          borderColor: 'rgba(255, 255, 255, 0.5)',
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 5,
        }
      ]}>
        {/* Water fill */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: colors.waterColor,
            height: waterHeight.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
              extrapolate: 'clamp',
            }),
          }}
        />
        
        {/* Progress text */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{
            color: '#fff',
            fontSize: Math.min(barWidth * 0.2, 12),
            fontWeight: 'bold',
            textAlign: 'center',
            textShadowColor: '#000',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 2,
          }}>
            {isCompleted ? 'Complete!' : `${progress}/${totalAnimals}`}
          </Text>
        </View>
        
        {/* Animated bubbles for water effect */}
        {progress > 0 && (
          <View style={StyleSheet.absoluteFillObject}>
            {[...Array(3)].map((_, index) => (
              <WaterBubble 
                key={index} 
                delay={index * 300} 
                color={colors.bubbleColor}
                containerHeight={barHeight}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  // Animated bubble component for water effect
  const WaterBubble = ({ delay, color, containerHeight }: { delay: number; color: string; containerHeight: number }) => {
    const [bubbleAnim] = useState(() => new Animated.Value(0));
    const [opacityAnim] = useState(() => new Animated.Value(0));
    
    useEffect(() => {
      const animateBubble = () => {
        bubbleAnim.setValue(containerHeight);
        opacityAnim.setValue(1);
        
        Animated.parallel([
          Animated.timing(bubbleAnim, {
            toValue: 0,
            duration: 1200 + Math.random() * 600,
            useNativeDriver: false,
          }),
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 0.8,
              duration: 300,
              useNativeDriver: false,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: false,
            }),
          ]),
        ]).start(() => {
          setTimeout(animateBubble, Math.random() * 2000);
        });
      };
      
      setTimeout(animateBubble, delay);
    }, [bubbleAnim, opacityAnim, delay, containerHeight]);
    
      const leftPosition = Math.random() * 60;
  const bubbleSize = 6 + Math.random() * 4;
  
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: `${leftPosition}%`,
        bottom: bubbleAnim,
        width: bubbleSize,
        height: bubbleSize,
        borderRadius: 10,
        backgroundColor: color,
        opacity: opacityAnim,
      }}
    />
  );
  };

// Background music is now managed globally by BackgroundMusicManager

let globalVolumeMultiplier = 1.0; // Global volume setting from settings

// Function to set global volume (called from settings)
export const setGlobalVolume = (volume: number) => {
  globalVolumeMultiplier = volume;
  // Update the background music manager's volume too
  BackgroundMusicManager.setGlobalVolume(volume);
};

// Function to get current global volume (for video players)
export const getGlobalVolume = () => {
  return globalVolumeMultiplier;
};

// --- MOVING BG MAP: Map levelName to moving background asset/uri ---
const MOVING_BG_MAP: Record<string, string | number | undefined> = {
  'farm': require('../assets/images/level-backgrounds/farm.webp'),
  'forest': require('../assets/images/level-backgrounds/forest.webp'),
  'ocean': require('../assets/images/level-backgrounds/ocean.webp'),
  'desert': require('../assets/images/level-backgrounds/desert.webp'),
  'arctic': require('../assets/images/level-backgrounds/arctic.webp'),
  'insects': require('../assets/images/level-backgrounds/insect.webp'),
  'savannah': require('../assets/images/level-backgrounds/savannah.webp'),
  'jungle': require('../assets/images/level-backgrounds/jungle.webp'),
  'birds': require('../assets/images/level-backgrounds/birds.webp'),
};

type Animal = {
  id: number;
  name: string;
  type: 'sprite' | 'image';
  source: any;
  frames?: any;
  spriteSheetSize?: { w: number; h: number };
  sound?: any;
  labelSound?: any;
  isMoving?: boolean;
  movingDirection?: 'left' | 'right';
};

type Props = {
  levelName: string;
  animals: Animal[];
  backgroundImageUri: string | null;
  skyBackgroundImageUri: string | null;
  onBackToMenu: () => void;
  bgMusic?: string | number; // allow prop for override
  initialIndex?: number; // optional: allows caller to set initial animal index synchronously
};

  const FADE_DURATION = 0; // Instant navigation - no fade
  const CONTENT_FADE_DURATION = 0;

export default function LevelScreenTemplate({
  levelName,
  animals,
  backgroundImageUri,
  skyBackgroundImageUri,
  onBackToMenu,
  bgMusic, // allow prop for override
  initialIndex,
}: Props) {
  const navigation = useNavigation();
  // --- Use localization hook ---
  const { t } = useLocalization();
    const { isLevelCompleted } = useLevelCompletion();
  const safeAreaInsets = useSafeAreaInsets();

  // 1️⃣ Hoist your hook: only call it once, at the top level
  const dynamicStyles = useDynamicStyles();
  
  // --- Use smooth rotation for iOS-like behavior ---
  const { animatedStyle, stableDimensions } = useSmoothRotation({
    damping: 25,
    stiffness: 350,
    mass: 0.7,
  });

  const [currentAnimalIndex, setCurrentAnimalIndex] = useState(
    typeof initialIndex === 'number' ? initialIndex : 0
  );
  const [showName, setShowName] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showInstruction, setShowInstruction] = useState(true);
  const [bgLoading, setBgLoading] = useState(false); // Start with no loading state
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [arrowAnim] = useState(() => new Animated.Value(0));
  const [animalFadeAnim] = useState(() => new Animated.Value(1)); // Start fully visible
  const soundRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);
  const isSoundPlayingRef = useRef<boolean>(false);
  const confettiAnimRefs = useRef<Animated.Value[]>([]);
    const [showDiscoverScreen, setShowDiscoverScreen] = useState(false);
    const [visitedAnimals, setVisitedAnimals] = useState<Set<number>>(new Set());
  const [levelCompleted, setLevelCompleted] = useState(false);
    const [wasAlreadyCompleted, setWasAlreadyCompleted] = useState(false); // Track if level was already completed when entering
  
  // Video overlay state (videos disabled, so always false)
  const [showIntroVideo, setShowIntroVideo] = useState(false); // Videos disabled - show UI immediately
  const [videoSource, setVideoSource] = useState<any>(null);
    const [showCompletionCelebration, setShowCompletionCelebration] = useState(false);
    const [screenLocked, setScreenLocked] = useState(false);
      const [hasClickedCurrentAnimal, setHasClickedCurrentAnimal] = useState(false); // Track if user clicked current animal
  const [buttonsDisabledManually, setButtonsDisabledManually] = useState(false);
  const isClickingRef = useRef(false);

  

  const labelShowTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickFlagClearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [canRenderLabel, setCanRenderLabel] = useState(animals.length > 0);
  const [allAssetsReady, setAllAssetsReady] = useState(true); // Start as ready
  const [initialIndexHydrated, setInitialIndexHydrated] = useState(animals.length > 0);
  
  // Update hasClickedCurrentAnimal and show/hide label when navigating between animals
  useEffect(() => {
    const isCurrentAnimalVisited = visitedAnimals.has(currentAnimalIndex);
    setHasClickedCurrentAnimal(isCurrentAnimalVisited);
    
    if (isCurrentAnimalVisited && initialIndexHydrated && !isTransitioning) {
      // If revisiting an already-clicked animal after hydration, show the label immediately
      setCanRenderLabel(true);
      setShowName(true);
      console.log('🏷️ Auto-showing label on revisit. Index:', currentAnimalIndex);
    } else if (!isClickingRef.current) {
      // Otherwise hide during navigation to prevent flashes (but not during active clicking)
      setShowName(false);
      setCanRenderLabel(false);
      console.log('🔒 Hiding label on navigation. Visited:', isCurrentAnimalVisited, 'index:', currentAnimalIndex);
    } else {
      console.log('🚫 Skipping showName update during click operation');
    }
  }, [currentAnimalIndex, visitedAnimals, initialIndexHydrated, isTransitioning]);

  

	// Always reset name scale on navigation; it will be bumped on click
	useEffect(() => {
		try { nameScaleAnim.setValue(0); } catch {}
		console.log('🔄 Reset nameScaleAnim on navigation');
	}, [currentAnimalIndex]);

  // Save visited animals progress to AsyncStorage
  const saveProgress = useCallback(async (visited: Set<number>) => {
    try {
      const progressKey = `animalProgress_${levelName.toLowerCase()}`;
      const visitedArray = Array.from(visited);
      await AsyncStorage.setItem(progressKey, JSON.stringify(visitedArray));
      console.log(`💾 Saved progress for ${levelName}:`, visitedArray);
    } catch (error) {
      console.error('Error saving animal progress:', error);
    }
  }, [levelName]);

  // Save current animal index per level
  const saveCurrentIndex = useCallback(async (index: number) => {
    try {
      const indexKey = `animalCurrentIndex_${levelName.toLowerCase()}`;
      await AsyncStorage.setItem(indexKey, String(index));
      console.log(`💾 Saved current index for ${levelName}:`, index);
    } catch (error) {
      console.error('Error saving current animal index:', error);
    }
  }, [levelName]);

  // Load visited animals progress from AsyncStorage (optimized for instant rendering)
  const loadProgress = useCallback(async () => {
    // Check if data was preloaded during loading screen
    const preloadedData = (global as any)._preloadedAssets?.[levelName.toLowerCase()];
    
    // Set defaults immediately for instant rendering
    if (animals.length > 0) {
      // Only set currentAnimalIndex if it's not already valid (0 or initialIndex)
      if (currentAnimalIndex < 0 || currentAnimalIndex >= animals.length) {
        const defaultIndex = typeof initialIndex === 'number' ? initialIndex : 0;
        setCurrentAnimalIndex(defaultIndex);
      }
      setVisitedAnimals(new Set());
      setHasClickedCurrentAnimal(false);
      setShowName(false);
      setInitialIndexHydrated(true); // Mark as hydrated immediately
      // If data was preloaded, use it immediately for even faster loading
      if (preloadedData) {
        // Mark all assets as ready immediately since they were preloaded
        setAllAssetsReady(true);
      }
    }

    // Then load actual progress in background and update if needed
    try {
      const progressKey = `animalProgress_${levelName.toLowerCase()}`;
      const savedProgress = await AsyncStorage.getItem(progressKey);
      if (savedProgress) {
        const visitedArray: number[] = JSON.parse(savedProgress);
        const visitedSet = new Set<number>(visitedArray);
        setVisitedAnimals(visitedSet);
        console.log(`📂 Loaded progress for ${levelName}:`, visitedArray);

        // Only update index if no initialIndex was provided and we found a better index
        if (typeof initialIndex !== 'number') {
          let indexToShow = currentAnimalIndex; // Start with current index
          if (animals.length > 0) {
            if (visitedSet.size < animals.length) {
              // Find first unvisited animal
              for (let i = 0; i < animals.length; i++) {
                if (!visitedSet.has(i)) { 
                  indexToShow = i; 
                  break; 
                }
              }
            } else {
              // All visited: try to restore saved index if available
              const indexKey = `animalCurrentIndex_${levelName.toLowerCase()}`;
              const savedIndexStr = await AsyncStorage.getItem(indexKey);
              const parsed = parseInt(savedIndexStr ?? '', 10);
              if (!isNaN(parsed) && parsed >= 0 && parsed < animals.length) {
                indexToShow = parsed;
              }
            }
          }
          // Only update if we found a different index
          if (indexToShow !== currentAnimalIndex) {
            setCurrentAnimalIndex(indexToShow);
          }
        }

        // Update UI flags based on the actual current animal index
        const actualIndex = typeof initialIndex === 'number' ? initialIndex : currentAnimalIndex;
        const isIndexVisited = visitedSet.has(actualIndex);
        setHasClickedCurrentAnimal(isIndexVisited);
      }
    } catch (error) {
      console.error('Error loading animal progress:', error);
    }
    
    // Always mark assets as ready after loading (whether preloaded or not)
    setAllAssetsReady(true);
  }, [levelName, animals.length, initialIndex]);

  // Load progress when component mounts or level changes (layout effect to avoid hook order change warnings)
  useEffect(() => {
    // Always load visited animals progress, even when initialIndex is provided
    loadProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelName]);


  // Prefetch current animal sprite to avoid pop-in when returning to the level
  const prefetchCurrentAnimal = useCallback(() => {
    try {
      const animal = animals[currentAnimalIndex];
      if (animal && animal.type === 'sprite' && typeof animal.source === 'number') {
        Asset.fromModule(animal.source).downloadAsync().catch(() => {});
      }
    } catch {}
  }, [animals, currentAnimalIndex]);

  // Also refresh progress when the screen gains focus (covers return-from-menu case)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Always avoid re-hydration reset on focus; just ensure assets are hot
      prefetchCurrentAnimal();
    });
    return unsubscribe;
  }, [navigation, loadProgress, prefetchCurrentAnimal, levelName]);

  // Save progress whenever visitedAnimals changes
  useEffect(() => {
    if (visitedAnimals.size > 0) {
      saveProgress(visitedAnimals);
    }
  }, [visitedAnimals, saveProgress]);

  // Persist current animal index whenever it changes
  useEffect(() => {
    if (animals.length > 0 && currentAnimalIndex >= 0 && currentAnimalIndex < animals.length) {
      saveCurrentIndex(currentAnimalIndex);
    }
  }, [currentAnimalIndex, animals.length, saveCurrentIndex]);
    

  
  // Glow animation values
  const [glowAnim] = useState(() => new Animated.Value(0));
  const [nameScaleAnim] = useState(() => new Animated.Value(0));
  const [clickBounceAnim] = useState(() => new Animated.Value(1));
  const glowLoopRef = useRef<Animated.CompositeAnimation | null>(null);
    
    // Bouncing hand animation for unclicked animals
    const [handBounceAnim] = useState(() => new Animated.Value(0));

    // Ensure label scale reflects visibility even when returning to a level on the first animal
    useEffect(() => {
      if (showName) {
        nameScaleAnim.setValue(1.1);
      }
    }, [showName, currentAnimalIndex]);
    
    // After initial hydration, enable label rendering so visited animals can show labels
    useEffect(() => {
      if (initialIndexHydrated) {
        setCanRenderLabel(true);
      }
    }, [initialIndexHydrated]);
    
    // Auto-show label when navigating back to an already-clicked animal
    useEffect(() => {
      if (!isTransitioning && canRenderLabel) {
        const alreadyVisited = visitedAnimals.has(currentAnimalIndex);
        if (alreadyVisited) {
          setShowName(true);
        }
      }
    }, [isTransitioning, canRenderLabel, visitedAnimals, currentAnimalIndex]);
    
    // Start bouncing hand animation
    useEffect(() => {
      const startHandBounce = () => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(handBounceAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(handBounceAnim, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };
      
      startHandBounce();
    }, [handBounceAnim]);
    

    
    // Completion celebration animation values
    const [celebrationScaleAnim] = useState(() => new Animated.Value(0));
    const [celebrationOpacityAnim] = useState(() => new Animated.Value(0));
    const [badgePulseAnim] = useState(() => new Animated.Value(1));
    const [badgeGiantAnim] = useState(() => new Animated.Value(1));
    const [badgeSlideX] = useState(() => new Animated.Value(0));
    const [badgeSlideY] = useState(() => new Animated.Value(0));
    const [celebrationPulseAnim] = useState(() => new Animated.Value(1));
    const [arrowPulseAnim] = useState(() => new Animated.Value(1));
    
    // Counter pop and glow animations
    const [counterPopAnim] = useState(() => new Animated.Value(1));
    const [counterGlowAnim] = useState(() => new Animated.Value(0));
    const [counterButtonGlowAnim] = useState(() => new Animated.Value(0.5));
    
    // Track previous visited count to detect increments
    const prevVisitedCount = useRef(0);
    
    // Trigger counter animation when visitedAnimals increments
    useEffect(() => {
      if (visitedAnimals.size > prevVisitedCount.current && prevVisitedCount.current !== 0) {
        // Pop animation
        Animated.sequence([
          Animated.timing(counterPopAnim, {
            toValue: 1.4,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(counterPopAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();

        // Glow animation
        Animated.sequence([
          Animated.timing(counterGlowAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(counterGlowAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      }
      prevVisitedCount.current = visitedAnimals.size;
    }, [visitedAnimals.size]);
    
    // Start continuous glow animation for counter button
    useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(counterButtonGlowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(counterButtonGlowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, []);
    
    // Badge measurement for centering animation
    const badgeRef = useRef<View | null>(null);
    const [badgeWindowLayout, setBadgeWindowLayout] = useState<{
      x: number;
      y: number;
      width: number;
      height: number;
    } | null>(null);

    // Function to start the celebration
    const startCelebration = useCallback(() => {
      console.log('🎉 STARTING CELEBRATION NOW');
      setShowCompletionCelebration(true);
      setScreenLocked(false); // Unlock screen when celebration appears
      setButtonsDisabledManually(false); // Re-enable buttons when celebration appears
      
      // Play celebration sound
      if (!isMuted) {
        try {
          const celebrationPlayer = createAudioPlayer(require('../assets/sounds/other/yay.mp3'));
          celebrationPlayer.play();
          
          // Clean up sound when it finishes
          celebrationPlayer.addListener('playbackStatusUpdate', (status: any) => {
            if (status.didJustFinish) {
              celebrationPlayer.remove();
            }
          });
        } catch (error) {
          console.warn('Error playing celebration sound:', error);
        }
      }
      
      // Start badge pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(badgePulseAnim, {
            toValue: 1.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(badgePulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 3 }
      ).start();
      
      // Show celebration overlay after a brief delay
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(celebrationOpacityAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.spring(celebrationScaleAnim, {
            toValue: 1,
            tension: 80,
            friction: 5,
            useNativeDriver: true,
          }),
        ]).start();
        
        // Start pulsing animation for 3 times only, then stop
        Animated.loop(
          Animated.sequence([
            Animated.timing(celebrationPulseAnim, {
              toValue: 1.1,
              duration: 450,
              useNativeDriver: true,
            }),
            Animated.timing(celebrationPulseAnim, {
              toValue: 1,
              duration: 450,
              useNativeDriver: true,
            }),
          ]),
          { iterations: 3 } // Only 3 pulses
        ).start(() => {
          // After celebration pulses finish, start arrow pulsing
          Animated.loop(
            Animated.sequence([
              Animated.timing(arrowPulseAnim, {
                toValue: 1.2,
                duration: 600,
                useNativeDriver: true,
              }),
              Animated.timing(arrowPulseAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
              }),
            ]),
            { iterations: -1 } // Infinite loop
          ).start();
        });
        // No automatic transition - wait for user to click button
      }, 400); // Wait briefly before showing celebration overlay
    }, [isMuted, badgePulseAnim, celebrationOpacityAnim, celebrationScaleAnim, celebrationPulseAnim, setShowCompletionCelebration]);



  // Continuous glow animation while name is showing
  useEffect(() => {
    if (showName) {
      // Start continuous glow loop
      const glowLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
              duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.1,
              duration: 500,
            useNativeDriver: true,
          }),
        ]),
        { iterations: -1 } // Infinite loop
      );
      
      glowLoopRef.current = glowLoop;
      glowLoop.start();
    } else {
      // Stop glow loop and reset
      if (glowLoopRef.current) {
        glowLoopRef.current.stop();
        glowLoopRef.current = null;
      }
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    // Cleanup function
    return () => {
      if (glowLoopRef.current) {
        glowLoopRef.current.stop();
        glowLoopRef.current = null;
      }
    };
  }, [showName, glowAnim]);

  // Audio ducking constants
  const NORMAL_BG_VOLUME = 0.8; // Reduced by 20% from 1.0
  const DUCKED_BG_VOLUME = 0.1; // Reduced from 0.2 to 0.1 for better ducking

  // Helper functions for audio ducking
  const duckBackgroundMusic = useCallback(() => {
    try {
      BackgroundMusicManager.duckVolume();
    } catch (e) {
      console.warn('Error ducking background music:', e);
    }
  }, []);

  const restoreBackgroundMusic = useCallback(() => {
    try {
      BackgroundMusicManager.restoreVolume();
    } catch (e) {
      console.warn('Error restoring background music:', e);
    }
  }, []);

  const currentAnimal = useMemo(() => {
    // Return animal immediately when available, don't wait for allAssetsReady
    if (animals.length > 0 && currentAnimalIndex >= 0 && currentAnimalIndex < animals.length) {
      return animals[currentAnimalIndex];
    }
    return null;
  }, [animals, currentAnimalIndex]);
  const hasAnimals = animals.length > 0;

  const [roadAnimation] = useState(() => new Animated.Value(0));
  const { width: screenW, height: screenH } = useWindowDimensions();
  const isLandscape = screenW > screenH;

  // Track which background is currently visible
  const [wasMoving, setWasMoving] = useState(currentAnimal?.isMoving ?? false);
  // Start with correct opacity based on initial animal state
  const [movingBgOpacity] = useState(() => new Animated.Value(currentAnimal?.isMoving ? 1 : 0.001)); // Use 0.001 instead of 0 to prevent flash
  const [imageBgOpacity] = useState(() => new Animated.Value(currentAnimal?.isMoving ? 0.001 : 1));

  // --- Determine which moving background to use based on levelName ---
  // Priority: MOVING_BG_MAP[levelName] > skyBackgroundImageUri > undefined
  const movingBgSource = useMemo(() => {
    const key = levelName.toLowerCase();
    console.log('Moving bg debug:', {
      levelName,
      key,
      hasMappedBg: !!MOVING_BG_MAP[key],
      skyBackgroundImageUri,
      currentAnimalIsMoving: currentAnimal?.isMoving
    });
    if (MOVING_BG_MAP[key]) {
      return MOVING_BG_MAP[key];
    }
    return skyBackgroundImageUri;
  }, [levelName, skyBackgroundImageUri, currentAnimal?.isMoving]);

  // Initialize BackgroundMusicManager mute state on mount
  useEffect(() => {
    console.log(`🎵 Initializing level ${levelName} with muted=${isMuted}`);
    BackgroundMusicManager.setMuted(isMuted);
  }, []); // Only on mount

  // --- BG MUSIC EFFECT (only play if instruction bubble is visible) ---
  // NOTE: Do NOT depend on isMuted here to avoid tearing down/recreating the player and losing position
  useEffect(() => {
    // Use global background music manager
    if (showInstruction) {
      console.log(`🎵 Level ${levelName}: showInstruction=true, playing music`);
      // Always play the background music for this level first
      BackgroundMusicManager.playBackgroundMusic(levelName).catch(e => {
        console.warn('Failed to play background music:', e);
      });
    } else {
      console.log(`🎵 Level ${levelName}: showInstruction=false, pausing music`);
      // Pause when instruction is hidden
      BackgroundMusicManager.pause();
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelName, bgMusic, showInstruction]);

  // Handle mute state changes separately
  useEffect(() => {
    console.log(`🔇 Level ${levelName}: mute state changed to ${isMuted}`);
    BackgroundMusicManager.setMuted(isMuted);
  }, [isMuted, levelName]);

  // No cleanup needed - background music is managed globally and persists across levels

  // Mute/unmute is now handled by the background music effect above

  const isHydrated = initialIndexHydrated;

  // When currentAnimal?.isMoving changes, crossfade the backgrounds
  useEffect(() => {
      // Instant background transitions
      const transitionDuration = 0; // Instant background switching
      
    if (currentAnimal?.isMoving) {
      // Fade in moving bg, fade out image bg
      Animated.parallel([
        Animated.timing(movingBgOpacity, {
          toValue: 1,
            duration: transitionDuration,
          useNativeDriver: true,
        }),
        Animated.timing(imageBgOpacity, {
          toValue: 0,
            duration: transitionDuration,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setWasMoving(true);
      });
    } else {
      // Fade in image bg, fade out moving bg
      Animated.parallel([
        Animated.timing(movingBgOpacity, {
          toValue: 0,
            duration: transitionDuration,
          useNativeDriver: true,
        }),
        Animated.timing(imageBgOpacity, {
          toValue: 1,
            duration: transitionDuration,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setWasMoving(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentAnimal?.isMoving, currentAnimal?.name]);

  useEffect(() => {
    Animated.loop(
      Animated.timing(roadAnimation, {
        toValue: 1,
          duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, [roadAnimation]);

  useEffect(() => {
    try {
      // Removed AudioModule.setAudioMode call that was causing the error
    } catch (error: any) {
      console.warn('Error setting audio mode:', error);
    }
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(arrowAnim, {
          toValue: 1,
            duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(arrowAnim, {
          toValue: 0,
            duration: 300,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [arrowAnim]);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.remove();
        soundRef.current = null;
        isSoundPlayingRef.current = false;
      }
      // Background music is now managed globally - no cleanup needed
    };
  }, []);

    // Initialize level completion state for already completed levels
    useEffect(() => {
      if (levelName && isLevelCompleted(levelName)) {
        console.log(`🎯 Level ${levelName} is already completed - initializing completed state`);
        setLevelCompleted(true);
        setWasAlreadyCompleted(true); // Mark as already completed to prevent celebration
        // Set all animals as visited for completed levels
        const allAnimalIndices = new Set<number>();
        for (let i = 0; i < animals.length; i++) {
          allAnimalIndices.add(i);
        }
        setVisitedAnimals(allAnimalIndices);
      }
    }, [levelName, isLevelCompleted, animals.length]);

  const stopSound = useCallback(async (unload = false) => {
    if (soundRef.current) {
      try {
        // Use synchronous pause to avoid blocking
        soundRef.current.pause();
        if (unload) {
          soundRef.current.remove();
          soundRef.current = null;
        }
      } catch (error) {
        console.warn('Error stopping/unloading sound:', error);
        // Clean up reference even if error occurs
        if (unload) {
          soundRef.current = null;
        }
      } finally {
        isSoundPlayingRef.current = false;
      }
    }
  }, []);

  // Safe audio playback with proper error handling
  const playSounds = useCallback(async () => {
    if (isMuted || !currentAnimal?.sound) {
      // If muted or no sound, check for celebration immediately
      console.log('🔇 No sound - checking for celebration:', { levelCompleted, showCompletionCelebration, isMuted, hasSound: !!currentAnimal?.sound });
      if (levelCompleted && !showCompletionCelebration && !wasAlreadyCompleted) {
        console.log('🔇 No sound playing, starting celebration immediately');
        startCelebration();
      }
      return;
    }

    // Additional safety checks to prevent crashes during navigation
    if (isTransitioning) {
      console.warn('Blocked playSounds during transition');
      return;
    }

    if (!currentAnimal) {
      console.warn('currentAnimal is null in playSounds');
      return;
    }

    try {
      // Stop whatever was playing before
      await stopSound(true);

      // Add additional safety check here after async operation
      if (!currentAnimal || isTransitioning) {
        console.warn('currentAnimal became null or transition started during stopSound');
        return;
      }

      // Duck the background music volume instead of pausing
      duckBackgroundMusic();

      isSoundPlayingRef.current = true;

      // Create audio player with proper error handling
      let animalPlayer;
      try {
        animalPlayer = createAudioPlayer(currentAnimal.sound);
        soundRef.current = animalPlayer;
      } catch (error) {
        console.warn('Error creating audio player:', error);
        isSoundPlayingRef.current = false;
        restoreBackgroundMusic();
        return;
      }

      // Add listener with proper error handling
      animalPlayer.addListener('playbackStatusUpdate', (status: any) => {
        try {
          if (status.didJustFinish) {
            // Safely remove the player
            try {
              animalPlayer.remove();
            } catch (error) {
              console.warn('Error removing animal player:', error);
            }
            
            if (soundRef.current === animalPlayer) {
              soundRef.current = null;
            }

            // Then optionally play the label sound - with additional safety check
            if (!isMuted && currentAnimal?.labelSound) {
              try {
                const labelPlayer = createAudioPlayer(currentAnimal.labelSound);
                soundRef.current = labelPlayer;
                
                // Add listener for label sound
                labelPlayer.addListener('playbackStatusUpdate', (labelStatus: any) => {
                  try {
                    if (labelStatus.didJustFinish) {
                      labelPlayer.remove();
                      if (soundRef.current === labelPlayer) {
                        soundRef.current = null;
                      }
                      isSoundPlayingRef.current = false;

                      // Restore background music volume
                      restoreBackgroundMusic();
                      
                      // Check if we should start celebration after label sound finishes
                      console.log('🔊 Label sound finished, checking celebration:', { levelCompleted, showCompletionCelebration });
                      if (levelCompleted && !showCompletionCelebration && !wasAlreadyCompleted) {
                        startCelebration();
                      }
                    }
                  } catch (error) {
                    console.warn('Error in label sound listener:', error);
                    isSoundPlayingRef.current = false;
                    restoreBackgroundMusic();
                  }
                });
                
                // Play the label sound
                labelPlayer.play();
              } catch (error) {
                console.warn('Error playing label sound:', error);
                isSoundPlayingRef.current = false;
                restoreBackgroundMusic();
                
                // Check for celebration even if label sound fails
                if (levelCompleted && !showCompletionCelebration && !wasAlreadyCompleted) {
                  startCelebration();
                }
              }
            } else {
              isSoundPlayingRef.current = false;

              // Restore background music volume
              restoreBackgroundMusic();
              
              // Check if we should start celebration after animal sound finishes (no label)
              console.log('🔊 Animal sound finished (no label), checking celebration:', { levelCompleted, showCompletionCelebration });
              if (levelCompleted && !showCompletionCelebration && !wasAlreadyCompleted) {
                startCelebration();
              }
            }
          }
        } catch (error) {
          console.warn('Error in animal sound listener:', error);
          isSoundPlayingRef.current = false;
          restoreBackgroundMusic();
        }
      });

      // Play the animal sound
      animalPlayer.play();
    } catch (error) {
      console.warn('Error playing sounds:', error);
      isSoundPlayingRef.current = false;
      if (soundRef.current) {
        try {
          soundRef.current.remove();
        } catch (unloadError) {
          console.warn('Error removing sound after play error:', unloadError);
        }
        soundRef.current = null;
      }
      // Restore background music volume in case of error
      restoreBackgroundMusic();
    }
  }, [currentAnimal, isMuted, stopSound, isTransitioning, duckBackgroundMusic, restoreBackgroundMusic, levelCompleted, showCompletionCelebration, startCelebration]);

  // --- REWRITE: handleAnimalPress as the single tap handler for animal card ---
  // 2) tweak your handleAnimalPress to use volume ducking instead of pause/resume
  const handleAnimalPress = useCallback(() => {
    console.log('Animal pressed! isTransitioning:', isTransitioning, 'showName:', showName, 'currentAnimal:', currentAnimal?.name);
    
    // Register user interaction for audio playback
    BackgroundMusicManager.onUserInteraction();
    
    if (isTransitioning || !currentAnimal) {
      console.log('Blocked by transition or no current animal');
      return;
    }
    try { animalFadeAnim.setValue(1); } catch {}
    // Smooth, responsive click feedback
    try {
      (clickBounceAnim as any).stopAnimation?.();
      clickBounceAnim.setValue(1);
      Animated.sequence([
        Animated.timing(clickBounceAnim, { toValue: 1.08, duration: 90, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.spring(clickBounceAnim, { toValue: 1, friction: 5, tension: 160, useNativeDriver: true })
      ]).start();
    } catch {}
    
      // Block animal clicks if buttons are manually disabled
      if (buttonsDisabledManually) {
        console.log('🚫 Animal click blocked: buttons manually disabled');
        return;
      }
      
      // Set flag to prevent useEffect from interfering with showName updates
      isClickingRef.current = true;
      
      // Capture if this was the first time clicking this animal
      const wasAlreadyVisited = visitedAnimals.has(currentAnimalIndex);
      
      // Track animal discovery if it's the first time
      if (!wasAlreadyVisited) {
        FacebookAnalytics.trackAnimalDiscovered(
          currentAnimal.name,
          levelName,
          visitedAnimals.size + 1
        );
      }
      
      // Always add current animal to visited animals when clicked
      setVisitedAnimals(prev => {
        const newVisited = new Set(prev);
        newVisited.add(currentAnimalIndex);
        console.log(`🔥 CLICKED animal ${currentAnimalIndex}, visited now:`, Array.from(newVisited).sort());
        // Persist progress immediately to avoid losing state on quick navigation
        try { void saveProgress(newVisited); } catch (e) { /* noop */ }
        
        // Show the label immediately after updating visited animals
        if (labelShowTimeoutRef.current) {
          clearTimeout(labelShowTimeoutRef.current);
          labelShowTimeoutRef.current = null;
        }
        labelShowTimeoutRef.current = setTimeout(() => {
          console.log('🏷️ Showing label after visitedAnimals update');
          setShowName(true);
          setCanRenderLabel(true);
          
          // Set name scale to big size on first click of this specific animal
          if (!wasAlreadyVisited) {
            nameScaleAnim.setValue(1.1);
            console.log('🏷️ First time clicking this animal - nameScaleAnim set to 1.1');
          }
          
          // Clear clicking flag after state updates complete
          if (clickFlagClearTimeoutRef.current) {
            clearTimeout(clickFlagClearTimeoutRef.current);
            clickFlagClearTimeoutRef.current = null;
          }
          clickFlagClearTimeoutRef.current = setTimeout(() => {
            isClickingRef.current = false;
            console.log('🏷️ Clicking operation complete, flag cleared');
          }, 50);
        }, 0);
        
        // Check if this click completes the level and disable buttons immediately
        if (newVisited.size === animals.length && !levelCompleted) {
          console.log('🔘 DISABLING BUTTONS IMMEDIATELY - last animal clicked');
          setButtonsDisabledManually(true);
        }
        
        // Just mark as ready for celebration, don't start it yet
        if (newVisited.size === animals.length && !levelCompleted) {
          console.log('✅ ALL ANIMALS CLICKED - READY FOR CELEBRATION AFTER SOUND', {
            newVisitedSize: newVisited.size,
            animalsLength: animals.length,
            currentIndex: currentAnimalIndex
          });
          setLevelCompleted(true);
          setScreenLocked(true); // Lock screen until modal appears
          
          // Pause background music when level is completed
          BackgroundMusicManager.pause();
          console.log('🎵 Background music paused for level completion');
            
            // Pulse in place 3 times (no movement)
            Animated.loop(
              Animated.sequence([
                Animated.spring(badgePulseAnim, { toValue: 1.25, useNativeDriver: true, tension: 140, friction: 6 }),
                Animated.spring(badgePulseAnim, { toValue: 1.0, useNativeDriver: true, tension: 140, friction: 6 }),
              ]),
              { iterations: 3 }
            ).start();
            console.log('📍 Badge pulsing 3 times in place for full completion');
            
            // Fallback: If celebration doesn't start within 3 seconds, start it anyway
            setTimeout(() => {
              if (!showCompletionCelebration && !wasAlreadyCompleted) {
                console.log('🚨 FALLBACK: Starting celebration after timeout');
                startCelebration();
              }
            }, 3000);
          }
          
          return newVisited;
        });

      // Mark that user has clicked the current animal - enable next button
      setHasClickedCurrentAnimal(true);
      
      console.log('🏷️ Animal clicked, wasAlreadyVisited:', wasAlreadyVisited);
      
      // Always play sound when animal is clicked
      // Background music ducking will be handled in playSounds()
      // kill any in‑flight animal audio, then play the new one
      stopSound(true).then(() => {
        // Play a short click sound feedback, then the animal/label sounds
        try {
          const clickPlayer = createAudioPlayer(require('../assets/sounds/other/animal_click.mp3'));
          clickPlayer.play();
          clickPlayer.addListener('playbackStatusUpdate', (status: any) => {
            if (status.didJustFinish) {
              clickPlayer.remove();
            }
          });
        } catch {}
        playSounds();
      });
    }, [showName, playSounds, stopSound, restoreBackgroundMusic, isTransitioning, currentAnimal, glowAnim, nameScaleAnim, buttonsDisabledManually, badgeWindowLayout, visitedAnimals, currentAnimalIndex]);

  // Remove toggleShowName entirely

  const handleNavigation = useCallback((direction: 'next' | 'prev') => {
    // Register user interaction for audio playback
    BackgroundMusicManager.onUserInteraction();
    
    // Stop animal sounds but keep background music playing
    console.log(`🎵 Stopping animal sounds before ${direction} navigation`);
    stopSound(true);
    
    // Restore background music volume when navigating
    restoreBackgroundMusic();
    
    if (!hasAnimals || isTransitioning) {
      return;
    }

    // Prevent multiple rapid navigation attempts
    if (isTransitioning) {
      console.warn('Navigation already in progress, ignoring request');
      return;
    }

    setIsTransitioning(true);
    // Immediately hide any visible label and cancel pending click/label timers to prevent flashes
    try { setShowName(false); } catch {}
    setCanRenderLabel(false);
    if (labelShowTimeoutRef.current) { clearTimeout(labelShowTimeoutRef.current); labelShowTimeoutRef.current = null; }
    if (clickFlagClearTimeoutRef.current) { clearTimeout(clickFlagClearTimeoutRef.current); clickFlagClearTimeoutRef.current = null; }
    isClickingRef.current = false;
    stopSound(true);

    // Instant navigation - no animation delay
    const processNavigation = () => {
      // Double-check that we still have animals and valid state
      if (!hasAnimals || animals.length === 0) {
        console.warn('No animals available during navigation');
        setIsTransitioning(false);
        return;
      }

      let newIndex;
      if (direction === 'next') {
        newIndex = currentAnimalIndex + 1;
        
          if (newIndex >= animals.length) {
            // Check if all animals have been visited (clicked)
            const allAnimalsVisited = visitedAnimals.size === animals.length;
            
            console.log(`🚀 REACHED END: visited=${visitedAnimals.size}/${animals.length}, allVisited=${allAnimalsVisited}`, Array.from(visitedAnimals).sort());
            
            if (allAnimalsVisited && !levelCompleted) {
              console.log('✅ ALL ANIMALS CLICKED - SHOWING DISCOVER SCREEN');
          setLevelCompleted(true);
              
              // Track level completion
              FacebookAnalytics.trackLevelCompleted(
                levelName,
                animals.length,
                Date.now() // You can calculate actual completion time if needed
              );
              
              // Show DiscoverScreen first for all levels, then CongratsModal
              setShowDiscoverScreen(true);
          setIsTransitioning(false);
          return;
            } else if (allAnimalsVisited && levelCompleted) {
              // Level already completed, don't allow going past last animal
              console.log('🚫 Level completed, staying at last animal');
          setIsTransitioning(false);
          return;
            } else if (!allAnimalsVisited) {
              // Find the first unvisited animal starting from index 0
              let foundUnvisited = false;
              for (let i = 0; i < animals.length; i++) {
                if (!visitedAnimals.has(i)) {
                  newIndex = i;
                  foundUnvisited = true;
                  console.log(`🔄 GOING TO UNVISITED animal at index ${i}`);
                  break;
                }
              }
              // If somehow no unvisited animals found, go to first animal
              if (!foundUnvisited) {
                newIndex = 0;
                console.log('⚠️ NO UNVISITED FOUND, going to 0');
              }
            }
        }
      } else {
        newIndex = (currentAnimalIndex - 1 + animals.length) % animals.length;
      }

      // Additional safety check before setting index
      if (newIndex < 0 || newIndex >= animals.length) {
        console.warn('Invalid index calculated during navigation:', newIndex);
        setIsTransitioning(false);
        return;
      }



      // Instant index update - no animation delay
      setCurrentAnimalIndex(newIndex);
      animalFadeAnim.setValue(1);
      
      // Immediately end transition and re-enable label rendering
      setIsTransitioning(false);
      setCanRenderLabel(true);
    };
    
    // Execute navigation immediately
    processNavigation();
  }, [
      hasAnimals,
      isTransitioning,
      stopSound,
      animalFadeAnim,
      currentAnimalIndex,
      animals.length,
      levelCompleted,
      visitedAnimals
  ]);

  const handleNext = useCallback(() => {
      console.log(`🎯 NEXT BUTTON pressed, currentIndex: ${currentAnimalIndex}, levelCompleted: ${levelCompleted}, isTransitioning: ${isTransitioning}`);
      
      // Block navigation if buttons are manually disabled
      if (buttonsDisabledManually) {
        console.log('🚫 Navigation blocked: buttons manually disabled');
        return;
      }
      
    // Play button sound
    if (!isMuted) {
      try {
        const buttonPlayer = createAudioPlayer(require('../assets/sounds/other/button.mp3'));
        buttonPlayer.play();
        
        // Clean up sound when it finishes
        buttonPlayer.addListener('playbackStatusUpdate', (status: any) => {
          if (status.didJustFinish) {
            buttonPlayer.remove();
          }
        });
      } catch (error) {
        console.warn('Error playing button sound:', error);
      }
    }
    
    handleNavigation('next');
    }, [handleNavigation, isMuted, buttonsDisabledManually]);

  const handlePrev = useCallback(() => {
      // Block navigation if buttons are manually disabled
      if (buttonsDisabledManually) {
        console.log('🚫 Navigation blocked: buttons manually disabled');
        return;
      }
      
    // Play button sound
    if (!isMuted) {
      try {
        const buttonPlayer = createAudioPlayer(require('../assets/sounds/other/button.mp3'));
        buttonPlayer.play();
        
        // Clean up sound when it finishes
        buttonPlayer.addListener('playbackStatusUpdate', (status: any) => {
          if (status.didJustFinish) {
            buttonPlayer.remove();
          }
        });
      } catch (error) {
        console.warn('Error playing button sound:', error);
      }
    }
    
    handleNavigation('prev');
    }, [handleNavigation, isMuted, buttonsDisabledManually]);

  const goToHome = useCallback(() => {
    // Register user interaction for audio playback
    BackgroundMusicManager.onUserInteraction();
    
    // NUCLEAR STOP: Stop all audio before returning to menu
    console.log('🎵 NUCLEAR STOP: Stopping all audio before returning to menu');
    BGMClass.globalStopAllAudio();
    
    // Persist current progress before leaving the level
    try { void saveProgress(visitedAnimals); } catch (e) { /* noop */ }
    stopSound(false);
    // Stop level background music when going back to menu
    BackgroundMusicManager.cleanup();
    onBackToMenu();
  }, [stopSound, onBackToMenu, saveProgress, visitedAnimals]);

  const toggleMute = () => {
    const changingToMuted = !isMuted;
    setIsMuted(changingToMuted);
    BackgroundMusicManager.setMuted(changingToMuted);
    
    if (changingToMuted) {
      // Pause animal sound
      try {
        if (soundRef.current) {
          soundRef.current.pause();
        }
      } catch (e) {}
    } else {
      // Unmuting: resume animal sound from its paused position if present
      if (soundRef.current) {
        try {
          soundRef.current.play();
        } catch (e) {}
      }
    }
  };

  const startOver = useCallback(() => {
      setShowDiscoverScreen(false);
      setShowCompletionCelebration(false);
      setScreenLocked(false);
      setButtonsDisabledManually(false);
    stopSound(true);
    setIsTransitioning(true);
    animalFadeAnim.setValue(0);
    setCurrentAnimalIndex(0);
    setShowName(false);
    setLevelCompleted(false);
      setVisitedAnimals(new Set());
      setHasClickedCurrentAnimal(false); // Reset click tracking when starting over
      
      // Clear saved progress from AsyncStorage
      const clearProgress = async () => {
        try {
          const progressKey = `animalProgress_${levelName.toLowerCase()}`;
          await AsyncStorage.removeItem(progressKey);
          console.log(`🗑️ Cleared progress for ${levelName}`);
        } catch (error) {
          console.error('Error clearing animal progress:', error);
        }
      };
      clearProgress();
      
      // Reset celebration animations
      celebrationScaleAnim.setValue(0);
      celebrationOpacityAnim.setValue(0);
      badgePulseAnim.setValue(1);
      badgeGiantAnim.setValue(1);
      badgeSlideX.setValue(0);
      badgeSlideY.setValue(0);
      celebrationPulseAnim.setValue(1);
      arrowPulseAnim.setValue(1);

    // Instant fade-in
    Animated.timing(animalFadeAnim, {
        toValue: 1,
        duration: FADE_DURATION,
        easing: Easing.linear,
        useNativeDriver: true,
    }).start(() => {
        setIsTransitioning(false);
    });

  }, [stopSound, animalFadeAnim]);

    // Handle when DiscoverScreen closes (after all animals are revealed)
    const handleDiscoverScreenClose = useCallback(() => {
      setShowDiscoverScreen(false);
      // Navigate back to menu after discover screen closes
      goToHome();
    }, [goToHome]);

    // Handle when user wants to go back to level from DiscoverScreen (without congrats)
    const handleBackToLevel = useCallback((animalIndex?: number) => {
      setShowDiscoverScreen(false);
      // If an animal index is provided, navigate to that animal
      if (typeof animalIndex === 'number' && animalIndex >= 0 && animalIndex < animals.length) {
        setCurrentAnimalIndex(animalIndex);
      }
      
      // Resume background music when returning to level after 7/7 completion
      if (levelCompleted && !isMuted) {
        BackgroundMusicManager.resume().catch(e => {
          console.warn('Failed to resume background music:', e);
        });
        console.log('🎵 Background music resumed after returning from discover screen');
      }
      
      // Don't show congrats modal - just return to level
    }, [animals.length, levelCompleted, isMuted, levelName, bgMusic]);

  const renderAnimal = () => {
    if (!currentAnimal) return null;
    const key = `${currentAnimal.id}-${currentAnimal.name}`;
    const isPhone = Math.min(screenW, screenH) < 768;
      const isCurrentAnimalUnclicked = !visitedAnimals.has(currentAnimalIndex);

    const animalComponent = currentAnimal.type === 'sprite' && currentAnimal.frames && currentAnimal.spriteSheetSize ? (
      <SpriteAnimation
        key={key}
        frames={currentAnimal.frames}
        source={currentAnimal.source}
        spriteSheetSize={currentAnimal.spriteSheetSize}
        style={dynamicStyles.animalImage}
      />
    ) : (
      <Image
        key={key}
        source={currentAnimal.source}
        style={dynamicStyles.animalImage}
        fadeDuration={0}
        progressiveRenderingEnabled={true}
      />
    );

      // Create the animal with bouncing hand overlay
      const animalWithHand = (
        <View style={{ alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {animalComponent}
          
          {/* Bouncing hand for unclicked animals - only after hydration and not during transitions */}
          {(() => {
            console.log('👋 Hand check - animal:', currentAnimalIndex, 'unclicked:', isCurrentAnimalUnclicked, 'hydrated:', initialIndexHydrated, 'transitioning:', isTransitioning);
            return initialIndexHydrated && !isTransitioning && isCurrentAnimalUnclicked;
          })() && (
            <Animated.View
              style={(() => {
                const isTablet = Math.min(screenW, screenH) >= 768;
                const topPosition = isTablet ? '35%' : '40%';
                const leftPosition = isTablet ? '10%' : '30%';
                
                console.log('🤚 HAND POSITIONING:', {
                  isTablet,
                  screenW,
                  screenH,
                  minDimension: Math.min(screenW, screenH),
                  topPosition,
                  leftPosition,
                  deviceType: isTablet ? 'tablet' : 'phone'
                });
                
                return {
                  position: 'absolute',
                  top: topPosition,
                  left: leftPosition,
                  transform: [
                    {
                      translateY: handBounceAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -15],
                      }),
                    },
                    {
                      scale: handBounceAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [1, 1.1, 1],
                      }),
                    },
                    {
                      rotate: '15deg',
                    },
                  ],
                  opacity: handBounceAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.7, 1, 0.7],
                  }),
                };
              })()}
            >
              <Image
                source={require('../assets/images/hand.png')}
                style={{
                  width: Math.min(screenW, screenH) * 0.12,
                  height: Math.min(screenW, screenH) * 0.12,
                }}
                resizeMode="contain"
              />
            </Animated.View>
          )}
        </View>
    );

    // Wrap in a View for phones (removed pointerEvents="none" to allow touches)
    if (isPhone) {
      return (
          <View>
            {animalWithHand}
        </View>
      );
    }

      return animalWithHand;
  };

  useEffect(() => {
    confettiAnimRefs.current = Array.from({ length: 30 }).map(() => new Animated.Value(0));
  }, []);



  const onLoadEnd = useCallback(() => {
    setBgLoading(false);
    // When background loads, check if we can show everything together
    if (allAssetsReady) {
      console.log('🎬 Background loaded, animals already ready - showing everything');
    } else {
      console.log('🎬 Background loaded, waiting for animals...');
    }
  }, [allAssetsReady]);

  // Compute the marginTop for animals based on level and device
  const getAnimalMarginTop = () => {
    const baseMargin = Math.max(getResponsiveSpacing(70, getScaleFactor(screenW, screenH)), screenH * 0.1);
    
    console.log('getAnimalMarginTop debug:', {
      levelName,
      levelNameLower: levelName.toLowerCase(),
      screenW,
      screenH,
      isLandscape,
      platform: Platform.OS,
      baseMargin,
      isPhone: Math.min(screenW, screenH) < 768
    });
    // Forest: Special positioning for tablets and phones
    if (levelName.toLowerCase() === 'forest') {
      const isTablet = Math.min(screenW, screenH) >= 768;
      if (isTablet) {
        // Move Forest animals up by 10% on tablets
        return baseMargin - (screenH * 0.1);
      } else {
        // Phone positioning
        if (isLandscape) {
          // Move animals up by 30% of screen height in phone landscape
          return baseMargin + 40 - (screenH * 0.3);
        } else {
          // Move animals up by 10% of screen height in phone portrait
          return baseMargin + 100 - (screenH * 0.1);
        }
      }
    }

    // Other levels: move animals up on phones, push down on tablets
    if (levelName.toLowerCase() === 'farm' || levelName.toLowerCase() === 'arctic' || levelName.toLowerCase() === 'jungle' ||  levelName.toLowerCase() === 'ocean' || levelName.toLowerCase() === 'desert' || levelName.toLowerCase() === 'insects' || levelName.toLowerCase() === 'birds') {
      const isPhone = Math.min(screenW, screenH) < 768;
      if (isPhone) {
        if (isLandscape) {
          // Move animals up by 30% of screen height in phone landscape
          return baseMargin + 40 - (screenH * 0.3);
        } else {
          // Move animals up by 10% of screen height in phone portrait
          return baseMargin + 100 - (screenH * 0.1);
        }
      }
      // Tablets: push down by 100px (existing behavior)
      return baseMargin + 100;
    }
    
    // Birds level - move animals up by 20% on tablets
    if (levelName.toLowerCase() === 'birds') {
      const isTablet = Math.min(screenW, screenH) >= 768;
        
        // Landscape mode - move animals down by 20% on iPad, up by 25% on phones
        if (isLandscape) {
          if (isTablet) {
            return baseMargin + (screenH * 0.2); // Move animals down 20% on iPad landscape
          } else {
            return baseMargin + 50 - (screenH * 0.25); // Move up 25% from phone position in landscape
          }
        }
        
      if (isTablet) {
        return baseMargin - (screenH * 0.2);
      } else {
        // Phone positioning - move animals up
        return baseMargin + 50;
      }
    }
    

    
            // Farm level in mobile portrait
        if (levelName.toLowerCase() === 'farm' && !isLandscape) {
            return baseMargin + 145;
        }
    
            // Farm level on iPad - move animals up by 30px
        if (levelName.toLowerCase() === 'farm' && screenW >= 768 && Platform.OS === 'ios') {
            return baseMargin - 30;
          }
          
        // Landscape tablets - push animals down by 10%
        if (isLandscape && Math.min(screenW, screenH) >= 768) {
          return baseMargin + (screenH * 0.1);
        }
      
      // Forest level: no further adjustments
    
    // Jungle level - move animals up by 20% on tablets
    if (levelName.toLowerCase() === 'jungle') {
      const isTablet = Math.min(screenW, screenH) >= 768;
      if (isTablet) {
        return baseMargin + (screenH * 0.1);
      } else {
        // Phone positioning - move up by 10% on mobile
        if (!isLandscape) {
          return baseMargin + 350 - (screenH * 0.1); // portrait - moved up 10%
        }
        if (isLandscape && (Platform.OS === 'ios' || Platform.OS === 'android')) {
          return baseMargin + 50 - (screenH * 0.2); // mobile landscape - moved up 10%
        }
      }
    }
    
    // Desert level - different positioning for tablets vs phones
    if (levelName.toLowerCase() === 'desert') {
      // Use smaller dimension to detect phones vs tablets (more reliable than just width)
      const isTablet = Math.min(screenW, screenH) >= 768;
      console.log('Desert positioning:', {
        isTablet,
        isMoving: currentAnimal?.isMoving,
        baseMargin,
        screenH,
        screenW,
        smallerDimension: Math.min(screenW, screenH),
        finalMargin: isTablet 
          ? (currentAnimal?.isMoving ? baseMargin + (screenH * 0.1) : baseMargin + (screenH * 0.4))
          : baseMargin - (screenH * 0.2)
      });
      
      // On tablets, move non-moving animals up by 10%, moving animals down by 10%
      if (isTablet) {
        if (!currentAnimal?.isMoving) {
          return baseMargin - (screenH * 0.1);
        } else {
          return baseMargin + (screenH * 0.1);
        }
      } else {
          // On phones, move animals up by 20%
          return baseMargin - (screenH * 0.2);
      }
    }
    
    // Savannah level - move animals up on phones
    if (levelName.toLowerCase() === 'savannah') {
      const isPhone = Math.min(screenW, screenH) < 768;
      if (isPhone) {
        // Move animals up by 10% on phones
        return baseMargin - (screenH * 0.1);
      }
      // Tablets keep default positioning
      return baseMargin;
    }
    
          // Ocean level - move animals up by 20% on iPhones, down by 10% on tablets
    if (levelName.toLowerCase() === 'ocean') {
      const isPhone = Math.min(screenW, screenH) < 768;
      if (isPhone) {
        return baseMargin - (screenH * 0.2); // Move up 20% on iPhones
      } else {
        return baseMargin + (screenH * 0.1); // Move down 10% on tablets (existing behavior)
      }
    }
    
    // Insects level - move animals up by 20% on tablets
    if (levelName.toLowerCase() === 'insects') {
      const isTablet = Math.min(screenW, screenH) >= 768;
      if (isTablet) {
          return baseMargin - (screenH * 0.3);
      }
    }
    
    let finalMargin = baseMargin; // default
    
    // Farm level - move animals up by 5px in all cases not handled above
      if (levelName.toLowerCase() === 'farm') {
        finalMargin -= 5; // Move up 5px for farm level
    }
    
      // Phone positioning logic
    const isPhone = Math.min(screenW, screenH) < 768;
    if (isPhone && levelName.toLowerCase() !== 'desert') {
        if (isLandscape) {
          // In landscape, move animals up by 30% of screen height
          finalMargin -= screenH * 0.3;
        } else {
          // In portrait, push down 10% of screen height (existing behavior)
          finalMargin += screenH * 0.1;
        }
    }
    
    // iPad landscape: move all animals down by 200px
    if (isLandscape && screenW >= 900 && Platform.OS === 'ios') {
      finalMargin += 300; // Increased from 200 to 300 (additional 100px down)
    }
    
    console.log('Final margin calculation:', {
      levelName,
      finalMargin,
      baseMargin,
        isPhone,
        isLandscape,
        appliedPhonePortraitLogic: isPhone && !isLandscape && levelName.toLowerCase() !== 'desert',
        appliedPhoneLandscapeLogic: isPhone && isLandscape && levelName.toLowerCase() !== 'desert',
      appliedIpadLogic: isLandscape && screenW >= 900 && Platform.OS === 'ios'
    });
    
    // Ensure top UI (home/notebook) remains tappable: enforce a minimum top clearance
    const minTopClearance = Math.max(getResponsiveSpacing(80, getScaleFactor(screenW, screenH)), screenH * 0.08);
    finalMargin = Math.max(finalMargin, minTopClearance);
    return finalMargin;
  };

    // Helper function to get background positioning styles




  if (!backgroundImageUri) {
    return (
      <View style={[dynamicStyles.container, { backgroundColor: getLevelBackgroundColor(levelName) }]}>
        {!showIntroVideo && (
          <TouchableOpacity style={[dynamicStyles.backToMenuButton]} onPress={goToHome}>
             <Image 
               source={require('../assets/images/home_icon.png')}
               style={{ width: 36, height: 36 }}
               resizeMode="contain"
             />
          </TouchableOpacity>
        )}
        <View style={dynamicStyles.content}>
           <Text style={[dynamicStyles.animalName, { fontSize: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 15, marginTop: 100, color: '#fff' }]}>
             {t('backgroundNotAvailable') || 'Background image not available for this level.'}
           </Text>
        </View>
      </View>
    );
  }

  // --- RENDER: Crossfade both backgrounds ---
  return (
    <View style={[dynamicStyles.container, { backgroundColor: getLevelBackgroundColor(levelName) }]}>
      {/* Level intro video overlay */}
     
      <AnimatedReanimated.View style={[StyleSheet.absoluteFillObject, animatedStyle]}>
        {/* Background container - show immediately */}
        <View style={[StyleSheet.absoluteFillObject, { 
          backgroundColor: getLevelBackgroundColor(levelName) 
        }]}>
        <View style={StyleSheet.absoluteFillObject}>
          {/* Responsive moving background (sky) */}
          {(
            <Animated.View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFillObject,
                { opacity: movingBgOpacity, backgroundColor: getLevelBackgroundColor(levelName) }
              ]}
            >
              <ResponsiveMovingBg
                backgroundImageUri={movingBgSource as string | null}
              movingDirection={currentAnimal?.movingDirection ?? 'left'}
              levelName={levelName}
            />
            </Animated.View>
          )}

          {/* Responsive static background */}
          {(
            <Animated.View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFillObject,
                { opacity: imageBgOpacity, backgroundColor: getLevelBackgroundColor(levelName) }
              ]}
            >
              <ResponsiveLevelBackground
                levelName={levelName}
                backgroundSource={MOVING_BG_MAP[levelName.toLowerCase()] || (backgroundImageUri ? { uri: backgroundImageUri } : undefined)}
                isMoving={false}
                fallbackColor={getLevelBackgroundColor(levelName)}
              />
            </Animated.View>
          )}
        </View>
      </View>

        {/* Screen lock overlay when reaching 7/7 for first time */}
        {screenLocked && (
          <View style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: 'transparent',
              zIndex: 999,
            }
          ]} 
          pointerEvents="auto" // Block all touches
          />
        )}

        {/* Foreground content */}
      <View style={{ flex: 1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'transparent' }}>
        <View style={{ flex: 1 }}>
            {!showDiscoverScreen && !showIntroVideo && (
              <View style={{
                position: 'absolute',
                top: Math.max(
                  safeAreaInsets.top + 10, // Always at least 10px below the notch/status bar
                  Math.min(screenW, screenH) < 768 
                    ? (isLandscape ? screenH * 0.05 : screenH * 0.05) // 5% from top on phones
                    : (isLandscape ? 60 : 100) // Keep original for tablets
                ),
                left: Math.max(safeAreaInsets.left + 15, 15), // Respect left safe area (for landscape notch)
                backgroundColor: '#FF4444',
                borderRadius: 30,
                paddingHorizontal: 20,
                paddingVertical: 20,
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 5,
                zIndex: 1000,
                minWidth: 120,
              }}>
                {/* Home Button */}
                <TouchableOpacity onPress={() => {
                  try {
                    const clickPlayer = createAudioPlayer(require('../assets/sounds/other/animal_click.mp3'));
                    clickPlayer.play();
                    clickPlayer.addListener('playbackStatusUpdate', (status: any) => {
                      if (status?.didJustFinish) clickPlayer.remove();
                    });
                  } catch {}
                  goToHome();
                }} style={{ 
                  backgroundColor: '#FFD4A3', // Same orange as counter
                  borderRadius: 30,
                  padding: 15,
                  width: 70,
                  height: 70,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Image 
                    source={require('../assets/images/home_icon.png')}
                    style={{ width: 60, height: 60 }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>

                {/* Counter Display */}
                <View style={{ position: 'relative' }}>
                  {/* Outer glow ring */}
                  <Animated.View style={{
                    position: 'absolute',
                    top: -5,
                    left: -5,
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: counterButtonGlowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['rgba(255, 200, 150, 0)', 'rgba(255, 200, 150, 0.2)'],
                    }),
                    transform: [{
                      scale: counterButtonGlowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.2],
                      })
                    }],
                  }} />
                  
                  <Animated.View style={{
                    backgroundColor: '#FFD4A3', // Light orange color
                    borderRadius: 30,
                    width: 70,
                    height: 70,
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: [{ scale: counterPopAnim }],
                    borderWidth: 2,
                    borderColor: counterButtonGlowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['rgba(255, 200, 150, 0)', 'rgba(183, 169, 155, 1)'], // Lighter orange glow
                    }),
                    shadowColor: '#FFAB70', // Lighter orange shadow
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: Animated.add(
                      counterGlowAnim,
                      counterButtonGlowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 0.6],
                      })
                    ),
                    shadowRadius: Animated.add(
                      counterGlowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 30],
                      }),
                      counterButtonGlowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [10, 25],
                      })
                    ),
                    elevation: 12,
                  }}>
                  <Text style={{
                    color: '#2B5E34', // Dark green
                    fontSize: 22,
                    fontWeight: '900',
                    fontFamily: Platform.OS === 'ios' ? 'Arial Rounded MT Bold' : 'Roboto',
                    textShadowColor: 'rgba(0, 0, 0, 0.3)',
                    textShadowOffset: { width: 1, height: 1 },
                    textShadowRadius: 2,
                  }}>
                    {visitedAnimals.size}/{animals.length}
                  </Text>
                  </Animated.View>
                </View>

                {/* Notebook Button */}
                <TouchableOpacity 
                  onPress={() => {
                    try {
                      const clickPlayer = createAudioPlayer(require('../assets/sounds/other/animal_click.mp3'));
                      clickPlayer.play();
                      clickPlayer.addListener('playbackStatusUpdate', (status: any) => {
                        if (status?.didJustFinish) clickPlayer.remove();
                      });
                    } catch {}
                    setShowDiscoverScreen(true);
                  }} 
                  style={{
                    backgroundColor: '#FFD4A3',
                    borderRadius: 30,
                    padding: 15,
                    width: 70,
                    height: 70,
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
                  <Image 
                    source={require('../assets/images/list_icon.png')}
                    style={{ 
                      width: 60, 
                      height: 60
                    }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            )}
            
            {/* Remove old separate counter display - it's now in the red container above */}


                          {hasAnimals && !showDiscoverScreen && !showIntroVideo && (
                <TouchableOpacity style={[
                  dynamicStyles.soundButton,
                  // Move up 10% on iPad
                  screenW >= 1000 && { top: (dynamicStyles.soundButton.top || 50) - (screenH * 0.1) }
                ]} onPress={toggleMute}>
                <Ionicons
                  name={isMuted ? 'volume-mute' : 'volume-high'}
                  size={isLandscape && screenW >= 900 ? 48 : 38}
                  color="green"
                />
              </TouchableOpacity>
            )}



              {/* Level-specific animations */}
                              {levelName.toLowerCase() === 'ocean' && showInstruction && !showDiscoverScreen && !showIntroVideo && <AnimatedBubbles />}
                {levelName.toLowerCase() === 'desert' && showInstruction && !showDiscoverScreen && !showIntroVideo && <AnimatedSand />}
                {levelName.toLowerCase() === 'arctic' && showInstruction && !showDiscoverScreen && !showIntroVideo && <AnimatedSnow />}
                {levelName.toLowerCase() === 'forest' && showInstruction && !showDiscoverScreen && !showIntroVideo && <AnimatedFireflies />}
                {levelName.toLowerCase() === 'forest' && showInstruction && !showDiscoverScreen && !showIntroVideo && <AnimatedLeaves />}
                {levelName.toLowerCase() === 'jungle' && showInstruction && !showDiscoverScreen && !showIntroVideo && <AnimatedRain />}
                {levelName.toLowerCase() === 'birds' && showInstruction && !showDiscoverScreen && !showIntroVideo && <AnimatedFeathers />}
                {levelName.toLowerCase() === 'insects' && showInstruction && !showDiscoverScreen && !showIntroVideo && <AnimatedFlowers />}



              {/* Single TouchableOpacity covering most of screen, positioned behind nav buttons */}
              {hasAnimals && !showDiscoverScreen && (
                <TouchableOpacity
                  onPress={handleAnimalPress}
                  activeOpacity={1}
                  disabled={isTransitioning}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'transparent',
                    zIndex: 999, // Below celebration modal (1000) but above other elements
                  }}
                />
              )}

              {hasAnimals && !showDiscoverScreen && (
            <View style={[
              dynamicStyles.content,
              Math.min(screenW, screenH) >= 768 ? dynamicStyles.tabletOptimized : dynamicStyles.phoneOptimized
            ]}>
                            <View style={[
                                dynamicStyles.animalCard,
                                { marginTop: getAnimalMarginTop() }
                              ]}
                            >
                {/* Animal visual */}
                <Animated.View 
                  style={{ 
                    opacity: 1,
                    alignItems: 'center', 
                    justifyContent: 'center',
                    transform: [
                      { scale: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) },
                      { scale: clickBounceAnim }
                    ],
                    shadowColor: '#FFD700',
                    shadowOpacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1.0] }),
                    shadowRadius: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 35] }),
                    elevation: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }),
                  }}
                  pointerEvents="none"
                >
                  {renderAnimal()}
                </Animated.View>
                    
                    {shouldRenderLabel(showName, currentAnimal, isTransitioning, canRenderLabel) && (
                    <Animated.View style={[
                      dynamicStyles.animalNameWrapper,
                      // Use the new label positioning utility
                      getLabelPositioning(levelName, screenW, screenH, isLandscape),
                      // Override top position for Desert/Ocean iPhone adjustments
                      ...(getLabelPositioning(levelName, screenW, screenH, isLandscape).marginTop ? [{
                        top: getLabelPositioning(levelName, screenW, screenH, isLandscape).marginTop
                      }] : []),

                      {
                        opacity: 1,
                        transform: [
                          {
                            translateY: animalFadeAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [10, 0],
                            }),
                          },
                          {
                            scale: nameScaleAnim.interpolate({
                              inputRange: [0, 1, 1.1],
                              outputRange: [0, 1, 1],
                            }),
                          },
                        ],
                      }
                    ]}>
                      <View style={{ backgroundColor: 'transparent' }}>
                        <Animated.Text 
                          allowFontScaling={false}
                          adjustsFontSizeToFit={false}
                          style={[
                          dynamicStyles.animalName,
                          // Apply label styling from positioning utility
                          {
                            fontSize: Math.round(getLabelPositioning(levelName, screenW, screenH, isLandscape).fontSize),
                            paddingVertical: Math.round(getLabelPositioning(levelName, screenW, screenH, isLandscape).paddingVertical),
                            paddingHorizontal: Math.round(getLabelPositioning(levelName, screenW, screenH, isLandscape).paddingHorizontal),
                            borderRadius: Math.round(getLabelPositioning(levelName, screenW, screenH, isLandscape).borderRadius),
                            // Force layer backing on iOS for better rendering
                            ...(Platform.OS === 'ios' ? { shouldRasterizeIOS: true } : {}),
                          },
                          {
                            shadowColor: '#000',
                            shadowOpacity: 0.3,
                            shadowRadius: 4,
                          }
                        ]}>
                          {currentAnimal?.name}
                        </Animated.Text>
                      </View>
                    </Animated.View>
                    )}
              </View>

                                      {!showDiscoverScreen && !screenLocked && !showCompletionCelebration && (
                                              <View style={{
                          // Adjust navigation button positioning on tablets
                          marginTop: isLandscape && Math.min(screenW, screenH) >= 768 ? screenH * -0.2 : 0,
                          // Move buttons closer together on tablets
                          marginHorizontal: Math.min(screenW, screenH) >= 768 ? screenW * 0.15 : 0,
                        }}>
                        <NavigationButtons
                          handlePrev={handlePrev}
                          handleNext={handleNext}
                          isTransitioning={isTransitioning}
                          currentAnimalIndex={currentAnimalIndex}
                          bgColor={isMuted ? 'rgba(0,0,0,0.5)' : 'rgba(255, 255, 255, 0.7)'}
                          totalAnimals={animals.length}
                          levelCompleted={levelCompleted}
                          buttonsDisabled={buttonsDisabledManually}
                          nextButtonDisabled={false}
                          hasClickedCurrentAnimal={hasClickedCurrentAnimal}
                          visitedAnimals={visitedAnimals}
                        />
                      </View>
                    )}
                  

            </View>
          )}

              {!hasAnimals && !showDiscoverScreen && !showIntroVideo && (
            <View style={dynamicStyles.content}>
              <Text style={[dynamicStyles.animalName, { fontSize: 24, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10 }]}>
                {t('noAnimalsForLevel')}
              </Text>
            </View>
          )}

              {showDiscoverScreen && (
                <View style={StyleSheet.absoluteFillObject}>
                  <DiscoverScreen
                    animals={animals}
                    levelName={levelName}
                    onComplete={handleDiscoverScreenClose}
                    onBackToMenu={onBackToMenu}
                    onBackToLevel={handleBackToLevel}
                    visitedAnimals={visitedAnimals}
                    currentAnimalIndex={currentAnimalIndex}
                  />
                </View>
              )}

              {/* Completion Celebration Overlay with pulsing animation */}
              {showCompletionCelebration && (
                <Animated.View style={[
                  StyleSheet.absoluteFillObject,
                  {
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                    opacity: celebrationOpacityAnim,
                  }
                ]}>
                                     <Animated.View
                     style={{
                       alignItems: 'center',
                       maxWidth: Math.min(screenW, screenH) < 768 ? screenW * 0.98 : screenW * 0.95,
                       // Add pulsing animation to scale
                       transform: [{ scale: celebrationScaleAnim }],
                     }}
                   >
                     {/* Background image with pulsing animation */}
                     <Animated.Image
                       source={require('../assets/images/discovered_number.png')}
                       style={{
                         width: Math.min(screenW, screenH) < 768 ? screenW * 0.95 : screenW * 0.85,
                         height: Math.min(screenW, screenH) < 768 ? screenH * 0.9 : screenH * 0.6,
                         resizeMode: 'contain',
                         // Add pulsing animation to image as well
                         transform: [{ scale: celebrationPulseAnim }],
                       }}
                     />

                                         {/* Overlay content on top of the image */}
                     <View style={{
                       position: 'absolute',
                       top: 0,
                       left: 0,
                       right: 0,
                       bottom: 0,
                       justifyContent: 'center',
                       alignItems: 'center',
                       paddingHorizontal: Math.min(screenW, screenH) < 768 ? 10 : 20,
                     }}>
                       {/* Congrats image at the top */}
                       <Animated.Image
                         source={require('../assets/images/congrats.png')}
                         style={{
                           width: screenW * 0.3,
                           height: screenH * 0.15,
                           resizeMode: 'contain',
                           marginTop: 60,
                           marginBottom: -20,
                           transform: [{ scale: celebrationPulseAnim }],
                         }}
                       />
                       
                       {/* "Discovered" text */}
                       <Animated.Text style={{
                         fontSize: 36,
                         fontWeight: 'bold',
                         textAlign: 'center',
                         color: 'rgba(0,0,0,0.8)',
                         marginBottom: 1,
                         transform: [{ scale: celebrationPulseAnim }],
                       }}>
                         {t('discovered')} {levelName.toLowerCase() === 'birds' ? t('levelDiscoveredBirds') :
                          levelName.toLowerCase() === 'insects' ? t('levelDiscoveredInsects') :
                          t('levelDiscoveredAnimals')}
                       </Animated.Text>
                       
                       {/* x/x count in its own pill */}
                       <Animated.View style={{
                         backgroundColor: 'rgba(255,255,255,0.9)',
                         borderRadius: 25,
                         paddingHorizontal: 20,
                         paddingVertical: 8,
                         marginBottom: 50,
                         borderWidth: 2,
                         borderColor: '#333',
                         transform: [{ scale: celebrationPulseAnim }],
                       }}>
                         <Text style={{
                           fontSize: 42,
                           fontWeight: '800',
                           textAlign: 'center',
                           color: 'green',
                           fontFamily: Platform.OS === 'ios' ? 'Arial Rounded MT Bold' : 'Roboto',
                           textShadowColor: 'rgba(0, 0, 0, 0.2)',
                           textShadowOffset: { width: 2, height: 2 },
                           textShadowRadius: 3,
                           letterSpacing: 1,
                         }}>
                           {animals.length}/{animals.length}
                         </Text>
                       </Animated.View>

                     
                       
                       {/* Continue arrow button with pulsing animation */}
                       <Animated.View style={{
                         transform: [{ scale: arrowPulseAnim }],
                       }}>
                         <TouchableOpacity 
                           style={{
                             backgroundColor: 'rgba(0, 150, 0, 0.9)',
                             borderRadius: 45,
                             width: 90,
                             height: 90,
                             justifyContent: 'center',
                             alignItems: 'center',
                             borderWidth: 4,
                             borderColor: '#fff',
                             shadowColor: '#000',
                             shadowOffset: { width: 0, height: 6 },
                             shadowOpacity: 0.4,
                             shadowRadius: 8,
                             elevation: 12,
                             marginTop: -20,
                           }}
                           onPress={() => {
                             // Play button sound
                             if (!isMuted) {
                               try {
                                 const buttonPlayer = createAudioPlayer(require('../assets/sounds/other/button.mp3'));
                                 buttonPlayer.play();
                                 
                                 // Clean up sound when it finishes
                                 buttonPlayer.addListener('playbackStatusUpdate', (status: any) => {
                                   if (status.didJustFinish) {
                                     buttonPlayer.remove();
                                   }
                                 });
                               } catch (error) {
                                 console.warn('Error playing button sound:', error);
                               }
                             }
                             
                             setShowCompletionCelebration(false);
                             setShowDiscoverScreen(true);
                           }}
                           activeOpacity={0.8}
                         >
                           <Ionicons name="arrow-forward" size={45} color="#fff" />
                         </TouchableOpacity>
                       </Animated.View>
                    </View>
                  </Animated.View>
                </Animated.View>
          )}


        </View>
      </View>
      </AnimatedReanimated.View>
    </View>
  );
}

const loaderStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 10,
  },

  
});
