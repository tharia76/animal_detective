import React, { useState, useMemo, useCallback } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';

interface LevelVideoPlayerProps {
  source: any;
  style?: any;
  loop?: boolean;
  muted?: boolean;
  autoPlay?: boolean;
  contentFit?: 'contain' | 'cover' | 'fill';
  fallbackColor?: string;
  onLoad?: () => void;
  onError?: (error: any) => void;
  onVideoEnd?: () => void;
  onVolumeStateChange?: (isMuted: boolean) => void;
  renderVolumeButton?: (isMuted: boolean, toggleVolume: () => void) => React.ReactNode;
  exposeVolumeToggle?: (toggleFn: () => void) => void;
}

export default function LevelVideoPlayer({
  source,
  style,
  loop = false,
  muted = false,
  autoPlay = true,
  contentFit = 'cover',
  fallbackColor = '#000',
  onLoad,
  onError,
  onVideoEnd,
  onVolumeStateChange,
  renderVolumeButton,
  exposeVolumeToggle
}: LevelVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(true);
  const [hasEnded, setHasEnded] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Start muted for better autoplay
  
  // Move useVideoPlayer to top level - hooks must be called at the top level
  const player = useVideoPlayer(source, (player) => {
    player.loop = loop;
    player.muted = true; // Always start muted for autoplay
    console.log('🎬 Player initialized with muted=true for autoplay');
  });
  
  // Memoize callbacks to prevent useEffect from running repeatedly
  const stableOnLoad = React.useCallback(() => {
    onLoad?.();
  }, [onLoad]);
  
  const stableOnError = React.useCallback((error: any) => {
    onError?.(error);
  }, [onError]);
  
     const stableOnVideoEnd = React.useCallback(() => {
     console.log('🎬 stableOnVideoEnd called - triggering level transition');
     onVideoEnd?.();
   }, [onVideoEnd]);

  // Reset hasEnded when source changes
  React.useEffect(() => {
    setHasEnded(false);
  }, [source]);
  
  // Attempt autoplay immediately on mount
  React.useEffect(() => {
    if (autoPlay && player) {
      console.log('🚀 Attempting immediate autoplay on mount');
      const attemptImmediateAutoplay = async () => {
        try {
          player.muted = true;
          setIsMuted(true);
          await player.play();
          setIsPlaying(true);
          setShowPlayButton(false);
          console.log('✅ Immediate autoplay succeeded!');
          
          // Set an 8-second timer for level transition
          if (!loop) {
            setTimeout(() => {
              if (!hasEnded) {
                console.log('🎮 8-second timer expired - transitioning to level');
                setHasEnded(true);
                stableOnVideoEnd();
              }
            }, 8000);
          }
        } catch (error) {
          console.log('⚠️ Immediate autoplay failed, will retry on load');
        }
      };
      
      // Try after a very short delay to ensure player is ready
      setTimeout(attemptImmediateAutoplay, 100);
    }
  }, []); // Run only once when component mounts
  
     // Set up event listeners - only depend on source to prevent multiple instances
   React.useEffect(() => {
     console.log('🎬 LevelVideoPlayer: Setting up player for source:', source);
     
     // Add multiple fallback timeouts to ensure video end is detected
     let fallbackTimeout: NodeJS.Timeout | null = null;
     let emergencyTimeout: NodeJS.Timeout | null = null;
    
    // Single combined status listener
    const statusUnsubscribe = player.addListener('statusChange', (status) => {
      console.log('🎬 LevelVideoPlayer: Status change:', JSON.stringify(status, null, 2));
      
              if ((status as any).isLoaded) {
          console.log('✅ LevelVideoPlayer: Video loaded');
          stableOnLoad();
          
          // Set emergency timeout as soon as video is loaded
          if (!emergencyTimeout && !loop) {
            console.log('🚨 Setting emergency timeout for video end (6 seconds)');
            emergencyTimeout = setTimeout(() => {
              console.log('🚨 Emergency timeout reached - forcing level transition');
              if (!hasEnded) {
                setHasEnded(true);
                console.log('🎯 Calling stableOnVideoEnd from emergency timeout');
                stableOnVideoEnd();
              }
            }, 15000); // 15 second emergency backup
          }
        
        if (autoPlay) {
          // Aggressive muted autoplay (should always work)
          const attemptAutoplay = async () => {
            try {
              player.muted = true; // Ensure muted for autoplay
              await player.play();
              setIsPlaying(true);
              setShowPlayButton(false);
              console.log('▶️ LevelVideoPlayer: Muted autoplay succeeded');
              console.log('🎮 UI State: showPlayButton=false, volume button should be visible');
              
              // Set an 8-second timer for level transition
              if (!loop && !hasEnded) {
                setTimeout(() => {
                  if (!hasEnded) {
                    console.log('🎮 5-second timer expired - transitioning to level');
                    setHasEnded(true);
                    stableOnVideoEnd();
                  }
                }, 5000);
              }
            } catch (error) {
              console.log('⚠️ Even muted autoplay failed, showing play button');
              setShowPlayButton(true);
            }
          };
          
          setTimeout(attemptAutoplay, 50); // Faster autoplay attempt
        }
      }
      
             // Track playing state and set fallback timeout
       if ((status as any).isPlaying !== undefined) {
         const playing = (status as any).isPlaying;
         console.log('🎮 Video playing state changed:', { playing });
         setIsPlaying(playing);
         if (playing) {
           console.log('▶️ Video is now playing - hiding play button');
           setShowPlayButton(false);
           // Set fallback timeout when video starts playing
           if (!fallbackTimeout && !loop) {
             console.log('🕐 Setting fallback timeout for video end detection (4 seconds)');
             fallbackTimeout = setTimeout(() => {
               console.log('🏁 LevelVideoPlayer: Video ended (fallback timeout - 4 seconds reached)');
               if (!hasEnded) {
                 setHasEnded(true);
                 console.log('🎯 Calling stableOnVideoEnd to trigger level transition');
                 stableOnVideoEnd();
               } else {
                 console.log('⚠️ Video already ended, skipping duplicate end call');
               }
             }, 10000); // 10 second timeout
           }
         }
       }
      
      if (status.error) {
        console.error('❌ LevelVideoPlayer: Error:', status.error);
        stableOnError(status.error);
      }
      
      // Also check for video end via status
      if ((status as any).didJustFinish && !hasEnded) {
        console.log('🏁 LevelVideoPlayer: Video ended (didJustFinish)');
        setHasEnded(true);
        stableOnVideoEnd();
      }
    });
    
    // Add time update listener for end detection
    const timeUnsubscribe = player.addListener('timeUpdate', (timeUpdate) => {
      console.log('⏰ TimeUpdate received:', { 
        currentTime: timeUpdate.currentTime, 
        duration: timeUpdate.duration,
        hasValues: !!(timeUpdate.currentTime && timeUpdate.duration)
      });
      
      if (timeUpdate.currentTime && timeUpdate.duration) {
        const progress = timeUpdate.currentTime / timeUpdate.duration;
        
        // Log progress every 20% for cleaner logs
        if (Math.floor(progress * 5) !== Math.floor((progress - 0.01) * 5)) {
          console.log(`⏱️ Video progress: ${Math.round(progress * 100)}% (${timeUpdate.currentTime.toFixed(1)}s / ${timeUpdate.duration.toFixed(1)}s)`);
        }
        
        // Trigger end at 75% (even earlier) - better UX
        if (progress >= 0.75 && !loop && !hasEnded) {
          console.log('🏁 LevelVideoPlayer: Video ended (progress-based detection at 75%)', { 
            progress: Math.round(progress * 100) + '%',
            currentTime: timeUpdate.currentTime.toFixed(1),
            duration: timeUpdate.duration.toFixed(1)
          });
          setHasEnded(true);
          console.log('🎯 Calling stableOnVideoEnd from progress detection');
          stableOnVideoEnd();
        }
      } else {
        console.log('⚠️ TimeUpdate missing currentTime or duration');
      }
    });
    
    // Cleanup function
    return () => {
      statusUnsubscribe?.remove?.();
      timeUnsubscribe?.remove?.();
      if (fallbackTimeout) {
        clearTimeout(fallbackTimeout);
      }
      if (emergencyTimeout) {
        clearTimeout(emergencyTimeout);
      }
    };
  }, [source]); // Only depend on source

  const handleVolumeToggle = () => {
    console.log('🔊 Volume button pressed! Current muted state:', isMuted);
    const newMuted = !isMuted;
    player.muted = newMuted;
    setIsMuted(newMuted);
    console.log(newMuted ? '🔇 Video muted by user' : '🔊 Video unmuted by user');
    onVolumeStateChange?.(newMuted);
  };
  
  // Expose the volume toggle function
  React.useEffect(() => {
    exposeVolumeToggle?.(handleVolumeToggle);
  }, [exposeVolumeToggle, isMuted]);

  const handlePlayPause = async () => {
    console.log('🎯 LevelVideoPlayer: handlePlayPause called', { isPlaying, showPlayButton });
    
    try {
      if (isPlaying) {
        console.log('⏸️ LevelVideoPlayer: Attempting to pause...');
        await player.pause();
        setIsPlaying(false);
        setShowPlayButton(true);
        console.log('⏸️ LevelVideoPlayer: Paused by user');
      } else {
                 console.log('▶️ LevelVideoPlayer: Attempting to play...');
         
         // Try multiple strategies for manual play
         try {
           // Strategy 1: Normal play (start muted for consistency)
           player.muted = true; // Start muted
           setIsMuted(true);
           await player.play();
           setIsPlaying(true);
           setShowPlayButton(false);
           console.log('▶️ LevelVideoPlayer: Normal play succeeded (started muted)');
           console.log('🎮 UI State: showPlayButton=false, volume button should be visible');
           
           // Set a quick transition timer for level videos
           if (!loop && !hasEnded) {
             console.log('⏰ Setting 5-second timer for level transition after manual play');
             setTimeout(() => {
               if (!hasEnded) {
                 console.log('🎮 Timer expired - transitioning to level');
                 setHasEnded(true);
                 stableOnVideoEnd();
               }
             }, 5000); // 5 seconds for manual play
           }
           return;
        } catch (error1) {
          console.log('⚠️ Normal manual play failed:', error1);
        }
        
        // Strategy 2: Muted play with unmute
        try {
          const originalMuted = player.muted;
          console.log('🔇 Trying muted play as fallback...');
          player.muted = true;
          await player.play();
                     setIsPlaying(true);
           setShowPlayButton(false);
           console.log('▶️ LevelVideoPlayer: Muted play succeeded');
           
           // Set a quick transition timer for level videos
           if (!loop && !hasEnded) {
             console.log('⏰ Setting 5-second timer for level transition after muted play');
             setTimeout(() => {
               if (!hasEnded) {
                 console.log('🎮 Timer expired - transitioning to level');
                 setHasEnded(true);
                 stableOnVideoEnd();
               }
             }, 5000); // 5 seconds for muted play
           }
           
           // User can manually unmute with volume button
           return;
        } catch (error2) {
          console.log('⚠️ Muted manual play failed:', error2);
          player.muted = muted; // Reset to original
        }
        
        console.error('❌ All manual play strategies failed');
      }
    } catch (error) {
      console.error('❌ LevelVideoPlayer: Unexpected error in handlePlayPause:', error);
    }
  };

  return (
    <View style={[style, { backgroundColor: fallbackColor }]}>
      <VideoView
        style={style}
        player={player}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        nativeControls={false}
        contentFit={contentFit}
        // Enhanced quality settings
        pointerEvents="auto"
        // Force higher quality rendering
        allowsVideoFrameMetadataCollection={false}
        contentInsetAdjustmentBehavior="never"
      />
      
      {/* Play button overlay - always show until video is playing */}
      {showPlayButton && (
        <TouchableOpacity
          onPress={() => {
            console.log('🎯 Play button pressed!');
            handlePlayPause();
          }}
          onPressIn={() => console.log('🎯 Play button press started')}
          onPressOut={() => console.log('🎯 Play button press ended')}
          activeOpacity={0.8}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: -50,
            marginLeft: -50,
            backgroundColor: 'rgba(0,0,0,0.8)',
            borderRadius: 50,
            width: 100,
            height: 100,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
            borderWidth: 3,
            borderColor: 'rgba(255,255,255,0.8)'
          }}
        >
          <Ionicons 
            name="play" 
            size={50} 
            color="#fff" 
            style={{ marginLeft: 6 }}
          />
        </TouchableOpacity>
      )}
      
      {/* Custom volume button renderer */}
      {renderVolumeButton && !showPlayButton && renderVolumeButton(isMuted, handleVolumeToggle)}

    </View>
  );
}
