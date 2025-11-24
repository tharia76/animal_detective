# Lambda Function URL Setup

You've created a Lambda Function URL, which provides direct HTTPS access to your Lambda function without API Gateway.

## Your Function URL

```
https://kbhbelilr3phj6ruq3opi3zs7e0cykav.lambda-url.us-west-2.on.aws/
```

## Important Notes

### Single Function Limitation
A Lambda Function URL exposes **one Lambda function** directly. Since you have multiple handlers (health, analytics, sessions, etc.), you have two options:

### Option 1: Create Multiple Functions (Recommended)
Create separate Lambda functions for each handler, each with its own Function URL:

1. **Health Function**
   - Handler: `handlers.health.handler`
   - Function URL: `https://xxx-health.lambda-url.us-west-2.on.aws/`
   - Endpoint: `GET /health`

2. **Analytics Function**
   - Handler: `handlers.analytics.handler`
   - Function URL: `https://xxx-analytics.lambda-url.us-west-2.on.aws/`
   - Endpoint: `POST /analytics`

3. **Sessions Function**
   - Handler: `handlers.sessions.handler`
   - Function URL: `https://xxx-sessions.lambda-url.us-west-2.on.aws/`
   - Endpoints: `POST /sessions/start`, `POST /sessions/end`

And so on for each handler.

### Option 2: Single Router Function (Advanced)
Create one Lambda function with a router that handles all routes. This requires modifying the code to route based on the request path.

## Current Setup

If you're using the Function URL you provided, you need to:

1. **Check which handler is configured** in your Lambda function
2. **Update the API service** to use the correct base URL
3. **Handle routing** - Function URLs don't support path-based routing like API Gateway

## Update API Service

Update `src/services/ApiService.ts`:

```typescript
const API_BASE_URL = 'https://kbhbelilr3phj6ruq3opi3zs7e0cykav.lambda-url.us-west-2.on.aws';
```

**However**, this will only work if:
- You have a router function that handles all paths
- Or you're using separate Function URLs for each endpoint

## Recommended Approach

For your use case with multiple endpoints, **API Gateway is better** because:
- ✅ Supports path-based routing (`/analytics`, `/sessions/start`, etc.)
- ✅ Single base URL for all endpoints
- ✅ Better for REST APIs
- ✅ More control over CORS, authentication, etc.

**Lambda Function URLs are better for**:
- Single endpoint functions
- Simple webhooks
- Direct function invocation

## Next Steps

1. **If using Function URLs**: Create separate functions for each handler
2. **If using API Gateway**: Set up API Gateway REST API (see `MANUAL_DEPLOYMENT.md`)
3. **Update API service** with the correct base URL(s)

