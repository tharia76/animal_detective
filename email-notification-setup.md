# App Download Notification Setup

## Option 1: App Store Connect Notifications
1. Go to App Store Connect
2. Navigate to your app
3. Go to Analytics → Notifications
4. Set up email alerts for:
   - Daily sales reports
   - Download milestones (e.g., every 100 downloads)
   - Revenue thresholds

## Option 2: Firebase Analytics with Email Alerts
```javascript
// Install Firebase
npm install @react-native-firebase/app @react-native-firebase/analytics

// In your app
import analytics from '@react-native-firebase/analytics';

// Track app opens
useEffect(() => {
  analytics().logAppOpen();
}, []);

// Track custom events
const trackDownload = () => {
  analytics().logEvent('app_downloaded', {
    platform: Platform.OS,
    timestamp: new Date().toISOString()
  });
};
```

## Option 3: Simple Backend with Email Service
```javascript
// Backend endpoint (Node.js example)
const express = require('express');
const nodemailer = require('nodemailer');

app.post('/track-download', async (req, res) => {
  const { platform, version, timestamp } = req.body;
  
  // Send email notification
  await sendDownloadNotification({
    platform,
    version,
    timestamp,
    downloadCount: await getTotalDownloads()
  });
  
  res.json({ success: true });
});

async function sendDownloadNotification(data) {
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-app-password'
    }
  });
  
  await transporter.sendMail({
    from: 'your-email@gmail.com',
    to: 'your-email@gmail.com',
    subject: `New App Download - Animal Detective`,
    html: `
      <h2>New App Download!</h2>
      <p>Platform: ${data.platform}</p>
      <p>Version: ${data.version}</p>
      <p>Time: ${data.timestamp}</p>
      <p>Total Downloads: ${data.downloadCount}</p>
    `
  });
}
```

## Option 4: Zapier Integration
1. Connect App Store Connect to Zapier
2. Set up trigger: "New download"
3. Action: Send email notification
4. Configure email template with download details

## Option 5: RevenueCat (For In-App Purchases)
If you're using in-app purchases:
```javascript
// Track subscription events
import Purchases from 'react-native-purchases';

Purchases.addCustomerInfoUpdateListener((customerInfo) => {
  if (customerInfo.entitlements.active['premium']) {
    // User subscribed - send notification
    trackSubscription();
  }
});
```

## Recommended Approach
1. **Start with App Store Connect** - Built-in, no coding required
2. **Add Firebase Analytics** - For detailed user behavior tracking
3. **Consider Zapier** - Easy automation without coding
4. **Build custom backend** - Only if you need very specific notifications

## Email Service Providers
- **SendGrid** - Reliable, good free tier
- **Mailgun** - Developer-friendly
- **Amazon SES** - Cost-effective for high volume
- **Gmail SMTP** - Simple setup for personal use
