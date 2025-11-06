#!/bin/bash

# 1) Grab the newest archive from today

BASE=~/Library/Developer/Xcode/Archives/2025-11-06

ARCH="$(ls -td "$BASE"/*.xcarchive "$BASE"/*/*.xcarchive 2>/dev/null | head -n1)"

echo "Using archive: $ARCH"

[ -d "$ARCH" ] || { echo "❌ No archive found in $BASE"; exit 1; }



# 2) Find the compiled .app inside the archive

APP_PATH="$(find "$ARCH" -maxdepth 3 -type d -name '*.app' | head -n1)"

echo "Found app: $APP_PATH"

[ -d "$APP_PATH" ] || { echo "❌ .app not found inside archive"; exit 1; }



# 3) Figure out the relative ApplicationPath and pull bundle values

APPREL="${APP_PATH#$ARCH/}"

BUNDLE_ID=$(/usr/libexec/PlistBuddy -c "Print :CFBundleIdentifier" "$APP_PATH/Info.plist")

SHORT_VER=$(/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" "$APP_PATH/Info.plist" 2>/dev/null || echo "1.0")

BUILD_VER=$(/usr/libexec/PlistBuddy -c "Print :CFBundleVersion" "$APP_PATH/Info.plist" 2>/dev/null || echo "$SHORT_VER")

# Extract TeamIdentifier from code signature
TEAM_ID=$(codesign -dvv "$APP_PATH" 2>&1 | grep -i "teamidentifier" | head -1 | sed 's/.*TeamIdentifier=\([^ ]*\).*/\1/' || echo "BSADE98887")



# 4) Ensure required keys in the archive's Info.plist

# Add ApplicationProperties (required for proper categorization)
/usr/libexec/PlistBuddy -c "Add :ApplicationProperties dict" "$ARCH/Info.plist" 2>/dev/null || true

# Add Platform key (required for iOS categorization)
/usr/libexec/PlistBuddy -c "Add :Platform string iOS" "$ARCH/Info.plist" 2>/dev/null || \
/usr/libexec/PlistBuddy -c "Set :Platform iOS" "$ARCH/Info.plist"

# Add ApplicationProperties keys
/usr/libexec/PlistBuddy -c "Add :ApplicationProperties:ApplicationPath string $APPREL" "$ARCH/Info.plist" 2>/dev/null || \
/usr/libexec/PlistBuddy -c "Set :ApplicationProperties:ApplicationPath $APPREL" "$ARCH/Info.plist"

/usr/libexec/PlistBuddy -c "Add :ApplicationProperties:CFBundleIdentifier string $BUNDLE_ID" "$ARCH/Info.plist" 2>/dev/null || \
/usr/libexec/PlistBuddy -c "Set :ApplicationProperties:CFBundleIdentifier $BUNDLE_ID" "$ARCH/Info.plist"

/usr/libexec/PlistBuddy -c "Add :ApplicationProperties:CFBundleShortVersionString string $SHORT_VER" "$ARCH/Info.plist" 2>/dev/null || \
/usr/libexec/PlistBuddy -c "Set :ApplicationProperties:CFBundleShortVersionString $SHORT_VER" "$ARCH/Info.plist"

/usr/libexec/PlistBuddy -c "Add :ApplicationProperties:CFBundleVersion string $BUILD_VER" "$ARCH/Info.plist" 2>/dev/null || \
/usr/libexec/PlistBuddy -c "Set :ApplicationProperties:CFBundleVersion $BUILD_VER" "$ARCH/Info.plist"

/usr/libexec/PlistBuddy -c "Add :ApplicationProperties:CFBundleSupportedPlatforms array" "$ARCH/Info.plist" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Add :ApplicationProperties:CFBundleSupportedPlatforms:0 string iPhoneOS" "$ARCH/Info.plist" 2>/dev/null || true

# Add TeamIdentifier (critical for Organizer grouping)
/usr/libexec/PlistBuddy -c "Add :ApplicationProperties:TeamIdentifier string $TEAM_ID" "$ARCH/Info.plist" 2>/dev/null || \
/usr/libexec/PlistBuddy -c "Set :ApplicationProperties:TeamIdentifier $TEAM_ID" "$ARCH/Info.plist"

# Ensure ArchiveVersion is set (should be 2 for modern archives)
/usr/libexec/PlistBuddy -c "Add :ArchiveVersion integer 2" "$ARCH/Info.plist" 2>/dev/null || \
/usr/libexec/PlistBuddy -c "Set :ArchiveVersion 2" "$ARCH/Info.plist"

# Ensure Name matches CFBundleDisplayName (critical for Organizer grouping)
# Must be "Animal Detective For Kids" to appear under correct category in Organizer
# Check app bundle first, but default to "Animal Detective For Kids"
APP_NAME=$(/usr/libexec/PlistBuddy -c "Print :CFBundleDisplayName" "$APP_PATH/Info.plist" 2>/dev/null || echo "")
if [ -z "$APP_NAME" ] || [ "$APP_NAME" = "Animal Detective" ]; then
    # Use the build setting value instead
    APP_NAME="Animal Detective For Kids"
fi
/usr/libexec/PlistBuddy -c "Add :Name string $APP_NAME" "$ARCH/Info.plist" 2>/dev/null || \
/usr/libexec/PlistBuddy -c "Set :Name $APP_NAME" "$ARCH/Info.plist"

# Ensure SchemeName is set
SCHEME_NAME="AnimalDetective"
/usr/libexec/PlistBuddy -c "Add :SchemeName string $SCHEME_NAME" "$ARCH/Info.plist" 2>/dev/null || \
/usr/libexec/PlistBuddy -c "Set :SchemeName $SCHEME_NAME" "$ARCH/Info.plist"



# 5) Remove Products/usr directory if it exists (causes "Other Items" issue)
if [ -d "$ARCH/Products/usr" ]; then
    echo "⚠️  Found Products/usr directory (causes 'Other Items' issue), removing..."
    rm -rf "$ARCH/Products/usr"
    echo "✅ Removed Products/usr directory"
fi

# 6) Sanity-check and open in Organizer

echo ""
echo "=== Archive Info.plist Summary ==="
plutil -p "$ARCH/Info.plist"

echo ""
echo "=== Products Structure ==="
find "$ARCH/Products" -type d -maxdepth 2 | sort

echo ""
echo "Opening archive in Organizer..."
open "$ARCH"

