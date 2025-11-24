import { ApiResponse } from '../types';

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
};

export function successResponse<T>(data: T, statusCode: number = 200): ApiResponse<T> {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(data),
  };
}

export function errorResponse(
  message: string,
  statusCode: number = 500,
  error?: Error
): ApiResponse<{ error: string; message?: string }> {
  const response: ApiResponse<{ error: string; message?: string }> = {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      error: message,
      ...(error && process.env.STAGE === 'dev' ? { message: error.message } : {}),
    }),
  };
  return response;
}

export function badRequestResponse(message: string): ApiResponse {
  return errorResponse(message, 400);
}

export function notFoundResponse(message: string = 'Resource not found'): ApiResponse {
  return errorResponse(message, 404);
}

export function unauthorizedResponse(message: string = 'Unauthorized'): ApiResponse {
  return errorResponse(message, 401);
}

