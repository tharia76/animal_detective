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
  } from 'react-native';
  import { Ionicons } from '@expo/vector-icons';
  import {
    useAudioPlayer,
    createAudioPlayer,
  } from 'expo-audio';

  import SpriteAnimation from './SpriteAnimation';
  import InstructionBubble from './InstructionBubble';
  import { useDynamicStyles } from '../styles/styles';
  import NavigationButtons from './NavigationButtons';
  import CongratsModal from './CongratsModal';
import DiscoverScreen from './DiscoverScreen';
  import MovingBg from './MovingBg';
  import AnimatedBubbles from './AnimatedBubbles';
  import AnimatedSand from './AnimatedSand';
  import AnimatedSnow from './AnimatedSnow';
  import AnimatedFireflies from './AnimatedFireflies';
  import AnimatedLeaves from './AnimatedLeaves';
  // --- Add localization import ---
  import { useLocalization } from '../hooks/useLocalization';
  // --- Add smooth rotation hook ---
  import { useSmoothRotation } from '../hooks/useSmoothRotation';
  import ReanimatedView from 'react-native-reanimated';
  import { getResponsiveSpacing, getScaleFactor, isTablet } from '../utils/responsive';

  // Water Progress Bar Component
  const WaterProgressBar = ({ progress, totalAnimals, level }: { progress: number; totalAnimals: number; level: string }) => {
    const waterHeight = useRef(new Animated.Value(0)).current;
    const { width: screenW, height: screenH } = useWindowDimensions();
    const isLandscape = screenW > screenH;
    
    // Animate water level when progress changes
    useEffect(() => {
      const targetHeight = (progress / totalAnimals) * 100;
      Animated.timing(waterHeight, {
        toValue: targetHeight,
        duration: 800,
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
        case 'arctic':
          return {
            waterColor: 'rgba(176, 224, 230, 0.8)',
            containerColor: 'rgba(240, 248, 255, 0.3)',
            bubbleColor: 'rgba(255, 255, 255, 0.9)'
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
            {progress}/{totalAnimals}
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
    const bubbleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
      const animateBubble = () => {
        bubbleAnim.setValue(containerHeight);
        opacityAnim.setValue(1);
        
        Animated.parallel([
          Animated.timing(bubbleAnim, {
            toValue: 0,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: false,
          }),
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 0.8,
              duration: 500,
              useNativeDriver: false,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 500,
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

  // --- BG MUSIC MAP: Map levelName to bg music asset/uri ---
  // Make sure all keys are lowercase for bulletproof matching
  const BG_MUSIC_MAP: Record<string, string | number | undefined> = {
    farm: require('../assets/sounds/background_sounds/farm_bg.mp3'),
    forest: require('../assets/sounds/background_sounds/forest_bg.mp3'),
    jungle: require('../assets/sounds/background_sounds/jungle_bg.mp3'),
    desert: require('../assets/sounds/background_sounds/desert_bg.mp3'),
    ocean: require('../assets/sounds/background_sounds/ocean_bg.mp3'),
    savannah: require('../assets/sounds/background_sounds/savannah_bg.mp3'),
    arctic: require('../assets/sounds/background_sounds/arctic_bg.mp3'),
    birds: require('../assets/sounds/background_sounds/birds_bg.mp3'),
    insects: require('../assets/sounds/background_sounds/insects_bg.mp3'),
  };

  let globalVolumeMultiplier = 1.0; // Global volume setting from settings

  // Function to set global volume (called from settings)
  export const setGlobalVolume = (volume: number) => {
    globalVolumeMultiplier = volume;
  };

  // Function to get current global volume (for video players)
  export const getGlobalVolume = () => {
    return globalVolumeMultiplier;
  };

  // --- MOVING BG MAP: Map levelName to moving background asset/uri ---
  const MOVING_BG_MAP: Record<string, string | number | undefined> = {
    // Example: 'farm': require('../../../assets/images/sky_farm.png'),
    // Example: 'jungle': require('../../../assets/images/sky_jungle.png'),
    // Example: 'desert': require('../../../assets/images/sky_desert.png'),
    // Add your levelName: asset/uri pairs here (all lowercase)
    // If you want to use a remote uri, just use a string URL
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
  };

  const FADE_DURATION = 150;
  const CONTENT_FADE_DURATION = 300;

  export default function LevelScreenTemplate({
    levelName,
    animals,
    backgroundImageUri,
    skyBackgroundImageUri,
    onBackToMenu,
    bgMusic, // allow prop for override
  }: Props) {
    // --- Use localization hook ---
    const { t } = useLocalization();

    // 1️⃣ Hoist your hook: only call it once, at the top level
    const dynamicStyles = useDynamicStyles();
    
    // --- Use smooth rotation for iOS-like behavior ---
    const { animatedStyle, stableDimensions } = useSmoothRotation({
      damping: 25,
      stiffness: 350,
      mass: 0.7,
    });

    const [currentAnimalIndex, setCurrentAnimalIndex] = useState(0);
    const [showName, setShowName] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showInstruction, setShowInstruction] = useState(true);
    const [bgLoading, setBgLoading] = useState(!!backgroundImageUri);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const arrowAnim = useRef(new Animated.Value(0)).current;
    const animalFadeAnim = useRef(new Animated.Value(1)).current;
    const contentFade = useRef(new Animated.Value(0)).current;
    const soundRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);
    const isSoundPlayingRef = useRef<boolean>(false);
    const confettiAnimRefs = useRef<Animated.Value[]>([]);
    const [showCongratsModal, setShowCongratsModal] = useState(false);
    const [showDiscoverScreen, setShowDiscoverScreen] = useState(false);
    const [visitedAnimals, setVisitedAnimals] = useState<Set<number>>(new Set([0]));
    const [levelCompleted, setLevelCompleted] = useState(false);
    

    
    // Glow animation values
    const glowAnim = useRef(new Animated.Value(0)).current;
    const nameScaleAnim = useRef(new Animated.Value(0)).current;
    const glowLoopRef = useRef<Animated.CompositeAnimation | null>(null);



    // Continuous glow animation while name is showing
    useEffect(() => {
      if (showName) {
        // Start continuous glow loop
        const glowLoop = Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0.1,
              duration: 800,
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

    // --- BG MUSIC STATE ---
    const bgMusicRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);
    const [currentBgMusicKey, setCurrentBgMusicKey] = useState<string | undefined>(undefined);
    
    // Audio ducking constants
    const NORMAL_BG_VOLUME = 0.8; // Reduced by 20% from 1.0
  const DUCKED_BG_VOLUME = 0.1; // Reduced from 0.2 to 0.1 for better ducking

    // Helper functions for audio ducking
    const duckBackgroundMusic = useCallback(() => {
      if (bgMusicRef.current && !isMuted) {
        try {
          bgMusicRef.current.volume = DUCKED_BG_VOLUME * globalVolumeMultiplier;
          console.log('Background music ducked to', DUCKED_BG_VOLUME * globalVolumeMultiplier);
        } catch (error) {
          console.warn('Error ducking background music:', error);
        }
      }
    }, [isMuted]);

    const restoreBackgroundMusic = useCallback(() => {
      if (bgMusicRef.current && !isMuted) {
        try {
          bgMusicRef.current.volume = NORMAL_BG_VOLUME * globalVolumeMultiplier;
          console.log('Background music restored to', NORMAL_BG_VOLUME * globalVolumeMultiplier);
        } catch (error) {
          console.warn('Error restoring background music:', error);
        }
      }
    }, [isMuted]);

    const currentAnimal = useMemo(() => {
      if (animals.length > 0 && currentAnimalIndex >= 0 && currentAnimalIndex < animals.length) {
        return animals[currentAnimalIndex];
      }
      return null;
    }, [animals, currentAnimalIndex]);
    const hasAnimals = animals.length > 0;

    const roadAnimation = useRef(new Animated.Value(0)).current;
    const { width: screenW, height: screenH } = useWindowDimensions();
    const isLandscape = screenW > screenH;

    // Track which background is currently visible
    const [wasMoving, setWasMoving] = useState(currentAnimal?.isMoving ?? false);
    const movingBgOpacity = useRef(new Animated.Value(currentAnimal?.isMoving ? 1 : 0)).current;
    const imageBgOpacity = useRef(new Animated.Value(currentAnimal?.isMoving ? 0 : 1)).current;

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

    // --- BG MUSIC EFFECT (only play if instruction bubble is visible) ---
    // REWRITE: Remove all showName-related branches from this effect.
    useEffect(() => {
      // Always use lowercase for lookup
      const key = levelName.trim().toLowerCase();       // e.g. "Forest" ➞ "forest"

      // --- FIX: Always use require for local assets, don't coerce to string ---
      // If bgMusic is provided as a prop, use it, else use BG_MUSIC_MAP
      let source: string | number | undefined = undefined;
      if (typeof bgMusic !== 'undefined') {
        source = bgMusic;
      } else if (BG_MUSIC_MAP.hasOwnProperty(key)) {
        source = BG_MUSIC_MAP[key];
      }

      // Stop music if: no source or instruction bubble not visible
      if (!source || !showInstruction) {
        if (bgMusicRef.current) {
          try {
            bgMusicRef.current.pause();
            bgMusicRef.current.remove();
          } catch (e) {}
          bgMusicRef.current = null;
          setCurrentBgMusicKey(undefined);
        }
        return;
      }

      // If already playing the right track, just honor mute/unmute
      // For require() assets, String(require(...)) is "[object Module]" or "[object Object]", so compare by reference
      if (bgMusicRef.current && currentBgMusicKey && currentBgMusicKey === String(source)) {
        if (bgMusicRef.current) {
          if (isMuted) {
            bgMusicRef.current.pause();
          } else {
            bgMusicRef.current.volume = NORMAL_BG_VOLUME; // Ensure volume is at normal level
            bgMusicRef.current.play();
          }
        }
        return;
      }

      // else swap out the old player
      if (bgMusicRef.current) {
        try {
          bgMusicRef.current.pause();
          bgMusicRef.current.remove();
        } catch (e) {}
        bgMusicRef.current = null;
        setCurrentBgMusicKey(undefined);
      }

      if (!isMuted && source) {
        try {
          const p = createAudioPlayer(source);
          p.loop = true;
          p.volume = NORMAL_BG_VOLUME * globalVolumeMultiplier; // Apply global volume setting
          p.play();
          bgMusicRef.current = p;
          setCurrentBgMusicKey(String(source));
        } catch (e) {
          bgMusicRef.current = null;
          setCurrentBgMusicKey(undefined);
        }
      }

      return () => {
        if (bgMusicRef.current) {
          try {
            bgMusicRef.current.pause();
            bgMusicRef.current.remove();
          } catch (e) {}
          bgMusicRef.current = null;
          setCurrentBgMusicKey(undefined);
        }
      };
    // Remove showName from dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [levelName, bgMusic, isMuted, showInstruction]);

    // When currentAnimal?.isMoving changes, crossfade the backgrounds
    useEffect(() => {
      // Check if current animal is fox - skip transition delay for fox
      const isFox = currentAnimal?.name?.toLowerCase().includes('fox') || 
                    currentAnimal?.name?.toLowerCase().includes('лисица') || 
                    currentAnimal?.name?.toLowerCase().includes('tilki');
      const transitionDuration = isFox ? 0 : 350; // No delay for fox, 350ms for others
      
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
          duration: 2000,
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
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(arrowAnim, {
            toValue: 0,
            duration: 500,
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
        // Also stop bg music on unmount
        if (bgMusicRef.current) {
          try {
            bgMusicRef.current.pause();
            bgMusicRef.current.remove();
          } catch (e) {}
          bgMusicRef.current = null;
          setCurrentBgMusicKey(undefined);
        }
      };
    }, []);

    const stopSound = useCallback(async (unload = false) => {
      if (soundRef.current) {
        try {
          soundRef.current.pause();
          if (unload) {
            soundRef.current.remove();
            soundRef.current = null;
          }
        } catch (error) {
          console.warn('Error stopping/unloading sound:', error);
        } finally {
          isSoundPlayingRef.current = false;
        }
      }
    }, []);

    // remove the `isSoundPlayingRef` check so it always goes through
    // 3) in your playSounds() playbackStatusUpdate, after it finally finishes, restore background music volume
    const playSounds = useCallback(async () => {
      if (isMuted || !currentAnimal?.sound) return;

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
        // stop whatever was playing before
        await stopSound(true);

        // Add additional safety check here after async operation
        if (!currentAnimal || isTransitioning) {
          console.warn('currentAnimal became null or transition started during stopSound');
          return;
        }

        // Duck the background music volume instead of pausing
        duckBackgroundMusic();

        isSoundPlayingRef.current = true;

        const animalPlayer = createAudioPlayer(currentAnimal.sound);
        soundRef.current = animalPlayer;

        animalPlayer.addListener('playbackStatusUpdate', (status: any) => {
          if (status.didJustFinish) {
            animalPlayer.remove();
            if (soundRef.current === animalPlayer) soundRef.current = null;

            // then optionally play the label sound - with additional safety check
            if (!isMuted && currentAnimal?.labelSound) {
              const labelPlayer = createAudioPlayer(currentAnimal.labelSound);
              soundRef.current = labelPlayer;
              labelPlayer.play();
              labelPlayer.addListener('playbackStatusUpdate', (labelStatus: any) => {
                if (labelStatus.didJustFinish) {
                  labelPlayer.remove();
                  if (soundRef.current === labelPlayer) soundRef.current = null;
                  isSoundPlayingRef.current = false;

                  // Restore background music volume instead of resuming playback
                  restoreBackgroundMusic();
                }
              });
            } else {
              isSoundPlayingRef.current = false;

              // Restore background music volume instead of resuming playback
              restoreBackgroundMusic();
            }
          }
        });

        animalPlayer.play();
      } catch (error) {
        console.warn('Error playing sounds:', error);
        isSoundPlayingRef.current = false;
        if (soundRef.current) {
          soundRef.current.remove();
          soundRef.current = null;
        }
        // Restore background music volume in case of error
        restoreBackgroundMusic();
      }
    }, [currentAnimal, isMuted, stopSound, isTransitioning, duckBackgroundMusic, restoreBackgroundMusic]);

    // --- REWRITE: handleAnimalPress as the single tap handler for animal card ---
    // 2) tweak your handleAnimalPress to use volume ducking instead of pause/resume
    const handleAnimalPress = useCallback(() => {
      console.log('Animal pressed! isTransitioning:', isTransitioning, 'showName:', showName, 'currentAnimal:', currentAnimal?.name);
      
      if (isTransitioning || !currentAnimal) {
        console.log('Blocked by transition or no current animal');
        return;
      }
      
      // Glow animation will be handled by useEffect based on showName state
      
      if (!showName) {
        console.log('Setting showName to true and playing sounds');
        setShowName(true);
        
        // Add current animal to visited animals when first clicked
        setVisitedAnimals(prev => {
          const newVisited = new Set(prev);
          newVisited.add(currentAnimalIndex);
          return newVisited;
        });

        // Start name scale animation
        Animated.sequence([
          Animated.timing(nameScaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(nameScaleAnim, {
            toValue: 1.1,
            tension: 100,
            friction: 5,
            useNativeDriver: true,
          }),
        ]).start();
        
        // Background music ducking will be handled in playSounds()
        // kill any in‑flight animal audio, then play the new one
        stopSound(true).then(() => {
          // Force play sounds even if muted is checked, for better UX
          playSounds();
        });
      } else {
        console.log('Setting showName to false');
        setShowName(false);
        
        // Reset name scale animation
        Animated.timing(nameScaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
        
        // If no sound is currently playing, restore background music volume immediately
        if (!soundRef.current) {
          restoreBackgroundMusic();
        }
        // If sound is playing, volume will be restored when sound finishes
      }
    }, [showName, playSounds, stopSound, restoreBackgroundMusic, isTransitioning, currentAnimal, glowAnim, nameScaleAnim]);

    // Remove toggleShowName entirely

    const handleNavigation = useCallback((direction: 'next' | 'prev') => {
      if (!hasAnimals || isTransitioning) {
        return;
      }

      // Prevent multiple rapid navigation attempts
      if (isTransitioning) {
        console.warn('Navigation already in progress, ignoring request');
        return;
      }

      setIsTransitioning(true);
      stopSound(true);

      // Use a single animation for smoother transitions
      Animated.timing(animalFadeAnim, {
        toValue: 0,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }).start(() => {
        // Double-check that we still have animals and valid state
        if (!hasAnimals || animals.length === 0) {
          console.warn('No animals available during navigation');
          setIsTransitioning(false);
          return;
        }

        let newIndex;
        if (direction === 'next') {
          newIndex = currentAnimalIndex + 1;
          
          if (newIndex >= animals.length && !levelCompleted) {
            setLevelCompleted(true);
            // Show DiscoverScreen first for all levels, then CongratsModal
            setShowDiscoverScreen(true);
            setIsTransitioning(false);
            return;
          }
          
          // Safety check: don't allow navigation beyond array bounds
          if (newIndex >= animals.length) {
            console.warn('Attempted to navigate beyond available animals');
            setIsTransitioning(false);
            return;
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

        if (direction === 'prev') {
            const newVisitedAnimals = new Set(visitedAnimals);
            newVisitedAnimals.add(newIndex);
            setVisitedAnimals(newVisitedAnimals);
        }

        setCurrentAnimalIndex(newIndex);
        setShowName(false);

        // Use a small delay to ensure state updates are processed
        setTimeout(() => {
          Animated.timing(animalFadeAnim, {
            toValue: 1,
            duration: FADE_DURATION,
            useNativeDriver: true,
          }).start(() => {
            setIsTransitioning(false);
          });
        }, 16); // One frame delay
      });
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
    }, [handleNavigation, isMuted]);

    const handlePrev = useCallback(() => {
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
    }, [handleNavigation, isMuted]);

    const goToHome = useCallback(() => {
      stopSound(false);
      // Stop bg music when going home
      if (bgMusicRef.current) {
        try {
          bgMusicRef.current.pause();
          bgMusicRef.current.remove();
        } catch (e) {}
        bgMusicRef.current = null;
        setCurrentBgMusicKey(undefined);
      }
      onBackToMenu();
    }, [stopSound, onBackToMenu]);

    const toggleMute = () => {
      const changingToMuted = !isMuted;
      setIsMuted(changingToMuted);
      if (changingToMuted) {
        stopSound(true).catch(error => console.warn('Error stopping sound on mute:', error));
        // Pause bg music
        if (bgMusicRef.current) {
          try {
            bgMusicRef.current.pause();
          } catch (e) {}
        }
      } else {
        // Resume bg music, but only if instruction bubble is visible
        if (bgMusicRef.current && showInstruction) {
          try {
            bgMusicRef.current.volume = NORMAL_BG_VOLUME; // Ensure volume is restored when unmuting
            bgMusicRef.current.play();
          } catch (e) {}
        }
      }
    };

    const startOver = useCallback(() => {
      setShowCongratsModal(false);
      setShowDiscoverScreen(false);
      stopSound(true);
      setIsTransitioning(true);
      animalFadeAnim.setValue(0);
      setCurrentAnimalIndex(0);
      setShowName(false);
      setLevelCompleted(false);
      setVisitedAnimals(new Set([0]));

      // Use a small delay to ensure state updates are processed
      setTimeout(() => {
          Animated.timing(animalFadeAnim, {
              toValue: 1,
              duration: FADE_DURATION,
              useNativeDriver: true,
          }).start(() => {
              setIsTransitioning(false);
          });
      }, 16); // One frame delay

    }, [stopSound, animalFadeAnim]);

    // Handle when DiscoverScreen closes (after all animals are revealed)
    const handleDiscoverScreenClose = useCallback(() => {
      setShowDiscoverScreen(false);
      // Show the congrats modal after discover screen closes
      setShowCongratsModal(true);
    }, []);

    // Handle when user wants to go back to level from DiscoverScreen (without congrats)
    const handleBackToLevel = useCallback((animalIndex?: number) => {
      setShowDiscoverScreen(false);
      // If an animal index is provided, navigate to that animal
      if (typeof animalIndex === 'number' && animalIndex >= 0 && animalIndex < animals.length) {
        setCurrentAnimalIndex(animalIndex);
      }
      // Don't show congrats modal - just return to level
    }, [animals.length]);

    const renderAnimal = () => {
      if (!currentAnimal) return null;
      const key = `${currentAnimal.id}-${currentAnimal.name}`;
      const isPhone = Math.min(screenW, screenH) < 768;

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

      // Wrap in a View with pointerEvents: 'none' for phones
      if (isPhone) {
        return (
          <View pointerEvents="none" style={{ alignItems: 'center', justifyContent: 'center' }}>
            {animalComponent}
          </View>
        );
      }

      return animalComponent;
    };

    useEffect(() => {
      confettiAnimRefs.current = Array.from({ length: 30 }).map(() => new Animated.Value(0));
    }, []);

    useEffect(() => {
      if (showCongratsModal) {
        confettiAnimRefs.current.forEach((anim, index) => {
          anim.setValue(0);
          const randomDuration = 2000 + Math.random() * 3000;
          const randomDelay = Math.random() * 500;

          Animated.timing(anim, {
            toValue: 1,
            duration: randomDuration,
            delay: randomDelay,
            useNativeDriver: true,
          }).start();
        });
      }
    }, [showCongratsModal]);

    const onLoadEnd = useCallback(() => {
      setBgLoading(false);
      Animated.timing(contentFade, {
        toValue: 1,
        duration: CONTENT_FADE_DURATION,
        useNativeDriver: true,
      }).start();
    }, [contentFade]);

    useEffect(() => {
      if (currentAnimal?.isMoving) {
        Animated.timing(contentFade, {
          toValue: 1,
          duration: CONTENT_FADE_DURATION,
          useNativeDriver: true,
        }).start();
      }
    }, [currentAnimal?.isMoving, contentFade]);

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
      
      // Birds level - move animals up by 20% on tablets
      if (levelName.toLowerCase() === 'birds') {
        const isTablet = Math.min(screenW, screenH) >= 768;
        
        // Landscape mode - move animals down by 20% on iPad, up by 25% on phones
        if (isLandscape) {
          if (isTablet) {
            return baseMargin - (screenH * 0.1); // Move animals down 20% on iPad landscape
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
      
      // Arctic level - move all animals up on both tablets and phones
      if (levelName.toLowerCase() === 'arctic') {
        // Use smaller dimension to detect phones vs tablets
        const isTablet = Math.min(screenW, screenH) >= 768;
        
        if (isTablet && currentAnimal?.isMoving) {
          // On tablets, move animals up by 20% of screen height
          return baseMargin + (screenH * 0.2);
        } else if (isTablet && !currentAnimal?.isMoving) {
          return baseMargin + (screenH * 0.1);
        } else if (!isTablet && currentAnimal?.isMoving) {
          // On phones, move animals up by 15% of screen height
          return baseMargin + (screenH * 0.1);
        } else if (!isTablet && !currentAnimal?.isMoving) {
          return baseMargin- (screenH * 0.1);
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
      
      // Forest level - use the same logic as farm
      if (levelName.toLowerCase() === 'forest' && !isLandscape) {
        return baseMargin + 145;
      }
      
      // Forest level phone landscape - move animals up significantly
      if (levelName.toLowerCase() === 'forest' && isLandscape && Math.min(screenW, screenH) < 768) {
        return baseMargin - (screenH * 0.1); // Move up by 40% of screen height
      }
      
          // Forest level on iPad - move animals up by 30px (same as farm)
    if (levelName.toLowerCase() === 'forest' && screenW >= 768 && Platform.OS === 'ios') {
      // Special positioning for mouse in landscape (all languages)
      const animalNameLower = currentAnimal?.name?.toLowerCase() || '';
      const isMouseAnimal = animalNameLower.includes('mouse') ||  // English
                           animalNameLower.includes('мышь') ||   // Russian
                           animalNameLower.includes('fare');     // Turkish
      if (isLandscape && isMouseAnimal) {
        console.log('Moving mouse down! Name:', currentAnimal?.name);
        return baseMargin + 100; // Move mouse down 100px in landscape
      }
      return baseMargin - 30; // Default positioning for other animals
    }
      
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
          // On phones, move animals down by 20%
          return baseMargin + (screenH * 0.01);
        }
      }
      
      // Savannah level - move all animals up by 20%
      if (levelName.toLowerCase() === 'savannah') {
        return baseMargin - (screenH * 0.2);
      }
      
          // Ocean level - move animals down by 20%
    if (levelName.toLowerCase() === 'ocean') {
      return baseMargin + (screenH * 0.1);
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
      if (levelName.toLowerCase() === 'farm' || levelName.toLowerCase() === 'forest') {
        finalMargin -= 5; // Move up 5px for farm and forest level
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
      
      return finalMargin;
    };

    // Helper function to get background positioning styles
    const getBackgroundStyles = (isMoving: boolean) => {
      const isTablet = Math.min(screenW, screenH) >= 768;
      const isPhone = !isTablet;
      const level = levelName.toLowerCase();
      

      
      // Base positioning adjustments by level
      const levelAdjustments: Record<string, { up: number; phoneUp: number; landscapePhoneUp: number }> = {
                forest: { up: isMoving ? -0.35 : 1.5, phoneUp: isMoving ? 0.3 : 0.5, landscapePhoneUp: isMoving ? 0.3 : 3.0 },
        arctic: { up: isMoving ? -0.2 : 2.5, phoneUp: isMoving ? 0.1 : 2.5, landscapePhoneUp: isMoving ? 0.9 : 6.5 },
        savannah: { up: isMoving ? -0.1 : 0.5, phoneUp: isMoving ? 0.3 : 0.5, landscapePhoneUp: isMoving ? 0.3 : 0.5 },
        jungle: { up: isMoving ? -0.2 : 0.8, phoneUp: isMoving ? 0.5 : 0.8, landscapePhoneUp: isMoving ? 0.5 : 0.8 },
        birds: { up: 0.1, phoneUp: 0.1, landscapePhoneUp: 0.1 },
        farm: { up: -0.12, phoneUp: 0, landscapePhoneUp: 0.1 },
        ocean: { up: 0, phoneUp: 0, landscapePhoneUp: 0.1 },
        desert: { up: 0, phoneUp: 0, landscapePhoneUp: 0.1 },
        insects: { up: 0.3, phoneUp: 0.3, landscapePhoneUp: 0.3 },
      };

      const basePixels: Record<string, { base: number; phone: number }> = {
        forest: { base: isMoving ? 300 : 400, phone: isMoving ? 350 : 300 },
        arctic: { base: isMoving ? 350 : 550, phone: isMoving ? 500 : 700 },
        savannah: { base: isMoving ? 150 : 250, phone: isMoving ? 150 : 400 },
        jungle: { base: 400, phone: screenW < 900 ? 600 : 400 },
        birds: { base: 0, phone: 0 },
        farm: { base: 200, phone: 350 },
        ocean: { base: 200, phone: 350 },
        desert: { base: 200, phone: 350 },
        insects: { base: 350, phone: 500 },
      };

      const adjustment = levelAdjustments[level] || { up: 0, phoneUp: 0, landscapePhoneUp: 0 };
      const pixels = basePixels[level] || { base: 0, phone: 0 };

      let topOffset = 0;
      let heightExtension = 0;

      // Calculate positioning based on device type and orientation
      if (isLandscape && isPhone) {
        // Landscape phones
        const upPercent = adjustment.landscapePhoneUp;
        topOffset = level === 'arctic' && isMoving ? 100 - (screenH * upPercent) + (screenH * 0.2) : 
                    30 - (screenH * upPercent);
        heightExtension = screenH * upPercent;
        

      } else if (isPhone && !isLandscape) {
        // Portrait phones
        const upPercent = adjustment.phoneUp;
        const basePixel = pixels.phone;
        topOffset = -basePixel - (screenH * upPercent);
        heightExtension = basePixel + (screenH * upPercent);
      } else {
        // Tablets
        const upPercent = adjustment.up;
        const basePixel = pixels.base;
        
        // Special tablet landscape adjustments
        const tabletLandscapeOffset = isLandscape && screenW >= 768 ? {
          ocean: isMoving ? screenH * 0.1 : screenH * 0.35,
          desert: isMoving ? screenH * 0.1 : screenH * 0.35,
          forest: isMoving ? screenH * 0.01 : screenH * 0.25,
          arctic: isMoving ? screenH * 0.1 : screenH * 0.9,
          savannah: isMoving ? screenH * 0.001 : screenH * 0.5,
          jungle: isMoving ? screenH * 0.1 : screenH * 0.8,
        }[level] || 0 : 0;
        
        topOffset = (tabletLandscapeOffset + (-basePixel - (screenH * upPercent)));
        heightExtension = basePixel + (screenH * upPercent);
      }

      const finalHeight = topOffset < 0 
        ? screenH + heightExtension + Math.abs(topOffset) // Add the absolute value of negative topOffset to height
        : screenH + heightExtension;

      return {
        top: topOffset,
        height: finalHeight,
        position: 'absolute' as const,
        left: 0,
        right: 0,
        bottom: 0,

      };
    };

    // Helper function to get level background color
    const getLevelBackgroundColor = () => {
      const colorMap: Record<string, string> = {
        forest: '#87CEEB',
        arctic: '#e6f2ff',
        birds: '#87CEEB',
        jungle: '#1a3d1a',
        savannah: '#f4e4bc',
        ocean: '#006994',
        desert: '#f4e4bc',
        farm: '#87CEEB',
      };
      return colorMap[levelName.toLowerCase()] || '#000';
    };

    if (!backgroundImageUri) {
      return (
        <View style={[dynamicStyles.container, { backgroundColor: 'transparent' }]}>
          <TouchableOpacity style={[dynamicStyles.backToMenuButton]} onPress={goToHome}>
            <Ionicons name="home" size={24} color="#fff" />
          </TouchableOpacity>
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
      <ReanimatedView.View style={[dynamicStyles.container, animatedStyle]}>
        {/* Background container */}
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: getLevelBackgroundColor() }]}>
          <View style={StyleSheet.absoluteFillObject}>
            {/* Moving background (sky) */}
            <Animated.View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFillObject,
                { opacity: movingBgOpacity, backgroundColor: 'transparent' },
                getBackgroundStyles(true),

              ]}
            >
              <MovingBg
                backgroundImageUri={movingBgSource as string | null}
                movingDirection={currentAnimal?.movingDirection ?? 'left'}
                containerHeight={undefined}
                containerWidth={undefined}
              />
            </Animated.View>

            {/* Static image background */}
            <Animated.View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFillObject,
                { opacity: imageBgOpacity, backgroundColor: 'transparent' }
              ]}
            >
              <ImageBackground
                source={backgroundImageUri ? { uri: backgroundImageUri } : undefined}
                style={[
                  StyleSheet.absoluteFillObject,
                  getBackgroundStyles(false),
                  // Level-specific landscape fixes - separate values for iPad and iPhone
                  isLandscape && Platform.OS === 'ios' && (() => {
                    const isIPad = screenW >= 1000;
                    console.log('SCREEN WIDTH:', screenW, isIPad ? '(iPad)' : '(iPhone)');
                    
                    switch (levelName.toLowerCase()) {
                      case 'ocean':
                        return isIPad ? {
                          height: '100%',
                          top: 1,
                          bottom: 1,
                        } : {
                          height: '120%',
                          top: -100,
                          bottom: 1,
                        };
                      case 'desert':
                        return isIPad ? {
                          height: '120%',
                          top: -250,
                          bottom: 1,
                        } : {
                          height: '115%',
                          top: -80,
                          bottom: 1,
                        };
                      case 'arctic':
                        return isIPad ? {
                          height: '160%',
                          top: -1250,
                          bottom: 1,
                        } : {
                          height: '160%',
                          top: -600,
                          bottom: 1,
                        };
                      case 'forest':
                        return isIPad ? {
                          height: '120%',
                          top: -250,
                          bottom: 1,
                        } : {
                          height: '120%',
                          top: -155,
                          bottom: 1,
                        };
                      case 'jungle':
                        return isIPad ? {
                          height: '130%',
                          top: -400,
                          bottom: 1,
                        } : {
                          height: '145%',
                          top: -350,
                          bottom: 1,
                        };
                      case 'savannah':
                        return isIPad ? {
                          height: '118%',
                          top: -300,
                          bottom: 1,
                        } : {
                          height: '120%',
                          top: -180,
                          bottom: 1,
                        };
                      case 'insects':
                        return isIPad ? {
                          height: '120%',
                          top: -160,
                          bottom: 1,
                        } : {
                          height: '115%',
                          top: -90,
                          bottom: 1,
                        };
                      case 'farm':
                        return isIPad ? {
                          height: '120%',
                          top: -120,
                          bottom: 1,
                        } : {
                          height: '115%',
                          top: -70,
                          bottom: 1,
                        };
                      case 'birds':
                        return isIPad ? {
                          height: '120%',
                          top: -150,
                          bottom: 1,
                        } : {
                          height: '115%',
                          top: -40,
                          bottom: 1,
                        };
                      default:
                        return isIPad ? {
                          height: '120%',
                          top: -180,
                          bottom: 1,
                        } : {
                          height: '115%',
                          top: -90,
                          bottom: 1,
                        };
                    }
                  })(),
                ]}
                resizeMode="cover"
                onLoadEnd={onLoadEnd}
                onError={onLoadEnd}
              />
            </Animated.View>
          </View>
        </View>

        {/* Foreground content */}
        <View style={StyleSheet.absoluteFillObject}>
          <Animated.View style={{ flex: 1, opacity: contentFade }}>
            <View style={{ flex: 1 }}>
            {!showDiscoverScreen && (
              <TouchableOpacity style={[
                dynamicStyles.backToMenuButton,
                // Move up 10% on iPad
                screenW >= 1000 && { top: (dynamicStyles.backToMenuButton.top || 50) - (screenH * 0.1) }
              ]} onPress={goToHome}>
                <Ionicons name="home" size={isLandscape && screenW >= 900 ? 40 : 30} color="#fff" />
              </TouchableOpacity>
            )}
            
            {!showDiscoverScreen && (
              <TouchableOpacity style={[
                dynamicStyles.backToMenuButton,
                // Position notebook button below the home button
                { 
                  top: (dynamicStyles.backToMenuButton.top || 50) + 
                       getResponsiveSpacing(isTablet() && isLandscape ? 150 : isTablet() ? 80 : 120, getScaleFactor(screenW, screenH)) +
                       (screenW >= 1000 ? -(screenH * 0.1) : 0) // Account for iPad offset
                },
              ]} onPress={() => {
                // Navigate to discovery screen for this level
                setShowDiscoverScreen(true);
              }}>
                
                
                <Ionicons name="document-text" size={isLandscape && screenW >= 900 ? 40 : 30} color="#fff" />
                
                                                  {/* Cute Progress Badge */}
                 <Animated.View style={{
                   position: 'absolute',
                   bottom: -18,
                   right: -18,
                   backgroundColor: '#40E0D0', // Turquoise for all levels
                   borderRadius: 30,
                   minWidth: 60,
                   height: 48,
                   justifyContent: 'center',
                   alignItems: 'center',
                   borderWidth: 4,
                   borderColor: 'black',
                   shadowColor: '#000',
                   shadowOffset: { width: 0, height: 4 },
                   shadowOpacity: 0.3,
                   shadowRadius: 8,
                   elevation: 8,
                   transform: [{
                     scale: nameScaleAnim.interpolate({
                       inputRange: [0, 1, 1.1],
                       outputRange: [1, 1.1, 1.2],
                     }),
                   }],
                 }}>
                  {/* Cute sparkle effect when progress increases */}
                  {visitedAnimals.size > 1 && (
                    <Animated.View style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      opacity: glowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1],
                      }),
                    }}>
                      <Text style={{ fontSize: 12, color: '#FFD700' }}>✨</Text>
                    </Animated.View>
                  )}
                  
                  {/* Heart emoji for completed levels */}
                  {visitedAnimals.size === animals.length && (
                    <Animated.View style={{
                      position: 'absolute',
                      top: -6,
                      left: -6,
                      transform: [{
                        scale: glowAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1.2],
                        }),
                      }],
                    }}>
                      <Text style={{ fontSize: 14 }}>💖</Text>
                    </Animated.View>
                  )}
                  
                                     <Text style={{
                     color: 'black',
                     fontSize: 18,
                     fontWeight: '800',
        
                     fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto',
                   }}>
                    {visitedAnimals.size}/{animals.length}
                  </Text>
                  
                  {/* Cute gradient overlay */}
                  <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '50%',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderTopLeftRadius: 13,
                    borderTopRightRadius: 13,
                  }} />
                </Animated.View>
              </TouchableOpacity>
            )}
                          {hasAnimals && !showDiscoverScreen && (
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
              {levelName.toLowerCase() === 'ocean' && showInstruction && !showDiscoverScreen && <AnimatedBubbles />}
              {levelName.toLowerCase() === 'desert' && showInstruction && !showDiscoverScreen && <AnimatedSand />}
              {levelName.toLowerCase() === 'arctic' && showInstruction && !showDiscoverScreen && <AnimatedSnow />}
              {levelName.toLowerCase() === 'forest' && showInstruction && !showDiscoverScreen && <AnimatedFireflies />}
              {levelName.toLowerCase() === 'forest' && showInstruction && !showDiscoverScreen && <AnimatedLeaves />}

              {hasAnimals && !showDiscoverScreen && (
                <View style={dynamicStyles.content}>
                  <View style={[
                    dynamicStyles.animalCard,
                    { marginTop: getAnimalMarginTop() }
                  ]}>
                    {/* Large invisible touch area for phones */}
                    {Math.min(screenW, screenH) < 768 && (
                      <TouchableOpacity 
                        onPress={handleAnimalPress} 
                        activeOpacity={0.0} 
                        disabled={isTransitioning}
                        style={{
                          position: 'absolute',
                          top: '10%',
                          left: '25%',
                          right: '25%',
                          bottom: '1%',
                          backgroundColor: 'transparent',
                          zIndex: 999,
                        }}
                      />
                    )}
                    
                    {/* Touchable animal for tablets */}
                    {Math.min(screenW, screenH) >= 768 ? (
                      <TouchableOpacity 
                        onPress={handleAnimalPress} 
                        activeOpacity={0.8} 
                        disabled={isTransitioning}
                        style={{ alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Animated.View style={{ 
                          opacity: animalFadeAnim, 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          transform: [{
                            scale: glowAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1, 1.08],
                            }),
                          }],
                          shadowColor: '#FFD700',
                          shadowOpacity: glowAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 1.0],
                          }),
                          shadowRadius: glowAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 35],
                          }),
                          elevation: glowAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 20],
                          }),
                        }}>
                          {renderAnimal()}
                        </Animated.View>
                      </TouchableOpacity>
                    ) : (
                      /* Non-touchable animal display for phones */
                      <Animated.View 
                        style={{ 
                          opacity: animalFadeAnim, 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          zIndex: -1,
                          transform: [{
                            scale: glowAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1, 1.08],
                            }),
                          }],
                          shadowColor: '#FFD700',
                          shadowOpacity: glowAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 1.0],
                          }),
                          shadowRadius: glowAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 35],
                          }),
                          elevation: glowAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 20],
                          }),
                        }}
                        pointerEvents="none"
                      >
                        {renderAnimal()}
                      </Animated.View>
                    )}
                    
                    {showName && currentAnimal && (
                      <Animated.View style={[
                        dynamicStyles.animalNameWrapper,
                                              // Level-specific label positioning
                      (levelName.toLowerCase() === 'ocean' || 
                       levelName.toLowerCase() === 'insects' || 
                       levelName.toLowerCase() === 'savannah' || 
                       levelName.toLowerCase() === 'jungle' ||
                       levelName.toLowerCase() === 'birds' ||
                       levelName.toLowerCase() === 'desert' ||
                       levelName.toLowerCase() === 'forest' ||
                       levelName.toLowerCase() === 'farm' ||
                       levelName.toLowerCase() === 'arctic') && 
                       Math.min(screenW, screenH) >= 768 && {
                        top: levelName.toLowerCase() === 'ocean' ? screenH * 0.02 : 
                             levelName.toLowerCase() === 'birds' ? screenH * 0.01 : 
                             levelName.toLowerCase() === 'farm' ? screenH * 0.01 : 
                             levelName.toLowerCase() === 'arctic' ? screenH * 0.01 : 
                             levelName.toLowerCase() === 'desert' ? screenH * 0.01 : 
                             levelName.toLowerCase() === 'forest' ? screenH * 0.01 : 
                             levelName.toLowerCase() === 'jungle' ? screenH * 0.01 : 
                             levelName.toLowerCase() === 'insects' ? screenH * 0.1 : 
                             levelName.toLowerCase() === 'savannah' ? screenH * 0.01 : 
                             screenH * 0.1,
                      },
                        (levelName.toLowerCase() === 'forest' || 
                        levelName.toLowerCase() === 'farm') && 
                        Math.min(screenW, screenH) < 768 && {
                          top: screenH * 0.01,
                        },
                                              // Insects level - move label down 10% on phones
                      levelName.toLowerCase() === 'insects' && 
                       Math.min(screenW, screenH) < 768 && {
                        top: screenH * 0.01,
                      },
                      // Ocean level - move label up on phone landscape
                      levelName.toLowerCase() === 'ocean' && 
                       isLandscape && Math.min(screenW, screenH) < 768 && {
                        top: screenH * 0.01,
                      },
                      // Desert level - move label down on phones
                      levelName.toLowerCase() === 'desert' && 
                       Math.min(screenW, screenH) < 768 && {
                        top: screenH * 0.01,
                      },
                      // Savannah level - move label down 10% on phones
                      levelName.toLowerCase() === 'savannah' && 
                       Math.min(screenW, screenH) < 768 && {
                        top: screenH * 0.01,
                      },
                      // Arctic level - move label down on phones
                      levelName.toLowerCase() === 'jungle' && 
                       Math.min(screenW, screenH) < 768 && {
                        top: screenH * 0.01,
                      },
                      // Forest level - move label down on phones

                        {
                          opacity: animalFadeAnim,
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
                                outputRange: [0.8, 1, 1.1],
                              }),
                            },
                          ],
                        }
                      ]}>
                        <Animated.Text style={[
                          dynamicStyles.animalName,
                          {
                            transform: [{
                              scale: nameScaleAnim.interpolate({
                                inputRange: [0, 1, 1.1],
                                outputRange: [0.9, 1, 1.05],
                              }),
                            }],
                            shadowColor: '#000',
                            shadowOpacity: nameScaleAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.25, 0.5],
                            }),
                            shadowRadius: nameScaleAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [3, 8],
                            }),
                          }
                        ]}>
                          {currentAnimal?.name}
                        </Animated.Text>
                      </Animated.View>
                    )}
                  </View>

                  {!showDiscoverScreen && (
                    <NavigationButtons
                      handlePrev={handlePrev}
                      handleNext={handleNext}
                      isTransitioning={isTransitioning}
                      currentAnimalIndex={currentAnimalIndex}
                      bgColor={isMuted ? 'rgba(0,0,0,0.5)' : 'rgba(255, 255, 255, 0.7)'}
                    />
                  )}
                  
                                  {hasAnimals && !showName && !isTransitioning && !showDiscoverScreen && (
                    <InstructionBubble
                      text={t('tapAnimalToHearSound')}
                      arrowAnim={arrowAnim}
                      image={require('../assets/images/tap.png')}
                    />
                  )}
                </View>
              )}

              {!hasAnimals && !showDiscoverScreen && (
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

              <CongratsModal
                showCongratsModal={showCongratsModal}
                startOver={startOver}
                goToHome={goToHome}
                levelName={levelName}
              />
            </View>
          </Animated.View>
        </View>
      </ReanimatedView.View>
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
