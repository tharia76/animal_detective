import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as healthModule from './health';
import * as analyticsModule from './analytics';
import * as gameEventsModule from './gameEvents';
import * as userDataModule from './userData';
import * as sessionsModule from './sessions';
import * as animalInteractionsModule from './animalInteractions';
import * as analyticsQueriesModule from './analyticsQueries';
import * as tiktokOAuthModule from './tiktokOAuth';
import * as tiktokEventModule from './tiktokEvent';
import * as tiktokStoreTokenModule from './tiktokStoreToken';

/**
 * Router handler for Lambda Function URL
 * Routes requests to appropriate handlers based on path and method
 */
export const handler = async (
  event: any
): Promise<APIGatewayProxyResult> => {
  // Lambda Function URL uses different event structure than API Gateway
  const path = event.rawPath || event.requestContext?.http?.path || event.path || '';
  const method = event.requestContext?.http?.method || event.httpMethod || 'GET';
  
  // Convert Function URL event to API Gateway format for handlers
  const apiGatewayEvent: APIGatewayProxyEvent = {
    ...event,
    httpMethod: method,
    path: path,
    pathParameters: event.pathParameters || {},
    queryStringParameters: event.queryStringParameters || {},
    headers: event.headers || {},
    body: event.body || '',
    requestContext: {
      ...event.requestContext,
      http: {
        method: method,
        path: path,
      },
    } as any,
  };

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: '',
    };
  }

  try {
    // Route based on path
    if (path === '/health' || path === '/') {
      return await healthModule.handler(apiGatewayEvent);
    }

    if (path === '/analytics' && method === 'POST') {
      return await analyticsModule.handler(apiGatewayEvent);
    }

    if (path === '/game-events' && method === 'POST') {
      return await gameEventsModule.handler(apiGatewayEvent);
    }

    if (path.startsWith('/users/')) {
      const userId = path.split('/users/')[1];
      const modifiedEvent = {
        ...apiGatewayEvent,
        pathParameters: { ...apiGatewayEvent.pathParameters, userId },
      };
      return await userDataModule.handler(modifiedEvent);
    }

    if (path === '/sessions/start' && method === 'POST') {
      const modifiedEvent = {
        ...apiGatewayEvent,
        path: '/sessions/start',
      };
      return await sessionsModule.handler(modifiedEvent);
    }

    if (path === '/sessions/end' && method === 'POST') {
      const modifiedEvent = {
        ...apiGatewayEvent,
        path: '/sessions/end',
      };
      return await sessionsModule.handler(modifiedEvent);
    }

    if (path === '/animals/click' && method === 'POST') {
      return await animalInteractionsModule.handler(apiGatewayEvent);
    }

    if (path === '/analytics/daily-downloads' && method === 'GET') {
      const modifiedEvent = {
        ...apiGatewayEvent,
        path: '/analytics/daily-downloads',
      };
      return await analyticsQueriesModule.handler(modifiedEvent);
    }

    if (path === '/analytics/retention' && method === 'GET') {
      const modifiedEvent = {
        ...apiGatewayEvent,
        path: '/analytics/retention',
      };
      return await analyticsQueriesModule.handler(modifiedEvent);
    }

    if (path === '/analytics/animal-stats' && method === 'GET') {
      const modifiedEvent = {
        ...apiGatewayEvent,
        path: '/analytics/animal-stats',
      };
      return await analyticsQueriesModule.handler(modifiedEvent);
    }

    if (path === '/api/tiktok/exchange' && method === 'POST') {
      return await tiktokOAuthModule.handler(apiGatewayEvent);
    }

    if (path === '/api/tiktok/event' && method === 'POST') {
      return await tiktokEventModule.handler(apiGatewayEvent);
    }

    if (path === '/api/tiktok/store-token' && method === 'POST') {
      return await tiktokStoreTokenModule.handler(apiGatewayEvent);
    }

    // 404 Not Found
    return {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Not Found', path }),
    };
  } catch (error) {
    console.error('Router error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};

