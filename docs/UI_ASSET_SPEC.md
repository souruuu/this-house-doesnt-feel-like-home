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

Instant Text เป็น baseline; ไม่มี Production Save/Load/Resume, Auto/Skip/Settings หรือปุ่มหลอก ไม่มี artwork/font/music ที่คัดลอกจาก UX reference ต้องแจ้ง refresh/close สูญเสียความคืบหน้า ขอบเขตนี้ไม่ยกเลิก full-game UI contracts ด้านล่าง

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

**U-01 — Layout/stage/input (ก่อน final art และ M6):** Exact stage positions/anchor/scale, dialogue/choice bounds, safe areas, supported minimum viewport/touch target และ keyboard navigation ของ hotspot/puzzle เป็นอย่างไร? ที่ล็อกคือ viewport/composition strategy และ narrative keys ไม่ใช่ pixel coordinates ทุกส่วน

**U-02 — Asset export contract (ก่อนส่ง artist ผลิต final assets):** ทีมจะใช้ naming template/manifest แบบใด, sprite dimensions/format, pose/expression list, layer/mask format, image/audio export/compression และ editable-source format อะไร? ต้นฉบับยังไม่มี production contract เหล่านี้ จึงให้รายการข้อมูลและตัวอย่างโดยไม่ยกระดับเป็นค่าที่ล็อก

**U-03 — Presentation defaults (ก่อน M6):** Thai font, text speed/Auto timing, reduced-motion default และ volume channel/default values คืออะไร? Controls และ AudioManager ล็อกแล้ว แต่ค่าตั้งต้นไม่ได้ล็อก ไม่เลือกตัวเลขให้ผู้เล่นแทนการตัดสินใจทีม

