# KAGE 0.10 — progression foundation

## Current boundary

Single-player expedition with browser prediction and server replay. This is not a shared-world or production MMO server. No trading, party system, realtime multiplayer, economy audit ledger or native account provider is implemented. Class skill trees are explicitly deferred. Each class exposes exactly four combat controls: Attack, Dodge and two class skills. Melee launch/slam variations share a skill slot; Heavy and Ultimate are rejected for character runs.

## Identity and persistence

The hosted private Site uses platform-managed ChatGPT sign-in. The Worker requires both trusted authenticated-user ID and email headers for every account API. Character ownership is checked in every query; POST requires same-origin JSON. Access sharing remains unchanged. There is no invented password store and no client-local character database. Names are validated and escaped for display.

D1 stores account-owned character profile and expedition snapshot in one row. Profiles have schema version, stable character ID and class ID, level, XP, currency, backpack, equipment and quest statuses. Item IDs include character/run/serial components. Schema changes use generated Drizzle migrations, not runtime table creation.

Each save batch includes a revision and an idempotency key. An atomic UPDATE with the previous revision rejects concurrent sessions. Duplicate batches return the committed state. Gameplay inputs and frame steps are replayed on the server using the shared combat simulation; the API does not accept gold, XP, rarity, item or kill awards. Movement magnitudes, step durations, command types and batch sizes are validated. Wall-clock credit limits fast-forwarding. The browser reconciles the returned authoritative snapshot and reapplies pending inputs. A save failure pauses play and retains pending commands in memory for retry; a deliberate reload loses unconfirmed actions.

Loot RNG is seeded per expedition and included in prediction state. This prevents accidental desynchronization but is predictable; it is NOT a production anti-cheat or cryptographically concealed loot system. Before trading/shared economies, move sensitive RNG and rewards to server-only event issuance, add ledger/audit events, abuse controls and dedicated session servers. Hidden-tab or closed-app time does not simulate combat.

## Loot and progression

`src/js/rpg.js` is the catalog: class IDs, six slots, rarity/stat curves, regional item levels, source-specific probabilities and quests. Chance of a gear roll and conditional rarity probabilities are separate. Common/uncommon/rare/epic are 4 current tiers. Chests and bosses guarantee multiple gear rolls. Levels vary by region rather than scaling every drop to the player. Weapon rolls prefer the active class; incompatible equipment can be salvaged, not equipped. Backpack capacity is 30; a full bag leaves items on the ground. Armor reduces damage, weapon power raises damage, armor affixes raise max health; repeated equip swaps do not heal.

Quests track relevant objectives even while locked, so doing an objective early does not block completion. Rewards are claimed once per character. Expeditions can be restarted for repeat combat/loot while keeping character progression. Uncollected drops are discarded only on a new expedition. Reopening the same run resumes its snapshot.

## Deployment and Android

Vite builds the mobile client to `dist/client`. `scripts/build-online.mjs` bundles a Worker with the shared simulation/API and embedded static bytes, then copies the hosting manifest and generated migrations. No external database credentials reach the client.

Android source now launches the online hosted game in a Custom Tab, allowing browser-managed sign-in and cookies. It is a prototype browser shell, not a native Android game client. It requires Internet. No APK has been compiled or device-tested here. A dedicated Android client needs its own supported auth integration and session transport before a store release.

## Validation

Combat, rigs and rendering integration checks remain. Progression checks cover deterministic loot, normalized probability tables, regional levels, equipment/stat effects, class/level restrictions, capacity, XP and one-time quest claims. SQLite-backed API checks cover missing auth, cross-origin writes, per-owner isolation, stale revisions, idempotent retries, persistence and rejected forged reward commands. These are automated code checks, not a live identity-provider or Android playtest.

## Gear and world interactions (0.7)

`loot` selects an existing ground-item ID within a bounded approach distance; the server moves the character and resolves pickup. Automatic currency/health collection happens inside the shared simulation. Direct inventory injection remains unsupported. `best` computes eligible improvements using a documented stat score and reuses normal equip validation. Neither operation trusts a client-provided reward or stat total.

`gear-visuals.js` is presentation-only: shared meshes and rarity/level styles power attachments, generated WebGL inventory icons and ground models. Preview rotation is local UI state. Audio/foliage randomness does not enter authoritative combat state. The world remains a single-player, placed-encounter zone rather than a dynamic multiplayer ecology.

## Story and settlement (0.8)

`src/js/story.js` owns immutable chapter definitions and proximity/guard/choice validation. `profile.story` is lazily initialized for old saves and stores stage, relief choice, relationship choice and journal. `story` is an input command, never a direct award. Server replay uses the same rules; no schema migration is needed for the JSON profile. Chapter completion persists across expeditions. Existing field contracts remain optional rewards.

`src/story-ui.js` renders conversations and journal; `progression.js` pauses gameplay for dialogue and queues story inputs through the existing idempotent save path. All world interactions require walking within range. The minimap follows the current chapter target.

`src/settlement.js` builds batched static architecture and lightweight moving residents. Building footprints use shared level obstacles. The hero GLB supplies covered, unarmed NPC silhouettes with distinct clothing colors. Static scene detail is shared across profile changes; story-driven village state updates each frame. This is a single-player chapter foundation, not networked NPC simulation or a full romance campaign.

## Windward Vale (0.9)

`WORLD_VERSION` lives in the shared level module. Combat restore replaces incompatible non-sandbox world state with a new run while retaining the profile, random seed/run identity and wall-clock/idempotency metadata. `storyState` archives the previous chapter once and initializes story version 2. No database schema change is needed.

`tickStory` owns the 24-second mill restart and its three scheduled waves (12 enemies total). Timing only advances while the living player remains within the mill area. Completion requires all three waves to be dispatched and defeated. The player can only finish the story step through the normal validated proximity command. These waves are the sole scripted reinforcements; ordinary groups do not respawn during a run.

`valley-world.js` replaces the old settlement and environment renderer, using a deterministic DataTexture, batched geometry, shared paint materials and lightweight animated landmarks. Collision and walkability remain 2D on the deck height; cliffs and lower water are scenery. CPU previews are useful for composition only and cannot validate the actual GPU shader, shadows, touch input or Android performance.

## Terrain and feedback (0.10)

`surface-fx.js` implements visual-only grass and snow. A two-meter spatial hash filters slash candidates; the event arc/radius determines which instanced blades shrink to stubble. Vertex shader wind and player bending do not mutate authoritative gameplay. Footprints use a fixed pool of 180 instances and expire after 55 simulation seconds. Renderer resets clear both. No terrain edits are stored in character saves yet.

`combat-hud.js` owns clamped HP ratios, screen-space bars, delayed damage and a three-label equipment budget. The actual 3D equipment remains visible and hit-testable independently of its label. `scenery.js` batches the aqueduct, cliffs, roots and ferns by material. Grass, footprints and static scenery avoid per-blade or per-prop draw calls.

The current world/story versions remain 9/2; this update preserves active expeditions. Legendary adds a fifth rarity to shared loot tables and equipment appearance. Server and client run the same five-rarity selection code.


## Passive atlas (0.11)
`src/js/skill-tree.js` owns versioned graph IDs, 144 allocatable nodes, 4 class origins, prerequisites, point budgets and aggregate stats. `build-effects.js` is pure attack/hit math; CombatSim caches bonuses when profile stats change and rebuilds them on restore. `tree` commands support allocate/refund/reset and reject unsafe edits in combat. Points derive from earned level/quests/story rather than a client-supplied balance. Refunds validate reachability. Basic-hit cooldown recovery uses a bounded, serialized attack/pulse token history to avoid duplicate procs across pellets and piercing targets. Active barriers, counters and cooldowns serialize with combat state. The DOM/SVG browser is presentation-only. Future graph migrations must preserve stable node IDs or explicitly refund invalidated builds. Future level-cap changes must change pointBudget and rebalance paths together.


## Outer atlas and evolution extension (0.12)
Graph extension retains all existing IDs; total is 400 passives plus four origins. Outer routes have no mandatory keystone tolls, and routeTo uses Dijkstra with already-owned nodes costing zero. Roadmaps are advisory: each normal allocation is validated again. Stat totals combine atlas and evolution nodes before global passive caps.
`evolutions.js` owns 8 specializations, 96 nodes, class/prerequisite validation and separate earned budgets. Profile.evolution is lazy version-1 data; no direct client stat updates are accepted. CombatSim.evolutionAction uses the same safety gate as atlas edits and clears transient build resources without healing. `evolution-combat.js` holds shared deterministic setup/resource/proc logic, while build-effects.js handles definition/hit modifiers. Only the active evolution's nodes aggregate. Root classId and equipment eligibility never change. Respecs cannot strand dependent nodes; switching refunds that evolution only.
The UI has atlas/evolution views, route highlighting and saved choice commands. The live HUD shows evolved names and resource meters; enemy bars indicate marks/exposure. Current UI/browser and Android QA limitations remain documented in README.
