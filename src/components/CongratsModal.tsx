import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  Modal, 
  Animated,
  Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
  // Use simpler animations on mobile
  const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
  
  // Only use animations on web
  const modalScale = useRef(new Animated.Value(isMobile ? 1 : 0)).current;
  const titleBounce = useRef(new Animated.Value(isMobile ? 1 : 0)).current;
  const buttonBounce1 = useRef(new Animated.Value(isMobile ? 1 : 0)).current;
  const buttonBounce2 = useRef(new Animated.Value(isMobile ? 1 : 0)).current;

  // Start animations when modal is shown (only on web)
  useEffect(() => {
    if (showCongratsModal && !isMobile) {
      // Simple modal entrance animation
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
    } else if (!showCongratsModal && !isMobile) {
      // Reset animations when modal is hidden
      modalScale.setValue(0);
      titleBounce.setValue(0);
      buttonBounce1.setValue(0);
      buttonBounce2.setValue(0);
    }
  }, [showCongratsModal, isMobile, modalScale, titleBounce, buttonBounce1, buttonBounce2]);

  // Render simple modal for mobile
  if (isMobile) {
    if (!showCongratsModal) return null;
    
    return (
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 9999,
      }}>
        {/* Simple modal content for mobile */}
        <View style={{
          width: '85%',
          maxWidth: 400,
          backgroundColor: 'white',
          padding: 30,
          borderRadius: 20,
          alignItems: 'center',
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}>
          <Text style={{ 
            fontSize: 28, 
            fontWeight: 'bold', 
            color: '#FF6B9D',
            textAlign: 'center',
            marginBottom: 20,
          }}>
            Congratulations!
          </Text>

          <Text style={{ fontSize: 50, marginBottom: 15 }}>
            🏆
          </Text>

          <Text style={{ 
            fontSize: 18, 
            textAlign: 'center', 
            marginBottom: 30, 
            color: '#666',
            fontWeight: '600',
          }}>
            You've seen all the animals in this level!
          </Text>

          {/* Simple buttons */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-around', 
            width: '100%', 
            gap: 15,
          }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: '#4CAF50',
                paddingVertical: 15,
                paddingHorizontal: 20,
                borderRadius: 15,
              }}
              onPress={startOver}
              activeOpacity={0.8}
            >
              <Text style={{ 
                color: 'white', 
                fontSize: 16, 
                fontWeight: 'bold',
                textAlign: 'center',
              }}>
                Start Over
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: '#FF9800',
                paddingVertical: 15,
                paddingHorizontal: 20,
                borderRadius: 15,
              }}
              onPress={goToHome}
              activeOpacity={0.8}
            >
              <Text style={{ 
                color: 'white', 
                fontSize: 16, 
                fontWeight: 'bold',
                textAlign: 'center',
              }}>
                Menu
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Render full animated modal for web
  return (
    <Modal
      visible={showCongratsModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => { /* Prevent accidental close */ }}
    >
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)'
      }}>
        {/* Modal Content */}
        <Animated.View style={{
          transform: [{ scale: modalScale }],
          width: '85%',
          maxWidth: 400,
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
              padding: 30,
              borderRadius: 20,
              alignItems: 'center',
              width: '100%',
              position: 'relative',
            }}>
              {/* Title with bounce animation */}
              <Animated.View style={{
                transform: [{ scale: titleBounce }],
                marginBottom: 20,
              }}>
                <Text style={{ 
                  fontSize: 32, 
                  fontWeight: 'bold', 
                  color: '#FF6B9D',
                  textAlign: 'center',
                  textShadowColor: 'rgba(255, 107, 157, 0.3)',
                  textShadowOffset: { width: 2, height: 2 },
                  textShadowRadius: 4,
                }}>
                  Congratulations!
                </Text>
              </Animated.View>

              {/* Trophy emoji */}
              <Text style={{ fontSize: 60, marginBottom: 15 }}>
                🏆
              </Text>

              <Image 
                source={require('../assets/images/congrats.png')} 
                style={{ 
                  width: 120, 
                  height: 120, 
                  marginBottom: 20, 
                  zIndex: 1,
                  borderRadius: 15,
                }} 
              />

              <Text style={{ 
                fontSize: 20, 
                textAlign: 'center', 
                marginBottom: 30, 
                zIndex: 1,
                color: '#666',
                fontWeight: '600',
                lineHeight: 28,
              }}>
                You've seen all the animals in this level!
              </Text>

              {/* Modal Buttons */}
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-around', 
                width: '100%', 
                zIndex: 1,
                gap: 15,
              }}>
                <Animated.View style={{
                  transform: [{ scale: buttonBounce1 }],
                  flex: 1,
                }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#4CAF50',
                      paddingVertical: 15,
                      paddingHorizontal: 20,
                      borderRadius: 15,
                      elevation: 5,
                      shadowColor: '#4CAF50',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                    }}
                    onPress={startOver}
                    activeOpacity={0.8}
                  >
                    <Text style={{ 
                      color: 'white', 
                      fontSize: 16, 
                      fontWeight: 'bold',
                      textAlign: 'center',
                    }}>
                      Start Over
                    </Text>
                  </TouchableOpacity>
                </Animated.View>

                <Animated.View style={{
                  transform: [{ scale: buttonBounce2 }],
                  flex: 1,
                }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#FF9800',
                      paddingVertical: 15,
                      paddingHorizontal: 20,
                      borderRadius: 15,
                      elevation: 5,
                      shadowColor: '#FF9800',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                    }}
                    onPress={goToHome}
                    activeOpacity={0.8}
                  >
                    <Text style={{ 
                      color: 'white', 
                      fontSize: 16, 
                      fontWeight: 'bold',
                      textAlign: 'center',
                    }}>
                      Menu
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default CongratsModal;