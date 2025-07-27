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
import { getResponsiveSpacing, getScaleFactor } from '../utils/responsive';

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
    if (currentAnimal?.isMoving) {
      // Fade in moving bg, fade out image bg
      Animated.parallel([
        Animated.timing(movingBgOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(imageBgOpacity, {
          toValue: 0,
          duration: 350,
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
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(imageBgOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setWasMoving(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAnimal?.isMoving]);

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
          setShowCongratsModal(true);
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
      return baseMargin + 145; // Moved up 5px (was 150, now 145)
    }
    
    // Farm level on iPad - move animals up by 30px
    if (levelName.toLowerCase() === 'farm' && screenW >= 768 && Platform.OS === 'ios') {
      return baseMargin - 30; // Move up 30px on iPad
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
    
    // Forest level
    if (levelName.toLowerCase() === 'forest') {
      let forestMargin = baseMargin + 50; // Original forest positioning for all devices
      
      // Move animals up by 30% on forest level (general)
      forestMargin -= screenH * 0.3;
      
      // On mobile devices, move only moving animals down
      const isMobile = Math.min(screenW, screenH) < 768;
      const isTablet = Math.min(screenW, screenH) >= 768;
      
              if (isMobile && currentAnimal?.isMoving) {
          forestMargin -= screenH * 0.1; // Move moving animals up by 10% on mobile
        } else if (isMobile && !currentAnimal?.isMoving) {
          forestMargin += screenH * 0.1; // Move moving animals up by 10% on mobile
        }
        
        // Move forest mouse down specifically on mobile
        if (isMobile && currentAnimal?.name === t('animals.mouse')) {
          forestMargin += screenH * 0.2; // Move mouse down by 20% on mobile
        }
      
      // On tablets, move animals down by 10%
      if (isTablet && currentAnimal?.isMoving) {
        forestMargin += screenH * 0.1; // Move animals down by 10% on tablets
      } else if (isTablet && !currentAnimal?.isMoving) {
        forestMargin += screenH * 0.3; // Move animals down by 10% on tablets
      }
      
      // iPad landscape gets additional positioning adjustment
      if (isLandscape && screenW >= 900 && Platform.OS === 'ios') {
        forestMargin += 150; // Reduced from 300 to 150 to push animals up by 150px
      }
      
      return forestMargin;
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
    
    // Savannah level - move all animals up by 20%
    if (levelName.toLowerCase() === 'savannah') {
      return baseMargin - (screenH * 0.2);
    }
    
    // Ocean level - move animals up by 20% on tablets
    if (levelName.toLowerCase() === 'ocean') {
      const isTablet = Math.min(screenW, screenH) >= 768;
      if (isTablet) {
        return baseMargin - (screenH * 0.2);
      }
    }
    
    // Insects level - move animals up by 20% on tablets
    if (levelName.toLowerCase() === 'insects') {
      const isTablet = Math.min(screenW, screenH) >= 768;
      if (isTablet) {
        return baseMargin - (screenH * 0.2);
      }
    }
    
    let finalMargin = baseMargin; // default
    
    // Farm level - move animals up by 5px in all cases not handled above
    if (levelName.toLowerCase() === 'farm') {
      finalMargin -= 5; // Move up 5px for farm level
    }
    
    // Push animals down 10% on phones (non-tablet devices) - but not for desert level
    const isPhone = Math.min(screenW, screenH) < 768;
    if (isPhone && levelName.toLowerCase() !== 'desert') {
      finalMargin += screenH * 0.1; // Push down 10% of screen height on phones
    }
    
    // iPad landscape: move all animals down by 200px
    if (isLandscape && screenW >= 900 && Platform.OS === 'ios') {
      finalMargin += 300; // Increased from 200 to 300 (additional 100px down)
    }
    
    console.log('Final margin calculation:', {
      levelName,
      finalMargin,
      baseMargin,
      appliedPhoneLogic: isPhone && levelName.toLowerCase() !== 'desert',
      appliedIpadLogic: isLandscape && screenW >= 900 && Platform.OS === 'ios'
    });
    
    return finalMargin;
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
      {/* 1) FULL-SCREEN BACKGROUND SIBLINGS, BOTH MOUNTED, OPACITY ANIMATED */}
      <View style={[StyleSheet.absoluteFillObject, {
        backgroundColor: levelName.toLowerCase() === 'forest' ? '#1a3d1a' : 
                        levelName.toLowerCase() === 'arctic' ? '#e6f2ff' :
                        levelName.toLowerCase() === 'birds' ? '#87CEEB' :
                        levelName.toLowerCase() === 'jungle' ? '#1a3d1a' :
                        levelName.toLowerCase() === 'savannah' ? '#f4e4bc' :
                        levelName.toLowerCase() === 'ocean' ? '#006994' :
                        levelName.toLowerCase() === 'desert' ? '#f4e4bc' :
                        levelName.toLowerCase() === 'farm' ? '#87CEEB' :
                        '#000'
      }]}>
        <View style={StyleSheet.absoluteFillObject}>
          {/* Moving background (sky) */}
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              { opacity: movingBgOpacity, backgroundColor: 'transparent' },
              // Base style adjustments
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              },
              // Increase height on iPad landscape
              isLandscape && screenW >= 768 && Platform.OS === 'ios' && {
                height: screenH * 1.2, // Reduce from 1.5 to 1.2 to match better
                bottom: undefined, // Remove bottom constraint to allow height to work
                top: screenH * 0.1, // Push down by 10% of screen height
              },
              // Move forest moving background up
   
              // Move forest moving background up more on mobile landscape
              // don't move
              // Move jungle moving background up in mobile portrait
              levelName.toLowerCase() === 'jungle' && !isLandscape && {
                top: -400, // Move moving background up by 400px in portrait
                height: screenH + 400, // Extend height to cover the gap
              },
              // Move jungle moving background up more on screens < 900 in portrait
              levelName.toLowerCase() === 'jungle' && !isLandscape && screenW < 900 && {
                top: -600, // Move moving background up by 600px on smaller screens in portrait
                height: screenH + 600, // Extend height to cover the gap
              },
              // Move birds moving background up in mobile landscape
              levelName.toLowerCase() === 'birds' && isLandscape && (Platform.OS === 'ios' || Platform.OS === 'android') && {
                top: -200, // Move moving background up by 200px in landscape on mobile
                height: screenH + 200, // Extend height to cover the gap
              },

              // Move savannah moving background up on mobile
              levelName.toLowerCase() === 'savannah' && (Platform.OS === 'ios' || Platform.OS === 'android') && {
                top: -150, // Move moving background up by 150px on mobile (increased by 50px)
                height: screenH + 150, // Extend height to cover the gap
              },
              // Move forest moving background up in landscape
              levelName.toLowerCase() === 'forest' && isLandscape && (Platform.OS === 'ios' || Platform.OS === 'android') && {
                top: -50, // Move moving background up by 50px in landscape on mobile
                height: screenH + 200, // Extend height to cover the gap
              },
              // Move forest moving background up more on phone landscape (conditional on moving animals)
              levelName.toLowerCase() === 'forest' && isLandscape && (Platform.OS === 'ios' || Platform.OS === 'android') && Math.min(screenW, screenH) < 768 && {
                top: currentAnimal?.isMoving ? -500 : -200, // Move up more when moving, normal up when not moving
                height: currentAnimal?.isMoving ? screenH + 500 : screenH + 200, // Extend height accordingly
              },
              // Move forest moving background on phone portrait (conditional on moving animals)
              levelName.toLowerCase() === 'forest' && !isLandscape && Math.min(screenW, screenH) < 768 && currentAnimal?.isMoving && {
                top: -400, // Push background up more
                height: screenH + 400, // Extend height to cover the gap
              },
              // Move forest moving background on tablet (conditional on moving animals)
              levelName.toLowerCase() === 'forest' && Math.min(screenW, screenH) >= 768 && currentAnimal?.isMoving && {
                top: -500, // Move up more when moving on tablets
                height: screenH + 500, // Extend height accordingly
              },
              
              // Move farm moving background up
              levelName.toLowerCase() === 'farm' && {
                top: -200, // Move moving background up by 200px
                height: screenH + 200, // Extend height to cover the gap
              },
              // Move farm moving background up more on phones
              levelName.toLowerCase() === 'farm' && Math.min(screenW, screenH) < 768 && {
                top: -350, // Move moving background up by 350px on phones
                height: screenH + 350, // Extend height to cover the gap
              },
              // Move ocean moving background up
              levelName.toLowerCase() === 'ocean' && {
                top: -200, // Move moving background up by 200px
                height: screenH + 200, // Extend height to cover the gap
              },
              // Move ocean moving background up more on phones
              levelName.toLowerCase() === 'ocean' && Math.min(screenW, screenH) < 768 && {
                top: -350, // Move moving background up by 350px on phones
                height: screenH + 350, // Extend height to cover the gap
              },
              // Move desert moving background up
              levelName.toLowerCase() === 'desert' && {
                top: -200, // Move moving background up by 200px
                height: screenH + 200, // Extend height to cover the gap
              },
              // Move desert moving background up more on phones
              levelName.toLowerCase() === 'desert' && Math.min(screenW, screenH) < 768 && {
                top: -350, // Move moving background up by 350px on phones
                height: screenH + 350, // Extend height to cover the gap
              },
              // Move arctic moving background up
              levelName.toLowerCase() === 'arctic' && {
                top: -450, // Move moving background up by 350px (increased a bit more)50
                height: screenH + 350, // Extend height to cover the gap
              },
              // Move arctic moving background up more on phones
              levelName.toLowerCase() === 'arctic' && Math.min(screenW, screenH) < 768 && {
                top: -500, // Move moving background up by 500px on phones (increased a bit more)
                height: screenH + 500, // Extend height to cover the gap
              },
              // Move savannah moving background up
              levelName.toLowerCase() === 'savannah' && {
                top: -250, // Move moving background up by 250px (increased by 50px)
                height: screenH + 250, // Extend height to cover the gap
              },
              // Move savannah moving background up more on phones
              levelName.toLowerCase() === 'savannah' && Math.min(screenW, screenH) < 900 && {
                top: -400, // Move moving background up by 400px on phones (increased by 50px)
                height: screenH + 400, // Extend height to cover the gap
              },
                              // Move jungle moving background up
                levelName.toLowerCase() === 'jungle' && {
                  top: -400, // Move moving background up by 400px (pushed down from -600px)
                  height: screenH + 400, // Extend height to cover the gap
                },
             
                levelName.toLowerCase() === 'jungle' && isLandscape && (Platform.OS === 'ios' || Platform.OS === 'android') && {
                  top: -450, // Move moving background up by 400px (pushed down from -600px)
                  height: screenH + 650, // Extend height to cover the gap
                },
                // Move jungle moving background up more on screens < 900 in landscape
                levelName.toLowerCase() === 'jungle' && isLandscape && (Platform.OS === 'ios' || Platform.OS === 'android') && screenW < 900 && {
                  top: -520, // Move moving background up by 300px on smaller screens in landscape
                  height: screenH + 650, // Extend height to cover the gap
                },


              // Move insects moving background up
              levelName.toLowerCase() === 'insects' && {
                top: -350, // Move moving background up by 350px
                height: screenH + 350, // Extend height to cover the gap
              },
              // Move insects moving background up more on phones
              levelName.toLowerCase() === 'insects' && Math.min(screenW, screenH) < 768 && {
                top: -500, // Move moving background up by 500px on phones
                height: screenH + 500, // Extend height to cover the gap
              }
            ]}
          >
            <MovingBg
              backgroundImageUri={movingBgSource as string | null}
              movingDirection={currentAnimal?.movingDirection ?? 'left'}
              containerHeight={isLandscape && screenW >= 768 && Platform.OS === 'ios' ? screenH * 1.3 : undefined}
              containerWidth={isLandscape && screenW >= 768 && Platform.OS === 'ios' ? screenW * 1.2 : undefined}
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
                // Base style adjustments
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                },
                // Increase height on iPad landscape
                isLandscape && screenW >= 768 && Platform.OS === 'ios' && {
                  height: screenH * 1.2, // Reduce from 1.5 to 1.2 to match better
                  bottom: undefined, // Remove bottom constraint to allow height to work
                  top: screenH * 0.1, // Push down by 10% of screen height
                },
                // Move jungle background up in mobile portrait
                levelName.toLowerCase() === 'jungle' && !isLandscape && {
                  top: -400, // Move background up by 400px in portrait (pushed down)
                  height: screenH + 400, // Extend height to cover the gap
                },
                // Move jungle background up in mobile landscape
                levelName.toLowerCase() === 'jungle' && isLandscape && (Platform.OS === 'ios' || Platform.OS === 'android') && {
                  top: -400, // Move background up by 400px in landscape on mobile
                  height: screenH + 400, // Extend height to cover the gap
                },
                // Move birds background up in mobile landscape
                levelName.toLowerCase() === 'birds' && isLandscape && (Platform.OS === 'ios' || Platform.OS === 'android') && {
                  top: -200, // Move background up by 200px in landscape on mobile
                  height: screenH + 200, // Extend height to cover the gap
                },

                // Move savannah background up on mobile
                levelName.toLowerCase() === 'savannah' && (Platform.OS === 'ios' || Platform.OS === 'android') && {
                  top: -150, // Move background up by 150px on mobile (increased by 50px)
                  height: screenH + 150, // Extend height to cover the gap
                },
                // Move forest background up in landscape
                levelName.toLowerCase() === 'forest' && isLandscape && (Platform.OS === 'ios' || Platform.OS === 'android') && {
                  top: -50, // Move background up by 50px in landscape on mobile
                  height: screenH + 200, // Extend height to cover the gap
                },
                // Move forest background up more on phone landscape
                levelName.toLowerCase() === 'forest' && isLandscape && (Platform.OS === 'ios' || Platform.OS === 'android') && Math.min(screenW, screenH) < 768 && {
                  top: -200, // Move background up by 200px in landscape on phones
                  height: screenH + 200, // Extend height to cover the gap
                },
                // Move farm background up
                levelName.toLowerCase() === 'farm' && {
                  top: -200, // Move background up by 200px
                  height: screenH + 200, // Extend height to cover the gap
                },
                // Move farm background up more on phones
                levelName.toLowerCase() === 'farm' && Math.min(screenW, screenH) < 768 && {
                  top: -350, // Move background up by 350px on phones
                  height: screenH + 350, // Extend height to cover the gap
                },
                // Move ocean background up
                levelName.toLowerCase() === 'ocean' && {
                  top: -200, // Move background up by 200px
                  height: screenH + 200, // Extend height to cover the gap
                },
                // Move ocean background up more on phones
                levelName.toLowerCase() === 'ocean' && Math.min(screenW, screenH) < 768 && {
                  top: -350, // Move background up by 350px on phones
                  height: screenH + 350, // Extend height to cover the gap
                },
                // Move desert background up
                levelName.toLowerCase() === 'desert' && {
                  top: -200, // Move background up by 200px
                  height: screenH + 200, // Extend height to cover the gap
                },
                // Move desert background up more on phones
                levelName.toLowerCase() === 'desert' && Math.min(screenW, screenH) < 768 && {
                  top: -350, // Move background up by 350px on phones
                  height: screenH + 350, // Extend height to cover the gap
                },
                // Move arctic background up
                levelName.toLowerCase() === 'arctic' && {
                  top: -350, // Move background up by 350px (increased a bit more)
                  height: screenH + 350, // Extend height to cover the gap
                },
                // Move arctic background up more on phones
                levelName.toLowerCase() === 'arctic' && Math.min(screenW, screenH) < 768 && {
                  top: -500, // Move background up by 500px on phones (increased a bit more)
                  height: screenH + 500, // Extend height to cover the gap
                },
                // Move savannah background up
                levelName.toLowerCase() === 'savannah' && {
                  top: -250, // Move background up by 250px (increased by 50px)
                  height: screenH + 250, // Extend height to cover the gap
                },
                // Move savannah background up more on phones
                levelName.toLowerCase() === 'savannah' && Math.min(screenW, screenH) < 768 && {
                  top: -400, // Move background up by 400px on phones (increased by 50px)
                  height: screenH + 400, // Extend height to cover the gap
                },
                // Move jungle background up
                levelName.toLowerCase() === 'jungle' && {
                  top: -400, // Move background up by 400px
                  height: screenH + 400, // Extend height to cover the gap
                },
                // Move jungle background up more on screens < 900
                levelName.toLowerCase() === 'jungle' && screenW < 900 && {
                  top: -600, // Move background up by 600px on smaller screens
                  height: screenH + 600, // Extend height to cover the gap
                },
                // Move jungle background up more on screens < 900 in landscape
                levelName.toLowerCase() === 'jungle' && isLandscape && (Platform.OS === 'ios' || Platform.OS === 'android') && screenW < 900 && {
                  top: -300, // Move background up by 300px on smaller screens in landscape
                  height: screenH + 300, // Extend height to cover the gap
                },
                // Move insects background up
                levelName.toLowerCase() === 'insects' && {
                  top: -350, // Move background up by 350px
                  height: screenH + 350, // Extend height to cover the gap
                },
                // Move insects background up more on phones
                levelName.toLowerCase() === 'insects' && Math.min(screenW, screenH) < 768 && {
                  top: -500, // Move background up by 500px on phones
                  height: screenH + 500, // Extend height to cover the gap
                }
              ]}
              resizeMode="cover"
              onLoadEnd={onLoadEnd}
              onError={onLoadEnd}
            />
          </Animated.View>
        </View>
      </View>

      {/* 2) FULL-SCREEN FOREGROUND SIBLING */}
      <View style={StyleSheet.absoluteFillObject}>
        <Animated.View style={{ flex: 1, opacity: contentFade }}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity style={dynamicStyles.backToMenuButton} onPress={goToHome}>
              <Ionicons name="home" size={30} color="#fff" />
            </TouchableOpacity>
            {hasAnimals && (
              <TouchableOpacity style={dynamicStyles.soundButton} onPress={toggleMute}>
                <Ionicons
                  name={isMuted ? 'volume-mute' : 'volume-high'}
                  size={38}
                  color="green"
                />
              </TouchableOpacity>
            )}

            {/* Ocean bubbles - only show for ocean level */}
            {levelName.toLowerCase() === 'ocean' && showInstruction && <AnimatedBubbles />}

            {/* Desert sand - only show for desert level */}
            {levelName.toLowerCase() === 'desert' && showInstruction && <AnimatedSand />}

            {/* Arctic snow - only show for arctic level */}
            {levelName.toLowerCase() === 'arctic' && showInstruction && <AnimatedSnow />}

            {/* Forest fireflies - only show for forest level */}
            {levelName.toLowerCase() === 'forest' && showInstruction && <AnimatedFireflies />}

            {/* Forest leaves - only show for forest level */}
            {levelName.toLowerCase() === 'forest' && showInstruction && <AnimatedLeaves />}

                                  {hasAnimals && (
            <View style={dynamicStyles.content}>
                            <View style={[
                dynamicStyles.animalCard,
                {
                  marginTop: getAnimalMarginTop()
                }
              ]}>
                {/* Large invisible touch area for phones */}
                {Math.min(screenW, screenH) < 768 && (
                  <TouchableOpacity 
                    onPress={handleAnimalPress} 
                    activeOpacity={0.0} 
                    disabled={isTransitioning}
                                          style={{
                        position: 'absolute',
                        top: '10%', // Start 20% from top
                        left: '25%', // Start 25% from left - more centered
                        right: '25%', // End 25% from right - more centered  
                                                  bottom: '1%', // End 40% from bottom - much smaller area to avoid arrows
                          backgroundColor: 'transparent',
                        zIndex: 999, // Much higher z-index to be above everything
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
                  /* Non-touchable animal display for phones (touch handled by invisible layer above) */
                  <Animated.View 
                    style={{ 
                      opacity: animalFadeAnim, 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      zIndex: -1, // Ensure this is behind the invisible layer
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
                    pointerEvents="none" // Prevent this from blocking touch events
                  >
                    {renderAnimal()}
                  </Animated.View>
                )}
                {showName && currentAnimal && (() => {
                  return (
                    <Animated.View style={[
                      dynamicStyles.animalNameWrapper,
                      // Ocean level - move label down on tablets
                      levelName.toLowerCase() === 'ocean' && Math.min(screenW, screenH) >= 768 && {
                        top: screenH * 0.1,
                      },
                      // Insects level - move label down on tablets
                      levelName.toLowerCase() === 'insects' && Math.min(screenW, screenH) >= 768 && {
                        top: screenH * 0.1,
                      },
                      // Savannah level - move label down on tablets
                      levelName.toLowerCase() === 'savannah' && Math.min(screenW, screenH) >= 768 && {
                        top: screenH * 0.1,
                      },
                      // Jungle level - move label down on tablets
                      levelName.toLowerCase() === 'jungle' && Math.min(screenW, screenH) >= 768 && {
                        top: screenH * 0.1,
                      },
                      // Forest level - move label down on phones
                      levelName.toLowerCase() === 'forest' && Math.min(screenW, screenH) < 768 && {
                        top: screenH * 0.01, // Move down 20% on phones (0.05 base + 0.20 = 0.25, but using 0.15 for better positioning)
                      },
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
                  );
                })()}
              </View>

              <NavigationButtons
                handlePrev={handlePrev}
                handleNext={handleNext}
                isTransitioning={isTransitioning}
                currentAnimalIndex={currentAnimalIndex}
                bgColor= {isMuted ? 'rgba(0,0,0,0.5)' : 'rgba(255, 255, 255, 0.7)'}
              />
              {hasAnimals && !showName && !isTransitioning && (
                <InstructionBubble
                  text={t('tapAnimalToHearSound')}
                  arrowAnim={arrowAnim}
                  image={require('../assets/images/tap.png')}
                />
              )}
            </View>
          )}

          {!hasAnimals && (
            <View style={dynamicStyles.content}>
              <Text style={[dynamicStyles.animalName, { fontSize: 24, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10 }]}>
                {t('noAnimalsForLevel')}
              </Text>
            </View>
          )}

         <CongratsModal
          showCongratsModal={showCongratsModal}
          startOver={startOver}
          goToHome={goToHome}
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
