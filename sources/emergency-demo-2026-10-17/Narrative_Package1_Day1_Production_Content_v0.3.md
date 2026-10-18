# This House Doesn't Feel Like Home — Package 1: Day 1 Production Content

**ส่งโดย:** 04 — Narrative / Scene Cards → 01 — Architecture & Decisions (Editorial Review/Handoff)  
**วันที่:** 17 ตุลาคม 2026 (ICT)  
**Revision:** `P1-D1-v0.3`  
**อ้างอิง:** `Narrative_Phase1_Scene_Structure_v0.1.md`, Owner Approval 17 Oct 2026, `narrative_map_7_day_Updates.md`, `PROJECT.md`, `GAME_STATE.md`, `NARRATIVE_SYSTEM.md`, `UI_ASSET_SPEC.md`  
**สถานะรวม:** `EDITORIAL REVIEW ACCEPTED — 01 accepted P1-D1-v0.2 with minor corrections; v0.3 applies corrections` · `CONTENT READY FOR TECHNICAL HANDOFF (content only)` · `IMPLEMENTATION AUTHORIZATION PENDING`  
**ขอบเขต:** Day 1 เท่านั้น (`SC-D1-01`, `SC-D1-02`, `SC-D1-03`); ไม่ใช่คำสั่งแก้ Repository, เขียน Ink/TypeScript, Commit หรือ Deploy

**Approval separation:** โครง 9 ฉาก/เวลา/semantic scene identity = `STRUCTURE APPROVED` (Owner). เนื้อหา Day 1 v0.2 ได้รับ `ACCEPT WITH MINOR CORRECTIONS` จาก 01; v0.3 แก้เฉพาะรายการ A–D โดยไม่เปลี่ยน Story Facts, Scene Structure หรือ Outcome สำคัญ จึงใช้ `EDITORIAL REVIEW ACCEPTED` ภายใต้ delegated scope ของ 01. **Proposed Narrative Reference** หมายถึงชื่ออ้างอิงเชิงเนื้อหา ไม่ใช่ความหมายว่าแต่ละบรรทัดต้องขอ Owner Approval ซ้ำ; technical Line/Event IDs และระบบเป็นของ 03. ยังไม่มี Runtime/Build Test หรือ Implementation Authorization.

## Changelog — P1-D1-v0.2 → P1-D1-v0.3

| Ref | Change | Impact |
|---|---|---|
| A / B0 | เพิ่มข้อความ Notice/Prologue ขั้นต่ำและ Boundary สำหรับเริ่มเกม | ไม่มีประวัติใหม่ของตัวเอกหรือข้อกำหนดอายุ; เพิ่ม Draft Refs `D1N-*`, `D1P-*` |
| F / `P1-D1-T10` | แยกการตรวจ no-duplicate ภายใน playthrough จาก production restore tests ที่เลื่อนออก | Emergency acceptance ไม่ใช้ save/resume เป็น release gate; สัญญา G-02/G-03 ยังไม่ถูกลบ |
| C5 | ยืนยันกันต์ไม่บอกชื่อใน Day 1; เตรียม Day 3 ให้บอกได้จากปากตนเองตามการตัดสินใจจริง | ไม่มี `KAN_NAME_TOLD_D1` ทุกเส้น |
| B–F | ตรวจ ref/choice/condition/expected output ทุกทาง; ไม่เปลี่ยนบท Day 1 ที่ 01 รับรอง | 4 จุดเลือก/8 ผลตอบสนอง และทั้งสี่ rejoin คงเดิม |
| Status | ปรับสถานะให้สอดคล้อง delegated editorial authorization | ไม่สร้าง Owner approval gate เพิ่ม |

## B0. Minimum Notice และ Prologue — Thai display text

ข้อความนี้เป็นการเติมตามคำสั่ง Minor Correction B ภายใต้กรอบเดิม **ไม่ใช่ age rating, content advisory policy หรือคำรับรองว่าหน้าข้อมูลช่วยเหลือได้ตรวจแหล่งแล้ว**. เรื่องการกำหนดผู้ชม/Rating และข้อความ Safety Notice ฉบับเผยแพร่สุดท้ายยังต้องดำเนินการตาม P-01/U-03 ที่เกี่ยวข้อง โดยไม่ถือเป็นตัวขวางการตรวจบทเดโมรอบนี้.

| Draft Ref | Speaker / Surface | ข้อความภาษาไทยที่แสดงจริง | Flow / Meaning |
|---|---|---|---|
| `D1N-L001` | Notice / UI (ไม่มี speaker) | เรื่องราวนี้เล่าผ่านบทสนทนา การสังเกต และสิ่งที่คุณเลือกทำในร้านชำแห่งหนึ่ง | เมื่อกดเริ่มเกม |
| `D1N-L002` | Notice / UI (ไม่มี speaker) | คุณสามารถหยุดพักระหว่างเล่นได้จากเมนูเกม | บอกการพักเกมเท่าที่อยู่ใน scope; ไม่รับรอง Save/Resume หรือ Backlog ใน emergency build |
| `D1N-C01-A` | ปุ่ม UI | เริ่มเรื่อง | ปิด Notice → `PROLOGUE/START` |
| `D1P-L001` | ผู้บรรยาย | เสียงบานประตูร้านเลื่อนเปิดรับเช้าวันใหม่ | Prologue เริ่ม; การบรรยายคือสิ่งได้ยิน ไม่ใช่ความคิดในใจผู้เล่น |
| `D1P-L002` | ผู้บรรยาย | แสงเช้าตกลงบนเคาน์เตอร์ ชั้นขนม และชั้นเครื่องเขียน | ต่อ |
| `D1P-L003` | ผู้บรรยาย | ป้ายหน้าร้านถูกพลิกเป็น “เปิด” | ก่อน `SC-D1-01`; ร้านเปิดตามเวลา 06:00 และ SC เริ่มหลัง 06:30 |

**Boundary:** `START → D1N-L001 → D1N-L002 → D1N-C01-A → D1P-L001 → D1P-L002 → D1P-L003 → SC-D1-01`. ส่วน Notice ไม่สร้าง Memory/TSPR/Promise/Permission; Prologue บอกเพียงการเปิดร้านที่เห็นหรือได้ยิน ไม่มีเสียงเล่าภูมิหลังตัวเอกหรือ rating คิดแทนผู้เล่น. บรรทัด L002 สื่อเพียงการพักเกม ไม่รับรอง Save/Resume หรือ Backlog ใน emergency build.

## A. Approved structure และ Day 1 Scene Manifest

### A1. ขอบเขตที่ Frozen แล้ว (`APPROVED`)

- Demo เป็น Day 1–3; ในเดโมมี **มะนาว ส้ม นัท กันต์** เท่านั้น; บาสเริ่ม Day 4; รถ Day 5; กล่องดนตรี Day 7; **ไม่มี Repair Puzzle ในเดโม**
- เจ้าของร้านเป็น Blank Protagonist: ไม่กำหนดเพศ อายุ ความหลัง หรือความคิดตัดสินผู้เล่น; เลือกการกระทำ/คำพูดได้เฉพาะข้อความที่เห็น
- ร้านเปิด 06:00–21:00 ไม่มีการพักค้าง/เหตุการณ์หลังปิดร้าน
- Semantic Scene Identity: `SC-D1-01`, `SC-D1-02`, `SC-D1-03` **APPROVED**; ไม่ใช่ชื่อ Ink knot/Line ID/Event ID ของ 03
- ทุก Choice กลับเข้าทางเดินเรื่องหลักได้ และไม่ต้องรู้เรื่องบ้านหรือมีค่า Trust ถึงเกณฑ์

### A2. Manifest

| Order | Semantic Scene ID | Mapping จาก Narrative Map | เวลาอนุมัติ | ผู้ที่อยู่ในฉาก | Narrative Purpose | Entry | Exit | Choice Branch → Rejoin | Next | Structure Status |
|---:|---|---|---|---|---|---|---|---|---|---|
| 1 | `SC-D1-01` | `D1-A` เฉพาะช่วงมะนาว | Day 1 06:30–07:30 | มะนาว, เจ้าของร้าน | ซื้อเครื่องเขียนและเริ่มรู้จักกันโดยไม่เดาสภาพบ้าน | Notice/Prologue จบ; เริ่ม Day 1 | ซื้อของเสร็จและมะนาวออกจากร้าน | `D101-C01-A/B` → `D101-R01` | `SC-D1-02` | APPROVED |
| 2 | `SC-D1-02` | `D1-A` เฉพาะช่วงส้ม | Day 1 15:30–17:15 | ส้ม, เจ้าของร้าน | ลูกอมสองเม็ดเป็นสิ่งที่เห็น ไม่ใช่ความจริงเรื่องคนรับ | `SC-D1-01` จบ; เปลี่ยนเวลา | ส้มรับลูกอมและออกจากร้าน | `D102-C01-A/B` → `D102-R01` | `SC-D1-03` | APPROVED |
| 3 | `SC-D1-03` | `D1-C` ปรับโดยตัดบาสออก | Day 1 17:15–21:00 | นัท; กันต์อยู่ชายคา; เจ้าของร้าน | ความสนใจอาหารที่นัทเลือกเล่าหรือไม่เล่า, เคารพระยะกันต์, Quiet Close | `SC-D1-02` จบ | จบทั้งสอง Encounter; กันต์ออกจากพื้นที่; ปิดร้าน 21:00 | `D103-C01-A/B` → `D103-R01`; `D103-C02-A/B` → `D103-R02` | Day 1→2→`SC-D2-01` | APPROVED |

**Notice/Prologue Boundary:** `START → D1N-* → D1P-* → SC-D1-01` ตาม B0; ช่วงต้นของฉากเริ่มหลัง Prologue แล้ว. Day 2 เป็นจุดโครงเรื่องที่อนุมัติ; Package 2 เป็นเอกสารเนื้อหาแยกต่างหาก.

**Scene Transition:** `SC-D1-01/END` → time-cut → `SC-D1-02/START` → `SC-D1-02/END` → time-cut → `SC-D1-03/START` → `SC-D1-03/END` → `DAY_1_COMPLETE` → `SC-D2-01/START`. ชื่อ `/START`, `/END`, `DAY_1_COMPLETE` เป็น **content boundary refs** ไม่ใช่ Technical IDs ที่อนุมัติ

## B. บทภาษาไทยพร้อม Choice/Response ครบ — `EDITORIAL REVIEW ACCEPTED`

**รูปแบบ:** `Draft Ref` เป็น identity อ้างอิงข้อความของฝ่าย Narrative เท่านั้น; 03 จะกำหนด Stable Technical Line/Event IDs ใหม่ตาม N-02 โดยรักษา mapping. `ผู้บรรยาย` = ข้อความสังเกตภาพ/การกระทำที่ผู้เล่นเห็น (`speaker:none` ใน Runtime ตามที่ 03 ตัดสิน); ห้ามแปลงเป็นเสียงคิดเจ้าของร้าน. `[แสดงหลัง...]` เป็น **เงื่อนไขสำหรับผู้ทำระบบ ไม่ใช่ข้อความผู้เล่น**. ข้อความในเครื่องหมายอัญประกาศคือข้อความที่แสดงจริง ไม่รวมเครื่องหมายอัญประกาศนอกข้อความ

### B1. `SC-D1-01` — เครื่องเขียนยามเช้า

**Time Window:** 06:30–07:30 · **Place:** เคาน์เตอร์ในร้าน · **จุดเริ่ม:** หลัง Notice/Prologue

| Draft Ref | ผู้พูดที่แสดง | ข้อความ/การเลือกที่แสดงจริง | Flow / เงื่อนไข |
|---|---|---|---|
| `D101-L001` | ผู้บรรยาย | เช้า แสงจากหน้าร้านตกบนชั้นเครื่องเขียนข้างเคาน์เตอร์ | START |
| `D101-L002` | ผู้บรรยาย | เด็กหญิงคนหนึ่งวางดินสอหนึ่งแท่งกับยางลบหนึ่งก้อนลงบนเคาน์เตอร์ | ต่อ |
| `D101-L003` | เด็กหญิง | เอาสองอย่างนี้ค่ะ | ต่อ |
| `D101-L004` | ผู้บรรยาย | เธอขยับดินสอให้ขนานกับยางลบ แล้วรออยู่หน้าเคาน์เตอร์ | เสนอ `D101-C01` |
| `D101-C01-A` | ตัวเลือกผู้เล่น | คิดเงินแล้วส่งของตามที่เลือก | Branch A |
| `D101-L005A` | เด็กหญิง | ขอบคุณค่ะ | หลังเลือก A → `D101-R01` |
| `D101-C01-B` | ตัวเลือกผู้เล่น | ถามว่าอยากดูดินสออีกแบบไหม | Branch B |
| `D101-L005B` | เด็กหญิง | ไม่เป็นไรค่ะ แท่งนี้ก็ได้ | หลังเลือก B → `D101-R01` |
| `D101-R01` / `D101-L006` | ผู้บรรยาย | เด็กหญิงรับดินสอกับยางลบใส่ถุงของตัวเอง | ทั้ง A/B กลับจุดนี้ |
| `D101-L007` | เด็กหญิง | หนูชื่อมะนาวค่ะ ถ้าเจอกันอีกเรียกมะนาวก็ได้ | ได้ยินชื่อจากปากเจ้าตัว; **แสดง Speaker ของบรรทัดนี้เป็น “เด็กหญิง”**, เริ่มใช้ “มะนาว” ตั้งแต่บรรทัดถัดไป |
| `D101-L008` | ผู้บรรยาย | มะนาวหาวสั้น ๆ ก่อนรวบถุงเข้ามาใกล้ตัว | ต่อ; แสดงชื่อใน narration หลัง L007 เท่านั้น |
| `D101-L009` | มะนาว | ไปก่อนนะคะ | ต่อ |
| `D101-L010` | ผู้บรรยาย | มะนาวเดินออกจากร้านพร้อมถุงเครื่องเขียน | `SC-D1-01/END` → `SC-D1-02` |

**Response contrast:** A ได้คำขอบคุณสั้น ๆ; B ได้คำปฏิเสธการดูสินค้าเพิ่มเติมโดยสุภาพ ไม่มีการลงโทษเด็กหรือสร้างข้อมูลส่วนตัว ไม่มีทางใดปิดกั้น Day 2

### B2. `SC-D1-02` — ลูกอมสองเม็ด

**Time Window:** 15:30–17:15 · **Place:** เคาน์เตอร์ · **จุดเริ่ม:** หลัง time-cut จากมะนาว

| Draft Ref | ผู้พูดที่แสดง | ข้อความ/การเลือกที่แสดงจริง | Flow / เงื่อนไข |
|---|---|---|---|
| `D102-L001` | ผู้บรรยาย | แดดบ่ายส่องเข้ามาได้ไม่ถึงชั้นขนมด้านใน | START |
| `D102-L002` | ผู้บรรยาย | เด็กหญิงตัวเล็กยื่นลูกอมสองเม็ดมาบนเคาน์เตอร์ | ต่อ |
| `D102-L003` | เด็กหญิง | สองเม็ดค่ะ | ต่อ |
| `D102-L004` | เด็กหญิง | เม็ดสีแดงกับสีเหลืองนี่น่ากินทั้งคู่เลย | เสนอ `D102-C01` |
| `D102-C01-A` | ตัวเลือกผู้เล่น | ใส่ลูกอมทั้งสองเม็ดในถุงเดียว | Branch A |
| `D102-L005A` | เด็กหญิง | ขอบคุณค่ะ หนูถือเองได้ | หลังเลือก A → `D102-R01` |
| `D102-C01-B` | ตัวเลือกผู้เล่น | ถามว่าชอบลูกอมสีไหนมากกว่า | Branch B |
| `D102-L005B` | เด็กหญิง | สีแดงค่ะ แต่หนูเอาสองเม็ดเหมือนเดิมนะ | หลังเลือก B → `D102-R01` |
| `D102-R01` / `D102-L006` | ผู้บรรยาย | ลูกอมทั้งสองเม็ดอยู่ในถุงใบเล็กที่เธอรับไป | ทั้ง A/B กลับจุดนี้ |
| `D102-L007` | เด็กหญิง | หนูชื่อส้มค่ะ เหมือนชื่อผลไม้เลย | เจ้าตัวบอกชื่อ; จากบรรทัดถัดไปแสดง Speaker “ส้ม” |
| `D102-L008` | ส้ม | วันนี้หนูเลือกเองทั้งสองเม็ดเลย | เรื่องการเลือกซื้อเท่านั้น ไม่ใช่ผู้รับลูกอม |
| `D102-L009` | ผู้บรรยาย | ส้มโบกมือ แล้วเดินออกไปพร้อมถุงลูกอม | `SC-D1-02/END` → `SC-D1-03` |

**สิ่งที่ไม่อนุมาน:** ไม่บอกว่าเม็ดที่สองเป็นของแม่ พ่อ พี่น้อง เพื่อน หรือใคร; ไม่สร้าง fact เกี่ยวกับครอบครัว และไม่ติดเงื่อนไขการเปิดเผยข้อมูลกับการซื้อขนม

### B3. `SC-D1-03` — ของกินกับระยะห่าง / Quiet Close

**Time Window:** 17:15–21:00 · **Place:** เคาน์เตอร์ → ชายคาหน้าร้าน → ปิดร้าน

| Draft Ref | ผู้พูดที่แสดง | ข้อความ/การเลือกที่แสดงจริง | Flow / เงื่อนไข |
|---|---|---|---|
| `D103-L001` | ผู้บรรยาย | ช่วงเย็น ชั้นของกินที่เก็บไว้ได้นานอยู่ใกล้เคาน์เตอร์ | START — Encounter นัท |
| `D103-L002` | ผู้บรรยาย | เด็กชายคนหนึ่งวางของกินสองอย่างบนเคาน์เตอร์ | ต่อ |
| `D103-L003` | เด็กชาย | เอาสองอย่างนี้ครับ | ต่อ |
| `D103-L004` | เด็กชาย | ผมชื่อนัทครับ | ชื่อมาจากเจ้าตัว; บรรทัดนี้ยังใช้ Speaker “เด็กชาย”; จากบรรทัดถัดไปใช้ “นัท” |
| `D103-C01-A` | ตัวเลือกผู้เล่น | ถามนัทว่า ถ้ามีของเท่านี้จะทำอะไรกินดี | Branch A — ชวนคุยเรื่องอาหาร |
| `D103-L005A` | นัท | ผมชอบทำอาหารครับ ชอบคิดว่าของที่มีอยู่เอามาทำอะไรได้บ้าง | **Fact-bearing line** ของ `NUT_FOOD_INTEREST_TOLD_D1` เฉพาะ Branch A |
| `D103-L006A` | นัท | มีไม่กี่อย่างก็ลองคิดเมนูได้ตั้งหลายแบบ | หลัง Branch A → `D103-R01` |
| `D103-C01-B` | ตัวเลือกผู้เล่น | ส่งของให้นัทตามปกติ โดยไม่ชวนคุยต่อ | Branch B — ไม่เกิดบทพูดความชอบอาหาร |
| `D103-L005B` | นัท | ขอบคุณครับ | หลัง Branch B → `D103-R01` |
| `D103-R01` / `D103-L007` | ผู้บรรยาย | นัทรวบของที่ซื้อเข้าถุงแล้วเดินออกจากร้าน | ทั้ง A/B กลับจุดนี้; **ไม่ถือว่า B รู้เรื่องความชอบอาหาร** |
| `D103-L008` | ผู้บรรยาย | อีกครู่หนึ่ง มีเด็กชายอีกคนยืนอยู่ใต้ชายคาหน้าร้าน ห่างจากประตู | Encounter ชายคา; **ห้ามแสดงชื่อ “กันต์”** |
| `D103-L009` | ผู้บรรยาย | ม้านั่งใกล้เขายังว่างอยู่ | เสนอ `D103-C02` |
| `D103-C02-A` | ตัวเลือกผู้เล่น | ปล่อยให้เขาอยู่ตรงนั้นโดยไม่เรียก | Branch A — เคารพระยะ |
| `D103-L010A` | ผู้บรรยาย | เด็กชายมองเข้ามาในร้านครู่หนึ่ง แล้วหันกลับไปทางถนน | หลังเลือก A → `D103-R02`; ไม่มีบทพูดที่สร้างชื่อ |
| `D103-C02-B` | ตัวเลือกผู้เล่น | ถามจากหน้าประตูว่าอยากนั่งที่ม้านั่งไหม | Branch B — เสนอแต่ไม่บังคับ |
| `D103-L010B` | เด็กชายที่ชายคา | ยืนตรงนี้ก็ได้ | หลังเลือก B → `D103-R02`; **ไม่เปิดเผยชื่อ** |
| `D103-R02` / `D103-L011` | ผู้บรรยาย | เด็กชายอยู่ใต้ชายคาอีกพักหนึ่ง ก่อนเดินจากไป | ทั้ง A/B กลับจุดนี้; ไม่บอกว่าเขารับความช่วยเหลือหรือมีปัญหาที่บ้าน |
| `D103-L012` | ผู้บรรยาย | ก่อนสามทุ่ม เคาน์เตอร์กลับมาว่าง ของที่ใช้ระหว่างวันถูกเก็บเข้าที่ | Quiet Close |
| `D103-L013` | ผู้บรรยาย | ใต้ชายคาไม่มีใครอยู่แล้ว | Quiet Close |
| `D103-L014` | ผู้บรรยาย | เมื่อถึงสามทุ่ม ป้ายหน้าร้านถูกพลิกเป็น “ปิด” | `SC-D1-03/END` → Day 1→2 transition |

**หมายเหตุเวลา:** `SC-D1-03` ครอบคลุมช่วงเย็นจนปิดร้าน ไม่ใช่ว่านัทหรือเด็กชายที่ชายคาอยู่ในร้านจนถึง 21:00. ฉากเงียบหลัง Encounter เป็น montage ระหว่างเวลาร้านเปิดเท่านั้น; ไม่มีการกระทำหลังปิดร้าน

**ความหมายของ Choice กันต์:** สองทางต่างกันในสิ่งที่ผู้เล่นทำและปฏิกิริยาที่สังเกตได้ แต่ไม่บังคับให้เขาพูดชื่อ, รับของ, ตอบคำถามส่วนตัว, นั่งหรือเข้าร้าน ไม่มี Space Promise ระยะยาว และไม่อนุมานความรู้สึกจากความเงียบ

## C. State & Consequence Matrix — `EDITORIAL REVIEW ACCEPTED (Narrative Semantics)`

### C1. กติกาบันทึกที่ใช้ในการ Review

- บันทึก **`seen` / `told` / `permission` แยกจากกัน**. Knowledge Source ต้องเกิดในเรื่องจริงและระบุผู้รับรู้; metadata ของผู้เขียนที่รู้ว่าเด็กชายใต้ชายคาคือกันต์ **ไม่ใช่ความรู้ของเจ้าของร้าน**
- เหตุที่เกิดหลัง Choice ให้ Commit หลัง branch ได้รับการประมวลผลครบตาม Runtime Contract; **สำคัญ:** ไม่ commit `NUT_FOOD_INTEREST_TOLD_D1` จากการกด `D103-C01-A` เพียงอย่างเดียว หาก `D103-L005A` ไม่ได้ถูกปล่อยเป็นเนื้อเรื่องจริง
- ไม่กำหนด TSPR numbers/deltas/thresholds, ไม่เพิ่ม Promise, permission grant, เงื่อนไขของอัลบั้มเกี่ยวกับเรื่องส่วนตัว หรือสัญญาเกี่ยวกับคนอื่น
- **No replay:** semantic durable event commit ได้ครั้งเดียวต่อ playthrough ด้วย ledger ที่ 03 เป็นเจ้าของ; ถ้าโหลดกลับมาเห็นบรรทัดเดิมได้โดยไม่เพิ่ม fact ซ้ำ และไม่ยิง one-shot presentation/SFX ซ้ำ

### C2. Choice & Consequence (ทุกทางเลือก)

| Choice / Trigger | Immediate Response | Durable Narrative Fact | Knowledge Source | Permission | Preconditions | Delayed Result | Alternative / Rejoin | One-time Semantics | Status |
|---|---|---|---|---|---|---|---|---|---|
| `D101-C01-A` คิดเงิน | `D101-L005A`: “ขอบคุณค่ะ” | ไม่มี fact เฉพาะทางเลือก | การตอบรับที่ผู้เล่นได้ยิน | ไม่มีสิทธิข้อมูลใหม่ | อยู่ `SC-D1-01`, รอ Choice | ไม่มี | `D101-R01`; ชื่อเปิดเผยใน L007 เหมือนกัน | ไม่ทำธุรกรรม/เสียงตอบรับซ้ำหลัง restore | EDITORIAL REVIEW ACCEPTED |
| `D101-C01-B` ถามดินสอ | `D101-L005B`: “ไม่เป็นไรค่ะ แท่งนี้ก็ได้” | ไม่บันทึกความชอบหรือประวัติที่เด็กไม่ได้เล่า | การตอบรับของมะนาว | ไม่มี | เธอถือสินค้าที่เลือกแล้ว | ไม่มี | `D101-R01`; ไม่กีดกันการซื้อ | ไม่สร้าง flag ปฏิเสธความช่วยเหลือเป็นคะแนน | EDITORIAL REVIEW ACCEPTED |
| `D102-C01-A` ใส่ถุง | `D102-L005A`: “หนูถือเองได้” | ไม่มี fact เฉพาะทางเลือก; เห็นลูกอมสองเม็ดทั้งสองทาง | ผู้เล่นเห็นลูกอมและได้ยินส้ม | ไม่มี | ลูกอมสองเม็ดอยู่บนเคาน์เตอร์ | อาจนำ observation มาใช้วันหลังได้ แต่ยังไม่อนุมัติ callback เพิ่ม | `D102-R01` | การทำซ้ำไม่เพิ่มจำนวนลูกอมใน Memory | EDITORIAL REVIEW ACCEPTED |
| `D102-C01-B` ถามสีที่ชอบ | `D102-L005B`: “สีแดงค่ะ แต่หนูเอาสองเม็ดเหมือนเดิมนะ” | ไม่บันทึกว่าใครจะได้ลูกอมแต่ละเม็ด | คำตอบของส้มต่อผู้เล่น | ไม่มี | ลูกอมสองเม็ดอยู่บนเคาน์เตอร์ | ไม่มีที่อนุมัติเพิ่ม | `D102-R01` | คำตอบเรื่องสีขนมไม่อนุญาตให้อนุมานว่าลูกอมแต่ละเม็ดเป็นของใคร | EDITORIAL REVIEW ACCEPTED |
| `D103-C01-A` ชวนคุยอาหาร | `D103-L005A–L006A`: นัทกล่าวชัดว่าชอบทำอาหารและคิดเมนูจากของที่มี | **`NUT_FOOD_INTEREST_TOLD_D1`** เมื่อ L005A แสดงจริงเท่านั้น | นัทเป็นผู้เล่า; Player ได้ยิน; Nut+Player เป็นผู้รู้ | **ไม่ได้อนุญาตให้บอกผู้อื่น** | คุย Branch A; ไม่มี threshold/Promise | `SC-D2-03` ใช้ True dialogue variant | `D103-R01`; ถ้าไม่มี fact ให้ใช้ False variant เท่านั้น | Commit told fact ครั้งเดียว; callback ไม่ replay เป็น effect เพิ่ม | EDITORIAL REVIEW ACCEPTED |
| `D103-C01-B` ซื้อขายปกติ | `D103-L005B`: “ขอบคุณครับ” | **ไม่สร้าง** `NUT_FOOD_INTEREST_TOLD_D1` | ผู้เล่นเห็นเพียงการซื้อสินค้า | ไม่มี | Branch B; ไม่เคยมีประโยค L005A ใน run นี้ | `SC-D2-03` ใช้ False dialogue variant | `D103-R01`; ไม่มีการลงโทษ | ไม่มีการสร้าง memory เพียงเพราะผู้พัฒนารู้ความชอบของนัท | EDITORIAL REVIEW ACCEPTED |
| `D103-C02-A` เว้นระยะ | `D103-L010A`: เด็กชายมองร้านแล้วหันไปถนน | การเห็นเด็กที่ชายคา (observation ตาม C3), ไม่มีชื่อ | ผู้เล่นมองเห็นโดยตรง | ไม่มี | ม้านั่งว่างและเด็กอยู่ห่างประตู | ไม่มี callback ที่ล็อก | `D103-R02` | ไม่อนุมานว่าเชื่อใจ/กลัว/ยินยอม | EDITORIAL REVIEW ACCEPTED |
| `D103-C02-B` เสนอที่นั่ง | `D103-L010B`: “ยืนตรงนี้ก็ได้” | การเห็นเด็กที่ชายคา; **ไม่**เกิดการรับที่นั่ง/Space Promise | เจ้าตัวบอกว่าขอยืน | ไม่มี | ผู้เล่นถามจากหน้าประตูโดยไม่เข้าประชิด | ไม่มี callback ที่ล็อก | `D103-R02`; ยังเล่นต่อได้ | ไม่ mark ว่าช่วยเหลือสำเร็จหรือเด็กเสียคะแนนจากการปฏิเสธ | EDITORIAL REVIEW ACCEPTED |

### C3. Unconditional observable/told facts (แยกจากผล Choice)

ตารางนี้เป็น **semantic narrative refs ที่เสนอ** ไม่ใช่ Technical Event IDs; ข้อความจริงทั้งหมดยังต้องผ่าน Content Approval.

| Semantic Fact (Proposed) | On-screen Evidence | ชนิด | ใครรู้ / Source | ผลที่ใช้ได้โดยไม่เดา | Approval |
|---|---|---|---|---|---|
| `MANAO_NAME_TOLD_D1` | `D101-L007` “หนูชื่อมะนาวค่ะ…” | `told` | มะนาวบอก Player โดยตรง | หลังบรรทัดนี้เรียก “มะนาว” ได้ | EDITORIAL REVIEW ACCEPTED |
| `SOM_NAME_TOLD_D1` | `D102-L007` “หนูชื่อส้มค่ะ…” | `told` | ส้มบอก Player โดยตรง | หลังบรรทัดนี้เรียก “ส้ม” ได้ | EDITORIAL REVIEW ACCEPTED |
| `SOM_TWO_CANDIES_SEEN_D1` | `D102-L002` และ `D102-L006` | `seen` | Player เห็นลูกอมสองเม็ด | รู้เพียงจำนวน/สิ่งของ ไม่รู้ว่าจะให้ใคร | EDITORIAL REVIEW ACCEPTED |
| `NUT_NAME_TOLD_D1` | `D103-L004` “ผมชื่อนัทครับ” | `told` | นัทบอก Player โดยตรง | หลังบรรทัดนี้เรียก “นัท” ได้ | EDITORIAL REVIEW ACCEPTED |
| `UNNAMED_BOY_AT_AWNING_SEEN_D1` | `D103-L008` | `seen` | Player เห็นเด็กชายอีกคนอยู่ชายคา | ใช้ label “เด็กชายที่ชายคา” เท่านั้น; Dev รู้ว่าเป็นกันต์ได้ แต่ Player ยังไม่รู้ | EDITORIAL REVIEW ACCEPTED |
| `NUT_FOOD_INTEREST_TOLD_D1` | **เฉพาะ** `D103-L005A` | `told` | นัทบอก Player ใน Branch A | Day 2 True variant เฉพาะ run ที่มี fact | EDITORIAL REVIEW ACCEPTED |

**ไม่ได้เกิด:** `KAN_NAME_TOLD_D1`, ข้อมูลครอบครัวเด็ก, ความหมายของลูกอมสองเม็ด, การรับอนุญาตเผยเรื่องอาหารแก่บุคคลอื่น, Promise หรือความสัมพันธ์แบบตัวเลข

### C4. Nut delayed callback: Day 1 → Day 2

| Field | Content Contract ที่เสนอ |
|---|---|
| Trigger | `SC-D1-03` Choice `D103-C01-A` และเรื่องเดินมาถึง `D103-L005A` จริง |
| Immediate result | นัทพูดว่า “ผมชอบทำอาหารครับ ชอบคิดว่าของที่มีอยู่เอามาทำอะไรได้บ้าง” |
| Durable Fact | `NUT_FOOD_INTEREST_TOLD_D1` เป็น **told memory** ของ Playthrough นี้ |
| Knowledge | นัทเป็นผู้พูดและย่อมจำสิ่งที่ตนพูด; Player ได้ยิน; คนอื่นไม่ได้รับรู้โดยอัตโนมัติ |
| Permission | ไม่ได้รับสิทธินำไปบอกแม่/เด็กคนอื่น ไม่กำหนด disclosure permission ใหม่ |
| Preconditions | เฉพาะ Fact นี้ ไม่ใช้ Trust/TSPR/Promise/การซื้อของธรรมดาเป็นเงื่อนไข |
| Day 2 True Preview | นัท: “เมื่อวานคุยเรื่องทำอาหารกัน วันนี้ผมยังคิดอยู่ว่าของบนชั้นจะเอามาทำอะไรได้บ้าง” — **Callback Preview ของ Day 1; ข้อความ Production ให้ถือเอกสาร Package 2 เป็นเจ้าของ** |
| Day 2 False Preview | นัท: “ถ้ามีของกินไม่กี่อย่าง เอามาทำอะไรได้บ้างนะครับ” — ไม่มีคำว่า “เมื่อวาน” หรือการอ้างเรื่องที่ไม่ได้เล่า |
| Alternative | False variant ตามด้านบน; ไม่ใช่ penalized route และไม่สร้างข้อมูลย้อนหลัง |
| One-time | Callback ตอบสนองต่อ fact เดิม ไม่มีการ commit fact ซ้ำเมื่อ restore; runtime ledger/No-replay เป็นของ 03 |
| Status | `EDITORIAL REVIEW ACCEPTED` สำหรับ Day 1 semantics; Day 2 บทเต็มตรวจใน Package 2 |

### C5. วิธีเปิดเผยชื่อกันต์ — Revision A

- **Day 1 เสนอให้ “ยังไม่รู้ชื่อกันต์” ทุกเส้นทาง.** ผู้พัฒนาอ้าง character identity ภายในว่า `kan` ได้ แต่ UI/Backlog/Album ห้ามอ้างว่า Player รู้ชื่อแล้ว การพบเด็กที่ชายคา ≠ การถูกบอกชื่อ
- **แนวทาง Day 3 ที่ 01 ยืนยันแล้ว (`SC-D3-03`, เขียนบทเต็มใน Package 3):** หลังแก้เหตุของตกและเคารพขอบเขต สามารถมีจังหวะ **เด็กเป็นฝ่ายเลือกบอกชื่อเอง** เมื่อมีการทักทายอย่างไม่บังคับ; ถ้าไม่บอก ก็ยังใช้ “เด็กชายที่ชายคา”/“เด็กชาย” และจบเดโมได้เหมือนกัน
- **ชื่อจะปรากฏเมื่อมี `told` evidence จริงเท่านั้น.** แนวคิดนี้ผ่าน editorial direction ของ 01 แล้ว; ข้อความบรรทัดจริงของ Day 3 อยู่ใน Package 3 และไม่เป็นเงื่อนไขผ่านฉาก
- ห้ามใช้การที่คำสั่งผู้พัฒนาระบุตัวละคร “กันต์” เป็นแหล่งข้อมูลสำหรับ Dialogue Speaker หรือ Memory ฝั่งผู้เล่น

## D. Proposed Dialogue Identity Mapping — `EDITORIAL REVIEW ACCEPTED; TECHNICAL IDs NOT ASSIGNED`

### D1. Proposed Content References → Technical Mapping (03 เป็นเจ้าของ)

**เพิ่ม Boundary References:** `D1N-L001–L002` (Notice), `D1N-C01-A` (ปุ่มเริ่ม), `D1P-L001–L003` (Prologue) = proposed content refs สำหรับ 03 mapping เท่านั้น; ไม่ใช่ release Event IDs.

| Ref Family | Scene | Content Kind | Speaker / UI Context | Semantics | Content Status |
|---|---|---|---|---|---|
| `D101-L001..L010`, `D101-L005A/B` | `SC-D1-01` | Thai text lines | ผู้บรรยาย / เด็กหญิง → มะนาว | บทมะนาว; identity หลัง L007 | EDITORIAL REVIEW ACCEPTED |
| `D101-C01-A/B` | `SC-D1-01` | Choice labels | Player-selected action | Branch แล้ว rejoin `D101-R01` | EDITORIAL REVIEW ACCEPTED |
| `D102-L001..L009`, `D102-L005A/B` | `SC-D1-02` | Thai text lines | ผู้บรรยาย / เด็กหญิง → ส้ม | ลูกอมสองเม็ดและชื่อเจ้าตัว | EDITORIAL REVIEW ACCEPTED |
| `D102-C01-A/B` | `SC-D1-02` | Choice labels | Player-selected action | Branch แล้ว rejoin `D102-R01` | EDITORIAL REVIEW ACCEPTED |
| `D103-L001..L014`, `D103-L005A/B`, `D103-L006A`, `D103-L010A/B` | `SC-D1-03` | Thai text lines | ผู้บรรยาย / เด็กชาย → นัท / เด็กชายที่ชายคา | Fact-bearing line L005A; ไม่รู้ชื่อกันต์ | EDITORIAL REVIEW ACCEPTED |
| `D103-C01-A/B` | `SC-D1-03` | Choice labels | Player-selected action | Branch นัท, rejoin `D103-R01` | EDITORIAL REVIEW ACCEPTED |
| `D103-C02-A/B` | `SC-D1-03` | Choice labels | Player-selected action | Branch กันต์, rejoin `D103-R02` | EDITORIAL REVIEW ACCEPTED |
| `D101-R01`, `D102-R01`, `D103-R01`, `D103-R02` | Day 1 | Rejoin markers | **ไม่ใช่ข้อความแสดง/Line IDs** | เป้าหมาย branch | EDITORIAL REVIEW ACCEPTED |

**ข้อสำคัญ:** Ref ที่ขึ้นต้น `D101` ต่างจาก **Original Scene IDs** `D1-A`, `D1-B` ไม่ยกระดับเป็น release Event/Line IDs; 03 เป็นเจ้าของ technical naming, registry payload/domain rules, Ink compiler และ Runtime Contract. ฝ่าย 04 ไม่กำหนด Ink knots, tag, code หรือ TypeScript implementation

### D2. Narrative Event Meaning (ไม่ใช่ Technical Registry)

| Narrative Event Meaning | Content Evidence | Semantics | Content Status |
|---|---|---|---|
| มะนาวเปิดเผยชื่อ | `D101-L007` | told name; label หลังจากนั้นเท่านั้น | EDITORIAL REVIEW ACCEPTED |
| ส้มซื้อลูกอมสองเม็ด | `D102-L002`, `D102-L006` | seen two candies; no recipient | EDITORIAL REVIEW ACCEPTED |
| ส้มเปิดเผยชื่อ | `D102-L007` | told name | EDITORIAL REVIEW ACCEPTED |
| นัทเปิดเผยชื่อ | `D103-L004` | told name | EDITORIAL REVIEW ACCEPTED |
| นัทเล่าความชอบทำอาหาร | `D103-L005A` เท่านั้น | told memory for callback; no permission | EDITORIAL REVIEW ACCEPTED |
| พบเด็กชายที่ชายคา | `D103-L008` | observed unknown identity; never auto-label as Kan | EDITORIAL REVIEW ACCEPTED |
| ปิดร้าน Day 1 | `D103-L014` | end-of-day flow completed, by 21:00 | STRUCTURE APPROVED; TEXT EDITORIAL REVIEW ACCEPTED |

## E. Presentation Handoff — Essential / Optional

**ชื่อในตารางคือ Proposed Semantic Asset IDs** เพื่อการสื่อสาร ไม่ได้ยืนยันว่า asset มีอยู่แล้ว ห้ามใช้เป็น production manifest จน 03/05 ตรวจร่วมกัน ตาม `UI_ASSET_SPEC.md`.

| Scene | Essential (ผู้เล่นต้องเข้าใจแม้ไร้ final assets) | Essential Placeholder Fallback | Optional (ข้ามได้) | Proposed Position / Time | Content Status |
|---|---|---|---|---|---|
| `SC-D1-01` | เคาน์เตอร์, ดินสอ 1, ยางลบ 1, ผู้พูดเด็กหญิง→มะนาว, ตัวเลือกอ่านออก | `BG_SHOP_MORNING` + label “เช้า”; placeholder คน + text “ดินสอและยางลบ”; Speaker label จาก script | แสงเช้า, sprite กะพริบ/หาว, เสียงประตู | เคาน์เตอร์; เช้า | EDITORIAL REVIEW ACCEPTED |
| `SC-D1-02` | เคาน์เตอร์, ลูกอม **สอง** เม็ด, label เด็กหญิง→ส้ม, Choice A/B | `BG_SHOP_AFTERNOON` + text “ลูกอมสองเม็ด”; ถุงใบเล็กด้วย narration | แสงบ่าย, เสียงกระดิ่งประตู, โบกมือ sprite | เคาน์เตอร์; หลังเลิกเรียน | EDITORIAL REVIEW ACCEPTED |
| `SC-D1-03` | ของกินเก็บได้นานอย่างน้อยสองชิ้นใน narration, Speaker เด็กชาย→นัท, แยกพื้นที่ชายคาจากตัวร้าน, label กันต์ **ไม่เปิดเผยชื่อ**, ข้อความปิด 21:00 | `BG_SHOP_EVENING` + placeholder โซน “เคาน์เตอร์” / “ชายคา”; narrator lines L008–L014 ระบุตำแหน่ง/เวลา; Speaker “เด็กชายที่ชายคา” | เสียงจิ้งหรีด, เสียงถุง, เฟดแสง, เสียงพลิกป้าย | นัทอยู่หน้าเคาน์เตอร์, เด็กชายอีกคนอยู่ชายคา; เย็น→21:00 | EDITORIAL REVIEW ACCEPTED |

**Character Expression:** Essential เพียงอ่านชื่อ/label และอากัปกิริยาผ่านข้อความชัดเจน; sprite `neutral` หรือ placeholder ใช้ได้ทุกบรรทัด ไม่ต้องเพิ่ม catalog เพื่ออนุมาน Trust. ท่าหาวมะนาว/โบกมือส้มเป็น Optional. **Audio:** ไม่มี SFX ใดเป็นช่องทางเดียวในการรับรู้ข้อเท็จจริง; ไม่มีเสียงจำเป็นต่อ choice ใน Day 1. **Stage positions:** `counter`, `awning` เป็น semantic zones ที่เสนอ ไม่ใช่ pixel anchors/Stage IDs ที่ล็อก. **Asset ownership:** ไม่กล่าวว่า production art/recorded voice/sound พร้อมใช้งาน

**Checkpoint candidates (03 ตรวจ):** หลัง init scene โดยไม่มี transition active, หลัง transaction เลือกจบ/response ครบ, scene end, day transition ก่อน `SC-D2-01` และช่วงรอ Choice ที่ safe. ไม่อนุมัติ Save Contract ใหม่; ห้าม snapshot กลาง choice/transition, replay SFX หรือ duplicate event ตาม G-02

## F. Day 1 Narrative Test Matrix — `EDITORIAL EXPECTATIONS / NOT RUNTIME-TESTED`

ทุก test เป็น **Narrative Acceptance Paths ของเนื้อหาที่เสนอ** ไม่ใช่หลักฐานว่ารัน Vitest/Playwright แล้ว; 03 เป็นผู้กำหนด automated tests หลัง Owner Content Approval และ Implementation Authorization

| Test ID | Starting Point / Choices or Preconditions | Expected Dialogue / Reaction | Expected Durable Fact | Expected Next / Rejoin | Expected Absent Case | Status |
|---|---|---|---|---|---|---|
| `P1-D1-T01` | START→Notice/Prologue→Day 1; A ทุก Choice | มะนาว “ขอบคุณค่ะ”; ส้ม “หนูถือเองได้”; นัท “ผมชอบทำอาหารครับ…”; ชายคามีปฏิกิริยาเงียบ; ปิดร้านสามทุ่ม | ชื่อ มะนาว/ส้ม/นัท; seen ลูกอม/เด็กชาย; Nut food told = true | `SC-D1-01`→`02`→`03`→`SC-D2-01` | ไม่มีบาส/รถ/repair | EDITORIAL REVIEW ACCEPTED |
| `P1-D1-T02` | `SC-D1-01`, เลือก A | `D101-L005A` ขอบคุณ | ไม่ต้องมี choice-specific fact | `D101-R01`→Scene 02 | ไม่มี forced talk | EDITORIAL REVIEW ACCEPTED |
| `P1-D1-T03` | `SC-D1-01`, เลือก B | `D101-L005B` ปฏิเสธดูดินสออีกแบบ | ไม่สร้างความชอบ/ปัญหาโรงเรียนที่ไม่เล่า | `D101-R01`→Scene 02 | ไม่ขวาง progression | EDITORIAL REVIEW ACCEPTED |
| `P1-D1-T04` | `SC-D1-02`, เลือก A / B (รันแยก) | A = “หนูถือเองได้”; B = “หนูเอาสองเม็ดเหมือนเดิมนะ” | `SOM_TWO_CANDIES_SEEN_D1` ทั้งคู่; ไม่มีผู้รับลูกอม | `D102-R01`→Scene 03 | ไม่มี fact ว่าให้แม่/คนอื่น | EDITORIAL REVIEW ACCEPTED |
| `P1-D1-T05` | `SC-D1-03`, Nut Choice A | `D103-L005A–L006A` เป็นคำบอกเล่าจากนัทจริง | `NUT_FOOD_INTEREST_TOLD_D1` = present, source L005A, knownBy Nut+Player | `D103-R01`→ชายคา→Day 2 | Day 2 True variant ตาม Package 2; ไม่มี Trust/Promise ใหม่ | EDITORIAL REVIEW ACCEPTED |
| `P1-D1-T06` | `SC-D1-03`, Nut Choice B | `D103-L005B` ขอบคุณ; **ไม่**มี L005A | `NUT_FOOD_INTEREST_TOLD_D1` = absent | `D103-R01`→Day 2 | Day 2 False variant ตาม Package 2 ไม่มี “เมื่อวานคุย” | EDITORIAL REVIEW ACCEPTED |
| `P1-D1-T07` | `SC-D1-03`, Kan Choice A | `D103-L010A` ผู้บรรยายสังเกตท่าทาง | `UNNAMED_BOY_AT_AWNING_SEEN_D1`, **ไม่มี Kan name** | `D103-R02`→Quiet Close | ไม่มีการสรุปความกลัว/Trust | EDITORIAL REVIEW ACCEPTED |
| `P1-D1-T08` | `SC-D1-03`, Kan Choice B | `D103-L010B` “ยืนตรงนี้ก็ได้” | `UNNAMED_BOY_AT_AWNING_SEEN_D1`, ไม่มี seat accepted/Promise/name | `D103-R02`→Quiet Close | ไม่ปิดกั้นทางไปต่อจากการปฏิเสธ | EDITORIAL REVIEW ACCEPTED |
| `P1-D1-T09` | ทุกเส้นทาง ก่อน `D103-L008` | Speaker นัทแสดงหลัง `D103-L004`; ส้มหลัง `D102-L007`; มะนาวหลัง `D101-L007` | 3 told-name facts จากบทจริงเท่านั้น | ตามฉาก | ห้าม Label “กันต์” / Kan Album name known | EDITORIAL REVIEW ACCEPTED |
| `P1-D1-T10` | ใน playthrough เดียว เลือกนัท A แล้วตรวจ semantic event ที่ L005A; เดินผ่านจุดนี้ครั้งเดียวตาม main flow (รวมการกดปุ่มซ้ำที่จุดเลือกถ้า runtime รองรับการทดสอบ) | L005A แสดงเฉพาะ Branch A; ไม่มีการกดเลือกซ้ำสร้างการเล่าใหม่ | `NUT_FOOD_INTEREST_TOLD_D1` เป็น told fact เพียงหนึ่ง occurrence / one committed event ต่อ playthrough; branch B ไม่มี fact | ไป `D103-R01` แล้ว `SC-D2-01` | ไม่มี duplicate domain effect / no phantom fact ระหว่าง playthrough | EDITORIAL REVIEW ACCEPTED |
| `P1-D1-T11` | รวมทุก 8 Choice branches | ทุกทางเลือกมี response ที่ระบุ, rejoin `R01/R02` ไม่ติด dead end | เฉพาะ evidence จริงในแต่ละ branch | Day 2 reachable ทุกเส้น | ไม่มี Branch ภาคบังคับ disclosure | EDITORIAL REVIEW ACCEPTED |
| `P1-D1-T12` | End `D103-L014` | ป้าย “ปิด” เมื่อถึง 21:00; เด็กชายไปก่อน | Day 1 completed once | Day 2 เช้า `SC-D2-01` | ไม่เกิดฉากหลัง 21:00, overnight stay, Bas, car or puzzle | EDITORIAL REVIEW ACCEPTED |
| `P1-D1-T13` | START→Notice และปุ่ม `D1N-C01-A`→Prologue | `D1N-L001–L002`, `D1P-L001–L003` ตรงข้อความ B0; Scene เริ่มหลังป้ายเปิด | ไม่มี told/permission/promise จาก Notice/Prologue | `SC-D1-01` | ไม่มี backstory/age rating/required save | EDITORIAL REVIEW ACCEPTED |

### F1. Traceability mini-check (สำหรับ 01 และ 03 เมื่อได้รับ Implementation Authorization)

| Review Point | Evidence in Package | ผล |
|---|---|---|
| Manifest + boundary ครบ | A1/A2 และ B0 | 01 รับรองโครง; เพิ่มข้อความ Notice/Prologue ขั้นต่ำ |
| Choices และ Immediate Responses ครบ | B1–B3 | 4 Choice Groups × 2 branches = 8 responses |
| ทุก Branch มี Rejoin/Next | A2, B1–B3, F | 4 rejoins, 3 scene exits |
| วัน 1 รู้/ไม่รู้ชื่อใคร | B1–B3, C3/C5 | รู้มะนาว/ส้ม/นัทหลังได้ยิน; ยังไม่รู้กันต์ |
| Callback Day1→Day2 True/False | C2/C4, T05/T06; Package 2 §B3/C3 | Day 1 direction ผ่าน 01 แล้ว; Day 2 lines อยู่ใน P2-D2-v0.1 รอ 01 Review |
| no guessed facts/permission | C1–C5 | ไม่มีข้อมูลบ้าน ลูกอมเพื่อใคร หรือสิทธิแชร์อาหาร |
| Presentation fallback | E | ไม่ขึ้นกับ final art, expression, sound |
| Content status แยก | Header + ทุก section | โครง Approved, Day 1 Editorial Review Accepted, Implementation Pending |

## G. Editorial Completion และส่งต่อ

- **STRUCTURE APPROVED:** โครง Scene, เวลา, ลำดับ, semantic identity ตาม Owner.
- **EDITORIAL REVIEW ACCEPTED:** 01 ตรวจ `P1-D1-v0.2` แล้วและระบุ minor corrections; v0.3 อัปเดตเฉพาะรายการที่ระบุ ไม่เปลี่ยนข้อเท็จจริงหรือ Outcome สำคัญ.
- **CONTENT READY FOR TECHNICAL HANDOFF (content only):** ต้นฉบับบท D1 พร้อมให้ 03 ตรวจ mapping ในเชิงแผนหลัง 01 รับไฟล์ v0.3; ชื่ออ้างอิงยังไม่ใช่ Event/Line ID จริง.
- **IMPLEMENTATION AUTHORIZATION PENDING:** ห้าม Codex แก้ source/docs/config/repo หรือ deploy. **ไม่มี**การอ้างว่า compile, runtime, Save/Resume, UI, browser, build ผ่าน.

### Emergency demo vs deferred production tests

**Emergency narrative acceptance:** `P1-D1-T01–T09`, `T10` (in-playthrough no duplicate), `T11–T13` ครอบ flow/facts/knowledge/เวลา/Notice. การตรวจ no duplicate สำคัญยังคงอยู่ แม้ระบบ save/resume จะ defer.

**Deferred production regression (ไม่ใช่ emergency acceptance blocker):** `P1-D1-RT01` Restore ก่อน/หลัง fact line และตรวจไม่ commit memory/event ซ้ำ; `P1-D1-RT02` Safe checkpoint/choice restore ไม่เลือกแทนและไม่ replay SFX; `P1-D1-RT03` ความรู้/permissions/backlog ไม่ไหลข้าม slots/playthrough และ global read lines รักษา scope ตาม G-03. **03 รับผิดชอบ verification เมื่อ implementation ได้รับอนุญาต**; การ defer ไม่ได้ยกเลิก G-02/G-03 contract.

### 01 Editorial Handoff Summary

**No Major Owner Decision Required** — Day 1 แก้ตามขอบเขตของ 01 แล้ว. Notice B0 เป็นข้อความเริ่มเกมขั้นต่ำ ไม่กำหนด age rating/content-safety policy และไม่ตั้งนโยบายข้อมูลใหม่. Package 2 Day 2 จัดแยกเพื่อรับ Narrative/Technical Handoff Review โดย 01 ตาม Rolling Workflow; Package 3 จึงตามหลัง review Day 2.
