# MASTER_PLAN — M0–M7

Source of Truth ของลำดับงาน Definition of Done และหลักฐานตรวจ เพื่อไปถึง **Prototype บทนำ + Day 1–3** และ competition package ขอบเขตเกมเต็มอยู่ใน [PROJECT](PROJECT.md); เนื้อหารายฉากอยู่ใน [Narrative Map](sources/narrative_map_7_day_Updates.md)

สถานะ milestone ทั้งหมด: **ยังไม่เริ่ม implementation** ชุดนี้เป็นเอกสาร ไม่ได้ยืนยันว่ามี repo/game/build ที่ผ่านการตรวจแล้ว ไม่มีประมาณวันทำงานที่ล็อกไว้

## Milestones

| Milestone | ผลงานและลำดับพึ่งพา | Definition of Done |
|---|---|---|
| **M0 — Project scaffold** | สร้าง React/TypeScript/Vite + Phaser 4, Zustand, inkjs และเครื่องมือตรวจตาม [ARCHITECTURE](ARCHITECTURE.md); placeholder shell ที่ style-ready; ตรวจ A-01 รวม exact Ink compiler/runtime ในขั้นนี้ | `npm install`/`npm ci`, dev และ static build ใช้งานได้; scripts ตาม README มีจริง; 16:9 shell + rotate prompt + placeholder world/React overlay ทำงาน; reusable UI/styling boundary/design-token foundation เปลี่ยน style ได้ ไม่ invent final identity; lifecycle ไม่สร้าง instance/listener ซ้ำ; lockfile และ Node/compiler compatibility บันทึกแล้ว; ไม่เติม story facts |
| **M1 — Narrative engine** | หลัง M0; ทำตาม N-02/G-02/G-03 ที่ CLOSED แล้ว: controller, TypeScript EventRegistry, read-only query port, Line/Event IDs, ledger และ checkpoint flow; ใช้ technical fixture จนปิด N-03 ก่อนใช้ narrative content จริง; placeholder UI ยัง style-ready | Fixture compile และเล่น line→choice→branch→rejoin ได้โดยแยกจาก release story; validate ทั้ง output ก่อน domain commit→presentation→publish; unknown tag/ID fail/guard; double input/duplicate results ไม่ commit ซ้ำ; save/load safe checkpoint คืน line/choice ถูกต้อง ไม่ replay events/SFX และ Auto/Skip off |
| **M2 — Placeholder vertical slice** | หลัง M1; เชื่อม D1-B→D2-A เพื่อพิสูจน์ Promise→delayed result→repair→Album→save/load; functional game layout และ stage/component structure เริ่มใกล้ production ยังใช้ placeholder art ได้; ไม่ถือเป็น Day 1–2 ครบ | Flow มี/ไม่มีคำรับปากและเปลี่ยนข้อตกลงได้ตาม scene card ที่ยืนยัน; world/UI/audio/state ต่อครบ; layout ใช้งานจริงและเปลี่ยน style/art ผ่าน tokens/manifest โดยไม่แก้ narrative/state logic; refresh/load กลับ Safe Checkpoint; puzzle assistance ไม่กระทบ relationship จาก skill และ active puzzle save ไม่ได้; placeholders ไม่อ้างเป็น final art |
| **M3 — Core systems** | หลัง M2; TSPR, Promise, Memory/permissions, delayed flags, Album, saves/migration, settings/VN controls และ basic design system/reusable UI foundation; ปิด G-01 โดย G-02/G-03 CLOSED แล้ว; ยังไม่ต้อง final polish | Meaningful tests ยืนยัน invariants ตาม [GAME_STATE](docs/GAME_STATE.md); ไม่มีคะแนนรวมหรือ disclosure unlock; breach มีหลักฐาน; seen/told/permission ไม่ปน; autosave+3 slots/migration/storage failure ทำงาน; global settings/read IDs คงข้าม runs/slots แต่ Album/knowledge/backlog ไม่รวมข้าม run; reusable components/design tokens ใช้ร่วมกันและ controls ทำงานครบ |
| **M4 — Day 1 production** | หลัง M3; Notice/บทนำ + D1-A/D1-B/D1-C และ artist asset integration ตาม contract ที่ยืนยัน; ต้องมี scene cards/บทที่เจ้าของยืนยันตาม N-03 | เด็กทั้งห้าปรากฏ/ตั้งฐานตาม map; Task Promise ที่บาสตกลงเท่านั้นเกิด; Memory ของสิ่งที่เห็นไม่กลายเป็นความจริงครอบครัว; มี quiet close; Day 1 transition/checkpoint ตรวจครบ; artist assets แทนผ่าน semantic IDs/manifest โดยไม่แก้ state/Ink logic; ไม่มีบทที่ Codex แต่งเอง |
| **M5 — Day 2–3 / complete Prototype** | หลัง M4; D2-A/B/C แล้ว D3-A/B/C พร้อม artist asset integration; grouping นี้คง M0–M7 | ผลคำตกลง D1→D2, puzzle รถ, Memory อาหาร, ฉากส้ม/นัท และขอบเขตกับกันต์ครบ; จบ D3 ในตัวเอง; ไม่มีฝน/กล่องดนตรี/epilogue ปลอม; asset replacements รักษา manifest/anchor contract; ทุกรูปแบบหลักผ่านเริ่มใหม่/load; state ปลาย D3 รองรับ model D4 โดยไม่รับรอง save ข้ามทุก build |
| **M6 — Polish / testing** | หลัง M5; final visual polish/readability/responsiveness/animation/final assets พร้อม controls/accessibility/playtest/browser matrix; ปิด P-01/U-01–U-03 ที่เกี่ยวข้อง โดย asset contract ต้องยืนยันก่อนผลิต/รับ final art ใน M4–M5 | Release gates ครบพร้อมหลักฐาน; Prototype ใกล้งบ 20 นาทีตาม playtest; notice/skip presentation ไม่ลงโทษ relationship; final visual/asset integration อ่านง่ายบน desktop/mobile landscape และ reduced motion; references/credits ตรวจแล้ว; ไม่มี blocking defects; ระบุสิ่งที่ยังไม่ตรวจ ไม่อ้างทุก browser ผ่าน |
| **M7 — Competition build** | หลัง M6 และปิด P-02; freeze content/config แล้วสร้าง static artifact | ผล build เดียวกันเปิดบน Vercel และ itch.io จริงได้; ZIP เกมมี root `index.html`; save/audio/focus/fullscreen/resize ใน iframe ตรวจผ่าน; final URL/ZIP/version และ verification record พร้อมตามกติกาประกวด; content/help/music information ที่ใช้เผยแพร่ตรวจแล้ว; ไม่มี OPEN QUESTION ที่เปลี่ยน behavior ของ build ค้าง |

M2 เป็นข้อเสนอขอบเขต technical validation จากคู่ฉากที่ล็อก ไม่ใช่การตัดสินใจเพิ่มเนื้อเรื่อง งานบทและ scene cards ยังต้องปิด N-03 ก่อนเรียก vertical slice นี้ว่าฉบับเล่นจริง

## เนื้อหา Day 1–3 ที่ต้องส่ง

ตารางนี้เป็นดัชนีการผลิต ไม่คัดลอก choices/state deltas จาก Narrative Map

| ชุดฉาก | สิ่งที่ต้องเห็นในการตรวจ | เปิดรายละเอียด |
|---|---|---|
| D1-A / D1-B / D1-C | ซื้อของของมะนาว/ส้ม; ข้อตกลงรถของบาส; อาหารของนัท ระยะกันต์ และ quiet close | ต้นฉบับหัวข้อ “วัน 1 พบเด็กก่อนรู้ปัญหา” |
| D2-A / D2-B / D2-C | ผลข้อตกลงรถ; งบซื้อของส้มและสิทธิเลือก; ยางลบ/อาหารที่คุยต่อ | ต้นฉบับหัวข้อ “วัน 2 คำตกลงเล็ก ๆ มีผลจริง” |
| D3-A / D3-B / D3-C | ที่นั่งส้ม; ช่วงก่อนปิดของนัท; พฤติกรรมกันต์ที่เห็นจริงและขอบเขต; กัปตันเป็น cameo | ต้นฉบับหัวข้อ “วัน 3 สิ่งที่มองเห็นเปลี่ยนความหมาย” |

ทุก scene card ต้องระบุเวลา จุดเข้า สิ่งที่รู้/ไม่รู้ choice ข้อตกลงหรืออนุญาตที่เปลี่ยน ปฏิกิริยาทันที วันที่เห็นผล และจุดกลับเส้นหลัก ตามข้อกำหนดท้าย [ต้นฉบับ](sources/narrative_map_7_day_Updates.md)

## แผนตรวจที่มีความหมาย

| ระดับ | เครื่องมือ/วิธี | สิ่งที่ต้องพิสูจน์ |
|---|---|---|
| Unit | Vitest | Tag/event validation; domain transitions; consent scope; TSPR แยกมิติ; Promise lifecycle; migration/validation; read-text identity |
| Integration | Vitest ร่วม runtime fixtures | Validate whole output ก่อน commit; domain→presentation→publish order; choice/load atomic; ledger ไม่ commit ซ้ำจาก reload/restore/remount/duplicate result; context reset เมื่อเปลี่ยน scene; query read-only; delayed consequence มีผู้รับรู้ |
| Browser flows | Playwright | เริ่มใหม่→D1→D2→D3; reload/resume; autosave+3 slots; line restore เต็ม/choice ยังไม่เลือก; active puzzle save ไม่ได้; global read IDs/settings คงข้าม New Game/slots แต่ Album/knowledge/backlog ไม่รวม; Skip หยุด choice/unread; input/orientation/pause/reduced motion |
| Real browsers/devices | ตรวจด้วยคนบนรุ่นที่ [ARCHITECTURE](ARCHITECTURE.md) ระบุ | Safari/iOS, Edge และ touch จริง; fullscreen/audio unlock/iframe/storage; บันทึกวันที่ รุ่น และผล |
| Narrative review / playtest | อ่าน scene cards และเล่นบทไทยจริง | ความเข้าใจบริบท สิทธิเลือก ความต่อเนื่องของเหตุและผล และงบเวลา; ไม่ใช้ completion ของ secrets หรือคะแนนอคติที่ยังไม่มีวิธีวัด |

Playwright WebKit ไม่ใช่หลักฐานว่า Safari/iOS จริงผ่านแล้ว เลขเครื่อง/OS และ browser ของรอบตรวจต้องอยู่ในบันทึก release

## Release gates

- Quality scripts ใน [README](README.md) ผ่าน: typecheck, lint, format, narrative compile/validate, Vitest, Playwright และ build
- Validate ทุก referenced scene/character/event/asset ID; ไม่มี orphan choice route หรือ route ที่ติดจนไปต่อไม่ได้
- ตรวจเส้นมีคำรับปาก/ไม่มีคำรับปาก/เปลี่ยนข้อตกลง และหยุดคุย/ไม่เปิดเผยข้อมูล ไม่ตรวจแค่เส้นทางที่เด็กตอบรับทั้งหมด
- เก็บหลักฐานว่าปฏิเสธ disclosure ยังมีเรื่องธรรมดาเล่น; puzzle skill, pause และ skip presentation ไม่เปลี่ยน relationship
- save/load เฉพาะ Safe Checkpoint ตาม G-02: line เดิมเต็มทันที/choice เดิมยังไม่เลือก, ไม่ snapshot กลาง transaction/active puzzle; Auto/Skip off หลัง load, ไม่ replay durable/one-shot events/SFX; ตรวจสาม version identities, corrupt/future-schema/incompatible-story และ storage unavailable โดยไม่ลบข้อมูลเดิมหรือเดา story migration
- ตรวจ G-03: global settings/read-line history ไม่ถูก rewind จาก save เก่า; Album/Memory/permissions/flags/ledger/current backlog แยกตาม playthrough ไม่มี global ending/epilogue unlock
- ตรวจ Thai font/line wrap/overflow, focus และ touch targets ที่ขนาด desktop/mobile landscape ซึ่งทีมยืนยัน ไม่เลือกขนาดขั้นต่ำแทนใน U-01
- assets final/placeholder ที่ใช้ปล่อยต้องยืนยัน; ทุกชิ้นมีที่มา/สิทธิใช้; เพลงกล่องดนตรีต้องใช้สิทธิที่เหมาะสมเมื่อผลิตเกมเต็ม
- Notice และหน้าข้อมูลอ่านเพิ่มเติมใช้เนื้อหาที่ผ่านการตรวจ หากแสดงบริการ/หมายเลข ต้องตรวจแหล่งปัจจุบันก่อนเผยแพร่ ไม่ใส่หมายเลขจากความจำ
- ทดสอบ build บน Vercel และ itch.io จริง ไม่ใช้การมี ZIP หรือ deploy สำเร็จแทนการเล่นได้

บันทึกหลักฐานแบบกระชับใน milestone นี้เมื่อทำงานจริง: build/commit, วันที่, commands, browser/device, routes/checkpoints ที่ตรวจ, ผล, known limitations และผู้ตรวจ ไม่สร้าง TESTING.md ซ้ำในระยะ Lean

## Closed decisions และ OPEN QUESTION gates

| Decision | สถานะและ Source of Truth |
|---|---|
| N-02 | **CLOSED** — [NARRATIVE_SYSTEM](docs/NARRATIVE_SYSTEM.md); compiler/runtime exact executable และ minor/patch ตรวจ M0/A-01 |
| G-02 | **CLOSED** — Safe Checkpoint/atomic save-load/version compatibility ใน [GAME_STATE](docs/GAME_STATE.md) |
| G-03 | **CLOSED** — Global profile กับ per-playthrough scopes ใน [GAME_STATE](docs/GAME_STATE.md) |

รายการต่อไปนี้ยังเป็น OPEN QUESTION จริงเท่านั้น ไม่ใช้ N-02/G-02/G-03 เป็น unresolved gates อีก

| ก่อนงาน | คำถามและไฟล์เจ้าของ |
|---|---|
| M0 dependency lock | A-01 toolchain versions — [ARCHITECTURE](ARCHITECTURE.md) |
| M2 real story / M4–M5 content | N-03 scene cards/บทที่อนุมัติ — [NARRATIVE_SYSTEM](docs/NARRATIVE_SYSTEM.md) |
| M3 relationship implementation | G-01 representation/initial values/rules — [GAME_STATE](docs/GAME_STATE.md) |
| ก่อน final art และ M6 | U-01 layout/asset coordinates, U-02 export contract, U-03 defaults — [UI_ASSET_SPEC](docs/UI_ASSET_SPEC.md) |
| ก่อน M6 audience playtest | P-01 audience — [PROJECT](PROJECT.md) |
| ก่อน freeze competition scope และ M7 | P-02 competition — [PROJECT](PROJECT.md) |

**Technical Documentation Baseline v0.1 พร้อมสำหรับ Freeze ของ core technical contracts** โดยคง OPEN QUESTION ข้างต้นเป็นเงื่อนไขของงานภายหลัง ไม่มี blocker ที่ทำให้ปิด N-02/G-02/G-03 ไม่ได้ A-01 เป็นงานตรวจ compatibility ใน M0; G-01/N-03 และ U/P questions ต้องปิดก่อนงานที่เกี่ยวข้อง ไม่ฝังค่า state/permission policy/บท/final identity ที่ยังไม่ล็อก รอบนี้แก้เอกสารเท่านั้นและไม่เริ่ม M0 implementation

## ต่อสู่เกมเต็ม

หลัง Prototype review ให้กำหนด production plan ของ Day 4–7 ตาม map: ขอบเขตสมุด/ร่างกาย → ข้อกล่าวหาและการแบ่งข้อมูล → ผลย้อนหลัง/ฝน → งานร่วมกัน/Final Shop State/epilogues ไม่เปลี่ยน state engine หรือเริ่ม save model ใหม่ ทดสอบ delayed ledger และ world facts ทุก branch ก่อนปล่อยเกมเต็ม

Full Game ต้องตรวจงบหลัก 50 นาที + เสริมประมาณ 8 นาทีและไม่เกิน 60 นาทีด้วย playtest จริง ไม่มี milestone ของ Day 4–7 ที่อนุมัติหรือกำหนดเส้นตายในชุด M0–M7 นี้ การประเมินงานระยะต่อไปต้องไม่ถูกตีความว่า M7 ส่งเกมเต็มแล้ว
