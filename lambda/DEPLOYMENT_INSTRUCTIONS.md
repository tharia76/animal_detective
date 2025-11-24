# Lambda Deployment Instructions

## 📦 Package Created

✅ **lambda-deployment.zip** is ready for download!

**Location:** `/Users/saraalaskarova/animal_detective/lambda/lambda-deployment.zip`

**Size:** ~17 MB (includes all dependencies)

## 📤 Upload to AWS Lambda

### Option 1: AWS Lambda Console

1. **Go to AWS Lambda Console**
   - https://console.aws.amazon.com/lambda/

2. **Create or Select Function**
   - Create new function OR select existing function
   - Runtime: **Node.js 20.x**

3. **Upload Package**
   - Go to **Code** tab
   - Click **Upload from** → **.zip file**
   - Select `lambda-deployment.zip`
   - Click **Save**

4. **Configure Handler**
   - **Handler**: `handlers.router.handler` (for Function URL)
   - OR `handlers.health.handler` (for individual function)
   - OR `handlers.tiktokOAuth.handler` (for OAuth endpoint)

5. **Set Environment Variables**
   Go to **Configuration** → **Environment variables**:
   ```
   TIKTOK_APP_SECRET=TTCYJT3g804mY1GuV1MF9q2l4U9kIYJ5
   USERS_TABLE=animal-detective-users-dev
   ANALYTICS_TABLE=animal-detective-analytics-dev
   GAME_EVENTS_TABLE=animal-detective-game-events-dev
   SESSIONS_TABLE=animal-detective-sessions-dev
   ANIMAL_INTERACTIONS_TABLE=animal-detective-animal-interactions-dev
   STAGE=dev
   ```

6. **Configure Function URL** (if using router handler)
   - Go to **Configuration** → **Function URL**
   - Click **Create function URL**
   - Auth type: **NONE** (or AWS_IAM if you prefer)
   - CORS: Enable if needed
   - Copy the Function URL

### Option 2: AWS CLI

```bash
# Update function code
aws lambda update-function-code \
  --function-name your-function-name \
  --zip-file fileb://lambda-deployment.zip

# Update environment variables
aws lambda update-function-configuration \
  --function-name your-function-name \
  --environment Variables="{
    TIKTOK_APP_SECRET=TTCYJT3g804mY1GuV1MF9q2l4U9kIYJ5,
    USERS_TABLE=animal-detective-users-dev,
    ANALYTICS_TABLE=animal-detective-analytics-dev,
    GAME_EVENTS_TABLE=animal-detective-game-events-dev,
    SESSIONS_TABLE=animal-detective-sessions-dev,
    ANIMAL_INTERACTIONS_TABLE=animal-detective-animal-interactions-dev,
    STAGE=dev
  }"
```

## 📋 Package Contents

The zip file includes:

- ✅ **dist/** - Compiled TypeScript code
  - `handlers/` - All Lambda handlers including:
    - `router.js` - Main router (Function URL)
    - `health.js` - Health check
    - `analytics.js` - Analytics tracking
    - `gameEvents.js` - Game events
    - `userData.js` - User data management
    - `sessions.js` - Session tracking
    - `animalInteractions.js` - Animal interactions
    - `analyticsQueries.js` - Analytics queries
    - `tiktokOAuth.js` - TikTok OAuth token exchange ✨ NEW
    - `tiktokTest.js` - TikTok Events API testing
  - `utils/` - Utility functions
    - `dynamodb.js` - DynamoDB client
    - `response.js` - Response helpers
    - `tiktokEventsApi.js` - TikTok Events API ✨ NEW
  - `types/` - TypeScript types

- ✅ **node_modules/** - Production dependencies
  - `@aws-sdk/client-dynamodb`
  - `@aws-sdk/lib-dynamodb`
  - `aws-lambda`
  - `uuid`

- ✅ **package.json** - Package configuration

## 🔧 Available Endpoints

If using `handlers.router.handler` with Function URL:

- `GET /health` - Health check
- `POST /analytics` - Analytics tracking
- `POST /game-events` - Game events
- `GET /users/{userId}` - Get user data
- `PUT /users/{userId}` - Update user data
- `POST /sessions/start` - Start session
- `POST /sessions/end` - End session
- `POST /animals/click` - Track animal click
- `GET /analytics/daily-downloads` - Daily downloads
- `GET /analytics/retention` - User retention
- `GET /analytics/animal-stats` - Animal statistics
- `POST /tiktok-test` - TikTok Events API test ✨ NEW
- `POST /api/tiktok/exchange` - TikTok OAuth token exchange ✨ NEW

## 🧪 Test After Deployment

### Test Health Endpoint

```bash
curl https://your-function-url.lambda-url.us-east-1.on.aws/health
```

### Test TikTok OAuth Exchange

```bash
curl -X POST https://your-function-url.lambda-url.us-east-1.on.aws/api/tiktok/exchange \
  -H "Content-Type: application/json" \
  -d '{"authCode": "test_auth_code"}'
```

## 📝 Notes

- **Handler**: Use `handlers.router.handler` for Function URL (routes all requests)
- **Runtime**: Node.js 20.x
- **Timeout**: Recommended 30 seconds
- **Memory**: 256 MB should be sufficient
- **Environment Variables**: All required variables listed above

## 🔄 Update Package

To create a new package with latest changes:

```bash
cd lambda
./package-lambda.sh
```

This will create a fresh `lambda-deployment.zip` file.

## ✅ Verification Checklist

- [ ] Zip file downloaded
- [ ] Function created/selected in AWS Lambda
- [ ] Package uploaded successfully
- [ ] Handler configured correctly
- [ ] Runtime set to Node.js 20.x
- [ ] Environment variables configured
- [ ] Function URL created (if using router)
- [ ] Health endpoint tested
- [ ] TikTok OAuth endpoint tested

