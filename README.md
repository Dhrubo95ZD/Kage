# Kage: Shadowfall

Mobile-first, online hack-and-slash sandbox RPG. Four classes, skill trees, equipment, crafting, salvage, boss encounters and region-based difficulty.

Play: https://kage-shadowfall.ashd95.chatgpt.site

## Android APK

Download the APK from this repository’s **Releases**, or **Actions → Android APK → Kage-Android-APK**. The workflow builds an installable, debug-signed test APK after each push to `main`.

**This APK is an online Custom Tabs launcher, not an offline or native-engine port.** It opens the hosted game using your browser’s secure sign-in session, preserving existing cloud characters. Android 8 or later, internet, an up-to-date browser and access to the hosted game are required. The hosted game currently retains its existing private access policy; a public source repository does not grant account access.

Install the APK and allow installation from your download app if Android asks. Test builds use `com.kage.shadowfall.test`. Debug signing is for testing, not Play Store distribution; future builds may require uninstalling an older test build if their signing keys differ. Cloud characters are stored by the online game, not this launcher.

An APK does not by itself fix browser performance. 0.22.2 reduces distant enemy simulation and HUD updates; 0.22.1 reduced scenery/loot rendering and split save catch-up work. Android performance is not yet verified on device.

## Development

Node 22: `npm ci`, `npm run dev`, `npm test`, `npm run build`.

Android: JDK 17, Android SDK 35, Gradle 8.11.1. Run `gradle -p android :app:assembleDebug`.

- `src/`: game, renderer and UI
- `public/models/`: licensed character assets
- `worker/api.js`: authenticated save API and server-authoritative replay
- `android/`: Android online launcher
- `.github/workflows/android.yml`: checks, APK build, checksum and prerelease download

The web server requires the existing Sites authentication gateway and D1 binding. `npm run dev` alone does not provide cloud accounts. See ARCHITECTURE.md and THIRD_PARTY_ASSETS.md. Historical notes in CHANGELOG-legacy.md describe earlier versions and are not current feature documentation.

No account data, private signing keys or credentials are included.
