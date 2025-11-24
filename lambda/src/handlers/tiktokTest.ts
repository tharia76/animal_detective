import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse, badRequestResponse } from '../utils/response';
import { testTikTokEvent, sendTikTokEvent, mapGameEventToTikTok } from '../utils/tiktokEventsApi';

/**
 * TikTok Events API Test Handler
 * 
 * Endpoint to test TikTok Events API integration with test event code
 * 
 * POST /tiktok-test
 * Body: {
 *   testEventCode?: string; // Default: 'TEST99645'
 *   eventType?: string; // Default: 'launch_app'
 *   eventData?: any; // Additional event data
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
    const {
      testEventCode = 'TEST99645',
      eventType = 'launch_app',
      eventData = {},
    } = body;

    console.log('Testing TikTok Events API:', {
      testEventCode,
      eventType,
      eventData,
    });

    // Test with test event code
    const result = await testTikTokEvent(testEventCode, eventType, eventData);

    if (!result.success) {
      return errorResponse(
        `Failed to send TikTok test event: ${result.error}`,
        500
      );
    }

    return successResponse({
      message: 'TikTok test event sent successfully',
      testEventCode,
      eventType,
      result: result.data,
    });
  } catch (error) {
    console.error('Error testing TikTok Events API:', error);
    return errorResponse('Failed to test TikTok Events API', 500, error as Error);
  }
};

