import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Image, ImageBackground, Animated, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
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

export default function LevelScreenTemplate({ levelName, animals, backgroundImageUri, onBackToMenu }: Props) {
  const [currentAnimalIndex, setCurrentAnimalIndex] = useState(0);
  const [showName, setShowName] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showInstruction, setShowInstruction] = useState(true);
  const [bgFadeAnim] = useState(new Animated.Value(0));
  const arrowAnim = useRef(new Animated.Value(0)).current;
  const animalFadeAnim = useRef(new Animated.Value(1)).current;
  const animalMoveAnim = useRef(new Animated.Value(0)).current;
  const soundRef = useRef<Audio.Sound | null>(null);
  const isSoundPlayingRef = useRef<boolean>(false);
  const router = useRouter();
  const [showCongratsModal, setShowCongratsModal] = useState(false);
  const [visitedAnimals, setVisitedAnimals] = useState<Set<number>>(new Set([0]));
  const [levelCompleted, setLevelCompleted] = useState(false);

  const currentAnimal = useMemo(() => animals.length > 0 ? animals[currentAnimalIndex] : null, [animals, currentAnimalIndex]);
  const hasAnimals = animals.length > 0;

  useEffect(() => {
    // Initialize audio
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    }).catch(error => console.warn('Error setting audio mode:', error));

    Animated.timing(bgFadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (!hasAnimals) return;
    
    animalFadeAnim.setValue(0);
    animalMoveAnim.setValue(0);
    Animated.timing(animalFadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [currentAnimalIndex, hasAnimals]);

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
  }, []);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(error => 
          console.warn('Error unloading sound on cleanup:', error)
        );
      }
    };
  }, []);

  const stopSound = useCallback(async () => {
    if (soundRef.current) {
      try {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          await soundRef.current.stopAsync();
        }
        isSoundPlayingRef.current = false;
      } catch (error) {
        console.warn('Error stopping sound:', error);
      }
    }
  }, []);

  const playSounds = useCallback(async () => {
    if (isMuted || !currentAnimal?.sound || isSoundPlayingRef.current) return;

    try {
      // Stop any currently playing sound
      await stopSound();
      
      // Unload previous sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Set flag that sound is playing
      isSoundPlayingRef.current = true;

      // Play animal sound
      const { sound: animalSound } = await Audio.Sound.createAsync(
        currentAnimal.sound,
        { shouldPlay: true }
      );
      soundRef.current = animalSound;
      
      // Set up completion listener for animal sound
      animalSound.setOnPlaybackStatusUpdate(async (status) => {
        if ('isLoaded' in status && status.isLoaded && status.didJustFinish && !isMuted && currentAnimal?.labelSound) {
          await animalSound.unloadAsync();
          soundRef.current = null;
          
          // Play label sound after animal sound finishes
          const { sound: labelSound } = await Audio.Sound.createAsync(
            currentAnimal.labelSound,
            { shouldPlay: true }
          );
          soundRef.current = labelSound;
          
          // Set up completion listener for label sound
          labelSound.setOnPlaybackStatusUpdate((labelStatus) => {
            if ('isLoaded' in labelStatus && labelStatus.isLoaded && labelStatus.didJustFinish) {
              isSoundPlayingRef.current = false;
            }
          });
        } else if ('isLoaded' in status && status.isLoaded && status.didJustFinish && (!currentAnimal?.labelSound || isMuted)) {
          isSoundPlayingRef.current = false;
        }
      });
    } catch (error) {
      console.warn('Error playing sounds:', error);
      isSoundPlayingRef.current = false;
    }
  }, [currentAnimal, isMuted, stopSound]);

  const toggleShowName = useCallback(() => {
    setShowName(prev => !prev);
    playSounds();
    
    // Animate the animal with a small bounce effect
    Animated.sequence([
      Animated.timing(animalMoveAnim, {
        toValue: -10, // Move up slightly
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(animalMoveAnim, {
        toValue: 0, // Return to original position
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [playSounds]);

  const handleNext = useCallback(() => {
    if (!hasAnimals) return;
    stopSound();
    let x = currentAnimalIndex + 1;
    console.log('x', x);
    setCurrentAnimalIndex(x);
    setShowName(false);
  }, [animals.length, stopSound, hasAnimals, currentAnimalIndex]);
  
  useEffect(() => {
    console.log(`${currentAnimalIndex} === ${animals.length} ${levelCompleted}`);
    // Check if we've seen all animals and this is the last one
    if (currentAnimalIndex === animals.length && !levelCompleted) {
      setLevelCompleted(true);
      setShowCongratsModal(true);
    }
  }, [currentAnimalIndex, animals.length, levelCompleted]);

  const handlePrev = useCallback(() => {
    if (!hasAnimals) return;
    stopSound();
    const prevIndex = (currentAnimalIndex - 1 + animals.length) % animals.length;
    setCurrentAnimalIndex(prevIndex);
    setShowName(false);
    
    // Add the new animal index to visited animals
    const newVisitedAnimals = new Set(visitedAnimals);
    newVisitedAnimals.add(prevIndex);
    setVisitedAnimals(newVisitedAnimals);
  }, [animals.length, stopSound, hasAnimals, currentAnimalIndex, visitedAnimals]);

  const goToHome = useCallback(() => {
    stopSound();
    onBackToMenu();
  }, [stopSound, onBackToMenu]);

  const toggleMute = () => {
    setIsMuted(prev => !prev);
    if (!isMuted && soundRef.current) {
      stopSound().catch(error => console.warn('Error stopping sound on mute:', error));
    }
  };

  const startOver = useCallback(() => {
    setShowCongratsModal(false);
    stopSound();
    setCurrentAnimalIndex(0);
    setShowName(false);
    setLevelCompleted(false);
    setVisitedAnimals(new Set([0]));
  }, [stopSound]);

  const renderAnimal = () => {
    if (!currentAnimal) return null;
    
    if (currentAnimal.type === 'sprite' && currentAnimal.frames) {
      if (!currentAnimal.spriteSheetSize) return null;
      return (
        <SpriteAnimation
          frames={currentAnimal.frames}
          source={currentAnimal.source}
          spriteSheetSize={currentAnimal.spriteSheetSize}
        />
      );
    }
    return (
      <Image
        source={currentAnimal.source}
        style={styles.animalImage}
        fadeDuration={0}
        progressiveRenderingEnabled={true}
      />
    );
  };

  if (!backgroundImageUri) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFDAB9' }}>
        <Text>Loading Level...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={{ flex: 1, opacity: bgFadeAnim }}>
      <ImageBackground
        source={{ uri: backgroundImageUri! }}
        style={styles.container}
        imageStyle={styles.backgroundImageStyle}
        resizeMode="cover"
        fadeDuration={0}
        onLoadEnd={() => {
          Animated.timing(bgFadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }}
      >
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
                <TouchableOpacity onPress={toggleShowName} activeOpacity={0.8}>
                  <Animated.View style={{ 
                    opacity: animalFadeAnim,
                    transform: [{ translateY: animalMoveAnim }]
                  }}>
                    {renderAnimal()}
                  </Animated.View>
                </TouchableOpacity>
                {showName && currentAnimal && (
                  <Text style={styles.animalName} numberOfLines={1}>
                    {currentAnimal.name}
                  </Text>
                )}
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 100 }}>
                <TouchableOpacity style={styles.navButton} onPress={handlePrev} activeOpacity={0.7}>
                  <Animated.View style={{ transform: [{ translateX: -5 }] }}>
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                  </Animated.View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navButton} onPress={handleNext} activeOpacity={0.7}>
                  <Animated.View style={{ transform: [{ translateX: 5 }] }}>
                    <Ionicons name="chevron-forward" size={24} color="#fff" />
                  </Animated.View>
                </TouchableOpacity>
              </View>
            </View>
          )}
{hasAnimals && !showName && (
            <InstructionBubble
              text="Tap the animal to hear its sound!"
              arrowAnim={arrowAnim}
              image={require('../../../assets/images/tap.png')}
            />
          )}
          
          {!hasAnimals && (
            <View style={styles.content}>
              <Text style={[styles.animalName, { fontSize: 24, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10 }]}>
                No animals available for this level yet
              </Text>
            </View>
          )}
          
          <Modal
            visible={showCongratsModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowCongratsModal(false)}
          >
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)'
            }}>
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
              }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 15 }}>
                  Congratulations!
                </Text>
                {/* Confetti animation */}
                {Array.from({ length: 30 }).map((_, index) => {
                  const randomX = Math.random() * 300 - 150;
                  const randomDuration = 2000 + Math.random() * 3000;
                  const randomDelay = Math.random() * 500;
                  const randomSize = 5 + Math.random() * 10;
                  const randomColor = [
                    '#FF4500', '#FFD700', '#00BFFF', '#FF69B4', '#32CD32',
                    '#9370DB', '#FF6347', '#4682B4', '#FFA500', '#8A2BE2'
                  ][Math.floor(Math.random() * 10)];
                  
                  // Create animated values outside of render
                  // This fixes the "Rendered more hooks than during the previous render" error
                  // by not using useEffect inside the map function
                  const translateY = (animatedValue: Animated.Value) => {
                    return animatedValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-50, 200],
                    });
                  };
                  
                  const translateX = (animatedValue: Animated.Value) => {
                    return animatedValue.interpolate({
                      inputRange: [0, 0.3, 0.6, 1],
                      outputRange: [0, randomX * 0.3, randomX * 0.6, randomX],
                    });
                  };
                  
                  const rotate = (animatedValue: Animated.Value) => {
                    return animatedValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', `${Math.random() * 360}deg`],
                    });
                  };
                  
                  const opacity = (animatedValue: Animated.Value) => {
                    return animatedValue.interpolate({
                      inputRange: [0, 0.7, 1],
                      outputRange: [1, 0.7, 0],
                    });
                  };
                  
                  // Use a ref instead of creating a new animated value each render
                  const animatedValueRef = useRef(new Animated.Value(0));
                  
                  // Start animation when the modal is shown
                  useEffect(() => {
                    if (showCongratsModal) {
                      Animated.timing(animatedValueRef.current, {
                        toValue: 1,
                        duration: randomDuration,
                        delay: randomDelay,
                        useNativeDriver: true,
                      }).start();
                    }
                  }, [showCongratsModal]);
                  
                  return (
                    <Animated.View
                      key={index}
                      style={{
                        position: 'absolute',
                        width: randomSize,
                        height: randomSize,
                        backgroundColor: randomColor,
                        borderRadius: randomSize / 2,
                        transform: [
                          {
                            translateY: translateY(animatedValueRef.current)
                          },
                          {
                            translateX: translateX(animatedValueRef.current)
                          },
                          {
                            rotate: rotate(animatedValueRef.current)
                          }
                        ],
                        opacity: opacity(animatedValueRef.current),
                      }}
                    />
                  );
                })}
                <Image source={require('../../../assets/images/congrats.png')} style={{ width: 100, height: 100, marginBottom: 5 }} />
                <View style={{ height: 5, width: '100%', position: 'relative', marginBottom: 5 }}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Animated.View
                      key={index}
                      style={{
                        position: 'absolute',
                        left: `${20 * index}%`,
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: ['#FF4500', '#FFD700', '#00BFFF', '#FF69B4', '#32CD32'][index % 5],
                        transform: [
                          { translateY: new Animated.Value(-30) },
                          { scale: new Animated.Value(0) }
                        ]
                      }}
                    />
                  ))}
                </View>
                <Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 15 }}>
                  You've seen all the animals in this level!
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#4CAF50',
                      paddingVertical: 10,
                      paddingHorizontal: 20,
                      borderRadius: 5,
                      marginRight: 10,
                    }}
                    onPress={startOver}
                  >
                    <Text style={{ color: 'white', fontSize: 16 }}>Start Over</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#FF9800',
                      paddingVertical: 10,
                      paddingHorizontal: 20,
                      borderRadius: 5,
                    }}
                    onPress={goToHome}
                  >
                    <Text style={{ color: 'white', fontSize: 16 }}>Return to Menu</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </ImageBackground>
    </Animated.View>
  );
}
