# Update 0.16.4 — Quiet World Labels

Replaced boxed NPC, object and hunt labels with small icons on 40px touch targets. All three kinds share a maximum of three visible markers; overlapping markers are suppressed. Only the closest interactable within 230 world units shows a plain name, and current quest targets use a gold exclamation icon. NPC and objective buttons retain their existing actions and full accessible names. The quest tracker is now a two-line text hint; tapping it opens the full journal.

# Update 0.16.3 — Remove Occlusion Workarounds and Misplaced Hills

Removed both versions of the character visibility shader entirely. Trees and buildings use ordinary depth occlusion again, with no holes, wedges, dithering or automatic transparency around the hero.

The pale domes were decorative hills distributed around the original map. Their footprints overlapped the expanded Chapter II routes. Ray checks at Glassroot (65.8, -18.2) and the road at (64, 0) found their surfaces 4.54 and 5.28 metres above the floor. Removed that obsolete backdrop ring. The remaining distant ridges sit beyond the northern edge of the full expanded map; regression checks enforce that separation and confirm clear ground at the affected locations.

Fixed the actual portrait HUD rule that hid Pause despite its new label. Pause now appears below the minimap in portrait, and alongside the menu controls in landscape. Separated the overlapping zone and XP text.

Automated scene raycasts, camera/rig checks, gameplay regressions and the production build were verified. Device screenshots and on-device playtesting are still unavailable here; no visual playtest is claimed.

# Update 0.16.2 — Refined Character Visibility

Replaced the round world-space cutaway with a narrow, tapered screen-space sightline above the character. It affects only foreground scenery in front of the character and above the ground; the ground, mist and scenery behind the character are unchanged. Fine-grain edges keep the fade from looking like a geometric hole. Tests cover screen depth, ground exclusion, stable world-anchored fade patterns and grass shader composition. Visual Android playtesting still needs to confirm the presentation on device.

# Update 0.16.1 — Android Back & Pause

The in-game header now shows a full “Ⅱ PAUSE” button; it changes to “RESUME” while paused. Android/browser Back opens the pause screen during active play and keeps the game page in history, preventing an accidental exit. Verified with automated navigation-guard tests.

# Update 0.16.0 — A New View of Windward Vale

The default Adventure camera is lower, follows with frame-rate-independent damping and movement lookahead, and pulls back slightly during nearby combat. Pause settings offer Adventure, Tactical and Close presets, 45-degree view rotation and 80–120% viewing distance. Portrait framing is wider; movement remains relative to the selected camera. Portal travel snaps the camera rather than sweeping across the world.

A narrow, tapered camera sightline fades only foreground canopy above and in front of the hero. It uses screen depth, with stable fine-grain edges, so no circular ground hole is cut and scenery behind the character remains intact. Animated character culling is disabled to avoid stale skinned bounds hiding the hero. Ground polygons and crossing roads have explicit depth ordering; duplicate hunt floors are removed. Waterfalls no longer write transparent depth. Shadow projection snaps to texels, and labels behind the camera are hidden.

The landscape gains denser interactive grass, branched trees with layered leaf sprays, instanced flowers and ferns, distant mountain ridges, a gradient cloud sky and small bird silhouettes. Sunlight, fill lighting, fog, water and material colours have been retuned. Performance graphics still disables shadows and bloom. Camera preferences are saved on the device. Existing progression, combat, ground loot, chests and saves are preserved.

Validation: existing combat, rig, API, progression, story, equipment, skill-tree, chapter, salvage and hunt suites pass. New tests cover portrait/landscape framing, all camera modes and rotations, nearby combat coverage, camera damping, teleport snapping, behind-camera labels, shader-hook composition and ground depth ordering. Headless scene assembly produced approximately 222,000 base triangles and 11,241 decorative instances; this is not a GPU performance measurement. Android visual playtesting and GPU shader compilation could not be performed because the required browser preview capability is unavailable. Those checks remain necessary before claiming device-specific flicker and performance are fully resolved.

# Update 0.15.0 — The Hunter’s Road

Speak to Nadia at Saffron after Chapter I to accept Crystal Ravine, Cinder Quarry or The Broken Convoy. Each hunt follows a new connected side route: clear two authored encounters, interact with the web anchors, cooling channel or travellers, then defeat the boss and escorts. Standard contracts require level 6 (Cinder: 8). Veteran requires level 12 and a Standard clear; it adds escorts, health and damage. The world map marks all three routes. No menu teleport is used.

There are twelve class-specific signature weapons, three per class. Their effects include perfect-dodge rushing cuts, aerial damage, guard-break exploitation, real ricochets, additional skill pulses, target-switching rhythm, larger slams, piercing rounds, finishing damage, skill-cooldown recovery, stationary strikes and dodge-follow-up spreads. All modify the existing four controls. Hunt completion rolls a class-specific signature separately at 30% Standard / 45% Veteran, drops it physically, and always awards 2 / 3 matching fragments plus enhancement materials. Six fragments craft the selected class signature. Reward chests are retained until opened. Completion rewards are idempotent.

Mobile explanations use native modal dialogs opened by tapping an item information button. Item cards show the effect, trigger, trade-off, comparison, source and odds. Power, Armor, Health, base score, fragments, difficulty, filters, tempering and loadouts have tap help. A pickup receipt shows the item’s actual effect and opens its equipment inspection. Label filters hide text only, never ground equipment. Equip Best preserves equipped hunt signature weapons.

Collected gear permanently unlocks its appearance, including gear auto-salvaged on pickup. Four earned outfit sets, five dye choices and individual equipment appearances preview on the rotating character. Cosmetics do not affect stats. Tempering offers a guaranteed choice of one property for 60 Iron fragments and 8 Tempered alloy. Replacing the property costs the same and locks the item. Three saved loadouts restore equipment, the passive tree and evolution atomically, without healing; saving locks equipped items. Nadia’s harmless practice target records actual hit damage without awarding XP or loot.

Automated checks cover hunt gates, stage transitions, reward idempotence, crafting, cosmetic ownership, appearance preservation, atomic preset rejection, command replay, every signature, real off-axis ricochet, harmless training, loot filtering, explanatory UI and traversable routes. Existing combat/progression/API tests also pass. Android device and screenshot-based WebGL visual testing remain outstanding because the required preview browser capability is unavailable here. Encounter length and device frame rate have not been measured. No music, paid purchases, religious imagery or additional ability buttons were added.

# Update 0.14.2 — Salvage Interaction Fix

Reworked salvage selection around visible, native checkboxes and an explicit selected count. Stale IDs are discarded, duplicate selections are normalized, protected equipment cannot be selected, and the material preview and action button are derived from the same validated selection. The action now reports failures inside the menu and salvage remains available after defeat. Regression coverage checks these cases with legacy numeric equipment IDs.

# Update 0.14 — Field Workshop & World Passages

Open Character → Salvage / Auto to preview and dismantle unwanted items. Iron fragments, tempered alloy and prismatic cores stack outside the backpack. Auto-dismantle starts disabled; enable Common, Uncommon and/or Rare filters. Matching ground gear becomes materials when tapped, including with a full bag. Equipped, locked, named and enhanced items are protected. Filtered selection preserves the best-score upgrade for each compatible slot; manually selected unprotected items can still be dismantled. Epic and Legendary gear require manual selection.

Select an item in Character to lock it or enhance it up to +5. Enhancement costs and next stats are shown before spending; success is guaranteed, requires safety, and never heals the player. Materials, filters, locks and enhancements persist through the authoritative command replay/save system.

After Lina’s final Chapter One conversation, walk through the stone passage just southwest of her at Cloudwater to reach Saffron. The return passage is north of the Saffron arrival. Gates appear on the local minimap and full world map; entry works by walking through or the context interaction. No menu travel is needed. Walking the connected east road also starts Chapter Two. Passages require safety, preserve health, and have a re-entry cooldown.

Combat now uses a shared per-contact timeline for damage and animation, repeated animation cycles for multi-hit attacks, alternating twin-blade skill clips, shorter transition blending, smoother moving-attack legs, limited wind-up target correction, committed attacks and brief near-ready skill/dodge buffering. Recovery restores movement with all build modifiers. Multi-hit skills use lighter hit-stop; greatsword hits retain more weight.

Automated coverage includes salvage atomicity/duplicate rejection, protected gear, full-bag pickup, material accounting, enhancement caps, save/replay, chapter gates/return/road transition, reachable entry and exit locations, contact timing and all four classes. Browser/WebGL visual and Android-device playtesting remain outstanding. No music or additional combat buttons were added.

Research consulted: Blizzard’s Itemization in Diablo Immortal (salvage-to-upgrade loop), Wyatt Cheng’s GDC session overview Through the Grinder (responsive controls), Epic’s Motion Warping documentation (bounded pre-contact alignment), and Three.js AnimationAction documentation (action timing and blending). These informed implementation decisions; this prototype does not use Unreal or claim equivalent production quality.

# Update 0.13 — The Broken Caravan

Chapter Two opens from Menu → World map after finishing Windward Vale. Six authored areas add a detailed caravan settlement, terraces, crystal ravine, snow pass, volcanic basin and fortress. Nine story stages include a rescue-order choice and a modest, family-involved relationship conclusion.

The mobile HUD now includes a portrait, compact quest tracker, local minimap, four combat controls and a full-screen system menu. Character, equipment, disciplines, journal, travel and field guide are functional. Dungeon and cash-shop pages are explicitly planned; there is no matchmaking, purchasing or multiplayer implementation.

Crystal spiders lay slowing webs; horned ridge stalkers commit to charging attacks; lava golems leave heated ground. Shield guards protect archers and interruptible scouts call bounded reinforcements. Marshal Hadrik, the Glassweaver Matriarch and Furnace Colossus have distinct encounters. Existing and new areas contain 98 authored enemies, 11 chests and five bosses before reinforcements.

Six boss signature items use an independent 25% named-item roll, split equally between each boss’s two items. The finale also awards the Wayfarer Mantle. Eight evolution training challenges award the seventh signature, mentor gloves. Named gear modifies existing combat rules without adding controls. New content migrates into existing runs without resetting inventory, equipment, currency or discipline choices. Performance mode reduces render cost; no music is added.

Validation covers both story routes, reachable objectives, deterministic replay, migration, hazards, AI, shields, named loot and training rewards. Android device/WebGL visual validation remains outstanding; the deliverable is the hosted prototype and Android source, not a compiled APK.

# Update 0.12 — Outer Atlas & Class Evolutions

Open **SKILLS** for the expanded **400-passive atlas / 32 keystones**, or select **CLASS EVOLUTION**. There are 24 new outer clusters, cross-sector routes, and distant specializations in combo pressure, opening strikes, airborne control, slams, moving attacks, barriers, blocks, exposure, stationary fire, close-range fire, volley shots, alternation and low-life recovery. Area reach, stagger duration and barrier strength now support new build interactions. Route previews show a lowest-point-cost path and let you learn its next connector, subject to the normal gates.

The original 144 node IDs and existing allocations are preserved. Atlas budget remains 48 maximum this chapter (level cap 20); maximum two keystones, one per discipline. Outer nodes require levels 4/8/12. More choices do not award unearned points.

| Base class | Evolution | Signature play pattern |
|---|---|---|
| Vanguard | Steel Duelist | Build marks with basic hits, consume them with a skill |
| Vanguard | Windblade | Longer skill reach and aerial pursuit |
| Skirmisher | Trail Strider | Dodge to build Momentum, spend it on a burst skill |
| Skirmisher | Blade Dancer | Faster broad cuts, with circular or multihit branches |
| Breaker | Iron Bulwark | Blocks grant barriers; specialize in protected retaliation |
| Breaker | Siegebreaker | Expose enemies, then crush them; optional double slams |
| Gunslinger | Sharpshooter | Stand still to build Focus for piercing precision fire |
| Gunslinger | Outrider | Mobile attacks and spread-fire dodge follow-ups |

Evolution unlocks at **level 6 after defeating the Toll Captain**. The existing captain quest progress is the durable prerequisite; old characters qualify retroactively. Each evolution has a 12-node tree: four core nodes leading to two four-node branches. There are **96 evolution nodes across eight evolutions**. Its signature activates when chosen. Earn 2 separate evolution points at levels 6, 10, 15, 20, to a maximum of 8. Completing an entire branch therefore requires the full budget; splitting points creates alternative builds. Nodes require their explicit predecessor. Free switching/refunds require safety, do not heal, and preserve the passive atlas. Exactly four combat inputs and the equipped base weapon class remain.

Trade-off precedence is explicit: Resolute always forbids criticals; Groundbreaker always forbids launches; Volley overrides all piercing bonuses; exposure is one non-stacking 20% damage vulnerability. Barriers refresh to the larger amount and longer duration rather than stacking. Focus and Momentum are captured when an attack begins. Marks, exposure, Focus, Momentum, barriers and proc tokens serialize with the run; server replay validates evolution commands. No schema migration is needed.

Automated checks cover all eight evolution command/replay flows, node gates/refunds/switching, outer routes using real allocation rules, marks/crit, Momentum, Focus/pierce, exposure, block barriers, spin/launch/aftershock/volley interactions, and previous combat/progression/story behavior. Production build is checked. Android touch, visual performance and long-term build balance still need hands-on testing. This expands the prototype's choices; it does not claim PoE 2's endgame scale.

# Update 0.11 — The Discipline Atlas

Open **SKILLS** from the HUD or character menus. An original 144-passive atlas connects eight disciplines to four class origins, with 16 trade-off keystones. Search effects, jump to a discipline, pan/pinch the graph, inspect and allocate nodes. Keystones support aerial control, grounded slams, dodge follow-ups, mobile attacks, blocks/counters, long-range pistols, scattershot, piercing fire, combo recovery, skill specialization and low-life barriers. Exactly four combat inputs remain per class.

Three points at level 1, two per level to the existing cap of 20, one per claimed field contract and one at story stages 3, 6 and 9: **48 maximum points this chapter**. Earned budgets are retroactive. Notables unlock at level 4, keystones at level 8; maximum two keystones and one per discipline. Every allocation needs a connected path. Refunds are free outside combat and cannot strand nodes or heal you. Weapon-specific keystones are gated. The graph is larger than the point budget so a character must specialize.

Allocation commands are replayed and validated by the shared server simulation; profile JSON saves the build. No database migration. Regression tests cover reachability, spending, refund connectivity, gates, replay and concrete combat effects. WebGL/touch testing on Android remains outstanding; this is a first balance pass, not a claim of Path of Exile-scale endgame depth.

# KAGE — Windward Vale 0.10

Android-first, overhead 3D hack-and-slash combat slice with a faceless hooded protagonist. The browser build is the current playable client; the Android source launches the online version. This is a prototype, not a finished RPG or a compiled APK.

## Changes in 0.10 — impact and terrain

- Ground equipment uses larger, centered 3D item meshes with rarity-colored highlights. Breastplates, gloves and boots have clearer shaped silhouettes. Nearby names have no boxes; only the nearest three gear labels appear, with selected-item priority. Coins and medicine flasks have no floating labels and still auto-collect. Tap meshes or names to collect equipment.
- Red Legendary rarity: 1% per Commander gear roll, 0.3% per Captain roll, 0.1% per chest roll, zero on ordinary mobs. These are conditional per-roll rarity chances, taken from Epic's prior share. All five rarities are shown in the loot guide; existing items are unchanged.
- Dense instanced grass bends around the player and is cut by the actual directional/radial slash events. Cut patches remain during the loaded expedition and reset on character/run reload. This is cosmetic local state, not MMO-persisted terrain.
- Cloudwater Reservoir is snowy: snowy paths/canopies, alternating footprints with a 55-second lifetime, powder kicked up by movement and snow crunch SFX. No movement speed penalty. New fluted aqueduct columns and snowy cliff shelves; mossy steps, fern beds and roots on the cedar route.
- Enemy HP uses fixed-pixel screen-space bars with exact immediate HP fill, a delayed damage segment, selected target numbers, stronger boss bars, overlapping-bar offsets and immediate death cleanup.
- Earlier basic combo chaining, skills buffered out of dodges, eased anticipation/recovery poses, body follow-through, faster slash arcs, short contact flashes and impact rings. Four class abilities remain unchanged.

Automated checks cover grass cut direction/reset, snow track spacing/expiry, loot label limits, health chip timing/death removal, Legendary rolls/meshes and dodge skill queues, in addition to existing combat/progression/story checks. A CPU geometry preview checks scenery composition. Live WebGL/shader and Android visual/audio/performance testing remains outstanding.

## Changes in 0.9 — world replacement

Windward Vale replaces the Iron Pass map and story. All seven zones are newly authored: Seabell Harbor, Marigold Downs, Apricot Orchards, Blue Cedar Hollow, Willowbend Mill, the Wind Stairs and Cloudwater Reservoir. Winding routes and a western loop connect the coastal land masses. Floor, roads, collision footprints and encounter placements share the authored map.

The new chapter, **When the River Stopped**, follows Farid and the irrigation engineer Lina as the player recovers seed, chooses an orchard or cedar repair route, defends a restarting mill against three scripted waves, breaks the Toll Captain's blockade, and defeats Marshal Rook to open the public spillway. An optional family-involved relationship introduction ends the chapter. No music or supernatural/religious fantasy content.

The original procedural scenery uses mottled paint textures, layered foliage, tiled-roof houses with planted windows, harbor market stalls, sailboats, crop terraces, a windmill, animated waterwheel and restored spillway. The orchard choice opens visible irrigation channels. Static geometry is batched by pigment; distant clouds remain outside the fighting area.

Reference research: Studio Ghibli's official *Arrietty* and *Only Yesterday* image galleries informed the countryside direction. No film frames are shipped as game assets. https://www.ghibli.jp/works/karigurashi/ and https://www.ghibli.jp/works/omoide/

Old runs migrate once to world version 9: levels, XP, gold, equipped gear and inventory stay; the previous story is archived in the profile, and the replacement chapter starts at Seabell. Old world encounter state and ground drops are replaced. The nine new encounters are server validated and saved through the existing replay system.

Validation: combat, rigs, accounts, loot, both chapter routes, all objective/chest reachability, route geometry, old-save migration and scripted waves pass automated checks. A CPU geometry preview was reviewed for composition; it is not a browser screenshot. Live WebGL and Android touch/audio/performance playtesting remains outstanding.

## Changes in 0.8

- Playable first story chapter: 11 saved encounters with Captain Hamid, Mariam, Yusuf, a dispatch rider, physical evidence and a conspiracy reveal. Walk near characters and tap their name or TALK; use the journal for the current objective.
- A relief-route choice changes the journal, dialogue, and settlement residents/supply crates. Optional respectful family-involved courtship or friendship with Mariam; this introduces the relationship, not a completed romance arc.
- New southern Lantern Quarter: six roofed buildings, smith, market stalls, infirmary, well, laundry, gardens, signs and moving residents. Warm daylight and richer ground colors. No music; quiet workshop impacts join the natural ambience.
- Existing characters keep their gear, XP and field contracts. Their story begins at Hamid; travel south to the new settlement. New expeditions begin in the settlement.
- Story rewards are validated in the shared server simulation by stage, proximity, enemy guards and permitted choice. Existing JSON saves gain a story field without a destructive database migration.
- Geometry is batched by material. NPC rigs and labels update near the player. Automated reachability, both branches, replay, reward-once and old-save checks pass. Browser preview was unavailable; Android visual/audio/performance verification remains outstanding.

## Changes in 0.7

Ground equipment is selected by tapping its model or label. The character approaches drops within 800 units and picks them up within reach. Joystick movement or Dodge cancels approach. Gold collects automatically within 125 units; health supplies collect when health is missing. Full backpacks leave equipment on the ground. The separate loot pickup button is removed; the context button opens chests only.

Inventory is rebuilt around a rotatable lit character preview with six surrounding equipment slots, an icon grid, category filters and comparisons. Equip Best uses Power × 4 + Armor × 2 + Health × 0.25, only equips eligible improvements and retains equal-score equipment. It runs through server commands.

All current slots and four weapon classes have shared procedural 3D gear geometry used in character attachments, inventory icons and world drops. Three item-level silhouette tiers and four rarity finishes provide consistent appearances. Head, chest, gloves, legs and boots attach to animated bones; the face stays black and featureless. These are stylized game meshes, not bespoke high-detail production costumes.

Active enemy health bars are larger and high contrast. Raiders gain a telegraphed directional rush; brutes use sweeps; archers keep longer range; nearby packs hear alerts. Rushes commit direction instead of homing. Wind-driven vegetation, ground haze and drifting debris accompany non-musical wind, foliage rustle, timber creaks and footsteps. No music, chanting or voices.

New tests cover auto pickup, specific targeted pickup, approach/range rules, Equip Best eligibility, rush direction and every current gear slot/class/rarity/tier geometry combination. Browser/WebGL visual inspection and Android playtesting remain outstanding in this environment.

## Changes in 0.6

Account sign-in, four character slots/classes, level/XP progression, 30-slot inventory, six equipment slots, class/level restrictions, gear comparison, salvage and four first-zone quests. Real gear drops use regional item levels 1–7 and source-specific Common/Uncommon/Rare/Epic tables, visible in the Loot Guide. Bosses and chests guarantee multiple rolls. The server replays inputs and owns progression; revisioned saves survive sessions. Enemies pursue faster, recover sooner, flank, avoid nearby obstacles and lead ranged attacks; brutes brace against repeated grounded hits.

The current account provider is ChatGPT sign-in on the existing private Site, not a standalone public MMO registration service. See ARCHITECTURE.md. No new sharing permissions were enabled.

## Combat and map

Four classes each expose Attack, Dodge and two class skills. Melee launch/slam variations share a skill slot. The Discipline Atlas specializes these four inputs through connected passives. Attack transitions blend bone poses and trim neutral returns; brief cutting windows line up with damage and stereo swooshes. Blade trails follow hand-mounted weapons. Hits add armor cuts, flying fragments, recoil, knockback, brief hit pauses and thrown death reactions. Holding Attack preserves queued Heavy and skills.

Iron Pass is an authored fort: approach, outer yard, optional supply depot, garrison, gated ravine bridge and commander's keep. There are 53 placed enemies in ten groups, six guarded chests and two bosses. No timed or random enemy spawning. The Gate Captain unlocks the bridge. The Iron Commander has cleave, sweep and charge attacks, a second phase and a breakable guard. Clear his remaining guards and open the final chest to complete the mission. Chests open over 0.8 seconds and throw bouncing physical drops. Tap equipment to collect it; coins and health supplies collect when walking nearby. Rewards are not granted on kill or opening. The minimap shows enemies, unopened chests and the current objective.

The setting uses human armored raiders and physical weapons. Religious symbols, undead enemies, rituals, portals, spells and soul pickups were removed. Audio consists of combat effects, with no music.

## Changes in 0.5

Camera pulled back by roughly 55%. Faster base movement (400–480 units/s) and out-of-combat sprint, movement-facing during recovery, camera-relative joystick vectors and lower-body running layered into moving attacks. Patrols move before aggro; archers retreat at close range. The map uses authored irregular polygons, an optional western quarry loop, dirt/moss patches, rock boundaries, trees and broken paving instead of square room tiles. The rendered environment remains stylized procedural geometry, not the high-detail art of the reference games.

Iron Viper is a fourth weapon class with a pistol: traveling bullets, swept hit detection, a piercing third shot, five-pellet Heavy, Piercing Round, Strafe Barrage and Full Magazine. Ranged attacks preserve mobility and use firing poses rather than melee launchers. The arsenal exposes its separate instructions. Drops have ground labels and must be collected. No inventory equipment screen or saved loot yet.

Reference direction: the user-supplied outdoor ruins image and the Path of Exile 2 Ranger showcase / official class overview. No assets were copied from those games.

## Playing

Use the left thumb joystick. Tap Attack for individual cuts or hold to chain.

- Use the launch skill to launch ordinary enemies.
- Attack an airborne target to juggle; the same launch skill becomes a slam.
- Dash cancels attacks; Dash → Attack gives a pursuit strike.
- Two class skills have cooldowns. XP fills the progression bar.
- Approach a chest after defeating its assigned guards and tap Open; tap equipment on the ground; walk near coins and health to collect them.

Landscape recommended. Pause contains weapon selection, sound and feedback controls. Development keyboard: WASD/arrows, J attack, Space/Shift dash, Q/E skills, F chest, Escape pause.

## Development

Node 20+: `npm ci`, `npm run dev`, `npm test`, `npm run build`.

`src/js/level.js` owns the map and encounter data; `weapons.js` owns move data; `combat.js` owns simulation/AI; `render3d.js` owns Three.js visuals; `main.js` owns input, HUD and audio. Runtime assets are bundled; no game service is required after loading. Account-owned characters and expeditions persist in D1. See ARCHITECTURE.md for authentication, server replay, save recovery and multiplayer boundaries.

## Android source

The 0.6 account-backed version is online. The Android project is now a Custom Tabs browser shell for the hosted game, using the browser's sign-in session. Build with Android Studio/JDK 17/SDK 35 and Gradle 8.11.1. No APK has been compiled or tested here. The older offline WebView wrapper cannot access account saves and is no longer the active host.

## Validation and limits

34 simulation checks cover weapon chains, buffering, dash, cooldowns, directional hits, launch/juggle/slam, fixed encounters, guarded single-use chest rewards, gate collision, boss guard/phase and mission completion. A separate rig check loads both GLBs, exercises every configured attack animation, including the pistol class and all five enemy variants, and constructs the fort/chest/gate geometry. Production build verified. Interactive WebGL and Android performance, touch latency, audio balance and haptics still need device playtesting; these automated checks do not establish that combat feels good on a phone.

The characters and environment are stylized low-poly assets. No shared world, party system, trading yet. Camera-adjacent enemies are rendered to limit active rigs; phone frame rate has not been measured.

## Assets

See `THIRD_PARTY_ASSETS.md`. Model atlas textures and unused animations were removed, materials restyled and buffers repacked. Each rig retains 29 animation clips. Three.js and Vite retain upstream licenses.
