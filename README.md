# Kage: Shadowfall

Mobile-first, online hack-and-slash sandbox RPG. Four classes, skill trees, equipment, crafting, salvage, boss encounters and region-based difficulty.

Play: https://kage-shadowfall.ashd95.chatgpt.site

## World design (0.24.0)

The continent no longer floats on a void. Coasts fall to an animated sea with shore foam, lakes fill the reservoir valleys and every inland edge climbs into terraced, forested ridges with snow caps, lava runs and a smoking volcano. Each of the nine regions has its own palette, trees, light, fog, weather and ambient sound, plus a landmark: Seabell Lighthouse and harbour, Willowbend windmills over wheat, the Elder Blackpine and standing stones, Cloudwater Dam above drowned towers, the Sunstone Arch and sea stacks, the Singing Spires, Whitewind Shrine, the Obsidian Teeth and Ember Throne, and Brasswater's fallen colossus, great cog and ring of towers.

Entering a region shows a title card with its enemy level and danger. The first visit to each region and landmark grants exploration XP once per character, and boss fights open with a champion card. The camera rises over ridges, and the hero's silhouette shows through trees. Inside the game this is the same flat, server-replayed combat floor: only the landmark colliders and the discovery rewards touch the shared simulation.

## Android APK — bundled on-device edition (0.24.0)

Download **Kage-Shadowfall-device.apk** from **Releases**. The game, models, sounds and UI are packaged inside the APK. It runs fullscreen in Android’s embedded WebView: **no external browser, no sign-in and no internet required**. This uses the existing Three.js engine; it is not a Unity/native-engine rewrite.

Characters save on this device using IndexedDB. Gameplay has no server replay or network-save pauses. Menu → Characters lets you export a JSON backup or import one. Back pauses combat. Backgrounding requests a save; autosave also runs every four seconds. Clearing app data or uninstalling erases local characters, so export backups first.

### Bring your existing character

1. Open the online game once and load your character.
2. Go to Menu → Characters → Export Current Character.
3. Open this APK → Import Character and select the JSON file.

The imported copy preserves equipment, level, skills, materials and cosmetics; it begins a new world run. Cloud and device characters then progress independently. Local/imported characters cannot be uploaded to the authoritative online server.

Requires Android 8+ and a current Android System WebView with WebGL2. Test builds use `com.kage.shadowfall.device`, separate from the old browser launcher. Debug signing is for testing, not Play Store distribution. Android emulator checks cover launch without internet permission, character creation, combat input, save/reload and Back-to-pause. Physical-device performance still needs testing.

## Development

Node 22: `npm ci`, `npm run dev`, `npm test`, `npm run build`.

Android: JDK 17, Android SDK 35, Gradle 8.11.1. Run `npm run build:android`, then `gradle -p android :app:assembleDebug`.

- `src/`: game, renderer and UI
- `public/models/`: licensed character assets
- `worker/api.js`: authenticated save API and server-authoritative replay
- `android/`: Android embedded offline game host
- `.github/workflows/android.yml`: checks, APK build, checksum and prerelease download

The **online edition** web server requires the existing Sites authentication gateway and D1 binding. `npm run dev` alone does not provide cloud accounts. See ARCHITECTURE.md and THIRD_PARTY_ASSETS.md. Historical notes in CHANGELOG-legacy.md describe earlier versions and are not current feature documentation.

No account data, private signing keys or credentials are included.
