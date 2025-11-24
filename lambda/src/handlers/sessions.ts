import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamoDB } from '../utils/dynamodb';
import { successResponse, errorResponse, badRequestResponse } from '../utils/response';
import { Session } from '../types';
import { PutCommand, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const SESSIONS_TABLE = process.env.SESSIONS_TABLE || '';
const USERS_TABLE = process.env.USERS_TABLE || '';

// Helper to get date string in YYYY-MM-DD format
function getDateString(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0];
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return badRequestResponse('Request body is required');
    }

    const body = JSON.parse(event.body);
    const { userId, sessionId, platform, appVersion } = body;

    if (!userId) {
      return badRequestResponse('userId is required');
    }

    const timestamp = Date.now();
    const dateString = getDateString(timestamp);

    if (event.path?.includes('/start')) {
      // Start session
      const newSessionId = sessionId || uuidv4();
      
      const session: Session = {
        sessionId: newSessionId,
        userId,
        startTime: timestamp,
        startDate: dateString,
        platform,
        appVersion,
      };

      await dynamoDB.send(
        new PutCommand({
          TableName: SESSIONS_TABLE,
          Item: session,
        })
      );

      // Update user's last seen and increment session count
      const user = await dynamoDB.send(
        new GetCommand({
          TableName: USERS_TABLE,
          Key: { userId },
        })
      );

      const updateExpressions: string[] = ['SET lastSeenAt = :lastSeenAt'];
      const expressionAttributeValues: Record<string, any> = {
        ':lastSeenAt': timestamp,
      };

      if (!user.Item) {
        // New user - track first seen
        updateExpressions.push('firstSeenAt = :firstSeenAt');
        updateExpressions.push('sessionCount = :sessionCount');
        expressionAttributeValues[':firstSeenAt'] = timestamp;
        expressionAttributeValues[':sessionCount'] = 1;
      } else {
        // Existing user - increment session count
        const currentCount = user.Item.sessionCount || 0;
        updateExpressions.push('sessionCount = :sessionCount');
        expressionAttributeValues[':sessionCount'] = currentCount + 1;
      }

      await dynamoDB.send(
        new UpdateCommand({
          TableName: USERS_TABLE,
          Key: { userId },
          UpdateExpression: updateExpressions.join(', '),
          ExpressionAttributeValues: expressionAttributeValues,
        })
      );

      return successResponse({
        message: 'Session started',
        sessionId: newSessionId,
        startTime: timestamp,
      });
    }

    if (event.path?.includes('/end')) {
      // End session
      if (!sessionId) {
        return badRequestResponse('sessionId is required to end session');
      }

      // Get session
      const session = await dynamoDB.send(
        new GetCommand({
          TableName: SESSIONS_TABLE,
          Key: { sessionId },
        })
      );

      if (!session.Item) {
        return badRequestResponse('Session not found');
      }

      const sessionData = session.Item as Session;
      const duration = Math.floor((timestamp - sessionData.startTime) / 1000); // Duration in seconds

      // Update session with end time and duration
      await dynamoDB.send(
        new UpdateCommand({
          TableName: SESSIONS_TABLE,
          Key: { sessionId },
          UpdateExpression: 'SET endTime = :endTime, duration = :duration',
          ExpressionAttributeValues: {
            ':endTime': timestamp,
            ':duration': duration,
          },
        })
      );

      // Update user's total play time
      const user = await dynamoDB.send(
        new GetCommand({
          TableName: USERS_TABLE,
          Key: { userId },
        })
      );

      if (user.Item) {
        const currentPlayTime = user.Item.totalPlayTime || 0;
        await dynamoDB.send(
          new UpdateCommand({
            TableName: USERS_TABLE,
            Key: { userId },
            UpdateExpression: 'SET totalPlayTime = :totalPlayTime, lastSeenAt = :lastSeenAt',
            ExpressionAttributeValues: {
              ':totalPlayTime': currentPlayTime + duration,
              ':lastSeenAt': timestamp,
            },
          })
        );
      }

      return successResponse({
        message: 'Session ended',
        sessionId,
        duration,
        endTime: timestamp,
      });
    }

    return badRequestResponse('Invalid endpoint');
  } catch (error) {
    console.error('Error processing session:', error);
    return errorResponse('Failed to process session', 500, error as Error);
  }
};

