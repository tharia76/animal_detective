# How to Archive Animal Detective Correctly

## ✅ Correct Method (Xcode)

1. **Open the WORKSPACE** (not the project):
   ```
   Open: ios/AnimalDetective.xcworkspace
   ```
   ⚠️ **DO NOT** open `AnimalDetective.xcodeproj` directly

2. **Select the correct destination:**
   - In Xcode, select **"Any iOS Device"** (not a simulator)
   - This is in the scheme selector next to the play/stop buttons

3. **Archive:**
   - Go to **Product → Archive**
   - Wait for the build to complete

4. **Verify the archive:**
   - Window → Organizer → Archives
   - You should see: **AnimalDetective.xcarchive**
   - Inside should be: **AnimalDetective.app**
   - Bundle ID: **com.metaltorchlabs.pixieplay**

## 🔧 Alternative: Command Line

```bash
cd /Users/saraalaskarova/animal_detective

# Archive using workspace
xcodebuild archive \
  -workspace ios/AnimalDetective.xcworkspace \
  -scheme AnimalDetective \
  -configuration Release \
  -archivePath ~/Desktop/AnimalDetective.xcarchive \
  -destination "generic/platform=iOS" \
  CODE_SIGN_IDENTITY="iPhone Developer" \
  DEVELOPMENT_TEAM="BSADE98887"
```

## 📦 Using EAS Build (Recommended for Expo)

```bash
eas build --platform ios --profile production
```

This creates a proper archive ready for App Store submission.

## 🐛 Troubleshooting

If archive is still wrong:
1. Clean build folder: **Product → Clean Build Folder** (Shift+Cmd+K)
2. Delete DerivedData: `rm -rf ~/Library/Developer/Xcode/DerivedData/AnimalDetective-*`
3. Rebuild: **Product → Archive**

## 📍 Expected Archive Location

Default location:
```
~/Library/Developer/Xcode/Archives/[DATE]/AnimalDetective.xcarchive
```

Inside the archive:
```
Products/Applications/AnimalDetective.app
```

Bundle ID should be: `com.metaltorchlabs.pixieplay`
Product Name: `AnimalDetective`
Display Name: `Animal Detective`
