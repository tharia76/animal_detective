import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from 'react-native';
import { useLocalization } from '../hooks/useLocalization';

interface SimpleMobileModalProps {
  visible: boolean;
  onStartOver: () => void;
  onGoHome: () => void;
}

const { width, height } = Dimensions.get('window');

const SimpleMobileModal: React.FC<SimpleMobileModalProps> = ({ 
  visible, 
  onStartOver, 
  onGoHome 
}) => {
  const { t } = useLocalization();
  
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <Text style={styles.title}>{t('congratulations')}</Text>
        
        <Text style={styles.emoji}>🏆</Text>
        
        <Text style={styles.message}>
          {t('youveSeenAllAnimals')}
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.startOverButton]}
            onPress={onStartOver}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{t('startOver')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.menuButton]}
            onPress={onGoHome}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{t('menu')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: Math.min(width * 0.85, 400),
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B9D',
    marginBottom: 20,
  },
  emoji: {
    fontSize: 50,
    marginBottom: 15,
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  startOverButton: {
    backgroundColor: '#4CAF50',
    marginRight: 7.5,
  },
  menuButton: {
    backgroundColor: '#FF9800',
    marginLeft: 7.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SimpleMobileModal; 