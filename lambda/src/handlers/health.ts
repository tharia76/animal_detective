import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse } from '../utils/response';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  return successResponse({
    status: 'ok',
    timestamp: Date.now(),
    service: 'animal-detective-backend',
    stage: process.env.STAGE || 'dev',
  });
};

