# Narrative System

Source of Truth ของ Ink/inkjs integration และสัญญาระหว่าง narrative กับ app ข้อเท็จจริงและ choices ของเรื่องเป็นของ [Narrative Map](../sources/narrative_map_7_day_Updates.md); durable semantics เป็นของ [GAME_STATE](GAME_STATE.md)

## Ink owns branching, app owns durable facts

Ink จัด dialogue, choices, flow และจุดกลับเส้นหลัก inkjs เป็น runtime ใน browser; `NarrativeController` เป็นทางเข้าระบบเดียว React และ Phaser ไม่เดิน `Story` เอง

**ห้าม Ink เป็นเจ้าของ authoritative persistent game state** ได้แก่ relationship, Promise, Memory/permissions, flags และ Album การเก็บ Ink state ใช้คืน narrative cursor, visits/turns และ branch context; ถ้ามี mirror ของ durable variables ใน Ink ต้อง sync จาก Zustand และไม่มี writer อีกชุด

Branch ที่ต้องใช้ durable facts อ่าน projection/query ที่ controller จัดให้ ไม่ใช้ตัวแปร Ink ที่เปลี่ยนเองแล้วค่อยคัดทั้งก้อนไปทับ store รูปแบบ binding/read-only query ต้องยืนยันใน N-02

เหตุการณ์หลักกลับมารวมภายในวัน variant เปลี่ยนถ้อยคำ ระยะห่าง การเข้าร่วม สิ่งของ และผลภายหลัง ไม่มี tree แยกไม่จำกัดเพราะทุกคำตอบต้องได้ฉากเฉพาะ

## File organization

ต้องแยก entry point, เนื้อหาแต่ละวัน, reusable narrative helpers และ generated output เพื่อให้เขียน/ตรวจได้ตาม scene ต้นฉบับ ยังไม่มีชื่อ path/knot final; ตัวอย่างโครงด้านล่างเป็น **ตัวอย่างจัดไฟล์สำหรับ N-02** ไม่ใช่สิ่งที่ล็อกในแชท

```text
narrative/
  main.ink                 entry point / includes
  prologue.ink             บทนำและ Notice entry
  days/day01.ink ...        ต่อวัน; Prototype ใช้ day01–day03
  shared/                  helpers/queries ที่ไม่เป็น state authority
  epilogues/               Full Game; ไม่ include ไฟล์ที่ยังไม่มี
```

Compile เป็น story JSON แล้วโหลดผ่าน Vite import หรือ static resource ใน build ไม่ใช้ compiler ใน UI ของผู้เล่น บันทึกคู่ compiler/runtime และ story content version ที่ใช้สร้าง JSON; pipeline ต้อง fail เมื่อ compile/validation ผิด

ใช้ Scene IDs จาก map เช่น `D1-A`, `D2-A`, `D3-C` เป็น design identity ให้ mapping ไปชื่อ Ink knot ที่ถูก syntax ตรวจย้อนกลับได้ เช่น `d1_a` เป็นเพียงตัวอย่าง ไม่ reuse IDs จากบทเก่าที่ map ระบุว่าเปลี่ยนแล้ว

## Tag schema เชิงความหมาย

ตารางนี้กำหนดความหมายที่ต้องมีตามคำขอ Exact grammar, registry และ validation severity ยังเปิดใน N-02 ไม่สร้าง expression/event IDs ใหม่จากอารมณ์ที่คาดเดา

| Tag | Payload/ความหมาย | ส่งต่อ |
|---|---|---|
| `speaker` | Character/speaker ID ที่อยู่ใน registry; ให้สัมพันธ์กับ line ที่ออก | React dialogue name; world ใช้ข้อมูลแสดงตัวละครตาม command ที่อนุมัติ |
| `expression` | Expression ID ของตัวละครที่สัมพันธ์กับ tag; ต้องมี asset/placeholder mapping | `GameBridge` → Phaser sprite |
| `position` | Named stage position ที่กำหนดใน [UI_ASSET_SPEC](UI_ASSET_SPEC.md) ไม่ส่ง pixel ที่แต่งเองในบท | `GameBridge` → Phaser stage |
| `event` | Event ID ใน allowlist พร้อม payload ที่ผ่าน schema; ระบุ domain effect หรือ presentation command ชัด | Controller → Zustand domain action หรือ GameBridge |

ตัวอย่างแสดงรูปแบบเท่านั้น: `# speaker:<character_id>`, `# expression:<expression_id>`, `# position:<stage_id>`, `# event:<registered_event_id>` ตัวคั่น/การ escape/จำนวน tag ต่อ output และ payload syntax ต้องปิด N-02 ก่อนทำ parser final

Tag อาจอยู่กับ line หรือ output ที่ไม่มีข้อความ Controller ต้องประมวลผล tag-only output ด้วย ไม่เพิ่ม line ว่างใน backlog เพื่อให้ event ทำงาน Speaker/presentation context ที่คงข้าม line หรือถูก clear ตอนเปลี่ยน scene ต้องระบุใน contract final

Event registry ต้องบอกอย่างน้อย: stable ID, category, payload shape, domain action/bridge command, scene ที่อนุญาต, ข้อมูลการรับรู้ของผู้เกี่ยวข้องเมื่อมี relationship effect และวิธีตรวจ duplicate event

Unknown IDs, missing payload, expression ที่ไม่มี character/asset หรือ permission reference ที่ไม่มีอยู่ ต้องตรวจใน compile/validate และ runtime guard ห้าม silently เพิ่ม flag/character หรือแสดงผล default ที่มีความหมายทางเรื่องแทน

## Choice flow

1. Controller sync durable projection สำหรับ branch แล้วเดิน Ink ทีละ output โดยคงลำดับ tags/effects ไม่ใช้ `ContinueMaximally()` ข้าม choice หรือ world interaction ที่ต้องรอ
2. แปลง output เป็น view model ที่ React แสดง และ world commands ที่ bridge ส่งได้; เพิ่ม read-history ตาม identity ที่ยืนยันใน N-02/G-02
3. เมื่อมี `currentChoices` ให้หยุด auto-continue และส่ง choices ของ revision ปัจจุบันให้ React ผู้เล่นเป็นคนเลือกเสมอ Auto/Skip ไม่เลือกแทน
4. เมื่อ UI ส่ง choice ให้ตรวจ revision/index ยังใช้ได้ แล้วเรียก `ChooseChoiceIndex()` ครั้งเดียว ป้องกัน double click และ key repeats ที่เลือก/continue สองครั้ง
5. Parse/validate events ของ output ถัดไป แล้วส่ง durable changes ผ่าน domain actions; presentation commands ผ่าน bridge
6. ถ้าเริ่ม hotspot/puzzle ให้ถือเป็น interaction ที่กำลังรอ ไม่เดินเรื่องต่อจนได้ result ที่ตรง session/result contract ที่กำหนด ผลเก่าจาก scene ที่ปิดแล้วต้องไม่มี effect
7. กลับ branch/rejoin และ snapshot boundary ที่ยืนยันได้ตาม [GAME_STATE](GAME_STATE.md) ไม่ autosave คู่ cursor/state ที่อยู่คนละจังหวะ

นี่เป็น orchestration contract เพื่อรักษา ownership ไม่ใช่การกำหนด choices หรือผลตัวเลขใหม่

## Event จาก Ink ไป Zustand / GameBridge

```text
Ink output + tags
  → NarrativeController parse + validate + ตรวจ context
      → domain event → Zustand action → durable state
      → presentation event → GameBridge command → Phaser / AudioManager
Phaser interaction result
  → GameBridge event → NarrativeController validate → narrative continuation
```

| ประเภท | ตัวอย่างความหมายที่ map รองรับ | กติกา |
|---|---|---|
| Domain | บันทึกการรับปากรถ `bas_car_due_D2`; บันทึกสิ่งที่เด็กบอก/อนุญาต; ผล delayed ledger เมื่อเด็กรับรู้ | ผ่าน action ที่ตรวจ invariant; ไม่ให้ Ink แก้ record ตรง |
| Presentation | แสดง sprite/expression/ตำแหน่ง, เปิด hotspot/puzzle, เล่น SFX | ผ่าน bridge/AudioManager; ไม่ถือ effect เป็นความจริงถาวรอัตโนมัติ |
| Interaction result | ผู้เล่นเลือก hotspot, จบ/พัก puzzle ด้วยวิธีที่รองรับ | เป็นข้อมูล input ให้ flow; relationship เปลี่ยนจากเหตุในเรื่อง ไม่ใช่ performance |

Relationship effects ต้องมีผู้รับรู้ตาม map ตัวอย่างเหตุที่แม่นัทคุย D5-B เก็บการเปิดเผยข้อมูลไว้ก่อน; ผลต่อนัทเกิดใน D6-A เมื่อแม่เล่าให้เขาฟัง ไม่ลดค่าเขาทันทีขณะไม่รู้เรื่อง

World facts ไม่ผูกกับ choice reward เช่น ลุงเหมพบเงินที่วางผิดที่ใน D6-A ทุก branch Choices เปลี่ยนท่าที/ความสัมพันธ์ ไม่เปลี่ยนความจริงนี้

## NarrativeController responsibilities

- เป็นเจ้าของ runtime instance และ flow: continue, choose, waiting interaction, pause และ restore
- รักษา view model/text/read history ที่สัมพันธ์กับ cursor; React ไม่วิเคราะห์ Ink tags เอง
- ตรวจ schema, registry, domain preconditions และ interaction context ก่อน effect
- Sync authoritative projection เข้า narrative ก่อน branch และหลัง load
- Commit durable event ไม่ซ้ำเมื่อ render, remount, restore หรือได้รับ result ซ้ำ กลไก event identity/ledger ต้องระบุใน N-02/G-02
- Capture/restore Ink state พร้อม app state ที่จุดเดียวกัน ใช้ API `story.state.ToJson()` / `LoadJson()` ของ runtime ที่ตรวจ compatibility แล้ว ไม่เก็บ `Story` instance ลง Zustand/localStorage
- Reconstruct presentation จาก checkpoint/scene projection; ไม่ย้อนเล่นคำสั่งที่ทำ relationship ไปแล้ว
- ให้ pause/skip presentation ทำงานโดยไม่เลือกคำตอบหรือสร้าง breach แทนผู้เล่น

Backlog เป็นประวัติอ่าน ไม่ใช่ปุ่ม rewind/undo choice การเพิ่ม rollback gameplay ยังไม่มีการล็อกและไม่รวมใน controls ที่ตกลงแล้ว

API behavior ต้องตรวจจาก [inkjs documentation](https://github.com/y-lohse/inkjs) และ [Ink runtime integration guide](https://github.com/inkle/ink/blob/master/Documentation/RunningYourInk.md) ตามคู่เวอร์ชันที่ใช้

## OPEN QUESTION

**N-02 — Contract finalization (ก่อน M1 real implementation):** ยังไม่ล็อก compiler path/tool, Ink folder/knot mapping, tag grammar/payload, event allowlist/ordering, speaker-context reset และ stable line/event identity รวมรูปแบบ query/mirror จาก Zustand ต้องจัดเป็น contract ที่ตรวจได้ก่อนใช้กับบทจริง ตัวอย่างในไฟล์นี้ยังไม่ใช่ final grammar; ห้าม invent event ของเรื่องหรือค่าผลลัพธ์จาก parser

**N-03 — Content handoff (ก่อน M2 ฉบับ narrative จริง และก่อน M4–M5):** ต้นฉบับเป็น Scene Map และระบุว่ายังไม่มีบทสนทนาเต็ม ใครส่ง/อนุมัติ scene cards, ข้อความ choice และบทไทยที่จะ compile? ชุดเอกสารนี้ไม่แต่งบทแทน ระหว่างรอใช้ technical fixture ที่ติดป้ายและแยกจาก content ส่งประกวดได้

