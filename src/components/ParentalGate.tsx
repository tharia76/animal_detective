import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  Alert,
  ScrollView,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../hooks/useLocalization';
import { useDeviceDimensions } from '../hooks/useDeviceDimensions';

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
  title, 
  message 
}) => {
  const { t } = useLocalization();
  const { isTablet } = useDeviceDimensions();
  const [challengeType, setChallengeType] = useState<ChallengeType>('math');
  const [userInput, setUserInput] = useState('');
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
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
    return { question: `${t('typeTheWord')} ${word}`, answer: word };
  }, [t]);

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

  // Keyboard visibility tracking
  React.useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Handle math/word input submission
  const handleSubmit = useCallback(() => {
    if (!currentChallenge) return;
    
    if (userInput.trim().toUpperCase() === currentChallenge.answer.toUpperCase()) {
      onSuccess();
    } else {
      Alert.alert(
        t('incorrectAnswer'),
        t('tryAgainMessage'),
        [{ text: t('tryAgain'), onPress: () => setUserInput('') }]
      );
    }
  }, [userInput, currentChallenge, onSuccess, t]);

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
          <View style={isKeyboardVisible && !isTablet ? styles.challengeContainerKeyboard : styles.challengeContainer}>
            <Text style={styles.challengeQuestion}>
              {currentChallenge?.question}
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                value={userInput}
                onChangeText={setUserInput}
                placeholder={t('yourAnswer')}
                autoCapitalize="characters"
                autoCorrect={false}
                onSubmitEditing={handleSubmit}
                returnKeyType="done"
                blurOnSubmit={false}
                keyboardType={challengeType === 'math' ? 'numeric' : 'default'}
              />
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleSubmit}
                disabled={!userInput.trim()}
              >
                <Text style={styles.buttonText}>{t('submit')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      
      case 'hold':
        return (
          <View style={isKeyboardVisible && !isTablet ? styles.challengeContainerKeyboard : styles.challengeContainer}>
            <Text style={styles.challengeQuestion}>
              {t('holdFor3Seconds')}
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
                  {isHolding ? t('holding') : t('holdButton')}
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
        <ScrollView 
          contentContainerStyle={
            isTablet 
              ? styles.scrollContainerTablet 
              : isKeyboardVisible 
                ? styles.scrollContainerKeyboard 
                : styles.scrollContainer
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          keyboardDismissMode="interactive"
        >
          <View style={isTablet ? styles.modalContainerTablet : styles.modalContainer}>
              <LinearGradient
                colors={['#FFE4B5', '#FFDAB9', '#FFE4B5']}
                style={
                  isTablet 
                    ? styles.gradientContainerTablet 
                    : isKeyboardVisible 
                      ? styles.gradientContainerKeyboard 
                      : styles.gradientContainer
                }
              >
            <View style={isKeyboardVisible && !isTablet ? styles.headerKeyboard : styles.header}>
              <Ionicons name="shield-checkmark" size={18} color="#2B5E34" />
              <Text style={styles.title}>{title || t('parentalPermissionRequired')}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onCancel}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={20} color="#2B5E34" />
              </TouchableOpacity>
            </View>
            
            <Text style={isKeyboardVisible && !isTablet ? styles.messageKeyboard : styles.message}>{message || t('parentalGateMessage')}</Text>
            
            {/* New Question Button */}
            <TouchableOpacity
              style={[styles.button, styles.newChallengeButton]}
              onPress={generateNewChallenge}
            >
              <Text style={styles.buttonText}>{t('newQuestion')}</Text>
            </TouchableOpacity>
            
            {/* Challenge Type Selector */}
            <View style={isKeyboardVisible && !isTablet ? styles.challengeTypeContainerKeyboard : styles.challengeTypeContainer}>
              <Text style={styles.challengeTypeLabel}>{t('chooseChallengeType')}</Text>
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
                    {t('math')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.challengeTypeButton,
                    challengeType === 'word' && styles.challengeTypeTextActive
                  ]}
                  onPress={() => setChallengeType('word')}
                >
                  <Text style={[
                    styles.challengeTypeText,
                    challengeType === 'word' && styles.challengeTypeTextActive
                  ]}>
                    {t('word')}
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
                    {t('hold')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {renderChallenge()}
          </LinearGradient>
        </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
    minHeight: '100%',
  },
  scrollContainerTablet: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  scrollContainerKeyboard: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  modalContainer: {
    width: '95%',
    maxWidth: 320,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalContainerTablet: {
    width: '90%',
    maxWidth: 500,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradientContainer: {
    padding: 12,
    alignItems: 'center',
  },
  gradientContainerKeyboard: {
    padding: 6,
    alignItems: 'center',
  },
  gradientContainerTablet: {
    padding: 25,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    width: '100%',
  },
  headerKeyboard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2B5E34',
    textAlign: 'center',
    flex: 1,
  },
  closeButton: {
    padding: 4,
    borderRadius: 15,
    backgroundColor: 'rgba(43, 94, 52, 0.1)',
  },
  message: {
    fontSize: 13,
    color: '#2B5E34',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 16,
  },
  messageKeyboard: {
    fontSize: 12,
    color: '#2B5E34',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 14,
  },
  challengeTypeContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  challengeTypeContainerKeyboard: {
    marginBottom: 8,
    alignItems: 'center',
  },
  challengeTypeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2B5E34',
    marginBottom: 6,
  },
  challengeTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  challengeTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(43, 94, 52, 0.1)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  challengeTypeButtonActive: {
    backgroundColor: '#2B5E34',
    borderColor: '#2B5E34',
  },
  challengeTypeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2B5E34',
  },
  challengeTypeTextActive: {
    color: 'white',
  },
  challengeContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeContainerKeyboard: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeQuestion: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2B5E34',
    textAlign: 'center',
    marginBottom: 10,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#2B5E34',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'white',
    color: '#2B5E34',
    flex: 1,
  },
  holdContainer: {
    alignItems: 'center',
    width: '100%',
  },
  holdButton: {
    backgroundColor: '#FF8C00',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
    position: 'relative',
  },
  holdButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  progressBar: {
    position: 'absolute',
    bottom: 3,
    left: 8,
    right: 8,
    height: 3,
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
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    alignItems: 'center',
    minWidth: 60,
  },
  submitButton: {
    backgroundColor: '#2B5E34',
  },
  newChallengeButton: {
    backgroundColor: '#FF8C00',
  },
  buttonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default ParentalGate;
