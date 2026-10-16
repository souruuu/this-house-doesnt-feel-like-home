# CR-NAR-001 — Demo Narrative Scope & Canonical Reference Revision

**Project:** This House Doesn't Feel Like Home (บ้านที่ไม่รู้สึกเหมือนบ้าน)  
**Document revision:** v0.2 — ARCHITECTURE-REVIEWED COORDINATION BASELINE  
**Date:** 17 October 2026 (Asia/Bangkok)  
**Prepared by:** 01 — Architecture & Decisions  
**Owner decision status:** Narrative scope and nine-scene structure **CONFIRMED**; editorial consolidation completed by 01 under Owner’s delegated routine-document handling. **Not a repository-installed canonical revision.**  
**Repository modification:** **NOT AUTHORIZED / NOT PERFORMED**  
**03 Technical Batch:** Planning A–D confirmed; implementation, Git actions and deployment **PENDING EXPLICIT OWNER AUTHORIZATION**  
**Target:** Playable Day 1–3 Demo + ZIP + Playable URL by 17 October 2026, 12:00 ICT.

## 1. Purpose and reason for change

บันทึกการเปลี่ยนแปลงอย่างตรวจย้อนกลับได้ระหว่าง Narrative Map เจ็ดวันเดิมกับ Owner Decisions ล่าสุดสำหรับ Emergency Demo เพื่อป้องกันไม่ให้ 03, 04 และ Codex ใช้ข้อกำหนดคนละเวอร์ชัน เปลี่ยนเพราะต้องส่งเกมที่เล่น Day 1–3 ได้จริงในเวลาจำกัด และมี Artwork อ้างอิงตัวละครสี่คนสำหรับต้นแบบ การปรับนี้เป็นการ **ย้ายและลดขอบเขตการผลิต** ไม่ใช่ลบตัวละครบาสหรือยกเลิก Puzzle ของเกมเต็ม

เอกสารนี้เป็น **Change Record ที่ 01 ตรวจและจัดรูปแบบเรียบร้อยสำหรับการประสานงาน** ไม่ใช่การเปลี่ยน Source of Truth ใน Repository ทันที ข้อเท็จจริงที่ Owner ยืนยันแล้วมีอำนาจตาม Owner Decision แม้เอกสารเก่ายังไม่ถูกแก้; แต่ Code/Docs changes ต้องได้รับการอนุมัติแยกตาม `AGENTS.md`.

## 2. Source references and precedence

1. **Original historical baseline:** `sources/narrative_map_7_day_Updates.md` (เก็บไฟล์เดิมแบบไม่เขียนทับ); SHA-256 ที่ `PROJECT.md` ระบุ: `B0EC03E7D54A4AAF1D7976D4CD585D8A982D83D415EDABE3F1B272A5DEE04CDB`.
2. **Confirmed overrides:** Owner Decisions ในบทสนทนา 01 เรื่องเด็กสี่คน/บาส/ตาราง Puzzle/ขอบเขตเดโม และ Owner-approved nine-scene structure.
3. **Owner-approved scene-structure reference:** `Narrative_Phase1_Scene_Structure_v0.1.md` โดยนำ **โครงเก้าฉาก** และข้อแก้ที่ Owner ยืนยันมาใช้ ไม่ยกความหมายว่าบทพูดหรือ proposed facts ทั้งไฟล์ผ่านอนุมัติแล้ว.
4. **Technical boundaries:** `PROJECT.md`, `MASTER_PLAN.md`, `docs/NARRATIVE_SYSTEM.md`, `docs/GAME_STATE.md`, `docs/UI_ASSET_SPEC.md`, `ARCHITECTURE.md`, `AGENTS.md` โดย Owner overrides ใช้เฉพาะประเด็น Narrative/Schedule ที่ขัดกัน ไม่ล้มเลิก contract ที่ไม่เกี่ยวข้อง.
5. **Future canonicalization (not executed):** เมื่อได้รับ explicit Repository/Documentation Mutation Authorization ให้จัด narrative revision ที่อ้างกลับ original ได้อย่างมีสถานะเดียว และแก้ cross-references ของเอกสารเกี่ยวข้อง ไม่ปล่อยให้ต้นฉบับกับฉบับใหม่เป็น Active Source of Truth สองชุดที่ขัดกัน.

**Precedence for demo planning:** Owner-confirmed decisions > approved nine-scene structure (เฉพาะ structure) > original narrative facts เฉพาะที่ไม่ขัดกัน > proposed content (ยังไม่ใช้ Production). ไม่ยกระดับทางเลือกใน Scene Cards เป็น Approved Dialogue หรือ Domain Semantics โดยพลการ.

## 3. Change ledger — before → after / why

| Change | Previous map / docs | Confirmed current direction | Reason / downstream effect |
|---|---|---|---|
| CR-01 Demo cast | Prototype Day 1–3 เห็นเด็กทั้ง 5; บาสปรากฏ D1/D2/D3 | **ส้ม (8), มะนาว (12), กันต์ (14), นัท (13) เท่านั้น**; ไม่มีบาสหรือ cameo ใน Day 1–3 | ลดเนื้อหาและ asset burden; แก้ cast references, asset/test expectations |
| CR-02 Bas entrance | บาสขอฝาก/ซ่อมรถ D1, ซ่อม D2 | **บาส (10) เข้าครั้งแรก Day 4**; ข้อตกลงเรื่องรถใน Day 4 หากตกลงร่วมกัน | เก็บ arc เดิมไว้หลังเดโม; ระวัง Promise IDs และ save/content references เก่า |
| CR-03 Toy-car repair | Puzzle รถ D2 | **Puzzle รถ Day 5**; เดโมไม่มี Repair Puzzle | ย้าย D1-B/D2-A car continuity และ test/assets; ห้ามนำ `bas_car_due_D2` มาใช้แทน Day 5 แบบเงียบ ๆ |
| CR-04 Music box | Puzzle Day 7 | **คง Puzzle กล่องดนตรี Day 7**; บาสเสนอข้อตกลงใน Day 6 ตามทิศทางล่าสุด | ไม่เพิ่ม Puzzle ใหม่; Day 4–7 implementation อยู่นอก demo batch |
| CR-05 Prototype gameplay | Prototype ต้องโชว์ repair, car promise D1→D2, Album/full-system slices | Day 1–3 เน้น narrative choices, immediate reactions, **อย่างน้อยหนึ่ง approved delayed callback**, Quiet Close | ปรับ Emergency Demo acceptance เท่านั้น ไม่ประกาศ milestone DoD เดิมผ่าน และไม่ยกเลิก full-game systems |
| CR-06 Scene sequence | D1-A/B/C, D2-A/B/C, D3-A/B/C โดยมีบาสในหลายฉาก | **9 semantic scenes** `SC-D1-01`…`SC-D3-03` ตาม Section 4 | รองรับ content handoff ชัด; ไม่ reuse `D1-B` หรือ `D2-A` ของรถเป็นเนื้อหาใหม่ |
| CR-07 Day 2 placement | มะนาว/นัทอยู่ช่วงเชื่อม D2-C | มะนาวยางลบ **เช้า D2**, ส้มหลังเลิกเรียน, นัทช่วงเย็น | Owner-approved timing adaptation; ไม่อ้างว่าเป็น sequence เดิม |
| CR-08 Day 3 close | D3-C มี Bas cameo | **ตัด Bas cameo**, กันต์ทำของตกจริง, Quiet Close และ `DEMO_END` | รักษาความหมายที่ไม่ตีตราเด็ก; ไม่ทำ full seven-day epilogue |
| CR-09 Demo persistence | Full game/save spec มี checkpoint/save slots | **Defer Production Save/Resume เฉพาะ Emergency Demo เป็น planning decision**; ไม่ใช้ fixture save identity | ลด Critical Path; ต้องแจ้ง reload limitation; ไม่ปิด Save DoD/Release Gate |
| CR-10 Story/content approval | N-03 ยัง OPEN และไม่มี Production Thai Dialogue | 04 ส่ง Owner-reviewed Day 1, Day 2, Day 3 rolling packages แยกตาม Revision | 03 ห้ามแต่ง Narrative Facts หรือ implement unapproved content |

## 4. Owner-approved semantic nine-scene manifest

สถานะด้านล่าง **APPROVED เฉพาะ Scene Structure**: identity/order/time/core purpose. Choice text, reactions, line/event IDs และ durable semantics รายละเอียด **PENDING CONTENT APPROVAL**.

| Semantic Scene ID | Day / time (ICT) | Narrative core | Original-map mapping | Next |
|---|---|---|---|---|
| `SC-D1-01` | D1 06:30–07:30 | มะนาวซื้อเครื่องเขียน | D1-A (Manao part) | SC-D1-02 |
| `SC-D1-02` | D1 15:30–17:15 | ส้มกับลูกอมสองเม็ด | D1-A (Som part) | SC-D1-03 |
| `SC-D1-03` | D1 17:15–21:00 | นัทคุยอาหารตามที่ยินดีเล่า, กันต์อยู่ชายคา, Quiet Close | D1-C, excluding Bas | SC-D2-01 via day transition |
| `SC-D2-01` | D2 06:30–07:30 | มะนาวกับยางลบ | D2-C (Manao part; retimed) | SC-D2-02 |
| `SC-D2-02` | D2 15:30–17:00 | ส้มเลือกจัดการของที่เงินไม่พอ | D2-B | SC-D2-03 |
| `SC-D2-03` | D2 17:00–21:00 | นัท callback เรื่องอาหารตามเงื่อนไข, Quiet Close | D2-C (Nut part) | SC-D3-01 via day transition |
| `SC-D3-01` | D3 15:30–18:30 | ส้มตกใจเสียงรถ เลือกพื้นที่พัก ไม่บังคับเปิดเผย | D3-A | SC-D3-02 |
| `SC-D3-02` | D3 19:00–20:00 | นัทขออยู่ต่อก่อนร้านปิด; ขอบเขตเวลา/ข้อมูล | D3-B | SC-D3-03 |
| `SC-D3-03` | D3 20:00–21:00 | กันต์ปัด/ผลักของบนชั้นตกจริง; วางขอบเขต; Quiet Close | D3-C, excluding Bas | DEMO_END |

**Approved structural route:** START → NOTICE/PROLOGUE → SC-D1-01 → SC-D1-02 → SC-D1-03 → SC-D2-01 → SC-D2-02 → SC-D2-03 → SC-D3-01 → SC-D3-02 → SC-D3-03 → DEMO_END. NOTICE/PROLOGUE and DEMO_END production text/technical identity remain to be approved. Choices must rejoin; no disclosure gate or artificial dead end.

## 5. Narrative invariants retained

- Full game 7 days with five children; prototype is a contiguous Day 1–3 segment, not a separate canon. No Bas in demo; no extra replacement puzzle.
- Rural shop hours **06:00–21:00**, no overnight stay, no playable scenes after closing, no offsite quest, calls/messages/social worker action.
- Blank Protagonist: no forced gender, age, backstory, interior monologue or moral explanation.
- TSPR dimensions Trust/Safety/Pressure/Respect remain separate; **G-01 formulas/initial values/thresholds not approved**. No composite trust score, trauma gate, disclosure reward or relationship reward for puzzle skill.
- Promise kinds Task/Space/Information/Boundary retain meaning. A promise occurs only upon mutually agreed terms; no forced new Promise for demo callback.
- Memory distinguishes `seen`, `told`, `permission`. Observing candy ≠ knowing recipient; hearing Nut's food preference ≠ permission to share; Kan's behavior ≠ proof of unrelated allegations.
- Day 3 Som chooses where to pause; Nut's stay ends within shop hours; Kan actually knocks items down and is held to a behavioral boundary without labeling identity.
- Delayed callback and immediate choice reactions must be based on witnessed/spoken/approved events, and one-time domain effects must not duplicate. Quiet Demo Ending signals continuation, not a Good/Bad/True/Full Game ending.
- Technical architecture, durable-state ownership, existing technical fixture isolation and release gates remain untouched by narrative scope revision.

## 6. Minimum delayed callback: concept approved, exact content pending

**Owner-approved direction:** use Nut's food-interest discussion from `SC-D1-03` to `SC-D2-03` as minimum delayed callback.

**Proposed semantics (not yet approved as Production Facts/Code):** On D1, if Nut actually voluntarily speaks a specific food-preference line to the player in the chosen dialogue branch, record an appropriate `told` fact. Proposed draft key: `NUT_FOOD_INTEREST_TOLD_D1` (**NOT an approved technical Event/Line ID**). On D2, true branch may continue the particular subject the player really heard; false branch must not imply an unspoken D1 disclosure. Nut and Player know what was spoken; no third party is presumed to know it. No permission to relay, new Promise, numeric TSPR delta, invented recipe or family detail.

`04` must deliver actual Thai lines/choice outcomes, conditions/alternatives and narrative tests. `03` maps these to production Ink/Registry under separate Implementation Authorization. Details remain **PROPOSED until separate Owner Content Approval**.

## 7. Continuity risks / pending content decisions

| Issue | Current treatment | Required owner/content action |
|---|---|---|
| Kan's name | Presence at D1 awning does not establish his name in player knowledge | `04` proposes in-scene credible naming/anonymous label, Owner reviews before production dialogue |
| Som D2 offered food | Food offer/accept/refuse in short card is proposal, not full approved transaction fact | `04` writes all outcomes and constraints; no new money/inventory/credit mechanic |
| Nut callback timing | Concept approved, not actual lines, conditions or release flags | Owner approves per Day 1/Day 2 content package |
| Day 3 exact ending | Structure and non-faux-ending semantics approved; actual Thai text pending | `04` drafts and Owner approves Package 3 |
| Notice/Prologue | Structural boundary approved, production wording not yet | `04` drafts content, 03 handles integration later |
| Original Bas Day1/Day2 IDs | `D1-B`, `D2-A`, `bas_car_due_D2` refer to obsolete timing | Future documentation/technical plan should rename with explicit migration/mapping review, not silently reinterpret |
| Fullgame shifted density | Bas first Day4, car Day5; old Day5 also hosts accusation/information scenes | Evaluate Day4–7 schedule later, not part of Demo Delivery; do not invent revised fullgame text now |

## 8. Proposed document update plan (requires separate repo authorization)

| File | Required change type | Guardrail |
|---|---|---|
| `sources/narrative_map_7_day_Updates.md` | **PRESERVE unchanged** as original historical source | Keep original bytes and recorded SHA; do not silently rewrite |
| New versioned narrative revision under `sources/` (exact filename to approve) | Add explicit source lineage and dated override for Bas/vehicle puzzle/demo scenes; link Owner-approved Scene Structure | One active current narrative authority, original stays archival |
| `PROJECT.md` | Update Prototype cast, must-have gameplay, Bas Day4 and car Day5; declare active approved revision link | Preserve seven-day full game, constraints, and provenance |
| `MASTER_PLAN.md` | Add scoped emergency decision/risks; document M2/M4/M5 task/test implications as **pending revisions**, not retrospective DoD PASS | Do not mark M0–M7 DONE or rewrite verification evidence |
| `docs/NARRATIVE_SYSTEM.md` | Clarify actual release content handoff/scene ID mappings and N-03 status as packages gain approval | Preserve locked N-02 technical constraints; no technical spec inventions |
| `docs/GAME_STATE.md` | Replace stale Bas D2 examples only once migration/semantics reviewed | Preserve G-02/G-03; G-01 remains open |
| `docs/UI_ASSET_SPEC.md` | Update examples/tests depicting car puzzle in demo and confirm four-character asset needs only when applicable | Do not claim final assets approved |
| `README.md` / `AGENTS.md` | Update active Source-of-Truth references only if new canonical file is approved and docs update authorized | Preserve workflow and strict Owner gates |

No Git branch, repository documentation write, code edit, commit, push, PR, deploy, or merge authorized by this coordination record. This standalone local Markdown file is not a repository mutation.

## 9. Approval and rolling content responsibilities

- **01 — Architecture & Decisions:** Maintain this consolidated change record as a working coordination baseline, check editorial consistency and cross-references without repeatedly seeking Owner review for non-substantive edits. Owner-approved cast/puzzle/scope and nine-scene structure remain unchanged. Material scope/story/architecture changes are escalated to Owner.
- **04:** Day 1 → Day 2 → Day 3 separate Narrative Packages with Scene Manifest, real Thai Dialogue/Choices/Responses, Knowledge/Permission/Immediate/Delayed Matrix, presentation fallback, proposed references, and tests. Each must be separately Owner-approved before being declared Content-Ready.
- **03:** Read-only review/planning permitted now; no production implementation until separate explicit technical authorization. Then uses only exact approved content revisions; technical Line/Event IDs and system mapping are 03's responsibility.
- **05:** Inventory actual usable art/asset files; proposed semantic asset mapping is not proof that production artwork exists.

**Approval-state matrix at drafting time:**

| Item | Status |
|---|---|
| Narrative direction, cast, Bas/puzzle rescheduling | OWNER CONFIRMED |
| Nine-scene semantic structure, sequence, windows and minor corrections | OWNER APPROVED |
| CR-NAR-001 v0.2 coordination record | ARCHITECTURE-REVIEWED — READY FOR PLANNING HANDOFF; NOT YET INSTALLED IN REPOSITORY |
| Day 1 actual Thai Dialogue/Choices/Consequence Package | PENDING N-03 CONTENT APPROVAL |
| Day 2 actual package and true/false callback lines | PENDING N-03 CONTENT APPROVAL |
| Day 3 actual package/Quiet Close/Demo Ending lines | PENDING N-03 CONTENT APPROVAL |
| Production Save/Resume deferral | PLANNING DECISION CONFIRMED, not a DoD waiver or code action |
| 03 implementation, Git mutations, deployment | NOT AUTHORIZED — PENDING SEPARATE EXPLICIT OWNER AUTHORIZATION |

## 10. Delegated routine-document handling / operational handoff

**Owner’s latest coordination instruction (17 October 2026):** 01 should handle routine editorial and non-substantive review work without stopping to request the Owner's review of every document. Report what was completed and recommended. Escalate material or high-risk decisions; **do not** treat this as Implementation/Git Authorization.

**Completed in this revision (v0.2):**

- Converted the previously proposed CR-NAR-001 v0.1 into a consistent, consolidated **coordination baseline**; no new story facts, TSPR rules, Promise semantics, or technical decisions were approved by this editorial pass.
- Retained the original narrative-map provenance and expressly kept the source file unchanged.
- Retained the nine Owner-approved scene structures and their original-source mapping, with content approvals clearly separated.
- Registered the planning-only A–D technical decisions, deferred demo save/resume limitation and the ongoing N-03 content gate.
- Clarified that a future repository source-of-truth update is **not implemented**, and requires explicit mutation authorization according to `AGENTS.md`.

**Operational usage until repository canonicalization:** For cross-chat planning and content review, cite **this v0.2 coordination record plus the Owner-approved nine-scene structure** as the latest dated owner-decision reconciliation; use the original narrative map for compatible, unchanged facts. Do not represent this standalone file as already installed in `PROJECT.md` or as an override committed to the repository. Where repository docs contradict confirmed owner decisions, flag the conflict rather than silently choosing obsolete narrative schedule.

**Low-risk maintenance handled by 01 without repeated review:** prose cleanup, link/source mapping, consolidating already-approved decisions, status tables, revision labels, and non-substantive consistency updates that do not require repository mutation.

**Decisions requiring explicit Owner intervention:** any new/changed story facts or character arcs; a different cast/day/scene meaning; additional promises, permission policy, TSPR numeric/domain formulas; deviations from time/puzzle restrictions; relaxation of Content Approval or Release Gates; any branch/code/document/config changes in the repository, commit/push/PR/deployment; and any disputed source-of-truth installation or migration.

**Next production dependency:** 04 prepares Package 1 — Day 1 Thai Dialogue, Choices, immediate outcomes and narrated state/permission conditions; those new production details remain proposed until approved under the still-applicable N-03 gate. 03 may plan/inspect only until explicit Implementation Authorization is issued.

**Status of this record:** v0.2 is ready for planning handoff and routine coordination without a fresh Owner prose review. It is **not** an approved code/spec mutation, not new Content Approval and not authorization for Codex or Git actions.
