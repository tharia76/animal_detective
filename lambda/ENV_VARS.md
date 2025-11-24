# Environment Variables for Lambda

When uploading the zip file directly to AWS Lambda, you need to configure these environment variables:

## Required Environment Variables

```
STAGE=dev
USERS_TABLE=animal-detective-users-dev
ANALYTICS_TABLE=animal-detective-analytics-dev
GAME_EVENTS_TABLE=animal-detective-game-events-dev
SESSIONS_TABLE=animal-detective-sessions-dev
ANIMAL_INTERACTIONS_TABLE=animal-detective-animal-interactions-dev
```

## How to Set Environment Variables

### Option 1: AWS Lambda Console
1. Go to your Lambda function
2. Click on "Configuration" tab
3. Click on "Environment variables"
4. Click "Edit"
5. Add each variable above
6. Click "Save"

### Option 2: AWS CLI
```bash
aws lambda update-function-configuration \
  --function-name your-function-name \
  --environment Variables="{
    STAGE=dev,
    USERS_TABLE=animal-detective-users-dev,
    ANALYTICS_TABLE=animal-detective-analytics-dev,
    GAME_EVENTS_TABLE=animal-detective-game-events-dev,
    SESSIONS_TABLE=animal-detective-sessions-dev,
    ANIMAL_INTERACTIONS_TABLE=animal-detective-animal-interactions-dev
  }"
```

## Handler Configuration

Each Lambda function needs a different handler:

- **Health Check**: `handlers.health.handler`
- **Analytics**: `handlers.analytics.handler`
- **Game Events**: `handlers.gameEvents.handler`
- **User Data**: `handlers.userData.handler`
- **Sessions**: `handlers.sessions.handler`
- **Animal Interactions**: `handlers.animalInteractions.handler`
- **Analytics Queries**: `handlers.analyticsQueries.handler`

## Creating Multiple Functions

Since you're uploading manually, you'll need to:

1. Create separate Lambda functions for each handler
2. Upload the same zip file to each function
3. Set the appropriate handler for each function
4. Configure API Gateway to route to each function

Or use one function with API Gateway routing based on the path.

