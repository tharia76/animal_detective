import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamoDB } from '../utils/dynamodb';
import { successResponse, errorResponse, badRequestResponse } from '../utils/response';
import { GameEvent } from '../types';
import { PutCommand } from '@aws-sdk/lib-dynamodb';

const GAME_EVENTS_TABLE = process.env.GAME_EVENTS_TABLE || '';

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

    console.log('✅ Game event recorded:', eventType);

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

