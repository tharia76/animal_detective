# Manual Lambda Deployment Guide

This guide shows how to deploy the Lambda functions by uploading a zip file directly to AWS Lambda.

## Step 1: Create the Zip File

Run the packaging script:

```bash
cd lambda
npm run package
```

Or manually:

```bash
cd lambda
npm install --production
npm run build
cd dist
cp -r ../node_modules .
zip -r ../lambda-deployment.zip .
cd ..
rm -rf dist/node_modules
```

This creates `lambda-deployment.zip` ready for upload.

## Step 2: Create DynamoDB Tables

Before deploying Lambda functions, create the DynamoDB tables:

### Users Table
- **Table name**: `animal-detective-users-dev`
- **Partition key**: `userId` (String)
- **Billing mode**: On-demand

### Analytics Table
- **Table name**: `animal-detective-analytics-dev`
- **Partition key**: `eventId` (String)
- **Billing mode**: On-demand
- **TTL**: Enable on `ttl` attribute

### Game Events Table
- **Table name**: `animal-detective-game-events-dev`
- **Partition key**: `userId` (String)
- **Sort key**: `timestamp` (Number)
- **Billing mode**: On-demand
- **GSI**: `LevelIndex` on `level` (String) + `timestamp` (Number)

### Sessions Table
- **Table name**: `animal-detective-sessions-dev`
- **Partition key**: `sessionId` (String)
- **Billing mode**: On-demand
- **GSI 1**: `UserIdIndex` on `userId` (String) + `sessionId` (String)
- **GSI 2**: `DateIndex` on `startDate` (String) + `sessionId` (String)

### Animal Interactions Table
- **Table name**: `animal-detective-animal-interactions-dev`
- **Partition key**: `interactionId` (String)
- **Billing mode**: On-demand
- **GSI 1**: `UserIdIndex` on `userId` (String) + `interactionId` (String)
- **GSI 2**: `AnimalIndex` on `animalName` (String) + `interactionId` (String)
- **GSI 3**: `DateIndex` on `date` (String) + `interactionId` (String)

## Step 3: Create Lambda Functions

For each handler, create a Lambda function:

### Function 1: Health Check
1. Create function: `animal-detective-health-dev`
2. Runtime: Node.js 20.x
3. Handler: `handlers.health.handler`
4. Upload: `lambda-deployment.zip`
5. Timeout: 30 seconds
6. Memory: 256 MB

### Function 2: Analytics
1. Create function: `animal-detective-analytics-dev`
2. Runtime: Node.js 20.x
3. Handler: `handlers.analytics.handler`
4. Upload: `lambda-deployment.zip`
5. Timeout: 30 seconds
6. Memory: 256 MB

### Function 3: Game Events
1. Create function: `animal-detective-game-events-dev`
2. Runtime: Node.js 20.x
3. Handler: `handlers.gameEvents.handler`
4. Upload: `lambda-deployment.zip`
5. Timeout: 30 seconds
6. Memory: 256 MB

### Function 4: User Data
1. Create function: `animal-detective-user-data-dev`
2. Runtime: Node.js 20.x
3. Handler: `handlers.userData.handler`
4. Upload: `lambda-deployment.zip`
5. Timeout: 30 seconds
6. Memory: 256 MB

### Function 5: Sessions
1. Create function: `animal-detective-sessions-dev`
2. Runtime: Node.js 20.x
3. Handler: `handlers.sessions.handler`
4. Upload: `lambda-deployment.zip`
5. Timeout: 30 seconds
6. Memory: 256 MB

### Function 6: Animal Interactions
1. Create function: `animal-detective-animal-interactions-dev`
2. Runtime: Node.js 20.x
3. Handler: `handlers.animalInteractions.handler`
4. Upload: `lambda-deployment.zip`
5. Timeout: 30 seconds
6. Memory: 256 MB

### Function 7: Analytics Queries
1. Create function: `animal-detective-analytics-queries-dev`
2. Runtime: Node.js 20.x
3. Handler: `handlers.analyticsQueries.handler`
4. Upload: `lambda-deployment.zip`
5. Timeout: 30 seconds
6. Memory: 256 MB

## Step 4: Configure Environment Variables

For each function, set these environment variables:

```
STAGE=dev
USERS_TABLE=animal-detective-users-dev
ANALYTICS_TABLE=animal-detective-analytics-dev
GAME_EVENTS_TABLE=animal-detective-game-events-dev
SESSIONS_TABLE=animal-detective-sessions-dev
ANIMAL_INTERACTIONS_TABLE=animal-detective-animal-interactions-dev
```

## Step 5: Set Up IAM Permissions

Create an IAM role with DynamoDB permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/animal-detective-*",
        "arn:aws:dynamodb:*:*:table/animal-detective-*/index/*"
      ]
    }
  ]
}
```

Attach this role to all Lambda functions.

## Step 6: Create API Gateway

1. Create a new REST API
2. Create resources and methods:
   - `POST /analytics` → Analytics function
   - `POST /game-events` → Game Events function
   - `GET /users/{userId}` → User Data function
   - `PUT /users/{userId}` → User Data function
   - `POST /sessions/start` → Sessions function
   - `POST /sessions/end` → Sessions function
   - `POST /animals/click` → Animal Interactions function
   - `GET /analytics/daily-downloads` → Analytics Queries function
   - `GET /analytics/retention` → Analytics Queries function
   - `GET /analytics/animal-stats` → Analytics Queries function
   - `GET /health` → Health function

3. Enable CORS on all methods
4. Deploy API to a stage (e.g., `dev`)
5. Copy the API Gateway URL

## Step 7: Update Mobile App

Update `src/services/ApiService.ts` with your API Gateway URL:

```typescript
const API_BASE_URL = 'https://your-api-id.execute-api.us-east-1.amazonaws.com/dev';
```

## Alternative: Single Function with API Gateway Routing

Instead of creating 7 separate functions, you can:

1. Create one Lambda function
2. Use API Gateway to route based on path
3. Create a router handler that calls the appropriate handler based on the path

This is more complex but uses fewer Lambda functions.

## Troubleshooting

### Zip file too large (>50MB)
- Use Lambda layers for node_modules
- Or use AWS CLI to upload to S3 first

### Handler not found
- Make sure handler path matches: `handlers.filename.handler`
- Check that the file exists in the zip

### DynamoDB errors
- Verify table names match environment variables
- Check IAM permissions
- Ensure tables exist before testing

### CORS errors
- Enable CORS on API Gateway methods
- Check CORS headers in Lambda response

