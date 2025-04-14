import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ImageBackground, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../app/styles/styles';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Asset } from 'expo-asset';

type Props = {
  onSelectLevel: (level: string) => void;
};

export default function MenuScreen({ onSelectLevel }: Props) {
  const navigation = useNavigation();

  const [bgLoaded, setBgLoaded] = useState(false);
  const [bgUri, setBgUri] = useState<string | null>(null);
  const [fontsLoaded] = useFonts({
    ComicNeue: require('../assets/fonts/custom.ttf'),
    TitleFont: require('../assets/fonts/orange.ttf'),
  });

  const levels = ['Farm', 'Wildlife', 'Ocean'];

  useEffect(() => {
    navigation.setOptions({ headerShown: false, tabBarStyle: { display: 'none' } });
  }, [navigation]);

  useEffect(() => {
    const loadImage = async () => {
      const asset = Asset.fromModule(require('../assets/images/animal-detective.png'));
      await asset.downloadAsync();
      setBgUri(asset.localUri || asset.uri);
      setBgLoaded(true);
    };

    loadImage();
  }, []);

  const allReady = bgLoaded && fontsLoaded;

  if (!allReady) {
    return (
      <View style={[styles.menuContainer, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFDAB9' }]}>
        <ActivityIndicator size="large" color="orange" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={{ uri: bgUri! }}
      style={{ flex: 1 }}
      resizeMode="cover"
      fadeDuration={0}
    >
      <View style={[styles.menuContainer, { backgroundColor: 'transparent' }]}>
        <View style={{
          backgroundColor: 'rgba(255, 218, 185, 0.8)',
          padding: 20,
          borderRadius: 15,
          width: '90%',
          alignItems: 'center'
        }}>
          <Text style={styles.menuTitle}>Select a Level</Text>
          <View style={[styles.levelGrid, { flexDirection: 'row', justifyContent: 'space-between', width: '100%' }]}>
            {levels.map(level => (
              <View key={level} style={{ alignItems: 'center', flex: 1, marginHorizontal: 5 }}>
                <TouchableOpacity
                  style={styles.levelButton}
                  onPress={() => level === 'Farm' && onSelectLevel(level)}
                  disabled={level !== 'Farm'}
                >
                  <Image source={require('../assets/images/farm.jpg')} style={styles.levelButtonBackground} />
                  {level !== 'Farm' && (
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
                  <View style={{ position: 'absolute', bottom: 1, width: '100%', alignItems: 'center' }}>
                    <Text style={styles.levelText}>{level}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}
