import * as Facebook from 'expo-facebook';
import { Platform } from 'react-native';

// Try to import AppEventsLogger from react-native-fbads
let AppEventsLogger: any = null;
try {
  const fbads = require('react-native-fbads');
  AppEventsLogger = fbads.AppEventsLogger;
} catch (error) {
  console.warn('react-native-fbads not available, using expo-facebook');
}

/**
 * Facebook Analytics Service for Animal Detective
 * Tracks user behavior, app usage, and key events using Meta App Events
 * Uses AppEventsLogger from react-native-fbads when available, falls back to expo-facebook
 */
class FacebookAnalyticsService {
  private isInitialized = false;
  private appId: string | null = null;
  private useAppEventsLogger = AppEventsLogger !== null;

  /**
   * Initialize Facebook Analytics service
   */
  async initialize(appId?: string) {
    if (this.isInitialized) return;
    
    try {
      this.appId = appId || '2048296882646951';
      
      // Initialize Facebook SDK (expo-facebook)
      await Facebook.initializeAsync({ appId: this.appId });
      
      // If using AppEventsLogger, it's already initialized via native code
      if (this.useAppEventsLogger) {
        console.log('📊 Facebook Analytics initialized with AppEventsLogger');
      } else {
        console.log('📊 Facebook Analytics initialized with expo-facebook');
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.warn('Facebook Analytics initialization error:', error);
    }
  }

  /**
   * Helper method to log events using AppEventsLogger or expo-facebook
   */
  private async logEvent(eventName: string, parameters?: Record<string, any>) {
    // Check if Facebook SDK is available
    if (!Facebook || typeof Facebook.logEventAsync !== 'function') {
      console.warn('Facebook SDK not available for logging event:', eventName);
      return;
    }

    if (this.useAppEventsLogger && AppEventsLogger) {
      // Use AppEventsLogger from react-native-fbads (synchronous)
      try {
        AppEventsLogger.logEvent(eventName, parameters || {});
      } catch (error) {
        console.warn('AppEventsLogger error:', error);
        // Fallback to expo-facebook if AppEventsLogger fails
        try {
          await Facebook.logEventAsync(eventName, parameters || {});
        } catch (fbError) {
          console.warn('Facebook.logEventAsync error:', fbError);
        }
      }
    } else {
      // Fallback to expo-facebook
      try {
        await Facebook.logEventAsync(eventName, parameters || {});
      } catch (error) {
        console.warn('Facebook.logEventAsync error:', error);
      }
    }
  }

  /**
   * Track app opens
   */
  async trackAppOpen() {
    try {
      await this.logEvent('app_open', {
        platform: Platform.OS,
        app_version: '1.0.0',
        timestamp: Date.now()
      });
      console.log('📊 App open tracked');
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track level completions
   */
  async trackLevelCompleted(levelName: string, animalsFound: number, completionTime?: number) {
    try {
      const parameters: Record<string, any> = {
        level_name: levelName,
        animals_found: animalsFound,
        timestamp: Date.now()
      };
      
      if (completionTime) {
        parameters.completion_time = completionTime;
      }
      
      await this.logEvent('level_completed', parameters);
      console.log(`📊 Level completed: ${levelName}`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track animal discoveries
   */
  async trackAnimalDiscovered(animalName: string, levelName: string, discoveryOrder?: number) {
    try {
      const parameters: Record<string, any> = {
        animal_name: animalName,
        level_name: levelName,
        timestamp: Date.now()
      };
      
      if (discoveryOrder) {
        parameters.discovery_order = discoveryOrder;
      }
      
      await this.logEvent('animal_discovered', parameters);
      console.log(`📊 Animal discovered: ${animalName}`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track in-app purchases
   */
  async trackPurchase(price: number, currency: string = 'USD', productId?: string) {
    try {
      // Check if Facebook SDK is available
      if (Facebook && typeof Facebook.logPurchaseAsync === 'function') {
        await Facebook.logPurchaseAsync(price, currency);
      } else {
        console.warn('Facebook.logPurchaseAsync not available');
      }
      
      if (productId) {
        await this.logEvent('purchase_completed', {
          product_id: productId,
          price: price,
          currency: currency,
          timestamp: Date.now()
        });
      }
      
      console.log(`📊 Purchase tracked: ${price} ${currency}`);
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
      
      await this.logEvent('user_engagement', parameters);
      console.log(`📊 User engagement: ${action}`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track level selection
   */
  async trackLevelSelected(levelName: string, isLocked: boolean = false) {
    try {
      await this.logEvent('level_selected', {
        level_name: levelName,
        is_locked: isLocked ? 'true' : 'false',
        timestamp: Date.now()
      });
      console.log(`📊 Level selected: ${levelName}`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track session events
   */
  async trackSessionStarted() {
    try {
      await this.logEvent('session_started', {
        platform: Platform.OS,
        timestamp: Date.now()
      });
      console.log('📊 Session started');
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track settings changes
   */
  async trackSettingsChanged(settingName: string, newValue: any, oldValue?: any) {
    try {
      const parameters: Record<string, any> = {
        setting_name: settingName,
        new_value: String(newValue),
        timestamp: Date.now()
      };
      
      if (oldValue !== undefined) {
        parameters.old_value = String(oldValue);
      }
      
      await this.logEvent('settings_changed', parameters);
      console.log(`📊 Settings changed: ${settingName}`);
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
      
      await this.logEvent(eventName, eventParams);
      console.log(`📊 Custom event tracked: ${eventName}`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Set user properties (limited in Facebook SDK)
   */
  async setUserProperties(properties: Record<string, string>) {
    try {
      // Note: Facebook SDK has limited user property setting compared to Firebase
      // This is mainly for internal tracking
      console.log('📊 User properties set:', properties);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track app installs (for attribution)
   */
  async trackAppInstall() {
    try {
      await this.logEvent('app_install', {
        platform: Platform.OS,
        timestamp: Date.now()
      });
      console.log('📊 App install tracked');
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track tutorial completion
   */
  async trackTutorialCompleted(stepName: string, totalSteps: number) {
    try {
      await this.logEvent('tutorial_completed', {
        step_name: stepName,
        total_steps: totalSteps,
        timestamp: Date.now()
      });
      console.log(`📊 Tutorial completed: ${stepName}`);
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
      
      await this.logEvent('achievement_unlocked', parameters);
      console.log(`📊 Achievement unlocked: ${achievementName}`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }
}

export default new FacebookAnalyticsService();
