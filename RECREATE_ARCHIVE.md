# Steps to Create a New Archive (Recommended)

## 1. Update Pods with Fixed Settings
```bash
cd ios
pod install
cd ..
```

## 2. Archive in Xcode
1. Open `ios/AnimalDetective.xcworkspace` in Xcode
2. Select "Any iOS Device" (not simulator)
3. Product → Archive
4. Wait for completion

## 3. Verify New Archive
The new archive should automatically appear under iOS (not "Other Items") because:
- ✅ Podfile now sets SKIP_INSTALL=YES for glog/boost/nanopb
- ✅ No Products/usr directory will be created
- ✅ Info.plist will be minimal (Xcode auto-detects ApplicationProperties)

## 4. If You Want to Fix Existing Archive
Run the fix script:
```bash
./fix_archive.sh
```

Then manually delete and re-add it in Organizer.

