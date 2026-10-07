# บ้านที่ไม่รู้สึกเหมือนบ้าน

ชุด Lean Documentation สำหรับ Interactive Game Website ก่อนเริ่มพัฒนา

**สถานะ:** ตรวจ Narrative Design Source of Truth ฉบับ Updates แล้ว; ส่วนเทคนิคอ้างอิงคำขอปัจจุบันและการตัดสินใจที่ยืนยันในแชท “วางคอนเซปต์เกม” เอกสารชุดนี้ยังไม่ใช่เกมที่รันได้ และยังไม่มี `package.json`

## เริ่มใช้งานเอกสาร

นำไฟล์ในโฟลเดอร์นี้ไปวางที่ root ของ repository โดยคงโฟลเดอร์ `docs/` ไว้ อ่าน [PROJECT.md](PROJECT.md) → [MASTER_PLAN.md](MASTER_PLAN.md) → [ARCHITECTURE.md](ARCHITECTURE.md) ก่อนเริ่ม M0; [AGENTS.md](AGENTS.md) เป็นแผนที่อ่านตามงาน

ต้นฉบับ [narrative_map_7_day_Updates.md](sources/narrative_map_7_day_Updates.md) เก็บใน `sources/` โดยไม่แก้ไข เป็นไฟล์ต้นทางที่แนบมากับเอกสารใหม่ 8 ไฟล์ ไม่ใช่เอกสารที่เขียนเพิ่ม ดู provenance ใน [PROJECT.md](PROJECT.md)

## ติดตั้งและรันหลัง M0

M0 ต้องสร้าง scripts ตามตารางนี้ก่อน คำสั่งด้านล่างจึงจะใช้งานได้ เวอร์ชัน Node.js และ dependency ที่เข้ากันให้ตรวจและบันทึกใน M0; ดู OPEN QUESTION A-01 ใน [ARCHITECTURE.md](ARCHITECTURE.md)

```sh
npm install
npm run dev
```

เมื่อมี `package-lock.json` แล้ว ใช้ `npm ci` สำหรับติดตั้งซ้ำและ CI

| คำสั่ง | Script contract ที่ M0 ต้องจัดให้ |
|---|---|
| `npm run dev` | Vite development server; narrative output ต้องอัปเดตเมื่อแก้ Ink |
| `npm run typecheck` | ตรวจ TypeScript ทั้ง app และ test/config ที่เกี่ยวข้อง |
| `npm test` | Vitest แบบจบการทำงาน เหมาะกับ CI |
| `npm run test:watch` | Vitest watch ระหว่างพัฒนา |
| `npm run test:e2e` | Playwright; config ต้องจัดการ web server ให้เอง |
| `npm run lint` | ESLint |
| `npm run format:check` | Prettier check |
| `npm run narrative:compile` | compile Ink เป็น JSON ด้วย compiler ที่เข้ากับ inkjs ที่ล็อกใน M0 |
| `npm run narrative:validate` | ตรวจ scene/tag/event/asset references ตาม narrative contract |
| `npm run build` | compile/validate narrative + typecheck + Vite static build ไป `dist/` |
| `npm run preview` | Vite preview ของ build ที่สร้างแล้ว |

ชื่อ scripts เป็นสัญญาการใช้งาน ไม่ใช่คำยืนยันว่ามี scripts แล้ว **N-02 CLOSED:** source/tag/EventRegistry/query/identity contract อยู่ใน [docs/NARRATIVE_SYSTEM.md](docs/NARRATIVE_SYSTEM.md); exact compiler/runtime executable และ minor/patch ให้ตรวจใน M0/A-01 `narrative:compile`/`narrative:validate` ยังคงเป็น script contract ที่ล็อก

ติดตั้ง browser สำหรับ Playwright ครั้งแรกหลังติดตั้ง dependencies:

```sh
npx playwright install
```

## ตรวจและสร้าง build

```sh
npm run narrative:compile
npm run narrative:validate
npm run typecheck
npm run lint
npm run format:check
npm test
npm run test:e2e
npm run build
npm run preview
```

ส่ง `dist/` ให้ Vercel; สำหรับ itch.io ให้ ZIP **เนื้อหาภายใน** `dist/` โดยให้ `index.html` อยู่ที่ root ของ ZIP รายละเอียด relative paths และข้อจำกัดการทดสอบอยู่ใน [ARCHITECTURE.md](ARCHITECTURE.md) และเกณฑ์ปล่อย build อยู่ใน [MASTER_PLAN.md](MASTER_PLAN.md)

เปิดผ่าน dev/preview server หรือ static host ไม่ใช้การดับเบิลคลิก `index.html` เป็นเกณฑ์ตรวจ build

## ใครเป็น Source of Truth

| เอกสาร | เรื่องที่เป็นเจ้าของ |
|---|---|
| [narrative_map_7_day_Updates.md](sources/narrative_map_7_day_Updates.md) (ต้นฉบับ) | ข้อเท็จจริงเรื่องราว ตัวละคร วัน/ฉาก ขอบเขตการช่วยเหลือ และผลของทางเลือก |
| [PROJECT.md](PROJECT.md) | เป้าหมาย ผู้เล่นเป้าหมาย และขอบเขตผลิตภัณฑ์ |
| [MASTER_PLAN.md](MASTER_PLAN.md) | ลำดับงาน Definition of Done และ release gates |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Stack ขอบเขตความรับผิดชอบ และการเชื่อมระบบ |
| [docs/NARRATIVE_SYSTEM.md](docs/NARRATIVE_SYSTEM.md) | Ink/TypeScript integration และ narrative contract |
| [docs/GAME_STATE.md](docs/GAME_STATE.md) | Durable state, save schema และ persistence |
| [docs/UI_ASSET_SPEC.md](docs/UI_ASSET_SPEC.md) | UI/controls/accessibility และสัญญาส่งงาน asset |
| [AGENTS.md](AGENTS.md) | กฎการทำงานและแผนที่เอกสารสำหรับ Codex |
| README นี้ | วิธีตั้งค่า รัน ตรวจ และ build |

## ก่อนเริ่ม scaffold

**Technical Documentation Baseline v0.1 — พร้อมสำหรับ Freeze ของ core technical contracts:** N-02, G-02 และ G-03 CLOSED แล้ว Safe Checkpoint และ profile/playthrough scope อยู่ใน [docs/GAME_STATE.md](docs/GAME_STATE.md); โครง placeholder UI ต้อง style-ready ตาม [docs/UI_ASSET_SPEC.md](docs/UI_ASSET_SPEC.md)

Baseline ไม่ได้แปลว่า implementation หรือ production content พร้อมทั้งหมด A-01 ยังต้องตรวจใน M0 ส่วน G-01/N-03/U-01–U-03/P-01–P-02 เป็น OPEN QUESTION ตามงานที่พึ่งพาคำตอบใน [MASTER_PLAN.md](MASTER_PLAN.md) รอบอัปเดตนี้แก้เอกสารเท่านั้น ไม่เริ่ม M0 implementation

