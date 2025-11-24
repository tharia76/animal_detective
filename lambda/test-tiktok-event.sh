#!/bin/bash

# TikTok Events API Test Script
# Tests TikTok Events API with test event code TEST99645

# Get API URL from environment or use default
API_URL="${API_URL:-http://localhost:3000}"

# Test event code from TikTok Events Manager
TEST_EVENT_CODE="TEST99645"

echo "🧪 Testing TikTok Events API..."
echo "Test Event Code: $TEST_EVENT_CODE"
echo "API URL: $API_URL"
echo ""

# Test 1: Launch App event
echo "📱 Test 1: Launch App Event"
curl -X POST "$API_URL/tiktok-test" \
  -H "Content-Type: application/json" \
  -d '{
    "testEventCode": "'"$TEST_EVENT_CODE"'",
    "eventType": "launch_app",
    "eventData": {
      "userId": "test_user_123"
    }
  }' | jq '.'

echo ""
echo ""

# Test 2: Level Completed event
echo "🎮 Test 2: Level Completed Event"
curl -X POST "$API_URL/tiktok-test" \
  -H "Content-Type: application/json" \
  -d '{
    "testEventCode": "'"$TEST_EVENT_CODE"'",
    "eventType": "achieve_level",
    "eventData": {
      "userId": "test_user_123",
      "level": "forest",
      "score": 100,
      "duration": 120
    }
  }' | jq '.'

echo ""
echo ""

# Test 3: Animal Discovered event
echo "🐻 Test 3: Animal Discovered Event"
curl -X POST "$API_URL/tiktok-test" \
  -H "Content-Type: application/json" \
  -d '{
    "testEventCode": "'"$TEST_EVENT_CODE"'",
    "eventType": "view_content",
    "eventData": {
      "userId": "test_user_123",
      "level": "forest",
      "animal": "bear"
    }
  }' | jq '.'

echo ""
echo ""

# Test 4: Purchase event
echo "💰 Test 4: Purchase Event"
curl -X POST "$API_URL/tiktok-test" \
  -H "Content-Type: application/json" \
  -d '{
    "testEventCode": "'"$TEST_EVENT_CODE"'",
    "eventType": "purchase",
    "eventData": {
      "userId": "test_user_123",
      "productId": "unlock_all_levels",
      "amount": 4.99,
      "currency": "USD",
      "transactionId": "test_transaction_123"
    }
  }' | jq '.'

echo ""
echo "✅ All tests completed!"
echo ""
echo "Check TikTok Events Manager → Test Events to see if events were received."

