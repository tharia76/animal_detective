/**
 * Direct TikTok Events API Test Script
 * 
 * Run this script directly to test TikTok Events API with test event code
 * 
 * Usage:
 *   node test-tiktok-direct.js
 * 
 * Or with custom test code:
 *   TEST_EVENT_CODE=TEST99645 node test-tiktok-direct.js
 */

const TEST_EVENT_CODE = process.env.TEST_EVENT_CODE || 'TEST99645';
const TIKTOK_PIXEL_CODE = '7568899277611696136';
const TIKTOK_EVENTS_API_URL = 'https://business-api.tiktok.com/open_api/v1.3/event/track/';

async function testTikTokEvent(eventType, eventData = {}) {
  const payload = {
    pixel_code: TIKTOK_PIXEL_CODE,
    test_event_code: TEST_EVENT_CODE,
    event: {
      event: eventType,
      timestamp: new Date().toISOString(),
      properties: eventData.properties || {},
      ...(eventData.userId && {
        context: {
          user: {
            external_id: eventData.userId,
          },
        },
      }),
    },
  };

  console.log(`\n📤 Sending ${eventType} event...`);
  console.log('Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(TIKTOK_EVENTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: For testing, TikTok may accept requests without auth
        // For production, you'll need Access Token
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ Error: ${data.message || response.statusText}`);
      console.error('Response:', JSON.stringify(data, null, 2));
      return false;
    }

    console.log('✅ Success!');
    console.log('Response:', JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 TikTok Events API Test');
  console.log('Test Event Code:', TEST_EVENT_CODE);
  console.log('Pixel Code:', TIKTOK_PIXEL_CODE);
  console.log('=' .repeat(50));

  // Test 1: Launch App
  await testTikTokEvent('launch_app', {
    userId: 'test_user_123',
  });

  // Test 2: Level Completed
  await testTikTokEvent('achieve_level', {
    userId: 'test_user_123',
    properties: {
      level_name: 'forest',
      level_id: 'forest',
      score: 100,
      duration: 120,
    },
  });

  // Test 3: Animal Discovered
  await testTikTokEvent('view_content', {
    userId: 'test_user_123',
    properties: {
      content_type: 'animal',
      content_name: 'bear',
      content_id: 'forest_bear',
      level_name: 'forest',
    },
  });

  // Test 4: Purchase
  await testTikTokEvent('purchase', {
    userId: 'test_user_123',
    properties: {
      value: 4.99,
      currency: 'USD',
      content_type: 'in_app_purchase',
      content_id: 'unlock_all_levels',
      order_id: 'test_order_123',
    },
  });

  console.log('\n' + '='.repeat(50));
  console.log('✅ All tests completed!');
  console.log('\n📊 Check TikTok Events Manager → Test Events to see if events were received.');
  console.log('   URL: https://ads.tiktok.com/help/article?aid=10028');
}

// Run tests
runTests().catch(console.error);

