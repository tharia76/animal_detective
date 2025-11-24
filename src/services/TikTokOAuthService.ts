import { Linking } from 'react-native';
import { Platform } from 'react-native';

// Use SecureStore for token storage if available, fallback to AsyncStorage
let SecureStore: any = null;
try {
  SecureStore = require('expo-secure-store');
} catch (error) {
  // SecureStore not available (e.g., in Expo Go), use AsyncStorage fallback
  console.log('expo-secure-store not available, using AsyncStorage fallback');
}

/**
 * TikTok OAuth Service
 * 
 * Handles TikTok OAuth flow for obtaining Access Token
 * 
 * Architecture:
 * 1. iOS app opens TikTok OAuth URL
 * 2. User authorizes in TikTok
 * 3. TikTok redirects back with auth_code
 * 4. App sends auth_code to backend
 * 5. Backend exchanges auth_code for access_token
 * 6. Backend returns access_token (or session token)
 */

const TIKTOK_APP_ID = '6751962145';
const TIKTOK_REDIRECT_URI = 'animal-detective://tiktok-oauth'; // Your app's URL scheme
const TIKTOK_OAUTH_URL = `https://www.tiktok.com/v2/auth/authorize/`;
// Backend API URL - defaults to deployed Lambda Function URL
const BACKEND_API_URL = process.env.EXPO_PUBLIC_API_URL || 
  'https://kbhbelilr3phj6ruq3opi3zs7e0cykav.lambda-url.us-west-2.on.aws';

interface TikTokOAuthParams {
  client_key: string; // App ID
  redirect_uri: string;
  response_type: 'code';
  scope: string;
  state?: string; // Optional: for CSRF protection
}

class TikTokOAuthService {
  /**
   * Generate TikTok OAuth URL
   */
  generateOAuthURL(scopes: string[] = ['user.info.basic']): string {
    const params: TikTokOAuthParams = {
      client_key: TIKTOK_APP_ID,
      redirect_uri: TIKTOK_REDIRECT_URI,
      response_type: 'code',
      scope: scopes.join(','),
      state: this.generateState(), // CSRF protection
    };

    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>)
    ).toString();

    return `${TIKTOK_OAUTH_URL}?${queryString}`;
  }

  /**
   * Generate random state for CSRF protection
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Initiate OAuth flow
   * Opens TikTok OAuth URL in browser/app
   */
  async initiateOAuth(scopes: string[] = ['user.info.basic']): Promise<void> {
    const oauthURL = this.generateOAuthURL(scopes);
    
    console.log('🔐 Opening TikTok OAuth URL:', oauthURL);

    try {
      const canOpen = await Linking.canOpenURL(oauthURL);
      if (!canOpen) {
        throw new Error('Cannot open TikTok OAuth URL');
      }

      await Linking.openURL(oauthURL);
    } catch (error) {
      console.error('Failed to open TikTok OAuth URL:', error);
      throw error;
    }
  }

  /**
   * Handle OAuth redirect
   * Called when TikTok redirects back to your app
   */
  async handleOAuthRedirect(url: string): Promise<string | null> {
    // Parse URL: animal-detective://tiktok-oauth?code=AUTH_CODE&state=STATE
    const parsedURL = new URL(url.replace('animal-detective://', 'https://'));
    const authCode = parsedURL.searchParams.get('code');
    const state = parsedURL.searchParams.get('state');
    const error = parsedURL.searchParams.get('error');

    if (error) {
      console.error('TikTok OAuth error:', error);
      throw new Error(`OAuth error: ${error}`);
    }

    if (!authCode) {
      console.error('No auth code in redirect');
      return null;
    }

    console.log('✅ Received auth code from TikTok');

    // Exchange auth code for access token via backend
    return this.exchangeAuthCode(authCode);
  }

  /**
   * Exchange authorization code for access token
   * Sends auth_code to backend, backend exchanges it for access_token
   */
  async exchangeAuthCode(authCode: string): Promise<string | null> {
    if (!BACKEND_API_URL) {
      console.warn('⚠️ Backend API URL not configured');
      console.warn('💡 Set EXPO_PUBLIC_API_URL environment variable');
      return null;
    }

    try {
      console.log('🔄 Exchanging auth code for access token...');

      const response = await fetch(`${BACKEND_API_URL}/api/tiktok/exchange`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Token exchange failed');
      }

      const data = await response.json();
      const accessToken = data.access_token;

      if (!accessToken) {
        throw new Error('No access token in response');
      }

      console.log('✅ Access token obtained successfully');
      
      // Store access token securely
      try {
        if (SecureStore && SecureStore.setItemAsync) {
          await SecureStore.setItemAsync('tiktok_access_token', accessToken);
          console.log('✅ Access token stored securely');
        } else {
          // Fallback to AsyncStorage if SecureStore not available
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          await AsyncStorage.setItem('tiktok_access_token', accessToken);
          console.log('✅ Access token stored in AsyncStorage');
        }
      } catch (storageError) {
        console.warn('⚠️ Failed to store token:', storageError);
        // Continue anyway - token is still returned
      }
      
      return accessToken;
    } catch (error) {
      console.error('Failed to exchange auth code:', error);
      throw error;
    }
  }

  /**
   * Check if OAuth redirect URL matches
   */
  isOAuthRedirect(url: string): boolean {
    return url.startsWith('animal-detective://tiktok-oauth') ||
           url.includes('tiktok-oauth');
  }
}

export default new TikTokOAuthService();

