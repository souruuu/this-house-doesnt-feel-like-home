# UI/UX และ Asset Contract

Source of Truth ของ game viewport, UI, controls, accessibility และ handoff ระหว่าง artist/dev Ownership ระหว่าง React/Phaser อยู่ใน [ARCHITECTURE](../ARCHITECTURE.md); story/ของที่แสดงได้ต้องอ้าง [Narrative Map](../sources/narrative_map_7_day_Updates.md) และ state/permission ตาม [GAME_STATE](GAME_STATE.md)

## Viewport / layout

- Logical resolution **1920×1080 (16:9)** เป็น coordinate system ร่วมของ artist/dev ไม่ใช่ข้อบังคับให้ทุกอุปกรณ์ render จำนวน pixels เท่านี้
- Fixed centered game viewport ใน browser ปรับ scale แบบคงอัตราส่วนให้ fit พื้นที่ที่มี เหลือ margin/letterbox เมื่อ aspect ratio ต่าง ไม่ crop ส่วนสำคัญหรือยืดรูป
- Phaser world กับ React DOM overlay ใช้ bounds/scale/coordinate transform เดียวกัน Hit areas ต้องตรงกับภาพหลัง resize/fullscreen
- Desktop/laptop first; mobile landscape ใช้ UI/composition เดียวกัน ไม่สร้าง story/UI แนวตั้งอีกชุด
- Mobile portrait แสดง rotate prompt ภาษาไทยก่อนให้เล่น; ไม่ให้ Auto/puzzle ดำเนินต่อจนเสียจังหวะระหว่าง prompt ใช้ pause behavior เดียวกัน
- มี fullscreen control ใน shell; ถ้า browser/iframe ไม่ให้เข้า fullscreen ต้องยังเล่นแบบ fit viewport ได้ ไม่รับรอง OS orientation lock
- Dialogue/choices/menus อยู่ React; VN sprite/hotspot/puzzle/world layers อยู่ Phaser

ตำแหน่ง dialogue/choices, safe areas, stage anchors และขนาดอุปกรณ์ขั้นต่ำยังไม่ล็อก ดู U-01 ตัวเลขตัวอย่างจากแชทเดิมไม่ใช่ final artist coordinates

## Emergency Demo UI exception — 17 October 2026

Owner อนุมัติ functional baseline สำหรับ [Emergency Day 1–3](../sources/emergency-demo-2026-10-17/README.md): logical 1920×1080, composite portrait artwork แบบ contain พร้อม black sidebars; React Main Menu/Start, Thai dialogue/speaker/Continue, vertical choices บนพื้นที่ portrait, pause menu และ Demo End/return อยู่เหนือ Phaser world/character placeholders

ใช้ภาพ composite เช้า/เย็น/กลางคืนจากโฟลเดอร์ทีมที่ Owner ระบุ โดย semantic manifest เก็บ source URL ไม่อ้างว่า layering/export/anchors หรือ U-01/U-02/U-03 finalized ตัวละครใช้ labeled placeholders; ชื่อที่ยังไม่รู้ต้องเป็น label anonymous ตามบท รวมกันต์ก่อน D303-L010A และในบรรทัดบอกชื่อเอง

Owner UI Correction ล่าสุด supersede ข้อเสนอ Instant Text default เดิม: shared reading foundation ของ Checkpoint A ใช้ Typewriter default ON, Text Speed 25–60 grapheme clusters/second (default 40) ผ่าน `Intl.Segmenter` ภาษาไทย Options มี Instant Text และ reduced motion ที่มีผลจริง; OS reduced motion ยังมีผลแม้ผู้เล่นไม่เลือกเพิ่ม และ fallback Instant เมื่อ Segmenter ไม่มี First Continue ระหว่าง reveal แสดงให้ครบก่อน; Continue ถัดไปจึงเดินเรื่อง ไม่เพิ่ม event/เปลี่ยนบท

Checkpoint A ใช้ชื่อเกมซ้ายบนและ vertical menu ครบ Start/Load/Options/Gallery/About พร้อม contained shop artwork ด้านขวาและ original dark shop-window/warm amber treatment ใช้ English labels เฉพาะ controls ที่ Owner ระบุเป็น temporary demo exception ไม่เปลี่ยน Thai-only contract ของ Full Game v1 Owner conditionally approved ภาพ A และอนุมัติ B: Gameplay ใช้ centered portrait/black sidebars, speaker header (omit เมื่อ speaker:none), body-only scroll และ footer Skip/Auto/▶ ตาม supplementary Gameplay Visual Blueprint ไม่ใช้ mockup PNG/sample text/font เป็น production assets ไม่สร้างตัวละครใหม่; optional menu character slot ยังไม่มี artwork ไม่ request path ปลอม

Options เป็น screen จริงจาก Main Menu/Pause มี Reading/Display/Audio และ return-origin/focus guards Load เปิดคำอธิบายว่ายังโหลดไม่ได้, Gallery เปิด empty state ไม่เป็น CG/Endings collection, About ใช้ข้อมูลโปรเจกต์จริง; Music/Sound sliders disabled ชัดเจนว่าไม่มีระบบเสียง Auto-Forward Time เป็นค่า app-session ที่เชื่อม UI Auto timer ใน B: เริ่ม delay หลัง full reveal, ตรวจ live session/revision ก่อน Controller Continue และ consume generation ก่อน dispatch; manual input/pause/menu/focus/visibility/transition/choice/end ยกเลิกทันที ไม่ replay events หรือเลือก choices แทน D1 profile persistence ยังไม่อนุมัติ: ไม่เพิ่ม production storage หรือใช้ fixture profile แทน Skip ใน footer แสดง disabled พร้อม unavailable reason ตาม Owner ไม่แสร้งใช้ backlog แทน global read IDs ไม่มี Production Save/Load/Resume/audio assets หรือฟอนต์ที่คัดลอกจาก reference ต้องแจ้ง refresh/close สูญเสียความคืบหน้า

Stage/layout/theme/type/touch targets และ settings เป็นค่าทดลอง; A ผ่าน Conditional Visual Direction ส่วน B ยังรอ Owner Visual/UX Review และต้องหยุดก่อน C ไม่ปิด U-01/U-02/U-03 ไม่ยกเลิก full-game contracts ด้านล่าง และไม่ถือว่า Final Visual Acceptance ผ่านเพราะ automated tests

Checkpoint B responsive proposal ใช้ shared `demoGameplayLayout` ใน React/Phaser ภาพ 2480×3508 contain กลาง stage 1920×1080 เช่นเดิม Desktop dialogue ใกล้ 67% กว้าง/24% สูง; compact landscape ขยายเกือบเต็ม stage โดยรักษา physical text/targets ไม่ scale ตัวอักษรจนเล็ก Choices อยู่ใน portrait corridor เหนือ dialogue แสดงตามจำนวน/ข้อความจริงและ scroll เมื่อจำเป็น Amber outline + marker/focus/pressed ไม่หน่วง choice transaction Phaser แสดง neutral name cue จาก Controller speaker เท่านั้น; narrator-only ไม่มี cue และละ cue ที่ short mobile breakpoint เพื่อรักษาพื้นที่อ่าน ไม่สร้าง character identity/asset ใหม่

Day indicator/card ใช้ day จาก approved scene context เท่านั้น ไม่อนุมาน time-of-day ใหม่จากแสง/ชื่อไฟล์ One card ต่อ day boundary, 300ms fade และ UI guard รวม 650ms; reduced-motion เป็น static โดยไม่เพิ่ม Continue/Ink step ขณะ guard หยุด Auto/reveal/input ชั่วคราว ไม่มี story-time/domain change และไม่ replay first line

### Dusty Midnight Blue A+B Correction — latest scoped Owner decision

Temporary palette: navy #101D2D / panel #1C2B33 / cream #F4F0E7 / secondary #AAB9C3 / sage #86A5A8 / focus-active amber #D7B27C. This supersedes the previous warm-green experimental treatment only; original morning/evening/night composites retain their pixels/contain transform. The five AI references supply UI mood/composition, never production scene assets or story text. Existing system Thai font fallback is retained; no unverified font files embedded. U-01/U-02/U-03 remain OPEN.

Options shows exactly one Reading/Display/Audio pane. Load/Gallery/audio remain truthful unavailable/empty UI. Safe dialogue-region click finishes reveal then advances once; drag, selection, scroll, interactive children, stale gesture, pending choice and modal states cannot advance. Footer is text-led Skip/Auto/▶; Skip only announces a temporary unavailable notice, never invokes narrative skip. Auto intent survives Choice while execution waits for manual selection; after a safe new full reveal the configured delay starts fresh. Pause/menu/blur/hidden/rotate/end/error/new session cancels timers and requires explicit Auto reactivation. No catch-up, profile/read-ID persistence or domain contract changes. Brief single-choice confirmation is UI-only and input-locked before the public Controller request is revalidated.

Day HUD and full-frame typographic intertitle use only approved runtime day labels; no generated subtitle, card or story-time change. Existing 650ms guard/300ms fade remains presentation-only with static reduced-motion fallback. This decision supersedes earlier B wording that Auto turns OFF at Choice, framed day card, permanently disabled Skip explanation and the provisional layout; it does not change full-game controls/DoD/release gates below. Final Owner Visual Acceptance is pending; C/merge/deploy remain unauthorized.

### UI Phase 1 — fonts, Main Menu, Pause/Options (Owner decisions 18 October 2026)

Owner Decisions Addendum D-2/D-2b/D-3/D-4/D-7 supersede, for these surfaces only, the earlier "system Thai font fallback, no embedded fonts" and "no Main Menu characters/cover" wording above and in the OPEN QUESTION note below. Gameplay stage, dialogue, choices and Auto remain Phase 2; U-01/U-02/U-03 stay OPEN and this is not Final Owner Visual Acceptance.

- **Fonts:** self-hosted OFL-1.1 woff2 (`thai` + `latin` subsets) in `public/assets/fonts/` with provenance/checksums in its README; `@font-face` with `font-display: swap` and per-subset `unicode-range` in `src/ui/tokens.css`; no CDN. Tokens `--font-title` (Chonburi, game title), `--font-display` (Mitr 400/600/700, labels/buttons), `--font-body` (Bai Jamjuree 400/500/700 + real italic 400/500). `--vn-font` now starts with `--font-body`, then the previous system fallback.
- **Palette tokens:** `--paper #fbf6ea`, `--paper-2 #f3ead7`, `--wood #6b4430`, `--ink-brown #4a2c1d`, `--bevel-fill #cdd9e6`, `--bevel-edge #4a6468`, `--amber #f0b04a`, `--amber-edge #8a5a1c`, `--danger #b5533c`, `--sky #7cc4e8`. Dusty Midnight Blue is unchanged for the gameplay dialogue box.
- **Main Menu cover:** `public/assets/demo/menu/menu-cover-day.png` is a byte-identical copy of the artist's `new_shop/front_day.png` (SHA-256 `70821a58f484f640a5ebde90e0c7355b104210c52df77ceb765cd7ecd5783a18`), drawn at 1920×1080 logical as an opaque CSS layer over the Phaser menu portrait: `--paper` ground + `background-blend-mode: multiply` (pixels untouched). The same layer sits behind the in-session Notice so its Pause/Options do not reveal the old portrait. `createWorld.ts`/`demoStage.ts` are not changed.
- **Menu layout (logical px, candidates):** title `หลังเคาน์เตอร์` Chonburi 112px at ≈(96, 84), stroke `#fff6e2` + sky shadow, right edge ≤ 880. Five CSS bevel buttons ≈420×88 at x=150, y=330+116·i labelled เริ่มเกม / โหลดเกม (ยังไม่พร้อม) / ตั้งค่า / แกลเลอรี / เกี่ยวกับ; `data-menu-entry` keeps Start/Load/Options/Gallery/About and the previous behaviour (Load still opens its honest unavailable panel and keeps `aria-describedby`). Focus-visible = amber fill + `--amber-edge` outline. Compact (scale < 0.6) grows height/font via `--demo-control-size`/`--vn-menu-font` so targets stay ≥ 44 css px.
- **Menu characters:** only `som` (≈x1010, h≈420) and `manao` (≈x1330, h≈400) original cutouts, cropped by the bottom stage edge, soft drop shadow, inside an `aria-hidden` non-interactive layer, `alt=""`, no names or captions. `nut`/`kant` never appear on the menu.
- **Info panels / Notice:** paper sign (`--paper-2`, 8px `--wood` border, 6px `#d7b27c` ring, hard shadow) inside the left paper zone (right edge ≤ 900 logical), internal scroll with `overscroll-behavior: contain`. Back to Main keeps no underline/hover glow and a visible focus-visible outline. Options keeps its wide layout exception, same paper language, selected category shown by `aria-current` + amber fill/edge.
- **Pause:** `src/ui/demo/PauseMenu.tsx` (presentation only; DemoApp keeps pause/Auto/focus logic). Left sign ≈ left 150 / top 110 / width 640 over `rgb(14 20 30 / 62%)` + 3px blur; heading พักเกม Mitr 700 84px; buttons ≥ 96 logical (≥ 44 css px): เล่นต่อ (amber), ตั้งค่า (bevel → existing Options), กลับหน้าหลัก (outlined `--danger`) + progress-loss note. Instant Text lives only in Options (same `preferences.instant`). The Pause note still states the current behaviour that Auto stops on pause; Phase 2 changes Auto (D-6) and that text.
- Reduced motion: no transitions/animation on these surfaces and no press offset.

## Language และ UI surfaces

**Thai only** สำหรับข้อความที่ผู้เล่นเห็น ชื่อ code/asset IDs คงภาษาอังกฤษได้ ไม่เพิ่ม localization ภาษาอังกฤษใน v1

| Surface | Contract |
|---|---|
| Notice | ก่อนเริ่ม; ตามขอบเขตเนื้อหาที่ map เก็บไว้ มีทางพัก/ตั้งค่า/ข้าม presentation หนักโดยไม่เปลี่ยน relationship |
| Main Menu | เล่นต่อ / เริ่มเกมใหม่ / โหลดเกม / อัลบั้ม / ตั้งค่า / เกี่ยวกับเกม |
| Dialogue | ชื่อผู้พูด ข้อความ choices และ VN controls อ่านง่าย ไม่เปิด hidden relationship values |
| Gameplay menu / pause | เข้าถึงเล่นต่อ บันทึก โหลด ประวัติข้อความ อัลบั้ม ตั้งค่า และกลับหน้าหลัก |
| Load / save | Autosave + 3 manual slots; save เฉพาะ Safe Checkpoint ไม่ให้ save ระหว่าง active puzzle; แสดงข้อมูล snapshot จริงและแยกช่องว่าง/สถานะอ่านไม่ได้ |
| Album | สมุดที่รู้จักเด็ก ไม่มี secrets/completion/ending trophies; data rules เป็นของ [GAME_STATE](GAME_STATE.md) |
| Settings | Text Speed, Instant Text, reduced motion และ volume/mute controls; ค่าตั้งต้นอยู่ U-03 |
| About / optional information | Credits/ข้อมูลเกม; หน้าข้อมูลช่วยเหลือหลังจบเปิดอ่านเองได้ตาม map และต้องตรวจข้อมูลก่อนเผยแพร่ |

เมื่อไม่มี valid autosave ให้แสดงเล่นต่อเป็น unavailable หรือซ่อนตาม layout ที่ยืนยัน; ห้ามโหลดจาก manual slot แทนโดยไม่บอก การเริ่มเกมใหม่/overwrite/delete save ต้องสื่อผลและรับ intention ชัดเจน **G-03 CLOSED:** New Game/เปลี่ยน slot คง global settings/read Line IDs แต่ Album, Memories/permissions และ backlog ต้องเป็นของ playthrough/run/save ปัจจุบัน ไม่รวมข้อมูลจาก run เก่า

ไม่มี Endings Gallery หรือป้าย Good/Bad/True Ending เกี่ยวกับเกมไม่ต้องรวมหน้าสรุปบทเรียนยาวอัตโนมัติ

## VN controls

| Control | Behavior |
|---|---|
| History / Backlog | Transcript ของ run/save/session ปัจจุบัน มี stable Line ID; ไม่รวมทุก playthrough ไม่ undo/rewind choices และไม่รัน event ซ้ำ |
| Auto | เดินข้อความตาม timing ที่ตั้งได้/ยืนยัน; หยุดที่ choice, pause หรือ world interaction |
| Skip read text only | ใช้ **global/profile read Line IDs** ข้าม New Game/slots; หยุดที่ unread text และ choice ไม่เลือกแทน ไม่ใช้ตำแหน่งบรรทัดหรือข้อความไทยเป็น identity |
| Text Speed | ปรับการเปิดเผยตัวอักษรให้ผู้เล่นอ่านสะดวก |
| Instant Text | แสดงข้อความทันทีโดยคงจังหวะ choice/event ที่ถูกต้อง |
| Save / Load | เข้าถึงใน gameplay menu/UI เฉพาะเมื่อ safe ตาม G-02 ที่ CLOSED แล้ว; pause จาก active puzzle ยัง save ไม่ได้ |

Auto/Skip/Instant Text ต้องไม่ยิงต่อสองครั้งจากทั้ง keyboard และ pointer การข้ามข้อความหรือ effect ไม่ข้าม domain event ที่ควรเกิด แต่ไม่สร้าง choice/Promise breach/relationship change ขึ้นเอง

หลัง load **Auto/Skip off** Dialogue กลับ line เดิมแสดงข้อความเต็มทันที Choice กลับ choice เดิมที่ยังไม่เลือก ไม่ replay one-shot events/SFX; restore BGM/ambient แบบ semantic ได้โดยไม่คืน playback timestamp รายละเอียด atomic load/checkpoint อยู่ใน [GAME_STATE](GAME_STATE.md)

**Skip presentation** สำหรับ motion/ช่วงนำเสนอหนักเป็นคนละงานกับ Skip read text only: ให้ทางอ่านเนื้อหาคงที่หรือผ่าน effect แล้วพบ choices ที่จำเป็น ไม่มี relationship penalty ไม่เลือกคำตอบในเรื่องแทนผู้เล่น

## Input

รองรับ **mouse + touch + keyboard**; ไม่มี gamepad ใน scope

| Input | Minimum behavior ที่ล็อก |
|---|---|
| Mouse/touch | Continue, เลือก choices, menu/settings, hotspots และ puzzle; ไม่ต้องใช้ hover เพื่ออ่าน/เลือกข้อมูลจำเป็น |
| Enter / Space | Continue ใน narrative context |
| Arrow keys | เลื่อน focus/selection ของ choices |
| Esc | Pause / gameplay menu |

เมื่อ focus อยู่บนปุ่ม/slider/dialog ต้องไม่กระตุ้น world หรือ continue ที่อยู่ข้างหลัง ป้องกัน key repeat/ghost click และ focus trap ที่ออกไม่ได้ Focus ต้องเห็นชัด มี labels ภาษาไทยกับ icon controls

Puzzle มีทางเลือก normal interaction, Hint, บาสช่วย, Click-to-place หรือพักตาม map ไม่มี fail state/timer เมื่อมีข้อความใหม่ระหว่างซ่อม หยุดการเคลื่อนไหวชิ้นส่วนเพื่ออ่านก่อน ไม่บังคับอ่านพร้อมลาก

Minimum keyboard ด้าน narrative ล็อกแล้ว แต่ exact keyboard navigation ของ hotspot/puzzle ยังต้องยืนยัน U-01 ก่อนอ้างว่า keyboard-only จบเกมได้

## Accessibility basics

- Reduced motion ลด/ปิด motion, camera effects และ scrollytelling ที่ไม่จำเป็น มี static alternative สำหรับหน้าทบทวนท้ายเกมตาม map
- Pause หยุด narrative auto/skip, world interaction และ presentation ที่ต้องประสานกัน เมื่อกลับเข้าเกมต้องไม่ได้รับ input/event ที่ค้างจนเดินเรื่องต่อเอง
- Text Speed/Instant Text/Backlog ช่วยผู้เล่นอ่านตามจังหวะตนเอง; Thai font/line breaks ต้องไม่ตัดสระ/วรรณยุกต์หรือทำข้อความล้น
- มี volume/mute controls ผ่าน AudioManager; เสียงไม่ควรเป็นทางเดียวที่บอกข้อมูลจำเป็น และมีทางอ่าน/เห็น cue ที่จำเป็นต่อการเล่น
- Choice ไม่ใช้สีเพียงอย่างเดียวเพื่อระบุ focus/selection และไม่นำสีแสดงคะแนนถูก/ผิดของ relationship
- Touch targets/contrast/readability ต้องตรวจใน viewport ที่ทีมยืนยัน ตัวเลขขนาด/contrast target ยังไม่ล็อกในแหล่งข้อมูล ไม่อ้างระดับ WCAG certification
- Notice, pause, reduced motion และ skip presentation ไม่เปลี่ยน relationship หรือถือเป็นผิดสัญญา

## Visual Novel sprite direction

ใช้ **2D hand-drawn sprites**, transparent background, named fixed stage positions และ composition ร่วมของ 1920×1080 VN sprite อยู่ Phaser ไม่ใส่ sprite ใน DOM เพื่อแก้ตำแหน่งคนละระบบ

Stage positions ต้องอ้าง stage manifest เดียวกัน บทใช้ named positions เช่น left/center/right เป็นตัวอย่างชื่อที่ต้องยืนยัน; artist/dev ต้องตกลง anchor, scale และ occlusion ก่อน final art ไม่ใช้ coordinates ฝังใน Ink

Expression/pose catalog ต้องมาจาก scene cards ที่ยืนยัน ไม่เพิ่มท่าทางที่ตีความความเงียบ/รอยยิ้มเป็นคะแนนความสัมพันธ์ ขนาด canvas/anchor ของ expression ในตัวละครเดียวกันต้องสอดคล้องเพื่อไม่ให้ภาพกระโดดเมื่อเปลี่ยนหน้า

## Layers และ composition

| Layer | หน้าที่และ handoff |
|---|---|
| Background | ภาพร้านฐานและการเปลี่ยนแสง/บรรยากาศตามฉาก; ใช้ canvas logical 1920×1080 เป็น reference |
| World props / character stage | สิ่งของและ sprites ที่ world จัดตำแหน่ง; อ้าง ownership/permission ของของจริง |
| Counter / foreground | แยกชิ้นที่ต้องบังส่วนของ sprite/props และระบุ mask/occlusion order ต่อ composition |
| World FX | Rain/light/transition ตามฉากและ reduced motion; ไม่บัง choice input |
| React overlay | Dialogue/choices/menu/focus; scale และ bounds ร่วมกับ world |

ลำดับเฉพาะของ props/character/counter/foreground ต้องอยู่ใน scene composition ที่ artist/dev ยืนยัน ไม่ flatten counter ที่ต้องใช้บัง sprite ติดไปกับ background จนปรับ stage ไม่ได้ ไม่มี image layer ใหม่ที่เปิดเผยของที่ยังไม่ได้รับอนุญาต

## Placeholder-first but style-ready

Placeholder ไม่ขัดกับการเตรียมโครง UI ให้เปลี่ยน style ได้ ใช้ reusable React components, styling แยกจาก game/narrative logic และ centralized design tokens/CSS variables หรือ abstraction เทียบเท่า ไม่ hardcode one-off styles จนต้องแก้ logic เมื่อเปลี่ยน visual identity Final art/style ต้องแทนผ่าน semantic/stable IDs และ asset manifest โดยไม่เปลี่ยน authoritative GameState หรือ Ink logic

| Phase ที่ล็อก | ความพร้อมของ UI/art |
|---|---|
| M0–M1 | Placeholder visuals; โครง UI style-ready ไม่ต้องทำ final identity และห้าม invent final visual direction ใน M0 |
| M2 | Functional game layout; layout/stage/component structure เริ่มใกล้ production ยังใช้ placeholder art ได้ |
| M3 | Basic design system/reusable UI foundation ยังไม่ต้อง final visual polish |
| M4–M5 | Content + artist asset integration ตาม contract ที่ยืนยัน |
| M6 | Final visual polish/readability/responsiveness/animation/final assets |

หลักนี้ไม่ปิด U-01–U-03 หรือให้อำนาจเลือก final font/palette/stage coordinates แทนทีม รอบนี้ไม่ redesign UI และไม่สร้าง frontend/custom skill

### Handoff workflow

1. สร้าง placeholder โดยอ้าง stable asset ID และ stage/layer contract ที่ยืนยัน มี label ชัดว่า placeholder ไม่เป็นข้อเท็จจริงหรือ final design ของตัวละคร
2. ตรวจ flow, scale, touch/focus, occlusion และ sprite swap ก่อนผลิต final assets
3. ส่ง artist ชุด logical viewport/stage/layer guides พร้อมรายการ scenes/expressions ที่ต้องใช้และคำถามค้าง
4. แทน asset ผ่าน manifest โดยรักษา semantic ID/anchor ไม่แก้บทเพื่อชดเชย canvas ที่ crop ต่างกัน
5. ตรวจในเกมจริงบน desktop/mobile landscape รวม reduced motion และ final build paths

## Naming / formats — contract ที่ต้องปิด U-02

ใช้ manifest mapping ระหว่าง semantic IDs กับ export paths เพื่อ validate references แบบ case-sensitive Path ต้องปลอดภัยสำหรับ static host และไม่พึ่ง path absolute ของเครื่อง artist

รูปแบบชื่อ **ตัวอย่างเพื่อยืนยัน**: `char_<character-id>_<pose-id>_<expression-id>.<ext>`, `bg_<scene-id>_<variant-id>.<ext>`, `fg_<scene-id>_<layer-id>.<ext>`, `prop_<object-id>_<variant-id>.<ext>`, `bgm_<track-id>.<ext>`, `sfx_<cue-id>.<ext>` ไม่ได้เลือก expression/pose/variant ใหม่ให้เรื่องและยังไม่กำหนด suffix/version final

| Asset | Requirement ที่ล็อก/จำเป็นต่อ handoff | ส่วนที่ต้องเลือกใน U-02 |
|---|---|---|
| VN sprite | 2D hand-drawn, alpha transparency, shared canvas/anchor ต่อชุด expression | PNG หรือ lossless WebP, pixel dimensions, pose/expression catalog, export scale |
| Background | Composition reference 1920×1080; layer แยกเมื่อจำเป็นต้องบัง/เปลี่ยนได้ | PNG/WebP/JPEG ตามการใช้, actual pixel export, lighting variants/compression |
| Foreground/counter/prop | Alpha เมื่อแยกทับ world; layer/anchor manifest | Format, bounds และ mask/occlusion metadata |
| UI icon | อ่านได้เมื่อ scale; label/focus ไม่ขึ้นกับ icon อย่างเดียว | SVG หรือ raster, size และ naming |
| Audio | ใช้ Phaser Sound/AudioManager; มีที่มา/สิทธิใช้ | Browser-compatible encoded formats/fallbacks, loop points, channel และ export settings |
| Artist source | เก็บ editable layers ที่ย้อนแก้ได้และส่งพร้อม export metadata | PSD/KRA/ไฟล์ต้นทางที่ artist ใช้และวิธีส่ง |

รายการ format เป็นตัวเลือก ไม่ใช่ข้อกำหนด final หรือเหตุให้เพิ่ม format pipeline หลายชุด ทุก export ต้องผ่าน browser/device matrix ที่ล็อก ไม่ตัดสินว่า codec ที่ทดสอบเพียง browser เดียวใช้ได้ทั้งหมด

## Artist handoff rules

สถานะรับงาน ณ M0 (2026-10-13): ทีมส่ง JPG background เบื้องต้น 4 variants และ JPG character sheet ที่มี 4 ตัวละครเป็น **references เท่านั้น** Layering/transparency/aspect ratio/sprite mapping/layout ยังไม่อนุมัติ จึงไม่ใส่ใน production manifest หรือ build ไม่อนุมานว่าครบตัวละครใน Narrative Map และไม่สร้าง art ที่ขาด M0 ใช้ technical placeholder ID แยกจาก release IDs; manifest ที่ scaffold ไม่ปิด U-01/U-02

- ใช้ scene/character/object IDs ที่เชื่อมกลับ narrative registry ได้ และระบุ placeholder/final status
- ส่ง viewport guide, stage anchor/pivot, scale, bounding/crop rules และ draw-order reference ที่ยืนยันใน U-01
- ส่ง expression/pose manifest ตาม scene cards พร้อม canvas เดียวกันในชุด; ไม่ crop tight ต่อ expression จนตำแหน่งเลื่อน
- แยก background, foreground/counter และองค์ประกอบที่ต้องเปลี่ยนหรือบัง sprite ตาม composition ไม่รวม UI dialogue ลงภาพฉาก
- ส่ง exported file + editable source + manifest/preview ของ layering + author/license/source/credit metadata ไม่เปลี่ยน content ของ source scene โดยพลการ
- Artist/dev ตรวจ filename case, transparency, missing references, anchor และ export dimensions ก่อนรับเข้า build ถ้าข้อมูลไม่ครบให้ระบุ OPEN QUESTION ไม่สร้าง mapping ที่อาจเปลี่ยนความหมายของฉากเอง

## OPEN QUESTION

Post-A+B Owner FINAL authorization (17 October 2026) permits four verified original cutouts for gameplay only and the player-facing title **หลังเคาน์เตอร์**. [Scoped stage mapping/provenance, safe non-occluded fallback and temporary motion](DEMO_CHARACTER_STAGE.md) govern this experiment; no Main Menu characters/cover, original scene replacement, new narrative events or final U-01/U-02/U-03 closure. Info/Notice stays inside the left menu safe area; Options retains its separate layout. Back controls have no underline/pointer glow and retain keyboard focus. Existing A+B reading/Auto/input contracts above remain in effect.

**U-01 — Layout/stage/input (ก่อน final art และ M6):** Exact stage positions/anchor/scale, dialogue/choice bounds, safe areas, supported minimum viewport/touch target และ keyboard navigation ของ hotspot/puzzle เป็นอย่างไร? ที่ล็อกคือ viewport/composition strategy และ narrative keys ไม่ใช่ pixel coordinates ทุกส่วน

**U-02 — Asset export contract (ก่อนส่ง artist ผลิต final assets):** ทีมจะใช้ naming template/manifest แบบใด, sprite dimensions/format, pose/expression list, layer/mask format, image/audio export/compression และ editable-source format อะไร? ต้นฉบับยังไม่มี production contract เหล่านี้ จึงให้รายการข้อมูลและตัวอย่างโดยไม่ยกระดับเป็นค่าที่ล็อก

**U-03 — Presentation defaults (ก่อน M6):** Thai font, text speed/Auto timing, reduced-motion default และ volume channel/default values คืออะไร? Controls และ AudioManager ล็อกแล้ว แต่ค่าตั้งต้นไม่ได้ล็อก ไม่เลือกตัวเลขให้ผู้เล่นแทนการตัดสินใจทีม

