import React, { useRef, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  Modal, 
  Animated,
  useWindowDimensions,
  ScrollView
} from 'react-native';

import { useDynamicStyles } from '../styles/styles';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../hooks/useLocalization';
import { createAudioPlayer } from 'expo-audio';
import { useLevelCompletion } from '../hooks/useLevelCompletion';

interface CongratsModalProps {
  showCongratsModal: boolean;
  startOver: () => void;
  goToHome: () => void;
  levelName?: string; // Add levelName prop to track which level was completed
}



const CongratsModal: React.FC<CongratsModalProps> = ({ 
  showCongratsModal, 
  startOver, 
  goToHome,
  levelName
}) => {
  const dynamicStyles = useDynamicStyles();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const isLandscape = screenW > screenH;
  const isMobile = Math.min(screenW, screenH) < 768;
  const isTablet = Math.min(screenW, screenH) >= 768 && Math.max(screenW, screenH) >= 1024;
  const { t, lang } = useLocalization();
  const { markLevelCompleted } = useLevelCompletion();

  // Create refs for animations
  const modalScale = useRef(new Animated.Value(0)).current;
  const titleBounce = useRef(new Animated.Value(0)).current;
  const buttonBounce1 = useRef(new Animated.Value(0)).current;
  const buttonBounce2 = useRef(new Animated.Value(0)).current;

  // Create ref for yay sound
  const yaySoundRef = useRef<any>(null);

  // Balloon system
  const [balloons, setBalloons] = useState<Array<{
    id: number;
    x: number;
    y: number;
    targetY: number;
    color: string;
    source: any;
    animValue: Animated.Value;
    popAnimValue: Animated.Value;
    visible: boolean;
    isPopping: boolean;
  }>>([]);
  const balloonIdRef = useRef(0);

  // 6 positions scattered around the entire modal
  // All targetY values keep balloons high in container (never below)
  const modalWidth = screenW * 0.9; // Use 90% of screen width
  const margin = 50; // Margin from edges
  
  const balloonPositions = [
    { x: margin, targetY: -10 },                    // Far left - very high
    { x: modalWidth * 0.25, targetY: 30 },          // Left quarter - high
    { x: modalWidth * 0.45, targetY: 0 },           // Center left - very high
    { x: modalWidth * 0.65, targetY: 50 },          // Center right - high
    { x: modalWidth * 0.85, targetY: 20 },          // Right quarter - very high
    { x: modalWidth - margin, targetY: 70 },        // Far right - high
  ];

  // Function to create a single balloon
  const createSingleBalloon = (index: number, balloonArray: any[]) => {
    const balloonAssets = [
      { color: 'pink', source: require('../assets/balloons/pink_balloon.png') },
      { color: 'blue', source: require('../assets/balloons/blue_balloon.png') },
      { color: 'green', source: require('../assets/balloons/green_balloon.png') },
      { color: 'orange', source: require('../assets/balloons/orange_balloon.png') },
    ];

    const id = balloonIdRef.current++;
    const balloonAsset = balloonAssets[index % balloonAssets.length]; // Cycle through colors
    const startY = screenH + 150; // Start well below screen
    const position = balloonPositions[index % balloonPositions.length];
    
    const balloon = {
      id,
      x: position.x,
      y: startY,
      targetY: position.targetY,
      color: balloonAsset.color,
      source: balloonAsset.source,
      animValue: new Animated.Value(0),
      popAnimValue: new Animated.Value(0),
      visible: true,
      isPopping: false,
    };
    balloonArray.push(balloon);
    
    // Start balloon animation with staggered timing
    setTimeout(() => {
      Animated.timing(balloon.animValue, {
        toValue: 1,
        duration: 5000 + (index * 500), // Different speeds
        useNativeDriver: true,
      }).start();
    }, index * 800); // Start every 800ms
  };

  // Balloon functions
  const generateBalloons = () => {
    const balloonAssets = [
      { color: 'pink', source: require('../assets/balloons/pink_balloon.png') },
      { color: 'blue', source: require('../assets/balloons/blue_balloon.png') },
      { color: 'green', source: require('../assets/balloons/green_balloon.png') },
      { color: 'orange', source: require('../assets/balloons/orange_balloon.png') },
    ];

    const newBalloons: Array<{
      id: number;
      x: number;
      y: number;
      targetY: number;
      color: string;
      source: any;
      animValue: Animated.Value;
      popAnimValue: Animated.Value;
      visible: boolean;
      isPopping: boolean;
    }> = [];
    
    // Create exactly 6 balloons with good spacing for 200x200 size (3 per side)
    for (let i = 0; i < 6; i++) {
      const id = balloonIdRef.current++;
      const balloonAsset = balloonAssets[i % balloonAssets.length];
      const position = balloonPositions[i];
      const startY = screenH + 150;
      
      const balloon = {
        id,
        x: position.x,
        y: startY,
        targetY: position.targetY,
        color: balloonAsset.color,
        source: balloonAsset.source,
        animValue: new Animated.Value(0),
        popAnimValue: new Animated.Value(0),
        visible: true,
        isPopping: false,
      };
      
      newBalloons.push(balloon);
      
      // Start each balloon animation with staggered timing
      setTimeout(() => {
        Animated.timing(balloon.animValue, {
          toValue: 1,
          duration: 4000 + (i * 200), // Slightly different speeds
          useNativeDriver: true,
        }).start();
      }, i * 400); // Start each balloon 400ms apart (faster for more balloons)
    }
    
    setBalloons(newBalloons);
  };

  const popBalloon = (balloonId: number) => {
    setBalloons(prev => 
      prev.map(balloon => {
        if (balloon.id === balloonId && !balloon.isPopping) {
          // Play balloon pop sound
          try {
            const popPlayer = createAudioPlayer(require('../assets/sounds/other/balloon-pop.mp3'));
            popPlayer.play();
            
            // Clean up sound when it finishes
            popPlayer.addListener('playbackStatusUpdate', (status: any) => {
              if (status.didJustFinish) {
                popPlayer.remove();
              }
            });
          } catch (error) {
            console.warn('Error playing balloon pop sound:', error);
          }

          // Start pop animation
          Animated.timing(balloon.popAnimValue, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            // Remove balloon after animation
            setBalloons(current => current.filter(b => b.id !== balloonId));
            
            // Schedule new balloon creation outside of state update
            setTimeout(() => {
              generateNewBalloon();
            }, 1000);
          });
          return { ...balloon, isPopping: true };
        }
        return balloon;
      })
    );
  };

  const generateNewBalloon = () => {
    const balloonAssets = [
      { color: 'pink', source: require('../assets/balloons/pink_balloon.png') },
      { color: 'blue', source: require('../assets/balloons/blue_balloon.png') },
      { color: 'green', source: require('../assets/balloons/green_balloon.png') },
      { color: 'orange', source: require('../assets/balloons/orange_balloon.png') },
    ];

    const id = balloonIdRef.current++;
    const balloonAsset = balloonAssets[Math.floor(Math.random() * balloonAssets.length)];
    const position = balloonPositions[Math.floor(Math.random() * balloonPositions.length)];
    const startY = screenH + 150;
    
    const newBalloon = {
      id,
      x: position.x,
      y: startY,
      targetY: position.targetY,
      color: balloonAsset.color,
      source: balloonAsset.source,
      animValue: new Animated.Value(0),
      popAnimValue: new Animated.Value(0),
      visible: true,
      isPopping: false,
    };

    setBalloons(prev => [...prev, newBalloon]);

    // Start animation
    Animated.timing(newBalloon.animValue, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: true,
    }).start();
  };

  // Start animations when modal is shown
  useEffect(() => {
    if (showCongratsModal) {
      // Mark level as completed when congrats modal shows
      if (levelName) {
        markLevelCompleted(levelName).catch(error => {
          console.warn('Error marking level as completed:', error);
        });
      }

      // Play yay sound when modal opens
      try {
        const yayPlayer = createAudioPlayer(require('../assets/sounds/other/yay.mp3'));
        yaySoundRef.current = yayPlayer;
        yayPlayer.play();
        
        // Clean up sound when it finishes
        yayPlayer.addListener('playbackStatusUpdate', (status: any) => {
          if (status.didJustFinish) {
            yayPlayer.remove();
            if (yaySoundRef.current === yayPlayer) {
              yaySoundRef.current = null;
            }
          }
        });
      } catch (error) {
        console.warn('Error playing yay sound:', error);
      }

      // Modal entrance animation
      Animated.spring(modalScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      // Title bounce animation
      Animated.sequence([
        Animated.delay(300),
        Animated.spring(titleBounce, {
          toValue: 1,
          tension: 100,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();

      // Button bounce animations
      Animated.sequence([
        Animated.delay(600),
        Animated.spring(buttonBounce1, {
          toValue: 1,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.sequence([
        Animated.delay(800),
        Animated.spring(buttonBounce2, {
          toValue: 1,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();

      // Start balloon generation
      generateBalloons();
    } else {
      // Reset animations when modal is hidden
      modalScale.setValue(0);
      titleBounce.setValue(0);
      buttonBounce1.setValue(0);
      buttonBounce2.setValue(0);
      
      // Clear balloons
      setBalloons([]);
      
      // Stop and clean up yay sound
      if (yaySoundRef.current) {
        try {
          yaySoundRef.current.pause();
          yaySoundRef.current.remove();
          yaySoundRef.current = null;
        } catch (error) {
          console.warn('Error stopping yay sound:', error);
        }
      }
    }
  }, [showCongratsModal, modalScale, titleBounce, buttonBounce1, buttonBounce2]);

  // Cleanup sound on component unmount
  useEffect(() => {
    return () => {
      if (yaySoundRef.current) {
        try {
          yaySoundRef.current.pause();
          yaySoundRef.current.remove();
          yaySoundRef.current = null;
        } catch (error) {
          console.warn('Error cleaning up yay sound on unmount:', error);
        }
      }
    };
  }, []);



  return (
    <>
      {/* Congrats Modal */}
      {showCongratsModal && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => { /* Prevent accidental close */ }}
          supportedOrientations={['landscape', 'landscape-left', 'landscape-right']}
          presentationStyle="overFullScreen"
        >
      <View style={{
        flex: 1,
        justifyContent: isLandscape ? 'flex-start' : 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        width: screenW,
        height: screenH,
        paddingTop: isLandscape ? Math.max(screenH * 0.1, 20) : 0,
        paddingBottom: isLandscape ? 20 : 0,
      }}>
        {/* Modal Content */}
        <ScrollView 
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: isLandscape ? 'flex-start' : 'center',
            alignItems: 'center',
            minHeight: isLandscape ? undefined : '100%',
            paddingVertical: isLandscape ? 10 : 40,
            paddingHorizontal: 20,
          }}
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
          style={{ 
            maxHeight: isLandscape ? screenH * 0.8 : '100%',
            width: '100%'
          }}
        >
          <Animated.View style={{
            transform: [{ scale: modalScale }],
            width: isTablet ? '70%' : isLandscape ? '75%' : '65%', // Much smaller width
            maxWidth: isTablet ? screenW * 0.7 : isLandscape ? screenW * 0.75 : screenW * 0.65, // Much smaller max width
            marginVertical: isMobile && isLandscape ? 5 : 0,
            alignSelf: 'center',
          }}>
          <View
            style={{
              padding: isTablet ? 30 : isLandscape ? 20 : 10, // Much smaller padding
              borderRadius: isTablet ? 40 : 30, // Slightly more rounded
              alignItems: 'center',
              backgroundColor: '#FFFFFF', // White background instead of gradient
              elevation: 15, // More elevation for prominence
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 12 }, // Larger shadow
              shadowOpacity: 0.3,
              shadowRadius: 20,
              overflow: 'hidden',
            }}
          >
            {/* Inner white container */}
            <View style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: isTablet ? 25 : isLandscape ? 15 : 10, // Much smaller inner padding
              borderRadius: isTablet ? 35 : 25, // Larger border radius
              alignItems: 'center',
              width: '100%',
              position: 'relative',
              flexDirection: 'column',
              minHeight: isTablet ? 300 : isLandscape ? 200 : 150, // Much shorter minimum height
              maxHeight: isLandscape ? screenH * 0.6 : isMobile ? screenH * 0.5 : undefined, // Much shorter max height
              justifyContent: 'center',
            }}>
              {/* Balloon Container - Full Modal Coverage */}
              <View style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0,
                width: '100%',
                height: '100%',
              }}>
                                  {balloons.map((balloon) => {
                    if (!balloon.visible) return null;
                  
                  const translateY = balloon.animValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [balloon.y, balloon.targetY],
                  });

                  const riseScale = balloon.animValue.interpolate({
                    inputRange: [0, 0.1, 1],
                    outputRange: [0, 1, 1],
                  });

                  // Pop effect animations
                  const popScale = balloon.popAnimValue.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 1.8, 0.1],
                  });

                  const popOpacity = balloon.popAnimValue.interpolate({
                    inputRange: [0, 0.3, 1],
                    outputRange: [1, 1, 0],
                  });

                  const finalScale = balloon.isPopping ? popScale : riseScale;

                  return (
                    <TouchableOpacity
                      key={balloon.id}
                      onPress={() => popBalloon(balloon.id)}
                      style={{
                        position: 'absolute',
                        left: balloon.x,
                        zIndex: 1000,
                      }}
                      activeOpacity={0.8}
                      disabled={balloon.isPopping}
                    >
                      <Animated.Image
                        source={balloon.source}
                        style={{
                          width: 200,
                          height: 200,
                          transform: [{ translateY }, { scale: finalScale }],
                          opacity: balloon.isPopping ? popOpacity : 1,
                        }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Centered content */}
              <View style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
              }}>
                {/* Title with bounce animation */}
                <Animated.View style={{
                  transform: [{ scale: titleBounce }],
                  marginBottom: isTablet ? 20 : isLandscape ? 8 : 8, // Smaller margin for phones
                }}>
                  <Text style={{ 
                    fontSize: isTablet ? 48 : isLandscape ? 28 : 28, // Smaller text for phones
                    fontWeight: 'bold', 
                    color: '#FF9800',
                    textAlign: 'center',
                    textShadowColor: 'rgba(255, 152, 0, 0.4)',
                    textShadowOffset: { width: 2, height: 2 },
                    textShadowRadius: 4,
                  }}>
                    {t('congratulations')}
                  </Text>
                </Animated.View>

                {/* Cat image under title */}
                <Image 
                  source={require('../assets/images/congrats.png')} 
                  style={{ 
                    width: isTablet ? 180 : isLandscape ? 90 : 80, // Even smaller image for phones
                    height: isTablet ? 180 : isLandscape ? 90 : 80, 
                    marginBottom: isTablet ? 30 : isLandscape ? 12 : 10, // Smaller margin for phones
                    zIndex: 1,
                    borderRadius: isTablet ? 25 : 15,
                  }} 
                />

                <Text style={{ 
                  fontSize: isTablet ? 28 : isLandscape ? 18 : 16, // Even smaller subtitle text for phones
                  textAlign: 'center', 
                  marginBottom: isTablet ? 40 : isLandscape ? 22 : 15, // Smaller margin for phones
                  zIndex: 1,
                  color: '#666',
                  fontWeight: '600',
                  lineHeight: isTablet ? 36 : isLandscape ? 22 : 20,
                }}>
                  {t('youveSeenAllAnimals')}
                </Text>

                {/* Modal Buttons */}
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  width: '100%', 
                  zIndex: 1,
                  gap: isTablet ? 50 : isLandscape ? 35 : 20, // Even smaller gap between buttons for phones
                  marginTop: isTablet ? 15 : isLandscape ? 10 : 0, // No top margin for phones
                }}>
                <Animated.View style={{
                  transform: [{ scale: buttonBounce1 }],
                  flex: 1,
                }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#4CAF50',
                      padding: isTablet ? 30 : isLandscape ? 20 : 15, // Even smaller padding for phones
                      borderRadius: isTablet ? 30 : isLandscape ? 20 : 18, // Smaller border radius
                      elevation: 8, // More elevation
                      shadowColor: '#4CAF50',
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.4,
                      shadowRadius: 10,
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: isTablet ? 110 : isLandscape ? 80 : 60, // Even smaller minimum sizes for phones
                      minHeight: isTablet ? 110 : isLandscape ? 80 : 60,
                    }}
                    onPress={startOver}
                    activeOpacity={0.8}
                  >
                    <Ionicons 
                      name="refresh" 
                      size={isTablet ? 50 : isLandscape ? 35 : 25} // Even smaller icons for phones
                      color="white" 
                    />
                  </TouchableOpacity>
                </Animated.View>

                <Animated.View style={{
                  transform: [{ scale: buttonBounce2 }],
                  flex: 1,
                }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#FF9800',
                      padding: isTablet ? 30 : isLandscape ? 20 : 15, // Even smaller padding for phones
                      borderRadius: isTablet ? 30 : isLandscape ? 20 : 18, // Smaller border radius
                      elevation: 8, // More elevation
                      shadowColor: '#FF9800',
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.4,
                      shadowRadius: 10,
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: isTablet ? 110 : isLandscape ? 80 : 60, // Even smaller minimum sizes for phones
                      minHeight: isTablet ? 110 : isLandscape ? 80 : 60,
                    }}
                    onPress={goToHome}
                    activeOpacity={0.8}
                  >
                    <Ionicons 
                      name="home" 
                      size={isTablet ? 50 : isLandscape ? 35 : 25} // Even smaller icons for phones
                      color="white" 
                    />
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </View>
            </View>
          </View>
        </Animated.View>
        </ScrollView>
      </View>
        </Modal>
      )}
    </>
  );
};

export default CongratsModal;