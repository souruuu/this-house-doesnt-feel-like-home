# PROJECT — บ้านที่ไม่รู้สึกเหมือนบ้าน

ไฟล์นี้เป็น Source of Truth ของ concept, goals และ scope ส่วนเหตุและผลรายฉากให้ใช้ [Narrative Design Source of Truth](sources/narrative_map_7_day_Updates.md) โดยตรง ไม่ใช้สรุปนี้แทน Scene Map

## Emergency Demo — Owner Approval 17 October 2026

สำหรับ Emergency Day 1–3 demo ให้ใช้ [Active Approved Narrative Handoff](sources/emergency-demo-2026-10-17/README.md) และ CR-NAR-001 v0.2 เป็นข้อยกเว้นเฉพาะส่วนที่เปลี่ยนจาก map เดิม: เด็กสี่คน มะนาว/ส้ม/นัท/กันต์; ไม่มีบาสหรือ repair puzzle ในเดโม บาสเริ่ม Day 4 รถ Day 5 กล่องดนตรีคง Day 7 Production Save/Resume เลื่อนออกเฉพาะ emergency build และต้องแจ้งการสูญเสียความคืบหน้าหลัง refresh/close

ข้อความ Prototype/ฉากรถ/ตัวละครใน baseline ด้านล่างที่ขัดกันเป็นข้อกำหนดเดิมซึ่งถูก supersede เฉพาะ emergency scope ตาม CR; Original Narrative Map เก็บ bytes/provenance เดิม ไม่ใช้สองฉบับเป็น authority ที่ขัดกัน บทจริงใช้ P1 v0.3/P2 v0.2/P3 v0.3 ไม่ใช้สรุปเขียนแทน ไม่เปลี่ยน full-game technical contracts, DoD หรือประกาศ M0–M7 DONE

## แหล่งข้อมูลและสถานะ

- Narrative source: [narrative_map_7_day_Updates.md](sources/narrative_map_7_day_Updates.md)
- SHA-256 ของไฟล์ต้นฉบับที่ใช้สร้างชุดเอกสาร: `B0EC03E7D54A4AAF1D7976D4CD585D8A982D83D415EDABE3F1B272A5DEE04CDB`
- Technical decisions: ยึดเอกสารใน repo ชุด Lean 8 ไฟล์ล่าสุด ไม่ใช้ชุด 14 ไฟล์ที่ถูกปรับแล้ว
- `OPEN QUESTION` หมายถึงยังไม่มีคำตอบที่ล็อกจากแหล่งข้างต้น ห้ามนำค่าตัวอย่างในเอกสารไปใช้เป็นคำตอบ การจัดรูปแบบ field/path/tag ที่ยังไม่ final ต้องตรวจใน milestone ที่เกี่ยวข้อง

## Technical Documentation Baseline v0.1

**พร้อมสำหรับ Freeze ของ core technical contracts** ตาม decision ล่าสุด: N-02 CLOSED ใน [NARRATIVE_SYSTEM](docs/NARRATIVE_SYSTEM.md), G-02/G-03 CLOSED ใน [GAME_STATE](docs/GAME_STATE.md) และ placeholder-first but style-ready ตาม [UI_ASSET_SPEC](docs/UI_ASSET_SPEC.md) Narrative facts และ scope เดิมคงตาม Updates

Baseline มีทะเบียน OPEN QUESTION สำหรับ toolchain/domain/content/assets/audience/competition ใน [MASTER_PLAN](MASTER_PLAN.md) จึงไม่ใช่การอนุมัติค่า state/บท/visual direction ที่ยังไม่ล็อก และไม่ใช่คำยืนยันว่า implementation หรือ build ผ่านแล้ว คำถามที่ค้างปิดก่อนงานที่พึ่งพาคำตอบ; สถานะ implementation/verification ของ M0 ให้ดู MASTER_PLAN

## Concept

Interactive narrative web game แบบ single-player ผู้เล่นสวมบทเจ้าของร้านชำในหมู่บ้านชนบทไทย ผ่านหนึ่งสัปดาห์ที่เด็กห้าคนแวะร้าน เล่าผ่านสิ่งของ บทพูดสั้น ความเงียบ การเลือก และความสัมพันธ์ระหว่างเด็ก ร้านมีทั้งเคาน์เตอร์ ชั้นสินค้า โต๊ะซ่อม และม้านั่งใต้ชายคาในพื้นที่เดียวกัน

ผู้เล่นเป็น Blank Protagonist ไม่มีอายุ เพศ อดีต หรือความเห็นภายในที่ล็อกไว้ ไม่เพิ่มเสียงคิดสรุปคติแทนผู้เล่น เด็กเป็นบุคคลที่มีชีวิตธรรมดา ความชอบ และสิทธิเลือก ไม่ใช้เรื่องส่วนตัวเป็นรางวัลปลดล็อก

## Goals

- ให้ผู้เล่นเข้าใจบริบทและมองเด็กเป็นบุคคลผ่านสิ่งที่เล่น ไม่อ้างว่าเกมพิสูจน์แล้วว่าลดอคติได้
- ให้ความชัดเจนของข้อตกลง การรับฟัง และการเคารพขอบเขตเกิดผลที่อ่านได้ทั้งทันทีและภายหลัง
- ให้การไม่เล่าเรื่องส่วนตัวและการปฏิเสธความช่วยเหลือยังเป็นประสบการณ์ที่มีน้ำหนัก
- ให้ Prototype ต่อเข้าวัน 4 ของเกมเต็มได้โดยใช้ narrative และ state model ชุดเดียวกัน

วิธีตรวจเป้าหมายและเวลาเล่นอยู่ใน [MASTER_PLAN.md](MASTER_PLAN.md); invariants ของระบบอยู่ใน [GAME_STATE](docs/GAME_STATE.md)

## Audience

ภาษาในเกมล็อกเป็น Thai only และลำดับอุปกรณ์ล็อกเป็น desktop/laptop first พร้อม mobile landscape การระบุอายุ กลุ่มผู้เล่นหลัก หรือบริบทใช้ในห้องเรียนยังไม่มีใน Narrative Map; ดู P-01 ไม่อนุมานอายุผู้เล่นจากอายุตัวละคร

## ตัวละครและขอบเขตเรื่อง

| ตัวละคร | อายุที่ล็อก | ฐานในเรื่อง |
|---|---:|---|
| ส้ม | 8 | ซื้อขนม ลูกอมสองเม็ด และสิทธิเลือกพื้นที่/เรื่องที่อยากคุย |
| มะนาว | 12 | เครื่องเขียนและงานวาด; เป็นผู้เลือกสิทธิให้ดูและที่เก็บของ |
| กันต์ | 14 | รักษาระยะ; ขอบเขตต่อพฤติกรรมจริงต้องแยกจากการตีตรา |
| บาส | 10 | ของเล่นและการร่วมซ่อม; อยู่กับป้าจันทร์ตั้งแต่เล็กโดยไม่รู้รายละเอียดพ่อแม่ทั้งหมด |
| นัท | 13 | อาหาร ความชอบทำกิน และขอบเขตข้อมูลส่วนตัว |

รายละเอียด arc และ world facts ทั้งหมดอยู่ในหัวข้อ “Character Arc ทั้งห้าคน”, “Delayed Consequence Ledger” และ “ข้อกำหนดที่ล็อกแล้วก่อนเขียนบทสนทนา” ของ [ต้นฉบับ](sources/narrative_map_7_day_Updates.md)

ร้านเปิด 06:00–21:00; ฉากเช้า 06:00–08:00 หลังเลิกเรียน 15:30–18:30 และก่อนปิด 19:00–21:00 การช่วยเหลืออยู่ในร้านและภายในขอบเขตที่ทำได้จริง: รับฟัง พื้นที่พักระหว่างเปิดร้าน อาหารตามข้อจำกัด ซ่อมของ รักษาความเป็นส่วนตัว และพูดถึงทางเลือกผู้ใหญ่/บริการ ไม่รับรองผลที่ไม่ได้เกิดหรือรับรู้อยู่ในเรื่อง

## Scope ของ Prototype

บทนำ + Notice + Day 1–3 ตามลำดับเดียวกับเกมเต็ม เป้าหมายประมาณ **20 นาที** หรือประมาณ 40% ของงบเส้นทางหลัก 50 นาที ตัวเลขนี้เป็นงบออกแบบ ต้องยืนยันด้วย playtest ภาษาไทยจริง

ต้องเห็นเด็กทั้งห้า เริ่มแยกชื่อและนิสัยได้ มี Observation, คำตกลง D1 และผล D2, puzzle รถ, Album, Memory เรื่องอาหารของนัท, ขอบเขตกับกันต์ และฉากส้ม/นัทที่สื่อ theme จากการเล่น ให้น้ำหนักบาส ส้ม นัท ส่วนมะนาวและกันต์วางฐานสำหรับช่วงหลัง

จบหลัง D3-C และช่วงปิดร้านในตัวเอง ไม่ย้ายฝนหรือกล่องดนตรีจากวันหลังมาเป็น climax ไม่ทำ epilogue ปลอมว่าเรื่องทั้งสัปดาห์จบแล้ว ข้อมูลปลาย Day 3 ใช้ model เดียวกับเกมเต็มและรองรับการต่อ Day 4; การย้าย save ข้าม build ต้องผ่าน compatibility policy ใน [GAME_STATE](docs/GAME_STATE.md)

เกณฑ์ส่ง Prototype และเนื้อหารายวันให้ดู [MASTER_PLAN.md](MASTER_PLAN.md)

## Scope ของ Full Game v1

7 วันตาม Scene Map เส้นทางหลักประมาณ **50 นาที** เนื้อหาเสริมรวมประมาณ **8 นาที** เป้าหมาย playtest ไม่เกิน **60 นาที** งบรวม puzzle แล้ว ไม่มีระบบเงิน/stock/กำไรให้เล่นเพิ่มเพื่อผ่านวัน

| ระบบ | ขอบเขตที่ล็อก; รายละเอียดให้อ่านเจ้าของเรื่อง |
|---|---|
| Dialogue / choices / delayed consequences | Branch กลับสู่เหตุการณ์หลักภายในวัน; [NARRATIVE_SYSTEM](docs/NARRATIVE_SYSTEM.md) |
| Relationship / Promise / Memory / flags / Album | [GAME_STATE](docs/GAME_STATE.md) |
| Observation / repair | Point-click ภายในร้าน; puzzle รถ Day 2 และกล่องดนตรี Day 7 เท่านั้น |
| Ending แบบ C | Final Shop State ตามเหตุการณ์จริง + Character Epilogue รายคน; ไม่จัดอันดับตอนจบ |
| Scrollytelling | ทบทวนร่องรอยร้านท้ายเกมประมาณหนึ่งนาที พร้อมทางอ่านข้อความคงที่ |
| Notice / optional information page / VN controls | [UI_ASSET_SPEC](docs/UI_ASSET_SPEC.md) |

M0–M7 เป็นแผนไปถึง competition build ของ Prototype; การผลิต Day 4–7 เป็นระยะต่อหลัง Prototype ไม่แทรกเป็นงานที่ต้องเสร็จใน M7 โดยไม่ได้ยืนยัน scope ส่งประกวด ดู P-02 และ [MASTER_PLAN.md](MASTER_PLAN.md)

## Non-goals / out of scope

- Backend/database/auth/cloud save v1; รายละเอียดเหตุผลและ abstraction อยู่ใน [ARCHITECTURE.md](ARCHITECTURE.md)
- เส้นเรื่องตำรวจ เด็กในกระบวนการกฎหมาย หรือพาผู้เล่นออกไปบ้านเด็ก/อำเภอ/ทุ่งนา
- โทร ส่งข้อความ นัดเจ้าหน้าที่ ดำเนินความช่วยเหลือจริง หรือให้พักค้างคืน
- ตามหาพ่อแม่บาส ยืนยันว่าพ่อแม่เสียชีวิต หรือสรุปว่าชีวิตครอบครัวเด็กดีขึ้นนอกร้าน
- Trust เพื่อปลดล็อก trauma, คะแนนรวม, Good/Bad/True Ending หรือ Endings Gallery
- Puzzle หุ่นยนต์, cooking game, fail state, timer หรือความยาก puzzle ที่ให้รางวัล/ลงโทษ relationship
- การสำรวจโทรศัพท์ กระเป๋า สมุดปิด หรือซูมบาดแผลเพื่อเก็บความจริงครบ
- ภาษาอังกฤษ UI มือถือแนวตั้งอีกชุด และ gamepad ตามขอบเขตปัจจุบัน

## Technical summary

React/TypeScript/Vite จัด UI และ build; Phaser 4 จัดโลกเกม; Zustand เก็บ durable state; Ink/inkjs จัด branching ผ่าน `NarrativeController` และ `GameBridge` เกมเป็น static build พร้อม local-first save รายละเอียดเทคนิคให้ [ARCHITECTURE.md](ARCHITECTURE.md) เป็น Source of Truth

## OPEN QUESTION

**P-01 — Audience/content framing (ก่อน M6 playtest และ final Notice):** กลุ่มผู้เล่นหลัก อายุที่ตั้งใจ และบริบทใช้เกมคืออะไร? ข้อมูลนี้ไม่ได้ล็อกในต้นฉบับ จึงยังไม่เขียนว่าเกมเหมาะกับเด็กวัยใดหรือกลุ่มวิชาชีพใด

**P-02 — Competition submission (ก่อนกำหนด scope ส่งประกวด และต้องปิดก่อน M7):** งานประกวดใด วันส่ง รูปแบบส่ง และต้องการ Prototype 3 วันหรือ Full Game 7 วัน? แผน [MASTER_PLAN](MASTER_PLAN.md) ครอบคลุม Prototype ที่ล็อก; ถ้ากติกาต้องการเกมเต็ม ให้ปรับแผนอย่างชัดเจน ไม่อ้างว่า M7 ครบ Day 4–7 แล้ว
