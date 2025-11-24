# Lambda Deployment Guide

## 🚀 Quick Deploy Script

I've created an automated deployment script for you! Here's how to use it:

### Step 1: Configure AWS Credentials

```bash
aws configure
```

Enter:
- **AWS Access Key ID**: Your access key
- **AWS Secret Access Key**: Your secret key
- **Default region**: `us-east-1` (or your preferred region)
- **Default output format**: `json`

### Step 2: Run Deployment Script

```bash
cd lambda
chmod +x deploy.sh
./deploy.sh
```

The script will:
- ✅ Build TypeScript code
- ✅ Package Lambda function
- ✅ Deploy to AWS Lambda
- ✅ Configure environment variables
- ✅ Set up Function URL
- ✅ Display your Function URL

## 📋 Manual Deployment Steps

If you prefer manual deployment:

### 1. Create Lambda Function (if doesn't exist)

```bash
aws lambda create-function \
  --function-name animal-detective-backend \
  --runtime nodejs20.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
  --handler handlers.router.handler \
  --zip-file fileb://lambda-deployment.zip \
  --timeout 30 \
  --memory-size 256
```

### 2. Update Function Code

```bash
cd lambda
aws lambda update-function-code \
  --function-name animal-detective-backend \
  --zip-file fileb://lambda-deployment.zip
```

### 3. Configure Environment Variables

```bash
aws lambda update-function-configuration \
  --function-name animal-detective-backend \
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

### 4. Create Function URL

```bash
aws lambda create-function-url-config \
  --function-name animal-detective-backend \
  --auth-type NONE \
  --cors '{
    "AllowCredentials": false,
    "AllowHeaders": ["*"],
    "AllowMethods": ["*"],
    "AllowOrigins": ["*"],
    "ExposeHeaders": [],
    "MaxAge": 300
  }'
```

### 5. Get Function URL

```bash
aws lambda get-function-url-config \
  --function-name animal-detective-backend \
  --query 'FunctionUrl' \
  --output text
```

## 🔐 IAM Role Requirements

Your Lambda function needs an IAM role with these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/animal-detective-*"
      ]
    }
  ]
}
```

## 🧪 Test Deployment

After deployment, test your endpoints:

```bash
# Get Function URL
FUNCTION_URL=$(aws lambda get-function-url-config \
  --function-name animal-detective-backend \
  --query 'FunctionUrl' \
  --output text)

# Test health endpoint
curl $FUNCTION_URL/health

# Test TikTok OAuth endpoint
curl -X POST $FUNCTION_URL/api/tiktok/exchange \
  -H "Content-Type: application/json" \
  -d '{"authCode": "test"}'
```

## 📝 Environment Variables

Required environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `TIKTOK_APP_SECRET` | `TTCYJT3g804mY1GuV1MF9q2l4U9kIYJ5` | TikTok App Secret |
| `USERS_TABLE` | `animal-detective-users-dev` | DynamoDB users table |
| `ANALYTICS_TABLE` | `animal-detective-analytics-dev` | DynamoDB analytics table |
| `GAME_EVENTS_TABLE` | `animal-detective-game-events-dev` | DynamoDB game events table |
| `SESSIONS_TABLE` | `animal-detective-sessions-dev` | DynamoDB sessions table |
| `ANIMAL_INTERACTIONS_TABLE` | `animal-detective-animal-interactions-dev` | DynamoDB animal interactions table |
| `STAGE` | `dev` | Deployment stage |

## 🔄 Update Deployment

To update with new changes:

```bash
cd lambda
./deploy.sh
```

Or manually:

```bash
cd lambda
npm run build
npm install --production --no-save
zip -r lambda-deployment.zip dist node_modules package.json
aws lambda update-function-code \
  --function-name animal-detective-backend \
  --zip-file fileb://lambda-deployment.zip
npm install  # Restore dev dependencies
```

## ✅ Verification Checklist

- [ ] AWS CLI installed and configured
- [ ] Lambda function created
- [ ] Code deployed successfully
- [ ] Environment variables configured
- [ ] Function URL created
- [ ] Health endpoint tested
- [ ] Function URL copied for app configuration

## 🆘 Troubleshooting

### "Function not found"
- Create function first using AWS Console or `aws lambda create-function`

### "Access denied"
- Check IAM permissions
- Verify AWS credentials are correct

### "Handler not found"
- Ensure handler is set to: `handlers.router.handler`
- Check that `dist/handlers/router.js` exists in zip

### "Environment variable not set"
- Verify environment variables are configured
- Check variable names match exactly

## 📚 Additional Resources

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [AWS CLI Reference](https://docs.aws.amazon.com/cli/latest/reference/lambda/)
- [Lambda Deployment Instructions](./DEPLOYMENT_INSTRUCTIONS.md)

