# กฎสำหรับ Codex

## อ่านตามงาน

| งาน | อ่าน |
|---|---|
| เป้าหมาย/ขอบเขต | [PROJECT.md](PROJECT.md) |
| Milestone/Definition of Done/verification | [MASTER_PLAN.md](MASTER_PLAN.md) |
| Architecture/dependencies/bridge/audio/hosting | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Narrative integration | [docs/NARRATIVE_SYSTEM.md](docs/NARRATIVE_SYSTEM.md) + Narrative Design Source of Truth ที่ PROJECT ระบุ |
| State/save/relationship | [docs/GAME_STATE.md](docs/GAME_STATE.md) |
| UI/accessibility/asset | [docs/UI_ASSET_SPEC.md](docs/UI_ASSET_SPEC.md) |
| คำสั่งพัฒนา | [README.md](README.md) |

## กฎ

- ยึดสิ่งที่ล็อกแล้วในเอกสารเจ้าของเรื่อง หากข้อมูลขัดกันให้รายงานข้อขัดแย้งและหยุดเฉพาะงานที่ขึ้นกับคำตอบ
- ห้ามแต่ง narrative facts, บทสนทนา หรือการตัดสินใจที่ยังไม่ล็อกแทนเจ้าของโปรเจกต์ ใช้ `OPEN QUESTION` พร้อมผลกระทบและ milestone ที่ต้องปิด
- อย่าใช้ narrative ฉบับอื่นแทนไฟล์ Updates ที่ PROJECT ระบุ
- ตัวอย่าง schema/tag/path ที่ระบุว่ายังไม่ล็อกเป็นเพียงรูปแบบอธิบาย ห้ามยกระดับเป็นสเปก final เงียบ ๆ
- ทำตาม ownership และ invariants ในเอกสารที่เกี่ยวข้อง ไม่เปลี่ยน stack/scope หรือเพิ่มบริการภายนอกเอง
- ใช้ placeholder ตาม asset contract; ไม่รอ final art เพื่อเริ่ม shell/integration ที่ได้รับอนุญาตแล้ว
- Placeholder UI ต้อง style-ready ตาม [UI_ASSET_SPEC](docs/UI_ASSET_SPEC.md); ห้าม invent final visual direction ใน M0 หรือแก้ narrative/state logic เพื่อเปลี่ยน style
- งานหลายขั้นตอนให้เขียนแผนสั้นใน milestone ที่เกี่ยวข้อง ระบุคำถามค้างและหลักฐานตรวจ ไม่สร้างชุดเอกสารซ้ำหรือ custom skills เผื่ออนาคต
- เมื่อแก้สเปก ให้อัปเดตไฟล์เจ้าของเรื่องและ cross-reference; ไม่คัดลอกสเปกไปหลายไฟล์
- ตรวจงานด้วย scripts และเกณฑ์ milestone ที่ [MASTER_PLAN.md](MASTER_PLAN.md) ระบุ รายงานสิ่งที่ตรวจจริงและข้อจำกัด ห้ามอ้างว่าผ่านเมื่อยังไม่ได้รัน

## Milestone Workflow และ Owner Approval Gates

กฎนี้ใช้กับทุก Milestone (M0–M7) และทุก implementation batch

### 1. Plan Before Implementation

ก่อนเริ่ม milestone หรือ implementation batch ใหม่ Codex ต้อง:

- อ่าน `AGENTS.md`, `MASTER_PLAN.md` และเอกสาร Source of Truth ที่เกี่ยวข้อง
- ตรวจ branch, working tree และ implementation baseline ปัจจุบัน
- เสนอ implementation plan แบบกระชับ ระบุ scope, deliverables, affected files/modules, dependencies, risks, blockers, out-of-scope work และ verification strategy
- **หยุดรอ Owner Approval อย่างชัดเจนก่อนแก้ไฟล์ ติดตั้ง dependencies หรือเริ่ม implementation**

การอนุมัติ architecture direction หรือ milestone scope ไม่ถือเป็นการอนุมัติ implementation plan โดยอัตโนมัติ

### 2. Approved Implementation

หลัง Owner อนุมัติแผนแล้ว:

- ทำเฉพาะขอบเขตที่ได้รับอนุมัติ
- ไม่ต้องขออนุมัติแผนซ้ำสำหรับงานย่อยหรือ bug fixes ที่อยู่ภายในแผนเดิม
- หากพบข้อขัดแย้งกับ Source of Truth, จำเป็นต้องเปลี่ยน architecture, scope หรือ Owner Decision ให้หยุดเฉพาะส่วนที่ได้รับผลกระทบและขออนุมัติใหม่
- ห้ามสร้าง narrative/domain decisions ที่ยังเป็น OPEN QUESTION

### 3. Verification and Review Gate

เมื่อ implementation batch เสร็จ Codex ต้อง:

- รายงาน implementation summary และ changed files
- รัน relevant verification ตาม `MASTER_PLAN.md`
- รายงาน tests/build ตามผลจริง รวม passed, failed, skipped และ environment limitations
- ระบุ Blocking issues, Non-blocking issues, deviations และ remaining work
- หยุดรอ Owner Review ก่อนปิดงานหรือเริ่ม batch/milestone ถัดไป

ห้ามเปลี่ยน Definition of Done หรือรายงานว่า tests ผ่านทั้งชุดเมื่อยังมีรายการที่ไม่ผ่านหรือไม่ได้ทดสอบ

### 4. Git Approval Gate

- ห้าม commit, push, merge หรือเปลี่ยน integration baseline โดยไม่มี Owner Approval ที่ชัดเจน
- การอนุมัติ implementation ไม่ถือเป็นการอนุมัติ commit/push/merge โดยอัตโนมัติ
- ต้องรักษา branch strategy และ merge order ที่ Owner อนุมัติไว้
- ห้ามเริ่ม milestone ถัดไปโดยอัตโนมัติ

### 5. Communication

- สื่อสาร plans, questions, blockers, progress reports และ final summaries กับ Owner เป็นภาษาไทย
- ใช้ภาษาอังกฤษสำหรับ source code, identifiers, API names และ technical terminology ตามความเหมาะสม
- เมื่อจำเป็นต้องให้ Owner ตัดสินใจ ให้ระบุคำถาม ผลกระทบ และทางเลือกอย่างกระชับ
