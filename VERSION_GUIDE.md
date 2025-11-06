# Where to Change App Version

## 📱 Version Locations

### 1. **app.json** (PRIMARY - Main Expo Config)
```json
{
  "version": "1.0.0",        // ← User-facing version (e.g., "1.0.0", "1.2.3")
  "ios": {
    "buildNumber": "1"       // ← iOS build number (increment for each build)
  }
}
```
**File:** `app.json`
- **Line 4:** `version` - Main app version
- **Line 19:** `buildNumber` - iOS build number (auto-increments if using EAS)

### 2. **package.json**
```json
{
  "version": "1.0.0"        // ← Should match app.json version
}
```
**File:** `package.json`
- **Line 4:** `version` - Should match `app.json` version

### 3. **iOS Info.plist** (iOS Native Config)
```xml
<key>CFBundleShortVersionString</key>
<string>1.4.0</string>       <!-- ← User-facing version (currently mismatched!) -->
<key>CFBundleVersion</key>
<string>1.4</string>          <!-- ← Build number -->
```
**File:** `ios/AnimalDetective/Info.plist`
- **Line 22:** `CFBundleShortVersionString` - User-facing version
- **Line 36:** `CFBundleVersion` - Build number

⚠️ **NOTE:** These are currently set to `1.4.0` and `1.4` but should match `app.json`!

### 4. **Android build.gradle**
```gradle
defaultConfig {
    versionCode 1            // ← Build number (integer, increment each build)
    versionName "1.0.0"      // ← User-facing version string
}
```
**File:** `android/app/build.gradle`
- **Line 95:** `versionCode` - Build number (integer)
- **Line 96:** `versionName` - Version string

## 🔄 Quick Update Guide

### For a New Version (e.g., 1.5.0):

1. **Update app.json:**
   ```json
   "version": "1.5.0",
   "ios": {
     "buildNumber": "1"  // Increment this for each App Store submission
   }
   ```

2. **Update package.json:**
   ```json
   "version": "1.5.0"
   ```

3. **Update iOS Info.plist:**
   ```xml
   <key>CFBundleShortVersionString</key>
   <string>1.5.0</string>
   <key>CFBundleVersion</key>
   <string>1</string>  <!-- Increment for each build -->
   ```

4. **Update Android build.gradle:**
   ```gradle
   versionCode 1        // Increment: 1 → 2 → 3 (must be integer)
   versionName "1.5.0"
   ```

## 📝 Important Notes

- **Version String** (e.g., "1.5.0"): User-facing, shown in App Store/Play Store
- **Build Number** (e.g., "1", "2", "3"): Internal, must increment for each submission
- **iOS Build Number**: Must increment for App Store submissions
- **Android versionCode**: Must increment for Play Store submissions (must be integer)

## 🚀 Using EAS Build (Recommended)

If using EAS Build with `"autoIncrement": true` in `eas.json`:
- EAS will automatically increment `buildNumber` and `versionCode`
- You only need to update the `version` string in `app.json`
- `package.json` version should match `app.json`

## ⚠️ Current Issue

Your `Info.plist` has version `1.4.0` but `app.json` has `1.0.0`. 
**Fix:** Update `Info.plist` to match `app.json` or vice versa.
