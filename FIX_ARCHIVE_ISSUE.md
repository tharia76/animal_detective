# Fix Archive Going to "Other Items"

## Problem
Archives are appearing in "Other Items" instead of under "Animal Detective" in Xcode Organizer.

## Solution Steps

### 1. Clean Xcode Derived Data and Archives
```bash
# Clean derived data
rm -rf ~/Library/Developer/Xcode/DerivedData/AnimalDetective-*

# Optional: Clean old archives (backup first if needed)
# rm -rf ~/Library/Developer/Xcode/Archives/$(date +%Y-%m-%d)
```

### 2. Verify Bundle Identifier
Make sure it's exactly: `com.metaltorchlabs.pixieplay`

### 3. Archive Correctly

**Important:** Always use the WORKSPACE file:
```bash
# Open in Xcode:
open ios/AnimalDetective.xcworkspace
```

**NOT:**
```bash
# ❌ Don't use this:
open ios/AnimalDetective.xcodeproj
```

### 4. Archive Steps in Xcode:
1. Open `ios/AnimalDetective.xcworkspace`
2. Select **"Any iOS Device"** (not a simulator)
3. Select **Product → Archive**
4. Wait for completion

### 5. Verify Archive
After archiving:
- Window → Organizer → Archives
- Should see: **"Animal Detective"** (not "Other Items")
- Archive name: `Animal Detective [Date]`
- Bundle ID: `com.metaltorchlabs.pixieplay`
- Version: `1.7`

### 6. If Still in "Other Items"

**Option A: Rebuild Archive**
```bash
# Clean everything
rm -rf ~/Library/Developer/Xcode/DerivedData/AnimalDetective-*

# Rebuild
cd ios
pod install
cd ..

# Archive again in Xcode
```

**Option B: Check Archive Contents**
```bash
# Inspect archive
xcodebuild -showBuildSettings \
  -workspace ios/AnimalDetective.xcworkspace \
  -scheme AnimalDetective \
  -configuration Release | grep PRODUCT_BUNDLE_IDENTIFIER
```

Should show: `PRODUCT_BUNDLE_IDENTIFIER = com.metaltorchlabs.pixieplay`

### 7. Manual Archive (Command Line)
```bash
xcodebuild archive \
  -workspace ios/AnimalDetective.xcworkspace \
  -scheme AnimalDetective \
  -configuration Release \
  -archivePath ~/Desktop/AnimalDetective.xcarchive \
  -destination "generic/platform=iOS" \
  CODE_SIGN_IDENTITY="iPhone Developer" \
  DEVELOPMENT_TEAM="BSADE98887"
```

Then open in Organizer:
- Window → Organizer → Archives
- Click "+" button
- Select `~/Desktop/AnimalDetective.xcarchive`

## Why This Happens

Xcode Organizer groups archives by:
1. Bundle Identifier (primary)
2. App Name
3. Team ID

If any of these don't match previous archives, it may show in "Other Items".

## Current Configuration
- Bundle ID: `com.metaltorchlabs.pixieplay` ✅
- Product Name: `AnimalDetective` ✅
- Display Name: `Animal Detective` ✅
- Version: `1.7` ✅
- Team: `BSADE98887` ✅
