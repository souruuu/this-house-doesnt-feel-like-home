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
- งานหลายขั้นตอนให้เขียนแผนสั้นใน milestone ที่เกี่ยวข้อง ระบุคำถามค้างและหลักฐานตรวจ ไม่สร้างชุดเอกสารซ้ำหรือ custom skills เผื่ออนาคต
- เมื่อแก้สเปก ให้อัปเดตไฟล์เจ้าของเรื่องและ cross-reference; ไม่คัดลอกสเปกไปหลายไฟล์
- ตรวจงานด้วย scripts และเกณฑ์ milestone ที่ [MASTER_PLAN.md](MASTER_PLAN.md) ระบุ รายงานสิ่งที่ตรวจจริงและข้อจำกัด ห้ามอ้างว่าผ่านเมื่อยังไม่ได้รัน

