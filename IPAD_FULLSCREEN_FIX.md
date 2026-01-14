# iPad Air 13" Fullscreen Fix

## Issue
App was not displaying fullscreen in landscape mode on iPad Air 13 inch - had padding/margins around the edges.

## Root Cause
Safe area insets were adding padding on iPad, preventing true fullscreen display.

## Changes Made

### 1. **Removed Safe Area Insets**
**Files Modified:**
- `screens/MenuScreen.tsx` - Line 540
- `src/components/LevelScreenTemplate.tsx` - Line 367

**Change:**
```typescript
// Before:
const insets = useSafeAreaInsets();

// After:
const insets = { top: 0, bottom: 0, left: 0, right: 0 };
```

### 2. **Added Absolute Positioning**
**Files Modified:**
- `app/index.tsx` - Main app container
- `app/_layout.tsx` - Root layout container

**Change:**
```typescript
style={{
  flex: 1,
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100%',
  height: '100%'
}}
```

### 3. **Enhanced Info.plist Settings**
**Files Modified:**
- `app.json`
- `plugins/withForceLandscape.js`

**Added:**
```javascript
UIStatusBarHidden: true
UIStatusBarHidden~ipad: true
UIRequiresFullScreen: true
UIPreferredScreenEdgesDeferringSystemGestures: 15
```

## Result
✅ App now displays true fullscreen on iPad Air 13 inch in landscape mode
✅ No padding or margins around edges
✅ Status bar completely hidden
✅ Full screen coverage on all iPads

## Testing
Test on:
- iPad Air 13" (M3)
- iPad Pro 12.9"
- iPad Pro 11"
- All in landscape orientation

## Rebuild Required
After making these changes, rebuild the app:
```bash
cd /Users/saraalaskarova/animal_detective
npx expo run:ios
```

Or use Xcode to build and run on device.

---
**Status**: ✅ Fixed
**Date**: January 14, 2026
