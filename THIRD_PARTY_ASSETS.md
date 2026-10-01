# Third-party assets

## KayKit characters — Kay Lousberg, CC0 1.0 Universal

- Player base: `Rogue_Hooded.glb` from KayKit Character Pack: Adventurers 1.0.
  Source: https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0
  Exact source path: `addons/kaykit_character_pack_adventures/Characters/gltf/Rogue_Hooded.glb`
- Enemy base: `Knight.glb` from KayKit Character Pack: Adventurers 1.0.
  Source: https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0
  Exact source path: `addons/kaykit_character_pack_adventures/Characters/gltf/Knight.glb`

The original Adventurers license text is included in `public/models/LICENSE-KAYKIT.txt`. The pack are distributed by KayKit under CC0. The game modifies materials, hides original accessories, attaches new weapon geometry and retains a subset of source animation clips. Runtime files are `shadow.glb` and `guard.glb`.

`scripts/prepare-models.py <raw-asset-folder>` performs pruning and buffer repacking. Raw input files should be named `shadow.glb` and `guard.glb`. Optimized runtime assets are included; running this preparation script is not required to build the game.
