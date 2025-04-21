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
  Platform, // Import Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import SpriteAnimation from './SpriteAnimation';
import InstructionBubble from './InstructionBubble';
import { styles } from '../../styles/styles';

type Animal = {
  id: number;
  name: string;
  type: 'sprite' | 'image';
  source: any;
  frames?: any;
  spriteSheetSize?: { w: number; h: number };
  sound?: any;
  labelSound?: any;
};

type Props = {
  levelName: string;
  animals: Animal[];
  backgroundImageUri: string | null;
  onBackToMenu: () => void;
};

const FADE_DURATION = 150; // Duration for fade in/out animation for animals
const CONTENT_FADE_DURATION = 300; // Duration for initial content fade-in

export default function LevelScreenTemplate({
  levelName,
  animals,
  backgroundImageUri,
  onBackToMenu,
}: Props) {
  const [currentAnimalIndex, setCurrentAnimalIndex] = useState(0);
  const [showName, setShowName] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showInstruction, setShowInstruction] = useState(true);
  const [bgLoading, setBgLoading] = useState(!!backgroundImageUri); // True if URI exists
  const [isTransitioning, setIsTransitioning] = useState(false); // State to manage transition status
  const arrowAnim = useRef(new Animated.Value(0)).current;
  const animalFadeAnim = useRef(new Animated.Value(1)).current; // Start fully visible
  const contentFade = useRef(new Animated.Value(0)).current; // Start transparent for initial load
  const soundRef = useRef<Audio.Sound | null>(null);
  const isSoundPlayingRef = useRef<boolean>(false);
  const confettiAnimRefs = useRef<Animated.Value[]>([]);
  const [showCongratsModal, setShowCongratsModal] = useState(false);
  const [visitedAnimals, setVisitedAnimals] = useState<Set<number>>(new Set([0]));
  const [levelCompleted, setLevelCompleted] = useState(false);

  const currentAnimal = useMemo(() => animals.length > 0 ? animals[currentAnimalIndex] : null, [animals, currentAnimalIndex]);
  const hasAnimals = animals.length > 0;

  // No longer need useEffect to reset bgLoading, useState initializer handles it

  useEffect(() => {
    // Initialize audio
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false, // Ensure sound plays through speaker
      allowsRecordingIOS: false, // Not needed for playback
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
    }).catch(error => console.warn('Error setting audio mode:', error));
  }, []);

  useEffect(() => {
    // Arrow animation loop
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
  }, [arrowAnim]); // Added dependency

  useEffect(() => {
    // Sound cleanup
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(error =>
          console.warn('Error unloading sound on cleanup:', error)
        );
        soundRef.current = null; // Clear the ref
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
        // Ignore errors if sound is already unloading or unloaded
        if (error instanceof Error && error.message.includes('Player is already unloaded')) {
          // console.log('Sound already unloaded.');
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
      await stopSound(true); // Stop and unload previous sound first

      isSoundPlayingRef.current = true; // Set flag immediately

      // Play animal sound
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
        // Wrap index if needed (currently allows going past end for congrats)
        // newIndex = newIndex % animals.length;
      } else { // 'prev'
        newIndex = (currentAnimalIndex - 1 + animals.length) % animals.length;
      }

      // Add the new animal index to visited animals (only if moving prev for now, could add for next too)
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
    stopSound(true);
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
    animalFadeAnim.setValue(0); // Start faded out
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

  // Initialize confetti animation refs
  useEffect(() => {
    confettiAnimRefs.current = Array.from({ length: 30 }).map(() => new Animated.Value(0));
  }, []);

  // Start confetti animations when modal shows
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

  // Callback for when the background image finishes loading
  const onLoadEnd = useCallback(() => {
    setBgLoading(false);
    Animated.timing(contentFade, {
      toValue: 1,
      duration: CONTENT_FADE_DURATION,
      useNativeDriver: true,
    }).start();
  }, [contentFade]); // Add dependency

  // Handle case where there's no background image URI provided
  if (!backgroundImageUri) {
    return (
      <View style={[styles.container, { backgroundColor: '#FFDAB9' }]}> {/* Provide a fallback background */}
        <TouchableOpacity style={[styles.backToMenuButton, { backgroundColor: 'rgba(0,0,0,0.3)'}]} onPress={goToHome}>
           <Ionicons name="home" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.content}>
           <Text style={[styles.animalName, { fontSize: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 15, color: '#fff' }]}>
             Background image not available for this level.
           </Text>
        </View>
      </View>
    );
  }

  // Background URI exists, render the background and handle loading
  return (
    <ImageBackground
      source={{ uri: backgroundImageUri }}
      style={styles.container} // Ensure this has flex: 1
      imageStyle={styles.backgroundImageStyle}
      resizeMode="cover"
      fadeDuration={0} // Prevent default fade
      onLoadEnd={onLoadEnd} // Fade in content when loaded
      onError={onLoadEnd} // Also treat error as load end (shows content potentially over broken bg)
    >
      {/* 1) While it’s loading, show a spinner overlay */}
      {bgLoading && (
        <View style={loaderStyles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      {/* 2) Once loaded, fade in your game UI */}
      <Animated.View style={[{ flex: 1, opacity: contentFade }]}>
         {/* Keep the existing relative View structure inside for positioning */}
         <View style={{ flex: 1, position: 'relative' }}>
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
                    {/* Animal image/sprite fades in/out */}
                    <Animated.View style={{ opacity: animalFadeAnim }}>
                      {renderAnimal()}
                    </Animated.View>
                  </TouchableOpacity>

                  {/* Conditionally render and animate the animal name */}
                  {showName && currentAnimal && (
                    <Animated.View style={[
                      styles.animalNameWrapper,
                      {
                        opacity: animalFadeAnim, // Apply fade animation
                        transform: [{
                          translateY: animalFadeAnim.interpolate({ // Apply slide-up animation
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

                {/* Navigation Buttons */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 100 }}>
                  <TouchableOpacity
                    style={styles.navButton}
                    onPress={handlePrev}
                    activeOpacity={0.7}
                    disabled={isTransitioning || currentAnimalIndex === 0}
                  >
                    <Animated.View style={{ transform: [{ translateX: -5 }] }}>
                      <Ionicons
                        name="chevron-back"
                        size={24}
                        color={isTransitioning || currentAnimalIndex === 0 ? '#aaa' : '#fff'}
                      />
                    </Animated.View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.navButton}
                    onPress={handleNext}
                    activeOpacity={0.7}
                    disabled={isTransitioning}
                  >
                    <Animated.View style={{ transform: [{ translateX: 5 }] }}>
                      <Ionicons
                        name="chevron-forward"
                        size={24}
                        color={isTransitioning ? '#aaa' : '#fff'}
                      />
                    </Animated.View>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Instruction Bubble */}
            {hasAnimals && !showName && !isTransitioning && (
              <InstructionBubble
                text="Tap the animal to hear its sound!"
                arrowAnim={arrowAnim}
                image={require('../../../assets/images/tap.png')}
              />
            )}

            {/* No Animals Message */}
            {!hasAnimals && (
              <View style={styles.content}>
                <Text style={[styles.animalName, { fontSize: 24, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10 }]}>
                  No animals available for this level yet
                </Text>
              </View>
            )}

            {/* Congratulations Modal */}
            <Modal
              visible={showCongratsModal}
              transparent={true}
              animationType="fade"
              onRequestClose={() => { /* Prevent accidental close */ }}
            >
              <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)'
              }}>
                {/* Modal Content */}
                <View style={{
                  backgroundColor: 'white',
                  padding: 20,
                  borderRadius: 10,
                  alignItems: 'center',
                  elevation: 5,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  overflow: 'hidden',
                  width: '80%',
                }}>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 15 }}>
                    Congratulations!
                  </Text>

                  {/* Confetti Container */}
                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
                    {confettiAnimRefs.current.map((animValue, index) => {
                      const randomX = Math.random() * 300 - 150;
                      const randomSize = 5 + Math.random() * 10;
                      const randomColor = [
                        '#FF4500', '#FFD700', '#00BFFF', '#FF69B4', '#32CD32',
                        '#9370DB', '#FF6347', '#4682B4', '#FFA500', '#8A2BE2'
                      ][Math.floor(Math.random() * 10)];

                      const translateY = animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-50, 300],
                      });

                      const translateX = animValue.interpolate({
                        inputRange: [0, 0.3, 0.6, 1],
                        outputRange: [0, randomX * 0.3, randomX * 0.6, randomX],
                      });

                      const rotate = animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', `${Math.random() * 720 - 360}deg`],
                      });

                      const opacity = animValue.interpolate({
                        inputRange: [0, 0.7, 1],
                        outputRange: [1, 1, 0],
                      });

                      return (
                        <Animated.View
                          key={index}
                          style={{
                            position: 'absolute',
                            left: '50%',
                            top: 0,
                            width: randomSize,
                            height: randomSize,
                            backgroundColor: randomColor,
                            borderRadius: randomSize / 2,
                            transform: [
                              { translateX },
                              { translateY },
                              { rotate }
                            ],
                            opacity,
                          }}
                        />
                      );
                    })}
                  </View>

                  <Image source={require('../../../assets/images/congrats.png')} style={{ width: 100, height: 100, marginBottom: 20, zIndex: 1 }} />

                  <Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 25, zIndex: 1 }}>
                    You've seen all the animals in this level!
                  </Text>

                  {/* Modal Buttons */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', zIndex: 1 }}>
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#4CAF50',
                        paddingVertical: 12,
                        paddingHorizontal: 25,
                        borderRadius: 5,
                      }}
                      onPress={startOver}
                    >
                      <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Start Over</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#FF9800',
                        paddingVertical: 12,
                        paddingHorizontal: 25,
                        borderRadius: 5,
                      }}
                      onPress={goToHome}
                    >
                      <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Menu</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
         </View>
      </Animated.View>
    </ImageBackground>
  );
}

// Define the new loaderStyles for the overlay
const loaderStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,  // cover the whole background
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',  // slightly dim the background
    zIndex: 10, // Ensure loader is on top
  },
});
