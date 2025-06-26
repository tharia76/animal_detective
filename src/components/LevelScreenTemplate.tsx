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

  // 1) Add at the top, alongside your other refs
  const waitingToResumeBg = useRef(false);

  const currentAnimal = useMemo(() => animals.length > 0 ? animals[currentAnimalIndex] : null, [animals, currentAnimalIndex]);
  const hasAnimals = animals.length > 0;

  const roadAnimation = useRef(new Animated.Value(0)).current;
  const { width: screenW, height: screenH } = useWindowDimensions();

  // --- FADE LOGIC FOR BACKGROUND SWITCHING ---
  // We want to crossfade between backgrounds (image <-> moving bg) to avoid black flashes.
  // We'll keep both backgrounds mounted and animate their opacity.

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
        isMuted ? bgMusicRef.current.pause() : bgMusicRef.current.play();
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
  // 3) in your playSounds() playbackStatusUpdate, after it finally finishes, handle waitingToResumeBg
  const playSounds = useCallback(async () => {
    if (isMuted || !currentAnimal?.sound) return;

    try {
      // stop whatever was playing before
      await stopSound(true);

      isSoundPlayingRef.current = true;

      const animalPlayer = createAudioPlayer(currentAnimal.sound);
      soundRef.current = animalPlayer;

      animalPlayer.addListener('playbackStatusUpdate', (status: any) => {
        if (status.didJustFinish) {
          animalPlayer.remove();
          if (soundRef.current === animalPlayer) soundRef.current = null;

          // then optionally play the label sound
          if (!isMuted && currentAnimal?.labelSound) {
            const labelPlayer = createAudioPlayer(currentAnimal.labelSound);
            soundRef.current = labelPlayer;
            labelPlayer.play();
            labelPlayer.addListener('playbackStatusUpdate', (labelStatus: any) => {
              if (labelStatus.didJustFinish) {
                labelPlayer.remove();
                if (soundRef.current === labelPlayer) soundRef.current = null;
                isSoundPlayingRef.current = false;

                // If we are waiting to resume BG, do it now
                if (waitingToResumeBg.current && !isMuted) {
                  bgMusicRef.current?.play();
                  waitingToResumeBg.current = false;
                }
              }
            });
          } else {
            isSoundPlayingRef.current = false;

            // If we are waiting to resume BG, do it now
            if (waitingToResumeBg.current && !isMuted) {
              bgMusicRef.current?.play();
              waitingToResumeBg.current = false;
            }
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
      // If we are waiting to resume BG, do it now (in case of error)
      if (waitingToResumeBg.current && !isMuted) {
        bgMusicRef.current?.play();
        waitingToResumeBg.current = false;
      }
    }
  }, [currentAnimal, isMuted, stopSound, bgMusicRef]);

  // --- REWRITE: handleAnimalPress as the single tap handler for animal card ---
  // 2) tweak your handleAnimalPress so it doesn't immediately restart BG if a sound is in flight
  const handleAnimalPress = useCallback(() => {
    if (!showName) {
      setShowName(true);

      // 1) pause the level BG immediately
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
      }

      // clear any old wait flag
      waitingToResumeBg.current = false;

      // 2) kill any in‑flight animal audio, then play the new one
      stopSound(true).then(playSounds);
    } else {
      setShowName(false);

      // if a sound is playing, wait for it — otherwise resume immediately
      if (soundRef.current) {
        waitingToResumeBg.current = true;
      } else {
        if (!isMuted) bgMusicRef.current?.play();
      }
    }
  }, [showName, isMuted, playSounds, stopSound, bgMusicRef, soundRef]);

  // Remove toggleShowName entirely

  const handleNavigation = useCallback((direction: 'next' | 'prev') => {
    if (!hasAnimals || isTransitioning) return;

    setIsTransitioning(true);
    stopSound(true);

    // Use a single animation for smoother transitions
    Animated.timing(animalFadeAnim, {
      toValue: 0,
      duration: FADE_DURATION,
      useNativeDriver: true,
    }).start(() => {
      let newIndex;
      if (direction === 'next') {
        newIndex = currentAnimalIndex + 1;
        if (newIndex === animals.length && !levelCompleted) {
          setLevelCompleted(true);
          setShowCongratsModal(true);
          setIsTransitioning(false);
          return;
        }
      } else {
        newIndex = (currentAnimalIndex - 1 + animals.length) % animals.length;
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
            { opacity: movingBgOpacity, backgroundColor: 'transparent' }
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
            style={StyleSheet.absoluteFillObject}
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
            {levelName.toLowerCase() === 'desert' && showInstruction && (() => {
              console.log('Desert level detected, rendering AnimatedSand');
              return <AnimatedSand />;
            })()}

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
                // Add extra margin for forest level to move animals down
                levelName.toLowerCase() === 'forest' && {
                  marginTop: Math.max(getResponsiveSpacing(70, getScaleFactor(screenW, screenH)), screenH * 0.1) + 300, // 300px more than default
                }
              ]}>
                <TouchableOpacity onPress={handleAnimalPress} activeOpacity={1.0} disabled={isTransitioning}>
                  <Animated.View style={{ opacity: animalFadeAnim }}>
                    {renderAnimal()}
                  </Animated.View>
                </TouchableOpacity>
                {showName && currentAnimal && (
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
                      {currentAnimal.name}
                    </Text>
                  </Animated.View>
                )}
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
