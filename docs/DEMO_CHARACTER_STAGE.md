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

## Assets and alignment (UI Phase 2, Owner decisions 18 October 2026)

D-1 replaces the portrait composites with one 16:9 composition: `public/assets/demo/stage/counter-day.png` is a byte-identical copy of the artist's `new_shop/counter_day.png` (1920×1080, SHA-256 `f0a7d91e3baf0669786fc72dec888dbdf5525c990a866ca4d219e19c7f2aa252`) and fills the logical stage, so 16:9 windows have no side bars. The stage manifest lives in [demoStage.ts](../src/world/demoStage.ts) (`demoStageArt`). Owner confirmed no further art: evening and night are production tints of the same file — warm dusk RGB(240,138,80) α0.75 and blue night RGB(44,60,140) α0.80 (hues from the artist's flat overlay layers, deepened after Owner review so they read clearly against day), `multiply` (measured closer to the artist's own evening/night composites than `normal`) — applied to the background and table only, never the characters, and adjustable in the manifest. The old portrait composites `shop-*.png` are no longer loaded by the stage. The 1447×2048 layer set is not composited onto the 16:9 art (different composition). Four cutouts are still copied byte-for-byte; the provenance catalog is unchanged.

Occlusion (D-1/U-03): the untouched counter image is drawn a second time, clipped to `DEMO_TABLE_POLYGON`, above the character layer (`DEMO_OCCLUSION = 'mask'`; `'none'` stays as a review switch). Measured on the image: table back edge y≈665 from x≈485 to x≈1497, front lip y≈1042 (x≈283 / x≈1682). Items rising above the edge: green bottle (x690–711, top y≈650), red bottle (x662–678, top ≈655), bunny pop (x853–897, ears to y≈632) — all inside the left slot and traced into the polygon; cat ears (x≈935–995, top ≈652), leek stalks (x≈1175–1240, top ≈648) and leafy greens (x≈1240–1340, top ≈665) are outside the used slot and not traced (they would sit behind a right-slot character). No pixels are painted or edited.

## Composition and motion (candidates, U-01/U-03 open)

Characters are anchored to the artwork, not to the dialogue box: height 470 (≈43.5% of 1080), baseline y 800 behind the table edge, slot centres x 700 (left) / 1220 (right); the same at every viewport. Only the left slot is used by the approved cue map. The dialogue box (x 210–1710, y 836–1048) and the right choice column (x 1010–1710, y 400–720; collapsed one-line box at y≈900 while choosing) never cover the visible upper body. Touch-compact layout (pointer coarse, scale < 0.6) uses a taller full-width box (mock 7); only its hidden part behind the table overlaps the sprite. There is no on-stage speaker chip; speaker plates live on the dialogue box only and the player (`เจ้าของร้าน`) never has a portrait.

Enter: 260 ms fade + 18 logical pixel slide. Exit: 220 ms fade only. Switch: old out → 80 ms gap → new in. Duplicate projections do not restart an animation. Context/size changes invalidate prior tween/timer generation; pause settles the latest coherent view and cancels pending work, resume replays nothing. Reduced motion is immediate. Teardown cancels timers/tweens and disposes both renderer slots. No animation callback can advance the controller or mutate the ledger.

## Review and limits

Verification must include real Phaser/browser output, light/dark alpha edges, rapid Continue/context changes, pause/hidden/rotate/remount, all four cutouts, narrator/choice retention, both story branches and knowledge guards, prior A+B regression tests and new Info/Notice/focus bounds. Evidence lives in the external review bundle. Automated tests are not Final Owner Visual Acceptance. Firefox/A-01, ManagedGame and pre-READY risks remain open; M0/M1 NOT DONE. No Checkpoint C, release packaging, cover, production Save/Load/audio or D1 persistence is included.
