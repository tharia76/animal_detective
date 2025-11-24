/**
 * TikTok Events API Utility
 * 
 * Sends server-side events to TikTok Events API
 * Documentation: https://ads.tiktok.com/help/article?aid=10028
 * 
 * Note: TikTok Events API requires an OAuth access_token.
 * For server-side events, use client_credentials grant to get access_token.
 */

// TikTok Events API endpoint
// Try v1.3 first, but might need different version or format
// TikTok Events API endpoints
// Try v1.3 first, but might need v1.2 or different format
const TIKTOK_EVENTS_API_URL = 'https://business-api.tiktok.com/open_api/v1.3/event/track/';
const TIKTOK_EVENTS_API_V12_URL = 'https://business-api.tiktok.com/open_api/v1.2/event/track/';
const TIKTOK_OAUTH_TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';

// Import token store functions
let getAccessTokenFromStore: (() => Promise<string | null>) | null = null;
try {
  // Dynamic import to avoid circular dependencies
  import('./tiktokTokenStore').then(module => {
    getAccessTokenFromStore = module.getAccessToken;
  });
} catch (error) {
  console.warn('Could not load token store:', error);
}

// Cache for client access token (valid for 2 hours)
let cachedClientAccessToken: { token: string; expiresAt: number } | null = null;

/**
 * Get client access token using client_credentials grant
 * Token is valid for 2 hours
 */
async function getClientAccessToken(
  clientKey: string,
  clientSecret: string
): Promise<string> {
  // Check if cached token is still valid (with 5 min buffer)
  if (cachedClientAccessToken && cachedClientAccessToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedClientAccessToken.token;
  }

  console.log('🔑 Getting new TikTok client access token...');

  const response = await fetch(TIKTOK_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to get client access token: ${errorData.error_description || response.statusText}`);
  }

  const data = await response.json();
  const accessToken = data.access_token;
  const expiresIn = data.expires_in || 7200; // Default 2 hours

  if (!accessToken) {
    throw new Error('No access token in response');
  }

  // Cache token
  cachedClientAccessToken = {
    token: accessToken,
    expiresAt: Date.now() + (expiresIn * 1000),
  };

  console.log('✅ TikTok client access token obtained (valid for 2 hours)');

  return accessToken;
}

interface TikTokEvent {
  event: string; // Event name (e.g., 'ViewContent', 'AddToCart', 'Purchase', 'CompleteRegistration')
  event_id?: string; // Unique event ID for deduplication
  timestamp?: string; // ISO 8601 timestamp
  properties?: {
    // Standard TikTok event properties
    value?: number; // Value of the order or items
    currency?: string; // Currency code (e.g., 'USD')
    contents?: Array<{
      content_id?: string; // ID of the product/content
      content_type?: string; // Type (e.g., 'product', 'product_group', 'level', 'animal')
      content_name?: string; // Name of the content
      price?: number; // Price of the item
      quantity?: number; // Quantity
    }>;
    // Additional properties
    content_id?: string; // Single content ID (for backward compatibility)
    content_type?: string; // Single content type
    content_name?: string; // Single content name
    search_string?: string; // For Search events
    [key: string]: any; // Allow additional properties
  };
  context?: {
    user?: {
      external_id?: string; // User ID (should be hashed with SHA-256)
      phone_number?: string; // Phone number (should be hashed with SHA-256)
      email?: string; // Email (should be hashed with SHA-256)
    };
    device?: {
      ip?: string;
      user_agent?: string;
    };
    page?: {
      url?: string;
      referrer?: string;
    };
  };
}

interface TikTokEventsPayload {
  pixel_code: string; // TikTok App ID / Pixel ID
  event?: TikTokEvent;
  events?: TikTokEvent[]; // For batch events
  partner_name?: string;
  test_event_code?: string; // Test event code (e.g., 'TEST99645')
  timestamp?: string;
  context?: TikTokEvent['context'];
}

/**
 * Send event(s) to TikTok Events API
 */
export async function sendTikTokEvent(
  pixelCode: string,
  events: TikTokEvent | TikTokEvent[],
  options: {
    accessToken?: string;
    appSecret?: string;
    testEventCode?: string;
    context?: TikTokEvent['context'];
  } = {}
): Promise<{ success: boolean; data?: any; error?: string }> {
  const { accessToken, appSecret, testEventCode, context } = options;

  // TikTok Pixel Code (alphanumeric) and Pixel ID (numeric)
  // Events API requires numeric Pixel ID as event_source_id
  // Get Pixel ID from: TikTok Ads Manager → Tools → Events → Web Events → Your Pixel → Settings
  const pixel_code = pixelCode || process.env.TIKTOK_PIXEL_CODE || 'D4GFLABC77U1VUV8L700';
  
  // App Secret for authentication (if no access token)
  const secret = appSecret || process.env.TIKTOK_APP_SECRET || 'TTCYJT3g804mY1GuV1MF9q2l4U9kIYJ5';

  // Build payload
  // TikTok Events API v1.3 format
  // TikTok expects event_source_id (numeric Pixel ID, not alphanumeric Pixel Code)
  const pixelId = process.env.TIKTOK_PIXEL_ID || '7568992749698007057'; // Numeric Pixel ID
  const pixelIdString = String(pixelId).trim();
  
  if (!pixelIdString || pixelIdString === 'undefined') {
    return {
      success: false,
      error: 'Pixel ID is required for Events API (numeric ID: 7568992749698007057)',
    };
  }

  // TikTok Events API format - CORRECT STRUCTURE
  // Based on TikTok official documentation and user's Pixel Code:
  // - Pixel Code: D4GFLABC77U1VUV8L700 (from web pixel installation)
  // - For web pixels, event_source should be "web" and event_source_id should be numeric Pixel ID
  // - For app events, event_source should be "app" and event_source_id should be numeric Pixel ID
  // - The access token must be authorized for the Pixel ID
  
  // TikTok Events API format - CORRECT STRUCTURE
  // Key insight: event_source_id MUST be the Pixel Code (alphanumeric), not numeric Pixel ID
  // The access token is generated for the Pixel Code, so that's what we use
  // - Pixel Code: D4GFLABC77U1VUV8L700 (this is the event_source_id)
  // - event_source: "app" for mobile app events (not "web")
  // - Don't include pixel_code in body (or keep it same as event_source_id if included)
  
  // For mobile app events, TikTok Events API accepts both "web" and "app" event_source
  // However, when using Pixel Code (web pixel), we must use "web" as event_source
  // The Pixel Code can track both web and app events, but event_source must match the pixel type
  // Since we're using a Web Pixel Code, we use "web" but TikTok will still recognize standard events
  const payload: any = {
    event_source: 'web', // Use "web" for Web Pixel (can track app events too)
    event_source_id: pixel_code, // ✅ MUST be the Pixel Code (alphanumeric)
    ...(testEventCode && { test_event_code: testEventCode }),
    data: [], // Will be populated with events array
  };
  
  console.log('📋 TikTok Events API payload structure:', {
    event_source: payload.event_source,
    event_source_id: payload.event_source_id,
    event_source_id_type: typeof payload.event_source_id,
    test_event_code: payload.test_event_code,
    pixel_code: pixel_code, // For reference
  });

  // TikTok Events API authentication
  // For server-to-server Events API, access token must be generated from TikTok Ads Manager
  // NOT from OAuth flow - Events API uses a different token system
  // Priority: 1. Provided accessToken, 2. Environment variable, 3. Stored token
  let tokenToUse: string | null = accessToken || null;
  
  if (!tokenToUse) {
    // Check environment variable for Events API access token
    tokenToUse = process.env.TIKTOK_EVENTS_API_ACCESS_TOKEN || null;
  }
  
  if (!tokenToUse) {
    // Try to get stored token (from Events Manager, not OAuth)
    console.log('🔍 Checking for stored Events API access token...');
    try {
      const tokenStore = await import('./tiktokTokenStore');
      const storedToken = await tokenStore.getAccessToken();
      tokenToUse = storedToken;
    } catch (error) {
      console.log('⚠️ Could not load token store:', error);
    }
  }
  
  if (!tokenToUse) {
    // No Events API access token available
    console.log('⚠️ No Events API access token found');
    console.log('💡 To enable TikTok Events API tracking:');
    console.log('   1. Go to TikTok Ads Manager → Events Manager');
    console.log('   2. Select your pixel/app');
    console.log('   3. Go to Settings → Access Token');
    console.log('   4. Generate/copy the Events API Access Token');
    console.log('   5. Set TIKTOK_EVENTS_API_ACCESS_TOKEN environment variable');
    console.log('   6. OR store token via /api/tiktok/store-token endpoint');
    console.log('');
    console.log('📌 Note: Events API uses a different token than OAuth');
    console.log('   OAuth tokens are for user data, Events API tokens are for server-to-server events');
    
    return {
      success: false,
      error: 'No Events API access token available. Get token from TikTok Ads Manager → Events Manager → Settings → Access Token. Then set TIKTOK_EVENTS_API_ACCESS_TOKEN environment variable.',
    };
  }

  console.log('🔑 Using access token for TikTok API:', {
    hasAccessToken: !!tokenToUse,
    tokenLength: tokenToUse.length,
    tokenPreview: tokenToUse.substring(0, 10) + '...',
  });

  // TikTok Events API requires access_token in HEADER, not payload
  // Store token for header, don't add to payload

  // Convert events to TikTok format
  // TikTok expects events in a `data` array with specific structure
  const eventsArray = Array.isArray(events) ? events : [events];
  
  payload.data = eventsArray.map(event => {
    // Convert ISO timestamp to Unix timestamp (seconds)
    const eventTime = event.timestamp 
      ? Math.floor(new Date(event.timestamp).getTime() / 1000)
      : Math.floor(Date.now() / 1000);
    
    // Build TikTok event object
    // Use current time in seconds - TikTok expects realistic timestamp
    const currentTimeSeconds = Math.floor(Date.now() / 1000);
    
    const tiktokEvent: any = {
      event: event.event, // Event name (e.g., "LaunchAPP", "ViewContent", "Purchase")
      event_time: currentTimeSeconds, // Current time in seconds (realistic timestamp)
      app: {
        app_id: 'com.metaltorchlabs.pixieplay', // Bundle ID
      },
    };
    
    // Only include user fields if they have values (TikTok doesn't accept null)
    const userData: any = {};
    if (context?.user) {
      if (context.user.external_id) {
        userData.external_id = context.user.external_id;
      }
      if (context.user.email) {
        userData.email = context.user.email;
      }
      if (context.user.phone_number) {
        userData.phone = context.user.phone_number;
      }
    }
    // Only add user object if it has data
    if (Object.keys(userData).length > 0) {
      tiktokEvent.user = userData;
    }
    
    // Build properties object - include all properties for better visibility in TikTok
    const properties: any = {};
    
    // Copy properties from event, but clean up contents array and remove invalid values
    if (event.properties) {
      // Copy contents array but remove currency from inside contents (currency belongs at properties level)
      if (event.properties.contents && Array.isArray(event.properties.contents)) {
        properties.contents = event.properties.contents.map((content: any) => {
          const cleanedContent: any = {
            content_id: content.content_id,
            content_type: content.content_type,
            content_name: content.content_name,
          };
          // Remove currency and other non-content fields from contents array
          return cleanedContent;
        });
      }
      
      // Copy other properties, but exclude value: 0 and currency without value
      Object.keys(event.properties).forEach(key => {
        if (key !== 'contents') {
          const propValue = event.properties?.[key];
          
          // Skip value if it's 0 or null/undefined (TikTok doesn't accept 0 values)
          if (key === 'value') {
            if (propValue !== undefined && propValue !== null && propValue > 0) {
              properties.value = propValue;
            }
            // Don't add value if it's 0
            return;
          }
          
          // Only add currency if value is present and > 0
          if (key === 'currency') {
            if (properties.value && properties.value > 0) {
              properties.currency = propValue;
            }
            // Don't add currency if there's no valid value
            return;
          }
          
          // Copy other properties
          if (propValue !== null && propValue !== undefined) {
            properties[key] = propValue;
          }
        }
      });
    }
    
    // Always add properties object if it has any data
    if (Object.keys(properties).length > 0) {
      tiktokEvent.properties = properties;
    }
    
    return tiktokEvent;
  });

  console.log('📦 Payload being sent to TikTok:', JSON.stringify(payload, null, 2).substring(0, 800));

  try {
    // Build headers
    // TikTok Events API uses Access-Token header (standard format)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Access-Token': tokenToUse, // Standard TikTok Events API header format
    };

    console.log('📤 Sending to TikTok Events API:', {
      url: TIKTOK_EVENTS_API_URL,
      pixelCode: pixel_code,
      hasToken: !!tokenToUse,
      payloadKeys: Object.keys(payload),
    });

    // TikTok Events API - send payload directly (NO data wrapper)
    // The payload structure already has event_source, event_source_id, and data array
    console.log('📤 Final request body (direct payload, no wrapper):', JSON.stringify(payload, null, 2).substring(0, 800));

    const response = await fetch(TIKTOK_EVENTS_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload), // Send payload directly, not wrapped
    });

    const responseText = await response.text();
    let data: any;
    
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { message: responseText, status: response.status };
    }

    console.log('📥 TikTok API Response:', {
      status: response.status,
      statusText: response.statusText,
      data: JSON.stringify(data).substring(0, 500),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `TikTok API error: ${data.message || data.error_description || data.error || response.statusText}. Full response: ${JSON.stringify(data)}`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error sending TikTok event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Map game event to TikTok event format
 * Matches TikTok's standard event structure
 */
export function mapGameEventToTikTok(
  eventType: string,
  data: {
    level?: string;
    animal?: string;
    score?: number;
    duration?: number;
    userId?: string;
    productId?: string;
    amount?: number;
    currency?: string;
    contentId?: string;
    contentType?: string;
    contentName?: string;
    [key: string]: any;
  }
): TikTokEvent {
  const baseEvent: TikTokEvent = {
    event: '',
    timestamp: new Date().toISOString(),
    properties: {},
  };

  // Map to TikTok standard events
  // For Web Pixel, we use web events (PageView, ViewContent, etc.)
  // LaunchAPP is a mobile app event and will show as "custom" in Web Pixel
  switch (eventType.toLowerCase()) {
    case 'app_launch':
    case 'launch_app':
      // For Web Pixel: Use PageView (standard web event) instead of LaunchAPP (mobile-only)
      // This ensures events show as "standard" in TikTok Events Manager
      // PageView requires: content_id, content_type, content_name, url
      baseEvent.event = 'PageView'; // Standard web event for app launches
      baseEvent.properties = {
        content_id: data.contentId || 'app_launch',
        content_type: data.contentType || 'page',
        content_name: data.contentName || 'App Launch',
        url: data.url || 'app://com.metaltorchlabs.pixieplay',
        // Include any additional properties
        ...(data.value !== undefined && { value: data.value }),
        ...(data.currency && { currency: data.currency }),
      };
      break;

    case 'view_content':
    case 'animal_discovered':
    case 'level_viewed':
      baseEvent.event = 'ViewContent'; // TikTok standard event
      // Build contents array - currency should NOT be inside contents
      const contents = [{
        content_id: data.contentId || data.level || data.animal,
        content_type: data.contentType || 'level',
        content_name: data.contentName || data.animal || data.level,
      }];
      
      // Build properties - currency and value at properties level, not in contents
      baseEvent.properties = {
        contents: contents,
      };
      
      // Only add value if it's greater than 0 (TikTok doesn't like 0 values)
      if (data.amount && data.amount > 0) {
        baseEvent.properties.value = data.amount;
      } else if (data.score && data.score > 0) {
        baseEvent.properties.value = data.score;
      }
      
      // Only add currency if value is present
      if (baseEvent.properties.value && data.currency) {
        baseEvent.properties.currency = data.currency;
      }
      break;

    case 'add_to_cart':
    case 'addtocart':
      baseEvent.event = 'AddToCart'; // TikTok standard event
      baseEvent.properties = {
        contents: [{
          content_id: data.productId || data.contentId,
          content_type: data.contentType || 'product',
          content_name: data.contentName,
        }],
        value: data.amount || 0,
        currency: data.currency || 'USD',
      };
      break;

    case 'purchase':
    case 'purchase_completed':
    case 'place_an_order':
      baseEvent.event = 'Purchase'; // TikTok standard event
      baseEvent.properties = {
        contents: [{
          content_id: data.productId || data.contentId,
          content_type: data.contentType || 'product',
          content_name: data.contentName,
        }],
      };
      
      // Purchase must have value > 0
      if (data.amount && data.amount > 0) {
        baseEvent.properties.value = data.amount;
        baseEvent.properties.currency = data.currency || 'USD';
      }
      break;

    case 'complete_registration':
    case 'registration':
      baseEvent.event = 'CompleteRegistration'; // TikTok standard event
      baseEvent.properties = {
        contents: data.contentId ? [{
          content_id: data.contentId,
          content_type: data.contentType || 'product',
          content_name: data.contentName,
        }] : undefined,
        value: data.amount || 0,
        currency: data.currency || 'USD',
      };
      break;

    case 'search':
      baseEvent.event = 'Search'; // TikTok standard event
      baseEvent.properties = {
        contents: data.contentId ? [{
          content_id: data.contentId,
          content_type: data.contentType || 'product',
          content_name: data.contentName,
        }] : undefined,
        value: data.amount || data.value || 0,
        currency: data.currency || 'USD',
        search_string: data.searchString || data.search_string || data.query,
      };
      break;

    case 'contact':
      baseEvent.event = 'Contact'; // TikTok standard event
      baseEvent.properties = {
        contents: data.contentId ? [{
          content_id: data.contentId,
          content_type: data.contentType || 'product',
          content_name: data.contentName,
        }] : undefined,
        value: data.amount || data.value || 0,
        currency: data.currency || 'USD',
      };
      break;

    case 'click_button':
    case 'clickbutton':
      baseEvent.event = 'ClickButton'; // TikTok standard event
      baseEvent.properties = {
        contents: data.contentId ? [{
          content_id: data.contentId,
          content_type: data.contentType || 'product',
          content_name: data.contentName,
        }] : undefined,
        value: data.amount || data.value || 0,
        currency: data.currency || 'USD',
      };
      break;

    case 'add_to_wishlist':
    case 'addtowishlist':
      baseEvent.event = 'AddToWishlist'; // TikTok standard event
      baseEvent.properties = {
        contents: data.contentId ? [{
          content_id: data.contentId,
          content_type: data.contentType || 'product',
          content_name: data.contentName,
        }] : undefined,
        value: data.amount || data.value || 0,
        currency: data.currency || 'USD',
      };
      break;

    case 'lead':
      baseEvent.event = 'Lead'; // TikTok standard event
      baseEvent.properties = {
        contents: data.contentId ? [{
          content_id: data.contentId,
          content_type: data.contentType || 'product',
          content_name: data.contentName,
        }] : undefined,
        value: data.amount || data.value || 0,
        currency: data.currency || 'USD',
      };
      break;

    case 'level_completed':
    case 'achieve_level':
      baseEvent.event = 'AchieveLevel'; // TikTok standard event
      baseEvent.properties = {
        contents: [{
          content_id: data.level?.toLowerCase(),
          content_type: 'level',
          content_name: data.level,
        }],
        value: data.score || 0,
      };
      break;

    case 'complete_tutorial':
      baseEvent.event = 'CompleteTutorial'; // TikTok standard event
      break;

    default:
      // Use event type as-is for custom events
      baseEvent.event = eventType;
      baseEvent.properties = {
        contents: data.contentId ? [{
          content_id: data.contentId,
          content_type: data.contentType || 'custom',
          content_name: data.contentName,
        }] : undefined,
        value: data.amount || data.score || 0,
        currency: data.currency || 'USD',
        ...data, // Include all other properties
      };
      baseEvent.properties = { ...data };
  }

  // Add user context if userId provided
  if (data.userId) {
    baseEvent.context = {
      user: {
        external_id: data.userId,
      },
    };
  }

  return baseEvent;
}

/**
 * Test TikTok Events API with test event code
 */
export async function testTikTokEvent(
  testEventCode: string = 'TEST99645',
  eventType: string = 'launch_app',
  testData?: any
): Promise<{ success: boolean; data?: any; error?: string }> {
  const pixelCode = '7568899277611696136';
  
  const tiktokEvent = mapGameEventToTikTok(eventType, testData || {});

  return sendTikTokEvent(pixelCode, tiktokEvent, {
    testEventCode,
    // Note: You'll need Access Token for production
    // For testing, TikTok Events Manager may accept requests without auth
  });
}

