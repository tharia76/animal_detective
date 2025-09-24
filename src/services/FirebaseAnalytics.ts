import analytics from '@react-native-firebase/analytics';
import { Platform } from 'react-native';

/**
 * Firebase Analytics Service for Animal Detective
 * Tracks user behavior, app usage, and key events
 */
class FirebaseAnalyticsService {
  private isInitialized = false;

  /**
   * Initialize analytics service
   */
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Set user properties
      await this.setUserProperties({
        app_version: '1.0.0',
        platform: Platform.OS,
        app_name: 'Animal Detective'
      });
      
      this.isInitialized = true;
      console.log('📊 Firebase Analytics initialized');
    } catch (error) {
      console.warn('Analytics initialization error:', error);
    }
  }

  /**
   * Track app opens
   */
  async trackAppOpen() {
    try {
      await analytics().logAppOpen();
      console.log('📊 App open tracked');
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track level completions
   */
  async trackLevelCompleted(levelName: string, animalsFound: number, totalAnimals: number) {
    try {
      await analytics().logEvent('level_completed', {
        level_name: levelName,
        animals_found: animalsFound,
        total_animals: totalAnimals,
        completion_percentage: Math.round((animalsFound / totalAnimals) * 100),
        timestamp: new Date().toISOString()
      });
      console.log(`📊 Level completed: ${levelName} (${animalsFound}/${totalAnimals})`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track animal discoveries
   */
  async trackAnimalDiscovered(animalName: string, levelName: string, animalIndex: number) {
    try {
      await analytics().logEvent('animal_discovered', {
        animal_name: animalName,
        level_name: levelName,
        animal_index: animalIndex,
        timestamp: new Date().toISOString()
      });
      console.log(`📊 Animal discovered: ${animalName} in ${levelName}`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track level selections
   */
  async trackLevelSelected(levelName: string, isLocked: boolean) {
    try {
      await analytics().logEvent('level_selected', {
        level_name: levelName,
        is_locked: isLocked,
        timestamp: new Date().toISOString()
      });
      console.log(`📊 Level selected: ${levelName} (locked: ${isLocked})`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track in-app purchases
   */
  async trackPurchase(productId: string, price: number, currency: string = 'USD') {
    try {
      await analytics().logPurchase({
        value: price,
        currency: currency,
        items: [{
          item_id: productId,
          item_name: 'Unlock All Levels',
          item_category: 'premium_upgrade',
          quantity: 1,
          price: price
        }]
      });
      console.log(`📊 Purchase tracked: ${productId} - $${price}`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track user engagement actions
   */
  async trackUserEngagement(action: string, levelName?: string, additionalData?: Record<string, any>) {
    try {
      const eventData: Record<string, any> = {
        action: action,
        level_name: levelName || 'menu',
        timestamp: new Date().toISOString(),
        ...additionalData
      };
      
      await analytics().logEvent('user_engagement', eventData);
      console.log(`📊 User engagement: ${action}${levelName ? ` in ${levelName}` : ''}`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track settings changes
   */
  async trackSettingsChange(setting: string, oldValue: any, newValue: any) {
    try {
      await analytics().logEvent('settings_changed', {
        setting_name: setting,
        old_value: String(oldValue),
        new_value: String(newValue),
        timestamp: new Date().toISOString()
      });
      console.log(`📊 Settings changed: ${setting} from ${oldValue} to ${newValue}`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track language changes
   */
  async trackLanguageChange(oldLanguage: string, newLanguage: string) {
    try {
      await analytics().logEvent('language_changed', {
        old_language: oldLanguage,
        new_language: newLanguage,
        timestamp: new Date().toISOString()
      });
      console.log(`📊 Language changed: ${oldLanguage} → ${newLanguage}`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track volume changes
   */
  async trackVolumeChange(oldVolume: number, newVolume: number) {
    try {
      await analytics().logEvent('volume_changed', {
        old_volume: oldVolume,
        new_volume: newVolume,
        volume_difference: newVolume - oldVolume,
        timestamp: new Date().toISOString()
      });
      console.log(`📊 Volume changed: ${oldVolume} → ${newVolume}`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track navigation between animals
   */
  async trackAnimalNavigation(direction: 'next' | 'prev', currentIndex: number, levelName: string) {
    try {
      await analytics().logEvent('animal_navigation', {
        direction: direction,
        current_index: currentIndex,
        level_name: levelName,
        timestamp: new Date().toISOString()
      });
      console.log(`📊 Animal navigation: ${direction} to index ${currentIndex} in ${levelName}`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track app session duration
   */
  async trackSessionDuration(duration: number, levelName?: string) {
    try {
      await analytics().logEvent('session_duration', {
        duration_seconds: duration,
        level_name: levelName || 'menu',
        timestamp: new Date().toISOString()
      });
      console.log(`📊 Session duration: ${duration}s${levelName ? ` in ${levelName}` : ''}`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track background music interactions
   */
  async trackMusicInteraction(action: 'play' | 'pause' | 'duck' | 'restore', levelName?: string) {
    try {
      await analytics().logEvent('music_interaction', {
        action: action,
        level_name: levelName || 'menu',
        timestamp: new Date().toISOString()
      });
      console.log(`📊 Music interaction: ${action}${levelName ? ` in ${levelName}` : ''}`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Set user properties
   */
  async setUserProperties(properties: Record<string, string>) {
    try {
      for (const [key, value] of Object.entries(properties)) {
        await analytics().setUserProperty(key, value);
      }
      console.log('📊 User properties set:', Object.keys(properties));
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Set user ID for better tracking
   */
  async setUserId(userId: string) {
    try {
      await analytics().setUserId(userId);
      console.log('📊 User ID set:', userId);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Track custom events
   */
  async trackCustomEvent(eventName: string, parameters?: Record<string, any>) {
    try {
      const eventData = {
        timestamp: new Date().toISOString(),
        ...parameters
      };
      
      await analytics().logEvent(eventName, eventData);
      console.log(`📊 Custom event: ${eventName}`, eventData);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }

  /**
   * Enable/disable analytics (for privacy compliance)
   */
  async setAnalyticsEnabled(enabled: boolean) {
    try {
      await analytics().setAnalyticsCollectionEnabled(enabled);
      console.log(`📊 Analytics ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  }
}

export default new FirebaseAnalyticsService();
