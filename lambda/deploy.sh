#!/bin/bash

# Lambda Deployment Script
# This script helps you deploy the Lambda function with proper configuration

set -e

echo "🚀 Lambda Deployment Script"
echo "=========================="
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed"
    echo "   Install it from: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured"
    echo "   Run: aws configure"
    exit 1
fi

echo "✅ AWS CLI configured"
echo ""

# Get function name
read -p "Enter Lambda function name (or press Enter for 'tracker_ad'): " FUNCTION_NAME
FUNCTION_NAME=${FUNCTION_NAME:-tracker_ad}

# Get stage
read -p "Enter stage (dev/prod, default: dev): " STAGE
STAGE=${STAGE:-dev}

echo ""
echo "📦 Building and packaging Lambda..."
cd "$(dirname "$0")"

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Install production dependencies
echo "📥 Installing production dependencies..."
npm install --production --no-save

# Create zip
echo "🗜️  Creating deployment package..."
rm -f lambda-deployment.zip
zip -r lambda-deployment.zip dist node_modules package.json -q

# Restore dev dependencies
npm install

echo ""
echo "📤 Deploying to AWS Lambda..."

# Check if function exists
if aws lambda get-function --function-name "$FUNCTION_NAME" &> /dev/null; then
    echo "✅ Function exists, updating code..."
    aws lambda update-function-code \
        --function-name "$FUNCTION_NAME" \
        --zip-file fileb://lambda-deployment.zip > /dev/null
    
    echo "⏳ Waiting for update to complete (this may take 30-60 seconds)..."
    
    # Wait for function to be ready (with timeout)
    MAX_WAIT=120
    ELAPSED=0
    while [ $ELAPSED -lt $MAX_WAIT ]; do
        STATUS=$(aws lambda get-function-configuration \
            --function-name "$FUNCTION_NAME" \
            --query 'LastUpdateStatus' \
            --output text 2>/dev/null || echo "Unknown")
        
        if [ "$STATUS" = "Successful" ]; then
            echo "✅ Code updated successfully!"
            break
        elif [ "$STATUS" = "Failed" ]; then
            echo "❌ Update failed!"
            aws lambda get-function-configuration \
                --function-name "$FUNCTION_NAME" \
                --query 'LastUpdateStatusReason' \
                --output text
            exit 1
        else
            echo -n "."
            sleep 2
            ELAPSED=$((ELAPSED + 2))
        fi
    done
    
    if [ $ELAPSED -ge $MAX_WAIT ]; then
        echo ""
        echo "⚠️  Update taking longer than expected. Check AWS Console for status."
    fi
else
    echo "❌ Function '$FUNCTION_NAME' does not exist"
    echo ""
    echo "Create it first:"
    echo "  1. Go to AWS Lambda Console"
    echo "  2. Create function"
    echo "  3. Runtime: Node.js 20.x"
    echo "  4. Then run this script again"
    exit 1
fi

# Update handler to correct path
echo "⚙️  Updating handler configuration..."
aws lambda update-function-configuration \
    --function-name "$FUNCTION_NAME" \
    --handler "dist/handlers/router.handler" \
    --runtime "nodejs22.x" \
    --timeout 30 \
    --memory-size 256 > /dev/null

echo "✅ Handler configured!"

echo ""
echo "⚙️  Configuring environment variables..."

# Wait for any pending updates to complete
echo "⏳ Waiting for any pending updates to complete..."
MAX_WAIT=60
ELAPSED=0
while [ $ELAPSED -lt $MAX_WAIT ]; do
    STATUS=$(aws lambda get-function-configuration \
        --function-name "$FUNCTION_NAME" \
        --query 'LastUpdateStatus' \
        --output text 2>/dev/null || echo "Unknown")
    
    if [ "$STATUS" = "Successful" ]; then
        echo "✅ Function is ready for configuration update"
        break
    elif [ "$STATUS" = "Failed" ]; then
        echo "⚠️ Previous update failed, continuing anyway..."
        break
    else
        echo -n "."
        sleep 2
        ELAPSED=$((ELAPSED + 2))
    fi
done

if [ $ELAPSED -ge $MAX_WAIT ]; then
    echo ""
    echo "⚠️ Timeout waiting for function update. Retrying configuration..."
fi

# Set environment variables with retry logic
RETRY_COUNT=0
MAX_RETRIES=3
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if aws lambda update-function-configuration \
        --function-name "$FUNCTION_NAME" \
        --environment "Variables={
            USERS_TABLE=animal-detective-users-${STAGE},
            ANALYTICS_TABLE=animal-detective-analytics-${STAGE},
        GAME_EVENTS_TABLE=animal-detective-game-events-${STAGE},
            SESSIONS_TABLE=animal-detective-sessions-${STAGE},
            ANIMAL_INTERACTIONS_TABLE=animal-detective-animal-interactions-${STAGE},
            STAGE=${STAGE}
        }" \
        --handler "dist/handlers/router.handler" \
        --runtime "nodejs22.x" \
        --timeout 30 \
        --memory-size 256 > /dev/null 2>&1; then
        echo "✅ Environment variables configured!"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            echo "⚠️ Configuration update failed, retrying in 5 seconds... ($RETRY_COUNT/$MAX_RETRIES)"
            sleep 5
        else
            echo "❌ Failed to configure environment variables after $MAX_RETRIES attempts"
            echo "💡 You can configure them manually in AWS Lambda Console"
        fi
    fi
done

echo ""
echo "🔗 Setting up Function URL..."

# Check if Function URL exists
FUNCTION_URL=$(aws lambda get-function-url-config --function-name "$FUNCTION_NAME" 2>/dev/null | grep -o '"FunctionUrl": "[^"]*' | cut -d'"' -f4 || echo "")

if [ -z "$FUNCTION_URL" ]; then
    echo "Creating Function URL..."
    FUNCTION_URL=$(aws lambda create-function-url-config \
        --function-name "$FUNCTION_NAME" \
        --auth-type NONE \
        --cors '{
            "AllowCredentials": false,
            "AllowHeaders": ["*"],
            "AllowMethods": ["*"],
            "AllowOrigins": ["*"],
            "ExposeHeaders": [],
            "MaxAge": 300
        }' \
        --query 'FunctionUrl' \
        --output text)
    
    echo "✅ Function URL created!"
else
    echo "✅ Function URL already exists"
fi

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "📋 Configuration Summary:"
echo "   Function Name: $FUNCTION_NAME"
echo "   Stage: $STAGE"
echo "   Handler: handlers.router.handler"
echo "   Runtime: Node.js 20.x"
echo "   Function URL: $FUNCTION_URL"
echo ""
echo "🧪 Test your deployment:"
echo "   curl $FUNCTION_URL/health"
echo ""
echo "📝 Update your app with Function URL:"
echo "   EXPO_PUBLIC_API_URL=$FUNCTION_URL"
echo ""

