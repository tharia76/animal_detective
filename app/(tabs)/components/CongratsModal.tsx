import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  Modal, 
  Animated 
} from 'react-native';
import { styles } from '../../styles/styles';

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
  // Create refs for confetti animations
  const confettiCount = 30;
  const confettiAnimRefs = useRef(
    Array(confettiCount).fill(0).map(() => new Animated.Value(0))
  );

  // Start confetti animation when modal is shown
  useEffect(() => {
    if (showCongratsModal) {
      confettiAnimRefs.current.forEach((anim, index) => {
        Animated.timing(anim, {
          toValue: 1,
          duration: 2000 + Math.random() * 1000,
          useNativeDriver: true,
          delay: index * 50,
        }).start();
      });
    }
  }, [showCongratsModal]);

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
        backgroundColor: 'rgba(0,0,0,0.5)'
      }}>
        {/* Modal Content */}
        <View style={{
          backgroundColor: 'white',
          padding: 20,
          borderRadius: 10,
          alignItems: 'center',
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          overflow: 'hidden',
          width: '80%',
        }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 15 }}>
            Congratulations!
          </Text>

          {/* Confetti Container */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
            {confettiAnimRefs.current.map((animValue, index) => {
              const randomX = Math.random() * 300 - 150;
              const randomSize = 5 + Math.random() * 10;
              const randomColor = [
                '#FF4500', '#FFD700', '#00BFFF', '#FF69B4', '#32CD32',
                '#9370DB', '#FF6347', '#4682B4', '#FFA500', '#8A2BE2'
              ][Math.floor(Math.random() * 10)];

              const translateY = animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 300],
              });

              const translateX = animValue.interpolate({
                inputRange: [0, 0.3, 0.6, 1],
                outputRange: [0, randomX * 0.3, randomX * 0.6, randomX],
              });

              const rotate = animValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', `${Math.random() * 720 - 360}deg`],
              });

              const opacity = animValue.interpolate({
                inputRange: [0, 0.7, 1],
                outputRange: [1, 1, 0],
              });

              return (
                <Animated.View
                  key={index}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: 0,
                    width: randomSize,
                    height: randomSize,
                    backgroundColor: randomColor,
                    borderRadius: randomSize / 2,
                    transform: [
                      { translateX },
                      { translateY },
                      { rotate }
                    ],
                    opacity,
                  }}
                />
              );
            })}
          </View>

          <Image source={require('../../../assets/images/congrats.png')} style={{ width: 100, height: 100, marginBottom: 20, zIndex: 1 }} />

          <Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 25, zIndex: 1 }}>
            You've seen all the animals in this level!
          </Text>

          {/* Modal Buttons */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', zIndex: 1 }}>
            <TouchableOpacity
              style={{
                backgroundColor: '#4CAF50',
                paddingVertical: 12,
                paddingHorizontal: 25,
                borderRadius: 5,
              }}
              onPress={startOver}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Start Over</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: '#FF9800',
                paddingVertical: 12,
                paddingHorizontal: 25,
                borderRadius: 5,
              }}
              onPress={goToHome}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CongratsModal;