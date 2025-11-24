import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamoDB } from '../utils/dynamodb';
import { successResponse, errorResponse, badRequestResponse } from '../utils/response';
import { AnimalInteraction } from '../types';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const ANIMAL_INTERACTIONS_TABLE = process.env.ANIMAL_INTERACTIONS_TABLE || '';

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
    const { userId, animalName, level, interactionType, metadata } = body;

    if (!userId) {
      return badRequestResponse('userId is required');
    }

    if (!animalName) {
      return badRequestResponse('animalName is required');
    }

    const timestamp = Date.now();
    const dateString = getDateString(timestamp);

    const interaction: AnimalInteraction = {
      interactionId: uuidv4(),
      userId,
      animalName,
      level,
      timestamp,
      date: dateString,
      interactionType: interactionType || 'click',
      metadata,
    };

    await dynamoDB.send(
      new PutCommand({
        TableName: ANIMAL_INTERACTIONS_TABLE,
        Item: interaction,
      })
    );

    return successResponse({
      message: 'Animal interaction recorded',
      interaction: {
        animalName,
        timestamp,
        interactionType: interaction.interactionType,
      },
    });
  } catch (error) {
    console.error('Error processing animal interaction:', error);
    return errorResponse('Failed to process animal interaction', 500, error as Error);
  }
};

