import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, ImageBackground, TouchableOpacity, Animated, ActivityIndicator, ImageSourcePropType, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Asset } from 'expo-asset';

// Get dimensions only once at module level
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Pre-load and memoize background image
const backgroundImage = require('../../assets/images/farm.jpg');

// Preload background image at app startup - force immediate loading
Asset.fromModule(backgroundImage).downloadAsync().catch(error => 
  console.warn('Background image preload error:', error)
);

// Load the cow animation JSON data
import cowData from '../../assets/images/cow.json';
// Load the actual PNG sprite sheet
const cowSpriteSheet = require('../../assets/images/cow-png-epizode.png');  

// Extract the frames array and meta from JSON
const { frames, meta } = cowData;
const spriteSheetWidth = meta.size.w;
const spriteSheetHeight = meta.size.h;

// Pre-define animals array at module level to avoid re-creation
const animals = [
  { id: 1, source: require('../../assets/images/animals/cow1.png'), name: 'Cow', type: 'image' },
  { id: 2, source: require('../../assets/images/animals/ch.gif'), name: 'Chicken', type: 'image' },
  { id: 3, source: cowSpriteSheet, name: 'Horse', type: 'sprite', frames: frames },
  { id: 4, source: require('../../assets/images/animals/cc-unscreen.gif'), name: 'Goat', type: 'image' },
];

// Preload all animal images
animals.forEach(animal => {
  if (animal.type === 'image') {
    Asset.fromModule(animal.source).downloadAsync();
  }
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
  animalImage: {
    width: screenWidth * 0.5,
    height: screenHeight * 0.25,
    resizeMode: 'contain',
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
  style 
}: { 
  frames: Array<{
    filename: string;
    frame: { x: number; y: number; w: number; h: number; };
    rotated: boolean;
    trimmed: boolean;
    spriteSourceSize: { x: number; y: number; w: number; h: number; };
    sourceSize: { w: number; h: number; };
  }>,
  source: ImageSourcePropType, 
  style?: StyleProp<ViewStyle> 
}) {
  const [frameIndex, setFrameIndex] = useState(0);

  // Increase the frame index periodically
  useEffect(() => {
    const frameCount = frames.length;
    const interval = setInterval(() => {
      setFrameIndex(prev => (prev + 1) % frameCount);
    }, 100); // 100 ms per frame = ~10 FPS

    return () => clearInterval(interval);
  }, []);

  // Get current frame data
  const currentFrame = frames[frameIndex].frame;
  const { x, y, w, h } = currentFrame;

  return (
    <View style={[styles.frameWindow, { width: w, height: h }]}>
      <Image
        source={source}
        style={[
          styles.spriteImage,
          {
            width: spriteSheetWidth,
            height: spriteSheetHeight,
            // Shift the large sprite sheet to show only the current frame
            marginLeft: -x,
            marginTop: -y
          }
        ]}
        resizeMode="cover"
      />
    </View>
  );
}

export default function HomeScreen() {
  const [currentAnimalIndex, setCurrentAnimalIndex] = useState(0);
  const [showName, setShowName] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimalLoading, setIsAnimalLoading] = useState(true);
  const [isBackgroundLoaded, setIsBackgroundLoaded] = useState(true); // Start with true to skip background loading
  const [showSplash, setShowSplash] = useState(true); // New state for splash screen
  const [isMuted, setIsMuted] = useState(false); // New state for sound muting
  
  // Memoize current animal to prevent unnecessary recalculations
  const currentAnimal = useMemo(() => animals[currentAnimalIndex], [currentAnimalIndex]);
  
  // Create animation values only once with useRef
  const leftChevronAnim = useRef(new Animated.Value(0)).current;
  const rightChevronAnim = useRef(new Animated.Value(0)).current;
  
  // Load font with caching
  const [fontsLoaded] = useFonts({
    'ComicNeue': require('../../assets/fonts/custom.ttf'),
    'TitleFont': require('../../assets/fonts/orange.ttf'),
  });
  
  // Show splash for 4 seconds instead of 2, giving more time for the animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      setIsLoading(false);
    }, 8000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Reset animal loading state when animal changes
  useEffect(() => {
    setIsAnimalLoading(true);
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
  
  // Memoize handlers to prevent recreating functions on each render
  const handleNextAnimal = useRef(() => {
    setCurrentAnimalIndex((prev) => (prev + 1) % animals.length);
    setShowName(false);
  }).current;

  const handlePrevAnimal = useRef(() => {
    setCurrentAnimalIndex((prev) => (prev - 1 + animals.length) % animals.length);
    setShowName(false);
  }).current;
  
  const toggleShowName = useRef(() => {
    setShowName(prev => !prev);
  }).current;
  
  const handleAnimalLoad = useRef(() => {
    setIsAnimalLoading(false);
  }).current;
  
  const handleBackgroundLoad = useRef(() => {
    // This is still here but will have no effect since isBackgroundLoaded starts as true
    setIsBackgroundLoaded(true);
  }).current;

  const toggleSound = useRef(() => {
    setIsMuted(prev => !prev);
  }).current;

  // Create loading animation outside of conditional
  const titleAnim = useRef(new Animated.Value(0)).current;
  
  // Increase animation duration from 6000ms to 3500ms to better match the splash screen duration
  useEffect(() => {
    Animated.timing(titleAnim, {
      toValue: 1,
      duration: 3500,
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
          style={styles.animalImage}
        />
      );
    } else {
      return (
        <Image 
          source={currentAnimal.source} 
          style={styles.animalImage}
          fadeDuration={0}
          progressiveRenderingEnabled={true}
          onLoad={handleAnimalLoad}
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
            source={require('../../assets/images/log.png')}
            style={{
              width: 550,
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
      <ActivityIndicator size="large" color="green" />
    </View>
  ) : (
    // Main app content
    <ImageBackground
      source={backgroundImage}
      style={styles.container}
      imageStyle={styles.backgroundImageStyle}
      resizeMode="cover"
      fadeDuration={0}
      onLoadEnd={handleBackgroundLoad}
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
            {renderAnimalContent()}
            {isAnimalLoading && currentAnimal.type === 'image' && (
              <View style={styles.animalLoadingContainer}>
                <ActivityIndicator size="large" color="green" />
              </View>
            )}
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
  );
}
