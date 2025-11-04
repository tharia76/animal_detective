// Try to import Firebase Analytics, fallback gracefully if not available
let analytics: any = null;
let firebaseAvailable = false;

try {
  analytics = require('@react-native-firebase/analytics').default;
  firebaseAvailable = true;
} catch (error) {
  console.warn('Firebase Analytics not available - native module may not be linked');
  firebaseAvailable = false;
}

import { Platform } from 'react-native';

/**
 * Firebase Analytics Service for Animal Detective
 * Tracks user behavior, app usage, and key events using Firebase Analytics
 * Gracefully handles cases where Firebase native module is not linked
 */
class FirebaseAnalyticsService {
  private isInitialized = false;

  /**
   * Initialize Firebase Analytics service
   */
  async initialize() {
    if (this.isInitialized) return;
    
    if (!firebaseAvailable || !analytics) {
      console.warn('⚠️ Firebase Analytics native module not available. Skipping initialization.');
      console.warn('💡 To enable Firebase: run "cd ios && pod install" and rebuild the app.');
      return;
    }
    
    try {
      // Firebase Analytics is automatically initialized when FirebaseApp.configure() is called
      // in AppDelegate.swift (iOS) and via google-services.json (Android)
      await analytics().setAnalyticsCollectionEnabled(true);
      
      this.isInitialized = true;
      console.log('📊 Firebase Analytics initialized');
    } catch (error) {
      console.warn('Firebase Analytics initialization error:', error);
      console.warn('💡 Ensure Firebase is properly configured and native modules are linked.');
    }
  }

  /**
   * Track app opens
   */
  async trackAppOpen() {
    if (!firebaseAvailable || !analytics || !this.isInitialized) return;
    
    try {
      await analytics().logEvent('app_open', {
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
   * Helper method to check if Firebase is available before tracking
   */
  private checkFirebaseAvailable(): boolean {
    if (!firebaseAvailable || !analytics || !this.isInitialized) {
      return false;
    }
    return true;
  }

  /**
   * Track level completions
   */
  async trackLevelCompleted(levelName: string, animalsFound: number, completionTime?: number) {
    if (!this.checkFirebaseAvailable()) return;
    
    try {
      const parameters: Record<string, any> = {
        level_name: levelName,
        animals_found: animalsFound,
        timestamp: Date.now()
      };
      
      if (completionTime) {
        parameters.completion_time = completionTime;
      }
      
      await analytics().logEvent('level_completed', parameters);
      console.log(`📊 Level completed: ${levelName}`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track animal discoveries
   */
  async trackAnimalDiscovered(animalName: string, levelName: string, discoveryOrder?: number) {
    if (!this.checkFirebaseAvailable()) return;
    
    try {
      const parameters: Record<string, any> = {
        animal_name: animalName,
        level_name: levelName,
        timestamp: Date.now()
      };
      
      if (discoveryOrder) {
        parameters.discovery_order = discoveryOrder;
      }
      
      await analytics().logEvent('animal_discovered', parameters);
      console.log(`📊 Animal discovered: ${animalName}`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track in-app purchases
   */
  async trackPurchase(price: number, currency: string = 'USD', productId?: string) {
    if (!this.checkFirebaseAvailable()) return;
    
    try {
      // Use standard Firebase Analytics purchase event
      await analytics().logEvent('purchase', {
        value: price,
        currency: currency,
        items: productId ? [{ item_id: productId }] : []
      });
      
      if (productId) {
        await analytics().logEvent('purchase_completed', {
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
    if (!this.checkFirebaseAvailable()) return;
    
    try {
      const parameters: Record<string, any> = {
        action: action,
        level_name: levelName || 'menu',
        timestamp: Date.now()
      };
      
      if (additionalParams) {
        Object.assign(parameters, additionalParams);
      }
      
      await analytics().logEvent('user_engagement', parameters);
      console.log(`📊 User engagement: ${action}`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track level selection
   */
  async trackLevelSelected(levelName: string, isLocked: boolean = false) {
    if (!this.checkFirebaseAvailable()) return;
    
    try {
      await analytics().logEvent('level_selected', {
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
    if (!this.checkFirebaseAvailable()) return;
    
    try {
      await analytics().logEvent('session_started', {
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
    if (!this.checkFirebaseAvailable()) return;
    
    try {
      const parameters: Record<string, any> = {
        setting_name: settingName,
        new_value: String(newValue),
        timestamp: Date.now()
      };
      
      if (oldValue !== undefined) {
        parameters.old_value = String(oldValue);
      }
      
      await analytics().logEvent('settings_changed', parameters);
      console.log(`📊 Settings changed: ${settingName}`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track custom events
   */
  async trackCustomEvent(eventName: string, parameters?: Record<string, any>) {
    if (!this.checkFirebaseAvailable()) return;
    
    try {
      const eventParams: Record<string, any> = {
        timestamp: Date.now()
      };
      
      if (parameters) {
        Object.assign(eventParams, parameters);
      }
      
      await analytics().logEvent(eventName, eventParams);
      console.log(`📊 Custom event tracked: ${eventName}`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Set user properties
   */
  async setUserProperties(properties: Record<string, string>) {
    if (!this.checkFirebaseAvailable()) return;
    
    try {
      for (const [key, value] of Object.entries(properties)) {
        await analytics().setUserProperty(key, value);
      }
      console.log('📊 User properties set:', properties);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Set user ID
   */
  async setUserId(userId: string) {
    if (!this.checkFirebaseAvailable()) return;
    
    try {
      await analytics().setUserId(userId);
      console.log('📊 User ID set:', userId);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track app installs (for attribution)
   */
  async trackAppInstall() {
    if (!this.checkFirebaseAvailable()) return;
    
    try {
      await analytics().logEvent('app_install', {
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
    if (!this.checkFirebaseAvailable()) return;
    
    try {
      await analytics().logEvent('tutorial_completed', {
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
    if (!this.checkFirebaseAvailable()) return;
    
    try {
      const parameters: Record<string, any> = {
        achievement_name: achievementName,
        timestamp: Date.now()
      };
      
      if (levelName) {
        parameters.level_name = levelName;
      }
      
      await analytics().logEvent('achievement_unlocked', parameters);
      console.log(`📊 Achievement unlocked: ${achievementName}`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }
}

export default new FirebaseAnalyticsService();

