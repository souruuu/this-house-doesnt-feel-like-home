# Game State และ Save

Source of Truth ของ durable schema/ownership/invariants และ persistence ข้อเท็จจริงเรื่อง/ผลของ choice อยู่ใน [Narrative Map](../sources/narrative_map_7_day_Updates.md) ไม่ใช้ schema นี้แต่งข้อมูลที่เด็กยังไม่เล่าหรือสิทธิที่ยังไม่ให้

## Emergency Demo scope — 17 October 2026

ใช้ [Owner-approved CR/handoff](../sources/emergency-demo-2026-10-17/README.md) สำหรับข้อเท็จจริง Day 1–3 ที่ supersede baseline เดิม Demo store เก็บเฉพาะ approved evidence-backed facts, owner/ชนิด seen หรือ told/Line ID และ per-run committed-event ledger ใน atomic update ไม่มี TSPR values, permission grants, Promise formulas หรือ production save schema ที่เดาขึ้น

Production Save/Resume deferred เฉพาะ Emergency Demo; refresh/close เริ่มเล่นใหม่และ UI แจ้งข้อจำกัด ไม่มีการอ่าน/เขียน fixture slots/profile เป็น production progress ข้อกำหนด G-02/G-03 และ full-game save/release gates ด้านล่างคงเดิม ไม่ถือว่าผ่านจากการเลื่อนงานนี้

## Ownership และ logical schema

Zustand เป็น authoritative in-memory durable state เปลี่ยนผ่าน domain actions ที่ตรวจ invariant; `SaveCoordinator` เป็นเจ้าของ save/load orchestration โดยรวบรวม durable state snapshot จาก Zustand และ Ink snapshot ผ่าน `NarrativeController` แล้วประสานกับ `SaveRepository`; transient UI/animation/drag coordinates/engine instances ไม่ใช่ durable domain state

| Field group | ข้อมูลที่ต้องเก็บ | Writer / consumer |
|---|---|---|
| `progress` | current day 1–7, current scene ID และ boundary/context ที่ต้องคืน | Controller/domain action; UI/world อ่าน |
| `relationships` | TSPR แยกรายตัวละครและมิติ | Domain actions ตรวจเหตุและการรับรู้; Ink อ่าน projection |
| `promises` | ใครตกลง อะไร เมื่อไร ขอบเขต ผู้เสนอ ประเภท และสถานะ/ประวัติการเปลี่ยน | Domain actions; narrative/Album อ่าน |
| `memories` | `seen`, `told`, `permission` แยก provenance/owner/scope | Domain actions; queries/Album อ่านเท่าที่รู้จริง |
| `flags` | ข้อเท็จจริง/การกระทำที่มีผลหรือคุมข้อมูล พร้อมต้นทาง ผู้รับรู้ และผลที่รอ | Domain actions; narrative projection |
| `album` | ข้อมูลที่ได้รู้จักและงาน/ของที่มีจริง อ้าง memory/Promise/event | Domain actions/projection; React Album |
| Committed-event ledger | Stable unique IDs ของ durable events ที่ commit แล้วใน playthrough นี้ | Domain commit ผ่าน controller; อยู่ใน durable state ไม่อยู่ใน EventRegistry |
| `save` | Build/schema/story identity, timestamp, GameState/Ink/backlog และ semantic checkpoint | `SaveCoordinator` จัด capture/validation/restore; `SaveRepository` อ่าน/เขียน envelope |
| Profile settings / read-line IDs | Settings และ global read history ที่คงข้าม New Game/slots | App/controller; profile scope ตาม G-03 ด้านล่าง ไม่เป็น authoritative narrative facts |
| Current backlog | Transcript ของ run/save/session ปัจจุบัน พร้อม stable Line IDs | Controller; per-save/per-playthrough ไม่รวม transcript จาก run อื่น |

ตัวอย่าง TypeScript ต่อไปนี้แสดง **logical shape** ไม่ใช่ final DTO ที่อนุมัติทุก field ชื่อ ID และ representation อาจปรับเมื่อปิด contract โดยไม่เปลี่ยน semantics ที่ล็อก จุดสำคัญที่ยังไม่ล็อกใช้ `unknown` แทนค่าเริ่มต้นที่เดา

```ts
type Day = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type CharacterId = string; // registry ยึดตัวละครใน Narrative Map
type SceneId = string;     // mapping กลับ Scene IDs ของต้นฉบับ
type PromiseType = 'Task' | 'Space' | 'Information' | 'Boundary';

type RelationshipState = {
  trust: unknown; safety: unknown; pressure: unknown; respect: unknown;
}; // G-01: representation/initial values/rules ยังไม่ล็อก

type PromiseStatus =
  | 'proposed' | 'awaiting_confirmation' | 'committed'
  | 'fulfilled' | 'renegotiated' | 'breached';

type EvidenceRef = {
  sceneId: SceneId;
  eventId: string;
  knownBy: string[];
};

type PromiseRecord = {
  id: string;
  types: PromiseType[];
  proposer: string;
  parties: string[];
  subjectId: string;
  scope: unknown;        // เวลา/สถานที่/สิ่งที่ตกลง ต้องมาจากฉากจริง
  status: PromiseStatus;
  history: EvidenceRef[];
};

type MemoryRecord = {
  id: string;
  ownerId: string;
  topicId: string;
  seen: EvidenceRef[];
  told: EvidenceRef[];
  permission: unknown[]; // owner, action, object/topic, recipient, scope
};

type FlagRecord = {
  value: boolean | number | string;
  evidence: EvidenceRef[];
  pendingConsequenceIds: string[];
};

type AlbumRecord = {
  characterId: CharacterId;
  sourceRefs: string[];
}; // ชื่อ/ความชอบ/งาน/คำตกลง/ความทรงจำ/ของจาก source จริง

type GameState = {
  progress: { currentDay: Day; currentScene: SceneId };
  relationships: Record<CharacterId, RelationshipState>;
  promises: Record<string, PromiseRecord>;
  memories: Record<string, MemoryRecord>;
  flags: Record<string, FlagRecord>;
  album: Record<CharacterId, AlbumRecord>;
  committedEventIds: string[]; // unique durable event ledger ต่อ playthrough
};

type SemanticCheckpoint = {
  sceneId: SceneId;
  kind: string; // controlled Safe Checkpoint kind ตาม contract ด้านล่าง
  lineId?: string; // dialogue checkpoint ต้องมี stable Line ID
  presentation: Record<string, unknown>; // validated JSON semantic state
};

type TranscriptEntry = {
  lineId: string;
  text: string; // ข้อความที่ runtime แสดงจริง ไม่ใช่บทที่แต่งใน schema
  speakerId: CharacterId | 'none';
};

type SaveEnvelope = {
  appBuildVersion: string;
  saveSchemaVersion: number; // migration identity; implementation แรกเริ่มที่ 1
  storyCompatibilityVersion: string;
  timestamp: number;     // หน่วยต้องบันทึกให้ชัดเมื่อ implement
  game: GameState;
  narrative: { inkStateJson: string };
  checkpoint: SemanticCheckpoint;
  backlog: TranscriptEntry[]; // เฉพาะ transcript ของ save/playthrough นี้
};
```

`unknown` ใน domain fields ยังต้องปิด G-01; semantic presentation records ต้องใช้ validated JSON types ตาม scene/asset contract ไม่ใช่เก็บ engine objects รูปแบบ field ในตัวอย่างเป็น logical DTO representation โดยไม่กำหนดค่าเริ่มต้น state ใหม่ ห้าม serialize functions, class instances, textures/audio หรือ store ทั้งก้อน

## Hidden TSPR

| มิติ | ความหมายที่ล็อก |
|---|---|
| Trust | ความคาดหมายว่าจะทำตามที่บอก สะสมจากหลายเหตุการณ์ |
| Safety | ความสบายใจต่อพื้นที่และบริบท เสียง คนที่อยู่ และตำแหน่ง |
| Pressure | ภาระจากการถามซ้ำ เร่ง ควบคุม หรือขอคำตอบต่อหน้าคนอื่น |
| Respect | ประวัติการให้สิทธิเลือก ขออนุญาต และรักษาขอบเขตข้อมูล |

- **ห้ามรวม TSPR เป็น score เดียว** และไม่แสดงค่าตัวเลขให้ผู้เล่นใน UI
- Trust/Respect เปลี่ยนค่อยเป็นค่อยไป; Safety/Pressure ตามบริบท ไม่รีเซ็ตทุกเช้าโดยไม่มีเหตุ
- การเงียบ/ไม่เล่าไม่ได้แปลว่า Trust ต่ำ; การยอมทำตามไม่ได้แปลว่า Respect สูง
- ความช่วยเหลือพื้นฐานและเหตุการณ์หลักไม่ gated ด้วย Trust; การรู้เรื่องหนักครบไม่เป็นเงื่อนไขจบ
- Relationship effect ต้องเกิดเมื่อเด็กเห็น/ทราบเหตุจริง ใช้ evidence/knownBy และ delayed ledger ไม่เพิ่มค่าจากเหตุที่เด็กยังไม่รู้
- **Puzzle skill ไม่กระทบ relationship** ไม่ใช้ความเร็ว ความผิดพลาด hint/help/click-to-place/พัก เป็น reward หรือ penalty ผลจากการทำตามคำตกลงและเคารพเจ้าของของต้องแยกจาก performance

สูตร scale, initial values, deltas และ branch thresholds ไม่มีใน map; ดู G-01

## Promise System

| ประเภท | หน้าที่ |
|---|---|
| Task | งานร่วมกันตามเวลา/ขอบเขต |
| Space | ที่นั่งหรือที่เก็บของภายในร้าน |
| Information | ขอบเขตการใช้/เปิดเผยข้อมูล |
| Boundary | วิธีปฏิบัติและขอบเขตที่ทำได้จริง |

มี Promise สำคัญประมาณ **4–6 ครั้งตลอด 7 วัน** หนึ่งข้อตกลงมีหลายประเภทได้ ไม่สร้างสัญญาใหม่ทุกครั้งที่ตรวจ/ปรับต่อเนื่อง และไม่ทำ quest/task manager

สถานะที่ map ล็อก: **เสนอ → รอยืนยัน → รับปาก**; จากรับปากอาจ **ทำแล้ว / เปลี่ยนข้อตกลงร่วมกัน / ผิดข้อตกลง** การเปลี่ยนข้อตกลงต้องมีการยินยอมจริง ไม่ให้ผู้เล่น mark renegotiated ฝ่ายเดียว ไม่รับปากตรงไปตรงมาไม่ใช่ breach

ทุกสัญญามีจังหวะหลักให้จัดการก่อนหมดเวลา ไม่ผิดเพราะพลาด hotspot ไม่อ่าน Album หรือใช้ puzzle assistance ถ้าผิดแล้วบันทึกเหตุจริง มีทางรับผิดชอบและตกลงใหม่ แต่ไม่ reset Trust/Respect หรือบังคับให้อภัยทันที

ตัวอย่าง IDs ที่มีใน map ได้แก่ `bas_car_due_D2`, `bas_music_due_D7`, `manao_storage_scope`, `manao_display_permission` แต่สิทธิแสดงรูปและข้อตกลงเก็บสมุดเป็นคนละเรื่อง ไม่แปลงทุก permission เป็น Promise ย่อย

## Memory และ permission

`seen`, `told`, `permission` เป็น **สามกลุ่มข้อมูลแยกกัน ไม่ใช่ขั้นบันไดอัตโนมัติ** และไม่ใช่สถานะเดียวที่ทับกันเมื่อเลื่อนระดับ

| กลุ่ม | ใช้ได้เพียง |
|---|---|
| `seen` | สิ่งที่ผู้เล่นสังเกตจริง; ไม่อนุมานเหตุ/เจ้าของ/ประวัติ |
| `told` | ข้อมูลที่เจ้าตัวเล่าจริง พร้อมผู้เล่าและผู้รับรู้ |
| `permission` | สิทธิที่เจ้าของให้แก่ผู้รับ ต่อ action/topic/object ภายใน scope นั้น |

เห็นลูกอมสองเม็ดไม่เท่ากับรู้ว่าอีกเม็ดให้แม่; ได้ฟังเรื่องอาหารจากนัทไม่เท่ากับอนุญาตให้เล่ากับแม่; ฝากสมุดไม่ให้สิทธิอ่าน/แขวนภาพ ถ้าไม่มีอนุญาตให้ถือว่า **ยังไม่ได้อนุญาต**

ต้อง query permission ให้ตรง owner/action/object/recipient/scope ไม่ใช้ boolean `hasConsent` ครอบทุกเรื่อง Model การแก้/ถอนสิทธิและการเก็บ scope final ต้องปิด G-01 จาก scene cards ไม่ตั้ง “อนุญาตตลอดไป” เอง

## Flags, delayed consequences และ Album

Flags มีหน้าที่คุมข้อมูลหรือผลที่มีจังหวะเกิดจริง ทุก flag/event ต้องมีต้นทางและใครรู้ ไม่ยก flag เก่าที่ map ตัดทิ้งกลับมาใช้ ใช้ต้นฉบับหัวข้อ “Delayed Consequence Ledger” เป็นรายการผลรายฉาก

แยก world fact จาก knowledge/response ของตัวละคร ความจริงที่ลุงเหมวางเงินผิดที่และพบ Day 6 เหมือนกันทุก branch; ไม่เขียน flag ให้ choice เปลี่ยนว่าเงินอยู่ที่ไหน

Album เปิดหน้าตัวละครเมื่อรู้ชื่อ เก็บชื่อที่เขาบอก ความชอบ งานที่ทำร่วมกัน คำตกลง ความทรงจำและของที่ให้ตามจริง ใช้ source refs เพื่อไม่สร้างข้อมูลลับซ้ำที่ไม่อยู่ใน Memory ห้ามช่อง Secret, completion percentage หรือ reward จากเรื่องหนัก และไม่ทำข้อมูลส่วนตัวใน Album ให้ NPC อื่นอ่านโดยอัตโนมัติ

Final Shop State/epilogue ใช้เหตุการณ์และสิทธิจริงรายคน/รายสิ่งของ ของที่ฝากยังเป็นของเด็ก ไม่สร้าง ownership transfer จากการเก็บไว้ รายละเอียด ending variants ให้อ้าง map โดยตรง ไม่เก็บค่า `totalScore` หรือ `trueEndingUnlocked`

## Scope — G-03 CLOSED

| Scope ที่ล็อก | ข้อมูล | New Game / load slot อื่น |
|---|---|---|
| **Global/profile** | Settings: Text Speed, Volume, Reduced Motion, Instant Text และ preferences ประเภทเดียวกัน; **read Line IDs** สำหรับ Skip read text only | คง settings และประวัติว่าเคยอ่านแล้วใน profile; load save เก่าไม่ย้อนลบ global read history |
| **Per-save/per-playthrough** | GameState, Ink state, relationships, Promises, Memories, permissions, flags, committed-event ledger, Album และ current progress | Restore เฉพาะ playthrough ของ save นั้น; New Game เริ่ม run ใหม่โดยไม่รวมความรู้/สิทธิจาก run เก่า |
| **Per-save/per-run/session transcript** | Current backlog พร้อม stable Line IDs | ดู transcript ของ run/save/session ปัจจุบันเท่านั้น ไม่รวมข้อความจากทุก playthrough เป็น backlog เดียว |

Global read history บอกเพียงว่าเคยอ่านข้อความที่มี Line ID นั้น **ไม่ให้ Memory/permission/Album ของ run ปัจจุบันเพิ่มตามไปด้วย** Album ต้องสะท้อนสิ่งที่ run นั้นรู้/ได้รับอนุญาตจริง ไม่มี global ending/epilogue unlock หรือ Endings Gallery

Settings และ read Line IDs เก็บแบบ local-first ผ่าน persistence boundary เดิมโดยแยก scope จาก slot snapshots; ห้าม restore profile ทั้งก้อนจาก save slot แล้วทับ preferences/read history ของ profile ขอบเขตนี้ไม่เพิ่ม backend หรือ persistence system ใหม่

## Save และ local-first persistence

มี **autosave 1 ช่อง + manual 3 ช่อง** เล่นต่อโหลด autosave ล่าสุดที่ valid โหลดเกมแสดงทั้งสี่ช่อง; slot ว่าง/เสีย/เข้ากันไม่ได้ต้องแยกให้เข้าใจตาม [UI_ASSET_SPEC](UI_ASSET_SPEC.md)

ตัวอย่าง interface ตาม abstraction ที่ล็อก; ชื่อเมธอด/slot tokens เป็น technical representation Save timing ให้ยึด Safe Checkpoint contract ด้านล่าง:

```ts
type SaveSlot = 'autosave' | 'manual-1' | 'manual-2' | 'manual-3';
interface SaveRepository {
  save(slot: SaveSlot, data: SaveEnvelope): Promise<void>;
  load(slot: SaveSlot): Promise<SaveEnvelope | null>;
  delete(slot: SaveSlot): Promise<void>;
}
```

`LocalStorageSaveRepository` เป็น implementation แรก จัด storage keys/serialization ภายใน repository; `SaveCoordinator` capture snapshot จาก Zustand และ `NarrativeController`, แล้ว restore ผ่านทั้งคู่ ไม่ให้ components/Ink/Phaser เรียก localStorage เอง ไม่เก็บ assets ลง save ไม่มี cloud/cross-device sync ใน v1

Snapshot ต้อง capture durable state พร้อม committed-event ledger, Ink cursor, current backlog และ semantic checkpoint ที่สัมพันธ์กัน `SaveCoordinator` ประสาน capture/restore ให้ coherent; `SaveRepository` ทำ persistence โดยไม่ตัดสิน story Metadata ที่ใช้โชว์ slot ต้องมาจาก save ที่ validate แล้ว Global settings/read-line history ไม่ถูกย้ายเข้า per-slot GameState

## Safe Checkpoint — G-02 CLOSED

Save ได้เฉพาะ **Safe Checkpoint:** Ink, Zustand และ semantic presentation อยู่ใน coherent state เดียวกัน และไม่มี transaction/domain commit/scene transition/interaction result กำลังประมวลผลกลางทาง `SaveCoordinator` ห้าม snapshot กลาง transaction

| ชนิด | Contract ที่ล็อก |
|---|---|
| Autosave | ไม่ save ทุก dialogue line; ใช้ meaningful boundaries เช่น scene initialized, important choice transaction complete, durable event สำคัญ commit เสร็จ, ก่อน/หลัง puzzle, scene end และ day transition เฉพาะเมื่อ safe |
| Manual save | อนุญาตเมื่อ dialogue line รอ Continue, choice รอเลือก, world/point-click idle, pause menu ที่มาจาก safe state หรือก่อน/หลัง puzzle |
| Active puzzle | **ไม่อนุญาต save** รวม pause ที่เปิดจาก active puzzle; ใช้ checkpoint ก่อน/หลัง puzzle ไม่ serialize active piece/drag/tween หรือ transient puzzle presentation |
| Choice checkpoint | Load กลับ choice เดิมที่ยังไม่เลือก และไม่มี durable result ของ choice ถูก commit ล่วงหน้า |
| Dialogue checkpoint | Load กลับ line เดิม พร้อม stable Line ID โดยแสดงข้อความเต็มทันที ไม่เก็บ typewriter cursor/จำนวนตัวอักษรที่เปิดไปแล้ว |

รายการ autosave boundaries ไม่ใช่เหตุให้ invent story event ใหม่ การ commit event สำคัญหรือ transition ต้องเสร็จและ checkpoint coherent ก่อนบันทึกเสมอ

Checkpoint เก็บ **semantic presentation state** ที่จำเป็น เช่น scene ID, Line ID/checkpoint kind, current speaker, character expression, named stage position และ semantic world state รวมข้อมูลที่ต้อง reconstruct line/choice เดิม BGM/ambient เก็บ semantic state ได้โดยไม่เก็บ playback timestamp

ห้าม serialize Phaser instances, React DOM, texture/audio objects, tweens, camera shake progress, drag coordinates หรือ transient animation objects ค่า/IDs ใน checkpoint ต้องมาจาก view/world state ที่ผ่าน validation จริง ไม่แต่ง defaults หรือผล narrative เพื่อให้ restore ผ่าน

### Atomic choice transaction

```text
user chooses → lock input → Ink advances → parse
→ validate tags/IDs/output ทั้งชุด → commit domain events + ledger
→ presentation update → checkpoint update → transaction complete
→ unlock input → autosave if required
```

ไม่มี durable result ก่อนผู้เล่นเลือกจริง Validation ต้องครบก่อน commit; snapshot ได้หลัง transaction complete เท่านั้น Durable action และ committed-event marker ต้องไม่แยกเป็น save คนละจังหวะ

### Atomic load transaction

```text
pause → read SaveEnvelope → validate → migrate → compatibility check
→ restore Zustand → restore Ink ผ่าน NarrativeController → sync queries
→ reconstruct world/UI → ready
```

`SaveCoordinator` ต้องตรวจ envelope และผล migration/compatibility ครบก่อนเปลี่ยน live game session ไม่ publish state/Ink/world ที่ restore ครึ่งหนึ่ง คืน backlog ของ save นี้และให้ read-only queries อ่าน state ที่ restore แล้ว

หลัง load **Auto = off, Skip = off** ห้าม replay durable events หรือ one-shot presentation events/SFX Reconstruct BGM/ambient แบบ semantic ได้ แต่ไม่ restore playback timestamp Dialogue และ choice ต้องคืนตาม checkpoint rules ข้างต้น

## Versioning และ migration

- Version identity ใช้ **สามส่วน:** `appBuildVersion` ระบุ build ที่สร้าง save; `saveSchemaVersion` ใช้ migration chain เมื่อ DTO/schema เปลี่ยน; `storyCompatibilityVersion` บอกว่า Ink/story structure ยัง restore snapshot เดิมได้หรือไม่
- `saveSchemaVersion` มีตั้งแต่ implementation แรกและ migration chain แบบ `v1 → v2 → …` ที่ทดสอบด้วย fixtures ของ schema เก่า Migration DTO ไม่เท่ากับการพิสูจน์ว่า Ink snapshot ยัง compatible
- Validate JSON/types/IDs และ supported version ก่อน load ไม่ปล่อยค่าขาดกลายเป็น permission/Promise/relationship ที่ดีขึ้นด้วย default
- Migration ต้องรักษาข้อเท็จจริง/สิทธิเดิม; ถ้าข้อมูลเดิมไม่มีเหตุรองรับให้บอก unsupported/ต้องตัดสินใจ ไม่สร้างเหตุย้อนหลัง
- Future-version, corrupt หรือ incompatible-story save ต้องแจ้งและเก็บข้อมูลเดิมไว้ ไม่ reset/ลบทิ้งอัตโนมัติ
- Storage unavailable/quota/error ต้องรายงานว่าบันทึกไม่สำเร็จ ห้าม UI โชว์ว่าบันทึกแล้วเพราะ state ในหน่วยความจำเปลี่ยน
- Prototype → Full Game ออกแบบ state model ให้ต่อ Day 4 ได้ แต่รองรับ save ข้าม build ต่อเมื่อ **compatibility test ผ่านจริง** ไม่รับรองทุก build ถ้า incompatible ต้องแจ้งชัด เก็บข้อมูลเดิม และไม่ fabricate/migrate story state แบบเดา

## Decision status

**G-02 — CLOSED.** Safe Checkpoint, autosave/manual/puzzle behavior, line/choice restore, semantic presentation, atomic choice/load, post-load controls และสาม version identities ล็อกแล้ว Compatibility ของ build จริงต้องตรวจด้วย tests ไม่ใช่คำถาม policy ที่ยังเปิด

**G-03 — CLOSED.** Settings/read-line history เป็น global/profile; GameState/Ink/Album/permissions และ current backlog เป็น per-save/per-playthrough/session ตาม scope table ไม่มีความรู้หรือ ending unlock รวมข้าม run

## OPEN QUESTION

**G-01 — Domain rules (ก่อน M3; ส่วนที่ใช้ใน M2 ต้องยืนยันก่อน):** TSPR เก็บเป็นตัวเลขหรือรูปแบบใด ช่วง/ค่าเริ่มต้น/การเปลี่ยนตาม scene/threshold เป็นอะไร? Map ล็อกความหมายและแนวโน้ม แต่ไม่ได้ล็อกสูตร อีกส่วนคือ detailed permission scope/change rules และ payload ของ Promise/event จาก scene cards ต้องอนุมัติก่อนใช้เป็น branching truth ไม่ตั้งค่า 0–100 หรือ +1/−1 เอง
