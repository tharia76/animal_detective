import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamoDB } from '../utils/dynamodb';
import { successResponse, errorResponse, badRequestResponse } from '../utils/response';
import { GameEvent } from '../types';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { sendTikTokEvent } from '../utils/tiktokEventsApi';
import { mapGameEventToTikTok } from '../utils/tiktokEventsApi';

const GAME_EVENTS_TABLE = process.env.GAME_EVENTS_TABLE || '';
const TIKTOK_PIXEL_CODE = process.env.TIKTOK_PIXEL_CODE || 'D4GFLABC77U1VUV8L700';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return badRequestResponse('Request body is required');
    }

    const body = JSON.parse(event.body);
    const { userId, eventType, level, animal, score, duration, metadata } = body;

    if (!userId) {
      return badRequestResponse('userId is required');
    }

    if (!eventType) {
      return badRequestResponse('eventType is required');
    }

    const timestamp = Date.now();

    const gameEvent: GameEvent = {
      userId,
      timestamp,
      eventType,
      level,
      animal,
      score,
      duration,
      metadata,
    };

    // Save to DynamoDB
    await dynamoDB.send(
      new PutCommand({
        TableName: GAME_EVENTS_TABLE,
        Item: {
          ...gameEvent,
          // Add level as GSI key if provided
          ...(level && { level }),
        },
      })
    );

    // Also send to TikTok Events API with detailed event data
    try {
      // Build detailed event data for TikTok
      const tiktokEventData: any = {
        userId,
        level,
        animal,
        score,
        duration,
        ...metadata,
      };

      // Add content-specific data based on event type
      if (level) {
        tiktokEventData.contentId = level.toLowerCase();
        tiktokEventData.contentType = 'level';
        tiktokEventData.contentName = level;
      }
      if (animal) {
        tiktokEventData.contentId = `${level || 'unknown'}_${animal}`;
        tiktokEventData.contentType = 'animal';
        tiktokEventData.contentName = animal;
      }
      if (score !== undefined) {
        tiktokEventData.value = score;
        tiktokEventData.currency = 'USD';
      }
      if (metadata?.amount) {
        tiktokEventData.amount = metadata.amount;
        tiktokEventData.value = metadata.amount;
        tiktokEventData.currency = metadata.currency || 'USD';
      }
      if (metadata?.productId) {
        tiktokEventData.productId = metadata.productId;
        tiktokEventData.contentId = metadata.productId;
        tiktokEventData.contentType = 'product';
      }

      // Map to TikTok event format
      const tiktokEvent = mapGameEventToTikTok(eventType, tiktokEventData);
      
      // Send to TikTok (don't fail if TikTok fails - just log)
      // Include test event code for testing (remove in production)
      const testEventCode = process.env.TIKTOK_TEST_EVENT_CODE || 'TEST28904';
      console.log('📊 Sending TikTok event with test code:', testEventCode);
      
      await sendTikTokEvent(
        TIKTOK_PIXEL_CODE,
        tiktokEvent,
        {
          testEventCode: testEventCode,
          context: {
            user: {
              external_id: userId,
            },
          },
        }
      ).catch((error) => {
        console.warn('Failed to send event to TikTok (non-critical):', error);
      });

      console.log('✅ Game event recorded and sent to TikTok:', eventType);
    } catch (tiktokError) {
      // Don't fail the request if TikTok fails
      console.warn('⚠️ TikTok event send failed (non-critical):', tiktokError);
    }

    return successResponse({
      message: 'Game event recorded',
      event: {
        userId,
        eventType,
        timestamp,
      },
    });
  } catch (error) {
    console.error('Error processing game event:', error);
    return errorResponse('Failed to process game event', 500, error as Error);
  }
};

