import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, ImageBackground, ActivityIndicator, Modal, Platform, Alert, useWindowDimensions, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Asset } from 'expo-asset';
import * as RNIap from 'react-native-iap';
import { useDynamicStyles } from '../app/styles/styles';
import { useLocalization } from '../hooks/useLocalization';
import { strings } from '../app/localization/strings';

type Props = {
  onSelectLevel: (level: string, language: string) => void;
  backgroundImageUri: string | null;
};

// Helper function to get background color based on level theme
const getLevelBackgroundColor = (level: string): string => {
  switch (level) {
    case 'farm': return 'rgba(113, 89, 43, 0.8)'; // Wheat color
    case 'forest': return 'rgba(34, 139, 34, 0.8)'; // Forest green
    case 'ocean': return 'rgba(0, 191, 255, 0.8)'; // Deep sky blue
    case 'desert': return 'rgba(189, 113, 14, 0.8)'; // Tan color
    case 'arctic': return 'rgba(137, 190, 207, 0.8)'; // Light blue
    case 'insects': return 'rgba(69, 95, 16, 0.8)'; // Yellow green
    case 'savannah': return 'rgba(181, 163, 25, 0.8)'; // Tan/Savannah color
    case 'jungle': return 'rgba(0, 100, 0, 0.8)'; // Dark Green/Jungle color
    case 'birds': return 'rgba(217, 111, 222, 0.8)'; // Sky Blue/Birds color
    default: return 'rgba(200, 200, 200, 0.8)'; // Default grey
  }
};

const styles = StyleSheet.create({
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  labelContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 6,
    paddingVertical: 0,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    marginTop: 5,
    width: 320,
    height: 320,
    resizeMode: 'contain',
    marginBottom: 0
  },
});

export default function MenuScreen({ onSelectLevel, backgroundImageUri }: Props) {
  const navigation = useNavigation();

  const [bgLoaded, setBgLoaded] = useState(false);
  const [bgUri, setBgUri] = useState<string | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedLockedLevel, setSelectedLockedLevel] = useState<string | null>(null);
  const [products, setProducts] = useState<RNIap.Product[]>([]);
  const [fontsLoaded] = useFonts({
    ComicNeue: require('../assets/fonts/custom.ttf'),
    TitleFont: require('../assets/fonts/orange.ttf'),
  });

  const { t, lang, setLang } = useLocalization();
  const dynamicStyles = useDynamicStyles();

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const numColumns = isLandscape ? 3 : 3;

  // Bounded square size calculation
  const margin = 8; // px on each side of a tile
  const portraitSize = (width * 0.9 / numColumns) - (margin * 2);
  const maxLandscape = height * 0.3;
  const itemSize = Math.min(portraitSize, maxLandscape);

  useEffect(() => {
    if (!lang) {
      setLang('en');
    }
  }, [lang, setLang]);

  useEffect(() => {
    navigation.setOptions({ headerShown: false, tabBarStyle: { display: 'none' } });
  }, [navigation]);

  useEffect(() => {
    const loadImages = async () => {
      try {
        // Load background image
        const bgAsset = Asset.fromModule(require('../assets/images/menu-screen.png'));
        await bgAsset.downloadAsync();
        setBgUri(bgAsset.localUri || bgAsset.uri);
        setBgLoaded(true);

        // Preload level images
        const farmAsset = Asset.fromModule(require('../assets/images/level-backgrounds/farm.png'));
        const forestAsset = Asset.fromModule(require('../assets/images/level-backgrounds/forest.png'));
        const oceanAsset = Asset.fromModule(require('../assets/images/level-backgrounds/oceann.jpg'));
        const desertAsset = Asset.fromModule(require('../assets/images/level-backgrounds/desert.jpg'));
        const arcticAsset = Asset.fromModule(require('../assets/images/level-backgrounds/arctic.jpg'));
        const insectAsset = Asset.fromModule(require('../assets/images/level-backgrounds/insect.png'));
        const savannahAsset = Asset.fromModule(require('../assets/images/level-backgrounds/savannah.jpg'));
        const jungleAsset = Asset.fromModule(require('../assets/images/level-backgrounds/jungle.jpg'));
        const birdsAsset = Asset.fromModule(require('../assets/images/level-backgrounds/birds.png'));

        await Promise.all([
          farmAsset.downloadAsync(),
          forestAsset.downloadAsync(),
          oceanAsset.downloadAsync(),
          desertAsset.downloadAsync(),
          arcticAsset.downloadAsync(),
          insectAsset.downloadAsync(),
          savannahAsset.downloadAsync(),
          jungleAsset.downloadAsync(),
          birdsAsset.downloadAsync()
        ]);

        setImagesLoaded(true);
      } catch (error) {
        console.warn('Error preloading images:', error);
        setBgLoaded(true);
        setImagesLoaded(true);
      }
    };

    loadImages();
  }, []);

  const handleLevelSelect = useCallback((level: string, isLocked: boolean) => {
    if (!isLocked) {
      onSelectLevel(level, lang);
    } else {
      setSelectedLockedLevel(level);
      setShowPaymentModal(true);
    }
  }, [onSelectLevel, lang]);

  const requestPurchase = useCallback(async (productId: string) => {
    try {
      await RNIap.requestPurchase({
        skus: [productId]
      });
    } catch (err) {
      console.warn('Purchase error:', err);
      Alert.alert(
        "Purchase Failed",
        "There was an error processing your purchase. Please try again.",
        [{ text: "OK" }]
      );
    }
  }, []);

  const handleLanguageChange = useCallback(async (languageCode: string) => {
    try {
      await setLang(languageCode);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  }, [setLang]);

  const allReady = bgLoaded && fontsLoaded && imagesLoaded;

  if (!allReady) {
    return (
      <View style={[dynamicStyles.menuContainer, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFDAB9' }]}>
        <ActivityIndicator size="large" color="orange" />
      </View>
    );
  }

  const levels = ['farm', 'forest', 'ocean', 'desert', 'arctic', 'insects', 'savannah', 'jungle', 'birds'];
  const languages = [
    { code: 'en', name: 'English'  },
    { code: 'ru', name: 'Русский' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
    { code: 'it', name: 'Italiano' },
    { code: 'tr', name: 'Türkçe' }
  ];

  // Helper to get level background image
  const getLevelBg = (level: string) => {
    switch (level) {
      case 'farm':
        return require('../assets/images/level-backgrounds/farm.png');
      case 'forest':
        return require('../assets/images/level-backgrounds/forest.png');
      case 'ocean':
        return require('../assets/images/level-backgrounds/oceann.jpg');
      case 'desert':
        return require('../assets/images/level-backgrounds/desert.jpg');
      case 'arctic':
        return require('../assets/images/level-backgrounds/arctic.jpg');
      case 'insects':
        return require('../assets/images/level-backgrounds/insect.png');
      case 'savannah':
        return require('../assets/images/level-backgrounds/savannah.jpg');
      case 'jungle':
        return require('../assets/images/level-backgrounds/jungle.jpg');
      case 'birds':
        return require('../assets/images/level-backgrounds/birds.png');
      default:
        return require('../assets/images/level-backgrounds/farm.png');
    }
  };

  // Logo component for both orientations, but with different style
  const Logo = () => (
    <Image
      source={require('../assets/images/game-logo.png')}
      style={
        isLandscape
          ? { width: 320, height: 220, marginTop: 0, marginBottom: 0, resizeMode: 'cover',  }
          : { width: 120, height: 120, marginTop: 220, marginBottom: 0, resizeMode: 'contain' }
      }
      accessibilityLabel="Game Logo"
    />
  );

  // In portrait, do NOT show logo above the header
  const PortraitHeader = (
    <View style={{ alignItems: 'center', width: '100%' }}>
      {/* No Logo in portrait */}
      <View style={{
        backgroundColor: 'rgba(115, 194, 185, 0.6)',
        padding: 10,
        borderRadius: 15,
        width: '90%',
        alignItems: 'center',
        marginTop: 20,
        justifyContent: 'center',
      }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          marginBottom: 15
        }}>
          <Text style={{
            fontSize: 22,
            fontWeight: 'bold',
            color: '#612915',
            textAlign: 'left',
            flex: 1
          }}>
            {t('selectLevel')}
          </Text>
          {/* Language selector moved to the right of title */}
          <View style={{ position: 'relative', zIndex: 10, width: '40%' }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 10,
                backgroundColor: 'orange',
                borderRadius: 10,
                elevation: 3,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.3,
                shadowRadius: 2
              }}
              onPress={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <Text style={{ fontWeight: 'bold', color: '#612915' }}>
                {languages.find(l => l.code === lang)?.code === 'en' ? '🇺🇸' :
                  languages.find(l => l.code === lang)?.code === 'ru' ? '🇷🇺' :
                    languages.find(l => l.code === lang)?.code === 'es' ? '🇪🇸' :
                      languages.find(l => l.code === lang)?.code === 'de' ? '🇩🇪' :
                        languages.find(l => l.code === lang)?.code === 'fr' ? '🇫🇷' :
                          languages.find(l => l.code === lang)?.code === 'it' ? '🇮🇹' :
                            languages.find(l => l.code === lang)?.code === 'tr' ? '🇹🇷' : ''}
                {languages.find(l => l.code === lang)?.name}
              </Text>
              <Text style={{ marginLeft: 5 }}>▼</Text>
            </TouchableOpacity>

            {isDropdownOpen && (
              <View style={{
                position: 'absolute',
                top: 45,
                left: 0,
                right: 0,
                backgroundColor: 'white',
                borderRadius: 10,
                padding: 5,
                elevation: 5,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 3
              }}>
                {languages.map((language) => (
                  <TouchableOpacity
                    key={language.code}
                    style={{
                      padding: 8,
                      marginVertical: 2,
                      backgroundColor: lang === language.code ? 'rgba(255, 165, 0, 0.2)' : 'transparent',
                      borderRadius: 5
                    }}
                    onPress={() => {
                      handleLanguageChange(language.code);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <Text style={{
                      fontWeight: lang === language.code ? 'bold' : 'normal'
                    }}>
                      {language.code === 'en' ? '🇺🇸 ' :
                        language.code === 'ru' ? '🇷🇺 ' :
                          language.code === 'es' ? '🇪🇸 ' :
                            language.code === 'de' ? '🇩🇪 ' :
                              language.code === 'fr' ? '🇫🇷 ' :
                                language.code === 'it' ? '🇮🇹 ' :
                                  language.code === 'tr' ? '🇹🇷 ' : ''}
                      {language.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  // ListHeader for landscape: show logo above header
  const ListHeader = () => (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>
      <View style={{ width: '50%', alignItems: 'center', justifyContent: 'center' }}>
        {/* Show logo in landscape */}
        <Logo />
        <View style={{
          backgroundColor: 'rgba(115, 194, 185, 0.6)',
          padding: 10,
          borderRadius: 15,
          width: '100%',
          alignItems: 'center',
          marginTop: 0,
          justifyContent: 'center',
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            marginBottom: 15
          }}>
            <Text style={{
              fontSize: 22,
              fontWeight: 'bold',
              color: '#612915',
              textAlign: 'left',
              flex: 1
            }}>
              {t('selectLevel')}
            </Text>
            {/* Language selector moved to the right of title */}
            <View style={{ position: 'relative', zIndex: 10, width: '40%' }}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 10,
                  backgroundColor: 'orange',
                  borderRadius: 10,
                  elevation: 3,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.3,
                  shadowRadius: 2
                }}
                onPress={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <Text style={{ fontWeight: 'bold', color: '#612915' }}>
                  {languages.find(l => l.code === lang)?.code === 'en' ? '🇺🇸' :
                    languages.find(l => l.code === lang)?.code === 'ru' ? '🇷🇺' :
                      languages.find(l => l.code === lang)?.code === 'es' ? '🇪🇸' :
                        languages.find(l => l.code === lang)?.code === 'de' ? '🇩🇪' :
                          languages.find(l => l.code === lang)?.code === 'fr' ? '🇫🇷' :
                            languages.find(l => l.code === lang)?.code === 'it' ? '🇮🇹' :
                              languages.find(l => l.code === lang)?.code === 'tr' ? '🇹🇷' : ''}
                  {languages.find(l => l.code === lang)?.name}
                </Text>
                <Text style={{ marginLeft: 5 }}>▼</Text>
              </TouchableOpacity>

              {isDropdownOpen && (
                <View style={{
                  position: 'absolute',
                  top: 45,
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
                  borderRadius: 10,
                  padding: 5,
                  elevation: 5,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 3
                }}>
                  {languages.map((language) => (
                    <TouchableOpacity
                      key={language.code}
                      style={{
                        padding: 8,
                        marginVertical: 2,
                        backgroundColor: lang === language.code ? 'rgba(255, 165, 0, 0.2)' : 'transparent',
                        borderRadius: 5
                      }}
                      onPress={() => {
                        handleLanguageChange(language.code);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <Text style={{
                        fontWeight: lang === language.code ? 'bold' : 'normal'
                      }}>
                        {language.code === 'en' ? '🇺🇸 ' :
                          language.code === 'ru' ? '🇷🇺 ' :
                            language.code === 'es' ? '🇪🇸 ' :
                              language.code === 'de' ? '🇩🇪 ' :
                                language.code === 'fr' ? '🇫🇷 ' :
                                  language.code === 'it' ? '🇮🇹 ' :
                                    language.code === 'tr' ? '🇹🇷 ' : ''}
                        {language.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
        <View style={{
          backgroundColor: 'rgba(115, 194, 185, 0.6)',
          borderRadius: 15,
          width: '100%',
          alignItems: 'center',
          marginTop: 10,
          paddingBottom: 10,
        }} />
      </View>
    </View>
  );

  const ListFooter = () => <View style={{ height: 30 }} />;

  return (
    <ImageBackground
      source={backgroundImageUri ? { uri: backgroundImageUri } : require('../assets/images/menu-screen.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
      fadeDuration={0}
    >
      <FlatList
        data={levels}
        key={String(numColumns)}
        numColumns={numColumns}
        // Center the row in landscape, space-between in portrait
        columnWrapperStyle={{
          justifyContent: isLandscape ? 'center' : 'space-between',
        }}
        contentContainerStyle={{
          alignItems: isLandscape ? 'center' : 'center',
          paddingTop: isLandscape ? 2 : 250,
          paddingBottom: 40,
        }}
        renderItem={({ item: level }) => {
          const isLocked = level !== 'farm' && level !== 'forest';
          const bg = getLevelBg(level);
          return (
            <TouchableOpacity
              onPress={() => handleLevelSelect(level, isLocked)}
              style={{
                width: itemSize,
                height: itemSize,
                margin,
                borderRadius: 15,
                overflow: 'hidden',
                backgroundColor: '#fff2',
              }}
              activeOpacity={0.7}
            >
              {/* 
                Make images fit the square: use resizeMode="cover" and set width/height to "100%" 
                so the image fills the square, cropping if necessary.
              */}
              <Image
                source={bg}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 15,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
                resizeMode="cover"
              />
              {isLocked && (
                <View style={styles.lockOverlay}>
                  <Ionicons name="lock-closed" size={24} color="white" />
                </View>
              )}
              <View style={[
                styles.labelContainer,
                { backgroundColor: getLevelBackgroundColor(level) }
              ]}>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: isLandscape ? 14 : 16,
                    fontWeight: 'bold',
                    color: 'white'
                  }}
                >
                  {t(level)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        keyExtractor={l => l}
        ListHeaderComponent={isLandscape ? ListHeader : PortraitHeader}
        ListFooterComponent={ListFooter}
        showsVerticalScrollIndicator={true}
        style={{ flex: 1, width: '100%' }}
      />

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}>
          <View style={{
            width: '80%',
            backgroundColor: 'white',
            borderRadius: 20,
            padding: 20,
            alignItems: 'center',
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4
          }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15 }}>
              {t('unlockLevel')}
            </Text>
            <Text style={{ textAlign: 'center', marginBottom: 20 }}>
              {t('unlockMessage').replace('{level}', t(selectedLockedLevel || ''))}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#f0f0f0',
                  padding: 12,
                  borderRadius: 10,
                  width: '45%',
                  alignItems: 'center'
                }}
                onPress={() => setShowPaymentModal(false)}
              >
                <Text>{t('cancel')}</Text>
              </TouchableOpacity>
              {Platform.OS === 'ios' ? (
                <TouchableOpacity
                  style={{
                    backgroundColor: '#0066CC',
                    padding: 12,
                    borderRadius: 10,
                    width: '45%',
                    alignItems: 'center'
                  }}
                  onPress={() => selectedLockedLevel && requestPurchase(`com.mygame.level.${selectedLockedLevel}`)}
                  disabled={!selectedLockedLevel}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>{t('appStorePay')}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={{
                    backgroundColor: '#689F38',
                    padding: 12,
                    borderRadius: 10,
                    width: '45%',
                    alignItems: 'center'
                  }}
                  onPress={() => selectedLockedLevel && requestPurchase(`com.mygame.level.${selectedLockedLevel}`)}
                  disabled={!selectedLockedLevel}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>{t('googlePlayPay')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}
