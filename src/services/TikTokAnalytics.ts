import { Platform } from 'react-native';

// Dynamically import TikTok SDK
let TikTokBusiness: any = null;
let TikTokEventName: any = null;
let TikTokContentEventName: any = null;
let isSDKAvailable = false;

try {
  const TikTokSDKModule = require('react-native-tiktok-business-sdk');
  TikTokBusiness = TikTokSDKModule.TikTokBusiness || TikTokSDKModule.default || TikTokSDKModule;
  TikTokEventName = TikTokSDKModule.TikTokEventName;
  TikTokContentEventName = TikTokSDKModule.TikTokContentEventName;
  isSDKAvailable = true;
} catch (error) {
  isSDKAvailable = false;
  console.warn('⚠️ TikTok Business SDK not available. Using fallback mode.');
}

class TikTokAnalytics {
  private isInitialized = false;
  private ttAppId: string = '';
  private accessToken: string = '';
  private appSecret: string = '';
  private appId: string = '';
  private debugMode: boolean = false;
  private _hasWarnedAboutInit = false; // Track if we've warned about initialization

  /**
   * Initialize TikTok Analytics
   * @param appId - Your app bundle ID (defaults to 'com.metaltorchlabs.pixieplay')
   * @param ttAppId - TikTok App ID / Pixel ID (defaults to '7568899277611696136' - hardcoded)
   * @param accessToken - TikTok Access Token (optional - not required for mobile SDK)
   * @param debugMode - Enable debug logging
   * 
   * Hardcoded values:
   * - TikTok App ID: 7568899277611696136
   * - App Name: Animal Detective For Kids
   * - App ID: 6751962145
   * - App Secret: TTCYJT3g804mY1GuV1MF9q2l4U9kIYJ5 (stored for server-side API use)
   * 
   * Note: Access Token IS REQUIRED for SDK v1.4.1+ initialization.
   * Get Access Token from TikTok Events Manager → Settings → Access Token.
   * App Secret is stored for server-side Events API use.
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
    // App Secret: TTCYJT3g804mY1GuV1MF9q2l4U9kIYJ5 (for server-side API use)
    this.appId = appId || 'com.metaltorchlabs.pixieplay';
    this.ttAppId = ttAppId || '7568899277611696136'; // TikTok App ID (hardcoded)
    this.appSecret = 'TTCYJT3g804mY1GuV1MF9q2l4U9kIYJ5'; // App Secret (stored for server-side use)
    // Access Token is optional for mobile SDK - pass empty string if not provided
    this.accessToken = accessToken || '';
    this.debugMode = debugMode || __DEV__;

    if (!isSDKAvailable) {
      console.log('⚠️ TikTok SDK: Native module not available, using fallback');
      console.log('💡 For production, create a development build: npx expo run:ios or eas build');
      console.log('💡 Make sure you ran: cd ios && pod install');
      this.isInitialized = false;
      return;
    }

    // Additional SDK availability check
    if (!TikTokBusiness) {
      console.error('❌ TikTokBusiness module is null or undefined');
      console.error('💡 Check: Is SDK properly installed? Run: npm install react-native-tiktok-business-sdk');
      console.error('💡 Check: Is SDK properly linked? Run: cd ios && pod install');
      this.isInitialized = false;
      return;
    }

    console.log('✅ TikTokBusiness module loaded:', {
      hasInitializeSdk: typeof TikTokBusiness.initializeSdk === 'function',
      hasTrackEvent: typeof TikTokBusiness.trackEvent === 'function',
      moduleKeys: Object.keys(TikTokBusiness || {}),
    });

    try {
      // TikTok SDK API: initializeSdk(appId, ttAppId, accessToken, debug)
      // Note: Access Token is REQUIRED in SDK v1.4.1+
      console.log('🔧 Initializing TikTok SDK...', {
        appId: this.appId,
        ttAppId: this.ttAppId,
        platform: Platform.OS,
        hasAccessToken: !!this.accessToken,
        sdkAvailable: !!TikTokBusiness,
        hasInitializeSdk: !!(TikTokBusiness && TikTokBusiness.initializeSdk),
      });

      if (!TikTokBusiness) {
        throw new Error('TikTokBusiness module is not available. Make sure SDK is properly installed and linked.');
      }

      if (!TikTokBusiness.initializeSdk) {
        throw new Error('TikTokBusiness.initializeSdk is not available. Check SDK version and installation.');
      }

      // Check if access token is provided
      let tokenToUse = this.accessToken;
      
      if (!tokenToUse) {
        console.warn('⚠️ Access Token is not provided. SDK v1.4.1+ requires Access Token.');
        console.warn('💡 For OAuth flow: Complete OAuth flow to get Access Token via backend');
        console.warn('💡 Events will be tracked via backend API until SDK is initialized');
        console.warn('💡 Skipping SDK initialization - will retry after OAuth completes');
        this.isInitialized = false;
        return; // Don't throw - allow app to continue, SDK will init after OAuth
      }

      console.log('📤 Calling TikTokBusiness.initializeSdk...', {
        appId: this.appId,
        ttAppId: this.ttAppId,
        tokenLength: tokenToUse.length,
        tokenPreview: tokenToUse ? `${tokenToUse.substring(0, 10)}...` : 'empty',
        debugMode: this.debugMode,
      });

      // SDK requires accessToken - try with App Secret if Access Token not provided
      // Note: This may not work as App Secret is for server-side API, not mobile SDK
      let result;
      try {
        result = await TikTokBusiness.initializeSdk(
          this.appId,
          this.ttAppId,
          tokenToUse,
          this.debugMode
        );
      } catch (sdkError: any) {
        // Catch SDK-specific errors and provide better context
        console.error('🔴 SDK initializeSdk threw error:', sdkError);
        console.error('SDK Error details:', {
          message: sdkError?.message,
          code: sdkError?.code,
          name: sdkError?.name,
          stack: sdkError?.stack,
        });
        
        // Re-throw with more context
        throw new Error(`Failed to initialize TikTok SDK: ${sdkError?.message || String(sdkError)}`);
      }
      
      this.isInitialized = true;
      console.log('✅ TikTok Analytics initialized successfully', {
        appId: this.appId,
        ttAppId: this.ttAppId,
        platform: Platform.OS,
        debugMode: this.debugMode,
        result: result,
      });
      console.log('💡 Events will now be tracked and sent to TikTok');
    } catch (error: any) {
      console.error('❌ Failed to initialize TikTok Analytics:', error);
      console.error('Error type:', error?.constructor?.name);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      
      // Check if error is related to access token
      const errorMessage = error?.message || String(error);
      const errorString = String(error).toLowerCase();
      
      if (errorMessage.includes('access') || errorMessage.includes('token') || 
          errorMessage.includes('Access') || errorMessage.includes('auth') ||
          errorString.includes('access') || errorString.includes('token') ||
          errorString.includes('auth')) {
        console.error('');
        console.error('🔑 ACCESS TOKEN REQUIRED');
        console.error('The TikTok SDK v1.4.1+ requires an Access Token (different from App Secret).');
        console.error('');
        console.error('📝 What you have:');
        console.error('  ✅ App Secret: TTCYJT3g804mY1GuV1MF9q2l4U9kIYJ5 (for server-side API)');
        console.error('  ❌ Access Token: Missing (required for mobile SDK)');
        console.error('');
        console.error('🔍 How to get Access Token:');
        console.error('1. Go to: https://ads.tiktok.com/help/article?aid=10028');
        console.error('2. Log in to TikTok Events Manager');
        console.error('3. Select your app/pixel');
        console.error('4. Go to: Settings → Access Token');
        console.error('5. Click "Generate" or "Create Access Token"');
        console.error('6. Copy the Access Token (different from App Secret)');
        console.error('');
        console.error('💻 Update your code:');
        console.error('  In app/index.tsx, line 58:');
        console.error('  await TikTokAnalytics.initialize(');
        console.error('    "com.metaltorchlabs.pixieplay",');
        console.error('    "7568899277611696136",');
        console.error('    "YOUR_ACCESS_TOKEN_HERE", // ← Paste Access Token here');
        console.error('    __DEV__');
        console.error('  );');
        console.error('');
        console.error('📌 Note: App Secret is for server-side Events API, not mobile SDK');
        console.error('');
      } else {
        // Other errors - show full details
        console.error('');
        console.error('🔍 Error Details:');
        console.error('  Error:', error);
        console.error('  Message:', error?.message);
        console.error('  Type:', error?.constructor?.name);
        if (error?.stack) {
          console.error('  Stack:', error.stack);
        }
        console.error('');
        console.error('💡 Possible causes:');
        console.error('  1. SDK not properly linked (run: cd ios && pod install)');
        console.error('  2. Using Expo Go (need development build: npx expo run:ios)');
        console.error('  3. Missing Access Token');
        console.error('  4. Invalid App ID or TikTok App ID');
        console.error('  5. SDK version incompatibility');
        console.error('');
      }
      
      if (this.debugMode) {
        console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      }
      
      this.isInitialized = false;
      
      // Don't throw - allow app to continue without TikTok tracking
      // Events will be skipped with warning messages
    }
  }

  /**
   * Send event via backend API (fallback when SDK not initialized)
   */
  private async sendEventViaBackend(
    eventName: string,
    properties?: Record<string, any>
  ): Promise<void> {
    const BACKEND_API_URL = process.env.EXPO_PUBLIC_API_URL || 
      'https://kbhbelilr3phj6ruq3opi3zs7e0cykav.lambda-url.us-west-2.on.aws';

    try {
      if (this.debugMode) {
        console.log(`📤 Sending TikTok event via backend API: ${eventName}`, properties);
      }

      const response = await fetch(`${BACKEND_API_URL}/api/tiktok/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testEventCode: 'TEST28904', // Use current test event code
          eventType: eventName,
          eventData: {
            ...properties,
            timestamp: new Date().toISOString(),
            ttAppId: this.ttAppId,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Backend API error: ${response.statusText}`);
      }

      if (this.debugMode) {
        console.log(`✅ TikTok event sent via backend API: ${eventName}`);
      }
    } catch (error) {
      console.error(`❌ Failed to send TikTok event via backend API ${eventName}:`, error);
    }
  }

  /**
   * Track a standard TikTok event
   */
  private async trackEvent(
    eventName: string,
    properties?: Record<string, any>
  ): Promise<void> {
    // Check if SDK is available
    if (!isSDKAvailable) {
      if (this.debugMode) {
        console.warn('⚠️ TikTok SDK not available - sending events via backend API');
      }
      // Fallback to backend API
      await this.sendEventViaBackend(eventName, properties);
      return;
    }

    // Check if initialized
    if (!this.isInitialized) {
      // Only warn once per session to avoid spam
      if (!this._hasWarnedAboutInit) {
        console.warn('⚠️ TikTok Analytics not initialized. Sending events via backend API.');
        console.warn('💡 Complete OAuth flow to initialize SDK for better tracking');
        this._hasWarnedAboutInit = true;
      }
      // Fallback to backend API
      await this.sendEventViaBackend(eventName, properties);
      return;
    }

    try {
      if (TikTokBusiness && TikTokBusiness.trackEvent) {
        if (this.debugMode) {
          console.log(`📊 TikTok Event Tracking: ${eventName}`, {
            properties: properties || {},
            platform: Platform.OS,
            ttAppId: this.ttAppId,
          });
        }

        // Use TikTokEventName enum if available, otherwise use string
        // SDK expects enum values like TikTokEventName.LAUNCH_APP (which maps to "LaunchAPP")
        // But we're using lowercase strings, so we'll use trackCustomEvent for custom names
        // or map to enum values
        
        // Map lowercase event names to TikTokEventName enum values
        let eventNameToTrack = eventName;
        if (TikTokEventName) {
          // Map our lowercase names to SDK enum values
          const eventNameMap: Record<string, any> = {
            'launch_app': TikTokEventName.LAUNCH_APP,
            'achieve_level': TikTokEventName.ACHIEVE_LEVEL,
            'complete_tutorial': TikTokEventName.COMPLETE_TUTORIAL,
            'unlock_achievement': TikTokEventName.UNLOCK_ACHIEVEMENT,
            'registration': TikTokEventName.REGISTRATION,
            'login': TikTokEventName.LOGIN,
            'view_content': TikTokContentEventName?.VIEW_CONTENT,
            'purchase': TikTokContentEventName?.PURCHASE,
          };
          
          if (eventNameMap[eventName]) {
            eventNameToTrack = eventNameMap[eventName];
            // Use trackEvent for standard events
            await TikTokBusiness.trackEvent(eventNameToTrack, undefined, properties);
          } else if (TikTokContentEventName && (eventName === 'view_content' || eventName === 'purchase')) {
            // Use trackContentEvent for content events
            await TikTokBusiness.trackContentEvent(eventNameToTrack, properties);
          } else {
            // Use trackCustomEvent for custom events
            await TikTokBusiness.trackCustomEvent(eventName, properties);
          }
        } else {
          // Fallback: use trackCustomEvent if enums not available
          await TikTokBusiness.trackCustomEvent(eventName, properties);
        }
        
        if (this.debugMode) {
          console.log(`✅ TikTok Event Sent: ${eventName} (as ${eventNameToTrack})`);
        }
      } else {
        console.warn('⚠️ TikTokBusiness is not available - event not tracked:', eventName);
      }
    } catch (error) {
      console.error(`❌ Failed to track TikTok event ${eventName}:`, error);
      if (this.debugMode) {
        console.error('Error details:', error);
      }
    }
  }

  /**
   * Track app launch
   * TikTok event name: launch_app (lowercase)
   */
  async trackAppOpen(): Promise<void> {
    await this.trackEvent('launch_app', {
      timestamp: Date.now(),
      // Include PageView properties for better visibility in TikTok
      content_id: 'app_launch',
      content_type: 'page',
      content_name: 'App Launch',
      url: 'app://com.metaltorchlabs.pixieplay',
    });
  }

  /**
   * Track session start
   * Uses launch_app event for session tracking
   */
  async trackSessionStarted(): Promise<void> {
    await this.trackEvent('launch_app', {
      event_type: 'session_start',
      timestamp: Date.now(),
    });
  }

  /**
   * Track level completion
   * TikTok event name: achieve_level (lowercase)
   */
  async trackLevelCompleted(
    levelName: string,
    animalsFound: number,
    timeSpent?: number
  ): Promise<void> {
    await this.trackEvent('achieve_level', {
      level_name: levelName,
      level_id: levelName.toLowerCase(),
      animals_found: animalsFound,
      total_animals: 7,
      time_spent: timeSpent,
      timestamp: Date.now(),
      content_id: levelName.toLowerCase(),
      content_type: 'level',
      content_name: levelName,
      value: animalsFound,
      currency: 'USD',
    });
  }

  /**
   * Track animal discovery
   * TikTok event name: view_content (lowercase)
   */
  async trackAnimalDiscovered(
    animalName: string,
    levelName: string,
    animalIndex: number
  ): Promise<void> {
    await this.trackEvent('view_content', {
      content_type: 'animal',
      content_name: animalName,
      content_id: `${levelName}_${animalName}`,
      level_name: levelName,
      animal_index: animalIndex,
      timestamp: Date.now(),
      // Ensure these are included for proper TikTok mapping
      contentType: 'animal',
      contentName: animalName,
      contentId: `${levelName}_${animalName}`,
    });
  }

  /**
   * Track level selection
   * TikTok event name: view_content (lowercase)
   */
  async trackLevelSelected(levelName: string, isUnlocked: boolean): Promise<void> {
    await this.trackEvent('view_content', {
      content_type: 'level',
      content_name: levelName,
      content_id: levelName.toLowerCase(),
      is_unlocked: isUnlocked,
      timestamp: Date.now(),
    });
  }

  /**
   * Track purchase
   * TikTok event name: purchase (lowercase)
   */
  async trackPurchase(
    amount: number,
    currency: string = 'USD',
    productId?: string,
    orderId?: string
  ): Promise<void> {
    await this.trackEvent('purchase', {
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
   * TikTok event name: complete_tutorial (lowercase)
   */
  async trackTutorialCompleted(): Promise<void> {
    await this.trackEvent('complete_tutorial', {
      timestamp: Date.now(),
    });
  }

  /**
   * Track achievement unlock
   * TikTok event name: unlock_achievement (lowercase)
   */
  async trackAchievementUnlocked(achievementName: string): Promise<void> {
    await this.trackEvent('unlock_achievement', {
      achievement_name: achievementName,
      timestamp: Date.now(),
    });
  }

  /**
   * Track user engagement
   * Note: TikTok doesn't have a standard "user_engagement" event
   * Using custom event name
   */
  async trackUserEngagement(eventType: string, context?: Record<string, any>): Promise<void> {
    await this.trackEvent('user_engagement', {
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
    if (!isSDKAvailable || !TikTokBusiness || !TikTokBusiness.identify) {
      if (this.debugMode) {
        console.warn('⚠️ TikTokBusiness.identify not available');
      }
      return;
    }

    try {
      // SDK requires all parameters: identify(externalId, externalUserName, phoneNumber, email)
      if (!externalUserId) {
        console.warn('⚠️ externalUserId is required for TikTok identify');
        return;
      }

      await TikTokBusiness.identify(
        externalUserId,
        additionalProperties?.username || externalUserId, // externalUserName (required)
        phoneNumber || '', // phoneNumber (required)
        email || '' // email (required)
      );

      if (this.debugMode) {
        console.log('📊 TikTok User Identified:', {
          externalUserId,
          phoneNumber,
          email,
        });
      }
    } catch (error) {
      console.warn('Failed to identify user in TikTok:', error);
    }
  }

  /**
   * Track registration
   * TikTok event name: registration (lowercase)
   */
  async trackRegistration(userId?: string): Promise<void> {
    await this.trackEvent('registration', {
      user_id: userId,
      timestamp: Date.now(),
    });
  }

  /**
   * Track login
   * Note: TikTok doesn't have a standard "login" event
   * Using custom event name
   */
  async trackLogin(userId?: string): Promise<void> {
    await this.trackEvent('login', {
      user_id: userId,
      timestamp: Date.now(),
    });
  }

  /**
   * Track level started
   * Maps to ViewContent event
   */
  async trackLevelStarted(levelName: string, isUnlocked: boolean): Promise<void> {
    await this.trackEvent('view_content', {
      content_type: 'level',
      content_name: levelName,
      content_id: levelName.toLowerCase(),
      level_name: levelName,
      is_unlocked: isUnlocked,
      action: 'level_started',
      timestamp: Date.now(),
    });
  }

  /**
   * Track button click
   * Maps to ClickButton event
   */
  async trackButtonClick(buttonName: string, context?: Record<string, any>): Promise<void> {
    await this.trackEvent('click_button', {
      content_type: 'button',
      content_name: buttonName,
      content_id: buttonName.toLowerCase(),
      ...context,
      timestamp: Date.now(),
    });
  }

  /**
   * Track search action
   * Maps to Search event
   */
  async trackSearch(searchQuery: string, resultsCount?: number): Promise<void> {
    await this.trackEvent('search', {
      search_string: searchQuery,
      content_type: 'search',
      results_count: resultsCount,
      timestamp: Date.now(),
    });
  }

  /**
   * Track contact form submission
   * Maps to Contact event
   */
  async trackContact(context?: Record<string, any>): Promise<void> {
    await this.trackEvent('contact', {
      content_type: 'form',
      content_name: 'contact',
      ...context,
      timestamp: Date.now(),
    });
  }

  /**
   * Track add to wishlist
   * Maps to AddToWishlist event
   */
  async trackAddToWishlist(contentId: string, contentName: string, value?: number): Promise<void> {
    await this.trackEvent('add_to_wishlist', {
      content_id: contentId,
      content_name: contentName,
      content_type: 'product',
      value: value || 0,
      currency: 'USD',
      timestamp: Date.now(),
    });
  }

  /**
   * Track add to cart
   * Maps to AddToCart event
   */
  async trackAddToCart(productId: string, productName: string, amount: number, currency: string = 'USD'): Promise<void> {
    await this.trackEvent('add_to_cart', {
      content_id: productId,
      content_name: productName,
      content_type: 'product',
      value: amount,
      currency: currency,
      timestamp: Date.now(),
    });
  }

  /**
   * Track lead generation
   * Maps to Lead event
   */
  async trackLead(leadType: string, value?: number): Promise<void> {
    await this.trackEvent('lead', {
      content_type: 'lead',
      content_name: leadType,
      content_id: leadType.toLowerCase(),
      value: value || 0,
      currency: 'USD',
      timestamp: Date.now(),
    });
  }

  /**
   * Track video view
   * Maps to ViewContent event
   */
  async trackVideoView(videoId: string, videoName: string, duration?: number): Promise<void> {
    await this.trackEvent('view_content', {
      content_type: 'video',
      content_name: videoName,
      content_id: videoId,
      video_duration: duration,
      timestamp: Date.now(),
    });
  }

  /**
   * Track share action
   * Custom event
   */
  async trackShare(contentType: string, contentId: string, method?: string): Promise<void> {
    await this.trackEvent('share', {
      content_type: contentType,
      content_id: contentId,
      share_method: method,
      timestamp: Date.now(),
    });
  }

  /**
   * Track subscription start
   * Maps to CompleteRegistration or Purchase event
   */
  async trackSubscriptionStart(planId: string, planName: string, amount: number, currency: string = 'USD'): Promise<void> {
    await this.trackEvent('complete_registration', {
      content_type: 'subscription',
      content_name: planName,
      content_id: planId,
      value: amount,
      currency: currency,
      timestamp: Date.now(),
    });
  }

  /**
   * Track page view
   * Maps to ViewContent event
   */
  async trackPageView(pageName: string, pageId?: string): Promise<void> {
    await this.trackEvent('view_content', {
      content_type: 'page',
      content_name: pageName,
      content_id: pageId || pageName.toLowerCase(),
      timestamp: Date.now(),
    });
  }

  /**
   * Track time spent
   * Custom engagement event
   */
  async trackTimeSpent(contentType: string, contentId: string, seconds: number): Promise<void> {
    await this.trackEvent('user_engagement', {
      content_type: contentType,
      content_id: contentId,
      engagement_time_msec: seconds * 1000,
      timestamp: Date.now(),
    });
  }

  /**
   * Track error occurrence
   * Custom event
   */
  async trackError(errorType: string, errorMessage?: string, context?: Record<string, any>): Promise<void> {
    await this.trackEvent('error', {
      error_type: errorType,
      error_message: errorMessage,
      ...context,
      timestamp: Date.now(),
    });
  }
}

export default new TikTokAnalytics();
