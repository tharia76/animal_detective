# Android Release Keystore Information

## Keystore Details

**Location:** `android/app/release.keystore`

**Key Information:**
- **Key Alias:** `release-key`
- **Store Password:** `animaldetective2024`
- **Key Password:** `animaldetective2024`
- **Validity:** 10,000 days (~27 years)
- **Algorithm:** RSA 2048-bit

## Important Security Notes

⚠️ **CRITICAL:** Keep these credentials secure!

1. **Never commit** the keystore file or `keystore.properties` to version control
2. **Backup** the keystore file to a secure location (encrypted cloud storage, password manager, etc.)
3. **If you lose the keystore**, you will NOT be able to update your app on Google Play Store
4. The keystore file is already added to `.gitignore` to prevent accidental commits

## Usage

The build system is now configured to automatically use this keystore for release builds. When you run:

```bash
./gradlew bundlePlayRelease
```

The app bundle will be signed with the release keystore.

## Changing Passwords

If you need to change the passwords in the future, you'll need to:
1. Update `android/app/keystore.properties` with new passwords
2. Or regenerate the keystore (but this will break continuity with Google Play if already published)

## Backup Recommendation

Store a backup of `release.keystore` and the passwords in:
- Encrypted cloud storage (e.g., 1Password, LastPass, encrypted Google Drive)
- Secure physical storage (encrypted USB drive)
- Your team's secure password manager

**Remember:** Without this keystore, you cannot publish updates to your app!


