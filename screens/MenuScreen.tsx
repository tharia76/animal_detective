import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ImageBackground, ActivityIndicator, Modal, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Asset } from 'expo-asset';
import * as RNIap from 'react-native-iap';
import { styles } from '../app/styles/styles';
import { useLocalization } from '../hooks/useLocalization';
import { strings } from '../app/localization/strings';

type Props = {
  onSelectLevel: (level: string) => void;
  backgroundImageUri: string | null;
};

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
  
  // Set default language to English if not already set
  useEffect(() => {
    if (!lang) {
      setLang('en');
    }
  }, [lang, setLang]);
  
  const levels = ['farm', 'forest', 'ocean', 'desert', 'arctic', 'insects'];
  const languages = [
    { code: 'en', name: 'English'  },
    { code: 'ru', name: 'Русский' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
    { code: 'it', name: 'Italiano' },
    { code: 'tr', name: 'Türkçe' }
  ];

  // Initialize IAP connection
  // useEffect(() => {
  //   RNIap.initConnection()
  //     .catch(error => {
  //       if (error.code === 'E_IAP_NOT_AVAILABLE') {
  //         console.log('In-App Purchases are not available on this device');
  //         // Handle gracefully - maybe disable purchase buttons or show alternative UI
  //       } else {
  //         console.warn('IAP initialization error:', error);
  //       }
  //     })
  //     .then(() => {
  //       console.log("IAP connected");
  //     })
  //     .catch(console.warn);

  //   return () => {
  //     RNIap.endConnection();
  //   };
  // }, []);

  // // Fetch available products
  // useEffect(() => {
  //   const fetchProducts = async () => {
  //     try {
  //       const productIds = levels
  //         .filter(level => level !== 'farm' && level !== 'forest')
  //         .map(level => `com.mygame.level.${level}`);
        
  //       const items = await RNIap.getProducts({ skus: productIds });
  //       setProducts(items);
  //     } catch (err) {
  //       console.warn('Error fetching products:', err);
  //     }
  //   };

  //   fetchProducts();
  // }, []);

  // Listen for purchase updates
  // useEffect(() => {
  //   const purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase: { transactionReceipt?: any; productId?: any; purchase?: RNIap.Purchase; isConsumable?: boolean | undefined; developerPayloadAndroid?: string | undefined; }) => {
  //     const receipt = purchase.transactionReceipt;
  //     if (receipt) {
  //       try {
  //         // Extract level from productId (e.g., com.mygame.level.ocean -> ocean)
  //         const levelMatch = purchase.productId.match(/com\.mygame\.level\.(.+)/);
  //         const unlockedLevel = levelMatch ? levelMatch[1] : null;
          
  //         // Unlock the level here (you would update your state/storage)
  //         // For example: updateUnlockedLevels(unlockedLevel);
          
  //         await RNIap.finishTransaction(purchase as any); // consume item
          
  //         Alert.alert(
  //           "Purchase Successful", 
  //           `You've unlocked the ${t(unlockedLevel || '')} level!`,
  //           [{ text: "OK" }]
  //         );
          
  //         setShowPaymentModal(false);
  //       } catch (err) {
  //         console.warn('finishTransaction error', err);
  //       }
  //     }
  //   });

  //   const purchaseErrorSubscription = RNIap.purchaseErrorListener((error: any) => {
  //     console.warn('purchaseErrorListener', error);
  //     Alert.alert('Error', 'Payment failed.');
  //   });

  //   return () => {
  //     purchaseUpdateSubscription.remove();
  //     purchaseErrorSubscription.remove();
  //   };
  // }, [t]);

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

  // Handle level selection
  const handleLevelSelect = (level: string, isLocked: boolean) => {
    if (!isLocked) {
      onSelectLevel(level);
    } else {
      setSelectedLockedLevel(level);
      setShowPaymentModal(true);
    }
  };

  // Handle in-app purchase request
  const requestPurchase = async (productId: string) => {
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
  };

  // Handle language change
  const handleLanguageChange = async (languageCode: string) => {
    try {
      await setLang(languageCode);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  return (
    <ImageBackground
      source={backgroundImageUri ? { uri: backgroundImageUri } : require('../assets/images/menu-screen.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
      fadeDuration={0}
    >
      <View style={[styles.menuContainer, { backgroundColor: 'transparent' }]}>
        <View style={{
          backgroundColor: 'rgba(115, 194, 185, 0.6)',
          padding: 10,
          borderRadius: 15,
          width: '90%',
          alignItems: 'center'
        }}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            width: '100%',
            marginBottom: 15
          }}>
            <Text style={styles.menuTitle}>{t('selectLevel')}</Text>
            
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
          
          <View style={styles.levelGrid}>
            {levels.map((level, index) => {
              let levelBg;
              let isLocked = false;
              switch (level) {
                case 'farm':
                  levelBg = require('../assets/images/farm.jpg');
                  break;
                case 'forest':
                  levelBg = require('../assets/images/forest.jpg');
                  isLocked = false;
                  break;
                case 'ocean':
                  levelBg = require('../assets/images/oceann.jpg');
                  isLocked = true;
                  break;
                case 'desert':
                  levelBg = require('../assets/images/desert.jpg');
                  isLocked = true;
                  break;
                case 'arctic':
                  levelBg = require('../assets/images/arctic.jpg');
                  isLocked = true;
                  break;
                case 'insects':
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
                    onPress={() => handleLevelSelect(level, isLocked)}
                    activeOpacity={0.7}
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
                        <Ionicons name="lock-closed" size={40} color="white" />
                      </View>
                    )}
                  </TouchableOpacity>
                  <Text style={styles.levelText}>
                    {t(level)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

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
                  onPress={() => requestPurchase(`com.mygame.level.${selectedLockedLevel}`)}
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
                  onPress={() => requestPurchase(`com.mygame.level.${selectedLockedLevel}`)}
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
