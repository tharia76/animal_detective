# Lambda Function URL Setup Guide

## Your Function URL

```
https://kbhbelilr3phj6ruq3opi3zs7e0cykav.lambda-url.us-west-2.on.aws/
```

## Setup Steps

### 1. Update Lambda Function Handler

In your Lambda function configuration, set the handler to:

```
handlers.router.handler
```

This router will handle all your API endpoints.

### 2. Configure Environment Variables

Set these environment variables in your Lambda function:

```
STAGE=dev
USERS_TABLE=animal-detective-users-dev
ANALYTICS_TABLE=animal-detective-analytics-dev
GAME_EVENTS_TABLE=animal-detective-game-events-dev
SESSIONS_TABLE=animal-detective-sessions-dev
ANIMAL_INTERACTIONS_TABLE=animal-detective-animal-interactions-dev
```

### 3. Test the Function URL

Test your health endpoint:

```bash
curl https://kbhbelilr3phj6ruq3opi3zs7e0cykav.lambda-url.us-west-2.on.aws/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": 1234567890,
  "service": "animal-detective-backend",
  "stage": "dev"
}
```

### 4. Available Endpoints

All endpoints use your Function URL as the base:

- `GET /health` - Health check
- `POST /analytics` - Track analytics events
- `POST /game-events` - Track game events
- `GET /users/{userId}` - Get user data
- `PUT /users/{userId}` - Update user data
- `POST /sessions/start` - Start session
- `POST /sessions/end` - End session
- `POST /animals/click` - Track animal clicks
- `GET /analytics/daily-downloads` - Get daily downloads
- `GET /analytics/retention` - Get retention stats
- `GET /analytics/animal-stats` - Get animal statistics

### 5. Update Mobile App

The API service has been updated with your Function URL. It's already configured in `src/services/ApiService.ts`.

If you need to change it, update:

```typescript
const API_BASE_URL = 'https://kbhbelilr3phj6ruq3opi3zs7e0cykav.lambda-url.us-west-2.on.aws';
```

## Important Notes

- **CORS**: The router handles CORS automatically
- **Path Routing**: The router handles all paths - no need for API Gateway
- **Single Function**: All endpoints are handled by one Lambda function
- **Cost**: Function URLs are cheaper than API Gateway for simple use cases

## Troubleshooting

### 404 Errors
- Make sure handler is set to `handlers.router.handler`
- Check that the path matches exactly (case-sensitive)

### CORS Errors
- The router handles CORS automatically
- Make sure OPTIONS requests are allowed

### Environment Variables
- Verify all environment variables are set
- Check DynamoDB table names match your environment

