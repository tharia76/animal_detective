# Deployment Guide

Quick start guide for deploying the Animal Detective backend to AWS Lambda.

## Prerequisites

1. **AWS Account**: Sign up at https://aws.amazon.com/
2. **AWS CLI**: Install from https://aws.amazon.com/cli/
3. **Node.js**: Version 20.x or higher
4. **Serverless Framework**: Will be installed via npm

## Step-by-Step Deployment

### 1. Install Dependencies

```bash
cd lambda
npm install
```

### 2. Configure AWS Credentials

#### Option A: AWS CLI (Recommended)
```bash
aws configure
```
Enter your:
- AWS Access Key ID
- AWS Secret Access Key
- Default region: `us-east-1`
- Default output format: `json`

#### Option B: Environment Variables
```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-east-1
```

#### Option C: IAM Role (For CI/CD)
If deploying from CI/CD, use IAM roles instead of access keys.

### 3. Build the Project

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` folder.

### 4. Deploy to AWS

#### Deploy to Development Environment
```bash
npm run deploy:dev
```

#### Deploy to Production Environment
```bash
npm run deploy:prod
```

### 5. Get Your API URL

After deployment, Serverless will output the API Gateway URL:
```
endpoints:
  POST - https://abc123.execute-api.us-east-1.amazonaws.com/dev/analytics
  POST - https://abc123.execute-api.us-east-1.amazonaws.com/dev/game-events
  GET  - https://abc123.execute-api.us-east-1.amazonaws.com/dev/users/{userId}
  PUT  - https://abc123.execute-api.us-east-1.amazonaws.com/dev/users/{userId}
  GET  - https://abc123.execute-api.us-east-1.amazonaws.com/dev/health
```

**Save this base URL** - you'll need it for your mobile app:
```
https://abc123.execute-api.us-east-1.amazonaws.com/dev
```

### 6. Update Mobile App Configuration

Update `src/services/ApiService.ts` in your React Native app:

```typescript
const API_BASE_URL = 'https://abc123.execute-api.us-east-1.amazonaws.com/dev';
```

Or set as environment variable:
```bash
export EXPO_PUBLIC_API_URL=https://abc123.execute-api.us-east-1.amazonaws.com/dev
```

## Testing the Deployment

### Test Health Endpoint
```bash
curl https://your-api-url.execute-api.us-east-1.amazonaws.com/dev/health
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

### Test Analytics Endpoint
```bash
curl -X POST https://your-api-url.execute-api.us-east-1.amazonaws.com/dev/analytics \
  -H "Content-Type: application/json" \
  -d '{
    "events": [
      {
        "eventName": "test_event",
        "eventType": "custom",
        "properties": {"test": true}
      }
    ]
  }'
```

## AWS Resources Created

The deployment creates:

1. **Lambda Functions** (5 functions):
   - `animal-detective-backend-dev-analytics`
   - `animal-detective-backend-dev-gameEvents`
   - `animal-detective-backend-dev-getUserData`
   - `animal-detective-backend-dev-updateUserData`
   - `animal-detective-backend-dev-health`

2. **API Gateway** (REST API):
   - Endpoints for all Lambda functions
   - CORS enabled

3. **DynamoDB Tables** (3 tables):
   - `animal-detective-users-dev`
   - `animal-detective-analytics-dev`
   - `animal-detective-game-events-dev`

4. **IAM Role**:
   - Permissions for Lambda to access DynamoDB

## Monitoring

### View Logs
```bash
# View all logs
npm run logs

# View specific function logs
npm run logs -- -f analytics
npm run logs -- -f gameEvents
npm run logs -- -f userData
```

### CloudWatch Dashboard
1. Go to AWS Console → CloudWatch
2. Navigate to Logs → Log groups
3. Find log groups starting with `/aws/lambda/animal-detective-backend-`

## Updating the Deployment

After making changes:

1. Build: `npm run build`
2. Deploy: `npm run deploy:dev` (or `deploy:prod`)

## Removing the Deployment

To completely remove all AWS resources:

```bash
npm run remove
```

**Warning**: This will delete all DynamoDB tables and data!

## Cost Estimation

For a small app (< 10K users):

- **Lambda**: Free tier covers 1M requests/month
- **API Gateway**: Free tier covers 1M requests/month
- **DynamoDB**: ~$0.25 per million reads, $1.25 per million writes

**Estimated monthly cost: $0-5**

## Troubleshooting

### "Access Denied" Errors
- Check AWS credentials: `aws sts get-caller-identity`
- Ensure IAM user has permissions for Lambda, API Gateway, DynamoDB, CloudFormation

### "Table Already Exists" Errors
- Tables are created automatically. If error persists, check DynamoDB console
- Delete existing tables manually if needed

### Build Errors
- Ensure Node.js 20.x is installed: `node --version`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### CORS Errors
- CORS is enabled by default in serverless.yml
- Check API Gateway CORS settings in AWS Console if issues persist

## Production Checklist

Before deploying to production:

- [ ] Update `serverless.yml` region if needed
- [ ] Set up CloudWatch alarms for errors
- [ ] Configure API Gateway throttling/rate limiting
- [ ] Set up AWS WAF for DDoS protection (optional)
- [ ] Enable DynamoDB backup (optional)
- [ ] Set up monitoring/alerting
- [ ] Review IAM permissions (least privilege)
- [ ] Test all endpoints
- [ ] Update mobile app with production API URL

## Support

For issues:
1. Check CloudWatch logs
2. Review serverless.yml configuration
3. Verify AWS credentials and permissions
4. Check AWS service limits

