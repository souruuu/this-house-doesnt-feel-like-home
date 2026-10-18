# Narrative System

Source of Truth ของ Ink/inkjs integration และสัญญาระหว่าง narrative กับ app ข้อเท็จจริงและ choices ของเรื่องเป็นของ [Narrative Map](../sources/narrative_map_7_day_Updates.md); durable semantics เป็นของ [GAME_STATE](GAME_STATE.md)

## Emergency Day 1–3 content authority

Owner อนุมัติ production content และ concrete implementation plan เมื่อ 17 October 2026 ดู [Active Handoff/CR precedence](../sources/emergency-demo-2026-10-17/README.md) N-03 content-ready เฉพาะ P1-D1-v0.3/P2-D2-v0.2/P3-D3-v0.3 ไม่ใช่การรับบทหรือ domain rules ของ Day 4–7 ทั้งหมด ข้อความ pending handoff ด้านล่างเป็นสถานะ baseline ก่อน approval นี้

Production ใช้ `narrative/main.ink`, `prologue.ink`, `days/day01.ink`–`day03.ink`, shared helpers และ production references แยกจาก fixture Stable IDs `demo.<content-ref>` ตรวจย้อนกลับถึงข้อความ section B/B0 โดย validator เช็ก checksums/ข้อความ/ชื่อผู้พูดและ traverse ผ่าน controller จริง Scene IDs ใช้ SC-D1-01…SC-D3-03 ตาม CR ไม่ reinterpret D1-B/D2-A ของรถ

Controller/Registry รับ production scope ผ่าน typed configuration โดยรักษา validation-before-commit, atomic ledger, read-only query timing และ stale-input guards เดิม ไม่มี tag เพิ่ม Query `demo_flag` ผูกด้วย `lookaheadSafe=false`; อย่าเรียก query ตรงใน choice text/quoted string ตามข้อจำกัด inkjs เดิม Production Save/Resume deferred ไม่ใช้ fixture save identity

## Ink owns branching, app owns durable facts

Ink จัด dialogue, choices, flow และจุดกลับเส้นหลัก inkjs เป็น runtime ใน browser; `NarrativeController` เป็นทางเข้าระบบเดียว React และ Phaser ไม่เดิน `Story` เอง

**ห้าม Ink เป็นเจ้าของ authoritative persistent game state** ได้แก่ relationship, Promise, Memory/permissions, flags และ Album การเก็บ Ink state ใช้คืน narrative cursor, visits/turns และ branch context ห้าม mirror authoritative state ทั้งก้อนใน Ink หรือใช้ Ink เป็น writer อีกชุด

Branch ที่ต้องใช้ durable facts อ่านผ่าน **read-only `NarrativeQueryPort` หรือ abstraction เทียบเท่า** ที่ controller จัดให้ เช่น `hasPromise`, `hasMemory`, `hasPermission`, `getFlag` Query อ่าน authoritative state จาก Zustand เท่านั้น ไม่เปิด mutation ให้ Ink และไม่คัดตัวแปร Ink ทั้งก้อนไปทับ store หลัง load ต้องให้ query อ่าน session ที่ restore แล้วก่อนเดิน branch ต่อ

เหตุการณ์หลักกลับมารวมภายในวัน variant เปลี่ยนถ้อยคำ ระยะห่าง การเข้าร่วม สิ่งของ และผลภายหลัง ไม่มี tree แยกไม่จำกัดเพราะทุกคำตอบต้องได้ฉากเฉพาะ

## File organization

โครง source **LOCKED:** one Ink file per day, shared helpers และ technical fixture แยกสำหรับ M1 ตามโครงนี้ Generated narrative output ต้องแยกจาก source; fixture ไม่ใช่ release story และห้ามปนใน release entry/build

```text
narrative/
  main.ink
  prologue.ink
  days/
    day01.ink
    day02.ink
    ...
    day07.ink
  shared/
    helpers.ink
  fixtures/
    technical_fixture.ink
```

Prototype ใช้ Day 1–3 ตาม scope; ไม่สร้างบท Day 4–7 หรือ include ไฟล์ที่ยังไม่มีเพียงเพื่อเติมโครง Compile เป็น story JSON แล้วโหลดผ่าน Vite import หรือ static resource ใน build ไม่ใช้ compiler ใน UI ของผู้เล่น Script contract ล็อกเป็น `npm run narrative:compile` และ `npm run narrative:validate`; pipeline ต้อง fail เมื่อ compile/validation ผิด Exact executable และ minor/patch ของ compiler/runtime เป็นงานตรวจ compatibility **M0/A-01** ใน [ARCHITECTURE](../ARCHITECTURE.md) บันทึกคู่ที่ใช้และ identity ของ build/schema/story ตาม [GAME_STATE](GAME_STATE.md)

ใช้ Scene IDs จาก map เช่น `D1-A`, `D2-A`, `D3-C` เป็น design identity ให้ mapping ไปชื่อ Ink knot ที่ถูก syntax ตรวจย้อนกลับได้ เช่น `d1_a` เป็นเพียงตัวอย่าง ไม่ reuse IDs จากบทเก่าที่ map ระบุว่าเปลี่ยนแล้ว

## Initial tag contract — LOCKED

Initial tag set มีเพียง **`line`, `speaker`, `expression`, `position`, `event`** ไม่เพิ่ม tag เผื่ออนาคตโดยไม่มี requirement ใช้ key/value ตามรูปแบบ `# key:value` ด้านล่าง; expression/stage registries ต้องอ้าง asset contract ไม่สร้าง IDs จากอารมณ์ที่คาดเดา

| Tag | Value/ความหมาย | ส่งต่อ |
|---|---|---|
| `line` | Stable Line ID ของทุก dialogue/readable narrative line | Global read-line history, Skip read text only และ identity ของ backlog entry |
| `speaker` | Character/speaker ID ที่อยู่ใน registry; ให้สัมพันธ์กับ line ที่ออก | React dialogue name; world ใช้ข้อมูลแสดงตัวละครตาม command ที่อนุมัติ |
| `expression` | Expression ID ของตัวละครที่สัมพันธ์กับ tag; ต้องมี asset/placeholder mapping | `GameBridge` → Phaser sprite |
| `position` | Named stage position ที่กำหนดใน [UI_ASSET_SPEC](UI_ASSET_SPEC.md) ไม่ส่ง pixel ที่แต่งเองในบท | `GameBridge` → Phaser stage |
| `event` | **Stable Event ID เท่านั้น**; TypeScript EventRegistry เป็นเจ้าของความหมาย | Controller → Zustand domain action หรือ GameBridge ตาม category ของ registry |

รูปแบบ: `# line:<stable_line_id>`, `# speaker:<character_id>`, `# expression:<expression_id>`, `# position:<stage_id>`, `# event:<stable_event_id>` ตัวอย่าง Event ID เชิงแนวคิดจาก decision: `# event:d1_b_evt_004` ไม่ใช่การเพิ่ม release event ของฉากนี้

ห้ามฝัง authoritative game-state payload ลง Ink เช่น `trust:+1`, `promise.commit` พร้อม arbitrary payload หรือ permission state โดยตรง Domain parameters/ความหมายของ event ต้องอยู่ฝั่ง TypeScript และมาจาก scene/domain rules ที่อนุมัติ ไม่ใช้ tag เป็นทางเพิ่ม state values เอง

Tag อาจอยู่กับ line หรือ output ที่ไม่มีข้อความ Controller ต้องประมวลผล tag-only output โดยไม่สร้าง backlog line ว่าง `speaker` / `expression` / `position` persist ได้ **ภายใน scene** และต้อง reset presentation context เมื่อเข้า scene ใหม่ ห้ามรั่วข้าม scene Reserved no-speaker value คือ **`speaker:none`**

ทุก readable line ต้องมี stable Line ID ห้ามใช้เลขตำแหน่งบรรทัดหรือข้อความไทยเป็น identity ID ต้องไม่เปลี่ยนเพียงเพราะแทรก/แก้ข้อความอื่น Global read-line history ใช้ตัดสิน Skip ข้าม New Game/slots; backlog identity ใช้ Line ID เดียวกันแต่ transcript อยู่เฉพาะ run/save/session ปัจจุบันตาม [G-03](GAME_STATE.md#scope--g-03-closed)

## TypeScript EventRegistry และ idempotency

EventRegistry เป็น metadata/dispatch contract ฝั่ง TypeScript ไม่เป็น state store แต่ละ event ต้องมี stable unique ID และ category ที่ตรวจได้ว่าเป็น **domain → Zustand domain action** หรือ **presentation → GameBridge** พร้อมข้อมูล/เงื่อนไขที่ใช้ตรวจ schema, scene context และการรับรู้ของผู้เกี่ยวข้องเมื่อมี relationship effect ไม่มี arbitrary authoritative payload จาก Ink

Durable events ต้องมี stable unique Event ID และ **committed-event ledger หรือกลไกเทียบเท่า** อยู่ใน per-playthrough durable state ตาม [GAME_STATE](GAME_STATE.md) Commit domain effect และเครื่องหมายว่า committed ให้สอดคล้องกัน เพื่อไม่ commit ซ้ำจาก reload, restore, React remount, duplicate interaction result หรือ rerender Registry ไม่เก็บ committed status และ ledger ไม่เป็น global unlock ข้าม run

Unknown event/tag/ID, readable line ที่ไม่มี stable identity, expression ที่ไม่มี character/asset หรือ reference ที่ไม่มีอยู่ ต้อง validation fail หรือ runtime guard ห้าม silently create flag/character หรือ default behavior ที่มีความหมายทางเรื่อง

## Choice flow

1. Controller ให้ query port อ่าน authoritative state แล้วเดิน Ink ทีละ output ไม่ใช้ `ContinueMaximally()` ข้าม choice หรือ world interaction ที่ต้องรอ
2. ประมวลผลแบบ deterministic: **parse output → validate tags/IDs/output ทั้งชุด → commit domain events → execute presentation commands → publish line/view model ให้ React → wait for continue/choice/interaction** ห้าม commit state ครึ่งหนึ่งก่อน validation จบ
3. เมื่อมี `currentChoices` ให้หยุด Auto/Skip และส่ง choices ของ revision ปัจจุบันให้ React ผู้เล่นเป็นคนเลือกเสมอ
4. เมื่อ UI ส่ง choice ให้ตรวจ revision/index แล้วใช้ **atomic choice transaction:** lock input → Ink advances ด้วย `ChooseChoiceIndex()` ครั้งเดียว → parse → validate → commit domain events → presentation update → checkpoint update → transaction complete → unlock input → autosave if required ป้องกัน double click/key repeats และไม่ให้ SaveCoordinator snapshot กลาง transaction
5. ถ้าเริ่ม hotspot/puzzle ให้รอ result ที่ตรง session/context ผลเก่าจาก scene ที่ปิดแล้วหรือ duplicate result ต้องไม่มี durable effect ซ้ำ
6. `SaveCoordinator` snapshot ได้เฉพาะ **Safe Checkpoint** ตาม [G-02](GAME_STATE.md#safe-checkpoint--g-02-closed) ไม่ autosave ทุก line หรือระหว่าง active puzzle หลัง load Auto/Skip off และไม่ replay one-shot commands/SFX

นี่เป็น orchestration contract เพื่อรักษา ownership ไม่ใช่การกำหนด choices หรือผลตัวเลขใหม่

## Event จาก Ink ไป Zustand / GameBridge

```text
Ink output + tags (event = stable ID only)
  → NarrativeController parse → validate whole output + EventRegistry
      → commit domain events → Zustand actions + committed-event ledger
      → execute presentation commands → GameBridge → Phaser / AudioManager
      → publish line/view model → React → wait
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
- รักษา view model/text/Line ID ที่สัมพันธ์กับ cursor; ใช้ global read-line history แต่ backlog เป็น transcript ของ run ปัจจุบัน React ไม่วิเคราะห์ Ink tags เอง
- ตรวจ schema, registry, domain preconditions และ interaction context ก่อน effect
- ให้ narrative อ่าน authoritative state ผ่าน read-only query port ก่อน branch และหลัง load; ไม่ mirror state ทั้งก้อน
- ใช้ stable Event ID และ committed-event ledger เพื่อไม่ commit durable event ซ้ำ
- ให้ Ink snapshot/restore ผ่าน interface แก่ `SaveCoordinator` โดยใช้ `story.state.ToJson()` / `LoadJson()` ของ runtime ที่ตรวจ compatibility แล้ว ไม่เป็นเจ้าของ save/load orchestration และไม่เก็บ `Story` instance ลง Zustand/localStorage
- Reconstruct semantic presentation ตาม checkpoint; dialogue load กลับ line เดิมแบบแสดงข้อความเต็ม Choice load กลับ choice เดิมที่ยังไม่เลือก ไม่ replay one-shot presentation/SFX; BGM/ambient restore แบบ semantic โดยไม่คืน playback timestamp
- ให้ pause/skip presentation ทำงานโดยไม่เลือกคำตอบหรือสร้าง breach แทนผู้เล่น

Backlog เป็นประวัติอ่าน ไม่ใช่ปุ่ม rewind/undo choice การเพิ่ม rollback gameplay ยังไม่มีการล็อกและไม่รวมใน controls ที่ตกลงแล้ว

API behavior ต้องตรวจจาก [inkjs documentation](https://github.com/y-lohse/inkjs) และ [Ink runtime integration guide](https://github.com/inkle/ink/blob/master/Documentation/RunningYourInk.md) ตามคู่เวอร์ชันที่ใช้

## Decision status

**N-02 — CLOSED.** Source organization, initial tags, stable Line/Event IDs, TypeScript EventRegistry, idempotency, scene context reset, query port และ deterministic processing ล็อกตาม decision รอบนี้ Exact compiler/runtime executable และ minor/patch อยู่ M0/A-01 ไม่เปิด N-02 ซ้ำ Actual release lines/events/domain parameters ยังต้องมาจาก content/domain decisions ที่อนุมัติใน N-03/G-01 ไม่ใช่ให้ Codex แต่งเพื่อเติม registry

## OPEN QUESTION

สถานะรับบท ณ M0 (2026-10-13): shared Google Doc ที่แจ้งมามีบทห้าวัน ขัดกับ Narrative Map เจ็ดวันที่ล็อกใน PROJECT จึงยังไม่รับเป็น release Ink และไม่ปรับ facts/วัน/choices ให้ตรงกันเอง ความขัดแย้งนี้ต้องให้เจ้าของยืนยันใน N-03 ก่อนงาน content; ไม่ขวาง technical compiler fixture ของ M0

**N-03 — Content handoff (ก่อน M2 ฉบับ narrative จริง และก่อน M4–M5):** ต้นฉบับเป็น Scene Map และระบุว่ายังไม่มีบทสนทนาเต็ม ใครส่ง/อนุมัติ scene cards, ข้อความ choice และบทไทยที่จะ compile? ชุดเอกสารนี้ไม่แต่งบทแทน ระหว่างรอใช้ technical fixture ที่ติดป้ายและแยกจาก content ส่งประกวดได้

