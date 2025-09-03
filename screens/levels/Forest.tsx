import React, { useEffect, useState, useRef, useMemo } from 'react';
import { ActivityIndicator, View, useWindowDimensions, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Asset } from 'expo-asset';
import { VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import LevelVideoPlayer from '../../src/components/LevelVideoPlayer';
import { getAnimals } from '../../src/data/animals';
import { AnimalType } from '../../src/data/AnimalType';
import LevelScreenTemplate, { setGlobalVolume, getGlobalVolume } from '../../src/components/LevelScreenTemplate';
import { useLocalization } from '../../src/hooks/useLocalization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenLoadingWrapper from '../../src/components/ScreenLoadingWrapper';

// Define Props for the screen
type ForestScreenProps = {
    onBackToMenu: () => void;
    backgroundImageUri: string | null; // Accept URI prop
    skyBackgroundImageUri: string | null;
    
};

export default function ForestScreen({ onBackToMenu, backgroundImageUri, skyBackgroundImageUri }: ForestScreenProps) {
  const { lang, t } = useLocalization();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [allAssetsLoaded, setAllAssetsLoaded] = useState(false);
  
  // Load the forest background image
  const FOREST_BG = require('../../src/assets/images/level-backgrounds/forest.webp');
  const [bgUri, setBgUri] = useState<string | null>(null);
  
  const forestAnimals = getAnimals(lang).filter((animal: AnimalType) => animal.animalType === 'Forest');
  const [bgReady, setBgReady] = useState(false);
  const [showVideo, setShowVideo] = useState(isLandscape); // Show video only in landscape
  const [gameStarted, setGameStarted] = useState(!isLandscape); // Start game immediately in portrait
  const [isVideoMuted, setIsVideoMuted] = useState(true); // Track video mute state
  const videoVolumeToggleRef = useRef<(() => void) | null>(null);
  const [initialIndex, setInitialIndex] = useState<number | undefined>(undefined);
  
  // Animation values for the level title
  const [titleScale] = useState(() => new Animated.Value(0));
  const [titleOpacity] = useState(() => new Animated.Value(0));
  const [titleGlow] = useState(() => new Animated.Value(0));
  
  // Typewriter effect state
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  const fullText = useMemo(() => t('levelForest'), [t, lang]);
  const [cursorOpacity] = useState(() => new Animated.Value(1));
  
    // Video handling is now managed by RobustVideoPlayer

    // Video end handling is now managed by RobustVideoPlayer's onVideoEnd callback

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
  }, [showVideo, isLandscape, fullText]);

  // Handle orientation changes
  useEffect(() => {
    if (isLandscape && !gameStarted) {
      setShowVideo(true);
      // Video will auto-play via RobustVideoPlayer
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
    // Video pause handled by RobustVideoPlayer
    handleVideoEnd();
  };

  useEffect(() => {
    const load = async () => {
      // Load the background image immediately
      const bgAsset = Asset.fromModule(FOREST_BG);
      setBgUri(bgAsset.uri);
      setBgReady(true);
      
      // Optional: download for caching
      bgAsset.downloadAsync().catch(() => {
        // Ignore errors - image will still display
      });
    };

    load();
  }, []);

    // Video pause/play is now handled by RobustVideoPlayer

  // Skip intro if any animal was already clicked for this level
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('animalProgress_forest');
        if (saved) {
          const arr = JSON.parse(saved);
          if (Array.isArray(arr) && arr.length > 0) {
            // Skip video if level was already started
            setShowVideo(false);
            setGameStarted(true);
            
            // Calculate the correct initial index based on progress
            const visitedSet = new Set<number>(arr);
            let indexToShow = 0;
            if (forestAnimals.length > 0) {
              if (visitedSet.size < forestAnimals.length) {
                // Find first unvisited animal
                for (let i = 0; i < forestAnimals.length; i++) {
                  if (!visitedSet.has(i)) { 
                    indexToShow = i; 
                    break; 
                  }
                }
              } else {
                // All visited: try to restore saved index
                const indexKey = 'animalCurrentIndex_forest';
                const savedIndexStr = await AsyncStorage.getItem(indexKey);
                const parsed = parseInt(savedIndexStr ?? '', 10);
                if (!isNaN(parsed) && parsed >= 0 && parsed < forestAnimals.length) {
                  indexToShow = parsed;
                }
              }
            }
            setInitialIndex(indexToShow);
          } else {
            // No progress yet, start with first animal
            setInitialIndex(0);
          }
        } else {
          // No saved progress, start with first animal
          setInitialIndex(0);
        }
      } catch (e) {
        // Error case, start with first animal
        setInitialIndex(0);
      }
    })();
  }, [forestAnimals.length]);

    // Gather all assets to preload
  const forestAssets = useMemo(() => {
    const assets = [
      FOREST_BG,
      require('../../src/assets/intro_videos/forest.mp4')
    ];
    return assets;
  }, []);

    // Wrap entire component with loading wrapper
  return (
    <ScreenLoadingWrapper
      assetsToLoad={forestAssets}
      loadingText={t('loading') || 'Loading Forest...'}
      backgroundColor="#228b22"
      minLoadingTime={1500}
      onAssetsLoaded={() => {
        // Defer state update to avoid React lifecycle warnings
        requestAnimationFrame(() => {
          setAllAssetsLoaded(true);
        });
      }}
    >
      {/* Show video intro in landscape mode */}
      {showVideo && isLandscape && allAssetsLoaded ? (
      <View style={styles.fullscreenContainer} pointerEvents="box-none">
        <LevelVideoPlayer
          source={require('../../src/assets/intro_videos/forest.mp4')}
          style={styles.fullscreenVideo}
          loop={false}
          muted={true}
          onVolumeStateChange={setIsVideoMuted}
          exposeVolumeToggle={(toggleFn) => {
            videoVolumeToggleRef.current = toggleFn;
          }}
          autoPlay={true}
          contentFit="fill"
          fallbackColor="#1a4a1a"
          onLoad={() => console.log('✅ Forest video loaded')}
          onError={(error) => {
            console.error('❌ Forest video error:', error);
            handleVideoEnd();
          }}
          onVideoEnd={() => {
            console.log('🏁 Forest video ended');
            handleVideoEnd();
          }}
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
          {/* Volume button */}
          <TouchableOpacity 
            style={[
              styles.rightSkipButton,
              { backgroundColor: 'rgba(0, 0, 0, 0.7)' }
            ]} 
            onPress={() => {
              videoVolumeToggleRef.current?.();
            }}
          >
            <Ionicons name={isVideoMuted ? "volume-mute" : "volume-high"} size={24} color="#fff" />
            <Text style={styles.rightButtonText}>{t('sound')}</Text>
          </TouchableOpacity>

          {/* Skip button */}
          <TouchableOpacity style={styles.rightSkipButton} onPress={skipVideo}>
            <Ionicons name="play-skip-forward" size={24} color="#fff" />
            <Text style={styles.rightButtonText}>{t('skip')}</Text>
          </TouchableOpacity>

          {/* Home button */}
          <TouchableOpacity style={styles.rightHomeButton} onPress={onBackToMenu}>
            <Ionicons name="home" size={24} color="#fff" />
            <Text style={styles.rightButtonText}>{t('home')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      ) : gameStarted && typeof initialIndex === 'number' ? (
        // Show game when loading is done
      <LevelScreenTemplate
        levelName="Forest"
        animals={forestAnimals}
        onBackToMenu={onBackToMenu}
        backgroundImageUri={bgUri}
        skyBackgroundImageUri={skyBackgroundImageUri}
        initialIndex={initialIndex}
      />
      ) : (
        // Fallback loading state
        <View style={{ flex: 1, backgroundColor: '#FFDAB9', justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="orange" />
        </View>
      )}
    </ScreenLoadingWrapper>
  );
}

const styles = StyleSheet.create({
  fullscreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    zIndex: 9999,
    margin: 0,
    padding: 0,
  },
  fullscreenVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    margin: 0,
    padding: 0,
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
    backgroundColor: 'rgba(85, 107, 47, 0.7)', // Dark olive green forest theme
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 50, // Pill shape
    borderWidth: 2,
    borderColor: 'rgba(124, 252, 0, 0.8)', // Lawn green border
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
    top: 30,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    zIndex: 100000, // Much higher z-index to appear above fullscreenContainer
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
    backgroundColor: 'orange',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 100,
    justifyContent: 'center',
    zIndex: 100001, // Much higher z-index to ensure home button appears above everything
  },
  rightButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
