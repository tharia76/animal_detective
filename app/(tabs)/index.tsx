import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, ImageBackground, TouchableOpacity, Animated, ActivityIndicator, ImageSourcePropType, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Asset } from 'expo-asset';
import { Audio } from 'expo-av';
import { useNavigation } from '@react-navigation/native';

// Get dimensions only once at module level
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Pre-load and memoize background image
const backgroundImage = require('../../assets/images/farm.jpg');

// Preload background image at app startup - force immediate loading
Asset.fromModule(backgroundImage).downloadAsync().catch(error => 
  console.warn('Background image preload error:', error)
);

// Load the cow animation JSON data
import catData from '../../assets/images/animals/json/cat-0.json';
import chickenData from '../../assets/images/animals/json/chicken-0.json';
import dogData from '../../assets/images/animals/json/dog-0.json';
import donkeyData from '../../assets/images/animals/json/donkey-0.json';
import cowData from '../../assets/images/animals/json/cow-0.json';
import chickData from '../../assets/images/animals/json/chick-0.json';
import duckData from '../../assets/images/animals/json/duck-0.json';
import goatData from '../../assets/images/animals/json/goat-0.json';
import gooseData from '../../assets/images/animals/json/goose-0.json';
import horseData from '../../assets/images/animals/json/horse-0.json';
import llamaData from '../../assets/images/animals/json/llama-0.json';
import pigData from '../../assets/images/animals/json/pig-0.json';
import rabbitData from '../../assets/images/animals/json/rabbit-0.json';
import roosterData from '../../assets/images/animals/json/rooster-0.json';
import sheepData from '../../assets/images/animals/json/sheep-0.json';
import turkeyData from '../../assets/images/animals/json/turkey-0.json';


// Load the actual PNG sprite sheet
const catSpriteSheet = require('../../assets/images/animals/png/cat-0.png');  
const chickenSpriteSheet = require('../../assets/images/animals/png/chicken-0.png');
const dogSpriteSheet = require('../../assets/images/animals/png/dog-0.png');
const donkeySpriteSheet = require('../../assets/images/animals/png/donkey-0.png');
const cowSpriteSheet = require('../../assets/images/animals/png/cow-0.png');
const chickSpriteSheet = require('../../assets/images/animals/png/chick-0.png');
const duckSpriteSheet = require('../../assets/images/animals/png/duck-0.png');
const goatSpriteSheet = require('../../assets/images/animals/png/goat-0.png');
const gooseSpriteSheet = require('../../assets/images/animals/png/goose-0.png');
const horseSpriteSheet = require('../../assets/images/animals/png/horse-0.png');
const llamaSpriteSheet = require('../../assets/images/animals/png/llama-0.png');
const pigSpriteSheet = require('../../assets/images/animals/png/pig-0.png');
const rabbitSpriteSheet = require('../../assets/images/animals/png/rabbit-0.png');
const roosterSpriteSheet = require('../../assets/images/animals/png/rooster-0.png');
const sheepSpriteSheet = require('../../assets/images/animals/png/sheep-0.png');
const turkeySpriteSheet = require('../../assets/images/animals/png/turkey-0.png');

// Extract the frames array and meta from JSON
const { frames: catFrames, meta: catMeta } = catData;
const { frames: chickenFrames, meta: chickenMeta } = chickenData;
const { frames: dogFrames, meta: dogMeta } = dogData;
const { frames: donkeyFrames, meta: donkeyMeta } = donkeyData;
const { frames: cowFrames, meta: cowMeta } = cowData;
const { frames: chickFrames, meta: chickMeta } = chickData;
const { frames: duckFrames, meta: duckMeta } = duckData;
const { frames: goatFrames, meta: goatMeta } = goatData;
const { frames: gooseFrames, meta: gooseMeta } = gooseData;
const { frames: horseFrames, meta: horseMeta } = horseData;
const { frames: llamaFrames, meta: llamaMeta } = llamaData;
const { frames: pigFrames, meta: pigMeta } = pigData;
const { frames: rabbitFrames, meta: rabbitMeta } = rabbitData;
const { frames: roosterFrames, meta: roosterMeta } = roosterData;
const { frames: sheepFrames, meta: sheepMeta } = sheepData;
const { frames: turkeyFrames, meta: turkeyMeta } = turkeyData;

// Pre-define animals array at module level to avoid re-creation
const animals = [
  {
    id: 1,
    name: 'Cat',
    type: 'sprite',
    source: catSpriteSheet,
    frames: catFrames,
    spriteSheetSize: catMeta.size,
    sound: require('../../assets/sounds/cat.mp3'),
    labelSound: require('../../assets/sounds/labels/cat.wav')
  },
  {
    id: 2,
    name: 'Dog',
    type: 'sprite',
    source: dogSpriteSheet,
    frames: dogFrames,
    spriteSheetSize: dogMeta.size,
    sound: require('../../assets/sounds/dog.mp3'),
    labelSound: require('../../assets/sounds/labels/dog.wav')
  },
  {
    id: 3,
    name: 'Chicken',
    type: 'sprite',
    source: chickenSpriteSheet,
    frames: chickenFrames,
    spriteSheetSize: chickenMeta.size,
    sound: require('../../assets/sounds/chicken.mp3'),
    labelSound: require('../../assets/sounds/labels/chicken.wav')
  },
  {
    id: 4,
    name: 'Chick',
    type: 'sprite',
    source: chickSpriteSheet,
    frames: chickFrames,
    spriteSheetSize: chickMeta.size,
    sound: require('../../assets/sounds/chick.mp3'),
    labelSound: require('../../assets/sounds/labels/chick.wav')
  },
  {
    id: 5,
    name: 'Donkey',
    type: 'sprite',
    source: donkeySpriteSheet,
    frames: donkeyFrames,
    spriteSheetSize: donkeyMeta.size,
    sound: require('../../assets/sounds/donkey.mp3'),
    labelSound: require('../../assets/sounds/labels/donkey.wav')
  },
  {
    id: 6,
    name: 'Cow',
    type: 'sprite',
    source: cowSpriteSheet,
    frames: cowFrames,
    spriteSheetSize: cowMeta.size,
    sound: require('../../assets/sounds/cow.mp3'),
    labelSound: require('../../assets/sounds/labels/cow.wav')
  },
  {
    id: 7,
    name: 'Duck',
    type: 'sprite',
    source: duckSpriteSheet,
    frames: duckFrames,
    spriteSheetSize: duckMeta.size,
    sound: require('../../assets/sounds/duck.mp3'),
    labelSound: require('../../assets/sounds/labels/duck.wav')
  },  
  {
    id: 8,
    name: 'Goat',
    type: 'sprite',
    source: goatSpriteSheet,
    frames: goatFrames,
    spriteSheetSize: goatMeta.size,
    sound: require('../../assets/sounds/goat.mp3'),
    labelSound: require('../../assets/sounds/labels/goat.wav')
  },
  {
    id: 9,
    name: 'Goose',
    type: 'sprite',
    source: gooseSpriteSheet,
    frames: gooseFrames,
    spriteSheetSize: gooseMeta.size,
    sound: require('../../assets/sounds/goose.mp3'),
    labelSound: require('../../assets/sounds/labels/goose.wav')
  },
  {
    id: 10,
    name: 'Horse',
    type: 'sprite',
    source: horseSpriteSheet,
    frames: horseFrames,
    spriteSheetSize: horseMeta.size,
    sound: require('../../assets/sounds/horse.mp3'),
    labelSound: require('../../assets/sounds/labels/horse.wav')
  },
  {
    id: 11,
    name: 'Llama',
    type: 'sprite',
    source: llamaSpriteSheet,
    frames: llamaFrames,
    spriteSheetSize: llamaMeta.size,
    sound: require('../../assets/sounds/llama.mp3'),
    labelSound: require('../../assets/sounds/labels/llama.wav')
  },
  {
    id: 12,
    name: 'Pig',
    type: 'sprite',
    source: pigSpriteSheet,
    frames: pigFrames,
    spriteSheetSize: pigMeta.size,
    sound: require('../../assets/sounds/pig.mp3'),
    labelSound: require('../../assets/sounds/labels/pig.wav')
  },
  {
    id: 13,
    name: 'Rabbit',
    type: 'sprite',
    source: rabbitSpriteSheet,
    frames: rabbitFrames,
    spriteSheetSize: rabbitMeta.size,
    sound: require('../../assets/sounds/rabbit.mp3'),
    labelSound: require('../../assets/sounds/labels/rabbit.wav')
  },
  {
    id: 14,
    name: 'Sheep',
    type: 'sprite',
    source: sheepSpriteSheet,
    frames: sheepFrames,
    spriteSheetSize: sheepMeta.size,
    sound: require('../../assets/sounds/sheep.mp3'),
    labelSound: require('../../assets/sounds/labels/sheep.wav')
  },  
  {
    id: 15,
    name: 'Rooster',
    type: 'sprite',
    source: roosterSpriteSheet,
    frames: roosterFrames,
    spriteSheetSize: roosterMeta.size,
    sound: require('../../assets/sounds/rooster.mp3'),
    labelSound: require('../../assets/sounds/labels/rooster.wav')
  },
  {
    id: 16,
    name: 'Turkey',
    type: 'sprite',
    source: turkeySpriteSheet,
    frames: turkeyFrames,
    spriteSheetSize: turkeyMeta.size,
    sound: require('../../assets/sounds/turkey.mp3'),
    labelSound: require('../../assets/sounds/labels/turkey.wav')
  }
];

// Preload all animal images regardless of type
animals.forEach(animal => {
  Asset.fromModule(animal.source).downloadAsync();
});

// Define styles outside component at module level
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFDAB9', // Peachy background color
  },
  content: {
    flex: 1,
    marginTop: 150,
    justifyContent: 'center',
    paddingBottom: 5,
  },
  animalCard: {
    alignItems: 'center',
    justifyContent: 'center',
    height: screenHeight * 0.25,
  },
  animalName: {
    fontFamily: 'ComicNeue',
    fontSize: 24,
    marginTop: 10,
    fontWeight: '500',
    backgroundColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20, 
    overflow: 'hidden',
    textAlign: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    opacity: 0.8,
  },
  navButton: {
    backgroundColor: 'green',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    width: 100,
    height: 60,
  },
  buttonText: {
    fontFamily: 'ComicNeue',
    color: '#fff',
    fontWeight: 'bold',
    marginHorizontal: 5,
    marginTop: 40,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
    height: 20,
    width: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFDAB9', // Peachy background color for loading screen
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#333',
  },
  animalLoadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: screenWidth * 0.5,
    height: screenHeight * 0.25,
  },
  backgroundImageStyle: {
    flex: 1,
    backgroundColor: '#FFDAB9', // Peachy background color for image background
  },
  soundButton: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: 'rgba(220, 173, 30, 0.7)',
    borderRadius: 25,
    padding: 10,
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  frameWindow: {
    overflow: 'hidden',
  },
  spriteImage: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  animalImage: {
    width: screenWidth * 0.5,
    height: screenHeight * 0.25,
    resizeMode: 'contain',
  },
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFDAB9',
  },
  menuTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: 'ComicNeue',
  },
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
  levelButton: {
    padding: 30,
    margin: 10,
    borderRadius: 15,
    width: screenWidth * 0.35,
    height: screenWidth * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    overflow: 'hidden', // Ensure the background image stays within bounds
  },
  levelButtonBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 15,
    resizeMode: 'cover',
  },
  levelText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'ComicNeue',
    textAlign: 'center',
    backgroundColor: 'green',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 5
  },
  backToMenuButton: {
    backgroundColor: 'orange',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  instructionBubble: {
    position: 'absolute',
    top: 200,
    left: 20,
    right: 20,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 20,
    // Speech bubble tail
    borderBottomLeftRadius: 0,
    // Add a pseudo-element effect with additional styling
    marginBottom: 15, // Space for the "tail"
    // The bubble shape
    transform: [{ perspective: 1000 }],
  },
  instructionText: {
    fontFamily: 'ComicNeue',
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
  },
});

// Pre-create animation configurations
const createAnimationSequence = (animValue: Animated.Value | Animated.ValueXY, toValue: number) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animValue, {
        toValue,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(animValue, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ])
  );
};

// Sprite animation component
function SpriteAnimation({
  frames,
  source,
  spriteSheetSize,
  style
}: {
  frames: Array<{
    filename: string;
    frame: { x: number; y: number; w: number; h: number };
    rotated: boolean;
    trimmed: boolean;
    spriteSourceSize: { x: number; y: number; w: number; h: number };
    sourceSize: { w: number; h: number };
  }>,
  source: ImageSourcePropType,
  spriteSheetSize: { w: number; h: number },
  style?: StyleProp<ViewStyle>
}) {
  const [frameIndex, setFrameIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setFrameIndex(0); // reset index on frames change
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const frameCount = frames.length;
    intervalRef.current = setInterval(() => {
      setFrameIndex(prev => (prev + 1) % frameCount);
    }, 87);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [frames]);

  const currentFrame = frames[frameIndex];
  if (!currentFrame) return null; // just in case, avoid crashing

  const { x, y } = currentFrame.frame;
  const { w, h } = currentFrame.sourceSize;

  return (
    <View style={[{ width: w, height: h, overflow: 'hidden' }, style]}>
      <Image
        source={source}
        style={{
          position: 'absolute',
          width: spriteSheetSize.w,
          height: spriteSheetSize.h,
          marginLeft: -x,
          marginTop: -y,
        }}
        resizeMode="cover"
      />
    </View>
  );
}

export default function HomeScreen() {
  const [currentAnimalIndex, setCurrentAnimalIndex] = useState(0);
  const [showName, setShowName] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackgroundLoaded, setIsBackgroundLoaded] = useState(false); // start as false
  const [backgroundUri, setBackgroundUri] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true); // New state for splash screen
  const [isMuted, setIsMuted] = useState(false); // New state for sound muting
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [showInstruction, setShowInstruction] = useState(true);
  
  // Get navigation to hide bottom tab bar
  const navigation = useNavigation();
  
  // Sound reference
  const soundRef = useRef<Audio.Sound | null>(null);
  
  // Memoize current animal to prevent unnecessary recalculations
  const currentAnimal = useMemo(() => animals[currentAnimalIndex], [currentAnimalIndex]);
  
  // Create animation values only once with useRef
  const leftChevronAnim = useRef(new Animated.Value(0)).current;
  const rightChevronAnim = useRef(new Animated.Value(0)).current;
  const animalFadeAnim = useRef(new Animated.Value(1)).current;
  const bgFadeAnim = useRef(new Animated.Value(0)).current;
  const arrowAnim = useRef(new Animated.Value(0)).current;
  
  // Load font with caching
  const [fontsLoaded] = useFonts({
    'ComicNeue': require('../../assets/fonts/custom.ttf'),
    'TitleFont': require('../../assets/fonts/orange.ttf'),
  });
  
  // Preload and track background asset
  useEffect(() => {
    const loadAssets = async () => {
      try {
        const asset = Asset.fromModule(backgroundImage);
        await asset.downloadAsync();
        setBackgroundUri(asset.localUri || asset.uri);
        setIsBackgroundLoaded(true);
      } catch (error) {
        console.warn('Failed to load background:', error);
        setBackgroundUri(null);
        setIsBackgroundLoaded(true); // fail gracefully
      }
    };

    loadAssets();
  }, []);
  
  // Fade in background when loaded
  useEffect(() => {
    if (isBackgroundLoaded) {
      Animated.timing(bgFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isBackgroundLoaded]);
  
  // Hide bottom tab bar when splash screen is showing
  useEffect(() => {
    if (showSplash) {
      navigation.setOptions({ tabBarStyle: { display: 'none' } });
    } else {
      navigation.setOptions({ tabBarStyle: { display: 'none' } });
    }
  }, [showSplash, navigation]);
  
  // Wait for both timer and background image to complete
  useEffect(() => {
    let splashTimer: NodeJS.Timeout;
    let fallbackTimer: NodeJS.Timeout;

    splashTimer = setTimeout(() => {
      if (isBackgroundLoaded) {
        setShowSplash(false);
        setIsLoading(false);
      }
    }, 8000);

    fallbackTimer = setTimeout(() => {
      setShowSplash(false);
      setIsLoading(false);
    }, 10000); // force quit splash after 10 seconds

    return () => {
      clearTimeout(splashTimer);
      clearTimeout(fallbackTimer);
    };
  }, [isBackgroundLoaded]);
  
  // Auto-hide instruction after 5 seconds if still showing
  useEffect(() => {
    if (!showInstruction) return;

    const timer = setTimeout(() => {
      setShowInstruction(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [showInstruction]);
  
  // Fade animation when animal changes
  useEffect(() => {
    // Run fade animation on every animal switch
    animalFadeAnim.setValue(0);
    Animated.timing(animalFadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [currentAnimalIndex]);
  
  // Optimize animations by only starting them once
  useEffect(() => {
    // Create animation sequences
    const leftSequence = createAnimationSequence(leftChevronAnim, -5);
    const rightSequence = createAnimationSequence(rightChevronAnim, 5);
    
    // Start animations
    leftSequence.start();
    rightSequence.start();
    
    // Clean up animations on unmount
    return () => {
      leftSequence.stop();
      rightSequence.stop();
    };
  }, []);
  
  // Animate the instruction arrow
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
  
  // Cleanup sound when component unmounts
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);
  
  // Play animal sound
  const playAnimalSound = async () => {
    if (isMuted || !currentAnimal.sound) return;
  
    try {
      // Unload previous sound if exists
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded && status.isPlaying) return; // Don't play again if already playing
        await soundRef.current.unloadAsync();
      }
  
      // Load and play new sound
      const { sound } = await Audio.Sound.createAsync(currentAnimal.sound);
      soundRef.current = sound;
      await sound.playAsync();
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  };
  
  
  // Helper function to stop sound
  const stopSound = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
      } catch (error) {
        console.warn('Error stopping sound:', error);
      }
    }
  }, []);
  
  // Memoize handlers with useCallback instead of useRef
  const handleNextAnimal = useCallback(() => {
    stopSound(); // don't await
    setCurrentAnimalIndex((prev) => (prev + 1) % animals.length);
    setShowName(false);
  }, [stopSound]);

  const handlePrevAnimal = useCallback(() => {
    stopSound(); // don't await
    setCurrentAnimalIndex((prev) => (prev - 1 + animals.length) % animals.length);
    setShowName(false);
  }, [stopSound]);
  
  const toggleShowName = useCallback(() => {
    setShowName(prev => !prev);
    setShowInstruction(false); // Hide instruction bubble when animal is tapped
  
    if (isMuted || !currentAnimal.sound) return;
  
    const playSounds = async () => {
      try {
        // If an animal sound is already playing, don't play it again
        if (soundRef.current) {
          const status = await soundRef.current.getStatusAsync();
          if (status.isLoaded && status.isPlaying) return;
          await soundRef.current.unloadAsync();
        }
  
        const { sound: animalSound } = await Audio.Sound.createAsync(currentAnimal.sound);
        soundRef.current = animalSound;
        await animalSound.playAsync();
  
        // 2. After 1 second, play label sound
        setTimeout(async () => {
          if (isMuted || !currentAnimal.labelSound) return;
  
          // Unload the animal sound to avoid overlapping
          if (soundRef.current) {
            await soundRef.current.unloadAsync();
          }
  
          const { sound: labelSound } = await Audio.Sound.createAsync(currentAnimal.labelSound);
          soundRef.current = labelSound;
          await labelSound.playAsync();
        }, 1000);
      } catch (error) {
        console.warn('Error playing sound sequence:', error);
      }
    };
  
    playSounds();
  }, [currentAnimal, isMuted]);
  
  

  const toggleSound = useCallback(() => {
    setIsMuted(prev => !prev);
    // Stop any currently playing sound when muting
    if (!isMuted && soundRef.current) {
      soundRef.current.stopAsync().catch(error => 
        console.warn('Error stopping sound:', error)
      );
    }
  }, [isMuted]);

  // Create loading animation outside of conditional
  const titleAnim = useRef(new Animated.Value(0)).current;
  
  // Increase animation duration from 6000ms to 3500ms to better match the splash screen duration
  useEffect(() => {
    Animated.timing(titleAnim, {
      toValue: 1,
      duration: 5500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Back to menu handler
  const handleBackToMenu = useCallback(() => {
    stopSound();
    setSelectedLevel(null);
  }, [stopSound]);

  // Render animal content based on type
  const renderAnimalContent = () => {
    if (currentAnimal.type === 'sprite' && currentAnimal.frames) {
      return (
<SpriteAnimation 
  frames={currentAnimal.frames} 
  source={currentAnimal.source} 
  spriteSheetSize={currentAnimal.spriteSheetSize}
  style={{}}
/>
      );
    } else {
      return (
        <Image 
          source={currentAnimal.source} 
          style={styles.animalImage}
          fadeDuration={0}
          progressiveRenderingEnabled={true}
        />
      );
    }
  };

  // Render splash screen or main content
  if (showSplash) {
    // Splash screen with title animation
    return (
      <View style={styles.loadingContainer}>
        <Animated.View style={{ opacity: titleAnim, marginBottom: 50, alignItems: 'center' }}>
          {fontsLoaded ? (
            <Animated.Image 
              source={require('../../assets/images/catlogo.png')}
              style={{
                width: 450,
                height: 450,
                resizeMode: 'contain',
                transform: [{ 
                  translateY: titleAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [20, -10, 0]
                  }) 
                }]
              }}
            />
          ) : (
            <Animated.Text 
              style={[
                styles.loadingText, 
                { 
                  fontSize: 50,
                  fontFamily: 'TitleFont',
                  transform: [{ 
                    translateY: titleAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [20, -10, 0]
                    }) 
                  }] 
                }
              ]}
            >
              Loading...
            </Animated.Text>
          )}
        </Animated.View>
        <ActivityIndicator size="large" color="orange" />
      </View>
    );
  }

  if (!selectedLevel) {
    // Show level selection menu
    return (
      <ImageBackground
        source={require('../../assets/images/animal-detective.png')}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View style={[styles.menuContainer, { backgroundColor: 'transparent' }]}>
          <View style={{
            backgroundColor: 'rgba(255, 218, 185, 0.8)',
            padding: 20,
            borderRadius: 15,
            width: '90%',
            alignItems: 'center',
          }}>
            <Text style={styles.menuTitle}>Select a Level</Text>
            <View style={[styles.levelGrid, { flexDirection: 'row', justifyContent: 'space-between', width: '100%' }]}>
              {["Farm", "Wildlife", "Ocean"].map(level => (
                <View key={level} style={{ alignItems: 'center', flex: 1, marginHorizontal: 5 }}>
                  <TouchableOpacity
                    style={styles.levelButton}
                    onPress={() => level === "Farm" ? setSelectedLevel(level) : null}
                    disabled={level !== "Farm"}
                  >
                    <Image 
                      source={require('../../assets/images/farm.jpg')} 
                      style={styles.levelButtonBackground} 
                    />
                    {level !== "Farm" && (
                      <View style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 15,
                      }}>
                        <Ionicons 
                          name="lock-closed" 
                          size={40} 
                          color="gray"
                        />
                      </View>
                    )}
                    <View style={{ position: 'absolute', bottom: 1, width: '100%', alignItems: 'center' }}>
                      <Text style={styles.levelText}>{level}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ImageBackground>
    );
  }

  if (selectedLevel === "Farm") {
    // Main app content
    return (
      <Animated.View style={{ flex: 1, opacity: bgFadeAnim }}>
        <ImageBackground
          source={backgroundUri ? { uri: backgroundUri } : backgroundImage}
          style={styles.container}
          imageStyle={styles.backgroundImageStyle}
          resizeMode="cover"
          fadeDuration={0}
        >
          <View style={{ flex: 1, position: 'relative' }}>
            <TouchableOpacity style={styles.backToMenuButton} onPress={handleBackToMenu}>
              <Ionicons name="home" size={24} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.soundButton} onPress={toggleSound}>
              <Ionicons 
                name={isMuted ? "volume-mute" : "volume-high"} 
                size={38} 
                color="green" 
              />
            </TouchableOpacity>
            
            <View style={styles.content}>
              <View style={styles.animalCard}>
                <TouchableOpacity onPress={toggleShowName} activeOpacity={0.8}>
                  <Animated.View style={{ opacity: animalFadeAnim }}>
                    {renderAnimalContent()}
                  </Animated.View>
                </TouchableOpacity>
                {showName && (
                  <Text style={[styles.animalName, fontsLoaded ? {} : {fontFamily: undefined}]} numberOfLines={1}>{currentAnimal.name}</Text>
                )}
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 100 }}>
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={handlePrevAnimal}
                  activeOpacity={0.7}
                >
                  <Animated.View style={{ transform: [{ translateX: leftChevronAnim }] }}>
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                  </Animated.View>
                  <Text style={styles.buttonText}></Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.navButton}
                  onPress={handleNextAnimal}
                  activeOpacity={0.7}
                >
                  <Text style={styles.buttonText}></Text>
                  <Animated.View style={{ transform: [{ translateX: rightChevronAnim }] }}>
                    <Ionicons name="chevron-forward" size={24} color="#fff" />
                  </Animated.View>
                </TouchableOpacity>
              </View>
            </View>
            
            {showInstruction && (
              <View style={[styles.instructionBubble, { zIndex: 100 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={styles.instructionText}>
                    Tap the animal to hear its sound!
                  </Text>
                  <Animated.View
                    style={{
                      marginLeft: 10,
                      transform: [
                        {
                          translateY: arrowAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 10],
                          }),
                        },
                      ],
                    }}
                  >
                    <Ionicons
                      name="arrow-down"
                      size={24}
                      color="#333"
                    />
                  </Animated.View>
                </View>
              </View>
            )}
          </View>
        </ImageBackground>
      </Animated.View>
    );
  }
}
