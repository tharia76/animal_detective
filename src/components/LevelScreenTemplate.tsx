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

  // --- BG MUSIC STATE ---
  const bgMusicRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);
  const [currentBgMusicKey, setCurrentBgMusicKey] = useState<string | undefined>(undefined);
  
  // Audio ducking constants
  const NORMAL_BG_VOLUME = 1.0;
  const DUCKED_BG_VOLUME = 0.2;

  // Helper functions for audio ducking
  const duckBackgroundMusic = useCallback(() => {
    if (bgMusicRef.current && !isMuted) {
      try {
        bgMusicRef.current.volume = DUCKED_BG_VOLUME;
        console.log('Background music ducked to', DUCKED_BG_VOLUME);
      } catch (error) {
        console.warn('Error ducking background music:', error);
      }
    }
  }, [isMuted, DUCKED_BG_VOLUME]);

  const restoreBackgroundMusic = useCallback(() => {
    if (bgMusicRef.current && !isMuted) {
      try {
        bgMusicRef.current.volume = NORMAL_BG_VOLUME;
        console.log('Background music restored to', NORMAL_BG_VOLUME);
      } catch (error) {
        console.warn('Error restoring background music:', error);
      }
    }
  }, [isMuted, NORMAL_BG_VOLUME]);

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
    if (MOVING_BG_MAP[key]) {
      return MOVING_BG_MAP[key];
    }
    return skyBackgroundImageUri;
  }, [levelName, skyBackgroundImageUri]);

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
        p.volume = NORMAL_BG_VOLUME; // Set initial volume
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
    
    if (!showName) {
      console.log('Setting showName to true and playing sounds');
      setShowName(true);
      // Background music ducking will be handled in playSounds()
      // kill any in‑flight animal audio, then play the new one
      stopSound(true).then(() => {
        // Force play sounds even if muted is checked, for better UX
        playSounds();
      });
    } else {
      console.log('Setting showName to false');
      setShowName(false);
      // If no sound is currently playing, restore background music volume immediately
      if (!soundRef.current) {
        restoreBackgroundMusic();
      }
      // If sound is playing, volume will be restored when sound finishes
    }
  }, [showName, playSounds, stopSound, restoreBackgroundMusic, isTransitioning, currentAnimal]);

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
    handleNavigation('next');
  }, [handleNavigation]);

  const handlePrev = useCallback(() => {
    handleNavigation('prev');
  }, [handleNavigation]);

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

    if (currentAnimal.type === 'sprite' && currentAnimal.frames && currentAnimal.spriteSheetSize) {
      return (
        <SpriteAnimation
          key={key}
          frames={currentAnimal.frames}
          source={currentAnimal.source}
          spriteSheetSize={currentAnimal.spriteSheetSize}
          style={dynamicStyles.animalImage}
        />
      );
    }
    return (
      <Image
        key={key}
        source={currentAnimal.source}
        style={dynamicStyles.animalImage}
        fadeDuration={0}
        progressiveRenderingEnabled={true}
      />
    );
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
      <View style={StyleSheet.absoluteFillObject}>
        {/* Moving background (sky) */}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            { opacity: movingBgOpacity, backgroundColor: 'transparent' },
            // Move forest moving background up
            levelName.toLowerCase() === 'forest' && {
              top: -100, // Move moving background up by 100px
            },
            // Move jungle moving background up in mobile portrait
            levelName.toLowerCase() === 'jungle' && !isLandscape && {
              top: -150, // Move moving background up by 150px in portrait
            }
          ]}
        >
          <MovingBg
            backgroundImageUri={movingBgSource as string | null}
            movingDirection={currentAnimal?.movingDirection ?? 'left'}
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
              // Move forest background up
              levelName.toLowerCase() === 'forest' && {
                top: -100, // Move background up by 100px
              },
              // Move jungle background up in mobile portrait
              levelName.toLowerCase() === 'jungle' && !isLandscape && {
                top: -200, // Move background up by 150px in portrait
              }
            ]}
            resizeMode="cover"
            onLoadEnd={onLoadEnd}
            onError={onLoadEnd}
          />
        </Animated.View>
      </View>

      {/* 2) FULL-SCREEN FOREGROUND SIBLING */}
      <View style={StyleSheet.absoluteFillObject}>
        <Animated.View style={{ flex: 1, opacity: contentFade }}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity style={dynamicStyles.backToMenuButton} onPress={goToHome}>
              <Ionicons name="home" size={24} color="#fff" />
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
                // Add extra margin for arctic level to move animals down
                levelName.toLowerCase() === 'arctic' && {
                  marginTop: Math.max(getResponsiveSpacing(70, getScaleFactor(screenW, screenH)), screenH * 0.1) + 260, // 260px more than default
                },
                // Move animals down for forest level
                levelName.toLowerCase() === 'forest' && {
                  marginTop: Math.max(getResponsiveSpacing(70, getScaleFactor(screenW, screenH)), screenH * 0.1) + (isLandscape ? 70 : 220), // 70px in landscape, 220px in portrait
                },
                // Move animals down for farm level in mobile portrait
                levelName.toLowerCase() === 'farm' && !isLandscape && {
                  marginTop: Math.max(getResponsiveSpacing(70, getScaleFactor(screenW, screenH)), screenH * 0.1) + 150, // 150px down from default in portrait
                },
                // Move animals down for jungle level in mobile portrait
                levelName.toLowerCase() === 'jungle' && !isLandscape && {
                  marginTop: Math.max(getResponsiveSpacing(70, getScaleFactor(screenW, screenH)), screenH * 0.1) + 350, // 350px down from default in portrait
                },
                // Move animals down for birds level
                levelName.toLowerCase() === 'birds' && {
                  marginTop: Math.max(getResponsiveSpacing(70, getScaleFactor(screenW, screenH)), screenH * 0.1) + 100, // 100px down from default
                }
              ]}>
                <TouchableOpacity 
                  onPress={handleAnimalPress} 
                  activeOpacity={0.8} 
                  disabled={isTransitioning}
                  style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Animated.View style={{ opacity: animalFadeAnim, alignItems: 'center', justifyContent: 'center' }}>
                    {renderAnimal()}
                  </Animated.View>
                </TouchableOpacity>
                {showName && currentAnimal && (() => {
                  return (
                    <Animated.View style={[
                      dynamicStyles.animalNameWrapper,
                      {
                        opacity: animalFadeAnim,
                        transform: [{
                          translateY: animalFadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [10, 0],
                          }),
                        }],
                      }
                    ]}>
                      <Text style={dynamicStyles.animalName}>
                        {currentAnimal?.name}
                      </Text>
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
