import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse, badRequestResponse } from '../utils/response';
import { sendTikTokEvent } from '../utils/tiktokEventsApi';

/**
 * TikTok Event Handler
 * 
 * Receives events from mobile app and forwards to TikTok Events API
 * 
 * POST /api/tiktok/event
 * Body: {
 *   eventType: string; // Event name (e.g., 'launch_app', 'achieve_level')
 *   eventData?: Record<string, any>; // Event properties
 *   testEventCode?: string; // Optional test event code
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
    const { eventType, eventData = {}, testEventCode } = body;

    if (!eventType) {
      return badRequestResponse('eventType is required');
    }

    console.log('📊 Received TikTok event:', { eventType, eventData, testEventCode });

    // TikTok Pixel Code (for Events API - must use Pixel, not App ID)
    // Get Pixel Code from: TikTok Ads Manager → Tools → Events → Web Events → Your Pixel → Settings
    const PIXEL_CODE = process.env.TIKTOK_PIXEL_CODE || '7568899277611696136'; // Fallback to App ID if Pixel not set
    const APP_SECRET = process.env.TIKTOK_APP_SECRET || 'TTCYJT3g804mY1GuV1MF9q2l4U9kIYJ5';

    // Map event to TikTok format (matching TikTok's standard structure)
    const { mapGameEventToTikTok } = await import('../utils/tiktokEventsApi');
    
    // Use mapping function to convert to TikTok format
    const tiktokEvent = mapGameEventToTikTok(eventType, {
      ...eventData,
      contentId: eventData.content_id,
      contentType: eventData.content_type,
      contentName: eventData.content_name,
      amount: eventData.value || eventData.amount,
      currency: eventData.currency,
    });
    
    // Ensure timestamp is set
    if (!tiktokEvent.timestamp) {
      tiktokEvent.timestamp = new Date().toISOString();
    }

    // Send to TikTok Events API
    const result = await sendTikTokEvent(
      PIXEL_CODE,
      tiktokEvent,
      {
        appSecret: APP_SECRET,
        testEventCode: testEventCode || 'TEST28904', // Use test code for testing
      }
    );

    if (!result.success) {
      console.error('Failed to send TikTok event:', result.error);
      return errorResponse(
        `Failed to send event to TikTok: ${result.error}`,
        500
      );
    }

    console.log('✅ TikTok event sent successfully:', eventType);

    return successResponse({
      message: 'Event sent to TikTok',
      eventType,
      result: result.data,
    });
  } catch (error) {
    console.error('Error processing TikTok event:', error);
    return errorResponse('Failed to process TikTok event', 500, error as Error);
  }
};

