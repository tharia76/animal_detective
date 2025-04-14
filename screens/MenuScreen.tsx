import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ImageBackground, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Asset } from 'expo-asset';
import { styles } from '../app/styles/styles';

type Props = {
  onSelectLevel: (level: string) => void;
  backgroundImageUri: string | null;
};

export default function MenuScreen({ onSelectLevel, backgroundImageUri }: Props) {
  const navigation = useNavigation();

  const [bgLoaded, setBgLoaded] = useState(false);
  const [bgUri, setBgUri] = useState<string | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [fontsLoaded] = useFonts({
    ComicNeue: require('../assets/fonts/custom.ttf'),
    TitleFont: require('../assets/fonts/orange.ttf'),
  });

  const levels = ['Farm', 'Forest', 'Ocean', 'Desert', 'Arctic', 'Insects'];

  useEffect(() => {
    navigation.setOptions({ headerShown: false, tabBarStyle: { display: 'none' } });
  }, [navigation]);

  useEffect(() => {
    const loadImages = async () => {
      try {
        // Load background image
        const bgAsset = Asset.fromModule(require('../assets/images/animal-detective.png'));
        await bgAsset.downloadAsync();
        setBgUri(bgAsset.localUri || bgAsset.uri);
        setBgLoaded(true);
        
        // Preload level images
        const farmAsset = Asset.fromModule(require('../assets/images/farm.jpg'));
        const forestAsset = Asset.fromModule(require('../assets/images/forest.jpg'));
        const oceanAsset = Asset.fromModule(require('../assets/images/oceann.jpg'));
        const desertAsset = Asset.fromModule(require('../assets/images/desert.jpg'));
        const arcticAsset = Asset.fromModule(require('../assets/images/arctic.jpg'));
        const insectAsset = Asset.fromModule(require('../assets/images/insect.png'));
        
        await Promise.all([
          farmAsset.downloadAsync(),
          forestAsset.downloadAsync(),
          oceanAsset.downloadAsync(),
          desertAsset.downloadAsync(),
          arcticAsset.downloadAsync(),
          insectAsset.downloadAsync()
        ]);
        
        setImagesLoaded(true);
      } catch (error) {
        console.warn('Error preloading images:', error);
        // Continue even if preloading fails
        setBgLoaded(true);
        setImagesLoaded(true);
      }
    };

    loadImages();
  }, []);

  const allReady = bgLoaded && fontsLoaded && imagesLoaded;

  if (!allReady) {
    return (
      <View style={[styles.menuContainer, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFDAB9' }]}>
        <ActivityIndicator size="large" color="orange" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={backgroundImageUri ? { uri: backgroundImageUri } : require('../assets/images/animal-detective.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
      fadeDuration={0}
    >
      <View style={[styles.menuContainer, { backgroundColor: 'transparent' }]}>
        <View style={{
          backgroundColor: 'rgba(255, 218, 185, 0.8)',
          padding: 10,
          borderRadius: 15,
          width: '90%',
          alignItems: 'center'
        }}>
          <Text style={styles.menuTitle}>Select a Level</Text>
          <View style={styles.levelGrid}>
            {levels.map((level, index) => {
              let levelBg;
              let isLocked = false;
              switch (level) {
                case 'Farm':
                  levelBg = require('../assets/images/farm.jpg');
                  break;
                case 'Forest':
                  levelBg = require('../assets/images/forest.jpg');
                  isLocked = false;
                  break;
                case 'Ocean':
                  levelBg = require('../assets/images/oceann.jpg');
                  isLocked = true;
                  break;
                case 'Desert':
                  levelBg = require('../assets/images/desert.jpg');
                  isLocked = true;
                  break;
                case 'Arctic':
                  levelBg = require('../assets/images/arctic.jpg');
                  isLocked = true;
                  break;
                case 'Insects':
                  levelBg = require('../assets/images/insect.png');
                  isLocked = true;
                  break;
                default:
                  levelBg = require('../assets/images/farm.jpg');
              }

              return (
                <View key={level} style={{ 
                  alignItems: 'center', 
                  width: '30%', 
                  marginHorizontal: '1.5%',
                  marginBottom: 10
                }}>
                  <TouchableOpacity
                    style={styles.levelButton}
                    onPress={() => !isLocked && onSelectLevel(level)}
                    disabled={isLocked}
                  >
                    <Image source={levelBg} style={styles.levelButtonBackground} />
                    {isLocked && (
                      <View style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 15,
                      }}>
                        <Ionicons name="lock-closed" size={40} color="gray" />
                      </View>
                    )}
                  </TouchableOpacity>
                  <Text style={styles.levelText}>{level}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}
