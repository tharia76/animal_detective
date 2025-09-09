import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface ParentalGateProps {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
}

type ChallengeType = 'math' | 'word' | 'hold';

const ParentalGate: React.FC<ParentalGateProps> = ({
  visible,
  onSuccess,
  onCancel,
  title = "Parental Permission Required",
  message = "Please complete this challenge to continue:"
}) => {
  const [challengeType, setChallengeType] = useState<ChallengeType>('math');
  const [userInput, setUserInput] = useState('');
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<{
    question: string;
    answer: string;
  } | null>(null);

  // Generate random math challenge
  const generateMathChallenge = useCallback(() => {
    const operations = ['+', '-', '×'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1: number, num2: number, answer: number, question: string;
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 20) + 10;
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = num1 - num2;
        question = `${num1} - ${num2}`;
        break;
      case '×':
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = num1 * num2;
        question = `${num1} × ${num2}`;
        break;
      default:
        num1 = 5;
        num2 = 3;
        answer = 8;
        question = '5 + 3';
    }
    
    return { question, answer: answer.toString() };
  }, []);

  // Generate random word challenge
  const generateWordChallenge = useCallback(() => {
    const words = ['SUN', 'MOON', 'STAR', 'TREE', 'BIRD', 'FISH', 'CAT', 'DOG', 'BEAR', 'LION'];
    const word = words[Math.floor(Math.random() * words.length)];
    return { question: `Type the word: ${word}`, answer: word };
  }, []);

  // Initialize challenge when modal opens
  React.useEffect(() => {
    if (visible) {
      setUserInput('');
      setHoldProgress(0);
      setIsHolding(false);
      
      if (challengeType === 'math') {
        setCurrentChallenge(generateMathChallenge());
      } else if (challengeType === 'word') {
        setCurrentChallenge(generateWordChallenge());
      }
    }
  }, [visible, challengeType, generateMathChallenge, generateWordChallenge]);

  // Handle math/word input submission
  const handleSubmit = useCallback(() => {
    if (!currentChallenge) return;
    
    if (userInput.trim().toUpperCase() === currentChallenge.answer.toUpperCase()) {
      onSuccess();
    } else {
      Alert.alert(
        'Incorrect Answer',
        'Please try again or ask a parent for help.',
        [{ text: 'Try Again', onPress: () => setUserInput('') }]
      );
    }
  }, [userInput, currentChallenge, onSuccess]);

  // Handle hold challenge
  const handleHoldStart = useCallback(() => {
    setIsHolding(true);
    setHoldProgress(0);
    
    const interval = setInterval(() => {
      setHoldProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          onSuccess();
          return 100;
        }
        return prev + 2; // 3 seconds total (100/2 = 50 intervals of ~60ms)
      });
    }, 60);
    
    // Store interval ID for cleanup
    (handleHoldStart as any).intervalId = interval;
  }, [onSuccess]);

  const handleHoldEnd = useCallback(() => {
    setIsHolding(false);
    setHoldProgress(0);
    if ((handleHoldStart as any).intervalId) {
      clearInterval((handleHoldStart as any).intervalId);
    }
  }, [handleHoldStart]);

  // Generate new challenge
  const generateNewChallenge = useCallback(() => {
    if (challengeType === 'math') {
      setCurrentChallenge(generateMathChallenge());
    } else if (challengeType === 'word') {
      setCurrentChallenge(generateWordChallenge());
    }
    setUserInput('');
  }, [challengeType, generateMathChallenge, generateWordChallenge]);

  const renderChallenge = () => {
    switch (challengeType) {
      case 'math':
      case 'word':
        return (
          <View style={styles.challengeContainer}>
            <Text style={styles.challengeQuestion}>
              {currentChallenge?.question}
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={userInput}
                onChangeText={setUserInput}
                placeholder="Your answer..."
                autoCapitalize="characters"
                autoCorrect={false}
                onSubmitEditing={handleSubmit}
                returnKeyType="done"
              />
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleSubmit}
                disabled={!userInput.trim()}
              >
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.newChallengeButton]}
                onPress={generateNewChallenge}
              >
                <Text style={styles.buttonText}>New Question</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      
      case 'hold':
        return (
          <View style={styles.challengeContainer}>
            <Text style={styles.challengeQuestion}>
              Hold the button for 3 seconds
            </Text>
            <View style={styles.holdContainer}>
              <TouchableOpacity
                style={[
                  styles.holdButton,
                  { opacity: isHolding ? 0.8 : 1 }
                ]}
                onPressIn={handleHoldStart}
                onPressOut={handleHoldEnd}
                activeOpacity={0.9}
              >
                <Text style={styles.holdButtonText}>
                  {isHolding ? 'Hold...' : 'Hold Me!'}
                </Text>
                {isHolding && (
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${holdProgress}%` }
                      ]} 
                    />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
      supportedOrientations={['landscape', 'landscape-left', 'landscape-right']}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#FFE4B5', '#FFDAB9', '#FFE4B5']}
            style={styles.gradientContainer}
          >
            <View style={styles.header}>
              <Ionicons name="shield-checkmark" size={32} color="#2B5E34" />
              <Text style={styles.title}>{title}</Text>
            </View>
            
            <Text style={styles.message}>{message}</Text>
            
            {/* Challenge Type Selector */}
            <View style={styles.challengeTypeContainer}>
              <Text style={styles.challengeTypeLabel}>Choose Challenge Type:</Text>
              <View style={styles.challengeTypeButtons}>
                <TouchableOpacity
                  style={[
                    styles.challengeTypeButton,
                    challengeType === 'math' && styles.challengeTypeButtonActive
                  ]}
                  onPress={() => setChallengeType('math')}
                >
                  <Text style={[
                    styles.challengeTypeText,
                    challengeType === 'math' && styles.challengeTypeTextActive
                  ]}>
                    Math
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.challengeTypeButton,
                    challengeType === 'word' && styles.challengeTypeButtonActive
                  ]}
                  onPress={() => setChallengeType('word')}
                >
                  <Text style={[
                    styles.challengeTypeText,
                    challengeType === 'word' && styles.challengeTypeTextActive
                  ]}>
                    Word
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.challengeTypeButton,
                    challengeType === 'hold' && styles.challengeTypeButtonActive
                  ]}
                  onPress={() => setChallengeType('hold')}
                >
                  <Text style={[
                    styles.challengeTypeText,
                    challengeType === 'hold' && styles.challengeTypeTextActive
                  ]}>
                    Hold
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {renderChallenge()}
            
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 500,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradientContainer: {
    padding: 30,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2B5E34',
    marginLeft: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#2B5E34',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  challengeTypeContainer: {
    marginBottom: 25,
    alignItems: 'center',
  },
  challengeTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2B5E34',
    marginBottom: 10,
  },
  challengeTypeButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  challengeTypeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    backgroundColor: 'rgba(43, 94, 52, 0.1)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  challengeTypeButtonActive: {
    backgroundColor: '#2B5E34',
    borderColor: '#2B5E34',
  },
  challengeTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2B5E34',
  },
  challengeTypeTextActive: {
    color: 'white',
  },
  challengeContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 25,
  },
  challengeQuestion: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2B5E34',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#2B5E34',
    borderRadius: 10,
    padding: 15,
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: 'white',
    color: '#2B5E34',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
  },
  holdContainer: {
    alignItems: 'center',
    width: '100%',
  },
  holdButton: {
    backgroundColor: '#FF8C00',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 15,
    alignItems: 'center',
    minWidth: 200,
    position: 'relative',
  },
  holdButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBar: {
    position: 'absolute',
    bottom: 5,
    left: 10,
    right: 10,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 100,
  },
  submitButton: {
    backgroundColor: '#2B5E34',
  },
  newChallengeButton: {
    backgroundColor: '#FF8C00',
  },
  cancelButton: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 10,
  },
});

export default ParentalGate;
