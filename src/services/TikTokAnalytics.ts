import { Platform } from 'react-native';

// Dynamically import TikTok SDK
let TikTokSDK: any = null;
let isSDKAvailable = false;

try {
  TikTokSDK = require('react-native-tiktok-business-sdk');
  isSDKAvailable = true;
} catch (error) {
  isSDKAvailable = false;
  console.warn('⚠️ TikTok Business SDK not available. Using fallback mode.');
}

class TikTokAnalytics {
  private isInitialized = false;
  private ttAppId: string = '';
  private accessToken: string = '';
  private appId: string = '';
  private debugMode: boolean = false;

  /**
   * Initialize TikTok Analytics
   * @param appId - Your app bundle ID (defaults to 'com.metaltorchlabs.pixieplay')
   * @param ttAppId - TikTok App ID / Pixel ID (defaults to '7568899277611696136' - hardcoded)
   * @param accessToken - TikTok Access Token from Events Manager
   * @param debugMode - Enable debug logging
   * 
   * Hardcoded values:
   * - TikTok App ID: 7568899277611696136
   * - App Name: Animal Detective For Kids
   * - App ID: 6751962145
   */
  async initialize(
    appId?: string,
    ttAppId?: string,
    accessToken?: string,
    debugMode: boolean = false
  ): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // Hardcoded TikTok App ID: 7568899277611696136
    // App Name: Animal Detective For Kids
    // App ID: 6751962145
    this.appId = appId || 'com.metaltorchlabs.pixieplay';
    this.ttAppId = ttAppId || '7568899277611696136'; // TikTok App ID (hardcoded)
    this.accessToken = accessToken || '';
    this.debugMode = debugMode || __DEV__;

    if (!isSDKAvailable) {
      console.log('⚠️ TikTok SDK: Native module not available, using fallback');
      console.log('💡 For production, create a development build: npx expo run:ios or eas build');
      return;
    }

    try {
      if (Platform.OS === 'ios') {
        await TikTokSDK.initializeWithAppId(this.appId, this.ttAppId, this.accessToken);
      } else if (Platform.OS === 'android') {
        await TikTokSDK.initialize(this.ttAppId, this.accessToken);
      }
      
      this.isInitialized = true;
      console.log('✅ TikTok Analytics initialized', {
        appId: this.appId,
        ttAppId: this.ttAppId,
        platform: Platform.OS,
      });
    } catch (error) {
      console.warn('Failed to initialize TikTok Analytics:', error);
    }
  }

  /**
   * Track a standard TikTok event
   */
  private async trackEvent(
    eventName: string,
    properties?: Record<string, any>
  ): Promise<void> {
    if (!this.isInitialized && isSDKAvailable) {
      console.warn('⚠️ TikTok Analytics not initialized. Call initialize() first.');
      return;
    }

    try {
      if (isSDKAvailable && TikTokSDK) {
        if (Platform.OS === 'ios') {
          await TikTokSDK.trackEvent(eventName, properties || {});
        } else if (Platform.OS === 'android') {
          await TikTokSDK.trackEvent(eventName, properties || {});
        }
        
        if (this.debugMode) {
          console.log(`📊 TikTok Event: ${eventName}`, properties || {});
        }
      }
    } catch (error) {
      console.warn(`Failed to track TikTok event ${eventName}:`, error);
    }
  }

  /**
   * Track app launch
   */
  async trackAppOpen(): Promise<void> {
    await this.trackEvent('LAUNCH_APP', {
      timestamp: Date.now(),
    });
  }

  /**
   * Track session start
   */
  async trackSessionStarted(): Promise<void> {
    await this.trackEvent('LAUNCH_APP', {
      event_type: 'session_start',
      timestamp: Date.now(),
    });
  }

  /**
   * Track level completion
   */
  async trackLevelCompleted(
    levelName: string,
    animalsFound: number,
    timeSpent?: number
  ): Promise<void> {
    await this.trackEvent('ACHIEVE_LEVEL', {
      level_name: levelName,
      level_id: levelName.toLowerCase(),
      animals_found: animalsFound,
      total_animals: 7,
      time_spent: timeSpent,
      timestamp: Date.now(),
    });
  }

  /**
   * Track animal discovery
   */
  async trackAnimalDiscovered(
    animalName: string,
    levelName: string,
    animalIndex: number
  ): Promise<void> {
    await this.trackEvent('VIEW_CONTENT', {
      content_type: 'animal',
      content_name: animalName,
      content_id: `${levelName}_${animalName}`,
      level_name: levelName,
      animal_index: animalIndex,
      timestamp: Date.now(),
    });
  }

  /**
   * Track level selection
   */
  async trackLevelSelected(levelName: string, isUnlocked: boolean): Promise<void> {
    await this.trackEvent('VIEW_CONTENT', {
      content_type: 'level',
      content_name: levelName,
      content_id: levelName.toLowerCase(),
      is_unlocked: isUnlocked,
      timestamp: Date.now(),
    });
  }

  /**
   * Track purchase
   */
  async trackPurchase(
    amount: number,
    currency: string = 'USD',
    productId?: string,
    orderId?: string
  ): Promise<void> {
    await this.trackEvent('PURCHASE', {
      value: amount,
      currency: currency,
      content_type: 'in_app_purchase',
      content_id: productId,
      order_id: orderId,
      timestamp: Date.now(),
    });
  }

  /**
   * Track tutorial completion
   */
  async trackTutorialCompleted(): Promise<void> {
    await this.trackEvent('COMPLETE_TUTORIAL', {
      timestamp: Date.now(),
    });
  }

  /**
   * Track achievement unlock
   */
  async trackAchievementUnlocked(achievementName: string): Promise<void> {
    await this.trackEvent('UNLOCK_ACHIEVEMENT', {
      achievement_name: achievementName,
      timestamp: Date.now(),
    });
  }

  /**
   * Track user engagement
   */
  async trackUserEngagement(eventType: string, context?: Record<string, any>): Promise<void> {
    await this.trackEvent('SEARCH', {
      event_type: eventType,
      ...context,
      timestamp: Date.now(),
    });
  }

  /**
   * Track custom event
   */
  async trackCustomEvent(eventName: string, properties?: Record<string, any>): Promise<void> {
    await this.trackEvent(eventName, {
      ...properties,
      timestamp: Date.now(),
    });
  }

  /**
   * Identify user (for better attribution)
   */
  async identifyUser(
    externalUserId?: string,
    phoneNumber?: string,
    email?: string,
    additionalProperties?: Record<string, any>
  ): Promise<void> {
    if (!isSDKAvailable || !TikTokSDK) {
      return;
    }

    try {
      const properties: Record<string, any> = {
        ...additionalProperties,
      };

      if (externalUserId) {
        properties.external_id = externalUserId;
      }
      if (phoneNumber) {
        properties.phone_number = phoneNumber;
      }
      if (email) {
        properties.email = email;
      }

      if (Platform.OS === 'ios') {
        await TikTokSDK.identify(properties);
      } else if (Platform.OS === 'android') {
        await TikTokSDK.identify(properties);
      }

      if (this.debugMode) {
        console.log('📊 TikTok User Identified:', properties);
      }
    } catch (error) {
      console.warn('Failed to identify user in TikTok:', error);
    }
  }

  /**
   * Track registration
   */
  async trackRegistration(userId?: string): Promise<void> {
    await this.trackEvent('REGISTRATION', {
      user_id: userId,
      timestamp: Date.now(),
    });
  }

  /**
   * Track login
   */
  async trackLogin(userId?: string): Promise<void> {
    await this.trackEvent('LOGIN', {
      user_id: userId,
      timestamp: Date.now(),
    });
  }
}

export default new TikTokAnalytics();
