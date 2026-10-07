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

ชื่อ scripts เป็นสัญญาการใช้งานที่เอกสารชุดนี้กำหนดตามคำขอ ไม่ใช่คำยืนยันว่ามี scripts แล้ว วิธี compile Ink ต้องปิด OPEN QUESTION N-02 ใน [docs/NARRATIVE_SYSTEM.md](docs/NARRATIVE_SYSTEM.md) ก่อนนำไปใช้กับเรื่องจริง

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

เริ่ม shell และโครงโมดูลที่ล็อกแล้วได้ตาม M0 ส่วนสูตร state, checkpoints และ contract รายละเอียดต้องปิดคำถามก่อนทำงานที่พึ่งพาคำตอบ อ่านรายการ OPEN QUESTION ตามระยะงานใน [MASTER_PLAN.md](MASTER_PLAN.md)

