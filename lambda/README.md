# Animal Detective Backend

AWS Lambda backend for the Animal Detective mobile app. This serverless backend provides APIs for analytics tracking, game events, and user data management.

## Architecture

- **Runtime**: Node.js 20.x
- **Framework**: Serverless Framework
- **Database**: AWS DynamoDB (3 tables)
- **API**: AWS API Gateway (REST API)
- **Language**: TypeScript

## Features

- ✅ Analytics event tracking
- ✅ Game event tracking (level starts, completions, animal discoveries)
- ✅ User data management (progress, preferences, purchases)
- ✅ Health check endpoint
- ✅ CORS enabled for mobile app access
- ✅ Automatic TTL for analytics data (90 days)

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **Node.js** 20.x or higher
3. **AWS CLI** configured with credentials
4. **Serverless Framework** CLI

## Setup

### 1. Install Dependencies

```bash
cd lambda
npm install
```

### 2. Configure AWS Credentials

Make sure your AWS credentials are configured:

```bash
aws configure
```

Or set environment variables:
```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-east-1
```

### 3. Build TypeScript

```bash
npm run build
```

### 4. Deploy to AWS

Deploy to development:
```bash
npm run deploy:dev
```

Deploy to production:
```bash
npm run deploy:prod
```

After deployment, you'll get an API Gateway URL like:
```
https://abc123.execute-api.us-east-1.amazonaws.com/dev
```

## API Endpoints

### Health Check
```
GET /health
```

### Analytics
```
POST /analytics
Body: {
  events: [
    {
      userId?: string;
      deviceId?: string;
      eventName: string;
      eventType?: string;
      properties?: object;
      timestamp?: number;
      platform?: 'ios' | 'android' | 'web';
      appVersion?: string;
    }
  ]
}
```

### Game Events
```
POST /game-events
Body: {
  userId: string;
  eventType: 'level_started' | 'level_completed' | 'animal_discovered' | 'purchase' | 'app_launch';
  level?: string;
  animal?: string;
  score?: number;
  duration?: number;
  metadata?: object;
}
```

### Get User Data
```
GET /users/{userId}
```

### Update User Data
```
PUT /users/{userId}
Body: {
  deviceId?: string;
  platform?: 'ios' | 'android' | 'web';
  progress?: {
    unlockedLevels: string[];
    completedLevels: string[];
    totalAnimalsDiscovered: number;
    totalPlayTime: number;
  };
  preferences?: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    language?: string;
  };
  purchases?: Array<{
    productId: string;
    transactionId: string;
    purchaseDate: number;
  }>;
}
```

## Local Development

### Using Serverless Offline (Optional)

Install serverless-offline plugin:
```bash
npm install --save-dev serverless-offline
```

Add to `serverless.yml` plugins:
```yaml
plugins:
  - serverless-plugin-typescript
  - serverless-offline
```

Run locally:
```bash
serverless offline
```

## Environment Variables

The backend uses environment variables set in `serverless.yml`:
- `STAGE`: Deployment stage (dev, prod)
- `USERS_TABLE`: DynamoDB table name for users
- `ANALYTICS_TABLE`: DynamoDB table name for analytics
- `GAME_EVENTS_TABLE`: DynamoDB table name for game events

## DynamoDB Tables

Three tables are automatically created:

1. **Users Table** (`animal-detective-users-{stage}`)
   - Primary Key: `userId` (String)
   - Stores user progress, preferences, and purchase history

2. **Analytics Table** (`animal-detective-analytics-{stage}`)
   - Primary Key: `eventId` (String)
   - TTL: 90 days
   - Stores analytics events

3. **Game Events Table** (`animal-detective-game-events-{stage}`)
   - Primary Key: `userId` (String) + `timestamp` (Number)
   - GSI: `LevelIndex` on `level` + `timestamp`
   - Stores game-specific events

## Costs

- **Lambda**: Pay per request (first 1M requests free/month)
- **API Gateway**: Pay per API call (first 1M requests free/month)
- **DynamoDB**: Pay per request (on-demand billing)

Estimated cost for small app: **$0-5/month**

## Monitoring

View logs:
```bash
npm run logs -- -f analytics
npm run logs -- -f gameEvents
npm run logs -- -f userData
```

## Removing the Stack

To completely remove all resources:
```bash
npm run remove
```

## Integration with Mobile App

After deployment, update the API URL in your React Native app:

1. Set environment variable:
```bash
export EXPO_PUBLIC_API_URL=https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/dev
```

2. Or update `src/services/ApiService.ts`:
```typescript
const API_BASE_URL = 'https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/dev';
```

3. Use the API service in your app:
```typescript
import ApiService from './src/services/ApiService';

// Track game events
await ApiService.trackLevelCompleted(userId, 'forest', 100, 120);

// Update user data
await ApiService.updateUserData(userId, {
  progress: {
    unlockedLevels: ['forest', 'ocean'],
    completedLevels: ['forest'],
    totalAnimalsDiscovered: 5,
    totalPlayTime: 3600,
  },
});
```

## Troubleshooting

### Deployment Issues

1. **Permission Errors**: Ensure your AWS credentials have permissions for Lambda, API Gateway, DynamoDB, and CloudFormation
2. **Region Mismatch**: Make sure your AWS region matches the region in `serverless.yml`
3. **Build Errors**: Run `npm run build` before deploying

### Runtime Issues

1. **CORS Errors**: CORS is enabled by default. If issues persist, check API Gateway CORS settings
2. **DynamoDB Errors**: Ensure tables are created (they should be created automatically)
3. **Timeout Errors**: Increase timeout in `serverless.yml` if needed

## License

Same as main project.

