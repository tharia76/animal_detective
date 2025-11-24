import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamoDB } from '../utils/dynamodb';
import { successResponse, errorResponse, badRequestResponse } from '../utils/response';
import { AnalyticsEvent } from '../types';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const ANALYTICS_TABLE = process.env.ANALYTICS_TABLE || '';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return badRequestResponse('Request body is required');
    }

    const body = JSON.parse(event.body);
    const { events } = body;

    if (!Array.isArray(events) || events.length === 0) {
      return badRequestResponse('Events array is required');
    }

    const timestamp = Date.now();
    const results = [];

    for (const event of events) {
      const analyticsEvent: AnalyticsEvent = {
        eventId: uuidv4(),
        userId: event.userId,
        deviceId: event.deviceId,
        eventType: event.eventType || 'custom',
        eventName: event.eventName,
        properties: event.properties || {},
        timestamp: event.timestamp || timestamp,
        platform: event.platform,
        appVersion: event.appVersion,
        // TTL: 90 days from now (in seconds)
        ttl: Math.floor(timestamp / 1000) + 90 * 24 * 60 * 60,
      };

      await dynamoDB.send(
        new PutCommand({
          TableName: ANALYTICS_TABLE,
          Item: analyticsEvent,
        })
      );

      results.push({
        eventId: analyticsEvent.eventId,
        status: 'success',
      });
    }

    return successResponse({
      message: 'Analytics events recorded',
      events: results,
    });
  } catch (error) {
    console.error('Error processing analytics:', error);
    return errorResponse('Failed to process analytics events', 500, error as Error);
  }
};

