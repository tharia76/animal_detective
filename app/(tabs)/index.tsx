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


// Load the actual PNG sprite sheet
const catSpriteSheet = require('../../assets/images/animals/png/cat-0.png');  
const chickenSpriteSheet = require('../../assets/images/animals/png/chicken-0.png');
const dogSpriteSheet = require('../../assets/images/animals/png/dog-0.png');
const donkeySpriteSheet = require('../../assets/images/animals/png/donkey-0.png');
const cowSpriteSheet = require('../../assets/images/animals/png/cow-0.png');
const chickSpriteSheet = require('../../assets/images/animals/png/chick-0.png');

// Extract the frames array and meta from JSON
const { frames: catFrames, meta: catMeta } = catData;
const { frames: chickenFrames, meta: chickenMeta } = chickenData;
const { frames: dogFrames, meta: dogMeta } = dogData;
const { frames: donkeyFrames, meta: donkeyMeta } = donkeyData;
const { frames: cowFrames, meta: cowMeta } = cowData;
const { frames: chickFrames, meta: chickMeta } = chickData;

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
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 40,
    marginTop: 40,

  },
  navButton: {
    backgroundColor: 'green',
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
  },
  buttonText: {
    fontFamily: 'ComicNeue',
    color: '#fff',
    fontWeight: 'bold',
    marginHorizontal: 5,
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
  const intervalRef = useRef<NodeJS.Timer | null>(null);

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
      navigation.setOptions({ tabBarStyle: { backgroundColor: 'green' } });
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
  
    if (isMuted || !currentAnimal.sound) return;
  
    const playSounds = async () => {
      try {
        // 1. Проигрываем звук животного
        const { sound: animalSound } = await Audio.Sound.createAsync(currentAnimal.sound);
        await animalSound.playAsync();
  
        // 2. Через 1 секунду — озвучка названия
        setTimeout(async () => {
          if (currentAnimal.labelSound) {
            const { sound: labelSound } = await Audio.Sound.createAsync(currentAnimal.labelSound);
            await labelSound.playAsync();
          }
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
  return showSplash ? (
    // Splash screen with title animation
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
  ) : (
    // Main app content
    <Animated.View style={{ flex: 1, opacity: bgFadeAnim }}>
      <ImageBackground
        source={backgroundUri ? { uri: backgroundUri } : backgroundImage}
        style={styles.container}
        imageStyle={styles.backgroundImageStyle}
        resizeMode="cover"
        fadeDuration={0}
      >
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

          <View style={styles.navigationContainer}>
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
      </ImageBackground>
    </Animated.View>
  );
}
