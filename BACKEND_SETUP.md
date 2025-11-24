# Backend Setup Guide

This guide explains how to set up and use the AWS Lambda backend for the Animal Detective app.

## Overview

The backend provides:
- **Analytics tracking**: Store and analyze user behavior
- **Game events**: Track level completions, animal discoveries, purchases
- **User data**: Store user progress, preferences, and purchase history
- **RESTful API**: Easy integration with React Native app

## Quick Start

### 1. Deploy Backend

```bash
cd lambda
npm install
npm run build
npm run deploy:dev
```

After deployment, copy the API Gateway URL (e.g., `https://abc123.execute-api.us-east-1.amazonaws.com/dev`)

### 2. Configure Mobile App

Update `src/services/ApiService.ts`:

```typescript
const API_BASE_URL = 'https://your-api-url.execute-api.us-east-1.amazonaws.com/dev';
```

Or set environment variable:
```bash
export EXPO_PUBLIC_API_URL=https://your-api-url.execute-api.us-east-1.amazonaws.com/dev
```

### 3. Use in Your App

```typescript
import ApiService from './src/services/ApiService';

// Track game events
await ApiService.trackLevelCompleted(userId, 'forest', 100, 120);
await ApiService.trackAnimalDiscovered(userId, 'bear', 'forest');

// Update user progress
await ApiService.updateUserData(userId, {
  progress: {
    unlockedLevels: ['forest', 'ocean'],
    completedLevels: ['forest'],
    totalAnimalsDiscovered: 5,
    totalPlayTime: 3600,
  },
});
```

## API Endpoints

### Health Check
```typescript
const health = await ApiService.healthCheck();
```

### Track Analytics
```typescript
await ApiService.trackAnalytics([
  {
    userId: 'user123',
    eventName: 'button_click',
    eventType: 'ui_interaction',
    properties: { button: 'play' },
  },
]);
```

### Track Game Events
```typescript
// Level started
await ApiService.trackLevelStarted(userId, 'forest');

// Level completed
await ApiService.trackLevelCompleted(userId, 'forest', 100, 120);

// Animal discovered
await ApiService.trackAnimalDiscovered(userId, 'bear', 'forest');

// Purchase
await ApiService.trackPurchase(userId, 'unlock_all', 'txn_123');

// App launch
await ApiService.trackAppLaunch(userId);
```

### User Data
```typescript
// Get user data
const userData = await ApiService.getUserData(userId);

// Update user data
await ApiService.updateUserData(userId, {
  progress: {
    unlockedLevels: ['forest'],
    completedLevels: ['forest'],
    totalAnimalsDiscovered: 5,
    totalPlayTime: 3600,
  },
  preferences: {
    soundEnabled: true,
    musicEnabled: false,
    language: 'en',
  },
});
```

## Integration Example

Here's how to integrate with your existing game logic:

```typescript
// In your level completion handler
import ApiService from './src/services/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

async function handleLevelComplete(levelName: string, score: number, duration: number) {
  // Get or create user ID
  let userId = await AsyncStorage.getItem('userId');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await AsyncStorage.setItem('userId', userId);
  }

  // Track event
  await ApiService.trackLevelCompleted(userId, levelName, score, duration);

  // Update user progress
  const currentProgress = await ApiService.getUserData(userId).catch(() => null);
  const completedLevels = currentProgress?.progress?.completedLevels || [];
  
  if (!completedLevels.includes(levelName)) {
    await ApiService.updateUserData(userId, {
      progress: {
        ...currentProgress?.progress,
        completedLevels: [...completedLevels, levelName],
        totalPlayTime: (currentProgress?.progress?.totalPlayTime || 0) + duration,
      },
    });
  }
}
```

## Error Handling

The API service methods catch errors internally and log warnings, so they won't crash your app:

```typescript
// Safe to call - errors are handled internally
await ApiService.trackLevelCompleted(userId, 'forest', 100, 120);
```

If you need to handle errors explicitly:

```typescript
try {
  await ApiService.updateUserData(userId, { progress: {...} });
} catch (error) {
  console.error('Failed to update user data:', error);
  // Fallback to local storage
}
```

## Testing

### Test Health Endpoint
```bash
curl https://your-api-url.execute-api.us-east-1.amazonaws.com/dev/health
```

### Test Analytics
```bash
curl -X POST https://your-api-url.execute-api.us-east-1.amazonaws.com/dev/analytics \
  -H "Content-Type: application/json" \
  -d '{
    "events": [{
      "eventName": "test",
      "properties": {"test": true}
    }]
  }'
```

## Costs

- **Free Tier**: First 1M Lambda requests/month
- **Free Tier**: First 1M API Gateway requests/month  
- **DynamoDB**: Pay-per-use (~$0-5/month for small apps)

## Monitoring

View logs:
```bash
cd lambda
npm run logs -- -f analytics
npm run logs -- -f gameEvents
```

## Troubleshooting

### API Not Responding
1. Check API Gateway URL is correct
2. Verify deployment: `cd lambda && npm run deploy:dev`
3. Check CloudWatch logs for errors

### CORS Errors
- CORS is enabled by default
- If issues persist, check API Gateway CORS settings in AWS Console

### Network Errors
- Check internet connection
- Verify API URL is accessible
- Check AWS region matches deployment region

## Next Steps

1. Deploy backend: `cd lambda && npm run deploy:dev`
2. Update API URL in `src/services/ApiService.ts`
3. Integrate API calls in your game logic
4. Test endpoints
5. Monitor usage in AWS Console

For detailed deployment instructions, see `lambda/DEPLOYMENT.md`

