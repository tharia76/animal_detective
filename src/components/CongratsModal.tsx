import React, { useRef, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  Modal, 
  Animated,
  useWindowDimensions,
  Platform,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDynamicStyles } from '../styles/styles';
import { Ionicons } from '@expo/vector-icons';

interface CongratsModalProps {
  showCongratsModal: boolean;
  startOver: () => void;
  goToHome: () => void;
}

const CongratsModal: React.FC<CongratsModalProps> = ({ 
  showCongratsModal, 
  startOver, 
  goToHome 
}) => {
  // 1️⃣ Hoist your hook: only call it once, at the top level
  const dynamicStyles = useDynamicStyles();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const isLandscape = screenW > screenH;
  const isMobile = Math.min(screenW, screenH) < 768;

  // Create refs for animations
  const modalScale = useRef(new Animated.Value(0)).current;
  const titleBounce = useRef(new Animated.Value(0)).current;
  const buttonBounce1 = useRef(new Animated.Value(0)).current;
  const buttonBounce2 = useRef(new Animated.Value(0)).current;

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
    }
  }, [showCongratsModal, modalScale, titleBounce, buttonBounce1, buttonBounce2]);

  return (
    <Modal
      visible={showCongratsModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => { /* Prevent accidental close */ }}
      supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
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
            width: isLandscape ? '90%' : '85%',
            maxWidth: isLandscape ? screenW * 0.95 : 500,
            marginVertical: isMobile && isLandscape ? 10 : 0,
            alignSelf: 'center',
          }}>
          <LinearGradient
            colors={['#FF6B9D', '#C44569', '#F8B500', '#FF6B9D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              padding: 25,
              borderRadius: 25,
              alignItems: 'center',
              elevation: 10,
              shadowColor: '#FF6B9D',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 15,
              overflow: 'hidden',
            }}
          >
            {/* Inner white container */}
            <View style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: isLandscape ? 20 : 30,
              borderRadius: 20,
              alignItems: 'center',
              width: '100%',
              position: 'relative',
              flexDirection: 'column',
              minHeight: isLandscape ? 180 : 'auto',
              maxHeight: isLandscape ? screenH * 0.7 : undefined,
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
                  marginBottom: isLandscape ? 3 : 8,
                }}>
                  <Text style={{ 
                    fontSize: isLandscape ? 22 : 28, 
                    fontWeight: 'bold', 
                    color: '#FF9800',
                    textAlign: 'center',
                    textShadowColor: 'rgba(255, 152, 0, 0.3)',
                    textShadowOffset: { width: 1, height: 1 },
                    textShadowRadius: 3,
                  }}>
                    Congratulations!
                  </Text>
                </Animated.View>

                {/* Cat image under title */}
                <Image 
                  source={require('../assets/images/congrats.png')} 
                  style={{ 
                    width: isLandscape ? 70 : 100, 
                    height: isLandscape ? 70 : 100, 
                    marginBottom: isLandscape ? 8 : 15, 
                    zIndex: 1,
                    borderRadius: 12,
                  }} 
                />

                <Text style={{ 
                  fontSize: isLandscape ? 14 : 18, 
                  textAlign: 'center', 
                  marginBottom: isLandscape ? 18 : 25, 
                  zIndex: 1,
                  color: '#666',
                  fontWeight: '600',
                  lineHeight: isLandscape ? 18 : 24,
                }}>
                  You've seen all the animals in this level!
                </Text>

                {/* Modal Buttons */}
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  width: '100%', 
                  zIndex: 1,
                  gap: isLandscape ? 25 : 30,
                  marginTop: isLandscape ? 5 : 0,
                }}>
                <Animated.View style={{
                  transform: [{ scale: buttonBounce1 }],
                  flex: 1,
                }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#4CAF50',
                      padding: isLandscape ? 16 : 20,
                      borderRadius: isLandscape ? 16 : 20,
                      elevation: 5,
                      shadowColor: '#4CAF50',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: isLandscape ? 60 : 70,
                      minHeight: isLandscape ? 60 : 70,
                    }}
                    onPress={startOver}
                    activeOpacity={0.8}
                  >
                    <Ionicons 
                      name="refresh" 
                      size={isLandscape ? 28 : 32} 
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
                      padding: isLandscape ? 16 : 20,
                      borderRadius: isLandscape ? 16 : 20,
                      elevation: 5,
                      shadowColor: '#FF9800',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: isLandscape ? 60 : 70,
                      minHeight: isLandscape ? 60 : 70,
                    }}
                    onPress={goToHome}
                    activeOpacity={0.8}
                  >
                    <Ionicons 
                      name="home" 
                      size={isLandscape ? 28 : 32} 
                      color="white" 
                    />
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </View>
            </View>
          </LinearGradient>
        </Animated.View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default CongratsModal;