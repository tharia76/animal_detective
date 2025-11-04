import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import FacebookAnalytics from './FacebookAnalytics';

const UNLOCK_ALL_LEVELS_KEY = 'unlocked_all_levels';
const PRODUCT_ID_UNLOCK_ALL = 'animalDetectiveUnclock';

// Dynamically import and check if native module is available
let InAppPurchases: any = null;
let isNativeModuleAvailable = false;

try {
  // Try to import the module
  const IAPModule = require('expo-in-app-purchases');
  InAppPurchases = IAPModule;
  isNativeModuleAvailable = true;
} catch (error) {
  isNativeModuleAvailable = false;
  console.warn('⚠️ expo-in-app-purchases native module not available. Using fallback mode.');
  console.warn('💡 For production, create a development build: npx expo run:ios or eas build');
}

class PurchaseService {
  private isInitialized = false;
  private products: any[] = [];

  /**
   * Initialize the purchase service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // If native module not available, skip initialization
    if (!isNativeModuleAvailable) {
      console.log('⚠️ Purchase service: Native module not available, using fallback');
      return;
    }

    try {
      if (!InAppPurchases) return;
      // Connect to the store
      await InAppPurchases.connectAsync();
      this.isInitialized = true;
      console.log('✅ Purchase service initialized');

      // Load available products
      await this.loadProducts();
    } catch (error) {
      console.warn('Failed to initialize purchase service:', error);
      // Continue anyway - user can still use the app
    }
  }

  /**
   * Load available products from the store
   */
  private async loadProducts(): Promise<void> {
    if (!isNativeModuleAvailable) {
      return;
    }

    try {
      if (!InAppPurchases) return;
      const { results } = await InAppPurchases.getProductsAsync([PRODUCT_ID_UNLOCK_ALL]);
      this.products = results;
      console.log('📦 Loaded products:', results.map(p => p.productId));
    } catch (error) {
      console.warn('Failed to load products:', error);
    }
  }

  /**
   * Get the unlock all levels product
   */
  getUnlockAllProduct(): any | null {
    return this.products.find(p => p.productId === PRODUCT_ID_UNLOCK_ALL) || null;
  }

  /**
   * Get formatted price for unlock all product
   */
  getUnlockAllPrice(): string {
    const product = this.getUnlockAllProduct();
    if (product && 'price' in product) {
      return (product as any).price || '$0.99';
    }
    return '$0.99';
  }

  /**
   * Purchase unlock all levels
   */
  async purchaseUnlockAll(): Promise<boolean> {
    // Fallback mode: For development/testing without native module
    if (!isNativeModuleAvailable) {
      console.log('⚠️ Purchase: Native module not available, using fallback unlock');
      try {
        await AsyncStorage.setItem(UNLOCK_ALL_LEVELS_KEY, 'true');
        await FacebookAnalytics.trackPurchase(0.99, 'USD', PRODUCT_ID_UNLOCK_ALL);
        console.log('✅ Fallback unlock completed (dev mode)');
        return true;
      } catch (error) {
        console.warn('Fallback unlock error:', error);
        return false;
      }
    }

    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const product = this.getUnlockAllProduct();
      if (!product) {
        console.warn('Unlock all product not found');
        return false;
      }

      console.log('💰 Starting purchase for:', product.productId);

      // Purchase the product
      if (!InAppPurchases) return false;
      const { responseCode, results } = await InAppPurchases.purchaseItemAsync(PRODUCT_ID_UNLOCK_ALL);

      if (responseCode === (InAppPurchases?.IAPResponseCode?.OK || 0)) {
        // Purchase successful
        const purchase = results && results[0];
        if (purchase) {
          // Acknowledge the purchase
          if (Platform.OS === 'android' && InAppPurchases) {
            await InAppPurchases.finishTransactionAsync(purchase, true);
          }

          // Unlock all levels
          await AsyncStorage.setItem(UNLOCK_ALL_LEVELS_KEY, 'true');

          // Track purchase in analytics
          const price = parseFloat((product as any).price || '0.99');
          const currencyCode = (product as any).currencyCode || 'USD';
          await FacebookAnalytics.trackPurchase(price, currencyCode, PRODUCT_ID_UNLOCK_ALL);

          console.log('✅ Purchase completed successfully');
          return true;
        }
      } else if (responseCode === (InAppPurchases?.IAPResponseCode?.USER_CANCELED || 1)) {
        console.log('⚠️ User canceled purchase');
        return false;
      } else {
        console.warn('Purchase failed with response code:', responseCode);
        return false;
      }

      return false;
    } catch (error) {
      console.warn('Purchase error:', error);
      return false;
    }
  }

  /**
   * Restore previous purchases
   */
  async restorePurchases(): Promise<boolean> {
    // Fallback mode: Check AsyncStorage
    if (!isNativeModuleAvailable) {
      console.log('⚠️ Restore: Native module not available, checking AsyncStorage');
      try {
        const unlocked = await AsyncStorage.getItem(UNLOCK_ALL_LEVELS_KEY);
        return unlocked === 'true';
      } catch (error) {
        console.warn('Failed to restore from AsyncStorage:', error);
        return false;
      }
    }

    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log('🔄 Restoring purchases...');

      if (!InAppPurchases) return false;
      const { results, responseCode } = await InAppPurchases.getPurchaseHistoryAsync();

      if (responseCode === (InAppPurchases?.IAPResponseCode?.OK || 0) && results) {
        // Check if unlock all was purchased
        const hasUnlockAll = results.some(
          purchase => purchase.productId === PRODUCT_ID_UNLOCK_ALL
        );

        if (hasUnlockAll) {
          await AsyncStorage.setItem(UNLOCK_ALL_LEVELS_KEY, 'true');
          console.log('✅ Restored unlock all levels purchase');
          return true;
        } else {
          console.log('ℹ️ No previous purchases found');
          return false;
        }
      }

      return false;
    } catch (error) {
      console.warn('Failed to restore purchases:', error);
      return false;
    }
  }

  /**
   * Check if all levels are unlocked
   */
  async isUnlocked(): Promise<boolean> {
    try {
      const unlocked = await AsyncStorage.getItem(UNLOCK_ALL_LEVELS_KEY);
      return unlocked === 'true';
    } catch (error) {
      console.warn('Failed to check unlock status:', error);
      return false;
    }
  }

  /**
   * Disconnect from the store
   */
  async disconnect(): Promise<void> {
    if (this.isInitialized && InAppPurchases) {
      try {
        await InAppPurchases.disconnectAsync();
        this.isInitialized = false;
        console.log('📴 Purchase service disconnected');
      } catch (error) {
        console.warn('Failed to disconnect purchase service:', error);
      }
    }
  }
}

export default new PurchaseService();

