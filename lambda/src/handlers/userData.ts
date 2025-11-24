import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamoDB } from '../utils/dynamodb';
import {
  successResponse,
  errorResponse,
  badRequestResponse,
  notFoundResponse,
} from '../utils/response';
import { UserData } from '../types';
import { GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const USERS_TABLE = process.env.USERS_TABLE || '';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.pathParameters?.userId;

    if (!userId) {
      return badRequestResponse('userId is required');
    }

    if (event.httpMethod === 'GET') {
      // Get user data
      const result = await dynamoDB.send(
        new GetCommand({
          TableName: USERS_TABLE,
          Key: { userId },
        })
      );

      if (!result.Item) {
        return notFoundResponse('User not found');
      }

      return successResponse(result.Item as UserData);
    }

    if (event.httpMethod === 'PUT') {
      // Update or create user data
      if (!event.body) {
        return badRequestResponse('Request body is required');
      }

      const body = JSON.parse(event.body);
      const timestamp = Date.now();

      // Check if user exists
      const existingUser = await dynamoDB.send(
        new GetCommand({
          TableName: USERS_TABLE,
          Key: { userId },
        })
      );

      if (existingUser.Item) {
        // Update existing user
        const updateExpression: string[] = [];
        const expressionAttributeNames: Record<string, string> = {};
        const expressionAttributeValues: Record<string, any> = {};

        updateExpression.push('SET lastSeenAt = :lastSeenAt');
        expressionAttributeValues[':lastSeenAt'] = timestamp;

        if (body.progress) {
          updateExpression.push('progress = :progress');
          expressionAttributeValues[':progress'] = body.progress;
        }

        if (body.preferences) {
          updateExpression.push('preferences = :preferences');
          expressionAttributeValues[':preferences'] = body.preferences;
        }

        if (body.purchases) {
          updateExpression.push('purchases = :purchases');
          expressionAttributeValues[':purchases'] = body.purchases;
        }

        await dynamoDB.send(
          new UpdateCommand({
            TableName: USERS_TABLE,
            Key: { userId },
            UpdateExpression: updateExpression.join(', '),
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
          })
        );
      } else {
        // Create new user
        const userData: UserData = {
          userId,
          deviceId: body.deviceId,
          platform: body.platform,
          createdAt: timestamp,
          lastSeenAt: timestamp,
          firstSeenAt: timestamp, // Track first seen for retention
          sessionCount: 1,
          totalPlayTime: 0,
          progress: body.progress || {
            unlockedLevels: [],
            completedLevels: [],
            totalAnimalsDiscovered: 0,
            totalPlayTime: 0,
          },
          preferences: body.preferences || {
            soundEnabled: true,
            musicEnabled: true,
          },
          purchases: body.purchases || [],
        };

        await dynamoDB.send(
          new PutCommand({
            TableName: USERS_TABLE,
            Item: userData,
          })
        );
      }

      return successResponse({
        message: 'User data updated',
        userId,
      });
    }

    return badRequestResponse('Method not allowed');
  } catch (error) {
    console.error('Error processing user data:', error);
    return errorResponse('Failed to process user data', 500, error as Error);
  }
};

