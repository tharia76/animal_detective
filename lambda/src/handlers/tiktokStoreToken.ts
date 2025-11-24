import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse, badRequestResponse } from '../utils/response';
import { storeAccessToken } from '../utils/tiktokTokenStore';

/**
 * Store TikTok Events API Access Token
 * 
 * Stores access token obtained from TikTok Ads Manager (Events Manager)
 * 
 * POST /api/tiktok/store-token
 * Body: {
 *   accessToken: string; // Access token from TikTok Ads Manager → Events Manager → Settings → Access Token
 *   expiresIn?: number; // Optional: expiration in seconds (default: 90 days)
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
    const { accessToken, expiresIn } = body;

    if (!accessToken) {
      return badRequestResponse('accessToken is required');
    }

    console.log('📦 Storing TikTok Events API access token...');

    // Store token (default expiration: 90 days for Events API tokens)
    const defaultExpiresIn = expiresIn || (90 * 24 * 60 * 60); // 90 days
    await storeAccessToken({
      access_token: accessToken,
      expires_at: (Date.now() / 1000) + defaultExpiresIn,
      token_type: 'Bearer',
    });

    console.log('✅ TikTok Events API access token stored successfully');

    return successResponse({
      message: 'Events API access token stored successfully',
      expiresIn: defaultExpiresIn,
      expiresAt: new Date(Date.now() + defaultExpiresIn * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Error storing TikTok token:', error);
    return errorResponse('Failed to store TikTok token', 500, error as Error);
  }
};

