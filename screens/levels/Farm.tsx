import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, ActivityIndicator, useWindowDimensions, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import { VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import LevelVideoPlayer from '../../src/components/LevelVideoPlayer';
import { getAnimals } from '../../src/data/animals';
import { AnimalType } from '../../src/data/AnimalType';
import LevelScreenTemplate, { getGlobalVolume } from '../../src/components/LevelScreenTemplate';
import { useLocalization } from '../../src/hooks/useLocalization';
import { getAllLandscapeButtonPositions } from '../../src/utils/landscapeButtonPositioning';
import ScreenLoadingWrapper from '../../src/components/ScreenLoadingWrapper';

// Define Props for the screen
type FarmScreenProps = {
    onBackToMenu: () => void;
    backgroundImageUri: string | null; // Accept URI prop
    skyBackgroundImageUri: string | null;
    onScreenReady?: () => void;
};

export default function FarmScreen({ onBackToMenu, backgroundImageUri, skyBackgroundImageUri, onScreenReady }: FarmScreenProps) {
  const { t, lang } = useLocalization();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [allAssetsLoaded, setAllAssetsLoaded] = useState(false);
  
  // Load the farm background image
  const FARM_BG = require('../../src/assets/images/level-backgrounds/farm.webp');
  const [bgUri, setBgUri] = useState<string | null>(null);
  
  const farmAnimals = getAnimals(lang).filter((animal: AnimalType) => animal.animalType === 'Farm');
  const [bgReady, setBgReady] = useState(false);
  const [showVideo, setShowVideo] = useState(false); // Never show video
  const [gameStarted, setGameStarted] = useState(true); // Always start game immediately
  const [isVideoMuted, setIsVideoMuted] = useState(true); // Track video mute state
  const videoVolumeToggleRef = useRef<(() => void) | null>(null);
  const [videoOpacity] = useState(() => new Animated.Value(1)); // For smooth video fade out
  const [gameFadeAnim] = useState(() => new Animated.Value(1)); // Game always visible
  
  // Animation values for the level title
  const [titleScale] = useState(() => new Animated.Value(0));
  const [titleOpacity] = useState(() => new Animated.Value(0));
  const [titleGlow] = useState(() => new Animated.Value(0));
  
  // Typewriter effect state
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  const fullText = useMemo(() => t('levelFarm'), [t, lang]);
  const [cursorOpacity] = useState(() => new Animated.Value(1));
  
  // Video handling is now managed by LevelVideoPlayer

  // Video end handling is now managed by LevelVideoPlayer's onVideoEnd callback

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
    gameFadeAnim.setValue(1);
  }, [isLandscape, gameFadeAnim]);

  const handleVideoEnd = () => {
    // Since videos are disabled, this function is no longer used
    setShowVideo(false);
    setGameStarted(true);
  };

  const skipVideo = () => {
    // Video will be handled by RobustVideoPlayer's skip functionality
    handleVideoEnd();
  };

  useEffect(() => {
    // Load the background image immediately
    const loadBackground = async () => {
      const bgAsset = Asset.fromModule(FARM_BG);
      
      try {
        // Ensure the background is downloaded before marking ready
        await bgAsset.downloadAsync();
      } catch (error) {
        // Ignore errors - local assets will still work
      }
      
      setBgUri(bgAsset.uri);
      setBgReady(true);
      
      // Very small delay to ensure background is rendered
      setTimeout(() => {
        // Notify parent that screen is ready
        if (onScreenReady) {
          onScreenReady();
        }
      }, 10);
    };
    
    loadBackground();
  }, [onScreenReady]);

  // Video pause/play is now handled by RobustVideoPlayer

  // Always skip intro videos - removed video check logic
  useEffect(() => {
    // Always ensure game starts immediately
    setShowVideo(false);
    setGameStarted(true);
    gameFadeAnim.setValue(1);
    videoOpacity.setValue(0);
  }, [gameFadeAnim, videoOpacity]);

  // Gather all assets to preload including animal sprites
  const farmAssets = useMemo(() => {
    const assets = [
      FARM_BG,
    ];
    
    // Add farm animal sprites to ensure they're loaded
    farmAnimals.forEach(animal => {
      if (animal.source) {
        assets.push(animal.source);
      }
    });
    
    return assets;
  }, [farmAnimals]);

  // Wrap entire component with loading wrapper
  return (
    <ScreenLoadingWrapper
      assetsToLoad={farmAssets}
      loadingText={t('loading') || 'Loading Farm...'}
      backgroundColor="#87CEEB" // Sky blue to match Farm level background
      minLoadingTime={800} // Short loading to prevent black flash
      onAssetsLoaded={() => {
        // Defer state update to avoid React lifecycle warnings
        requestAnimationFrame(() => {
          setAllAssetsLoaded(true);
        });
      }}
    >
      {/* Show video when appropriate */}
      {showVideo && isLandscape && allAssetsLoaded ? (
      <Animated.View style={[styles.fullscreenContainer, { opacity: videoOpacity }]}>
        <LevelVideoPlayer
          source={''}
          style={styles.fullscreenVideo}
          loop={false}
          muted={true}
          autoPlay={true}
          contentFit="fill"
          fallbackColor="#2d5016"
          onLoad={() => {
            console.log('✅ Farm video loaded');
            // Fallback timeout to ensure transition happens
            setTimeout(() => {
              console.log('🕐 Farm video timeout reached, transitioning to game');
              if (showVideo) { // Only transition if still showing video
                handleVideoEnd();
              }
            }, 15000); // 15 second fallback to allow video to play
          }}
          onError={(error) => {
            console.error('❌ Farm video error:', error);
            // On error, show loading screen then game
            handleVideoEnd();
          }}
          onVideoEnd={() => {
            console.log('🏁 Farm video ended naturally');
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
      </Animated.View>
      ) : null}
      
      {/* Show game directly */}
      {gameStarted ? (
      <View style={{ flex: 1 }}>
        <LevelScreenTemplate
          levelName="Farm"
          animals={farmAnimals}
          onBackToMenu={onBackToMenu}
          backgroundImageUri={bgUri}
          skyBackgroundImageUri={skyBackgroundImageUri}
        />
      </View>
      ) : null}
      

      
      {/* Fallback loading state */}
      {!showVideo && !gameStarted && (
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
    backgroundColor: 'rgba(255, 165, 0, 0.7)', // Less transparent orange
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 50, // Pill shape
    borderWidth: 2,
    borderColor: 'rgba(255, 165, 0, 0.8)', // More opaque border
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
  tapToSkip: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  // Legacy styles (keeping for compatibility)
  videoContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skipText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 25,
  },
});
