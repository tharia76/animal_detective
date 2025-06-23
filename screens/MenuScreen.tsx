import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Image,
  ActivityIndicator,
  useWindowDimensions,
  StyleSheet,
  ImageBackground,
  ScrollView,
  Alert,
  Platform,
  TouchableOpacity,
  Text,
  Modal,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Asset } from 'expo-asset';
import * as RNIap from 'react-native-iap';
import { useAudioPlayer } from 'expo-audio';
import { useDynamicStyles } from '../src/styles/styles';
import { useLocalization } from '../src/hooks/useLocalization';
import LanguageSelector from '../src/components/LanguageSelector';
import LevelTiles from '../src/components/LevelTiles';

const menuBgSound = require('../src/assets/sounds/background_sounds/menu.mp3');
const BG_IMAGE = require('../src/assets/images/menu-screen.png');
const LEVELS = ['farm', 'forest', 'ocean', 'desert', 'arctic', 'insects', 'savannah', 'jungle', 'birds'];
const NUM_COLS = 3;
const MARGIN = 3;

// Apple App Store product id for unlocking all levels except Farm
const APPLE_PRODUCT_ID = 'animalDetective'; // Replace with your actual product id
Alert.alert(APPLE_PRODUCT_ID);

const LEVEL_BACKGROUNDS: Record<string, any> = {
  farm: require('../src/assets/images/level-backgrounds/farm.png'),
  forest: require('../src/assets/images/level-backgrounds/forest.png'),
  ocean: require('../src/assets/images/level-backgrounds/ocean.png'),
  desert: require('../src/assets/images/level-backgrounds/desert.png'),
  arctic: require('../src/assets/images/level-backgrounds/arctic.png'),
  insects: require('../src/assets/images/level-backgrounds/insect.png'),
  savannah: require('../src/assets/images/level-backgrounds/savannah.png'),
  jungle: require('../src/assets/images/level-backgrounds/jungle.png'),
  birds: require('../src/assets/images/level-backgrounds/birds.png'),
};

const getLevelBackgroundColor = (level: string): string => {
  switch (level) {
    case 'farm': return 'rgba(113, 89, 43, 0.8)';
    case 'forest': return 'rgba(34, 139, 34, 0.8)';
    case 'ocean': return 'rgba(0, 191, 255, 0.8)';
    case 'desert': return 'rgba(189, 113, 14, 0.8)';
    case 'arctic': return 'rgba(137, 190, 207, 0.8)';
    case 'insects': return 'rgba(69, 95, 16, 0.8)';
    case 'savannah': return 'rgba(181, 163, 25, 0.8)';
    case 'jungle': return 'rgba(0, 100, 0, 0.8)';
    case 'birds': return 'rgba(217, 111, 222, 0.8)';
    default: return 'rgba(200, 200, 200, 0.8)';
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
  logo: {
    width: 280,
    height: 120,
    resizeMode: 'contain',
  },
  portraitHeaderContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 0,
    zIndex: 10000,
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  portraitLogo: {
    width: 280,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  portraitLanguageSelector: {
    marginTop: 0,
    marginBottom: 10,
    alignSelf: 'center',
    zIndex: 10001,
  },
  tilesContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    marginTop: 80,
    marginLeft: 25,
    marginRight: 10,
  },
  tilesContainerLandscape: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    left: 0,
    right: 0,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: '100%',
  },
  landscapeHeaderContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: 'transparent',
    zIndex: 2,
    position: 'relative',
  },
  landscapeLogo: {
    width: 280,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 2,
  },
  landscapeLangContainer: {
    position: 'absolute',
    right: 16,
    top: 8,
    zIndex: 10001,
  },
  landscapeTilesGrid: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 8,
    paddingBottom: 16,
    zIndex: 1,
  },
  unlockButton: {
    backgroundColor: '#ffb300',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
    alignSelf: 'center',
    minWidth: 180,
  },
  unlockButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  restoreButton: {
    marginTop: 8,
    alignSelf: 'center',
  },
  restoreButtonText: {
    color: '#007aff',
    fontSize: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    minWidth: 280,
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 18,
    textAlign: 'center',
  },
  modalUnlockButton: {
    backgroundColor: '#ffb300',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 10,
    minWidth: 180,
  },
  modalUnlockButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  modalRestoreButton: {
    marginBottom: 10,
  },
  modalRestoreButtonText: {
    color: '#007aff',
    fontSize: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  modalCloseButton: {
    marginTop: 6,
    padding: 6,
  },
  modalCloseButtonText: {
    color: '#888',
    fontSize: 15,
    textAlign: 'center',
  },
});

const lockedLevels = LEVELS.filter(l => l !== 'farm');

export default function MenuScreen({ onSelectLevel, backgroundImageUri }) {
  const navigation = useNavigation();
  const { t, lang, setLang } = useLocalization();
  const dynStyles = useDynamicStyles();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [bgReady, setBgReady] = useState(false);
  const [bgUri, setBgUri] = useState<string | null>(null);
  const [imgsReady, setImgsReady] = useState(false);

  // Payment state
  const [iapInitialized, setIapInitialized] = useState(false);
  const [products, setProducts] = useState<RNIap.Product[]>([]);
  const [purchaseInProgress, setPurchaseInProgress] = useState(false);
  const [unlocked, setUnlocked] = useState<boolean>(false);

  // Modal state for locked level
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  // Use a ref to always get the latest player instance
  const playerRef = useRef<any>(null);
  const player = useAudioPlayer(menuBgSound);

  // Keep playerRef in sync with player
  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  // Play immediately on mount, and cleanup on unmount
  useEffect(() => {
    try {
      player.play();
    } catch (e) {
      console.warn('Failed to play menu bg sound', e);
    }
    return () => {
      try {
        if (playerRef.current && playerRef.current.playing) {
          playerRef.current.pause();
        }
        if (playerRef.current) {
          playerRef.current.remove();
        }
      } catch (e) {
        // Defensive: ignore errors on cleanup
      }
    };
  }, [player]);

  // helper to fully stop & unload
  const stopAndUnload = useCallback(() => {
    try {
      if (playerRef.current && playerRef.current.playing) {
        playerRef.current.pause();
      }
      if (playerRef.current) {
        playerRef.current.remove();
      }
    } catch (e) {
      // Defensive: ignore errors on cleanup
    }
  }, []);

  // preload images
  useEffect(() => {
    (async () => {
      try {
        const bgAsset = Asset.fromModule(BG_IMAGE);
        await bgAsset.downloadAsync();
        setBgUri(bgAsset.localUri ?? bgAsset.uri);
        setBgReady(true);

        // preload each level background
        await Promise.all(
          LEVELS.map((l) => {
            let file;
            switch (l) {
              case 'ocean':
                file = require('../src/assets/images/level-backgrounds/ocean.png');
                break;
              case 'desert':
                file = require('../src/assets/images/level-backgrounds/desert.png');
                break;
              case 'arctic':
                file = require('../src/assets/images/level-backgrounds/arctic.png');
                break;
              case 'savannah':
                file = require('../src/assets/images/level-backgrounds/savannah.png');
                break;
              case 'jungle':
                file = require('../src/assets/images/level-backgrounds/jungle.png');
                break;
              case 'birds':
                file = require('../src/assets/images/level-backgrounds/birds.png');
                break;
              case 'insects':
                file = require('../src/assets/images/level-backgrounds/insect.png');
                break;
              case 'farm':
                file = require('../src/assets/images/level-backgrounds/farm.png');
                break;
              case 'forest':
                file = require('../src/assets/images/level-backgrounds/forest.png');
                break;
              default:
                file = require('../src/assets/images/level-backgrounds/farm.png');
            }
            return Asset.fromModule(file).downloadAsync();
          })
        );
        setImgsReady(true);
      } catch (e) {
        console.warn('Error preloading images:', e);
        setBgReady(true);
        setImgsReady(true);
      }
    })();
  }, []);

  // play on focus, stop on blur
  useEffect(() => {
    const onFocus = () => {
      try {
        if (playerRef.current) playerRef.current.play();
      } catch (e) {
        // Defensive: ignore
      }
    };
    const onBlur = () => {
      stopAndUnload();
    };

    const fSub = navigation.addListener('focus', onFocus);
    const bSub = navigation.addListener('blur', onBlur);
    return () => {
      try {
        fSub && fSub();
        bSub && bSub();
      } catch (e) {}
      stopAndUnload();
    };
  }, [navigation, stopAndUnload]);

  // IAP: Initialize and get products
  useEffect(() => {
    let purchaseUpdateSubscription: any;
    let purchaseErrorSubscription: any;

    async function initIAP() {
      if (Platform.OS !== 'ios') {
        setIapInitialized(true);
        return;
      }
      try {
        await RNIap.initConnection();
        setIapInitialized(true);

        // Get product info
        const products = await RNIap.getProducts({ skus: [APPLE_PRODUCT_ID] });
        setProducts(products);

        // Check if already purchased
        const purchases = await RNIap.getAvailablePurchases();
        const hasUnlock = purchases.some(
          (purchase) =>
            purchase.productId === APPLE_PRODUCT_ID ||
            purchase.productId === APPLE_PRODUCT_ID.replace('.unlockall', '.unlockall') // fallback
        );
        if (hasUnlock) setUnlocked(true);

        // Listen for purchase updates
        purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase) => {
          const receipt = purchase.transactionReceipt;
          if (receipt) {
            try {
              await RNIap.finishTransaction({ purchase, isConsumable: false });
              if (purchase.productId === APPLE_PRODUCT_ID) {
                setUnlocked(true);
                Alert.alert(t('Thank you!'), t('All levels are now unlocked.'));
              }
            } catch (err) {
              console.warn('finishTransaction error', err);
            }
          }
        });

        purchaseErrorSubscription = RNIap.purchaseErrorListener((error) => {
          setPurchaseInProgress(false);
          Alert.alert(t('Purchase Error'), error.message || t('Something went wrong.'));
        });
      } catch (e) {
        setIapInitialized(true);
        // Alert.alert(t('Error'), t('Could not connect to App Store.'));
      }
    }

    initIAP();

    return () => {
      try {
        purchaseUpdateSubscription && purchaseUpdateSubscription.remove();
        purchaseErrorSubscription && purchaseErrorSubscription.remove();
        RNIap.endConnection();
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Restore purchases
  const handleRestore = useCallback(async () => {
    setPurchaseInProgress(true);
    try {
      const purchases = await RNIap.getAvailablePurchases();
      const hasUnlock = purchases.some(
        (purchase) =>
          purchase.productId === APPLE_PRODUCT_ID ||
          purchase.productId === APPLE_PRODUCT_ID.replace('.unlockall', '.unlockall')
      );
      if (hasUnlock) {
        setUnlocked(true);
        Alert.alert(t('Restored'), t('All levels are now unlocked.'));
      } else {
        Alert.alert(t('No Purchases'), t('No previous purchases found.'));
      }
    } catch (e) {
      // Alert.alert(t('Error'), t('Could not restore purchases.'));
    }
    setPurchaseInProgress(false);
  }, [t]);

  // Purchase handler
  const handleUnlock = useCallback(async () => {
    if (purchaseInProgress) return;
    setPurchaseInProgress(true);
    try {
      await RNIap.requestPurchase({ sku: APPLE_PRODUCT_ID });

    } catch (e) {
      // Alert.alert(t('Error'), t('Could not complete purchase.'));
    }
    setPurchaseInProgress(false);
  }, [purchaseInProgress, t]);

  // also stop when you select a level
  const handleSelect = useCallback(
    (level, isLocked) => {
      stopAndUnload();
      if (!isLocked) {
        // Defensive: ensure onSelectLevel is a function
        if (typeof onSelectLevel === 'function') {
          onSelectLevel(level);
        }
      } else {
        // Show modal for locked level
        setShowUnlockModal(true);
      }
    },
    [onSelectLevel, stopAndUnload]
  );

  // Get price string for unlock button
  const unlockPrice =
    products && products.length > 0 && products[0].localizedPrice
      ? products[0].localizedPrice
      : '$5.99';

  // Render unlock/restore buttons
  const renderUnlockButtons = () => {
    if (unlocked || Platform.OS !== 'ios') return null;
    return (
      <>
        <TouchableOpacity
          style={styles.unlockButton}
          onPress={handleUnlock}
          disabled={purchaseInProgress}
        >
          <Text style={styles.unlockButtonText}>
            {t('Unlock All Levels')} ({unlockPrice})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={purchaseInProgress}
        >
          <Text style={styles.restoreButtonText}>{t('Restore Purchases')}</Text>
        </TouchableOpacity>
      </>
    );
  };

  // Modal for locked level
  const renderUnlockModal = () => {
    if (!showUnlockModal) return null;
    return (
      <Modal
        visible={showUnlockModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowUnlockModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('Unlock All Levels')}</Text>
            <Text style={styles.modalText}>
              {t('This level is locked. Unlock all levels to play!')}
            </Text>
            {Platform.OS === 'ios' && !unlocked && (
              <>
                <TouchableOpacity
                  style={styles.modalUnlockButton}
                  onPress={() => {
                    setShowUnlockModal(false);
                    handleUnlock();
                  }}
                  disabled={purchaseInProgress}
                >
                  <Text style={styles.modalUnlockButtonText}>
                    {t('Unlock All Levels')} ({unlockPrice})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalRestoreButton}
                  onPress={() => {
                    setShowUnlockModal(false);
                    handleRestore();
                  }}
                  disabled={purchaseInProgress}
                >
                  <Text style={styles.modalRestoreButtonText}>{t('Restore Purchases')}</Text>
                </TouchableOpacity>
              </>
            )}
            <Pressable
              style={styles.modalCloseButton}
              onPress={() => setShowUnlockModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>{t('Close')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  };

  if (!bgReady || !imgsReady || !iapInitialized) {
    return (
      <View
        style={[
          dynStyles.menuContainer,
          { justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFDAB9' },
        ]}
      >
        <ActivityIndicator size="large" color="orange" />
      </View>
    );
  }

  // sizing logic
  const portraitSize = (width * 0.9 / NUM_COLS) - (MARGIN * 2);
  const landscapeSize = (width * 0.65 / NUM_COLS) - (MARGIN * 2);
  const itemSize = isLandscape ? landscapeSize : portraitSize;

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Русский' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
    { code: 'it', name: 'Italiano' },
    { code: 'tr', name: 'Türkçe' },
  ];

  // Determine locked state for each level
  const getIsLocked = (level: string) => {
    if (level === 'farm') return false;
    if (level === 'arctic') return false;
    if (level === 'desert') return false;
    if (level === 'savannah') return false;
    if (level === 'jungle') return false;
    if (level === 'birds') return false;
    if (level === 'insects') return false;
    if (level === 'forest') return false;
    if (level === 'ocean') return false;

    return !unlocked;
  };

  if (isLandscape) {
    return (
      <ImageBackground
        source={
          backgroundImageUri
            ? { uri: backgroundImageUri }
            : bgUri
            ? { uri: bgUri }
            : BG_IMAGE
        }
        style={{ flex: 1, position: 'relative' }}
        resizeMode="cover"
      >
        <View style={{ flex: 1 }}>
          <View style={styles.landscapeLangContainer}>
            <LanguageSelector
              isLandscape={isLandscape}
              t={t}
              lang={lang}
              languages={languages}
              handleLanguageChange={setLang}
            />
          </View>
          <View style={styles.landscapeHeaderContainer}>
            <Image
              source={require('../src/assets/images/game-logo.png')}
              style={styles.landscapeLogo}
              resizeMode="contain"
            />
          </View>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              flexGrow: 1,
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingHorizontal: 32,
              paddingTop: 8,
              paddingBottom: 16,
              minHeight: itemSize + MARGIN * 2,
            }}
            showsVerticalScrollIndicator={true}
          >
            <View
              style={{
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LevelTiles
                levels={LEVELS}
                numColumns={NUM_COLS}
                isLandscape={isLandscape}
                itemSize={itemSize}
                margin={MARGIN}
                LEVEL_BACKGROUNDS={LEVEL_BACKGROUNDS}
                handleLevelSelect={(level: string) => handleSelect(level, getIsLocked(level))}
                styles={styles}
                getLevelBackgroundColor={getLevelBackgroundColor}
                t={t}
                getIsLocked={getIsLocked}
              />
              {renderUnlockButtons()}
            </View>
          </ScrollView>
          {renderUnlockModal()}
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={
        backgroundImageUri
          ? { uri: backgroundImageUri }
          : bgUri
          ? { uri: bgUri }
          : BG_IMAGE
      }
      style={{ flex: 1, position: 'relative' }}
      resizeMode="cover"
    >
      <View style={styles.portraitHeaderContainer} pointerEvents="box-none">
        <Image
          source={require('../src/assets/images/game-logo.png')}
          style={styles.portraitLogo}
          resizeMode="contain"
        />
        <View style={styles.portraitLanguageSelector}>
          <LanguageSelector
            isLandscape={isLandscape}
            t={t}
            lang={lang}
            languages={languages}
            handleLanguageChange={setLang}
          />
        </View>
      </View>
      <View
        style={[
          styles.tilesContainer,
          { top: 270, flex: 1 }
        ]}
      >
        <LevelTiles
          levels={LEVELS}
          numColumns={NUM_COLS}
          isLandscape={isLandscape}
          itemSize={itemSize}
          margin={MARGIN}
          LEVEL_BACKGROUNDS={LEVEL_BACKGROUNDS}
          handleLevelSelect={(level: string) => handleSelect(level, getIsLocked(level))}
          styles={styles}
          getLevelBackgroundColor={getLevelBackgroundColor}
          t={t}
          getIsLocked={getIsLocked}
        />
        {renderUnlockButtons()}
      </View>
      {renderUnlockModal()}
    </ImageBackground>
  );
}
