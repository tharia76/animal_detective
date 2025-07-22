import React, { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, View, useWindowDimensions, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Asset } from 'expo-asset';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { getAnimals } from '../../src/data/animals';
import { AnimalType } from '../../src/data/AnimalType';
import LevelScreenTemplate from '../../src/components/LevelScreenTemplate';
import { useLocalization } from '../../src/hooks/useLocalization';

// Define Props for the screen
type InsectsScreenProps = {
    onBackToMenu: () => void;
    backgroundImageUri: string | null; // Accept URI prop
    skyBackgroundImageUri: string | null;
    
};

export default function InsectsScreen({ onBackToMenu, backgroundImageUri, skyBackgroundImageUri }: InsectsScreenProps) {
  const { lang } = useLocalization();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  
  const insectsAnimals = getAnimals(lang).filter((animal: AnimalType) => animal.animalType === 'Insects');
  const [bgReady, setBgReady] = useState(false);
  const [showVideo, setShowVideo] = useState(isLandscape); // Show video only in landscape
  const [gameStarted, setGameStarted] = useState(!isLandscape); // Start game immediately in portrait
  
  // Animation values for the level title
  const titleScale = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleGlow = useRef(new Animated.Value(0)).current;
  
  // Typewriter effect state
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  const fullText = 'LEVEL: INSECTS';
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  
  // Video player setup
  const player = useVideoPlayer(require('../../src/assets/intro_videos/insects-vid.mp4'), player => {
    player.loop = false;
    player.muted = false;
  });

  // Listen for video end by checking currentTime vs duration
  useEffect(() => {
    if (!player || !showVideo) return;

    const checkVideoEnd = () => {
      if (player.currentTime && player.duration && 
          player.currentTime >= player.duration - 0.1) {
        // Video has finished playing (within 0.1 seconds of end)
        handleVideoEnd();
      }
    };

    // Check every 100ms
    const interval = setInterval(checkVideoEnd, 100);

    // Also set a backup timer for maximum video length (in case video is very long)
    const maxTimer = setTimeout(() => {
      handleVideoEnd();
    }, 60000); // 60 seconds max

    return () => {
      clearInterval(interval);
      clearTimeout(maxTimer);
    };
  }, [player, showVideo]);

  // Start typewriter effect when video shows
  useEffect(() => {
    if (showVideo && isLandscape) {
      // Reset animations and text
      titleScale.setValue(1);
      titleOpacity.setValue(1);
      titleGlow.setValue(0);
      setDisplayedText('');
      setShowCursor(true);

      // Start cursor blinking animation
      const cursorBlink = Animated.loop(
        Animated.sequence([
          Animated.timing(cursorOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(cursorOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        { iterations: -1 }
      );
      cursorBlink.start();

      // Start typewriter effect
      let currentIndex = 0;
      const typeInterval = setInterval(() => {
        if (currentIndex <= fullText.length) {
          setDisplayedText(fullText.slice(0, currentIndex));
          currentIndex++;
        } else {
          // Typing complete
          clearInterval(typeInterval);
          setShowCursor(false);
          cursorBlink.stop();
          
          // Start glow effect after typing is done
          setTimeout(() => {
            const glowAnimation = Animated.loop(
              Animated.sequence([
                Animated.timing(titleGlow, {
                  toValue: 1,
                  duration: 1500,
                  useNativeDriver: true,
                }),
                Animated.timing(titleGlow, {
                  toValue: 0,
                  duration: 1500,
                  useNativeDriver: true,
                }),
              ]),
              { iterations: 2 } // Only glow 2 times (6 seconds total)
            );
            
            glowAnimation.start(() => {
              // After glow effect, fade out the title
              Animated.timing(titleOpacity, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
              }).start();
            });
          }, 500);
        }
      }, 150); // Type one character every 150ms for better readability

      // Cleanup function
      return () => {
        clearInterval(typeInterval);
        cursorBlink.stop();
      };
    }
  }, [showVideo, isLandscape]);

  // Handle orientation changes
  useEffect(() => {
    if (isLandscape && !gameStarted) {
      setShowVideo(true);
      player.play();
    } else if (!isLandscape) {
      setShowVideo(false);
      setGameStarted(true);
    }
  }, [isLandscape]);

  const handleVideoEnd = () => {
    setShowVideo(false);
    setGameStarted(true);
  };

  const skipVideo = () => {
    player.pause();
    handleVideoEnd();
  };

  useEffect(() => {
    const load = async () => {
      try {
        await Asset.fromModule(require('../../src/assets/images/level-backgrounds/insect.png')).downloadAsync();
      } catch (err) {
        console.warn('Failed to preload insects image', err);
      }
      setBgReady(true);
    };

    load();
  }, []);

  if (!bgReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFDAB9', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="orange" />
      </View>
    );
  }

  // Show video intro in landscape mode
  if (showVideo && isLandscape) {
    return (
      <View style={styles.fullscreenContainer}>
        <VideoView
          style={styles.fullscreenVideo}
          player={player}
          allowsFullscreen={false}
          allowsPictureInPicture={false}
          nativeControls={false}
          contentFit="cover"
        />
        
        {/* Level title overlay */}
        <View style={styles.levelTitleContainer}>
          <Animated.View style={[
            styles.levelTitleWrapper,
            {
              opacity: titleOpacity,
              transform: [
                { scale: titleScale },
                {
                  scale: titleGlow.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.1],
                  }),
                },
              ],
            },
          ]}>
            <View style={styles.typewriterContainer}>
              <Animated.Text style={styles.levelTitle}>
                {displayedText}
              </Animated.Text>
              {showCursor && (
                <Animated.Text style={[
                  styles.cursor,
                  { opacity: cursorOpacity }
                ]}>
                  |
                </Animated.Text>
              )}
            </View>
          </Animated.View>
        </View>
        
        {/* Right side button container */}
        <View style={styles.rightButtonContainer}>
          {/* Skip button */}
          <TouchableOpacity style={styles.rightSkipButton} onPress={skipVideo}>
            <Ionicons name="play-skip-forward" size={24} color="#fff" />
            <Text style={styles.rightButtonText}>Skip</Text>
          </TouchableOpacity>

          {/* Home button */}
          <TouchableOpacity style={styles.rightHomeButton} onPress={onBackToMenu}>
            <Ionicons name="home" size={24} color="#fff" />
            <Text style={styles.rightButtonText}>Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Show game when video ends or in portrait mode
  if (gameStarted) {
    return (
      <LevelScreenTemplate
        levelName="Insects"
        animals={insectsAnimals}
        onBackToMenu={onBackToMenu}
        backgroundImageUri={backgroundImageUri}
        skyBackgroundImageUri={skyBackgroundImageUri}
      />
    );
  }

  // Fallback loading state
  return (
    <View style={{ flex: 1, backgroundColor: '#FFDAB9', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="orange" />
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreenContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 9999,
  },
  fullscreenVideo: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  levelTitleContainer: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  levelTitleWrapper: {
    backgroundColor: 'rgba(139, 69, 19, 0.7)', // Saddle brown insect theme
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 50, // Pill shape
    borderWidth: 2,
    borderColor: 'rgba(255, 140, 0, 0.8)', // Dark orange border
  },
  typewriterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2,
  },
  cursor: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  rightButtonContainer: {
    position: 'absolute',
    right: 20,
    top: 60,
    bottom: 60,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    zIndex: 2,
  },
  rightSkipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 100,
    justifyContent: 'center',
  },
  rightHomeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 100,
    justifyContent: 'center',
  },
  rightButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
