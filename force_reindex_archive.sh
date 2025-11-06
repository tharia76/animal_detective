#!/bin/bash

# Force Xcode to re-index an archive by removing it from Organizer and re-adding it

ARCH="$(ls -td ~/Library/Developer/Xcode/Archives/2025-11-06/*.xcarchive 2>/dev/null | head -n1)"

if [ ! -d "$ARCH" ]; then
    echo "❌ Archive not found"
    exit 1
fi

echo "Archive: $ARCH"
echo ""
echo "To fix 'Other Items' issue:"
echo "1. Open Xcode Organizer (Window → Organizer)"
echo "2. Find this archive (it may be in 'Other Items')"
echo "3. Right-click on it and select 'Delete'"
echo "4. Close Organizer"
echo "5. Run this script again to re-add it"
echo ""
read -p "Have you deleted the archive from Organizer? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Re-adding archive to Organizer..."
    open "$ARCH"
    echo ""
    echo "✅ Archive should now appear under iOS section"
else
    echo "Please delete the archive from Organizer first, then run this script again"
fi

