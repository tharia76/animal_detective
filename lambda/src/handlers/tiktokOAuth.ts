import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse, badRequestResponse } from '../utils/response';
import { storeAccessToken } from '../utils/tiktokTokenStore';

/**
 * TikTok OAuth Token Exchange Handler
 * 
 * Exchanges authorization code for access token
 * 
 * POST /api/tiktok/exchange
 * Body: {
 *   authCode: string; // Authorization code from TikTok OAuth redirect
 * }
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return badRequestResponse('Request body is required');
    }

    const body = JSON.parse(event.body);
    const { authCode } = body;

    if (!authCode) {
      return badRequestResponse('authCode is required');
    }

    // TikTok OAuth configuration
    const TIKTOK_APP_ID = '6751962145'; // Your TikTok App ID
    const TIKTOK_APP_SECRET = process.env.TIKTOK_APP_SECRET || 'TTCYJT3g804mY1GuV1MF9q2l4U9kIYJ5';
    const TIKTOK_TOKEN_URL = 'https://business-api.tiktok.com/open_api/v1/oauth2/access_token/';

    console.log('Exchanging TikTok auth code for access token...');

    // Exchange auth_code for access_token
    const tokenResponse = await fetch(TIKTOK_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: TIKTOK_APP_ID,
        app_secret: TIKTOK_APP_SECRET,
        auth_code: authCode,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('TikTok token exchange failed:', errorData);
      return errorResponse(
        `Failed to exchange token: ${errorData.message || tokenResponse.statusText}`,
        tokenResponse.status
      );
    }

    const tokenData = await tokenResponse.json();

    // Token response includes:
    // - access_token
    // - refresh_token
    // - expires_in
    // - refresh_expires_in
    // - scope
    // - token_type

    const {
      access_token,
      refresh_token,
      expires_in,
      refresh_expires_in,
      scope,
    } = tokenData.data || tokenData;

    if (!access_token) {
      return errorResponse('No access token in response', 500);
    }

    // Store tokens securely in DynamoDB for Events API use
    try {
      await storeAccessToken({
        access_token,
        refresh_token,
        expires_at: expires_in ? (Date.now() / 1000) + expires_in : undefined,
        refresh_expires_at: refresh_expires_in ? (Date.now() / 1000) + refresh_expires_in : undefined,
        scope,
        token_type: 'Bearer',
      });
      console.log('✅ TikTok access token stored for Events API use');
    } catch (storageError) {
      console.error('⚠️ Failed to store access token:', storageError);
      // Continue anyway - token is still returned to client
    }

    console.log('✅ TikTok token exchange successful');

    return successResponse({
      message: 'Token exchange successful. Access token stored for Events API.',
      access_token, // Return to client for SDK initialization
      expires_in,
      scope,
      // refresh_token is stored server-side only
    });
  } catch (error) {
    console.error('Error exchanging TikTok token:', error);
    return errorResponse('Failed to exchange TikTok token', 500, error as Error);
  }
};

