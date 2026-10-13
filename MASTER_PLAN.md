# MASTER_PLAN — M0–M7

Source of Truth ของลำดับงาน Definition of Done และหลักฐานตรวจ เพื่อไปถึง **Prototype บทนำ + Day 1–3** และ competition package ขอบเขตเกมเต็มอยู่ใน [PROJECT](PROJECT.md); เนื้อหารายฉากอยู่ใน [Narrative Map](sources/narrative_map_7_day_Updates.md)

สถานะ: **M0 scaffold เป็น checkpoint รอ review บน `feat/m0-project-scaffold`; มี confirmed listener ownership defect และ Windows Firefox ยังไม่ผ่าน verification; M1–M7 ยังไม่เริ่ม** ยังไม่ปิด M0/A-01 หรือ quality gates เต็มชุด ไม่มี commit/push ของ scaffold

## บันทึกงาน M0 — 2026-10-13

### Checkpoint review — คง scaffold และแยก remaining blockers

แผน checkpoint ตามคำสั่งเจ้าของ: คง implementation/dependency versions → บันทึก confirmed defect แยกจาก unproven risks → ตรวจ Git ignore และรายการไฟล์ → ส่ง review โดยไม่ stage/commit/push/merge ไม่เริ่ม scaffold ใหม่ ไม่ revert งาน M0 ทั้งหมด ไม่แก้ production เพิ่ม และหยุดทดลอง Phaser internals/startup override/failure-injection ไม่เปลี่ยน Definition of Done

**Confirmed defect — ManagedGame listener ownership:** isolated runtime probe ใช้ source ManagedGame ปัจจุบัน (SHA-256 `9138afc1f4caf07b1f3eb610c7586e43ceb22be27511b459b2eaefaecfe24017`) ที่ transpile โดยเปลี่ยนเฉพาะ import resolution กับ Phaser 4.2.1 จริง บน Windows/Chromium, Node 24.13.1 และ Playwright 1.64.0 ทั้ง 3 รอบพบว่า external visibilitychange listener ที่ลงทะเบียนใน callbacks.postBoot ระหว่าง super.start() ถูก ManagedGame.destroy() ลบโดยไม่ตั้งใจ ไม่ใช่เพียง source-based risk

Probe แยก callback identities ด้วย instrumentation เฉพาะหน้า disposable test ที่เรียก native DOM APIs: Phaser VisibilityHandler และ external postBoot listener ถูก remove ทั้งคู่; external listener ที่ลงทะเบียนก่อน startup ไม่ถูก remove หลัง initialize/render และ deferred destroy เสร็จ dispatch visibilitychange ซ้ำทำให้ postBoot counter คง 1 แต่ pre-start counter เพิ่ม 1→2 เมื่อลงทะเบียน postBoot callback ตัวเดิมกลับ มันทำงานอีกครั้ง Control ที่ใช้ Phaser.Game โดยตรง 1 รอบรักษา postBoot external listener ไว้ได้ (counter 1→2) ยืนยัน DESTROY ครั้งเดียว, loop หยุด/ปล่อย references, SceneManager/renderer ปล่อย game references, renderer ปล่อย GL reference และ canvas disconnected ในทุก 4 รอบ ไม่มี browser runtime errors; การตรวจ resources เหล่านี้ไม่ใช่ failure recovery guarantee

คำสั่ง probe ที่รันจริง: `node (Join-Path $env:TEMP 'this-house-m0-visibility-probe\probe.mjs') 'C:\Code\Project\Game\this-house-doesnt-feel-like-home'` ผล exit 1: ManagedGame external-listener preservation 0 passed/3 failed/0 skipped; control 1/1 ผ่านและ integrity checks ผ่านทุก run หลักฐาน script/result.json อยู่ `%TEMP%/this-house-m0-visibility-probe/` ไม่รวมใน checkpoint Git สองครั้งแรกเริ่ม probe ไม่ได้เพราะ TEMP ของ sandbox แยกกัน (`MODULE_NOT_FOUND`, exit 1) ไม่ได้นับเป็นผล Phaser ไม่มี production/node_modules เปลี่ยนจาก probe และยังไม่มีผลหลังแก้ให้อ้างว่าผ่าน

**Unproven residual risk — pre-READY boot failure:** ความล้มเหลวภายใน constructor/boot ก่อน READY และความสามารถ rollback/cleanup เป็น source-based reasoning ที่ยังไม่ได้พิสูจน์ด้วย runtime failure-injection แยกจาก confirmed listener defect ข้างต้น ไม่ถือว่าเป็น test ที่ผ่านหรือล้ม และหยุดการทดลองเพิ่มตามคำสั่งเจ้าของ

**Browser blocker:** คง Firefox project และ supported-browser contract เดิม ผล Windows Firefox ล่าสุด exit 1, 0 passed/3 failed/0 skipped จาก startup error ก่อนรัน app; Windows SideBySide/mozglue evidence และสิ่งที่ทดลองอยู่บันทึกด้านล่าง Environment อื่นยังไม่ได้ตรวจ Chromium/WebKit subset ที่ผ่านไม่ใช่ full E2E และไม่ปิด browser gate

Checkpoint รวม source/config/lockfile/technical fixture/placeholder assets/tests และเอกสารที่อยู่ใน working tree; dependency versions และ production bytes คงเดิม `.gitignore` กัน dependencies/build/generated/test reports/coverage และ temporary logs/files; output ของ probe/Playwright อยู่ TEMP ไม่มี release story หรือ preliminary JPG เข้า checkpoint ผล verification scripts ด้านล่างเป็นผลจากรอบก่อนหน้า ไม่ใช่การรัน suite ใหม่ในรอบจัด checkpoint

ผลตรวจ checkpoint: `git check-ignore -v` ยืนยัน ignored paths 13 รายการ (dependencies/build/generated/QA reports/coverage/logs/tmp/temp/log rotations/temporary files/tsbuildinfo); `git check-ignore -q` ยืนยัน package.json/lockfile/ManagedGame/fixture/placeholder รวมได้ 5 รายการ ไม่มี generated/log artifacts ที่ tracked อยู่; `git diff --check` exit 0 เปรียบเทียบแถว Milestone/Definition of Done ทั้ง 8 แถวกับ HEAD แล้วตรงกัน และ SHA-256 ของ ManagedGame/package.json/package-lock.json/playwright.config.ts ตรงก่อนจัด checkpoint รายการเสนอรวม 43 ไฟล์: tracked modified 6 + untracked 37 ยังไม่ stage หรือ commit

### ประวัติ partial lifecycle hardening — runtime adapter ติด blocker

เจ้าของอนุมัติขอบเขต partial: normal lifecycle/early owner cancellation/remount/pause/hidden/overlap และ cleanup ของ instance ที่ initialize สำเร็จ; internal constructor/pre-READY boot failure ที่ไม่สามารถ rollback ผ่าน public API เป็น residual risk ไม่ใช่กรณีพิสูจน์ว่าผ่าน ไม่เปลี่ยน DoD, dependency versions, browser contract หรือปิด M0/A-01

การทดลองแทน short protected start sequence ของ 4.2.1 ด้วย owned listeners พบ `TS2540: Cannot assign to isRunning because it is a read-only property` จึงหยุด runtime implementation และคืน ManagedGame/createWorld/WorldHost/unit lifecycle test เป็น baseline ไม่ใช้ type cast, private API หรือ global workaround ใหม่ ManagedGame เดิมยังมี exception/interception/late-boot risks จาก review ไม่ถือว่าแก้แล้วหรือผ่าน resource teardown guarantee ยังไม่มี resource-level regression tests ใหม่ แยกงาน subset scripts/artifacts ที่ไม่พึ่ง adapter แล้วตรวจตามขอบเขตของมัน

ผลตรวจหลังคืน runtime (Windows, Node/npm/dependencies เดิม): `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test` และ `npm run build` exit 0; unit 17 passed/0 failed/0 skipped (2 files) และ build ยังมี Phaser chunk-size warning โดย bundle hashes `index-CSW-NyOm.js`/`createWorld-Cl-cjVSB.js` ตรง baseline ก่อนทดลอง runtime การทดลอง adapter ก่อนคืน code มี typecheck exit 1 ไม่ใช่ implementation ที่ผ่าน

เพิ่ม `npm run test:e2e:windows-chromium-webkit` โดยคง `npm test`, `npm run test:e2e` และ projects Chromium/Firefox/WebKit เดิม ผล subset สุดท้าย exit 0, 6 passed/0 failed/0 skipped (26.1s); screenshots ทั้ง 6 และ `.last-run.json` อยู่ `%TEMP%/this-house-m0-qa/win32-1791882114236/test-results` ผล Firefox แยกด้วย `npm run test:e2e:firefox` บน Windows exit 1, 0 passed/3 failed/0 skipped จาก `spawn UNKNOWN` อยู่ `%TEMP%/this-house-m0-qa/win32-1791882172037/test-results` ไม่มีการ skip Firefox; environment อื่นยังไม่ได้รัน และ full command รอบนี้ไม่ได้รันใหม่ ผล full เดิมยัง failed

Artifacts ใหม่ใช้ run ID คงที่ที่ workers รับจาก parent; screenshots ใช้ `testInfo.outputPath()` จึงไม่ทับผล full เดิมหรือ run อื่น รอบแรกที่ใช้ Date.now ต่อ config load มี artifacts แยกหลาย directory จึงปรับให้ ID ถูกส่งผ่าน environment และตรวจซ้ำจนทั้งสอง projects อยู่ run directory เดียว ไม่มี resource-level lifecycle assertion เพิ่มเพราะ runtime ยัง blocked ไม่ใช้ผล subset หรือ mocked unit tests แทนหลักฐานนั้น

ไฟล์ที่เปลี่ยนจากรอบ review ก่อนหน้า: package.json (subset scripts), playwright.config.ts (per-run artifact directory), tests/e2e/shell.spec.ts (screenshot paths), README.md และ MASTER_PLAN.md (ผลจริง/ข้อจำกัด) Dependency versions/lockfile/DoD/browser contract คงเดิม ไม่ปิด M0/A-01 และรอ independent review ก่อนตัดสินใจ ownership ของ engine-controlled readonly flag ใน protected hook หรือแนวทาง upstream ที่ไม่ต้อง bypass contract

แผน: ตรวจและล็อก A-01 → scaffold/scripts → shell 1920×1080 และ lifecycle → UI tokens/components/placeholder manifest → unit/browser/static build verification → ส่ง review โดยไม่ commit/push และไม่เริ่ม M1

การตัดสินใจเจ้าของ (2026-10-13): **ส่ง M0 เพื่อ review พร้อมข้อจำกัด Firefox** ตามคำตอบในแชท ไม่ขยายงานไปแก้สภาพแวดล้อม Windows ขณะนี้ การยอมรับรูปแบบส่ง review ไม่ใช่การยืนยันว่า Firefox ผ่านหรือปิด M0/A-01 และไม่ใช่ approval ให้ commit/push หรือเริ่ม M1

คำถามค้าง: G-01/N-03/U-01–U-03/P-01–P-02 คงเปิดตาม gate เดิม ไม่ขวาง technical scaffold; JPG เบื้องต้นไม่ใช่ production assets และบทห้าวันไม่แทน Narrative Map เจ็ดวัน ดูเจ้าของเรื่องใน UI_ASSET_SPEC/NARRATIVE_SYSTEM

ผู้ตรวจ: Codex, 2026-10-13, Windows/PowerShell, Node.js 24.13.1/npm 11.8.0, working tree build `0.0.0` (ยังไม่มี scaffold commit) Exact dependency/compiler decisions อยู่ [README](README.md#a-01-toolchain-baseline)

| คำสั่งที่รันจริง | ผลสุดท้าย |
|---|---|
| `npm install` | ผ่าน สร้าง package-lock.json; npm audit ตอนติดตั้งรายงาน 0 vulnerabilities |
| `npm ci` | ผ่านกับ lockfile สุดท้าย 199 packages; รอบที่ server ยังเปิดอยู่เคย fail เพราะ esbuild.exe ถูกล็อก จึงหยุด server และรันใหม่ |
| `npm run narrative:compile` | ผ่าน inkjs 2.4.0 compiler → JSON format 21; technical fixture เท่านั้น |
| `npm run narrative:validate` | ผ่าน 2 lines พร้อม scene/speaker/tag/event/asset references ของ fixture; unknown IDs/unsafe paths/case mismatch มี negative unit checks |
| `npm run typecheck` | ผ่าน app + scripts + tests + configs |
| `npm run lint` | ผ่าน ESLint 10.12.0 |
| `npm run format:check` | ผ่าน code/config; ไม่ reformat source-of-truth Markdown |
| `npm test` | ผ่าน 17 tests ใน 2 files: viewport fit, relative paths, compiler/runtime/state round-trip, reference guards, bridge teardown, paused game destroy |
| `npm run test:watch` | ผ่าน 17 tests และแสดง `Waiting for file changes`; script บังคับ `--watch`; หยุดด้วย `q` หลัง smoke test |
| `npm run test:e2e` | **exit 1: 6 passed / 3 failed** Chromium/WebKit ผ่านทั้งหมด; Firefox ทั้ง 3 tests เปิด executable ไม่ได้ (`spawn UNKNOWN`) ไม่ใช่ assertion ของเกมที่รันแล้วล้ม |
| `npm run build` | ผ่าน compile/validate/typecheck/Vite; dist/index.html + relative static assets; มี Phaser chunk-size warning (ประมาณ 1.39 MB / gzip 372 kB) แยกโหลดผ่าน dynamic import แล้ว |
| `npm run dev -- --host 127.0.0.1 --port 4175 --strictPort` | เปิดได้; เปลี่ยนข้อความ fixture ชั่วคราวแล้ว output อัปเดต คืน source เดิมและ compile กลับแล้ว; หยุด server หลังตรวจ |
| `npm run preview -- --host 127.0.0.1 --port 4176 --strictPort` | Chromium โหลด title/world/canvas ได้ ไม่มี pageerror; เข้า/ออก fullscreen จริงผ่าน; หยุด server หลังตรวจ |
| `npx playwright install` / `npx playwright install --force firefox` | ดาวน์โหลด browser สำเร็จ; force reinstall ไม่แก้ Firefox startup error |
| `git diff --check` | ผ่าน; narrative source SHA-256 ยังตรง PROJECT (`B0EC…04CDB`) |

Browser evidence สุดท้าย: Playwright 1.64.0, Chromium 156.0.8078.4 (revision 1248), WebKit 27.2 (revision 2370); Firefox 157.0 (revision 1555) **ยังไม่ได้รัน app** Browser plugin ไม่อยู่ใน session จึงใช้ repo Playwright ตรวจ desktop 1920×1080, square 1000×1000, touch landscape 844×390 และ portrait 390×844 ที่ `/` บน dev และ `/nested/game/` ใน static iframe

ยืนยัน title/Thai DOM ไม่ blank, ไม่มี Vite error overlay/pageerror/console error ใน flow ที่ตรวจ, world/React bounds ตรงกันและคง 16:9; pause→ปิด/เปิดฉากซ้ำ 3 รอบ canvas ไม่ซ้ำ/native visibility listener คืนจำนวนเดิม; keyboard Esc ไม่ยิงผ่าน focused control; portrait ทำ overlay inert และ pause, landscape คืน shell เดิมและคง user pause; fullscreen rejection ยัง fit ได้ Static iframe โหลด assets โดยไม่มี 404 และ JS output ไม่รวม fixture/Ink compiler

Screenshot/trace อยู่ `%TEMP%/this-house-m0-qa` และไม่เข้า Git ภาพ landscape/portrait ตรวจด้วยตาแล้ว ขนาดทดสอบเหล่านี้เป็น probes ไม่ได้ยืนยัน U-01 minimum device/touch targets หรือ U-03 final font/defaults

ข้อจำกัด Firefox: Windows SideBySide log ระบุ `Dependent Assembly mozglue ... version=1.0.0.0 could not be found` เรียก executable ด้วย `--version` ยังเปิดไม่ได้ ลอง Playwright 1.63.0 (Firefox 155.0/revision 1543) แล้วได้ startup error เช่นกัน จึงคืน 1.64.0 และคง Firefox project ไว้ ไม่ patch browser binary/ค่าระบบเพื่อทำให้ผลดูผ่าน A-01 เลือก/pin versions และยืนยัน Node/npm/compiler/engine-peer ranges แล้ว แต่หลักฐาน browser compatibility ยังไม่ครบ จึงยังไม่ปิด A-01 เต็มชุด

ความเสี่ยงที่ต้อง review: `ManagedGame` มี cleanup adapter เฉพาะ Phaser 4.2.1 เพราะ VisibilityHandler ติด native handlers โดยไม่มี destroy hook; ต้องตรวจ source/teardown tests ใหม่ก่อน upgrade Phaser ไม่แก้ node_modules การตรวจจริงบน Edge/Safari/iOS/Android, host Vercel/itch.io และ release audio/storage/save ยังไม่ทำใน M0

ผลงานที่เก็บใน checkpoint: scaffold/toolchain/scripts, shared-scale shell + rotate/fullscreen/pause, React versus Phaser ownership boundary และ remount implementation, reusable neutral UI/tokens, replaceable semantic placeholder manifest, technical compile/validation และ static relative build **ยังไม่ครบ:** confirmed ManagedGame listener ownership defect ยังไม่แก้, lifecycle gate ยังไม่ผ่านครบ, pre-READY boot failure ยังไม่พิสูจน์, Firefox verification/quality gate เต็มชุดและ owner review จึงยังไม่ประกาศ M0 DONE ไม่มี release story, NarrativeController/EventRegistry/query/ledger/save/audio implementation หรือ approved layout/art เริ่ม M1 เฉพาะหลัง review/อนุมัติครั้งถัดไป

คำสั่ง probe ของ dev watcher ที่รันจริง (คืน fixture ใน `finally`):

```powershell
node --input-type=module -e "import fs from 'node:fs'; const path='narrative/fixtures/technical_fixture.ink'; const output='generated/narrative/technical_fixture.json'; const original=fs.readFileSync(path,'utf8'); const probe=' ทดสอบการอัปเดต'; async function waitFor(check){for(let i=0;i<100;i++){if(check())return;await new Promise(resolve=>setTimeout(resolve,50));}throw new Error('Watcher timeout');} try{fs.writeFileSync(path,original.replace('สิ้นสุดข้อความทดสอบ #','สิ้นสุดข้อความทดสอบ'+probe+' #'));await waitFor(()=>fs.readFileSync(output,'utf8').includes(probe));console.log('Dev Ink watcher updated compiled JSON');}finally{fs.writeFileSync(path,original);await waitFor(()=>!fs.readFileSync(output,'utf8').includes(probe));console.log('Fixture restored and recompiled');}"
```

คำสั่ง probe ของ preview/fullscreen ที่รันจริง:

```powershell
node --input-type=module -e "import { chromium } from '@playwright/test'; const browser=await chromium.launch(); const page=await browser.newPage(); const errors=[]; page.on('pageerror',error=>errors.push(error.message)); await page.goto('http://127.0.0.1:4176'); await page.locator('[data-world-state=ready]').waitFor(); await page.getByRole('button',{name:'เต็มจอ',exact:true}).click(); await page.waitForFunction(()=>document.fullscreenElement!==null); await page.getByRole('button',{name:'ออกจากเต็มจอ',exact:true}).click(); await page.waitForFunction(()=>document.fullscreenElement===null); console.log(JSON.stringify({title:await page.title(),canvasCount:await page.locator('canvas').count(),fullscreenRoundTrip:true,errors})); await browser.close(); if(errors.length)process.exitCode=1;"
```

## Milestones

| Milestone | ผลงานและลำดับพึ่งพา | Definition of Done |
|---|---|---|
| **M0 — Project scaffold** | สร้าง React/TypeScript/Vite + Phaser 4, Zustand, inkjs และเครื่องมือตรวจตาม [ARCHITECTURE](ARCHITECTURE.md); placeholder shell ที่ style-ready; ตรวจ A-01 รวม exact Ink compiler/runtime ในขั้นนี้ | `npm install`/`npm ci`, dev และ static build ใช้งานได้; scripts ตาม README มีจริง; 16:9 shell + rotate prompt + placeholder world/React overlay ทำงาน; reusable UI/styling boundary/design-token foundation เปลี่ยน style ได้ ไม่ invent final identity; lifecycle ไม่สร้าง instance/listener ซ้ำ; lockfile และ Node/compiler compatibility บันทึกแล้ว; ไม่เติม story facts |
| **M1 — Narrative engine** | หลัง M0; ทำตาม N-02/G-02/G-03 ที่ CLOSED แล้ว: controller, TypeScript EventRegistry, read-only query port, Line/Event IDs, ledger และ checkpoint flow; ใช้ technical fixture จนปิด N-03 ก่อนใช้ narrative content จริง; placeholder UI ยัง style-ready | Fixture compile และเล่น line→choice→branch→rejoin ได้โดยแยกจาก release story; validate ทั้ง output ก่อน domain commit→presentation→publish; unknown tag/ID fail/guard; double input/duplicate results ไม่ commit ซ้ำ; save/load safe checkpoint คืน line/choice ถูกต้อง ไม่ replay events/SFX และ Auto/Skip off |
| **M2 — Placeholder vertical slice** | หลัง M1; เชื่อม D1-B→D2-A เพื่อพิสูจน์ Promise→delayed result→repair→Album→save/load; functional game layout และ stage/component structure เริ่มใกล้ production ยังใช้ placeholder art ได้; ไม่ถือเป็น Day 1–2 ครบ | Flow มี/ไม่มีคำรับปากและเปลี่ยนข้อตกลงได้ตาม scene card ที่ยืนยัน; world/UI/audio/state ต่อครบ; layout ใช้งานจริงและเปลี่ยน style/art ผ่าน tokens/manifest โดยไม่แก้ narrative/state logic; refresh/load กลับ Safe Checkpoint; puzzle assistance ไม่กระทบ relationship จาก skill และ active puzzle save ไม่ได้; placeholders ไม่อ้างเป็น final art |
| **M3 — Core systems** | หลัง M2; TSPR, Promise, Memory/permissions, delayed flags, Album, saves/migration, settings/VN controls และ basic design system/reusable UI foundation; ปิด G-01 โดย G-02/G-03 CLOSED แล้ว; ยังไม่ต้อง final polish | Meaningful tests ยืนยัน invariants ตาม [GAME_STATE](docs/GAME_STATE.md); ไม่มีคะแนนรวมหรือ disclosure unlock; breach มีหลักฐาน; seen/told/permission ไม่ปน; autosave+3 slots/migration/storage failure ทำงาน; global settings/read IDs คงข้าม runs/slots แต่ Album/knowledge/backlog ไม่รวมข้าม run; reusable components/design tokens ใช้ร่วมกันและ controls ทำงานครบ |
| **M4 — Day 1 production** | หลัง M3; Notice/บทนำ + D1-A/D1-B/D1-C และ artist asset integration ตาม contract ที่ยืนยัน; ต้องมี scene cards/บทที่เจ้าของยืนยันตาม N-03 | เด็กทั้งห้าปรากฏ/ตั้งฐานตาม map; Task Promise ที่บาสตกลงเท่านั้นเกิด; Memory ของสิ่งที่เห็นไม่กลายเป็นความจริงครอบครัว; มี quiet close; Day 1 transition/checkpoint ตรวจครบ; artist assets แทนผ่าน semantic IDs/manifest โดยไม่แก้ state/Ink logic; ไม่มีบทที่ Codex แต่งเอง |
| **M5 — Day 2–3 / complete Prototype** | หลัง M4; D2-A/B/C แล้ว D3-A/B/C พร้อม artist asset integration; grouping นี้คง M0–M7 | ผลคำตกลง D1→D2, puzzle รถ, Memory อาหาร, ฉากส้ม/นัท และขอบเขตกับกันต์ครบ; จบ D3 ในตัวเอง; ไม่มีฝน/กล่องดนตรี/epilogue ปลอม; asset replacements รักษา manifest/anchor contract; ทุกรูปแบบหลักผ่านเริ่มใหม่/load; state ปลาย D3 รองรับ model D4 โดยไม่รับรอง save ข้ามทุก build |
| **M6 — Polish / testing** | หลัง M5; final visual polish/readability/responsiveness/animation/final assets พร้อม controls/accessibility/playtest/browser matrix; ปิด P-01/U-01–U-03 ที่เกี่ยวข้อง โดย asset contract ต้องยืนยันก่อนผลิต/รับ final art ใน M4–M5 | Release gates ครบพร้อมหลักฐาน; Prototype ใกล้งบ 20 นาทีตาม playtest; notice/skip presentation ไม่ลงโทษ relationship; final visual/asset integration อ่านง่ายบน desktop/mobile landscape และ reduced motion; references/credits ตรวจแล้ว; ไม่มี blocking defects; ระบุสิ่งที่ยังไม่ตรวจ ไม่อ้างทุก browser ผ่าน |
| **M7 — Competition build** | หลัง M6 และปิด P-02; freeze content/config แล้วสร้าง static artifact | ผล build เดียวกันเปิดบน Vercel และ itch.io จริงได้; ZIP เกมมี root `index.html`; save/audio/focus/fullscreen/resize ใน iframe ตรวจผ่าน; final URL/ZIP/version และ verification record พร้อมตามกติกาประกวด; content/help/music information ที่ใช้เผยแพร่ตรวจแล้ว; ไม่มี OPEN QUESTION ที่เปลี่ยน behavior ของ build ค้าง |

M2 เป็นข้อเสนอขอบเขต technical validation จากคู่ฉากที่ล็อก ไม่ใช่การตัดสินใจเพิ่มเนื้อเรื่อง งานบทและ scene cards ยังต้องปิด N-03 ก่อนเรียก vertical slice นี้ว่าฉบับเล่นจริง

## เนื้อหา Day 1–3 ที่ต้องส่ง

ตารางนี้เป็นดัชนีการผลิต ไม่คัดลอก choices/state deltas จาก Narrative Map

| ชุดฉาก | สิ่งที่ต้องเห็นในการตรวจ | เปิดรายละเอียด |
|---|---|---|
| D1-A / D1-B / D1-C | ซื้อของของมะนาว/ส้ม; ข้อตกลงรถของบาส; อาหารของนัท ระยะกันต์ และ quiet close | ต้นฉบับหัวข้อ “วัน 1 พบเด็กก่อนรู้ปัญหา” |
| D2-A / D2-B / D2-C | ผลข้อตกลงรถ; งบซื้อของส้มและสิทธิเลือก; ยางลบ/อาหารที่คุยต่อ | ต้นฉบับหัวข้อ “วัน 2 คำตกลงเล็ก ๆ มีผลจริง” |
| D3-A / D3-B / D3-C | ที่นั่งส้ม; ช่วงก่อนปิดของนัท; พฤติกรรมกันต์ที่เห็นจริงและขอบเขต; กัปตันเป็น cameo | ต้นฉบับหัวข้อ “วัน 3 สิ่งที่มองเห็นเปลี่ยนความหมาย” |

ทุก scene card ต้องระบุเวลา จุดเข้า สิ่งที่รู้/ไม่รู้ choice ข้อตกลงหรืออนุญาตที่เปลี่ยน ปฏิกิริยาทันที วันที่เห็นผล และจุดกลับเส้นหลัก ตามข้อกำหนดท้าย [ต้นฉบับ](sources/narrative_map_7_day_Updates.md)

## แผนตรวจที่มีความหมาย

| ระดับ | เครื่องมือ/วิธี | สิ่งที่ต้องพิสูจน์ |
|---|---|---|
| Unit | Vitest | Tag/event validation; domain transitions; consent scope; TSPR แยกมิติ; Promise lifecycle; migration/validation; read-text identity |
| Integration | Vitest ร่วม runtime fixtures | Validate whole output ก่อน commit; domain→presentation→publish order; choice/load atomic; ledger ไม่ commit ซ้ำจาก reload/restore/remount/duplicate result; context reset เมื่อเปลี่ยน scene; query read-only; delayed consequence มีผู้รับรู้ |
| Browser flows | Playwright | เริ่มใหม่→D1→D2→D3; reload/resume; autosave+3 slots; line restore เต็ม/choice ยังไม่เลือก; active puzzle save ไม่ได้; global read IDs/settings คงข้าม New Game/slots แต่ Album/knowledge/backlog ไม่รวม; Skip หยุด choice/unread; input/orientation/pause/reduced motion |
| Real browsers/devices | ตรวจด้วยคนบนรุ่นที่ [ARCHITECTURE](ARCHITECTURE.md) ระบุ | Safari/iOS, Edge และ touch จริง; fullscreen/audio unlock/iframe/storage; บันทึกวันที่ รุ่น และผล |
| Narrative review / playtest | อ่าน scene cards และเล่นบทไทยจริง | ความเข้าใจบริบท สิทธิเลือก ความต่อเนื่องของเหตุและผล และงบเวลา; ไม่ใช้ completion ของ secrets หรือคะแนนอคติที่ยังไม่มีวิธีวัด |

Playwright WebKit ไม่ใช่หลักฐานว่า Safari/iOS จริงผ่านแล้ว เลขเครื่อง/OS และ browser ของรอบตรวจต้องอยู่ในบันทึก release

## Release gates

- Quality scripts ใน [README](README.md) ผ่าน: typecheck, lint, format, narrative compile/validate, Vitest, Playwright และ build
- Validate ทุก referenced scene/character/event/asset ID; ไม่มี orphan choice route หรือ route ที่ติดจนไปต่อไม่ได้
- ตรวจเส้นมีคำรับปาก/ไม่มีคำรับปาก/เปลี่ยนข้อตกลง และหยุดคุย/ไม่เปิดเผยข้อมูล ไม่ตรวจแค่เส้นทางที่เด็กตอบรับทั้งหมด
- เก็บหลักฐานว่าปฏิเสธ disclosure ยังมีเรื่องธรรมดาเล่น; puzzle skill, pause และ skip presentation ไม่เปลี่ยน relationship
- save/load เฉพาะ Safe Checkpoint ตาม G-02: line เดิมเต็มทันที/choice เดิมยังไม่เลือก, ไม่ snapshot กลาง transaction/active puzzle; Auto/Skip off หลัง load, ไม่ replay durable/one-shot events/SFX; ตรวจสาม version identities, corrupt/future-schema/incompatible-story และ storage unavailable โดยไม่ลบข้อมูลเดิมหรือเดา story migration
- ตรวจ G-03: global settings/read-line history ไม่ถูก rewind จาก save เก่า; Album/Memory/permissions/flags/ledger/current backlog แยกตาม playthrough ไม่มี global ending/epilogue unlock
- ตรวจ Thai font/line wrap/overflow, focus และ touch targets ที่ขนาด desktop/mobile landscape ซึ่งทีมยืนยัน ไม่เลือกขนาดขั้นต่ำแทนใน U-01
- assets final/placeholder ที่ใช้ปล่อยต้องยืนยัน; ทุกชิ้นมีที่มา/สิทธิใช้; เพลงกล่องดนตรีต้องใช้สิทธิที่เหมาะสมเมื่อผลิตเกมเต็ม
- Notice และหน้าข้อมูลอ่านเพิ่มเติมใช้เนื้อหาที่ผ่านการตรวจ หากแสดงบริการ/หมายเลข ต้องตรวจแหล่งปัจจุบันก่อนเผยแพร่ ไม่ใส่หมายเลขจากความจำ
- ทดสอบ build บน Vercel และ itch.io จริง ไม่ใช้การมี ZIP หรือ deploy สำเร็จแทนการเล่นได้

บันทึกหลักฐานแบบกระชับใน milestone นี้เมื่อทำงานจริง: build/commit, วันที่, commands, browser/device, routes/checkpoints ที่ตรวจ, ผล, known limitations และผู้ตรวจ ไม่สร้าง TESTING.md ซ้ำในระยะ Lean

## Closed decisions และ OPEN QUESTION gates

| Decision | สถานะและ Source of Truth |
|---|---|
| N-02 | **CLOSED** — [NARRATIVE_SYSTEM](docs/NARRATIVE_SYSTEM.md); compiler/runtime exact executable และ minor/patch ตรวจ M0/A-01 |
| G-02 | **CLOSED** — Safe Checkpoint/atomic save-load/version compatibility ใน [GAME_STATE](docs/GAME_STATE.md) |
| G-03 | **CLOSED** — Global profile กับ per-playthrough scopes ใน [GAME_STATE](docs/GAME_STATE.md) |

รายการต่อไปนี้ยังเป็น OPEN QUESTION จริงเท่านั้น ไม่ใช้ N-02/G-02/G-03 เป็น unresolved gates อีก

| ก่อนงาน | คำถามและไฟล์เจ้าของ |
|---|---|
| M0 dependency lock | A-01 toolchain versions — [ARCHITECTURE](ARCHITECTURE.md) |
| M2 real story / M4–M5 content | N-03 scene cards/บทที่อนุมัติ — [NARRATIVE_SYSTEM](docs/NARRATIVE_SYSTEM.md) |
| M3 relationship implementation | G-01 representation/initial values/rules — [GAME_STATE](docs/GAME_STATE.md) |
| ก่อน final art และ M6 | U-01 layout/asset coordinates, U-02 export contract, U-03 defaults — [UI_ASSET_SPEC](docs/UI_ASSET_SPEC.md) |
| ก่อน M6 audience playtest | P-01 audience — [PROJECT](PROJECT.md) |
| ก่อน freeze competition scope และ M7 | P-02 competition — [PROJECT](PROJECT.md) |

**Technical Documentation Baseline v0.1 พร้อมสำหรับ Freeze ของ core technical contracts** โดยคง OPEN QUESTION ข้างต้นเป็นเงื่อนไขของงานภายหลัง ไม่มี blocker ที่ทำให้ปิด N-02/G-02/G-03 ไม่ได้ A-01 เป็นงานตรวจ compatibility ใน M0; G-01/N-03 และ U/P questions ต้องปิดก่อนงานที่เกี่ยวข้อง ไม่ฝังค่า state/permission policy/บท/final identity ที่ยังไม่ล็อก สถานะและผลตรวจ implementation ให้ดูบันทึก M0 ด้านบน

## ต่อสู่เกมเต็ม

หลัง Prototype review ให้กำหนด production plan ของ Day 4–7 ตาม map: ขอบเขตสมุด/ร่างกาย → ข้อกล่าวหาและการแบ่งข้อมูล → ผลย้อนหลัง/ฝน → งานร่วมกัน/Final Shop State/epilogues ไม่เปลี่ยน state engine หรือเริ่ม save model ใหม่ ทดสอบ delayed ledger และ world facts ทุก branch ก่อนปล่อยเกมเต็ม

Full Game ต้องตรวจงบหลัก 50 นาที + เสริมประมาณ 8 นาทีและไม่เกิน 60 นาทีด้วย playtest จริง ไม่มี milestone ของ Day 4–7 ที่อนุมัติหรือกำหนดเส้นตายในชุด M0–M7 นี้ การประเมินงานระยะต่อไปต้องไม่ถูกตีความว่า M7 ส่งเกมเต็มแล้ว
