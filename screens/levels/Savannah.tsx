import React, { useEffect, useState, useRef, useMemo } from 'react';
import { ActivityIndicator, View, useWindowDimensions, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Asset } from 'expo-asset';
import { VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import LevelVideoPlayer from '../../src/components/LevelVideoPlayer';
import { getAnimals } from '../../src/data/animals';
import { AnimalType } from '../../src/data/AnimalType';
import LevelScreenTemplate, { getGlobalVolume } from '../../src/components/LevelScreenTemplate';
import { useLocalization } from '../../src/hooks/useLocalization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenLoadingWrapper from '../../src/components/ScreenLoadingWrapper';

// Define Props for the screen
type SavannahScreenProps = {
    onBackToMenu: () => void;
    backgroundImageUri: string | null; // Accept URI prop
    skyBackgroundImageUri: string | null;
    
};

export default function SavannahScreen({ onBackToMenu, backgroundImageUri, skyBackgroundImageUri }: SavannahScreenProps) {
  const { lang, t } = useLocalization();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [allAssetsLoaded, setAllAssetsLoaded] = useState(false);
  
  // Load the savannah background image
  const SAVANNAH_BG = require('../../src/assets/images/level-backgrounds/savannah.webp');
  const [bgUri, setBgUri] = useState<string | null>(null);
  
  const savannahAnimals = getAnimals(lang).filter((animal: AnimalType) => animal.animalType === 'Savannah');
  const [bgReady, setBgReady] = useState(false);
  const [showVideo, setShowVideo] = useState(false); // Never show video
  const [gameStarted, setGameStarted] = useState(true); // Always start game immediately
  const [showPostVideoLoading, setShowPostVideoLoading] = useState(false); // Show loading after video
  const [isVideoMuted, setIsVideoMuted] = useState(true); // Track video mute state
  const videoVolumeToggleRef = useRef<(() => void) | null>(null);
  
  // Animation values for the level title
  const [titleScale] = useState(() => new Animated.Value(0));
  const [titleOpacity] = useState(() => new Animated.Value(0));
  const [titleGlow] = useState(() => new Animated.Value(0));
  
  // Typewriter effect state
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  const fullText = useMemo(() => t('levelSavannah'), [t, lang]);
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

  // Handle orientation changes - removed video logic since we're skipping videos
  useEffect(() => {
    // Always ensure game is started and visible
    setShowVideo(false);
    setGameStarted(true);
  }, [isLandscape]);

  const handleVideoEnd = () => {
    setShowVideo(false);
    setShowPostVideoLoading(true);
    // Start game after loading time
    setTimeout(() => {
      setShowPostVideoLoading(false);
      setGameStarted(true);
    }, 1500); // Match the minLoadingTime
  };

  const skipVideo = () => {
    // Video pause handled by RobustVideoPlayer
    handleVideoEnd();
  };

  useEffect(() => {
    const load = async () => {
      // Load the background image immediately
      const bgAsset = Asset.fromModule(SAVANNAH_BG);
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

  // Always skip intro videos - removed video check logic
  useEffect(() => {
    // Always ensure game starts immediately
    setShowVideo(false);
    setGameStarted(true);
  }, []);


    // Wrap entire component with loading wrapper
  return (
    <ScreenLoadingWrapper
      loadingText={t('loading') || 'Loading Savannah...'}
      backgroundColor="#f4e4bc" // Beige to match Savannah level background
      minLoadingTime={800} // Short loading to prevent black flash
      onAssetsLoaded={() => {
        // Defer state update to avoid React lifecycle warnings
        requestAnimationFrame(() => {
          setAllAssetsLoaded(true);
        });
      }}
    >
      {/* Show video intro in landscape mode */}
      {showVideo && isLandscape && allAssetsLoaded ? (
      <View style={styles.fullscreenContainer}>
        <LevelVideoPlayer
          source={''}
          style={styles.fullscreenVideo}
          loop={false}
          muted={true}
          onVolumeStateChange={setIsVideoMuted}
          exposeVolumeToggle={(toggleFn) => {
            videoVolumeToggleRef.current = toggleFn;
          }}
          autoPlay={true}
          contentFit="fill"
          fallbackColor="#8b6b14"
          onLoad={() => console.log('✅ Savannah video loaded')}
          onError={(error) => {
            console.error('❌ Savannah video error:', error);
            handleVideoEnd();
          }}
          onVideoEnd={() => {
            console.log('🏁 Savannah video ended');
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
            ) : showPostVideoLoading ? (
        // Show loading screen after video
        <View style={{ flex: 1, backgroundColor: '#f0e68c', justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FF8C00" />
          <Text style={{ marginTop: 20, fontSize: 18, color: '#FF8C00', fontWeight: 'bold' }}>
            {t('loading') || 'Loading Savannah...'}
          </Text>
        </View>
      ) : gameStarted ? (
        // Show game when loading is done
      <LevelScreenTemplate
        levelName="Savannah"
        animals={savannahAnimals}
        onBackToMenu={onBackToMenu}
        backgroundImageUri={bgUri}
        skyBackgroundImageUri={skyBackgroundImageUri}
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
    flex: 1,
    backgroundColor: 'transparent',
  },
  fullscreenVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
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
    backgroundColor: 'rgba(184, 134, 11, 0.7)', // Golden brown savannah theme
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 50, // Pill shape
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.8)', // Amber border
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
    top: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
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
    backgroundColor: 'orange',
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
