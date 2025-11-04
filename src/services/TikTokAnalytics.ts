import {
  initializeSdk,
  identify,
  trackEvent,
  TikTokEventName,
  TikTokContentEventName,
  TikTokContentEventParameter,
  TikTokContentEventContentsParameter,
} from 'react-native-tiktok-business-sdk';
import { Platform } from 'react-native';

/**
 * TikTok Analytics Service for Animal Detective
 * Tracks user behavior, app usage, and key events using TikTok Business SDK
 */
class TikTokAnalyticsService {
  private isInitialized = false;
  private appId: string | null = null;
  private ttAppId: string | null = null;
  private accessToken: string | null = null;

  /**
   * Initialize TikTok Analytics service
   * @param appId - Your app ID (Android package name or iOS bundle ID)
   * @param ttAppId - Your TikTok App ID from TikTok Events Manager (optional - defaults to configured value)
   * @param accessToken - Your access token from TikTok Events Manager (optional - defaults to configured value)
   * @param debug - Whether to enable debug mode
   */
  async initialize(
    appId?: string,
    ttAppId?: string,
    accessToken?: string,
    debug: boolean = false
  ) {
    if (this.isInitialized) return;
    
    try {
      // Hardcoded TikTok configuration
      this.appId = appId || (Platform.OS === 'ios' 
        ? 'com.metaltorchlabs.pixieplay' 
        : 'com.metaltorchlabs.pixieplay');
      this.ttAppId = ttAppId || '7568899277611696136'; // TikTok App ID: 7568899277611696136
      this.accessToken = accessToken || 'YOUR_ACCESS_TOKEN'; // Get from TikTok Events Manager → Settings → Access Token

      // Initialize TikTok SDK
      await initializeSdk(this.appId, this.ttAppId, this.accessToken, debug);
      
      this.isInitialized = true;
      console.log('📱 TikTok Analytics initialized');
    } catch (error) {
      console.warn('TikTok Analytics initialization error:', error);
    }
  }

  /**
   * Identify a user
   * @param externalId - External user ID
   * @param externalUserName - External username
   * @param phoneNumber - User phone number (optional)
   * @param email - User email (optional)
   */
  async identifyUser(
    externalId?: string,
    externalUserName?: string,
    phoneNumber?: string,
    email?: string
  ) {
    try {
      await identify(externalId, externalUserName, phoneNumber, email);
      console.log('📱 User identified');
    } catch (error) {
      console.warn('TikTok identify error:', error);
    }
  }

  /**
   * Track app opens
   */
  async trackAppOpen() {
    try {
      await trackEvent(TikTokEventName.LAUNCH_APP, {});
      console.log('📱 App open tracked');
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track app installs
   */
  async trackAppInstall() {
    try {
      await trackEvent(TikTokEventName.INSTALL_APP, {
        platform: Platform.OS,
        timestamp: Date.now()
      });
      console.log('📱 App install tracked');
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track level completions
   */
  async trackLevelCompleted(levelName: string, animalsFound: number, completionTime?: number) {
    try {
      await trackEvent(TikTokEventName.ACHIEVE_LEVEL, {
        level_name: levelName,
        animals_found: animalsFound,
        completion_time: completionTime,
        timestamp: Date.now()
      });
      console.log(`📱 Level completed: ${levelName}`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track animal discoveries
   */
  async trackAnimalDiscovered(animalName: string, levelName: string, discoveryOrder?: number) {
    try {
      await trackEvent(TikTokContentEventName.VIEW_CONTENT, {
        [TikTokContentEventParameter.CONTENT_TYPE]: 'animal',
        [TikTokContentEventParameter.CONTENT_ID]: animalName,
        [TikTokContentEventParameter.DESCRIPTION]: `Animal discovered in ${levelName}`,
        level_name: levelName,
        discovery_order: discoveryOrder,
        timestamp: Date.now()
      });
      console.log(`📱 Animal discovered: ${animalName}`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track in-app purchases
   */
  async trackPurchase(price: number, currency: string = 'USD', productId?: string, orderId?: string) {
    try {
      const parameters: Record<string, any> = {
        [TikTokContentEventParameter.CURRENCY]: currency,
        [TikTokContentEventParameter.VALUE]: price,
        timestamp: Date.now()
      };

      if (productId) {
        parameters[TikTokContentEventParameter.CONTENT_ID] = productId;
      }

      if (orderId) {
        parameters[TikTokContentEventParameter.ORDER_ID] = orderId;
      }

      await trackEvent(TikTokContentEventName.PURCHASE, parameters);
      console.log(`📱 Purchase tracked: ${price} ${currency}`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track user engagement
   */
  async trackUserEngagement(action: string, levelName?: string, additionalParams?: Record<string, any>) {
    try {
      const parameters: Record<string, any> = {
        action: action,
        level_name: levelName || 'menu',
        timestamp: Date.now()
      };
      
      if (additionalParams) {
        Object.assign(parameters, additionalParams);
      }
      
      await trackEvent(TikTokEventName.SEARCH, parameters); // Using SEARCH as engagement event
      console.log(`📱 User engagement: ${action}`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track level selection
   */
  async trackLevelSelected(levelName: string, isLocked: boolean = false) {
    try {
      await trackEvent(TikTokContentEventName.VIEW_CONTENT, {
        [TikTokContentEventParameter.CONTENT_TYPE]: 'level',
        [TikTokContentEventParameter.CONTENT_ID]: levelName,
        is_locked: isLocked ? 'true' : 'false',
        timestamp: Date.now()
      });
      console.log(`📱 Level selected: ${levelName}`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track session events
   */
  async trackSessionStarted() {
    try {
      await trackEvent(TikTokEventName.LAUNCH_APP, {
        platform: Platform.OS,
        timestamp: Date.now()
      });
      console.log('📱 Session started');
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track tutorial completion
   */
  async trackTutorialCompleted(stepName: string, totalSteps: number) {
    try {
      await trackEvent(TikTokEventName.COMPLETE_TUTORIAL, {
        step_name: stepName,
        total_steps: totalSteps,
        timestamp: Date.now()
      });
      console.log(`📱 Tutorial completed: ${stepName}`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track achievement unlocks
   */
  async trackAchievementUnlocked(achievementName: string, levelName?: string) {
    try {
      const parameters: Record<string, any> = {
        achievement_name: achievementName,
        timestamp: Date.now()
      };
      
      if (levelName) {
        parameters.level_name = levelName;
      }
      
      await trackEvent(TikTokEventName.UNLOCK_ACHIEVEMENT, parameters);
      console.log(`📱 Achievement unlocked: ${achievementName}`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track custom events
   */
  async trackCustomEvent(eventName: string, parameters?: Record<string, any>) {
    try {
      const eventParams: Record<string, any> = {
        timestamp: Date.now()
      };
      
      if (parameters) {
        Object.assign(eventParams, parameters);
      }
      
      await trackEvent(eventName as any, eventParams);
      console.log(`📱 Custom event tracked: ${eventName}`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track registration
   */
  async trackRegistration(userId?: string) {
    try {
      await trackEvent(TikTokEventName.REGISTRATION, {
        user_id: userId,
        timestamp: Date.now()
      });
      console.log('📱 Registration tracked');
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track login
   */
  async trackLogin(userId?: string) {
    try {
      await trackEvent(TikTokEventName.LOGIN, {
        user_id: userId,
        timestamp: Date.now()
      });
      console.log('📱 Login tracked');
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }
}

export default new TikTokAnalyticsService();

