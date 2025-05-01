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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid, Video, ResizeMode } from 'expo-av';
import SpriteAnimation from './SpriteAnimation';
import InstructionBubble from './InstructionBubble';
import { styles } from '../../styles/styles';
import EndlessRoad from './EndlessRoad';
import NavigationButtons from './NavigationButtons';
import CongratsModal from './CongratsModal';
import MovingBg from './MovingBg';

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
};

const FADE_DURATION = 150;
const CONTENT_FADE_DURATION = 300;

export default function LevelScreenTemplate({
  levelName,
  animals,
  backgroundImageUri,
  skyBackgroundImageUri,
  onBackToMenu,
}: Props) {
  const [currentAnimalIndex, setCurrentAnimalIndex] = useState(0);
  const [showName, setShowName] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showInstruction, setShowInstruction] = useState(true);
  const [bgLoading, setBgLoading] = useState(!!backgroundImageUri);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const arrowAnim = useRef(new Animated.Value(0)).current;
  const animalFadeAnim = useRef(new Animated.Value(1)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const soundRef = useRef<Audio.Sound | null>(null);
  const isSoundPlayingRef = useRef<boolean>(false);
  const confettiAnimRefs = useRef<Animated.Value[]>([]);
  const [showCongratsModal, setShowCongratsModal] = useState(false);
  const [visitedAnimals, setVisitedAnimals] = useState<Set<number>>(new Set([0]));
  const [levelCompleted, setLevelCompleted] = useState(false);

  const currentAnimal = useMemo(() => animals.length > 0 ? animals[currentAnimalIndex] : null, [animals, currentAnimalIndex]);
  const hasAnimals = animals.length > 0;

  const roadAnimation = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;

  // --- FADE LOGIC FOR BACKGROUND SWITCHING ---
  // We want to crossfade between backgrounds (image <-> moving bg) to avoid black flashes.
  // We'll keep both backgrounds mounted and animate their opacity.

  // Track which background is currently visible
  const [wasMoving, setWasMoving] = useState(currentAnimal?.isMoving ?? false);
  const movingBgOpacity = useRef(new Animated.Value(currentAnimal?.isMoving ? 1 : 0)).current;
  const imageBgOpacity = useRef(new Animated.Value(currentAnimal?.isMoving ? 0 : 1)).current;

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
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      allowsRecordingIOS: false,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
    }).catch(error => console.warn('Error setting audio mode:', error));
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
        soundRef.current.unloadAsync().catch(error =>
          console.warn('Error unloading sound on cleanup:', error)
        );
        soundRef.current = null;
        isSoundPlayingRef.current = false;
      }
    };
  }, []);

  const stopSound = useCallback(async (unload = false) => {
    if (soundRef.current) {
      try {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          await soundRef.current.stopAsync();
          if (unload) {
            await soundRef.current.unloadAsync();
            soundRef.current = null;
          }
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('Player is already unloaded')) {
        } else {
          console.warn('Error stopping/unloading sound:', error);
        }
      } finally {
        isSoundPlayingRef.current = false;
      }
    }
  }, []);

  const playSounds = useCallback(async () => {
    if (isMuted || !currentAnimal?.sound || isSoundPlayingRef.current) return;

    try {
      await stopSound(true);

      isSoundPlayingRef.current = true;

      const { sound: animalSound } = await Audio.Sound.createAsync(
        currentAnimal.sound,
        { shouldPlay: true }
      );
      soundRef.current = animalSound;

      animalSound.setOnPlaybackStatusUpdate(async (status) => {
        if (!status.isLoaded) {
          if (soundRef.current === animalSound) {
             soundRef.current = null;
             isSoundPlayingRef.current = false;
          }
          return;
        }

        if (status.didJustFinish) {
          await animalSound.unloadAsync();
          if (soundRef.current === animalSound) soundRef.current = null;

          if (!isMuted && currentAnimal?.labelSound) {
            try {
              const { sound: labelSound } = await Audio.Sound.createAsync(
                currentAnimal.labelSound,
                { shouldPlay: true }
              );
              soundRef.current = labelSound;

              labelSound.setOnPlaybackStatusUpdate((labelStatus) => {
                 if (!labelStatus.isLoaded) {
                    if (soundRef.current === labelSound) {
                       soundRef.current = null;
                       isSoundPlayingRef.current = false;
                    }
                    return;
                 }
                 if (labelStatus.didJustFinish) {
                    labelSound.unloadAsync();
                    if (soundRef.current === labelSound) soundRef.current = null;
                    isSoundPlayingRef.current = false;
                 }
              });
            } catch (labelError) {
               console.warn('Error playing label sound:', labelError);
               isSoundPlayingRef.current = false;
            }
          } else {
            isSoundPlayingRef.current = false;
          }
        }
      });
    } catch (error) {
      console.warn('Error playing sounds:', error);
      isSoundPlayingRef.current = false;
      if (soundRef.current) {
        await soundRef.current.unloadAsync().catch(e => console.warn("Error unloading after play error", e));
        soundRef.current = null;
      }
    }
  }, [currentAnimal, isMuted, stopSound]);

  const toggleShowName = useCallback(() => {
    setShowName(prev => !prev);
    playSounds();
  }, [playSounds]);

  const handleNavigation = useCallback((direction: 'next' | 'prev') => {
    if (!hasAnimals || isTransitioning) return;

    setIsTransitioning(true);
    stopSound(true);

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

      requestAnimationFrame(() => {
        Animated.timing(animalFadeAnim, {
          toValue: 1,
          duration: FADE_DURATION,
          useNativeDriver: true,
        }).start(() => {
          setIsTransitioning(false);
        });
      });
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
    onBackToMenu();
  }, [stopSound, onBackToMenu]);

  const toggleMute = () => {
    const changingToMuted = !isMuted;
    setIsMuted(changingToMuted);
    if (changingToMuted) {
      stopSound(true).catch(error => console.warn('Error stopping sound on mute:', error));
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

    requestAnimationFrame(() => {
        Animated.timing(animalFadeAnim, {
            toValue: 1,
            duration: FADE_DURATION,
            useNativeDriver: true,
        }).start(() => {
            setIsTransitioning(false);
        });
    });

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
        />
      );
    }
    return (
      <Image
        key={key}
        source={currentAnimal.source}
        style={styles.animalImage}
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
      <View style={[styles.container, { backgroundColor: 'transparent' }]}>
        <TouchableOpacity style={[styles.backToMenuButton]} onPress={goToHome}>
           <Ionicons name="home" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.content}>
           <Text style={[styles.animalName, { fontSize: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 15, marginTop: 100, color: '#fff' }]}>
             Background image not available for this level.
           </Text>
        </View>
      </View>
    );
  }

  // --- RENDER: Crossfade both backgrounds ---
  return (
    <View style={styles.container}>
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
          <MovingBg backgroundImageUri={skyBackgroundImageUri} movingDirection={currentAnimal?.movingDirection ?? 'left'} />
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
            imageStyle={styles.backgroundImageStyle}
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
            <TouchableOpacity style={styles.backToMenuButton} onPress={goToHome}>
              <Ionicons name="home" size={24} color="#fff" />
            </TouchableOpacity>
            {hasAnimals && (
              <TouchableOpacity style={styles.soundButton} onPress={toggleMute}>
                <Ionicons
                  name={isMuted ? 'volume-mute' : 'volume-high'}
                  size={38}
                  color="green"
                />
              </TouchableOpacity>
            )}

          {hasAnimals && (
            <View style={styles.content}>
              <View style={styles.animalCard}>
                <TouchableOpacity onPress={toggleShowName} activeOpacity={0.8} disabled={isTransitioning}>
                  <Animated.View style={{ opacity: animalFadeAnim }}>
                    {renderAnimal()}
                  </Animated.View>
                </TouchableOpacity>
                {showName && currentAnimal && (
                  <Animated.View style={[
                    styles.animalNameWrapper,
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
                    <Text style={styles.animalName}>
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
                  text="Tap the animal to hear its sound!"
                  arrowAnim={arrowAnim}
                  image={require('../../../assets/images/tap.png')}
                />
              )}
            </View>
          )}

          {!hasAnimals && (
            <View style={styles.content}>
              <Text style={[styles.animalName, { fontSize: 24, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10 }]}>
                No animals available for this level yet
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
