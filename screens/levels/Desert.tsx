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
import { getAllLandscapeButtonPositions } from '../../src/utils/landscapeButtonPositioning';

// Define Props for the screen
type DesertScreenProps = {
    onBackToMenu: () => void;
    backgroundImageUri: string | null; // Accept URI prop
    skyBackgroundImageUri: string | null;
    
};

export default function DesertScreen({ onBackToMenu, backgroundImageUri, skyBackgroundImageUri }: DesertScreenProps) {
  const { lang, t } = useLocalization();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [allAssetsLoaded, setAllAssetsLoaded] = useState(false);
  
  // Load the desert background image
  const DESERT_BG = require('../../src/assets/images/level-backgrounds/desert.webp');
  const [bgUri, setBgUri] = useState<string | null>(null);
  
  const desertAnimals = getAnimals(lang).filter((animal: AnimalType) => animal.animalType === 'Desert');
  const [bgReady, setBgReady] = useState(false);
  const [showVideo, setShowVideo] = useState(false); // Never show video
  const [gameStarted, setGameStarted] = useState(true); // Always start game immediately
  const [isVideoMuted, setIsVideoMuted] = useState(true); // Track video mute state
  const videoVolumeToggleRef = useRef<(() => void) | null>(null);
  
  // Animation values for the level title
  const [titleScale] = useState(() => new Animated.Value(0));
  const [titleOpacity] = useState(() => new Animated.Value(0));
  const [titleGlow] = useState(() => new Animated.Value(0));
  
  // Typewriter effect state
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  const fullText = useMemo(() => t('levelDesert'), [t, lang]);
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
    setGameStarted(true);
  };

  const skipVideo = () => {
    // Video pause handled by RobustVideoPlayer
    handleVideoEnd();
  };

  useEffect(() => {
    const load = async () => {
      // Load the background image immediately
      const bgAsset = Asset.fromModule(DESERT_BG);
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

    // Gather all assets to preload
  const desertAssets = useMemo(() => {
    const assets = [
      DESERT_BG,
      require('../../src/assets/intro_videos/desert-vid.mp4')
    ];
    return assets;
  }, []);

    // Wrap entire component with loading wrapper
  return (
    <ScreenLoadingWrapper
      assetsToLoad={desertAssets}
      loadingText={t('loading') || 'Loading Desert...'}
      backgroundColor="#daa520"
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
      <View style={styles.fullscreenContainer}>
        <LevelVideoPlayer
          source={require('../../src/assets/intro_videos/desert-vid.mp4')}
          style={styles.fullscreenVideo}
          loop={false}
          muted={true}
          autoPlay={true}
          contentFit="fill"
          fallbackColor="#8b6914"
          onLoad={() => console.log('✅ Desert video loaded')}
          onError={(error) => {
            console.error('❌ Desert video error:', error);
            handleVideoEnd();
          }}
          onVideoEnd={() => {
            console.log('🏁 Desert video ended');
            handleVideoEnd();
          }}
          onVolumeStateChange={setIsVideoMuted}
          exposeVolumeToggle={(toggleFn) => {
            videoVolumeToggleRef.current = toggleFn;
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
        <View style={getAllLandscapeButtonPositions(width, height, false).videoButtons.container}>
          {/* Volume button */}
          <TouchableOpacity 
            style={[
              getAllLandscapeButtonPositions(width, height, false).videoButtons.skipButton,
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
          <TouchableOpacity style={getAllLandscapeButtonPositions(width, height, false).videoButtons.skipButton} onPress={skipVideo}>
            <Ionicons name="play-skip-forward" size={24} color="#fff" />
            <Text style={styles.rightButtonText}>{t('skip')}</Text>
          </TouchableOpacity>

          {/* Home button */}
          <TouchableOpacity style={getAllLandscapeButtonPositions(width, height, false).videoButtons.homeButton} onPress={onBackToMenu}>
            <Ionicons name="home" size={24} color="#fff" />
            <Text style={styles.rightButtonText}>{t('home')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      ) : gameStarted ? (
        // Show game when loading is done
      <LevelScreenTemplate
        levelName="Desert"
        animals={desertAnimals}
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
    backgroundColor: 'rgba(210, 180, 140, 0.7)', // Sandy brown desert theme
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 50, // Pill shape
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.8)', // Gold border
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

  rightButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
