# This House Doesn't Feel Like Home — Package 3: Day 3 Production Content

**ส่งโดย:** 04 — Narrative / Scene Cards → 01 — Architecture & Decisions (Final Reviewed Content / Handoff)  
**วันที่:** 17 ตุลาคม 2026 (ICT)  
**Revision:** `P3-D3-v0.3`  
**สถานะ:** `STRUCTURE APPROVED` / `EDITORIAL REVIEW ACCEPTED — v0.2 fixes reviewed; v0.3 documentation-only errata by 01` / `IMPLEMENTATION AUTHORIZATION PENDING`  
**อ้างอิงชุดก่อน:** `P1-D1-v0.3` (`EDITORIAL REVIEW ACCEPTED`), `P2-D2-v0.2` (`EDITORIAL REVIEW ACCEPTED`)  
**Authority:** Owner Frozen 9-Scene Structure (17 Oct 2026), 01 Narrative Review/Workflow; `narrative_map_7_day_Updates.md` (only non-conflicting narrative facts); `PROJECT.md`, `GAME_STATE.md`, `NARRATIVE_SYSTEM.md`, `UI_ASSET_SPEC.md`.  
**ขอบเขต:** `SC-D3-01` ส้ม, `SC-D3-02` นัท, `SC-D3-03` กันต์, Quiet Close, `DEMO_END`. **ไม่มีบาส/Repair Puzzle/Family revelation/ตัวเอกมีภูมิหลัง**.

**Approval separation:** Scene identity, order, time windows และ Demo scope ผ่าน Owner Approval แล้ว. บทและ choice/semantic details ในไฟล์นี้เป็น **EDITORIAL REVIEW ACCEPTED** ตามผลตรวจ 01 และ minor corrections ใน v0.2. Draft Refs ไม่ใช่ technical Ink/Line/Event IDs ที่อนุมัติ; 03 รับผิดชอบ technical mapping เมื่อได้รับ implementation authorization. ไม่มีการอ้างว่า Build, Runtime, Automated Tests, Asset Manifest หรือ Save/Resume ผ่าน.

## v0.3 Editorial Errata — 01 (No dialogue/choice/state changes)

- แก้คำอธิบายวิธีเปิดชื่อกันต์ใน Short Scene Card ให้ตรงกับบทที่แสดงจริง `D303-L010A` (“เรียกผมว่า...กันต์ก็ได้”).
- แก้ Reading Rule ที่อ้าง `D303-L011A` เป็น fact-bearing line ผิด: ตัว fact เกิดจาก `D303-L010A`, จากนั้นจึงแสดงชื่อในบรรทัด L011A.
- บทสนทนา Choice Labels, Branch/Rejoin, Conditions, Facts และ Narrative Tests **ไม่เปลี่ยน**. เป็น editorial errata ของ 01 เพื่อส่งต่อด้าน Technical Planning เท่านั้น.

## v0.2 Changelog — 01 Final Narrative Review (17 Oct 2026)

1. `D301-L002`: ระบุ **รถมอเตอร์ไซค์** วิ่งผ่านหน้าร้านและเสียงชายจากถนน โดยไม่เปิดเผยอัตลักษณ์บุคคล; ซิงก์ Short Card, Presentation และ test expectations (`P3-D3-T01/T02/T03`).
2. `D302-L001`: แก้ “ใกล้ค่ำ” เป็น **“ค่ำแล้ว”** ให้ตรงกับ 19:00–20:00; ซิงก์ `P3-D3-T01/T04`.
3. ปรับ Review Status เป็น `EDITORIAL REVIEW ACCEPTED` ภายใต้การมอบหมายของ 01; **คง Choice Texts, Branch Results, Scene IDs, Durable Facts และ Conditions เดิม**. ไม่มี Runtime Tests ที่รันแล้ว.

## 0. Editorial handoff summary / Changelog

- **สร้าง Package 3 ใหม่จาก Approved Scene Structure:** Day 3 ตามลำดับ `SC-D3-01` (ส้ม) → `SC-D3-02` (นัท) → `SC-D3-03` (กันต์) → Quiet Close → `DEMO_END`.
- **ส้ม:** ปฏิกิริยาต่อเสียงรถและเสียงคนจากถนนเป็นสิ่งที่ผู้เล่นเห็น; ส้มเลือกตำแหน่งเก้าอี้/เลือกคุยหรือไม่คุยได้ โดยไม่มีการยืนยันคนในรถเป็นใครและไม่มีการถามเหตุบังคับ.
- **นัท:** แจ้งเวลาปิด 21:00 จริง; ให้เลือกนั่งเงียบหรือหยุดคุยก่อนปิด; ไม่มีการโทร/ส่งข้อความ และไม่มี disclosure/permission ข้อมูลครอบครัว. ข้อตกลงสั้นในฉากดำเนินให้สำเร็จก่อนเปลี่ยนฉาก (ไม่ตั้งคำสัญญาข้ามวันใหม่).
- **กันต์:** ผู้เล่นเห็นเขา *ปัดของจากชั้นตกจริง*; ทั้งสองคำตอบวางขอบเขตต่อพฤติกรรมโดยไม่ตีตราตัวเด็ก; มีทางเปิดเผยชื่อที่ **เด็กพูดเองจริง** และทางไม่รู้ชื่อที่จบได้ครบ.
- **Demo Ending:** ข้อความ UI ภาษาไทยจริง อธิบายเพียงจบช่วงทดลองสามวัน และเรื่องยังดำเนินต่อวันที่ 4–7; ไม่มี Full Game Epilogue หรือคำรับรองว่าชีวิตเด็กเปลี่ยนแล้ว.
- **No Major Owner Decision Required.** ไม่มีการเพิ่ม Family/Trauma Facts, Permission-policy ใหม่, TSPR numbers/thresholds, Puzzle, Characters, Days หรือ scope. 01 ตรวจว่า scene-local arrangement ที่บรรยายไว้ไม่เปลี่ยน Promise Contract เดิม.

## A. Day 3 Scene Manifest — Owner-Approved Structure

### A1. Frozen main flow และ Boundaries

`SC-D2-03/END → DAY_2_TO_DAY_3 → SC-D3-01 → SC-D3-02 → SC-D3-03 → QUIET_CLOSE_D3 → DEMO_END`.

`/START`, `/END`, `DAY_2_TO_DAY_3`, `QUIET_CLOSE_D3`, `DEMO_END`, `R01/R02` เป็น **content-flow refs** เพื่อให้ 03 กำหนด technical mapping ไม่ใช่ release Ink knots/events. `DEMO_END` เป็น intentional completion ของเดโม ไม่ใช่ Dead End.

| Scene Order | Approved Semantic ID / Source Mapping | Time Window | Characters Present | Purpose | Entry / Conditions | Exit Boundary | Branches → Rejoin | Next | Structure |
|---:|---|---|---|---|---|---|---|---|---|
| 7 | `SC-D3-01` / Narrative Map `D3-A` adapted | Day 3 15:30–18:30 | ส้ม, Player; รถมอเตอร์ไซค์/เสียงจากถนนไม่เปิดเผยเจ้าของ | เห็นส้มสะดุ้งและให้เด็กเลือกพื้นที่/จังหวะพัก | `SC-D2-03/END`; Som name learned in `D102-L007` | ส้มได้นั่งพักตามที่เลือก แล้วออกจากร้านภายในช่วงนี้ | `D301-C01-A/B` → `D301-R01` | `SC-D3-02` | STRUCTURE APPROVED |
| 8 | `SC-D3-02` / Narrative Map `D3-B` adapted | Day 3 19:00–20:00 | นัท, Player | ขอบเขตเวลาและทางเลือกที่จะคุยหรือเงียบ | `SC-D3-01/END`; Nut name learned in `D103-L004`; **ไม่ขึ้นกับ D1 food fact** | นัทได้รับคำตอบเรื่องเวลาและกลับก่อน 20:00; ไม่มี overnight | `D302-C01-A/B` → `D302-R01` | `SC-D3-03` | STRUCTURE APPROVED |
| 9 | `SC-D3-03` / Narrative Map `D3-C` adapted, Bas removed | Day 3 20:00–21:00 | กันต์ (ผู้เขียนรู้ identity; Player อาจไม่รู้ชื่อ), Player | วางขอบเขตต่อของที่ตกจริง, ให้ทางรับผิดชอบ, จบเดโม | `SC-D3-02/END`; Player เคยเห็นเด็กชายใต้ชายคา `D103-L008` | ของที่ตกได้รับการจัดการ; เด็กชายออกก่อนปิด; ร้านปิด **ที่ 21:00** | `D303-C01-A/B` → `D303-R01` → `D303-C02-A/B` → `D303-R02` | `DEMO_END` | STRUCTURE APPROVED |

**Scene entry guard:** Day 3 ไม่ require D1 `NUT_FOOD_INTEREST_TOLD_D1`, ไม่ require ส้มรับอาหาร D2 และไม่ require ชื่อกันต์. กรณีไม่มี D1 food fact ยังคงเล่นครบเหมือนกัน. ไม่ใช้ Trust/Respect/Safety/Pressure threshold/gate.

### A2. Short Scene Cards

**SC-D3-01 — เก้าอี้หลังชั้น:** หลังเสียงรถมอเตอร์ไซค์วิ่งผ่านหน้าร้านและเสียงชายจากถนน ส้มถอยเข้าหลังชั้นขนม. ผู้เล่นเลือกให้เธอชี้ที่วางเก้าอี้ หรือถามความต้องการเพียงหนึ่งครั้ง. เธอเลือกนั่งพักได้โดยไม่เล่าสาเหตุ; ไม่อ้างว่าเสียงนั้นเป็นเสียงพ่อหรือคนที่รู้จัก. ให้ผู้เล่นเห็นตำแหน่งเก้าอี้ตาม action จริง.

**SC-D3-02 — ก่อนร้านปิด:** นัทอยากอยู่ต่ออีกนิด ผู้เล่นบอกชัดว่าร้านปิด 21:00 และเสนอทางเงียบหรือคุย. นัทเลือกรักษาบทสนทนาแค่เรื่องเวลานั่งได้; กลับก่อน 20:00 เพื่อให้เวลาของกันต์ไม่ชนกัน. ไม่มีข้อมูลส่วนตัวที่ผู้เล่นจะนำไปบอกบุคคลอื่น และไม่มีข้อตกลงรักษาความลับแบบไร้ขอบเขต.

**SC-D3-03 — ของที่ตก / ชื่อที่เลือกบอก / Quiet Close:** เด็กชายคนที่ผู้เล่นเคยเห็นชายคาปัดของบนชั้นตกขณะโกรธ ผู้เล่นตอบตามพฤติกรรมจริง (หยุดพักหรือช่วยเก็บเมื่อพร้อม) ไม่ใช้การคว้าแขนหรือยัดเยียดคำขอโทษ. หลังสะสาง มี Choice ถามว่าต้องการให้เรียกอย่างไรโดยปล่อยสิทธิไม่ตอบ หรือไม่ถามชื่อ; **มีแต่บทที่เด็กพูดว่า “เรียกผมว่า...กันต์ก็ได้” (`D303-L010A`) เท่านั้นที่เปิดชื่อให้ Player**. ป้ายปิดเวลา 21:00 ตามด้วยหน้า `DEMO_END` ซึ่งเป็น UI ไม่ใช่เหตุการณ์ต่อหลังเวลาปิด.

## B. Complete Thai Production Dialogue & Choices

**Reading rule:** คอลัมน์ **ข้อความที่แสดงจริง** คือข้อความสำหรับเกม; metadata เงื่อนไขไม่ต้องแสดง. ผู้บรรยายบอกภาพ/เสียง/การกระทำที่รับรู้ได้ ไม่บรรยายความคิดของ Blank Protagonist. `D301-R01` เป็นต้นเป็น **unrendered rejoin labels**; `C` เป็น player choice (ผู้เล่นเลือกการกระทำ/คำพูด). Ref identity อยู่ฝ่าย 04; technical stable Line/Event IDs อยู่ 03. การแสดง label “กันต์” ห้ามเกิดก่อน fact-bearing line `D303-L010A` ถูกแสดงจริง; `D303-L011A` เป็นบรรทัดแรกที่ narrator ใช้ชื่อได้.

### B1. `SC-D3-01` — เก้าอี้หลังชั้น (15:30–18:30)

| Draft Ref | Speaker Label | ข้อความที่แสดงจริง / Choice Text | เงื่อนไข / Destination |
|---|---|---|---|
| `D301-L001` | ผู้บรรยาย | หลังเลิกเรียน ส้มเดินเข้ามาที่ชั้นขนม | START |
| `D301-L002` | ผู้บรรยาย | เสียงรถมอเตอร์ไซค์วิ่งผ่านหน้าร้าน ตามด้วยเสียงชายคนหนึ่งจากถนน | ทั้งภาพ/เสียงผ่าน narration ได้; ผู้เล่นไม่รู้ว่าเป็นใคร |
| `D301-L003` | ผู้บรรยาย | ส้มสะดุ้ง แล้วขยับเข้าไปหลังชั้นขนม | ต่อ |
| `D301-L004` | ส้ม | ขออยู่ตรงนี้แป๊บนึงได้ไหมคะ | ต่อ |
| `D301-L005` | ผู้บรรยาย | มีเก้าอี้ว่างอยู่ข้างชั้น | → `D301-C01` |
| `D301-C01-A` | ตัวเลือกผู้เล่น | เสนอให้ส้มชี้จุดที่อยากวางเก้าอี้ | Branch A |
| `D301-L006A` | ส้ม | ขอตรงมุมนี้ได้ไหมคะ หลังชั้นนิดนึง | เธอชี้จุดจริง → `D301-L007A` |
| `D301-L007A` | ผู้บรรยาย | เก้าอี้ถูกเลื่อนไปตามจุดที่ส้มชี้ | → `D301-R01` |
| `D301-C01-B` | ตัวเลือกผู้เล่น | ถามส้มหนึ่งครั้งว่าอยากให้ช่วยอะไร หรือจะพักเงียบ ๆ ก็ได้ | Branch B |
| `D301-L006B` | ส้ม | ขอเก้าอี้ตรงนี้ได้ไหมคะ หนูอยากนั่งเงียบ ๆ | ส้มเลือกสิ่งที่ต้องการเอง → `D301-L007B` |
| `D301-L007B` | ผู้บรรยาย | เก้าอี้ถูกวางไว้ใกล้จุดที่ส้มยืน โดยไม่ขยับเธอออกจากมุมที่เลือก | → `D301-R01` |
| `D301-R01` / `D301-L008` | ผู้บรรยาย | ส้มนั่งลงบนเก้าอี้หลังชั้นขนม | Rejoin A/B; ไม่ตีความว่า Safety สูง/ต่ำ |
| `D301-L009` | ส้ม | ขอนั่งอีกนิดนะคะ | ต่อ |
| `D301-L010` | ผู้บรรยาย | หลังจากนั่งเงียบอยู่ครู่หนึ่ง ส้มลุกขึ้นและเดินไปทางหน้าร้าน | ไม่มีคำสารภาพ/เรื่องบ้าน |
| `D301-L011` | ส้ม | หนูไปก่อนค่ะ | ต่อ |
| `D301-L012` | ผู้บรรยาย | เก้าอี้ยังอยู่ในตำแหน่งที่ส้มเลือกไว้วันนี้ | `SC-D3-01/END` → `SC-D3-02`; **ไม่ได้เกิดคำรับปากว่าจะเก็บที่นี้ไว้วันหน้า** |

**Outcome contrast:** A ส้มชี้จุดวางเก้าอี้เอง; B ส้มขอเก้าอี้และเลือกพักเงียบ ๆ. ทั้งสองมีผลมองเห็นได้ทันทีและเล่นต่อได้. การวางเก้าอี้วันนี้ **ไม่เท่ากับ** Space Promise ข้ามวัน; หากผลิต Full Game ต้องการใช้ Promise ที่นั่งสำหรับ Day 6 จะต้องมีบทข้อตกลงโดยตรงและอนุมัติความหมายแยกตาม G-01 ไม่ยกเลิกข้อเท็จจริงของ Narrative Map ว่าเป็นทางเลือกที่ทำได้.

### B2. `SC-D3-02` — ก่อนร้านปิด (19:00–20:00)

| Draft Ref | Speaker Label | ข้อความที่แสดงจริง / Choice Text | เงื่อนไข / Destination |
|---|---|---|---|
| `D302-L001` | ผู้บรรยาย | ค่ำแล้ว นัทกลับมาที่ม้านั่งในร้าน | START; อยู่ในพื้นที่ร้าน |
| `D302-L002` | นัท | ผมนั่งต่ออีกหน่อยได้ไหมครับ | ต่อ |
| `D302-L003` | ผู้บรรยาย | แสงหน้าร้านเริ่มอ่อนลง ป้ายยังเป็น “เปิด” | ต่อ |
| `D302-L004` | นัท | ยังไม่อยากกลับตอนนี้ครับ | ขออยู่ระหว่างร้านเปิดเท่านั้น ไม่ใช่ขอค้างคืน |
| `D302-C01-A` | ตัวเลือกผู้เล่น | บอกว่าร้านปิดสามทุ่ม และเสนอให้นั่งเงียบ ๆ อีกครู่ก่อนกลับ | Branch A |
| `D302-L005A` | นัท | ครับ ผมขอนั่งเงียบ ๆ อีกหน่อย | เขาเลือกเอง → `D302-L006A` |
| `D302-L006A` | ผู้บรรยาย | นัทนั่งลงโดยไม่ต้องเล่าอะไรเพิ่มเติม | → `D302-R01` |
| `D302-C01-B` | ตัวเลือกผู้เล่น | บอกว่าร้านปิดสามทุ่ม และเสนอคุยเรื่องคนที่นัทไว้ใจได้ถ้าเขาอยากคุย | Branch B |
| `D302-L005B` | นัท | วันนี้ยังไม่อยากคุยเรื่องนั้นครับ ขอนั่งเฉย ๆ ก่อนได้ไหม | เขาปฏิเสธการคุยเรื่องส่วนตัวโดยตรง → `D302-L006B` |
| `D302-L006B` | ผู้บรรยาย | นัทได้รับที่นั่งโดยไม่ต้องตอบคำถามเพิ่มเติม | → `D302-R01` |
| `D302-R01` / `D302-L007` | นัท | ผมนั่งอีกครู่เดียว แล้วจะกลับก่อนร้านปิดครับ | Rejoin A/B; ข้อตกลงภายในฉาก: นัทเลือกนั่งแล้วออกก่อนปิด |
| `D302-L008` | ผู้บรรยาย | นัทนั่งอยู่เงียบ ๆ สักพัก แล้วลุกขึ้นจากม้านั่ง | เวลายังอยู่ก่อน 20:00 |
| `D302-L009` | นัท | ขอบคุณครับ ผมไปก่อนนะ | ต่อ |
| `D302-L010` | ผู้บรรยาย | นัทออกจากร้านก่อนสองทุ่ม ม้านั่งกลับมาว่างอีกครั้ง | `SC-D3-02/END` → `SC-D3-03` |

**Boundaries:** ข้อเสนอผู้เล่นทั้ง A/B บอกปิดเวลา **21:00**, เด็กตอบรับว่าพักต่อเพียงสั้น ๆ และออก **ก่อน 20:00**. ห้ามใช้ข้อความนี้อ้างว่านัทมีที่พักข้ามคืนหรือกลับบ้านแล้วปลอดภัย. ทาง B ไม่ได้ทำให้เขายอมเล่าข้อมูล; ไม่มีการเปิดเผย/ส่งต่อ Family Facts. การเปิดหัวข้อคนที่ไว้ใจเป็นข้อเสนอเท่านั้น ไม่มีการโทร/ส่งข้อความหาคนใด.

**Scene-local arrangement and system boundary:** “นั่งได้อีกครู่ก่อนร้านปิด” + การรับ/ออกภายในฉาก เป็นผลการคุยเรื่องเวลาที่เกิดจริงและสำเร็จในฉาก; **ไม่ยกระดับเป็น Promise ใหม่ข้ามวันหรือ Information Promise ว่าจะเก็บความลับตลอดไป**. หาก 03 ใช้ representation ของ Space Promise ที่ระบบเดิมรองรับ ให้ยึดข้อเท็จจริงว่าเสนอ/ยอมรับ/ทำแล้วภายในฉาก และรอ G-01 สำหรับ representation/domain payload; ฉากไม่ต้อง branch โดยอาศัย Promise state. ห้ามสร้าง Trust value/delta เพื่อทำให้ฉากทำงาน.

### B3. `SC-D3-03` — ของที่ตก / ชื่อที่เลือกบอก (20:00–21:00)

| Draft Ref | Speaker Label | ข้อความที่แสดงจริง / Choice Text | เงื่อนไข / Destination |
|---|---|---|---|
| `D303-L001` | ผู้บรรยาย | ก่อนปิดร้าน เด็กชายที่เคยยืนใต้ชายคาเดินเข้ามาใกล้ชั้นสินค้า | START; identity สำหรับทีมคือกันต์ แต่ Player ยังไม่รู้ชื่อ |
| `D303-L002` | ผู้บรรยาย | เขาขมวดคิ้ว กำมือแน่น แล้วปัดของบนชั้นตกลงมาสองชิ้น | **Observed incident fixed in all branches:** ปัดของตกจริง; ไม่อ้างสาเหตุที่ไม่รู้ |
| `D303-L003` | ผู้บรรยาย | ของทั้งสองชิ้นอยู่บนพื้นตรงหน้าเขา | ต่อ; ไม่ตีความว่าเขาขโมยหรือทำลายทรัพย์สินโดยเจตนาเกินสิ่งที่เห็น |
| `D303-L004` | เด็กชายที่ชายคา | ผมโมโหอยู่ | → `D303-C01` |
| `D303-C01-A` | ตัวเลือกผู้เล่น | บอกว่าโกรธได้ แต่ปัดของตกไม่ได้ แล้วให้เวลาพักก่อน | Branch A |
| `D303-L005A` | เด็กชายที่ชายคา | ผมขอหยุดก่อน | เด็กเลือกระยะของตน → `D303-L006A` |
| `D303-L006A` | ผู้บรรยาย | เขาถอยออกจากชั้นหนึ่งก้าวและยืนเงียบอยู่ข้างประตู | → `D303-L007A` |
| `D303-L007A` | ผู้บรรยาย | เจ้าของร้านเก็บของทั้งสองชิ้นกลับขึ้นชั้น | เฉพาะ A → `D303-R01` |
| `D303-C01-B` | ตัวเลือกผู้เล่น | บอกว่าโกรธได้ แต่ปัดของตกไม่ได้ และเสนอให้ช่วยเก็บเมื่อพร้อม | Branch B |
| `D303-L005B` | เด็กชายที่ชายคา | ได้ เดี๋ยวผมช่วยเก็บ | เป็นการตอบรับเสนอแก้ผลของเหตุโดยสมัครใจ → `D303-L006B` |
| `D303-L006B` | ผู้บรรยาย | เขาก้มเก็บของหนึ่งชิ้น แล้ววางไว้บนชั้นอย่างระวัง | → `D303-L007B` |
| `D303-L007B` | ผู้บรรยาย | เจ้าของร้านเก็บของอีกชิ้นขึ้นชั้นต่อจากชิ้นที่เด็กชายวางไว้ | เฉพาะ B → `D303-R01` |
| `D303-R01` | (ไม่มีข้อความแสดง) | — | Rejoin หลัง `D303-L007A/B`; ทั้งสองทางมีของกลับชั้นครบ ไม่บังคับขอโทษ |
| `D303-L008` | เด็กชายที่ชายคา | ผมขออยู่ห่าง ๆ ตรงนี้ก่อน | ต่อ; เลือกเว้นระยะในตอนนี้ ไม่รับรองพฤติกรรมอนาคต |
| `D303-L009` | ผู้บรรยาย | เด็กชายยืนอยู่ห่างจากชั้นสินค้า ครู่หนึ่งเขาหันมาทางเคาน์เตอร์ | → `D303-C02` |
| `D303-C02-A` | ตัวเลือกผู้เล่น | ถามว่าอยากให้เรียกว่าอะไร ถ้าไม่สะดวกบอกก็ไม่เป็นไร | Branch A; ไม่ผูกกับการช่วยเก็บของ |
| `D303-L010A` | เด็กชายที่ชายคา | เรียกผมว่า...กันต์ก็ได้ | **Name fact-bearing line; name disclosed by child himself** → `D303-L011A` |
| `D303-L011A` | ผู้บรรยาย | กันต์พยักหน้าครั้งหนึ่ง ก่อนหันกลับไปทางประตู | ตั้งแต่หลัง `D303-L010A` เท่านั้นที่ narrator ใช้ชื่อได้ → `D303-R02` |
| `D303-C02-B` | ตัวเลือกผู้เล่น | ปล่อยให้เขาเป็นคนเลือกเองว่าจะคุยต่อหรือไม่ | Branch B; ไม่ถามชื่อ |
| `D303-L010B` | ผู้บรรยาย | เด็กชายไม่ได้พูดอะไรต่อ เขามองออกไปทางถนน | **No name fact** → `D303-L011B` |
| `D303-L011B` | เด็กชายที่ชายคา | ผมไปก่อน | ยังเป็น label ที่ไม่เปิดชื่อ → `D303-R02` |
| `D303-R02` / `D303-L012` | ผู้บรรยาย | เขาเดินออกจากร้านก่อนสามทุ่ม | Rejoin A/B; ใช้สรรพนาม ไม่รั่วชื่อใน branch B |
| `D303-L013` | ผู้บรรยาย | ชั้นสินค้ากลับมาเรียบร้อย ม้านั่งใต้ชายคาว่างอยู่ | Quiet Close; เป็นภาพที่สังเกตได้ |
| `D303-L014` | ผู้บรรยาย | ก่อนสามทุ่ม แสงในร้านค่อย ๆ เหลือน้อยลง | ต่อ; เป็นบรรยากาศ ไม่ใช่คำคิดตัวเอก |
| `D303-L015` | ผู้บรรยาย | เมื่อถึงสามทุ่ม ป้ายถูกพลิกเป็น “ปิด” ไฟหน้าร้านดับลง | `SC-D3-03/END` → `QUIET_CLOSE_D3` → `DEMO_END`; ไม่มีการพักค้าง |

**Narrative safeguards:** ฉากนี้ไม่กำหนดว่าใครทำให้กันต์โกรธ และไม่กล่าวหาว่าเขาขโมย/ไม่มีบ้าน; ความผิดที่ผู้เล่นเห็นคือของตกเท่านั้น. `D303-C01-A/B` ให้ขอบเขตเท่ากันแต่การตอบสนองต่างกัน; ไม่ลดหรือเพิ่ม relationship จากการเก็บของเร็ว/ช้าหรือคำขอโทษ. ตัวละครออกก่อน 21:00 ทุกทาง. `D303-C02-A` เป็นการเปิดโอกาสให้เด็ก *เลือก* บอกชื่อด้วยปากตน ไม่ใช่ระบบเปิดชื่อจากการรู้จัก character ใน source.

**R01 completion guard:** A แสดง `D303-L007A` (เจ้าของร้านเก็บสองชิ้น); B แสดง `D303-L007B` (เจ้าของร้านเก็บชิ้นที่เหลือหลังเด็กชายช่วยหนึ่งชิ้น). หลังสองข้อความนี้จึงไป `D303-R01` → `D303-L008`. **ห้าม**สร้างบรรทัด `D303-L007` ที่ไม่มี suffix หรือสั่งเก็บของซ้ำ.

### B4. `DEMO_END` — ข้อความภาษาไทยที่แสดงจริง

บรรทัดนี้เป็น **UI surface หลัง `D303-L015`** ไม่ใช่คำพูดตัวเอก/เด็ก ไม่สร้าง Memory/Promise/relationship หรือเหตุการณ์หลังเวลาปิด.

| Draft Ref | Surface / Speaker | ข้อความที่แสดงจริง | Flow |
|---|---|---|---|
| `D3E-L001` | UI / ไม่มี Speaker | จบช่วงทดลองเล่น — วันที่ 1–3 | `DEMO_END/START` |
| `D3E-L002` | UI / ไม่มี Speaker | เรื่องราวในร้านยังดำเนินต่อในวันที่ 4–7 | ต่อ; ไม่รับรองว่าทั้งเจ็ดวันถูกสร้างอยู่ใน build เดโม |
| `D3E-C01-A` | UI ปุ่ม | กลับหน้าหลัก | Exit intentional → main menu; ไม่มี full-game epilogue |

**No fake ending:** ไม่แสดงสรุปว่าครอบครัวเด็กเปลี่ยน, มีคนได้รับความช่วยเหลือนอกร้าน, ทุกคนสนิทกัน หรือทุกคนผ่านบาดแผลแล้ว. ไม่มี Good/Bad/True Ending. `D3E-C01-A` เป็นปุ่มเมนู ไม่ใช่ narrative choice ที่เปลี่ยน GameState.

## C. State, Consequence, Knowledge & Permission Matrix

### C1. Baseline semantic rules

1. `seen`, `told`, `permission` เป็น **คนละชนิดข้อมูล**. ระบุเจ้าของ fact, ผู้รู้, และแหล่งอ้างอิงบรรทัดจริง. ผู้พัฒนารู้ว่าเด็กชายคือกันต์ ไม่เท่ากับ Player ได้ยินชื่อ.
2. No G-01/TSPR values, Trust thresholds, relationship gate, new puzzle, narrative inventory, currency simulation, or auto-disclosure. Story เดินต่อแม้ส้มเงียบ/นัทปฏิเสธคุย/กันต์ไม่บอกชื่อ.
3. กรณีนัท D1 food fact True/False มีผล **เฉพาะ Day 2 `D203-L003T/F`**, Day 3 **ไม่ต้องพึ่ง** fact นี้ในการเดินเรื่อง ไม่สร้างอาหาร/ข้อมูลครอบครัวเพิ่มเพียงเพราะนัทอยากนั่งต่อ.
4. `D301-L002` มีสัญญาณเหตุ (เสียงรถมอเตอร์ไซค์/เสียงคน) ที่ narration แสดงให้อ่านได้แม้ปิดเสียง; ไม่อนุมานอัตลักษณ์คนบนถนน. **ห้าม**ทำ memory ว่าคนนั้นเป็นพ่อของส้ม.
5. กันต์ปัดของบนชั้นตกเป็น **World/Observed Fact** เดียวทุก branch `D303-L002` ก่อน choices; ห้ามนำไปเป็นหลักฐานในข้อกล่าวหาเรื่องอื่น Day 5. การเก็บของเป็นการแก้ผลของเหตุ ไม่ใช่หลักฐานว่าเด็กหายโกรธ/กลายเป็นคนดี.
6. Any material/semantic event commit **ครั้งเดียวต่อ playthrough หลังหลักฐานเกิดจริง**. No re-trigger on double input/re-render; save/restore regression deferred สำหรับ emergency demo แต่ contract G-02/G-03 ยังอยู่. No-replay ของ one-shot audio/FX เมื่อ restore.

### C2. Per-Choice Consequence Matrix — ครบทุกทางเลือก

| Trigger | Immediate Response (exact refs) | Durable Fact / State Meaning | Knowledge Source / Who knows | Permission | Preconditions | Delayed Result | Alternative / Rejoin | One-time / No-Replay | Status |
|---|---|---|---|---|---|---|---|---|---|
| `D301-C01-A` ให้เลือกจุดเก้าอี้ | `D301-L006A` เด็กชี้จุด; `D301-L007A` วางตาม | `seen`: ส้มชี้ตำแหน่งและนั่งพักวันนี้; ไม่มีสัญญาที่นั่งข้ามวัน | ส้มเลือกเอง; Player เห็น | อนุญาตให้จัดเก้าอี้ตามจุดที่ชี้ **ครั้งนี้**; ไม่อนุญาตเผยข้อมูล | หลัง `D301-L005`, ส้มสะดุ้ง | ไม่มี delayed promise ใหม่ | `D301-R01` → D302 | เก้าอี้ move action ไม่ยิงซ้ำเมื่อ runtime restore | EDITORIAL REVIEW ACCEPTED |
| `D301-C01-B` ถามความต้องการหนึ่งครั้ง | `D301-L006B` ขอเก้าอี้; `D301-L007B` วางใกล้ตำแหน่ง | `seen/told`: ขอพักเงียบวันนี้; ไม่มีข้อมูลว่าเสียงชายจากถนนเป็นใคร | ส้มพูดต่อ Player; Player เห็น | ยินยอมให้นำเก้าอี้มาใกล้ ไม่ยอมให้ซักเรื่องบ้าน | หลัง `D301-L005`; ไม่มี repeat inquiry | ไม่มี | `D301-R01` → D302 | อย่า record disclosure/seat promise ที่ไม่มี | EDITORIAL REVIEW ACCEPTED |
| `D302-C01-A` แจ้งเวลาปิด + เงียบ | `D302-L005A–L006A` เด็กนั่ง | scene-local agreed sitting until shortly before close; exit completed in-scene, **no new multi-day promise** | นัทกับ Player ได้ยิน/อยู่ในร้าน | ไม่เกิด Information Permission | นัทขอนั่งต่อ; ร้านเปิด | ไม่มี | `D302-R01` → D303 | No timeout-as-breach; no overnight | EDITORIAL REVIEW ACCEPTED |
| `D302-C01-B` แจ้งเวลา + ชวนคุยคนที่ไว้ใจ | `D302-L005B–L006B` นัทปฏิเสธหัวข้อ | `told`: ไม่ต้องการคุยเรื่องนั้นวันนี้; เหตุนี้ไม่ใช่ข้อมูลบ้าน | นัทพูดกับ Player | ไม่มี permission แชร์/โทร; ไม่สร้าง Promise confidentiality | นัทขอนั่งต่อ; ร้านเปิด | ไม่มี | `D302-R01` → D303 | ไม่สร้าง relationship penalty จากการปฏิเสธ | EDITORIAL REVIEW ACCEPTED |
| `D303-C01-A` ขอบเขต + พักก่อน | `D303-L005A`, `L006A`, `L007A` | `seen`: กันต์ถอย, ผู้เล่นเก็บของสองชิ้น | Player เห็น; กันต์อยู่และได้ยินขอบเขต | ไม่ใช่ permission ด้านร่างกาย/ข้อมูล | **World fact** L002 ของตกจริง | ไม่มีในเดโม; Days 4–7 ไม่เขียนผลใหม่จากฉากนี้ | `D303-R01` → C02 | ห้ามตีตรา / create guilt score; เก็บครั้งเดียว | EDITORIAL REVIEW ACCEPTED |
| `D303-C01-B` ขอบเขต + ช่วยเก็บเมื่อพร้อม | `D303-L005B`, `L006B`, `L007B` | `seen`: กันต์ยอมช่วยเก็บหนึ่งชิ้น, อีกชิ้นถูกเก็บ | Player เห็น; กันต์เลือกตอบรับ | กันต์ตอบรับการช่วยเก็บ **ครั้งนี้**; ไม่ใช่ยินยอมสัมผัสตัว | World fact L002; Player ไม่คว้าแขน | ไม่มีเพิ่ม | `D303-R01` → C02 | ไม่ให้คะแนน skill, no duplicate prop restore | EDITORIAL REVIEW ACCEPTED |
| `D303-C02-A` เปิดช่องให้บอกชื่อ | **`D303-L010A`** กันต์พูด “เรียกผมว่า...กันต์ก็ได้”; `L011A` narrator เรียกชื่อ | **`KAN_NAME_TOLD_D3`** only here; Player รู้ชื่อหลังได้ยิน | กันต์เป็นผู้บอก; Player ได้ยิน | ให้ใช้เรียกเขาในบทต่อไป ไม่ใช่อนุญาตเผยแพร่เรื่องส่วนตัวอื่น | หลัง `D303-R01`; ไม่ขึ้นกับ C01 A/B | Name label later days only if learned; ไม่ invent content Day 4–7 | `D303-R02` → Quiet Close | Commit name once, label after actual line only | EDITORIAL REVIEW ACCEPTED |
| `D303-C02-B` ไม่ถามชื่อ | `D303-L010B–L011B` ไม่มีชื่อ | `KAN_NAME_TOLD_D3` absent; Player ยังไม่รู้ identity | Player เห็นเขาเงียบและได้ยินไปก่อน | ไม่มี | หลัง `D303-R01`; branch ใดก็ได้ | Label unnamed until self-disclosure in later actual story | `D303-R02` → Quiet Close | No phantom name from character registry, Album or dev data | EDITORIAL REVIEW ACCEPTED |

### C3. Unconditional/Conditional Fact Ledger

| Narrative Semantic Reference | Evidence | Type | Who Knows / Provenance | Permission / Boundaries | Expected Narrative Usage | Status |
|---|---|---|---|---|---|---|
| `SOM_STARTLED_BY_PASSING_SOUND_SEEN_D3` | `D301-L002–L003` | `seen` | Player เห็นส้มสะดุ้ง/ได้ยินเสียงรถมอเตอร์ไซค์ผ่าน; ส้มอยู่ในเหตุ | ไม่รู้ตัวบุคคลที่ทำเสียง | ใช้เฉพาะความเข้าใจฉาก; ไม่ map ไป “พ่อ” | EDITORIAL REVIEW ACCEPTED |
| `SOM_USED_CHAIR_D3` | `D301-L006A/B–L012` | `seen` | ส้มเลือก; Player เห็น | การจัดวันนี้ ไม่ใช่ Space Promise สำหรับ Day 6 | Memory ของการใช้ที่นั่งวันนี้ถ้าต้องแสดง; no TSPR | EDITORIAL REVIEW ACCEPTED |
| `NUT_SHORT_STAY_D3` | `D302-L002`, `D302-L005A/B`, `D302-L007–L010` | `told/seen` | นัทถาม/ตอบและออกจริง; Player รู้ | อยู่ได้แค่ช่วงร้านเปิดและจบในฉาก; no disclosure | ไม่เป็น overnight/ไม่เป็น promise cross-day | EDITORIAL REVIEW ACCEPTED |
| `KAN_SHELF_ITEMS_KNOCKED_D3` | `D303-L002–L003` | `seen` / fixed world event | Player เห็นเอง, กันต์อยู่ในเหตุ | ไม่มีสิทธิสัมผัสหรือขอข้อมูลส่วนตัว | แยกเหตุที่เห็นจาก future accusation | EDITORIAL REVIEW ACCEPTED |
| `KAN_CLEANUP_PLAYER_D3` | `D303-L007A` | branch `seen` | Player/กันต์เห็น | ไม่มี | Distinct branch response; no extra reward | EDITORIAL REVIEW ACCEPTED |
| `KAN_CLEANUP_SHARED_D3` | `D303-L006B`, `D303-L007B` | branch `seen` | Player/กันต์เห็น | กันต์เลือกช่วยเอง | Distinct immediate consequence | EDITORIAL REVIEW ACCEPTED |
| `KAN_NAME_TOLD_D3` | **เฉพาะ `D303-L010A`** | `told` | กันต์ → Player | ชื่อที่ยินยอมบอก ไม่อนุญาตเรื่องบ้าน | เปลี่ยน speaker/narration หลัง line; หากไม่มี ให้ unnamed | EDITORIAL REVIEW ACCEPTED |
| `DEMO_D3_COMPLETED` | `D303-L015` → `D3E-L001` | progress boundary | Player เห็นป้ายปิด / UI จบเดโม | ไม่ใช่เนื้อหาว่าชีวิตใครดีขึ้น | End demo only, no epilogue unlock | STRUCTURE APPROVED / TEXT EDITORIAL REVIEW ACCEPTED |

**Scope note:** Semantic references ใน ledger ช่วยให้ 03 ตรวจ semantics; ไม่ใช่คำสั่งให้สร้าง durable flags ทุกอัน. เก็บ fact ถ้ามีการใช้งานจริงตาม `GAME_STATE` และ content-approved continuation; ห้ามสร้าง TSPR deltas/Promise payload เพื่อให้ test ผ่าน. ไม่มีข้อมูลจาก Day 1/2 ย้อนแก้จากการจบ Day 3.

### C4. Knowledge/Permission cases to prevent leakage

| Person / Topic | Player legitimately knows | Player must NOT infer | Permission / Contact |
|---|---|---|---|
| ส้ม | ชื่อ (`D102-L007`), ลูกอมสองเม็ดที่เคยซื้อ, วันนี้สะดุ้งกับเสียงแล้วเลือกเก้าอี้ | ใครอยู่ในรถ, เหตุที่ตกใจ, สถานการณ์พ่อแม่, ว่าซื้อของด้วยเงินไม่พอหมายถึงฐานะครอบครัว | ไม่มีการขอข้อมูลส่วนตัวหรือสิทธิเล่าต่อ; เก้าอี้ในฉากนี้เป็นการช่วยเฉพาะครั้ง |
| นัท | ชื่อ, เคยซื้อของ, D1 food interest **เฉพาะถ้า L005A เคยเล่น**, วันนี้ขอนั่งและไม่อยากคุยเรื่องคนที่ไว้ใจใน branch B | ประวัติบ้าน/ความปลอดภัยหลังออกจากร้าน/อาชีพครอบครัว | ไม่มี disclosure หรือ third-party permission; ไม่โทร/ส่งข้อความ; ไม่มี confidentiality แบบไร้เงื่อนไข |
| กันต์ | เคยเห็นเด็กชายใต้ชายคา D1, เห็นเหตุปัดของ D3; **รู้ชื่อเฉพาะ branch C02-A ที่เจ้าตัวพูด** | ว่าเด็กไม่มีบ้าน, ขโมยของ, เจตนาฝาขวด, หรือผิดข้อกล่าวหาอื่น | ไม่แตะต้องร่างกาย; ไม่บังคับชื่อ/ขอโทษ; ตอบรับช่วยเก็บเฉพาะ branch B |
| มะนาว | ชื่อ, เครื่องเขียน/ยางลบตาม Day 1–2 | เหตุที่ใช้ยางลบเล็ก, ภาระครอบครัว, สมุดวาด/รายละเอียดส่วนตัวที่ยังไม่เปิด | ไม่มีการเปิดสมุดหรือแชร์ข้อมูล |

### C5. One-time effects / No replay / Safe checkpoint candidates

- Narrative durable facts ที่มีความหมายการรู้ (`KAN_NAME_TOLD_D3` ฯลฯ) ให้เกิด **หลัง evidence line แสดงจริง**; `D303-C02-A` เพียงแค่คลิกยังไม่ใช่ evidence ถ้ายังไม่เกิด line L010A.
- กันต์ปัดของตกก่อน C01 ครั้งเดียว (`D303-L002`). `D303-L007A/B` เป็น branch cleanup ครบสองชิ้น; หลัง rejoin ไม่มีการทำของตก/เก็บซ้ำ.
- `DEMO_END` ไม่ replay ฉากปิดเกมเป็น progression เพิ่ม ไม่สร้าง character epilogue หรือ global ending flag. Pause/Skip นำเสนอไม่เปลี่ยน Choice facts.
- Checkpoint **candidates only**: หลัง scene initialized แบบ idle; ก่อน choice C01/C02 ที่รอเลือก; หลัง branch results + domain transaction complete; หลัง Scene End และก่อนเข้าสู่ DEMO_END. 03 เป็นผู้ตรวจ safe semantics ตาม G-02. ห้าม snapshot กลาง transaction/transition หรือ active interaction; ไม่เสนอ save during active puzzle (Demo ไม่มี puzzle).
- Emergency demo: ต้องตรวจ **No Duplicate Domain Effect ภายใน Playthrough** แต่ Production Save/Resume Restore, compatibility และ no-replay after load ถูก defer ตาม 01 (ไม่ใช่ยกเลิก G-02/G-03). การกล่าวว่าผ่านจริงต้องมีผลตรวจ Runtime จาก 03.

## D. Proposed Identity / Content-to-Technical Mapping

04 คง Draft Content Identity; 03 กำหนด Release Stable Line IDs, Ink knot names, EventRegistry IDs, query contract, compiler/validation และ stage mapping. Draft refs `D301/302/303` **ไม่ใช่**การนำ legacy `D1-B` หรือ `D2-A` ฉากรถบาสกลับมาใช้.

| Content Refs (actual) | Scene | Speaker / Type | Narrative Meaning / Rejoin | Technical IDs |
|---|---|---|---|---|
| `D301-L001–L005`, `D301-L006A/B`, `D301-L007A/B`, `D301-L008–L012` | `SC-D3-01` | narrator/ส้ม | เห็นเสียงและเก้าอี้; response A/B; `D301-R01` | UNASSIGNED — 03 |
| `D301-C01-A/B` | `SC-D3-01` | player choices | A ชี้ตำแหน่ง/B ถามความต้องการ; both → R01 | UNASSIGNED — 03 |
| `D302-L001–L004`, `D302-L005A/B`, `D302-L006A/B`, `D302-L007–L010` | `SC-D3-02` | narrator/นัท | เวลา 21:00; branch A/B; `D302-R01` | UNASSIGNED — 03 |
| `D302-C01-A/B` | `SC-D3-02` | player choices | A เงียบ/B เสนอคุย; both → R01 | UNASSIGNED — 03 |
| `D303-L001–L004`, `D303-L005A/B`, `D303-L006A/B`, **`D303-L007A/B`**, `D303-L008–L009`, `D303-L010A/B`, `D303-L011A/B`, `D303-L012–L015` | `SC-D3-03` | narrator/unnamed boy→กันต์ conditionally | observed incident, cleanup, optional name; R01/R02 | UNASSIGNED — 03 |
| `D303-C01-A/B`, `D303-C02-A/B` | `SC-D3-03` | player choices | cleanup choice, then optional asking name; all → quiet close | UNASSIGNED — 03 |
| `D3E-L001–L002`, `D3E-C01-A` | `DEMO_END` | UI text/menu button | after 21:00 scene finished; no narrative state effects | UNASSIGNED — 03 |
| `D301-R01`, `D302-R01`, `D303-R01`, `D303-R02` | Day 3 | **Unrendered rejoin markers** | Branch destinations, **not** readable lines or event IDs | UNASSIGNED — 03 |

**Identity audit:** `D303-L007` ไม่ใช่ actual Line ID; playable variants เท่านั้นคือ `D303-L007A/B`. บรรทัดที่มี suffix `A/B` ไม่ได้บ่งว่ามีเวอร์ชันไม่มี suffix; Demo End refs เป็น UI content ไม่รับรองว่ามี technical implementation. ทุก narrator line ต้องมี stable technical Line ID หากแสดงเป็น readable text; Speaker None ให้ 03 map โดยไม่สร้าง speaker identity ใหม่.

### D1. Narrative Event Meaning — not Registry payload

| Meaning | Supporting evidence | Domain / Presentation interpretation |
|---|---|---|
| เสียงผ่าน + ส้มสะดุ้ง | `D301-L002–L003` | Observed scene, can be presented by text only; optional sound must not be only cue |
| การเลือกตำแหน่งเก้าอี้ | `D301-L006A/B–L007A/B` | Branch-specific world presentation / observed choice, not cross-day promise |
| นัทขออยู่เพิ่มและออกก่อนปิด | `D302-L002`, `D302-L007–L010` | Scene-local boundary respected; no overnight or externally verified result |
| กันต์ปัดของตก | `D303-L002` | Fixed observed world fact; independent of later Choice or unrelated allegation |
| ปฏิกิริยาต่อขอบเขต | `D303-L005A–L007A` / `D303-L005B–L007B` | Branch-specific response, no TSPR deltas authored by 04 |
| กันต์เลือกบอกชื่อ | `D303-L010A` only | Told knowledge; speaker label can update after line; not available on branch B |
| ปิดร้าน/จบเดโม | `D303-L015`, `D3E-L001–L002` | End Day 3 once, UI demo completion, not Full Game Ending |

## E. Runtime & Presentation Handoff — Essential / Optional

**All semantic asset names below are proposed placeholders**; neither final art nor actual manifest/anchor/audio assets are confirmed. `counter`, `shelf`, `bench`, `awning`, `doorway` are proposed named zones for 03/05 to resolve, not pixel anchors or final stage IDs. All essentials may use textual alternatives.

| Scene | Essential for understanding | Placeholder fallback (essential) | Optional embellishment | Speaker / Position / Expression / Sound | Status |
|---|---|---|---|---|---|
| `SC-D3-01` | ร้าน+ชั้นขนม+เก้าอี้; รถมอเตอร์ไซค์ผ่านและเสียงผู้ชายจากถนน **โดยไม่ระบุ identity**; ส้มเลือกวางที่นั่ง; ทุก choice อ่านได้ | `BG_SHOP_AFTERNOON` + labelled “ชั้นขนม/เก้าอี้”; `D301-L002–L003` เป็น text cue; แสดงคำบรรยายการย้ายเก้าอี้เฉพาะ branch | SFX รถมอเตอร์ไซค์ผ่าน, แสงไหว, ส้มสะดุ้งเป็น sprite | ส้มหลัง shelf; position ตาม choice; neutral expression พร้อมบรรยายสะดุ้ง; ไม่มี required audio | EDITORIAL REVIEW ACCEPTED |
| `SC-D3-02` | บริเวณม้านั่ง/ป้ายร้านเปิด; นัทพูด; เวลาปิด **21:00** ใน Choice ทั้งคู่; นัทออกก่อน 20:00 | `BG_SHOP_EVENING`, ข้อความ “เปิด / ปิดสามทุ่ม” และม้านั่ง label; dialogue เป็นหลักฐานเวลา | Ambient ก่อนค่ำ, แสงค่อยลด, เสียงลม | นัท bench near counter; neutral expression, ไม่ใส่ sad face เพื่อระบุ trauma; เสียงไม่จำเป็น | EDITORIAL REVIEW ACCEPTED |
| `SC-D3-03` | ชั้นสินค้า + ของตกสองชิ้นจริง, ชิ้นถูกเก็บครบตาม branch, Speaker เด็กชายไม่ทราบชื่อ→อาจรู้ชื่อ, ป้ายปิด 21:00 และ Quiet Close | `BG_SHOP_EVENING`, generic sprite “เด็กชายที่ชายคา”, props labels “ของบนพื้น 2 ชิ้น”, `D303-L007A/B`; หลัง `D303-L010A` เท่านั้นเปลี่ยน speaker label | ของตก SFX เบา, ท่าถอย/ช่วยเก็บ, เฟดไฟร้าน, ambient คืน | shelf→doorway/awning, neutral/angry only if asset valid; ผู้เล่นรับรู้ anger จาก `D303-L004`; ไม่ต้องใช้ SFX | EDITORIAL REVIEW ACCEPTED |
| `DEMO_END` | ข้อความจบเดโมภาษาไทย, ระบุ Days 4–7 เป็นเรื่องต่อ, ปุ่มกลับหน้าหลัก | UI text `D3E-L001–L002` + `D3E-C01-A`; ไม่ต้องใช้ full-game ending art | เฟดภาพ/เสียงก่อนเปลี่ยนหน้าหลัก | UI only, no NPC speakers or world event | EDITORIAL REVIEW ACCEPTED |

**Essential/optional guard:** หากไม่มี sprite/เสียง/เอฟเฟกต์ ต้องยังเข้าใจ Choice และเหตุการณ์. Sound `D301-L002` ห้ามเป็นเพียง SFX ที่ปิดเสียงแล้วไม่รู้ว่ามีเสียง. กันต์ชื่อใน UI/Album/Backlog ต้องไม่โชว์ล่วงหน้าเพราะ asset filename/id. ส่วน Asset license, naming, format, anchors และ U-01/U-02 อยู่กับ 03/05 ไม่ใช่ 04.

## F. Narrative Test Matrix — Day 3 (expected content paths, **not executed**)

| Test ID | Start / Choice sequence | Expected exact lines / visible reactions | Expected facts / absent facts | Expected next / rejoin | Alternative / no-dead-end | Status |
|---|---|---|---|---|---|---|
| `P3-D3-T01` | หลัง D2 close → D301 A → D302 A → D303 C01 A, C02 B | D301-L002 ระบุเสียงรถมอเตอร์ไซค์ผ่านและเสียงชายจากถนนโดยไม่ทราบตัวตน; D302-L001 ระบุค่ำแล้ว; ส้ม `L006A/L007A`; นัท `L005A/L006A`; เด็กชาย `L005A/L006A/L007A`, `L010B/L011B`; D3E L001–L002 | Som seat today; Nut scene-local stay; Kan incident fixed; **no Kan name** | D301 R01 → D302 R01 → D303 R01/R02 → Demo End | Main Flow ทุกฉากถึงหน้าจบ | EDITORIAL REVIEW ACCEPTED |
| `P3-D3-T02` | D301 C01-A | D301-L002 ระบุเสียงรถมอเตอร์ไซค์ผ่านหน้าร้าน; ส้ม “ขอตรงมุมนี้ได้ไหมคะ หลังชั้นนิดนึง”, ย้ายเก้าอี้ตามชี้ | observed placement only; no family info | `D301-R01` → D302 | ไม่เกิด cross-day seat Promise โดยอัตโนมัติ | EDITORIAL REVIEW ACCEPTED |
| `P3-D3-T03` | D301 C01-B | ส้ม “ขอเก้าอี้ตรงนี้ได้ไหมคะ หนูอยากนั่งเงียบ ๆ”, วางเก้าอี้ใกล้ที่เดิม | no forced disclosure, owner accepted request today | `D301-R01` → D302 | No identity fact about the man whose voice was heard; motorcycle passes without identifying anyone | EDITORIAL REVIEW ACCEPTED |
| `P3-D3-T04` | D302 C01-A | D302-L001 “ค่ำแล้ว นัทกลับมาที่ม้านั่งในร้าน”; นัท L005A/L006A, L007 “จะกลับก่อนร้านปิด” | no Information Permission/overnight | `D302-R01` → D303 | Still exits before 20:00 | EDITORIAL REVIEW ACCEPTED |
| `P3-D3-T05` | D302 C01-B | นัท “วันนี้ยังไม่อยากคุยเรื่องนั้นครับ…”; นั่งได้และออกก่อน 20:00 | no family facts, permission, phone event | `D302-R01` → D303 | Saying no does not block seating | EDITORIAL REVIEW ACCEPTED |
| `P3-D3-T06` | D303 enter, any choices | Narrator L002 “ปัดของบนชั้นตกลงมาสองชิ้น” and L003 on floor | `KAN_SHELF_ITEMS_KNOCKED_D3` observed in all routes | C01 → R01 → C02 → R02 | Incident not conditional on Choice | EDITORIAL REVIEW ACCEPTED |
| `P3-D3-T07` | D303 C01-A | `D303-L005A/L006A/L007A`; Player returns two items, kid gets space | Only observed reaction; no forced apology | R01→C02 | Children not restrained or labelled thief | EDITORIAL REVIEW ACCEPTED |
| `P3-D3-T08` | D303 C01-B | `D303-L005B/L006B/L007B`; boy voluntarily picks up 1, Player handles remaining 1 | observed shared cleanup, not reward | R01→C02 | No duplicate items or fix-score | EDITORIAL REVIEW ACCEPTED |
| `P3-D3-T09` | D303 C02-A after either cleanup | `D303-L010A` “...กันต์ก็ได้”; only then L011A named narration | `KAN_NAME_TOLD_D3` true; Player learned from child's voice | R02→close→D3E | No name earlier; knowledge not inferred from dev metadata | EDITORIAL REVIEW ACCEPTED |
| `P3-D3-T10` | D303 C02-B after either cleanup | `D303-L010B/L011B`; no text “กันต์” in Player-facing lines/Album | `KAN_NAME_TOLD_D3` absent | R02→close→D3E | Unnamed choice still gets complete demo | EDITORIAL REVIEW ACCEPTED |
| `P3-D3-T11` | All 2×2×2×2 = 16 player-choice combinations | Both D301, D302, both Kan C01 and C02 response texts; branch-specific cleanup, same quiet close | No forced trauma disclosure, no threshold | All R01/R02 and Demo End reachable | No orphan branch; all same Days 1–3 end | EDITORIAL REVIEW ACCEPTED |
| `P3-D3-T12` | Check in-game time across Day 3 | Som D301 15:30–18:30; Nut D302 19:00–20:00; Kan D303 20:00–21:00; `D303-L015` at 21:00 | No nighttime residence, no child past closing | `DEMO_END` is post-scene UI, not world action | No Bas, puzzle, phone or overnight | EDITORIAL REVIEW ACCEPTED |
| `P3-D3-T13` | D3E after any path | “จบช่วงทดลองเล่น — วันที่ 1–3” and “เรื่องราวในร้านยังดำเนินต่อในวันที่ 4–7” | no full-game ending or world facts about outcomes | `D3E-C01-A` → main menu | No false final epilogue | EDITORIAL REVIEW ACCEPTED |
| `P3-D3-T14` | D1 nut fact true/false + D2 Som accepted/refused + D3 all routes | D3 lines do not assume food conversation, Som acceptance or family knowledge; no dependency on earlier flags | No retroactive told/permission/Promise added | D3→Demo End on every prior-state variant | Som and Nut can refuse disclosure throughout | EDITORIAL REVIEW ACCEPTED |
| `P3-D3-T15` | Rapid double choice input within same playthrough at D303 C01/C02 | Exactly one chosen branch response; one shelf event / one cleanup / one told name event only in C02-A | No duplicate Domain Effect or early grant from button alone | Proper R01/R02 once | Emergency acceptance independent of Save/Resume | EDITORIAL REVIEW ACCEPTED |

**Deferred production regression, not removed:** `P3-D3-RT01` reload pre/post `KAN_NAME_TOLD_D3` and check correct speaker/Album per save; `RT02` choice checkpoint restores same choice without preselecting; `RT03` restore quiet-close semantic state without replay SFX/domain effects; `RT04` verify D3 exit compatibility with a future approved Day 4 story. **03 owns test execution** once implementation is authorized; emergency demo's deferral of release Save/Resume does not cancel G-02/G-03.

### F1. Completeness / branch truth audit

- **Choice groups:** D301-C01 (2), D302-C01 (2), D303-C01 (2), D303-C02 (2) = **4 groups / 8 option labels**; all four groups encountered once per complete Day 3 run. Independent branches yield **16 complete Day 3 player-choice combinations**.
- **Rejoin:** D301 R01; D302 R01; D303 R01 and R02. No branch ends outside main flow; demo end is intentional terminal UI. `D303-L007A/B` precede R01; neither emits extra cleanup after R01.
- **Name epistemics:** Previous D1 `UNNAMED_BOY_AT_AWNING_SEEN_D1` permits recognizing same appearance but not knowing personal name. **Only** `D303-L010A` yields `KAN_NAME_TOLD_D3`; C02-B stays unnamed. `D303-L011A` may use “กันต์” **after** L010A.
- **Time and story boundaries:** 21:00 is closing action, not time kids remain. No Bas or repair, no phone/outside gameplay, no invented facts about family, no full-game epilogue. All 4 children appeared during first three days even if Kan name remains unlearned.
- **01 final review:** 01 รับรอง Character Voice, เก้าอี้/เวลาไม่เพิ่ม Promise policy, optional name provenance, branch cleanup continuity และ Demo End แล้ว; v0.2 แก้ถ้อยคำเวลานัทและประเภทรถโดยไม่เปลี่ยน Outcome; v0.3 แก้เฉพาะ editorial reference / quoted example.

## G. Final Narrative Consistency Review & 03 Handoff Boundary

**Review status:** `P3-D3-v0.3` — **EDITORIAL REVIEW ACCEPTED / CONTENT READY FOR TECHNICAL HANDOFF (content only)** ตามผลตรวจ Final Narrative Consistency Review ของ 01 และการแก้ Editorial สองจุด. ไม่มี Major Owner Decision Required.

**03 receives for read-only planning (content only):** Approved scene IDs/timing, full Thai readable lines and choice labels, response branches/rejoins, `seen/told/permission` evidence ledger, semantic callback/knowledge guards inherited Day 1–2, content reference mapping, Essential/Optional asset fallback, Demo End exact UI text, and expected narrative tests. 03 จึงทำ technical mapping/implementation planning ตาม authorization ที่ได้รับแยก ไม่สมมุติว่า Draft Ref เป็น Ink/EventRegistry ID.

**Implementation status:** `PLANNING CONFIRMED / IMPLEMENTATION AUTHORIZATION PENDING` — ไม่มีการแก้ Code, Repo, Git, docs Source of Truth, Merge หรือ Deploy จาก Package นี้. ไม่มีการอ้างว่ารัน Vitest/Playwright/Browser tests แล้ว.

**Next:** อ้าง `P3-D3-v0.3` ใน Final Narrative Handoff Index ร่วมกับ Day 1–2; ส่งให้ 03 อ่านเพื่อ Technical Planning/Mapping Review เท่านั้น โดยไม่เริ่ม Implementation เอง.
