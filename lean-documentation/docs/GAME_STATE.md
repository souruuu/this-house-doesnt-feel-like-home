# Game State และ Save

Source of Truth ของ durable schema/ownership/invariants และ persistence ข้อเท็จจริงเรื่อง/ผลของ choice อยู่ใน [Narrative Map](../sources/narrative_map_7_day_Updates.md) ไม่ใช้ schema นี้แต่งข้อมูลที่เด็กยังไม่เล่าหรือสิทธิที่ยังไม่ให้

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
| `save` | version, timestamp, durable game snapshot และ Ink snapshot | `SaveCoordinator` จัด capture/validation/restore; `SaveRepository` อ่าน/เขียน envelope |
| `settings` / read history | การตั้งค่าที่คงข้าม refresh และข้อความที่เคยอ่าน | App/controller; scope ระหว่าง slots/new game ต้องปิด G-03 |

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
};

type SaveEnvelope = {
  version: number;       // schema version; implementation แรกเริ่มที่ 1
  timestamp: number;     // หน่วยต้องบันทึกให้ชัดเมื่อ implement
  game: GameState;
  narrative: { inkStateJson: string; storyContentVersion: string };
  checkpoint: unknown;  // G-02: coherent restore/view/world boundary
};
```

`unknown` ไม่ใช่ใบอนุญาตให้ใส่ JSON อะไรก็ได้ในเกมจริง ต้องแทนด้วย validated types หลังปิดคำถามก่อน implementation ที่พึ่งพา field นั้น ไม่ serialize functions, class instances, textures/audio หรือ store ทั้งก้อน

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

## Save และ local-first persistence

มี **autosave 1 ช่อง + manual 3 ช่อง** เล่นต่อโหลด autosave ล่าสุดที่ valid โหลดเกมแสดงทั้งสี่ช่อง; slot ว่าง/เสีย/เข้ากันไม่ได้ต้องแยกให้เข้าใจตาม [UI_ASSET_SPEC](UI_ASSET_SPEC.md)

ตัวอย่าง interface ตาม abstraction ที่ล็อก; ชื่อเมธอด/slot tokens เป็น technical representation ไม่กำหนด save timing แทน G-02:

```ts
type SaveSlot = 'autosave' | 'manual-1' | 'manual-2' | 'manual-3';
interface SaveRepository {
  save(slot: SaveSlot, data: SaveEnvelope): Promise<void>;
  load(slot: SaveSlot): Promise<SaveEnvelope | null>;
  delete(slot: SaveSlot): Promise<void>;
}
```

`LocalStorageSaveRepository` เป็น implementation แรก จัด storage keys/serialization ภายใน repository; `SaveCoordinator` capture snapshot จาก Zustand และ `NarrativeController`, แล้ว restore ผ่านทั้งคู่ ไม่ให้ components/Ink/Phaser เรียก localStorage เอง ไม่เก็บ assets ลง save ไม่มี cloud/cross-device sync ใน v1

Snapshot ต้อง capture durable state, Ink cursor, read/presentation checkpoint และ pending interaction ที่เลือกเก็บในจังหวะเดียวกัน ต้องไม่มีช่วงที่บันทึก choice commit แล้วแต่ cursor ยังอยู่ก่อน choice `SaveCoordinator` ประสาน capture/restore ให้ coherent; `SaveRepository` ทำ persistence โดยไม่ตัดสิน story เมื่อ load ให้ `SaveCoordinator` validate/migrate ก่อนเปลี่ยน live session แล้ว restore state และ Ink ใน boundary เดียว จากนั้น sync projection และ reconstruct world/UI ไม่ replay relationship/event ซ้ำ ตัว state/version/metadata ที่ใช้โชว์ slot ต้องมาจาก save ที่ validate แล้ว

Manual save ระหว่างข้อความ/choice/puzzle และ autosave trigger ยังไม่ล็อก; ดู G-02 ไม่มีการตัดสินให้โหลดแล้วเริ่ม puzzle ใหม่หรือเดินย้อน scene โดยเงียบ ๆ

## Versioning และ migration

- มี `version` ตั้งแต่ implementation แรกและ migration chain แบบ `v1 → v2 → …` ที่ทดสอบด้วย fixtures ของ schema เก่า
- แยก save schema version จาก story content/compiler/runtime compatibility บทหรือ knot เปลี่ยนแม้ shape เดิมก็อาจคืน Ink state เก่าไม่ได้
- Validate JSON/types/IDs และ supported version ก่อน load ไม่ปล่อยค่าขาดกลายเป็น permission/Promise/relationship ที่ดีขึ้นด้วย default
- Migration ต้องรักษาข้อเท็จจริง/สิทธิเดิม; ถ้าข้อมูลเดิมไม่มีเหตุรองรับให้บอก unsupported/ต้องตัดสินใจ ไม่สร้างเหตุย้อนหลัง
- Future-version, corrupt หรือ incompatible-story save ต้องแจ้งและเก็บข้อมูลเดิมไว้ ไม่ reset/ลบทิ้งอัตโนมัติ
- Storage unavailable/quota/error ต้องรายงานว่าบันทึกไม่สำเร็จ ห้าม UI โชว์ว่าบันทึกแล้วเพราะ state ในหน่วยความจำเปลี่ยน
- Same state model ปลาย Prototype รองรับ Day 4; ไม่รับรองว่า save ทุก build จะย้ายต่อได้จนกำหนด story compatibility ใน G-02

## OPEN QUESTION

**G-01 — Domain rules (ก่อน M3; ส่วนที่ใช้ใน M2 ต้องยืนยันก่อน):** TSPR เก็บเป็นตัวเลขหรือรูปแบบใด ช่วง/ค่าเริ่มต้น/การเปลี่ยนตาม scene/threshold เป็นอะไร? Map ล็อกความหมายและแนวโน้ม แต่ไม่ได้ล็อกสูตร อีกส่วนคือ detailed permission scope/change rules และ payload ของ Promise/event จาก scene cards ต้องอนุมัติก่อนใช้เป็น branching truth ไม่ตั้งค่า 0–100 หรือ +1/−1 เอง

**G-02 — Save/checkpoint compatibility (ก่อน M1 save round-trip และ M3 ระบบจริง):** Autosave ที่ boundaries ใด? Manual save ได้ระหว่าง line/choice/puzzle หรือไม่ และ restore ตรงไหน? จะเก็บ current line, read-text IDs, presentation/pending interactions อย่างไรให้ไม่ replay events? Save ข้ามการเปลี่ยน Ink content/runtime หรือจาก Prototype ไป Full Game รองรับระดับใด? ต้องกำหนดก่อนเปิด save UI ที่อ้างว่าคืนตำแหน่งได้แน่นอน

**G-03 — Profile versus slot scope (ก่อน M3):** Settings, read-text history และ Album เป็นข้อมูลต่อ slot/playthrough หรือ profile ร่วม? เริ่มเกมใหม่/load save เก่ามีผลอย่างไรกับสิ่งที่เคยอ่าน/Album/การตั้งค่า? คำตอบส่งผลต่อ Skip read only และสิทธิข้อมูล ห้ามรวมความรู้จากหลาย playthrough จนเปิดเผยเรื่องที่ยังไม่รู้ใน run ปัจจุบัน
