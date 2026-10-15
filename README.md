# บ้านที่ไม่รู้สึกเหมือนบ้าน

Interactive Game Website — M0 scaffold + M1 technical fixture (dev/QA)

**สถานะ:** M0 PR #2 → M1 Batch 1 PR #3 → Batch 2 PR #4 → Batch 3A PR #5 merge เข้า remote main แล้วแบบ Conditional Integration Acceptance; approved baseline `e9731550f17227883681dd3d6b073f3097fdab0f` เก็บ Batch 3A commit `dee9efaacdf51d6839df41d86217f5eeb132fdc7` ใน ancestry Batch 3A ผ่าน Independent Review แบบ PASS WITH NON-BLOCKING FOLLOW-UP; 3A-F01 ยัง OPEN รอหลักฐานและ Independent Review ของ guarded writes ใน Batch 3B-1 ขณะนี้ทำเฉพาะ 3B-1 บน `codex/m1-persistence-storage-batch-3b-1` ยังไม่ stage/commit/push M0/M1 milestone ยัง **NOT DONE**; ManagedGame defect, Firefox/A-01 คง OPEN และ pre-READY failure คง unverified residual risk Browser startup/resume, autosave scheduling และ Save/Load controls ยังรอ Batch 3B-2 approval ไม่มี release story หรือ final art ดูหลักฐานและ Owner Decisions ใน [MASTER_PLAN](MASTER_PLAN.md)

**Checkpoint:** คง implementation และ dependency versions ปัจจุบัน หยุดทดลอง Phaser internals/startup override/failure-injection และไม่มี lifecycle fix ใหม่ ผล probe กับ Phaser 4.2.1 จริงยืนยันว่า ManagedGame ลบ external visibilitychange listener จาก postBoot โดยไม่ตั้งใจ 3/3 รอบ ส่วน pre-READY boot failure เป็น residual risk ที่ยังไม่พิสูจน์ด้วย runtime failure-injection ดูหลักฐานแยกกันใน MASTER_PLAN ไม่เปลี่ยน Definition of Done และไม่ถือว่า checkpoint ผ่าน lifecycle gate

## เริ่มใช้งานเอกสาร

อ่าน [PROJECT.md](PROJECT.md) → [MASTER_PLAN.md](MASTER_PLAN.md) → [ARCHITECTURE.md](ARCHITECTURE.md); [AGENTS.md](AGENTS.md) เป็นแผนที่อ่านตามงาน

ต้นฉบับ [narrative_map_7_day_Updates.md](sources/narrative_map_7_day_Updates.md) เก็บใน `sources/` โดยไม่แก้ไข เป็นไฟล์ต้นทางที่แนบมากับเอกสารใหม่ 8 ไฟล์ ไม่ใช่เอกสารที่เขียนเพิ่ม ดู provenance ใน [PROJECT.md](PROJECT.md)

## ติดตั้งและรัน

ใช้ **Node.js 24.13.1 / npm 11.8.0** ตาม `.nvmrc`, `engines` และ `packageManager` (Node 24.13.x/npm 11.8.x เท่านั้นใน baseline นี้; patch อื่นยังไม่ได้ตรวจ) ใช้ npm ไม่ใช้ package manager อื่น

```sh
npm install
npm run dev
```

ใช้ `npm ci` สำหรับติดตั้งซ้ำและ CI โดยหยุด dev/test/preview server ก่อนติดตั้งซ้ำบน Windows เพื่อไม่ให้ executable ของ esbuild ถูกล็อก

| คำสั่ง | Script contract |
|---|---|
| `npm run dev` | Vite development server; narrative output ต้องอัปเดตเมื่อแก้ Ink |
| `npm run typecheck` | ตรวจ TypeScript ทั้ง app และ test/config ที่เกี่ยวข้อง |
| `npm test` | Vitest แบบจบการทำงาน เหมาะกับ CI |
| `npm run test:watch` | Vitest watch ระหว่างพัฒนา |
| `npm run test:e2e` | Playwright; config ต้องจัดการ web server ให้เอง |
| `npm run test:e2e:windows-chromium-webkit` | Chromium/WebKit subset สำหรับ Windows; ไม่ใช่ full E2E และไม่เลือก Firefox |
| `npm run test:e2e:firefox` | Firefox project แยก; ต้องรายงาน environment และ startup failures ตามจริง |
| `npm run lint` | ESLint |
| `npm run format:check` | Prettier check code/config; ไม่ reformat narrative/design Markdown |
| `npm run narrative:compile` | compile Ink เป็น JSON ด้วย compiler ที่เข้ากับ inkjs ที่ล็อกใน M0 |
| `npm run narrative:validate` | ตรวจ source-ID declarations และ traverse ทั้งสอง fixture branches สำหรับ query inputs true/false รวม scene/tag/event/asset references; ไม่ใช่ release story graph validator |
| `npm run build` | compile/validate narrative + typecheck + Vite static build ไป `dist/` |
| `npm run preview` | Vite preview ของ build ที่สร้างแล้ว |

**N-02 CLOSED:** source/tag/EventRegistry/query/identity contract อยู่ใน [docs/NARRATIVE_SYSTEM.md](docs/NARRATIVE_SYSTEM.md) Batch 2 มี typed domain/presentation registry และ authoritative fixture store ที่ commit effects+ledger พร้อมกัน ผ่าน Independent Review และ merge แบบ conditional แล้ว Query binding policy ด้านล่างยังใช้ร่วมกันใน Controller/validator; Batch 3A เพิ่ม checkpoint/candidate restore สำหรับ technical fixture เท่านั้น โดยไม่เปลี่ยน domain transaction architecture

### Batch 3A — checkpoint และ candidate restore

- `SaveCoordinator` ถือ active store/controller คู่เดียว เปลี่ยน session ด้วย pointer เดียวหลัง candidate ผ่าน validation และ Ink restore; preparation failure คง session เดิม Post-activation notification failure คืน error receipt พร้อมคง session ใหม่ ไม่ rollback effects/ledger
- Controller capture Ink JSON, semantic line/choice และ backlog พร้อมอ่าน durable snapshot แบบ synchronous ไม่มี await ระหว่าง capture; reject idle/ended/error/disposed และช่วง domain transaction/publish/presentation/subscriber callbacks Pause จาก stable line/choice capture ได้ การ save/load/new run ใช้ busy policy ร่วมกันและบล็อก narrative input ขณะรอ repository
- Restore ใช้ inkjs 2.4.0 public `state.LoadJson()/ToJson()`, text/tags/choices/cursor getters และ `ContentAtPath(Path).correctObj` ตรวจ path ที่ต้อง resolve ได้ตรง ไม่ยอมรับ approximate recovery ไม่ใช้ Continue/Choose เพื่อสร้าง line/choice ใหม่ ไม่ dispatch domain หรือ one-shot events Terminal line ยังรอ Continue ตาม B-04
- Envelope/DTO เป็น **technical-fixture-only**: schema `1`, story compatibility `technical-fixture-checkpoint-v1`, app build identity `0.0.0+m1-batch-3a`; timestamp เป็น Unix epoch milliseconds รองรับเฉพาะ identity ชุดนี้ ยังไม่มี migration/cross-build compatibility claim ตรวจ field/ID/type, known flags/events, ledger uniqueness/preconditions และ state invariants ก่อน activation รวมความสัมพันธ์ของ backlog/ledger กับเส้นทาง fixture สี่ readable outputs นี้ เพื่อปฏิเสธ components ที่ valid แยกกันแต่มาจากคนละจังหวะ ไม่ใช่ general story-graph validator และไม่ซ่อมข้อมูลที่ขาดด้วย defaults
- Backlog อยู่กับ controller/run; load คง saved Run ID แต่สร้าง Controller Session ID และ owner generation ใหม่ ปฏิเสธ stale intentions Global profile read history อยู่แยกและไม่ถูก rewind; ยังไม่มี settings defaults หรือ settings implementation ที่ขึ้นกับ U-03
- ณ Batch 3A `SaveRepository` มี interface และ in-memory fake เท่านั้น Dev panel ยังใช้ coordinator สำหรับ ownership/New Run โดยไม่เชื่อม repository หรือ Save/Load UI Auto/Skip ยังไม่ได้ implement และไม่มี state ดังกล่าวถูกนำกลับจาก save
- Batch 3A ได้รับ Conditional Integration Acceptance ผ่าน PR #5 แล้ว Finding 3A-F01 (stale asynchronous save after disposal) เป็น required follow-up ก่อน Batch 3B acceptance ไม่ได้แก้หรือปิดจากการ merge 3A ผล in-memory restore เดิมไม่ใช่หลักฐาน browser reload

ผล Batch 3A: full unit 151 passed/0 failed/0 skipped; focused checkpoint + domain/query 96 passed/0 failed/0 skipped; Chromium/WebKit subset 12 passed/0 failed/0 skipped Firefox บน Windows 0 passed/6 failed/0 skipped จาก `spawn UNKNOWN` ก่อนเข้า app จึงไม่ใช่ full E2E PASS Compile/validate/typecheck/lint/format/build ผ่าน มี Phaser chunk-size warning เดิม คำสั่ง/หลักฐานแยกใน MASTER_PLAN ไม่ใช้ผล Batch 1/2 แทน และไม่ปิด Known Risks จากผล subset

### Batch 3B-1 — guarded repository และ profile persistence

- `LocalStorageSaveRepository` มี autosave/manual-1–3 และ profile key ใน namespace `this-house:technical-fixture` ที่คงเดิมข้าม build ไม่เรียก `clear()` และไม่เขียน keys ของ release/แอปอื่น **ยังไม่เชื่อมกับ dev panel** ไม่มี startup detection, actual autosave scheduling หรือ browser resume controls งานเหล่านี้อยู่ 3B-2
- Coordinator ออก revocable write permit ต่อ owner/operation/session generation Repository ต้องใช้ permit หลัง awaits ทั้งหมด ณ synchronous mutation และตรวจ expected slot/profile bytes ล่าสุดก่อน `setItem` โดยไม่มี await คั่น Dispose เพิกถอนทันที Completed permits ใช้ซ้ำไม่ได้ คง busy policy ไม่มี retry/queue/cross-tab locking
- `inspect()` ตรวจ envelope/invariants และ candidate Ink restore โดยไม่ Continue/Choose/dispatch ก่อนอนุญาต overwrite Corrupt/future/unsupported/foreign-profile saves ถูก preserve และปฏิเสธ write การแทน slot ของ run อื่นต้องส่ง explicit overwrite consent ที่ผูกกับ raw bytes จาก inspection; stale consent ถูกปฏิเสธ ไม่มี UI ให้กดยืนยันใน batch นี้
- Profile schema `1` เก็บเฉพาะ profile identity/read Line IDs; hydrate ผ่าน `validateProfile()` แล้วสร้าง profile store ไม่รวม settings/U-03 Read history รวมข้อมูลที่ persist ล่าสุดแบบไม่ย้อนถอย ตรวจทั้ง changed persisted bytes และ changed in-memory snapshot Profile เสีย/unsupported/foreign หรือหายขณะมี slots จะ block persistent writes โดยไม่สร้าง identity เพื่ออ้าง save เก่า
- Profile กับ game slot เป็นคนละ write: profile สำเร็จแต่ slot ล้มเหลวต้องรายงาน game save failure `SaveWriteFailure` เก็บ `profileCommitted`/`slotCommitted` แยกกัน ถ้า physical slot write สำเร็จแล้วแต่ completion stale/fails ให้คง bytes จริง ไม่ rollback หรือรายงาน Save success จาก operation เก่า
- Current save identity: app build `0.0.0+m1-batch-3b-1`, save schema `1`, story compatibility `technical-fixture-checkpoint-v1` คง DTO/Ink structure เดิม รองรับ exact identities นี้เท่านั้น; build 3A/unknown builds ยัง unsupported และ preserve ไม่มี migration ที่เดาขึ้น
- รับประกันภายในหน้าเกมที่มีหนึ่ง active runtime writer เท่านั้น การตรวจ expected bytes ไม่ใช่ cross-tab CAS หรือ cross-key transaction 3A-F01 ยัง OPEN จนผ่าน Independent Review ของหลักฐานชุดนี้ ไม่ใช้ผล storage tests ปิด Firefox/A-01 หรือ ManagedGame

ผล verification และข้อจำกัดของ Batch 3B-1 บันทึกใน MASTER_PLAN แยกจากผล Batch 3A ไม่อ้างว่า refresh/resume หรือ full E2E ผ่าน

### Authoritative query binding — inkjs 2.4.0

`bindFixtureQueries()` ใช้ `BindExternalFunction(..., false)` ร่วมกันทั้ง Controller และ validator เพราะ read-only query อาจเปลี่ยนค่าหลัง domain commit จึงไม่ใช่ lookahead-safe แม้ไม่มี mutation จาก Ink ไม่ mirror authoritative state เข้า Ink และไม่เปลี่ยน transaction order หรือเพิ่ม Continue step ให้ fixture

- Choice conditions และ query ในข้อความปกติ เช่น `value {fixture_flag("fixture.branch_committed")}` ใช้ได้ตาม Controller integration tests Query หลัง readable commit boundary อ่าน Zustand ปัจจุบันทั้ง false→true และ true→false โดยไม่มี speculative read ก่อน commit ในกรณีที่ทดสอบ
- Direct query ภายใน **choice text** หรือ **quoted string** ถูก inkjs ปฏิเสธด้วย runtime string-generation error ให้ประเมิน `temp` ที่จุดใช้งานก่อนสร้าง string/choice ตามตัวอย่าง ไม่ใช้ temp เป็น authoritative fact หรือ writer และต้องประเมินใหม่หลัง commit ที่เกี่ยวข้อง

```ink
~ temp current = fixture_flag("fixture.branch_committed")
+ [ค่าทดสอบ {current} # line:fixture_choice_a_001]
    -> END
```

Quoted string ใช้ `~ temp label = "ค่าทดสอบ {current}"` หลังประเมิน temp แทนการเรียก external query ภายใน quotes โดยตรง Unknown flag และ unsupported string-generation forms ต้อง fail/guard ไม่ default เป็นผลทางเรื่อง

Glue เป็นการรวมข้อความ ไม่ใช่ domain transaction boundary: query ใน output ที่ Glue รวมยังอ่าน facts ก่อน commit ของ output นั้น แล้ว output ถัดไปอ่าน facts หลัง commit Tests ครอบคลุม leading/trailing Glue และ temp โดยไม่แยก output เพิ่ม วาง event tag ก่อนข้อความที่ลงท้าย `<>` หรือใช้ leading Glue ตามรูปแบบที่ทดสอบ; `prefix <> # event:...` อาจรวมบรรทัดถัดไปต่อเนื่องใน inkjs 2.4.0 เช่นเดียวกับ binding เดิม ถ้ารวมหลาย `line` tags เป็น output เดียว Controller/validator ต้อง reject ตาม singleton tag contract เดิม ต้องมี stable Line ID เดียวต่อ readable runtime output ไม่ใช้ physical source line เป็น identity

## A-01 toolchain baseline

| ส่วน | Exact version ที่เลือก |
|---|---|
| Runtime/package manager | Node.js 24.13.1 / npm 11.8.0 |
| React / React DOM / types | 19.3.0 |
| TypeScript / Node types | 5.9.3 / 24.13.1 |
| Vite / React plugin | 7.3.7 / 5.2.0 |
| Phaser | **4.2.1** |
| Zustand | 5.0.15 |
| Ink compiler/runtime | **inkjs 2.4.0 / JSON format 21** |
| Vitest / Playwright | 4.1.11 / 1.64.0 (Firefox startup ถูกบล็อกในเครื่องตรวจ) |
| ESLint / @eslint/js / typescript-eslint / React hooks plugin | 10.12.0 / 10.0.1 / 8.71.2 / 7.1.1 |
| Prettier | 3.9.10 |

ตรวจ npm metadata `engines`/`peerDependencies` และติดตั้งโดยไม่ใช้ `--force`/`--legacy-peer-deps`: Vite/plugin ต้อง Node `^20.19.0 || >=22.12.0`; Vitest รองรับ Node 24 และ Vite 7; npm 11.8.0 รองรับ Node `^20.17.0 || >=22.9.0`; ESLint 10 รองรับ Node 24; Zustand รองรับ React >=18; typescript-eslint รองรับ ESLint 10 และ TypeScript `>=4.8.4 <6.1.0` จึงไม่เลือก TypeScript 7 จาก latest และไม่เลือก template ที่ลด Phaser เป็น major 3

เวอร์ชันถูก pin ทั้งหมดใน package.json และ lockfile ไม่ใช้ `latest` เป็นหลักฐาน compatibility ใช้ Vite 7/plugin 5/Vitest 4 ที่ peer ranges ตรงกัน ไม่เพิ่ม optional compiler/plugin dependencies ของ template รุ่นใหม่

Playwright 1.64.0 Chromium/WebKit ผ่าน checks ของ M0; Firefox เปิดไม่ได้ด้วย Windows side-by-side `mozglue` error แม้ force reinstall ลอง 1.63.0 แล้วได้ startup error แบบเดิม จึงกลับใช้ 1.64.0 ไม่ปิด A-01/browser verification เต็มชุดจากผลสอง engine และไม่ข้าม/ลบ Firefox project เพื่อทำให้ test:e2e ดูผ่าน

Compiler ที่ใช้จริงคือ `Compiler` จาก `inkjs/full` ผ่าน `node scripts/narrative-compile.ts` ไม่ใช่ inklecate/.NET อีกชุด; runtime verification ใช้ `Story` จาก `inkjs` 2.4.0 เดียวกัน ทดสอบ JSON format 21 และ `state.ToJson()/LoadJson()` round-trip Compiler ไม่ import ใน browser app

อ้างอิงตรวจ: [Phaser 4.2.1 release](https://phaser.io/download/release/v4.2.1), [inkjs compiler/runtime](https://github.com/y-lohse/inkjs), [Vite relative base](https://vite.dev/guide/build.html#relative-base) Engine/browser evidence จริงอยู่ใน MASTER_PLAN; Playwright ไม่แทน real-device matrix

## ขอบเขต scaffold และการเปลี่ยน art/style

- `src/shell`: logical viewport/fit bounds, orientation/fullscreen และ ephemeral Zustand shell state ไม่มี GameState schema หรือ persistence ที่เดา G-01/U-03
- `src/world`: Phaser world, session-owned `GameBridge` และ `WorldHost` ที่ยกเลิก async import หลัง unmount, ถอด subscriptions และ destroy game StrictMode เปิดไว้ใน dev
- `ManagedGame` ใช้ adapter จับ native registrations ช่วง `start()` ของ Phaser 4.2.1 แต่มี confirmed ownership defect: external visibilitychange listener จาก postBoot ถูกจับและลบด้วย ยังไม่แก้และไม่ถือว่า lifecycle cleanup ผ่านครบ; รายละเอียดและ residual risks อยู่ MASTER_PLAN ไม่แก้ node_modules
- `src/ui`: reusable Button/Panel, centralized neutral CSS tokens และ stylesheet แยกจาก shell/game logic ตำแหน่ง/สี/font เป็น technical probe ไม่ใช่ final identity หรือ approved dialogue/stage coordinates
- `src/assets/manifest.json`: semantic ID `m0.world.reference` → SVG grid ทางเทคนิคใน `public/assets/placeholders` ใช้ relative base เดียวกับ Vite ไม่มี character mapping จาก JPG sheet, production dimensions, anchor, pose หรือ layering catalog
- `narrative/fixtures/technical_fixture.ink`: fixture ภาษาไทย line→choice→สอง branches→rejoin มี stable IDs/tag-only output, technical domain events และ query หลัง commit ไม่มี release characters/domain rules Generated output อยู่ `generated/narrative` และไม่เข้า production `dist`; dev watcher compile/validate เมื่อแก้ Ink แล้ว reload หรือแสดง error overlay เมื่อผิด
- `src/narrative`: Story อยู่ใน session-owned NarrativeController; validate output/choices ทั้งชุด → commit fixture domain events → injected QA presentation notifications → publish รักษา scene/session/revision/input-lock guards หาก transaction ล้มเหลวจะหยุดที่ error ไม่ advance/retry จาก cursor ที่ขยับแล้ว หลัง commit ไม่ rollback effects/ledger เพราะ callback ล้มเหลว ไม่มี world commands ใหม่
- `src/state/fixtureDomainStore.ts`: Zustand เป็น authoritative state ของ technical playthrough; typed actions ตรวจ preconditions ทั้งชุดบน candidate แล้วเปลี่ยน facts+committed-event ledger ด้วย update เดียว Registry ไม่เก็บ ledger ไม่ใช่ release GameState/production domain rules และไม่ persist ข้าม browser reload
- `src/ui/NarrativeFixturePanel.tsx`: coordinator เป็น owner ของ run/controller อยู่เหนือ view subscriptions; ปิด/เปิดฉากทดสอบ remount view โดยคง run/ledger/backlog เดิม ปุ่ม dev-only “เริ่มรอบทดสอบใหม่” ผ่าน busy gate สร้าง run/session/ledger/backlog ใหม่และ dispose controller เก่า Continue/Choice ใช้ keyboard/touch/pause/focus guards และ StrictMode cancellation เดิม ไม่มีการเปลี่ยน Phaser startup หรือ window focus/blur handlers
- ยังไม่มี `narrative/main.ink`/prologue/days ที่อนุมัติ ห้ามใช้บท Google Doc ห้าวันเป็น release entry แทน source เจ็ดวัน
- `scripts/serve-static-test.ts` เป็น local-only QA harness สำหรับ subdirectory/iframe ไม่ใช่ runtime backend และไม่อยู่ใน dist Playwright จัด dev server + build/static QA server ให้เอง

ผล screenshot/trace ของ Playwright รอบใหม่อยู่ `%TEMP%/this-house-m0-qa/<platform>-<run-id>/test-results` ไม่รวมใน Git Worker ทุกตัวใช้ run ID ที่รับจาก parent process ผ่าน `PHASER_M0_QA_RUN_ID`; variable นี้กำหนด artifact path เท่านั้น ไม่ใช้เปลี่ยน projects หรือ skip tests สามารถกำหนด ID สำหรับรอบตรวจเองได้ (ตัวอักษร/ตัวเลข/hyphen) และควรใช้ ID ใหม่ต่อ invocation Full run เดิมใน `%TEMP%/this-house-m0-qa/test-results` ยังคงเป็นหลักฐาน failed run; subset ไม่ overwrite หลักฐานนั้น การตรวจตัวอย่าง desktop/landscape/portrait ไม่ปิด U-01 minimum viewport/touch target และไม่ยืนยัน final font หรือ accessibility certification

หลักฐาน Batch 1 หลังแก้ B-04: unit 55 passed/0 failed/0 skipped; Chromium/WebKit subset 12 passed/0 failed/0 skipped, exit 0 และ Owner ยอมรับแบบ conditional ก่อน merge แล้ว ผล Batch 2 แยกใน MASTER_PLAN ไม่ใช้ผลเก่าแทน implementation ปัจจุบัน Firefox environment อื่นยังไม่ได้ตรวจ แผนคือใช้ source/lockfile เดียวกันบน Linux ที่เจ้าของอนุมัติ ติดตั้ง browser ที่ตรงกับ Playwright แล้วรัน `npm run test:e2e:firefox` และเก็บผลแยก ไม่รวมผลต่าง environments แล้วเรียกว่า full E2E ผ่าน

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

## ขอบเขตที่ยังไม่อนุมัติ

**Technical Documentation Baseline v0.1 — พร้อมสำหรับ Freeze ของ core technical contracts:** N-02, G-02 และ G-03 CLOSED แล้ว Safe Checkpoint และ profile/playthrough scope อยู่ใน [docs/GAME_STATE.md](docs/GAME_STATE.md); โครง placeholder UI ต้อง style-ready ตาม [docs/UI_ASSET_SPEC.md](docs/UI_ASSET_SPEC.md)

Baseline ไม่ได้แปลว่า production content พร้อมทั้งหมด A-01 และผลตรวจ M0/M1 ให้ดู ARCHITECTURE/MASTER_PLAN ส่วน G-01/N-03/U-01–U-03/P-01–P-02 เป็น OPEN QUESTION ตาม gate เดิม Batch ถัดไปรอ Owner Review/approval และไม่ commit/push โดยไม่มี approval

