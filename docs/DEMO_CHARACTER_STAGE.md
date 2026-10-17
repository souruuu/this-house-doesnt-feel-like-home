# Post-A+B — Gameplay Character Presentation

Owner FINAL authorization, 17 October 2026. Starting checkpoint `3bad3f725d2396d535ee829cc31a405983b5dbc2`. Player-facing title **หลังเคาน์เตอร์**; repository/story identity is unchanged. This is a scoped presentation experiment, not U-01/U-02/U-03 or Final Owner Visual Acceptance.

## Ownership and source

The unchanged [approved handoff](../sources/emergency-demo-2026-10-17/README.md) supplies participation evidence. [Cue map](../src/world/demoCharacterCues.ts) projects published scene/line IDs to semantic cutouts; it never parses dialogue text, changes Story, commits events or stores durable facts. React owns UI/focus; [Phaser stage](../src/world/DemoCharacterStage.ts) owns sprites/tweens through existing GameBridge presentation subscriptions. The bridge's added fields contain renderer data only, not narrative commands or saved state.

## Conservative participation windows

IDs below omit the `demo.` prefix. Windows include only the exact approved variants enumerated in the cue map; unknown IDs fail closed. A pending choice retains its last readable line. Narrator lines inside a window retain the same cutout; a speaker change alone never swaps it.

| Scene | Cutout | First explicit participation | First hidden line / evidence |
|---|---|---|---|
| SC-D1-01 | manao | D101-L002 — items placed at counter | D101-L010 — leaves shop |
| SC-D1-02 | som | D102-L002 — candy at counter | D102-L009 — leaves with candy |
| SC-D1-03 | nut | D103-L002 — food at counter | D103-L007 — leaves shop |
| SC-D2-01 | manao | D201-L001 — at stationery shelf | D201-L010 — leaves |
| SC-D2-02 | som | D202-L001 — items at counter | D202-L010 — leaves |
| SC-D2-03 | nut | D203-L001 — returns to food shelf | D203-L008 — after his farewell, shop quiets |
| SC-D3-01 | som | D301-L001 — enters snack shelf area | D301-L012 — after farewell, chair remains |
| SC-D3-02 | nut | D302-L001 — returns to bench | D302-L010 — explicitly leaves |
| SC-D3-03 | kant | D303-L001 — explicitly enters shop | D303-L012 — leaves |

No scene here requires two simultaneous characters. The renderer supports named `left`/`right` slots without inventing a two-character scene. D103-L008–L011 describes a boy outside under the awning: no interior placement/entrance is inferred. This unmapped exterior placement is deliberately omitted, not claimed verified. The same cutout is used only at his explicit interior Day 3 appearance.

The `kant` semantic asset ID is private renderer metadata under an aria-hidden WorldHost, never a player name/tooltip/ARIA announcement. Existing approved anonymous dialogue labels remain unchanged before D303-L010A, including that disclosure line's speaker label. Sprite placement is symbolic VN presentation; no new expression, chair pose, physical walk, event or shelf interaction is invented.

## Assets and alignment

[Provenance catalog](../src/assets/demo-character-provenance.json) records all 19 input PNG checksums, sizes, alpha and the exact source-to-runtime mapping. Four cutouts are copied byte-for-byte to `public/assets/demo/characters`; the other 15 inspected exports are not shipped. Owner asserts artist provenance; authorship/license/editable-source chain is not independently certified by technical PNG checks.

Supplied stage canvases are 1447×2048 versus originals 2480×3508. Nominal scale is approximately 0.58347 horizontally / 0.58381 vertically; full-composite comparison is close but does not establish a whole-counter occlusion mask. `กล่อง.PNG` is only a box prop. Runtime keeps all three original composites intact and adds a non-occluded transparent cutout in front. No supplied opaque composite, tint, AI scene or fabricated mask replaces the originals. This is the explicitly approved fallback, not a claim of verified behind-counter layering. Som's behind-shelf/bench directions remain in the canonical text; a static bust does not simulate those movements or occlusion.

## Temporary composition and motion

Contain scale, bottom-left pivot inside portrait, candidate canvas height 30% desktop / 28% compact. Both character and readable UI remain inside shared logical bounds. A right portrait choice column reserves the left cutout area; long choices scroll and keep keyboard/touch targets. Original portrait aspect ratio limits horizontal room compared with a wide VN stage. These coordinates are reviewable candidates, not final artist coordinates.

Enter: 260 ms fade + 18 logical pixel slide. Exit: 220 ms fade only. Switch: old out → 80 ms gap → new in. There is no unapproved physical slide-out. Duplicate projections do not restart an animation. Context/size changes invalidate prior tween/timer generation; pause settles the latest coherent view and cancels pending work, resume replays nothing. Reduced motion is immediate. Teardown cancels timers/tweens and disposes both renderer slots. No animation callback can advance the controller or mutate the ledger.

## Review and limits

Verification must include real Phaser/browser output, light/dark alpha edges, rapid Continue/context changes, pause/hidden/rotate/remount, all four cutouts, narrator/choice retention, both story branches and knowledge guards, prior A+B regression tests and new Info/Notice/focus bounds. Evidence lives in the external review bundle. Automated tests are not Final Owner Visual Acceptance. Firefox/A-01, ManagedGame and pre-READY risks remain open; M0/M1 NOT DONE. No Checkpoint C, release packaging, cover, production Save/Load/audio or D1 persistence is included.
