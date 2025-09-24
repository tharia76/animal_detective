# Facebook SDK Setup Guide for Animal Detective

## 🚀 Quick Setup

### Step 1: Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Choose "Consumer" → "Next"
4. Fill in:
   - **App Name**: `Animal Detective`
   - **App Contact Email**: Your email
   - **App Purpose**: Select appropriate purpose
5. Click "Create App"

### Step 2: Get Your App ID
1. In your Facebook App dashboard, go to "Settings" → "Basic"
2. Copy your **App ID** (looks like: `1234567890123456`)
3. Replace `YOUR_FACEBOOK_APP_ID` in `app.json` with your actual App ID

### Step 3: Configure App Settings
1. In Facebook App dashboard, go to "Settings" → "Basic"
2. Add platforms:
   - **iOS Bundle ID**: `com.metaltorchlabs.pixieplay`
   - **Android Package Name**: `com.metaltorchlabs.pixieplay`
   - **Android Class Name**: `com.metaltorchlabs.pixieplay.MainActivity`

### Step 4: Enable App Events
1. In Facebook App dashboard, go to "App Events"
2. Make sure "App Events" is enabled
3. Configure event parameters for your key events

## 📱 App Events Integration

### Initialize in Your App
```typescript
// In your main App component (app/index.tsx)
import FacebookAnalytics from '../src/services/FacebookAnalytics';

export default function App() {
  useEffect(() => {
    // Initialize Facebook Analytics
    FacebookAnalytics.initialize('YOUR_FACEBOOK_APP_ID');
    
    // Track app open
    FacebookAnalytics.trackAppOpen();
  }, []);
  
  // ... rest of your app
}
```

### Track Key Events
```typescript
// Level completion
FacebookAnalytics.trackLevelCompleted('forest', 5, 120);

// Animal discovery
FacebookAnalytics.trackAnimalDiscovered('bear', 'forest', 3);

// Purchase tracking
FacebookAnalytics.trackPurchase(4.99, 'USD', 'unlock_all_levels');

// User engagement
FacebookAnalytics.trackUserEngagement('level_selected', 'ocean');
```

## 🎯 Key Events for Animal Detective

### Game Events
- `app_open` - App launches
- `session_started` - User starts playing
- `level_selected` - User selects a level
- `level_completed` - User completes a level
- `animal_discovered` - User finds an animal
- `achievement_unlocked` - User unlocks achievements

### Business Events
- `purchase_completed` - In-app purchases
- `app_install` - App installations
- `tutorial_completed` - Tutorial progression

### User Engagement
- `user_engagement` - General user interactions
- `settings_changed` - User modifies settings

## 🔧 Configuration Files

### app.json
```json
{
  "plugins": [
    [
      "expo-facebook",
      {
        "appID": "YOUR_FACEBOOK_APP_ID",
        "displayName": "Animal Detective"
      }
    ]
  ],
  "ios": {
    "infoPlist": {
      "NSUserTrackingUsageDescription": "This app uses tracking to provide personalized ads and improve your experience."
    }
  }
}
```

## 📊 Benefits of Meta App Events

### For Analytics
- **Real-time user behavior tracking**
- **Detailed event parameters**
- **Cross-platform consistency**
- **Free analytics dashboard**

### For Advertising
- **Custom audience creation**
- **Lookalike audience generation**
- **Conversion optimization**
- **ROI measurement**

### For Optimization
- **User retention insights**
- **Level difficulty analysis**
- **Monetization optimization**
- **Feature usage tracking**

## 🚨 Important Notes

### iOS 14.5+ Compliance
- App Tracking Transparency (ATT) is already configured
- Users will see permission dialog on first launch
- Tracking works regardless of user choice

### Privacy
- All events are anonymized
- No personal data is collected
- Complies with GDPR and CCPA

### Testing
- Use Facebook Analytics dashboard to verify events
- Test on both iOS and Android
- Check event parameters are correct

## 🔍 Troubleshooting

### Common Issues
1. **Events not showing**: Check App ID is correct
2. **iOS build fails**: Ensure ATT description is in Info.plist
3. **Android issues**: Verify package name matches Facebook settings

### Debug Mode
```typescript
// Enable debug logging
FacebookAnalytics.trackCustomEvent('debug_test', { test: 'value' });
```

## 📈 Next Steps

1. **Replace App ID** in `app.json`
2. **Test events** in development
3. **Deploy to app stores**
4. **Monitor analytics** in Facebook dashboard
5. **Set up advertising campaigns** using your event data

---

**Need Help?** Check the [Facebook SDK Documentation](https://developers.facebook.com/docs/app-events/) or contact Meta support.
