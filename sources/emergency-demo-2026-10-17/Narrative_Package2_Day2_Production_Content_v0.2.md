# This House Doesn't Feel Like Home — Package 2: Day 2 Production Content

**From / To:** 04 — Narrative / Scene Cards → 01 — Architecture & Decisions (Narrative and Technical Handoff Review)  
**Date:** 17 October 2026 (ICT)  
**Revision:** `P2-D2-v0.2`  
**Status:** `STRUCTURE APPROVED` / `EDITORIAL REVIEW ACCEPTED — 01 accepted P2-D2-v0.1 with minor corrections; v0.2 applies corrections` / `CONTENT READY FOR TECHNICAL HANDOFF (content only)` / `IMPLEMENTATION AUTHORIZATION PENDING`  
**Scope:** เฉพาะ `SC-D2-01`, `SC-D2-02`, `SC-D2-03`; บท Day 1 อ้าง `P1-D1-v0.3`  
**Authority:** Owner Frozen Scene Structure + 01 Narrative Workflow Update 17 Oct 2026, Narrative Map ฉบับ Updates ในส่วนที่ไม่ขัดกัน, `GAME_STATE.md`, `NARRATIVE_SYSTEM.md`, `UI_ASSET_SPEC.md`.  
**Important:** 01 ยอมรับเนื้อหา `P2-D2-v0.1` แบบ minor corrections; v0.2 ปรับเฉพาะถ้อยคำ Choice, prop continuity, test และ refs โดยไม่เปลี่ยน Story Facts/Outcomes สำคัญ จึงถือเป็น `EDITORIAL REVIEW ACCEPTED` ภายใต้ delegated scope ของ 01. ยังไม่ใช่การอนุญาต Implement; ไม่มีการแก้ Source of Truth/Repository และไม่มีผลทดสอบจาก Runtime.

## 0. Changelog — `P2-D2-v0.1` → `P2-D2-v0.2`

| จุดแก้ | รายการ | ผลต่อ Narrative |
|---|---|---|
| `P2-D2-T10` | เปลี่ยน expected time: เช้ามะนาว 06:30–07:30, ส้ม 15:30–17:00, นัท 17:00–21:00 | Test ตรง Approved Manifest ไม่มีการเปลี่ยนฉาก |
| `D202-C01-B`, `D202-C02-A/B` | ชี้ว่าผู้เล่นเพียง **เสนอ/อธิบาย** ส่วนอาหาร โดยส้มเป็นผู้ตัดสินใจรับหรือไม่รับด้วยตัวเอง | รักษาสาม complete paths และผลรับ/ไม่รับเดิม |
| `D202-L007P`, `D202-L007A`, `D202-L007N` | แยกบรรยาย prop ระหว่างรับอาหารพร้อมซื้อลูกอม กับเส้นที่ไม่มีอาหารส่วนแบ่ง แล้วกลับ `D202-R01` | ไม่เพิ่มราคา/Inventory/หนี้หรือ delayed consequence |
| State/Presentation/Test audit | ซิงก์ conditional refs, branch destinations, test expectations และ status ให้ตรงบท v0.2 | ไม่มี Story Facts หรือ Outcomes สำคัญเปลี่ยน |

**ไม่มี Major Owner Decision Required — ดำเนินการต่อภายใต้ Approved Narrative Scope.**

## 0A. Editorial summary และ change record

- เขียน Day 2 ครบสามฉากตามเวลาและลำดับที่ Owner อนุมัติ โดยใช้การย้ายมะนาวไปช่วงเช้าเป็น **Owner-approved Timing Adaptation** ไม่อ้างว่า Scene Map ต้นฉบับกำหนดเวลาเช้า Day 2 เช่นนี้ทุกประการ.
- ออกแบบทางเลือกของส้มให้มีทั้ง (a) จัดของภายในงบโดยไม่ขอความช่วยเหลือ (b) เสนอส่วนอาหารที่ร้านแบ่งให้แล้วส้ม **รับ** และ (c) เสนอแล้วส้ม **ไม่รับ**; ทั้งสามผลปรากฏเป็นบทจริงและกลับเส้นเรื่องเดียวกัน. **ไม่เพิ่ม inventory, ราคา, หนี้, credit/loan system**.
- ทำ Nut D1→D2 callback แบบ `TRUE`/`FALSE` โดยตรวจว่ารันนี้มี **`NUT_FOOD_INTEREST_TOLD_D1`** จาก `P1-D1-v0.3` / `D103-L005A` จริงหรือไม่. ไม่ใช้ Trust/TSPR/Promise, ไม่เดาอดีตหรือความสัมพันธ์ในครอบครัว.
- **No Major Owner Decision Required.** 01 ตรวจและรับรอง Day 2 v0.1 แล้วในหลักการ และให้แก้ minor items ที่ดำเนินการใน v0.2 นี้; ยังรอ Technical Mapping และ Implementation Authorization แยกจาก editorial.

## A. Frozen structure และ scene manifest

### A1. Approved boundaries

`SC-D1-03/END → DAY_1_TO_DAY_2 → SC-D2-01 → SC-D2-02 → SC-D2-03 → DAY_2_TO_DAY_3 → SC-D3-01`.

`DAY_1_TO_DAY_2`, `DAY_2_TO_DAY_3`, `/START`, `/END`, `R01` เป็น content-flow references เท่านั้น ไม่ใช่ release Ink/Event IDs. 03 เป็นเจ้าของ technical mapping.

| Order | Semantic ID / Original Mapping | Approved Window | Characters / Narrative Purpose | Entry and Conditions | Exit Boundary | Branches → Rejoin | Next Scene | Status |
|---:|---|---|---|---|---|---|---|---|
| 4 | `SC-D2-01` / `D2-C` มะนาว segment | D2 06:30–07:30 | มะนาว: ยางลบก้อนเล็กและการเลือกของเอง | Day 1 ปิดแล้ว; มะนาวบอกชื่อใน `D101-L007` เมื่อ Day 1 | มะนาวสิ้นสุดการดู/ซื้อเครื่องเขียน | `D201-C01-A/B` → `D201-R01` | `SC-D2-02` | STRUCTURE APPROVED |
| 5 | `SC-D2-02` / `D2-B` ส้ม segment | D2 15:30–17:00 | ส้ม: ของที่ซื้อพร้อมกันไม่ได้และสิทธิรับ/ปฏิเสธส่วนอาหารที่แบ่งให้ | `SC-D2-01/END`; ส้มเคยบอกชื่อใน `D102-L007` | ส้มเลือกของเสร็จและออกจากร้าน | `D202-C01-A` → `D202-L007P` → `D202-R01`; `D202-C01-B` → `D202-C02-A` → `D202-L007A` → `D202-R01` หรือ `D202-C02-B` → `D202-L007N` → `D202-R01` | `SC-D2-03` | STRUCTURE APPROVED |
| 6 | `SC-D2-03` / `D2-C` นัท/Quiet Close | D2 17:00–21:00 | นัท: food callback แบบสองกรณีและภาพปิดวัน | `SC-D2-02/END`; query D1 `told` fact ก่อนแสดง conditional line | นัทออกจากร้านก่อน 21:00; ร้านปิด 21:00 | `D203-L003T` **หรือ** `D203-L003F` → `D203-R00`; `D203-C01-A/B` → `D203-R01` | Day 2→`SC-D3-01` | STRUCTURE APPROVED |

**Entry assumption guard:** หากใน Technical Fixture สำหรับ dev ไม่มี D1 progress/facts ให้ถือว่าใช้เพื่อทดสอบแยกเท่านั้น; Production Day 2 ต้องได้รับ state จาก Day 1 จริง. ไม่ตั้งค่า D1 fact เป็น true/false ผ่าน character bio, “first meeting”, คะแนน หรือ Dev default ที่แต่งขึ้น.

### A2. Day 2 short scene cards

**`SC-D2-01` — ยางลบก้อนเล็ก:** มะนาวถือยางลบเก่าก้อนเล็กมากจากกระเป๋าไว้ เทียบกับก้อนบนชั้น. **ไม่พูด** ว่าเป็นก้อนที่ซื้อเมื่อวาน เพราะ `SC-D1-01` ระบุว่าเธอซื้อยางลบใหม่และเราไม่รู้ว่าเธอใช้ก้อนไหนอยู่. ข้อเลือกชวนดูตัวเลือกอย่างเป็นธรรมชาติ ไม่บังคับคำอธิบายเรื่องเรียนหรือบ้าน.

**`SC-D2-02` — เลือกเท่าที่มี:** ส้มต้องเอาลูกอมออกเพราะเงินไม่พอซื้อของกินและลูกอมทั้งหมด. Player เลือกแสดงทางที่ซื้อได้ หรือเสนอส่วนอาหารที่แบ่งให้ได้โดยไม่ถามข้อมูลส่วนตัว. หากเสนอ เด็กเลือกตอบรับหรือไม่รับได้ตามบทของ branch นั้น; ไม่ใช้ความช่วยเหลือเป็นกับดักให้เล่าเรื่องบ้านหรือสร้างหนี้.

**`SC-D2-03` — เรื่องที่คุยไว้ / Quiet Close:** สำหรับผู้เล่นที่เคยได้ยินนัทเล่าเรื่องทำอาหารจริง นัทอ้าง “เมื่อวานที่คุยกัน”. สำหรับผู้เล่นที่ไม่ได้ฟัง เขาซื้อของตามปกติและพูดหัวข้อปัจจุบันเท่านั้น. ทั้งสองเงื่อนไขใช้ choice ทั่วไปเหมือนกันและจบด้วยป้ายปิดตอนสามทุ่ม.

## B. Complete Thai Production Dialogue & Choices

**Reading rule:** ช่อง **ข้อความจริง** คือข้อความที่ผู้เล่นเห็น ไม่รวม refs/condition/คำว่า TRUE/FALSE. `ผู้บรรยาย` หมายถึงสิ่งสังเกตได้ ไม่ใช่ความคิดในใจ Blank Protagonist. `D201-R01` เป็นต้นเป็น **unrendered branch destinations**; `C` เป็นข้อความ Action Choice ของผู้เล่น; 03 mapping เป็น technical stable IDs อีกครั้ง.

### B1. `SC-D2-01` — ยางลบก้อนเล็ก (06:30–07:30)

| Draft Ref | Speaker | ข้อความจริง / Choice Text | Entry / Branch / Next |
|---|---|---|---|
| `D201-L001` | ผู้บรรยาย | เช้าวันต่อมา มะนาวหยุดอยู่หน้าชั้นเครื่องเขียน | `SC-D2-01/START` |
| `D201-L002` | ผู้บรรยาย | ในมือเธอมียางลบก้อนหนึ่งเล็กเท่าปลายนิ้ว | ต่อ; สังเกตได้แค่ขนาดและของในมือ |
| `D201-L003` | มะนาว | สวัสดีค่ะ ขอดูยางลบตรงนี้หน่อยได้ไหมคะ | ต่อ |
| `D201-L004` | ผู้บรรยาย | เธอมองยางลบที่เรียงอยู่ แล้วหันกลับมารอคำตอบ | `D201-C01` |
| `D201-C01-A` | ตัวเลือกผู้เล่น | หยิบยางลบให้มะนาวเลือก | Branch A |
| `D201-L005A` | มะนาว | ขอบคุณค่ะ ขอเลือกอันที่จับถนัดมือหน่อยนะคะ | → `D201-R01` |
| `D201-C01-B` | ตัวเลือกผู้เล่น | บอกว่ามีเครื่องเขียนอย่างอื่นให้ดูด้วย ถ้าอยากดู | Branch B |
| `D201-L005B` | มะนาว | วันนี้หนูดูยางลบก่อนค่ะ | → `D201-R01`; รับการปฏิเสธ |
| `D201-R01` / `D201-L006` | ผู้บรรยาย | มะนาวเลือกยางลบก้อนหนึ่งจากชั้นแล้ววางไว้บนเคาน์เตอร์ | Rejoin ทั้ง A/B |
| `D201-L007` | มะนาว | เอาก้อนนี้ค่ะ | ต่อ |
| `D201-L008` | ผู้บรรยาย | เธอรับของแล้วเก็บยางลบก้อนเล็กในมือเข้ากระเป๋า | ต่อ; ไม่อธิบายว่าทำไมยังเก็บก้อนเก่า |
| `D201-L009` | มะนาว | ไปก่อนนะคะ | ต่อ |
| `D201-L010` | ผู้บรรยาย | มะนาวเดินออกไป ทางเดินหน้าร้านกลับมาเงียบอีกครั้ง | `SC-D2-01/END` → `SC-D2-02` |

**Response contrast:** A มะนาวขอเลือกเองโดยตรง; B เธอปฏิเสธของเพิ่มเติมอย่างสุภาพ. ไม่มีการเสนอให้เปิดเผยเหตุใช้ยางลบจนเล็กและไม่มีความสัมพันธ์เชิงคะแนน.

### B2. `SC-D2-02` — ของที่เงินยังไม่พอ (15:30–17:00)

| Draft Ref | Speaker | ข้อความจริง / Choice Text | Entry / Branch / Next |
|---|---|---|---|
| `D202-L001` | ผู้บรรยาย | หลังเลิกเรียน ส้มวางของกินกับลูกอมลงบนเคาน์เตอร์ | `SC-D2-02/START` |
| `D202-L002` | ส้ม | หนูเอาอันนี้ด้วยค่ะ | ต่อ |
| `D202-L003` | ผู้บรรยาย | ส้มแบเหรียญในมือ นับเงียบ ๆ แล้วมองของบนเคาน์เตอร์ | ต่อ; ไม่กำหนดจำนวนเหรียญหรือราคา |
| `D202-L004` | ส้ม | เงินหนูไม่พอซื้อทั้งหมด งั้น...เอาลูกอมออกก่อนก็ได้ค่ะ | `D202-C01` |
| `D202-C01-A` | ตัวเลือกผู้เล่น | บอกให้ส้มเลือกของที่ซื้อได้ในเงินที่มี | Branch A — ทางเลือกในงบ |
| `D202-L005A` | ส้ม | ถ้างั้นเอาของกินก่อนค่ะ ลูกอมไว้วันอื่นก็ได้ | → `D202-L007P`; ไม่มีข้อเสนออาหารฟรี |
| `D202-L007P` | ผู้บรรยาย | ส้มเลือกถือของกินที่ซื้อไหวไว้ ลูกอมยังอยู่บนเคาน์เตอร์ | เฉพาะ C01-A; ไม่เคยเสนออาหารส่วนแบ่ง → `D202-R01` |
| `D202-C01-B` | ตัวเลือกผู้เล่น | บอกส้มว่าร้านแบ่งอาหารส่วนเล็ก ๆ ให้ได้ ถ้าอยากรับก็รับได้ ไม่ต้องบอกเหตุผล | Branch B — เสนอความช่วยเหลือ |
| `D202-L005B` | ส้ม | หนูเลือกได้จริง ๆ เหรอคะ | เฉพาะ B → `D202-C02` |
| `D202-C02-A` | ตัวเลือกผู้เล่น | ย้ำว่าเป็นทางเลือกของส้ม และไม่มีข้อแลกเปลี่ยน | Branch B→A (รับ) |
| `D202-L006A` | ส้ม | งั้นหนูรับอาหารส่วนนี้ค่ะ แล้วซื้อลูกอมด้วยเงินหนูเอง | ส้มรับข้อเสนอ; → `D202-L007A` |
| `D202-L007A` | ผู้บรรยาย | ส้มรับอาหารส่วนที่ร้านแบ่งให้ แล้วหยิบลูกอมที่วางคืนไว้บนเคาน์เตอร์มาซื้อด้วยเงินตัวเอง ก่อนเก็บทั้งสองอย่างลงถุง | เฉพาะ B→A; **ได้รับอาหารจริงเพียงทางนี้** → `D202-R01` |
| `D202-C02-B` | ตัวเลือกผู้เล่น | อธิบายว่าปฏิเสธส่วนอาหารได้ และยังเลือกซื้อเท่าที่มีเงินได้ | Branch B→B (ไม่รับ) |
| `D202-L006B` | ส้ม | งั้นหนูไม่รับส่วนที่แบ่งให้ค่ะ หนูเอาแค่ของกินที่ซื้อไหว | ส้มปฏิเสธข้อเสนอ; → `D202-L007N` |
| `D202-L007N` | ผู้บรรยาย | ส้มไม่รับอาหารส่วนที่ร้านเสนอให้ และเก็บเฉพาะของกินที่ซื้อไหวลงถุง | เฉพาะ B→B; **ไม่ได้รับของแจก** → `D202-R01` |
| `D202-R01` / `D202-L008` | ผู้บรรยาย | ส้มจัดของที่เลือกไว้ในถุงของตัวเองจนเรียบร้อย | Rejoin A / B→A / B→B; ไม่ยืนยันจำนวนหรือชนิดอาหารเพิ่ม |
| `D202-L009` | ส้ม | ขอบคุณค่ะ | ต่อ |
| `D202-L010` | ผู้บรรยาย | ส้มยกถุงขึ้นแล้วเดินออกจากร้าน | `SC-D2-02/END` → `SC-D2-03` |

**สรุป Outcomes ที่เกิดในบท:**

| Actual branch | สิ่งที่ส้มเลือกจริง | มีอาหารส่วนที่ร้านแบ่งให้หรือไม่ | เชื่อม `D202-R01` |
|---|---|---|---|
| `D202-C01-A` | เลือกซื้อของกินในเงินที่มี; ลูกอมไว้วันอื่น | ไม่มีการเสนอ | ใช่ |
| `D202-C01-B` + `D202-C02-A` | รับส่วนอาหารที่ร้านให้ และใช้เงินตัวเองซื้อลูกอม | **มี — รับโดยคำพูดของส้ม** | ใช่ |
| `D202-C01-B` + `D202-C02-B` | ไม่รับส่วนอาหารที่แบ่งให้; ซื้อเฉพาะของกินที่ซื้อไหว | **ไม่มี — ปฏิเสธชัดเจน** | ใช่ |

**Production guard:** บรรยายแยกทางก่อน Rejoin ตาม `D202-L007P/007A/007N`; ถ้ามี placeholder prop ของอาหารแจก ให้แสดงว่าได้รับจริงเฉพาะ B→A. A และ B→B **ห้ามแสดงอาหารส่วนที่เสนอว่ากลายเป็นของส้ม**; ไม่มีการลงหนี้ สมุดเชื่อ credit balance การเบิก inventory หรือ bill simulation. ไม่แสดงความช่วยเหลือเป็นรางวัลจากการยอมเล่าประวัติ. ไม่มี forced choice ให้ส้มตอบเรื่องครอบครัว.

### B3. `SC-D2-03` — เรื่องที่จำได้ / Quiet Close (17:00–21:00)

| Draft Ref | Speaker | ข้อความจริง / Choice Text | Entry / Branch / Next |
|---|---|---|---|
| `D203-L001` | ผู้บรรยาย | ช่วงเย็น นัทแวะมาที่ชั้นของกินอีกครั้ง | `SC-D2-03/START` |
| `D203-L002` | ผู้บรรยาย | เขาหยุดดูของบนชั้นอยู่ครู่หนึ่ง | ต่อ → **conditional split** |
| `D203-L003T` | นัท | เมื่อวานที่คุยกัน ผมยังนึกถึงเรื่องทำอาหารจากของไม่กี่อย่างอยู่เลยครับ | **TRUE ONLY** ถ้ามี `NUT_FOOD_INTEREST_TOLD_D1` ที่อิง `D103-L005A` จริง |
| `D203-L003F` | นัท | วันนี้มีของกินอะไรที่เก็บไว้ได้บ้างครับ | **FALSE ONLY** ถ้า `NUT_FOOD_INTEREST_TOLD_D1` ไม่มี; ไม่แสร้งว่าคุยเมื่อวาน |
| `D203-R00` / `D203-L004` | ผู้บรรยาย | นัทหยิบของที่สนใจขึ้นมาดู ก่อนวางไว้บนเคาน์เตอร์ | ทั้ง TRUE/FALSE กลับจุดนี้ → `D203-C01` |
| `D203-C01-A` | ตัวเลือกผู้เล่น | บอกว่านัทค่อย ๆ ดูและเลือกเองได้ | Branch A |
| `D203-L005A` | นัท | งั้นขอดูอีกนิดนะครับ เดี๋ยวผมเลือกเอง | → `D203-R01` |
| `D203-C01-B` | ตัวเลือกผู้เล่น | ถามว่าจะรับของที่เลือกใส่ถุงเลยไหม | Branch B |
| `D203-L005B` | นัท | ครับ เอาที่เลือกไว้นี่แหละครับ | → `D203-R01` |
| `D203-R01` / `D203-L006` | ผู้บรรยาย | นัทเลือกของที่ต้องการแล้วรับถุงไป | ทั้ง A/B กลับจุดนี้ |
| `D203-L007` | นัท | ผมไปก่อนครับ | ต่อ |
| `D203-L008` | ผู้บรรยาย | หลังจากนั้น ร้านค่อย ๆ เงียบลง | Quiet Close ก่อนร้านปิด |
| `D203-L009` | ผู้บรรยาย | ก่อนสามทุ่ม ของบนเคาน์เตอร์ถูกเก็บเข้าที่ | ต่อ |
| `D203-L010` | ผู้บรรยาย | เมื่อถึงสามทุ่ม ป้ายหน้าร้านถูกพลิกเป็น “ปิด” | `SC-D2-03/END` → Day 2→Day 3 → `SC-D3-01` |

**Semantics สำคัญ:** `D203-L003T` **ไม่สร้าง** `NUT_FOOD_INTEREST_TOLD_D1` ใหม่ ไม่ใช่หลักฐานว่าแฟกต์นั้นเกิดใน Day 2. `D203-L003F` เป็นคำถามเรื่องสินค้าวันนี้ ไม่ใช่คำบอกเล่าว่าชอบทำอาหาร. Choice `D203-C01-A/B` อยู่หลัง rejoin `D203-R00` และใช้เหมือนกันใน TRUE/FALSE. ไม่มีเด็กคนอื่นรับรู้คำพูดนี้โดยอัตโนมัติ; ไม่มีการอนุญาตเปิดเผยเรื่องอาหารต่อคนอื่น.

## C. State, Knowledge, Permission & Consequence Matrix

### C1. Minimum durable semantics

1. **Source fact from Day 1:** `NUT_FOOD_INTEREST_TOLD_D1` เป็น **semantic memory reference** ที่ `P1-D1-v0.3` บันทึกได้เฉพาะเมื่อ `D103-L005A` ถูกนำเสนอจริง (ผู้พูดนัท, ผู้รับรู้ Player). Day 2 **อ่านอย่างเดียว** เพื่อเลือก dialogue variant; ถ้าไม่เคยเกิดให้เป็น absent ไม่สร้างย้อนหลัง.
2. **Day 2 observed facts:** เห็นมะนาวถือยางลบก้อนเล็กมาก; เห็นส้มนับเงินแล้วไม่พอซื้อทั้งของกินและลูกอม; เห็นนัทกลับมาซื้อ/เลือกสินค้า. การเห็นเหล่านี้ **ไม่บอกเหตุผลเรื่องบ้าน** หรือความเป็นเจ้าของเงินนอกสิ่งที่เด็กพูด.
3. **Branch-specific material outcome:** การรับส่วนอาหารที่แบ่งให้ใน `D202-L006A` เป็นสิ่งที่ผู้เล่นเห็นและส้มรู้ว่าตนรับ. `D202-C01-A` และ `D202-L006B` ไม่มีการมอบอาหารส่วนนั้น. หาก runtime ต้องรักษาสภาพ prop/Album หลัง scene transition ให้ใช้หลักฐานจากสาขาจริง; **ไม่จำเป็นต้องสร้าง flag ถาวรใหม่** ถ้าไม่มีการนำกลับมาใช้ภายหลัง. ไม่โยงอัตโนมัติกับ Day 3 relationship.
4. **No new permission:** ไม่มีข้ออนุญาตแชร์ข้อมูลบ้าน/อาหารกับบุคคลที่สาม; ไม่มี Information Promise; การรับอาหารไม่ได้ให้สิทธิเข้าถึงข้อมูลของเด็ก.
5. **No new Trust/TSPR policy:** ไม่มี scores, deltas, thresholds หรือ gating; การเสนอ/ปฏิเสธความช่วยเหลือไม่ใช่คะแนนถูกผิด. หาก 03 ต้องการ state representation เพิ่มนอกสิ่งที่บทต้องใช้ ให้รายงานส่วนที่พึ่งพา G-01 แยก ไม่แก้ semantics ด้วยการเดาค่า.
6. **One-time semantics:** facts/props/effects ที่ต้อง commit ทำได้ครั้งเดียวเมื่อ branch ถูกประมวลผลจริง; ไม่มี duplicate grant จาก repeated choice/double input/remount. การ restore testing เป็น deferred production regression แต่ห้ามสร้าง duplicate domain effect ใน playthrough ตาม emergency acceptance.

### C2. Choice Consequence Matrix — ครบทุกทางที่ผู้เล่นเลือกได้

| Trigger | Immediate Result (exact Ref) | Durable / Observed Narrative Fact | Knowledge Source / Known By | Permission | Preconditions | Delayed Result | Alternative & Rejoin | One-time / No-Replay | Status |
|---|---|---|---|---|---|---|---|---|---|
| `D201-C01-A` หยิบยางลบให้ | `D201-L005A` ขอเลือกอันจับถนัด | เห็นมะนาวเลือกยางลบ; ไม่สร้างข้อมูลครอบครัว | Player เห็น; มะนาวเลือกเอง | ไม่มี | Scene 01, C01 รอเลือก | ไม่มี | `D201-R01`, → D202 | ห้ามทำธุรกรรมซ้ำด้วย input ซ้ำ | EDITORIAL REVIEW ACCEPTED |
| `D201-C01-B` เสนอเครื่องเขียนอื่น | `D201-L005B` วันนี้ดูยางลบก่อน | เห็นการปฏิเสธดูของเพิ่ม; ไม่จัดเป็น secret/promise | มะนาวบอก Player | ไม่มี | Scene 01, C01 รอเลือก | ไม่มี | `D201-R01`, → D202 | ไม่เพิ่ม flag การปฏิเสธเป็นคะแนน | EDITORIAL REVIEW ACCEPTED |
| `D202-C01-A` ของในงบ | `D202-L005A` แล้ว `D202-L007P` ส้มเลือกซื้อของกินก่อน ลูกอมยังอยู่บนเคาน์เตอร์ | เห็นส้มเลือกของในงบ; **ไม่มีของแจก** | ส้มบอก Player; Player เห็น | ไม่มี | Scene 02, ไม่พอซื้อทั้งหมด | ไม่มี | `D202-R01`, → D203 | ห้ามสร้าง fact ว่ารับของช่วย | EDITORIAL REVIEW ACCEPTED |
| `D202-C01-B` อธิบายทางเลือกส่วนอาหาร | `D202-L005B` “หนูเลือกได้จริง ๆ เหรอคะ” | **ยังไม่รับของ**; เปิดจุดเลือก C02 | ผู้เล่นได้ยินส้มถาม | ไม่มี | Scene 02, ไม่พอซื้อทั้งหมด | ไม่มี | ต้องเข้าจุด `D202-C02` ก่อน rejoin | อย่า commit grant เมื่อแค่เสนอ | EDITORIAL REVIEW ACCEPTED |
| `D202-C02-A` ย้ำสิทธิเลือก | `D202-L006A` → `D202-L007A` “งั้นหนูรับอาหารส่วนนี้ค่ะ…” | **รับส่วนอาหารที่เสนอจริง**; สังเกต/รักษา prop ตามจำเป็น | ส้มบอก Player; ผู้เล่นอยู่ตอนรับ | ไม่มีสิทธิข้อมูลเพิ่ม | `D202-C01-B` + L005B เกิดแล้ว | ไม่มี callback เพิ่ม | `D202-R01`, → D203 | รับครั้งเดียว ไม่สร้างอาหารซ้ำ | EDITORIAL REVIEW ACCEPTED |
| `D202-C02-B` อธิบายสิทธิปฏิเสธ | `D202-L006B` → `D202-L007N` “หนูไม่รับส่วนที่แบ่งให้ค่ะ…” | **ไม่รับ**; ซื้อเฉพาะที่ไหว | ส้มบอก Player โดยตรง | ไม่มี | `D202-C01-B` + L005B เกิดแล้ว | ไม่มี | `D202-R01`, → D203 | ห้าม mark “รับความช่วยเหลือ” | EDITORIAL REVIEW ACCEPTED |
| `D203-C01-A` ให้เลือกต่อ | `D203-L005A` “ขอดูอีกนิด…” | ไม่สร้าง D1 told fact; นัทเลือกเอง | นัทบอก Player | ไม่มี | `D203-R00` หลัง TRUE หรือ FALSE | ไม่มี | `D203-R01` → 21:00 | ไม่ยิง content callback ซ้ำเป็น state | EDITORIAL REVIEW ACCEPTED |
| `D203-C01-B` ถามใส่ถุง | `D203-L005B` “เอาที่เลือกไว้นี่แหละครับ” | ไม่สร้าง D1 told fact; ธุรกรรมปกติ | นัทบอก Player | ไม่มี | `D203-R00` หลัง TRUE หรือ FALSE | ไม่มี | `D203-R01` → 21:00 | ไม่ยิง content callback ซ้ำเป็น state | EDITORIAL REVIEW ACCEPTED |

### C3. Conditional Callback Contract — TRUE / FALSE

| Field | `TRUE` — D1 `told` exists | `FALSE` — D1 `told` absent |
|---|---|---|
| Trigger provenance | `D103-C01-A` และ **`D103-L005A` ถูกกล่าวจริง** → `NUT_FOOD_INTEREST_TOLD_D1` | `D103-C01-B` หรือไม่มี `D103-L005A` ใน run นี้; ไม่มี fact |
| Day 2 predicate | `has(NUT_FOOD_INTEREST_TOLD_D1) == true` (semantic expression only) | `has(NUT_FOOD_INTEREST_TOLD_D1) == false` |
| Exact displayed line | `D203-L003T`: “เมื่อวานที่คุยกัน ผมยังนึกถึงเรื่องทำอาหารจากของไม่กี่อย่างอยู่เลยครับ” | `D203-L003F`: “วันนี้มีของกินอะไรที่เก็บไว้ได้บ้างครับ” |
| Speaker / known by | นัทพูดต่อหน้าผู้เล่นและรู้ว่าได้คุยกันจริง | นัทถามเรื่องสินค้าวันนี้; ไม่ยืนยันว่าเคยเล่าความชอบทำอาหาร |
| Permission | ไม่เกิด; Food interest told to Player ≠ permission share to others | ไม่เกิด; ไม่สร้าง fact ย้อนหลัง |
| Rejoin | `D203-R00` → `D203-C01-A/B` | `D203-R00` → `D203-C01-A/B` |
| Delayed result | **ข้อความย้อนกลับให้เห็นจริงวันนี้**; ไม่มี Domain Effect ใหม่ที่ต้องเพิ่มเพื่อแสดงข้อความ | มีข้อความทางเลือกต่างกันแต่เส้นเรื่องเดินต่อได้เหมือนกัน |
| One-time semantics | Callback line เป็น presentation branch ที่อิง fact; ไม่เพิ่ม told fact ซ้ำ ไม่สร้าง duplicate relationship event | ไม่ commit true fact เพราะพบ/ซื้อของวันนี้ |
| Approval | D1 callback direction accepted by 01; exact Day 2 line **editorial accepted with v0.2 corrections** | D1 callback direction accepted by 01; exact Day 2 line **editorial accepted with v0.2 corrections** |

**Avoid circular evidence:** อย่าให้ `D203-L003T` เป็นสาเหตุที่ “พิสูจน์” ว่า Day 1 conversation เกิด หาก D1 fact ไม่อยู่จริง; อย่า infer ว่า Nut ชอบทำอาหารเพียงเพราะซื้อ shelf-stable food วันก่อนหรือ Day 2.

### C4. Permission/Knowledge guard

| Topic | `seen` | `told` | `permission` / not known |
|---|---|---|---|
| มะนาว/ยางลบ | ผู้เล่นเห็นยางลบก้อนเล็กและเลือกของใหม่ | เธอขอดู/เลือกยางลบ; **ไม่**บอกสาเหตุที่ก้อนเดิมเล็ก | ไม่มีสิทธิเปิดกระเป๋า/สมุด/บอกเรื่องส่วนตัว |
| ส้ม/ของไม่พอเงิน | Player เห็นนับเงินและคืนลูกอม | ส้มบอกว่าซื้อทั้งหมดไม่พอ; ถ้าเลือก B→A บอกว่ารับอาหารส่วนที่แบ่งให้; ถ้า B→B บอกว่าไม่รับ | ไม่มีข้อมูลว่าครอบครัวยากจนหรือลูกอมให้ใคร; ไม่ต้องเล่าเพื่อรับของ |
| นัท/ความชอบทำอาหาร | Player เห็นซื้อ/ดูอาหาร | **D1 only** `D103-L005A` พูดจริงจึงมี fact ข้ามวัน | ไม่ได้อนุญาตให้ผู้เล่นนำเรื่องนี้เล่ากับแม่หรือคนอื่น; ไม่มี family fact |
| กันต์/ชื่อ | ไม่มีการปรากฏใน Day 2 ตามโครงที่อนุมัติ | ไม่มีชื่อใหม่ใน Day 2; Day 1 ยังคงไม่รู้ชื่อ | UI/Album ไม่แสดงกันต์เป็นชื่อที่ Player รู้ |

## D. Proposed Dialogue / Choice Identity Mapping

**Identity ownership:** 04 เป็นเจ้าของ Narrative Content References; 03 เสนอ stable technical IDs, Ink knot/choice/registry mapping, validation และ idempotency. อย่านำ `D2-A` ฉากรถของบาสเดิมมาใช้เรียก Day 2 มะนาว/ส้ม/นัท.

| Ref Family | Scene | Speaker / Kind | Meaning / Branch | Technical Mapping Status |
|---|---|---|---|---|
| `D201-L001–L010`, `D201-L005A/B` | `SC-D2-01` | ผู้บรรยาย/มะนาว, dialogue | ยางลบเล็ก; ชวนดูหรือเลือกของ | TECHNICAL ID UNASSIGNED |
| `D201-C01-A/B` | `SC-D2-01` | Player action choice | Immediate A/B; → `D201-R01` | TECHNICAL ID UNASSIGNED |
| `D202-L001–L004`, `D202-L005A/B`, `D202-L006A/B`, `D202-L007P/007A/007N`, `D202-L008–L010` | `SC-D2-02` | ผู้บรรยาย/ส้ม, dialogue | เงินไม่พอ; แยกซื้อ/รับ/ปฏิเสธส่วนอาหาร | TECHNICAL ID UNASSIGNED |
| `D202-C01-A/B` | `SC-D2-02` | Player action choice | A→`D202-L007P`→`D202-R01`; B→`D202-C02` | TECHNICAL ID UNASSIGNED |
| `D202-C02-A/B` | `SC-D2-02` | Player action choice | offer branch only; A accepted / B refused; both → `D202-R01` | TECHNICAL ID UNASSIGNED |
| `D203-L001–L010`, `D203-L003T/F`, `D203-L005A/B` | `SC-D2-03` | ผู้บรรยาย/นัท, dialogue | TRUE/FALSE food memory and normal closing | TECHNICAL ID UNASSIGNED |
| `D203-C01-A/B` | `SC-D2-03` | Player action choice | A/B → `D203-R01` | TECHNICAL ID UNASSIGNED |
| `D201-R01`, `D202-R01`, `D203-R00`, `D203-R01` | Day 2 | **Unrendered rejoin markers** | Branch convergence; ไม่ใช่ dialogue line | TECHNICAL ID UNASSIGNED |

**Naming collision precaution:** Range shorthand `L001–L010` ไม่ได้แปลว่ามี line `L005` หรือ `L003` ที่ไร้ suffix ในตำแหน่งที่กำหนด conditional; ใช้เฉพาะ actual refs ที่ปรากฏใน section B. ตัวอักษร `T/F` เป็น proposed narrative variants, ไม่ใช่ technical compiler syntax.

### D1. Narrative Event Meaning (ไม่ใช่ EventRegistry payload)

| Meaning | Supporting Ref | Durable? | Who knows / boundary |
|---|---|---|---|
| มะนาวมียางลบก้อนเล็กในมือ | `D201-L002` | `seen` หากจำเป็นต่อ Memory; ไม่สร้างการตีความ | Player เห็นเท่านั้น |
| ส้มบอกว่าเงินไม่พอ | `D202-L004` | `told` เฉพาะว่าเงินที่ถือมาซื้อทั้งหมดไม่พอ; ไม่ขยายไปฐานะทางบ้าน | ส้มบอก Player |
| ส้มรับอาหารส่วนที่ให้ | `D202-L006A` | `seen/told` จากการรับจริง; สร้าง durable world trace เฉพาะถ้าจำเป็น ไม่เพิ่ม relationship formula | ส้มและ Player รู้ |
| ส้มปฏิเสธอาหารส่วนที่ให้ | `D202-L006B` | `told` คำปฏิเสธ; ไม่มี food grant | ส้มและ Player รู้ |
| นัทพูดต่อจากเรื่องเมื่อวาน | `D203-L003T` | **Presentation callback เท่านั้น**; ไม่สร้าง told fact หรือ permission ใหม่ | นัทพูดต่อหน้า Player เพราะ fact เดิมมีจริง |
| นัทถามหาของกินวันนี้ | `D203-L003F` | ordinary dialogue; ไม่สร้าง D1 fact | นัทพูดต่อหน้า Player |
| ร้านปิด Day 2 | `D203-L010` | Day transition boundary once | Player เห็นป้ายปิด |

## E. Presentation / Runtime Handoff

**All listed asset names are proposed semantic placeholders, not proof that final art, recorded audio, scene anchors, manifest or export formats exist.** 03/05 ต้อง validate mapping หลังมี Implementation Authorization.

| Scene | Essential for comprehension | Placeholder Fallback | Optional only | Stage/Expression/Sound | Status |
|---|---|---|---|---|---|
| `SC-D2-01` | เคาน์เตอร์/ชั้นเครื่องเขียน; ยางลบเก่าก้อนเล็กแยกจากก้อนบนชั้น; มะนาว speaker; Choice A/B | `BG_SHOP_MORNING` + text “ยางลบก้อนเล็กในมือ / ยางลบบนชั้น”; generic sprite neutral | แสงเช้า/มุมมองชั้นสีไม้/เสียงวางของ | counter/standing by shelf = semantic zones, **not** pixel anchors; ไม่มี required SFX | EDITORIAL REVIEW ACCEPTED |
| `SC-D2-02` | ของกิน/ลูกอม; สิ่งที่ส้มถือว่าจ่ายไม่พอ; แสดงผลรับ/ไม่รับของแบ่งให้ต่างกัน | `BG_SHOP_AFTERNOON` + labels “ของกิน”, “ลูกอม”, “อาหารส่วนที่ร้านแบ่งให้”; props can be text and only appeared on accepted branch | เหรียญเคลื่อนหรือการชะงัก/เสียงถุงเบา ๆ | counter; สีหน้า neutral/ลังเลจาก dialogue ไม่ใช่ตัวเลข TSPR; ไม่มี required SFX | EDITORIAL REVIEW ACCEPTED |
| `SC-D2-03` | นัท speaker, conditional TRUE/FALSE text ชัด; ของกิน/เคาน์เตอร์; ป้ายปิด 21:00 | `BG_SHOP_EVENING` + placeholder บุคคลและเวลา; แสดง callback เป็น dialogue ไม่ต้องมีรูป recipe | เสียงร้านยามเย็น/แสงค่อยลด/พลิกป้าย | counter → shop-close; ไม่ต้องใช้ sound channel เพื่อเข้าใจ callback | EDITORIAL REVIEW ACCEPTED |

**Essential/Optional distinction:** อย่าใช้การเล่นเสียงเป็นหลักฐานว่า callback เกิด; dialogue text เป็นหลักฐานหลัก. ไม่เพิ่ม Cooking Game หรือระบบเงินเพราะมี props ในบท. Portrait expression/stage anchors และ asset IDs จริงต้องผ่าน `UI_ASSET_SPEC.md`; ใช้ readable Thai labels หาก sprite ยังไม่พร้อม.

**Checkpoint candidates (NOT approval of save contract):** หลังแต่ละ Scene Init เมื่อ idle; หลัง choice response+domain event fully processed; ณ scene exit, day transition. `SC-D2-02` **ห้าม** snap ระหว่าง `D202-C01-B` ที่รอ `D202-C02` หาก choice transaction ยังไม่ครบ; ถ้าจบ transaction แล้วและ UI รอ C02 จะเป็น safe checkpoint หรือไม่ 03 ตัดสินตาม G-02. Emergency demo defer release Save/Resume test ได้ แต่ห้าม duplicate domain effect จาก double-input ภายใน playthrough. Production Save/Restore/compatibility ยังเป็น requirement ระยะถัดไปตาม G-02/G-03.

**Narrative state command guidance (semantics, not code):** Controller อ่าน D1 told fact ด้วย read-only query; emit **exactly one** conditional line T หรือ F; choices C01 แสดงหลัง rejoin; only confirmed B→A item acceptance can reconstruct food portion. No arbitrary Trust event, unknown permission flags, event payload or TypeScript implementation from 04.

## F. Narrative Test Matrix — Day 2 (design expectations, NOT executed runtime tests)

| Test ID | Start / Preconditions and Choice Sequence | Expected exact Dialogue / Reaction | Expected Fact / Absence | Expected Next / Rejoin | Alternative / Guard | Editorial Status |
|---|---|---|---|---|---|---|
| `P2-D2-T01` | `SC-D2-01`, C01-A → `SC-D2-02` C01-A → `SC-D2-03` C01-B; D1 Nut fact absent | `D201-L005A`, `D202-L005A`, `D203-L003F`, `D203-L005B`, close L010 | No D1 food fact; no free food grant | `D201-R01` → `D202-R01` → `D203-R00/R01` → `SC-D3-01` | All 3 scenes playable | EDITORIAL REVIEW ACCEPTED |
| `P2-D2-T02` | `SC-D2-01` C01-A / B (separate runs) | A “ขอเลือกอันที่จับถนัดมือ…”; B “วันนี้หนูดูยางลบก่อนค่ะ” | No family/grade fact | `D201-R01` → D202 | No gating on conversational preference | EDITORIAL REVIEW ACCEPTED |
| `P2-D2-T03` | `SC-D2-02` C01-A | ส้ม “เอาของกินก่อนค่ะ ลูกอมไว้วันอื่นก็ได้” และ `D202-L007P` ยืนยันลูกอมยังอยู่บนเคาน์เตอร์ | No offered-food acceptance, no debt | `D202-R01` → D203 | Normal purchase not penalized | EDITORIAL REVIEW ACCEPTED |
| `P2-D2-T04` | `SC-D2-02` C01-B then C02-A | `D202-L005B` ตามด้วย `D202-L006A`, `D202-L007A` (รับอาหาร + ซื้อลูกอมจริง) | Accept **only** on this path; observed/told result | `D202-R01` → D203 | No inventory/credit simulation | EDITORIAL REVIEW ACCEPTED |
| `P2-D2-T05` | `SC-D2-02` C01-B then C02-B | `D202-L005B` ตามด้วย `D202-L006B`, `D202-L007N` (ส่วนที่เสนอไม่ได้ถูกนำไป) | Explicit refusal; no food grant | `D202-R01` → D203 | Still offered dignity, no disclosure requirement | EDITORIAL REVIEW ACCEPTED |
| `P2-D2-T06` | D1 C01-A + displayed `D103-L005A`; enter `SC-D2-03` | **Only** `D203-L003T` (“เมื่อวานที่คุยกัน…”) | D1 `NUT_FOOD_INTEREST_TOLD_D1` true from D1, not new on D2 | `D203-R00` → C01 → R01 → D3 | Do not show `D203-L003F` | EDITORIAL REVIEW ACCEPTED |
| `P2-D2-T07` | D1 C01-B + no displayed `D103-L005A`; enter `SC-D2-03` | **Only** `D203-L003F` (“วันนี้มีของกินอะไร…”) | D1 food told absent; no retroactive fact | `D203-R00` → C01 → R01 → D3 | Do not say “เมื่อวานคุยกัน” | EDITORIAL REVIEW ACCEPTED |
| `P2-D2-T08` | Each T/F branch + Nut C01 A / B (4 route variants) | A = `D203-L005A`; B = `D203-L005B`; both show L006 onward | No Promise/permission or TSPR changes | `D203-R01` and 21:00 close | Callback conditional does not remove ordinary choice | EDITORIAL REVIEW ACCEPTED |
| `P2-D2-T09` | All `D202-C01-B` choices before C02 decision | Display `D202-L005B` then **wait** at C02; no L006A/B yet | No food acceptance committed merely on offer | Either C02 A or B → R01 | Do not auto choose; avoid duplicate grant from double input | EDITORIAL REVIEW ACCEPTED |
| `P2-D2-T10` | D201 06:30–07:30; D202 15:30–17:00; D203 17:00–21:00 | มะนาวพบผู้เล่นช่วงเช้า, ส้มช่วงบ่าย, นัทช่วงเย็น; ป้าย “ปิด” เวลา 21:00; ไม่มี Kan/Bas cameo | No new Kan name, Bas, puzzle, overnight | `SC-D3-01` reachable | Closing not epilogue and not last day | EDITORIAL REVIEW ACCEPTED |
| `P2-D2-T11` | No family info disclosed in any branch | All dialogue displays only items, choices and Nut callback based on D1 | No invented mother/father, financial status or third-party permission | All routes continue | Neither help nor privacy is rewarded/punished by disclosure | EDITORIAL REVIEW ACCEPTED |
| `P2-D2-T12` | In-playthrough repeated click/key input at any Day 2 choice, especially `D202-C02-A` | Exactly one selected branch response; no accidental second item acceptance | No duplicated domain effect or double advance | Correct branch rejoin once | **Emergency acceptance**: no-duplicate without requiring Save/Resume | EDITORIAL REVIEW ACCEPTED |

**Deferred production-only regression:** `P2-D2-RT01` restore at T/F callback boundary from coherent D1 state; `RT02` resume at C02 awaiting a choice with no premature acceptance; `RT03` compare per-save Memory/permission/backlog and no SFX replay. Defer testing for emergency demo per 01 decision, **not** a cancellation of G-02/G-03. 03 owns tests when implementation is authorized.

### F1. Path completeness audit

- Number of **player Choice Points:** D201-C01 (2 options), D202-C01 (2), D202-C02 (2, reachable only after B), D203-C01 (2) = **4 distinct points / 8 option definitions**, with D202 child responses correctly accounting for **3** complete Som paths.
- Callback variants: `D203-L003T` / `D203-L003F` mutually exclusive. They join at `D203-R00` before the two player options.
- Each choice option has its exact response line and an explicit next step. The Day 2 total ends at **`SC-D3-01`** on every complete path. No dead ends, no forced disclosure.
- Stage/name consistency: Day 1 taught name **มะนาว/ส้ม/นัท** explicitly; Kan remains unnamed to Player. `SC-D2-01` uses "มะนาว", `SC-D2-02` uses "ส้ม", `SC-D2-03` uses "นัท" without hidden knowledge.
- Timing: D2 morning 06:30–07:30, afternoon 15:30–17:00, evening 17:00–21:00. No child remains after closing.

## G. 01 Editorial Review / 03 Handoff Boundary

**01 Editorial Review Accepted:** 01 ตรวจ v0.1 แล้วและอนุญาตให้แก้ minor corrections 4 ข้อ; v0.2 แก้ครบโดยไม่เปลี่ยน Scene Facts/Outcomes. ไม่เปิด Owner Approval ใหม่; 03 ตรวจ mapping/contract แยกหลังได้รับ Implementation Authorization.

**Content ready for technical handoff (content only):** ส่ง version นี้ให้ 03 สำหรับ **technical planning/mapping**, consisting of: three-scene manifest + Thai lines/choices/branch conditions + callback T/F + state/knowledge/permission/consequence table + content references + essential/optional placeholders + test paths. **Do not imply permission to implement, edit repo, compile, commit, deploy, or mark runtime passed.**

**Next:** Package 3 — Day 3 จัดทำแยกตาม Rolling Workflow สำหรับ 01 Final Narrative Consistency Review. Day 2 นี้ไม่ใช่การอนุญาตให้ Implement หรือผลทดสอบ Runtime.
