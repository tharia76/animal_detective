import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Asset } from 'expo-asset';

interface LevelIntroVideoProps {
  source: any;
  onVideoEnd: () => void;
  onSkip: () => void;
  levelName: string;
  isVisible: boolean;
  onMuteBackgroundMusic: () => void;
  onUnmuteBackgroundMusic: () => void;
}

export default function LevelIntroVideo({ 
  source, 
  onVideoEnd, 
  onSkip, 
  levelName, 
  isVisible,
  onMuteBackgroundMusic,
  onUnmuteBackgroundMusic
}: LevelIntroVideoProps) {
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [isVideoMuted, setIsVideoMuted] = useState(true); // Start muted to allow autoplay
  const [videoSource, setVideoSource] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasEnded, setHasEnded] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Calculate 50% of screen dimensions
  const videoWidth = screenWidth * 0.5;
  const videoHeight = screenHeight * 0.5;

  // Create video player - only when source is available
  const player = useVideoPlayer(videoSource || '', (player) => {
    console.log('🎬 Video player callback called, player:', !!player, 'videoSource:', videoSource);
    if (player && videoSource) {
      player.loop = false;
      player.muted = true; // Always start muted for autoplay
      console.log('🎬 Video player configured with source:', videoSource);
      
      // Try to play immediately when player is created
      if (isVisible && !hasEnded) {
        setTimeout(() => {
          try {
            player.play();
            console.log('🎬 Video auto-played in player creation callback');
            
            // Try to unmute after video starts
            setTimeout(() => {
              try {
                player.muted = false;
                console.log('🎬 Video unmuted in player creation callback');
              } catch (unmuteError) {
                console.warn('🎬 Error unmuting in player creation:', unmuteError);
              }
            }, 500); // Reduced from 1000ms to 500ms
          } catch (error) {
            console.warn('🎬 Error auto-playing in player creation:', error);
          }
        }, 100);
      }
    }
  });

  // Handle video source loading
  useEffect(() => {
    const loadVideoSource = async () => {
      try {
        console.log('🎬 Loading video source:', source);
        setIsLoading(true);
        if (typeof source === 'number') {
          const asset = Asset.fromModule(source);
          await asset.downloadAsync();
          const loadedSource = asset.localUri || asset.uri;
          console.log('🎬 Video asset loaded:', loadedSource);
          setVideoSource(loadedSource);
        } else {
          const loadedSource = source.uri || source;
          console.log('🎬 Video source set:', loadedSource);
          setVideoSource(loadedSource);
        }
        setIsLoading(false);
        console.log('🎬 Video source loading complete');
        
        // Try to play immediately after source is loaded
        if (isVisible && !hasEnded) {
          setTimeout(() => {
            try {
              if (player) {
                player.muted = true;
                player.play();
                console.log('🎬 Video auto-played after source loading');
                
                // Try to unmute after a delay
                setTimeout(() => {
                  try {
                    player.muted = false;
                    console.log('🎬 Video unmuted after source loading');
                  } catch (unmuteError) {
                    console.warn('🎬 Error unmuting after source loading:', unmuteError);
                  }
                }, 1000);
              }
            } catch (error) {
              console.warn('🎬 Error auto-playing after source loading:', error);
            }
          }, 100);
        }
      } catch (error) {
        console.error('Error loading video source:', error);
        setIsLoading(false);
        onSkip(); // Skip on error
      }
    };

    if (isVisible && source) {
      console.log('🎬 Starting video source loading...');
      loadVideoSource();
    }
  }, [isVisible, source, onSkip]);

  // Auto-play when video source changes
  useEffect(() => {
    if (videoSource && player && isVisible && !hasEnded && !isLoading) {
      console.log('🎬 Video source changed, attempting to play...');
      
      // Multiple attempts to play the video
      const playVideo = (attempt: number) => {
        try {
          player.muted = true;
          player.play();
          console.log(`🎬 Video auto-played on source change (attempt ${attempt})`);
          setShowPlayButton(false);
          
          // Try to unmute after a delay
          setTimeout(() => {
            try {
              player.muted = false;
              console.log('🎬 Video unmuted on source change');
            } catch (unmuteError) {
              console.warn('🎬 Error unmuting on source change:', unmuteError);
            }
          }, 1000); // Reduced from 2000ms to 1000ms
        } catch (error) {
          console.warn(`🎬 Error auto-playing on source change (attempt ${attempt}):`, error);
          if (attempt < 3) {
            // Retry up to 3 times
            setTimeout(() => playVideo(attempt + 1), attempt * 250); // Reduced from 500ms to 250ms
          } else {
            setShowPlayButton(true);
          }
        }
      };
      
      // Try to play immediately
      playVideo(1);
    }
  }, [videoSource, player, isVisible, hasEnded, isLoading]);

  // Define handleVideoEnd before using it
  const handleVideoEnd = () => {
    console.log('🎬 handleVideoEnd called, hasEnded:', hasEnded);
    
    if (hasEnded) {
      console.log('🎬 Video already ended, ignoring duplicate call');
      return;
    }
    
    setHasEnded(true);
    console.log('🎬 Video ended, starting fade out animation');
    
    // Stop video playback immediately
    if (player) {
      try {
        player.pause();
        console.log('🎬 Video paused');
      } catch (error) {
        console.warn('Error pausing video on end:', error);
      }
    }
    
    // Fade out video before calling onVideoEnd - instant fade
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 0, // Instant fade out
      useNativeDriver: true,
    }).start(() => {
      console.log('🎬 Video fade out complete, calling onVideoEnd');
      onVideoEnd();
    });
  };

  // Handle video player events
  useEffect(() => {
    if (!player) return;
    
    const statusSubscription = player.addListener('statusChange', (status: any) => {
      console.log('🎬 Video status changed:', status);
      
      // Try to play when video is ready to play
      if (status.status === 'readyToPlay' && isVisible && !hasEnded && videoSource) {
        console.log('🎬 Video is ready to play, attempting to play...');
        try {
          // Ensure video is muted for autoplay
          player.muted = true;
          player.play();
          console.log('🎬 Video auto-played on readyToPlay status (muted)');
          setShowPlayButton(false);
          
          // Try to unmute after video starts playing
          setTimeout(() => {
            try {
              player.muted = false;
              console.log('🎬 Video unmuted after autoplay');
            } catch (unmuteError) {
              console.warn('🎬 Error unmuting video:', unmuteError);
            }
          }, 1000);
          
        } catch (error) {
          console.warn('🎬 Error auto-playing on readyToPlay:', error);
          // Show play button if auto-play fails
          setShowPlayButton(true);
          // Retry after a short delay
          setTimeout(() => {
            try {
              player.muted = true;
              player.play();
              console.log('🎬 Video auto-play retry successful (muted)');
              setShowPlayButton(false);
              
              // Try to unmute after retry
              setTimeout(() => {
                try {
                  player.muted = false;
                  console.log('🎬 Video unmuted after retry');
                } catch (unmuteError) {
                  console.warn('🎬 Error unmuting video after retry:', unmuteError);
                }
              }, 1000);
              
            } catch (retryError) {
              console.warn('🎬 Video auto-play retry failed:', retryError);
              setShowPlayButton(true);
            }
          }, 200);
        }
      }
      
      if (status.isLoaded) {
        // Also try to play when video is loaded
        if (isVisible && !hasEnded && videoSource) {
          console.log('🎬 Video is loaded and ready, attempting to play...');
          try {
            player.muted = true;
            player.play();
            console.log('🎬 Video auto-played on status change (muted)');
            
            // Try to unmute after video starts playing
            setTimeout(() => {
              try {
                player.muted = false;
                console.log('🎬 Video unmuted after status change autoplay');
              } catch (unmuteError) {
                console.warn('🎬 Error unmuting video after status change:', unmuteError);
              }
            }, 1000);
            
          } catch (error) {
            console.warn('🎬 Error auto-playing on status change:', error);
            // Retry after a short delay
            setTimeout(() => {
              try {
                player.muted = true;
                player.play();
                console.log('🎬 Video auto-play retry successful (muted)');
                
                // Try to unmute after retry
                setTimeout(() => {
                  try {
                    player.muted = false;
                    console.log('🎬 Video unmuted after status change retry');
                  } catch (unmuteError) {
                    console.warn('🎬 Error unmuting video after status change retry:', unmuteError);
                  }
                }, 1000);
                
              } catch (retryError) {
                console.warn('🎬 Video auto-play retry failed:', retryError);
              }
            }, 200);
          }
        }
        
        if (status.didJustFinish) {
          console.log('🎬 Video finished playing, calling handleVideoEnd');
          handleVideoEnd();
        }
      }
    });

    // Note: Only using statusChange event as playbackStatusUpdate is not available

    return () => {
      try {
        statusSubscription?.remove();
      } catch (error) {
        console.warn('Error removing video listeners:', error);
      }
    };
  }, [player, onVideoEnd, fadeAnim, isVisible, hasEnded, videoSource]);

  // Handle video visibility and setup
  useEffect(() => {
    if (isVisible && !isLoading && videoSource && player) {
      try {
        // Reset ended state when video becomes visible
        setHasEnded(false);
        
        // Pause background music before playing video
        onMuteBackgroundMusic();
        
        // Multiple attempts to play the video
        const attemptPlay = (attempt: number) => {
          try {
            // Ensure video is muted for autoplay
            player.muted = true;
            player.play();
            console.log(`🎬 Video play attempt ${attempt} successful (muted for autoplay)`);
            
            // Check if video is actually playing after a short delay
            setTimeout(() => {
              try {
                // Try to unmute after video starts playing
                setTimeout(() => {
                  try {
                    player.muted = false;
                    console.log('🎬 Video unmuted after autoplay');
                  } catch (unmuteError) {
                    console.warn('🎬 Error unmuting video:', unmuteError);
                  }
                }, 1000);
              } catch (checkError) {
                console.warn('🎬 Error checking video play status:', checkError);
              }
            }, 500);
            
          } catch (error) {
            console.warn(`🎬 Video play attempt ${attempt} failed:`, error);
            if (attempt < 5) {
                          // Retry up to 5 times with increasing delays
            setTimeout(() => attemptPlay(attempt + 1), attempt * 50); // Reduced from 100ms to 50ms
            } else {
              console.error('🎬 All video play attempts failed');
            }
          }
        };
        
        // Start playing immediately
        attemptPlay(1);
        console.log('🎬 Video is visible, attempting to play...');
        
        // Show play button if autoplay doesn't work within 1.5 seconds
        const playButtonTimeout = setTimeout(() => {
          console.log('🎬 Autoplay timeout reached, showing play button');
          setShowPlayButton(true);
        }, 1500);
        
        // Clear timeout if video starts playing
        const checkPlaying = setInterval(() => {
          try {
            if (player && player.playing) {
              clearTimeout(playButtonTimeout);
              clearInterval(checkPlaying);
              setShowPlayButton(false);
              console.log('🎬 Video is playing, hiding play button');
            }
          } catch (error) {
            // Ignore errors checking playing status
          }
        }, 500);
        
        // Cleanup intervals
        setTimeout(() => {
          clearInterval(checkPlaying);
        }, 10000);
        
        // Check video duration and set a more accurate timeout
        let videoDuration = 10000; // Default 10 seconds
        try {
          // Try to get video duration if available
          if (player.duration) {
            videoDuration = player.duration * 1000; // Convert to milliseconds
            console.log('🎬 Video duration detected:', videoDuration, 'ms');
          }
        } catch (error) {
          console.warn('Could not get video duration:', error);
        }
        
        // Set timeout based on actual video duration + 0.5 second buffer (reduced from 1 second)
        const timeoutDuration = Math.min(videoDuration + 500, 30000); // Max 30 seconds
        const fallbackTimeout = setTimeout(() => {
          console.log('🎬 Video fallback timeout reached after', timeoutDuration, 'ms, hiding video');
          handleVideoEnd();
        }, timeoutDuration);
        
        return () => {
          clearTimeout(fallbackTimeout);
        };
      } catch (error) {
        console.warn('Error setting up video:', error);
      }
    }
  }, [isVisible, isLoading, videoSource, player]);

  // Mute background music when video is visible
  useEffect(() => {
    if (isVisible) {
      // Pause background music immediately when video becomes visible
      onMuteBackgroundMusic();
      console.log('🔇 Background music paused for video');
      
      // Try to play video whenever it becomes visible
      if (player && videoSource && !hasEnded) {
        setTimeout(() => {
          try {
            player.muted = true;
            player.play();
            console.log('🎬 Video auto-played on visibility change');
            
            // Try to unmute after video starts
            setTimeout(() => {
              try {
                player.muted = false;
                console.log('🎬 Video unmuted on visibility change');
              } catch (unmuteError) {
                console.warn('🎬 Error unmuting on visibility change:', unmuteError);
              }
            }, 500); // Reduced from 1000ms to 500ms
          } catch (error) {
            console.warn('🎬 Error auto-playing on visibility change:', error);
          }
        }, 200);
      }
    } else {
      // Resume background music when video is hidden
      onUnmuteBackgroundMusic();
      console.log('🔊 Background music resumed after video');
    }
  }, [isVisible, onMuteBackgroundMusic, onUnmuteBackgroundMusic, player, videoSource, hasEnded]);

  // Cleanup function to restore background music when component unmounts
  useEffect(() => {
    return () => {
      // Resume background music on cleanup
      onUnmuteBackgroundMusic();
      console.log('🔊 Background music resumed on cleanup');
    };
  }, [onUnmuteBackgroundMusic]);

  // Force autoplay when component mounts and video is ready
  useEffect(() => {
    if (isVisible && videoSource && player && !hasEnded && !isLoading) {
      console.log('🎬 Component mounted, forcing autoplay...');
      
      // Try multiple times with different delays
      const forcePlay = () => {
        try {
          player.muted = true;
          player.play();
          console.log('🎬 Video force-played successfully');
          setShowPlayButton(false);
          
          // Try to unmute after video starts
          setTimeout(() => {
            try {
              player.muted = false;
              console.log('🎬 Video force-unmuted successfully');
            } catch (unmuteError) {
              console.warn('🎬 Error force-unmuting:', unmuteError);
            }
          }, 1000); // Reduced from 2000ms to 1000ms
        } catch (error) {
          console.warn('🎬 Error force-playing:', error);
        }
      };
      
      // Try immediately
      forcePlay();
      
      // Try again after 500ms
      setTimeout(forcePlay, 500);
      
      // Try again after 1000ms
      setTimeout(forcePlay, 1000);
      
      // Try again after 2000ms
      setTimeout(forcePlay, 2000);
    }
  }, [isVisible, videoSource, player, hasEnded, isLoading]);

  useEffect(() => {
    if (isVisible) {
      // Fade in when visible
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100, // Reduced from 200ms to 100ms for even faster fade
        useNativeDriver: true,
      }).start();
    } else {
      // Fade out when not visible - instant fade
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 0, // Instant fade out
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, fadeAnim]);


  const handleSkip = () => {
    console.log('⏭️ Video skipped by user');
    // Stop video playback immediately
    if (player) {
      try {
        player.pause();
      } catch (error) {
        console.warn('Error pausing video on skip:', error);
      }
    }
    
    // Fade out video before calling onSkip - instant fade
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 0, // Instant fade out
      useNativeDriver: true,
    }).start(() => {
      onSkip();
    });
  };

  const toggleMute = () => {
    if (player) {
      try {
        player.muted = !player.muted;
        setIsVideoMuted(player.muted);
      } catch (error) {
        console.warn('Error toggling video mute:', error);
      }
    }
  };

  if (!isVisible) {
    return null;
  }

  // Don't render anything during loading to avoid any UI elements showing
  if (isLoading) {
    return null;
  }

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      {/* Semi-transparent background with tap to skip */}
      <TouchableOpacity 
        style={styles.backgroundOverlay} 
        onPress={() => {
          // Try to play video first, then skip if already playing
          if (player && !hasEnded) {
            try {
              player.play();
              console.log('🎬 Video play triggered by user tap');
            } catch (error) {
              console.warn('🎬 Error playing video on tap:', error);
            }
          }
          // Still allow skip after a short delay
          setTimeout(() => handleSkip(), 100);
        }}
        activeOpacity={1}
      />
      
      {/* Video container - centered and 50% of screen */}
      <View style={[
        styles.videoContainer,
        {
          width: videoWidth,
          height: videoHeight,
        }
      ]}>
        <VideoView
          player={player}
          style={styles.video}
          contentFit="cover"
          allowsFullscreen={false}
          allowsPictureInPicture={false}
        />
        
        {/* Play button overlay if video is not playing */}
        {showPlayButton && (
          <TouchableOpacity 
            style={styles.playButtonOverlay}
            onPress={() => {
              try {
                if (player) {
                  player.muted = true;
                  player.play();
                  console.log('🎬 Video play triggered by play button');
                  setShowPlayButton(false);
                  
                  // Try to unmute after playing
                  setTimeout(() => {
                    try {
                      player.muted = false;
                      console.log('🎬 Video unmuted after play button');
                    } catch (unmuteError) {
                      console.warn('🎬 Error unmuting after play button:', unmuteError);
                    }
                  }, 1000);
                }
              } catch (error) {
                console.warn('🎬 Error playing video from play button:', error);
              }
            }}
          >
            <Ionicons name="play" size={60} color="#fff" />
            <Text style={styles.playButtonText}>Tap to Play</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Control buttons */}
      <View style={styles.controlsContainer}>
        {/* Volume button */}
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={toggleMute}
        >
          <Ionicons 
            name={isVideoMuted ? "volume-mute" : "volume-high"} 
            size={24} 
            color="#fff" 
          />
        </TouchableOpacity>

        {/* Skip button - more prominent */}
        <TouchableOpacity 
          style={[styles.controlButton, styles.skipButton]}
          onPress={handleSkip}
        >
          <Ionicons name="play-skip-forward" size={28} color="#fff" />
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>

      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  videoContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  levelNameContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  levelName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tapToSkipContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignItems: 'center',
  },
  tapToSkipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    gap: 10,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: 'rgba(255, 69, 0, 0.9)', // Orange-red for skip button
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#ff4500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  skipButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
});
