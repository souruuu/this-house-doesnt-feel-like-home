# This House Doesn't Feel Like Home — Final Narrative Handoff Index (Demo Day 1–3)

**Index Revision:** `NAR-HANDOFF-D1D3-v1.2`  
**Date:** 17 October 2026 (ICT)  
**From:** 04 — Narrative / Scene Cards (original v1.1); 01 — Architecture & Decisions (v1.2 editorial errata)  
**To:** 01 — Architecture & Decisions; 03 — M1 Narrative Engine (**read-only technical planning / content-to-technical mapping review only**)  
**Status:** **DAY 1–3 EDITORIAL CONTENT READY FOR TECHNICAL HANDOFF** / **IMPLEMENTATION AUTHORIZATION PENDING**  
**Scope:** Notice, Prologue, Day 1–3 (9 Owner-approved semantic scenes), Quiet Closes, Demo End; Thai-only; no implementation authority.

> **Index only.** This file locates authoritative content and explains dependencies. The complete Thai dialogue, choices, exact branch response text, per-choice state matrices, and full test case steps remain in the three day packages. Do not copy/reimplement dialogue from summaries in this Index.

## 1. Authority, revisions and source precedence

| Document / decision | Authoritative revision | Status / scope | Reference |
|---|---|---|---|
| Owner Frozen Scene Structure (17 Oct 2026) | 9 semantic scenes, approved order/windows; Phase 1 source `Narrative_Phase1_Scene_Structure_v0.1.md` plus Owner-approved minor revisions | **STRUCTURE APPROVED** | [`Narrative_Phase1_Scene_Structure_v0.1.md`](Narrative_Phase1_Scene_Structure_v0.1.md) + subsequent Owner Approval message |
| Day 1 / Notice / Prologue | **`P1-D1-v0.3`** | **EDITORIAL REVIEW ACCEPTED / CONTENT READY** | [`Narrative_Package1_Day1_Production_Content_v0.3.md`](Narrative_Package1_Day1_Production_Content_v0.3.md), §§B0, A–G |
| Day 2 | **`P2-D2-v0.2`** | **EDITORIAL REVIEW ACCEPTED / CONTENT READY** | [`Narrative_Package2_Day2_Production_Content_v0.2.md`](Narrative_Package2_Day2_Production_Content_v0.2.md), §§A–G |
| Day 3 / Demo End | **`P3-D3-v0.3`** | **EDITORIAL REVIEW ACCEPTED / CONTENT READY** | [`Narrative_Package3_Day3_Production_Content_v0.3.md`](Narrative_Package3_Day3_Production_Content_v0.3.md), §§A–G |
| [`CR-NAR-001 v0.2`](CR-NAR-001_v0.2_Coordination_Baseline.md) | **`CR-NAR-001 v0.2`** | **Verified coordination baseline** for original-to-emergency-demo changes `CR-01`–`CR-10`; Architecture-reviewed, **not installed as Repository canonical revision** | [`CR-NAR-001_v0.2_Coordination_Baseline.md`](CR-NAR-001_v0.2_Coordination_Baseline.md), §§2–10 |
| Background narrative / technical contracts | `narrative_map_7_day_Updates.md`, `PROJECT.md`, `GAME_STATE.md`, `NARRATIVE_SYSTEM.md`, `UI_ASSET_SPEC.md` | Apply where they do **not** conflict with later explicit Owner/01-approved demo decisions; 03 owns technical IDs/contracts | Project documentation (not modified by this handoff) |

**Explicitly approved departure from the older Narrative Map:** Day 1–3 use **only** มะนาว, ส้ม, นัท, กันต์; บาส first appears Day 4; toy-car puzzle Day 5; music-box puzzle Day 7; **no repair puzzle in demo**. Day 2 มะนาว encounter at 06:30–07:30 is Owner-approved timing adaptation. Shop operates 06:00–21:00; no overnight stay, no full-game ending in demo. The corresponding details are verified against `CR-NAR-001 v0.2` §§3–5.

**Revision lock:** `P1-D1-v0.3`, `P2-D2-v0.2`, `P3-D3-v0.3` supersede previous versions for production content. Do not treat `v0.1/v0.2` of other days as authoritative content. Semantic scene IDs are Owner approved; the Draft Content References in package tables are not technical release IDs.

**Coordination baseline versus later content decisions:** `CR-NAR-001 v0.2` §§6–9 records the **content-review status at the time it was drafted**, when detailed dialogue was still pending. Subsequent instructions from 01 accepted **Day 1 `P1-D1-v0.3`, Day 2 `P2-D2-v0.2` and Day 3 `P3-D3-v0.3`** under delegated Editorial Review, so those later approvals take precedence **for content approval status only**. The CR remains the authoritative working reconciliation of the owner-confirmed **demo scope changes**; it does **not** replace the historical Narrative Map in the Repository, approve G-01, or authorize implementation. The priority for demo planning remains **Owner-confirmed changes > Owner-approved nine-scene structure > compatible historical Narrative Map facts > unaccepted drafts**.

**Change-record cross-references for 03:** `CR-01/02` (four-child demo cast; Bas enters Day 4), `CR-03/04` (car puzzle Day 5; music box Day 7), `CR-05/06` (narrative-focused demo and new scene identities), `CR-07` (Manao morning of Day 2), `CR-08` (no Bas cameo in D3; Quiet Close and Demo End), `CR-09` (Emergency Demo Save/Resume deferral), and `CR-10` (rolling revision-specific production content handoff). See CR §3 for original-versus-current details. Do not silently repurpose historical `D1-B`, `D2-A` or `bas_car_due_D2` as new technical identities.

## 2. Complete demo flow and scene locator

**Main Flow:** `START → NOTICE → PROLOGUE → SC-D1-01 → SC-D1-02 → SC-D1-03 → SC-D2-01 → SC-D2-02 → SC-D2-03 → SC-D3-01 → SC-D3-02 → SC-D3-03 → QUIET_CLOSE_D3 → DEMO_END`.

`/START`, `/END`, `DAY_1_COMPLETE`, `DAY_1_TO_DAY_2`, `DAY_2_TO_DAY_3`, `QUIET_CLOSE_D3`, `DEMO_END` are **semantic content-flow/boundary references**, not assigned Ink knots or runtime Event IDs.

| Order | Scene / content reference | Approved time (ICT, within story) | Main character / purpose | Boundary → next | Authoritative package section |
|---:|---|---|---|---|---|
| — | Notice `D1N-L001–L002`, `D1N-C01-A` / Prologue `D1P-L001–L003` | Before D1 first encounter; shop opens 06:00 | Minimum text, intro to shop; no protagonist backstory; **Pause Menu wording must match actual UI** | `START → NOTICE → PROLOGUE → SC-D1-01` | P1 §B0 |
| 1 | `SC-D1-01` | D1 06:30–07:30 | มะนาว buys pencil/eraser, states own name | `D101-R01` → `SC-D1-02` | P1 §§A2, B1 |
| 2 | `SC-D1-02` | D1 15:30–17:15 | ส้ม buys two candies; buyer/recipient not inferred | `D102-R01` → `SC-D1-03` | P1 §§A2, B2 |
| 3 | `SC-D1-03` | D1 17:15–21:00 | นัท shopping/optional food conversation; unnamed boy at awning; Quiet Close at 21:00 | `D103-R01 → D103-R02` → D2 | P1 §§A2, B3 |
| 4 | `SC-D2-01` | D2 06:30–07:30 | มะนาว, old small eraser and choice of item | `D201-R01` → `SC-D2-02` | P2 §§A1, B1 |
| 5 | `SC-D2-02` | D2 15:30–17:00 | ส้ม chooses what she can buy; may accept or decline offered food portion | `D202-R01` → `SC-D2-03` | P2 §§A1, B2 |
| 6 | `SC-D2-03` | D2 17:00–21:00 | นัท food callback **T/F**, ordinary choice, Quiet Close at 21:00 | `D203-R00 → D203-R01` → D3 | P2 §§A1, B3 |
| 7 | `SC-D3-01` | D3 15:30–18:30 | ส้ม startled by **passing motorcycle and unidentified male voice from road**; chooses chair position | `D301-R01` → `SC-D3-02` | P3 §§A1, B1 |
| 8 | `SC-D3-02` | D3 19:00–20:00 | นัท returns **at night/evening** and asks to sit briefly; leaves before 20:00 | `D302-R01` → `SC-D3-03` | P3 §§A1, B2 |
| 9 | `SC-D3-03` | D3 20:00–21:00 | กันต์ knocks two items from shelf; boundaries, cleanup, optional self-disclosed name, Quiet Close; shop closes 21:00 | `D303-R01 → D303-R02` → `DEMO_END` | P3 §§A1, B3 |
| — | `DEMO_END`: `D3E-L001–L002`; menu `D3E-C01-A` | After shop close as UI, **not** post-21:00 story event | “จบช่วงทดลองเล่น — วันที่ 1–3”; Days 4–7 remain ahead | Return to main menu | P3 §B4 |

All choice routes converge before the next required scene. The final UI is an intentional demo completion, not a dead end or a Full Game Epilogue.

## 3. Choice-group and branch/rejoin locator

| Scene | Choice group / semantic refs | Branch destinations and rejoin | Critical narrative constraint |
|---|---|---|---|
| `SC-D1-01` | `D101-C01-A/B` | `D101-L005A/B` → `D101-R01` | Girl's name learned only after `D101-L007` |
| `SC-D1-02` | `D102-C01-A/B` | `D102-L005A/B` → `D102-R01` | Two candies observed; no inferred intended recipient |
| `SC-D1-03` | `D103-C01-A/B`; `D103-C02-A/B` | Food discussion `D103-L005A–L006A` **or** ordinary sale `D103-L005B` → `D103-R01`; awning response `D103-L010A/B` → `D103-R02` | Food fact only on first group's A line; Kan name **not** told Day 1 |
| `SC-D2-01` | `D201-C01-A/B` | `D201-L005A/B` → `D201-R01` | Old small eraser need not be yesterday's purchased eraser |
| `SC-D2-02` | `D202-C01-A/B`; nested `D202-C02-A/B` only after C01-B | C01-A → `D202-L007P` → `D202-R01`; C01-B → C02-A **accept** → `D202-L007A` → R01, or C02-B **refuse** → `D202-L007N` → R01 | Player only offers/explains; Som makes actual accept/refuse decision; **three total completed purchase paths**, no finance/inventory simulation |
| `SC-D2-03` | `D203-C01-A/B`; one T/F dialogue gate before choice | **Exactly one** of `D203-L003T/F` → `D203-R00` → `D203-C01-A/B` → `D203-R01` | T/F controlled by actual D1 told fact; choice itself does not generate D1 food fact |
| `SC-D3-01` | `D301-C01-A/B` | `D301-L006A/L007A` or `D301-L006B/L007B` → `D301-R01` | Chair provided today, no cross-day seat Promise granted |
| `SC-D3-02` | `D302-C01-A/B` | `D302-L005A/L006A` or `D302-L005B/L006B` → `D302-R01` | Shop closes 21:00; Nut leaves before 20:00; no forced disclosure |
| `SC-D3-03` | `D303-C01-A/B`; `D303-C02-A/B` | Cleanup A `D303-L005A–L007A` **or** B `D303-L005B–L007B` → `D303-R01`; optional name A `D303-L010A/L011A` **or** unnamed B `D303-L010B/L011B` → `D303-R02` | Exactly **two** fallen items restored once; narrator/player learn “กันต์” only **after** `D303-L010A` on C02-A |

**03 mapping boundary:** The 04-owned refs (`D101-L…`, `D202-C…`, `D303-R…`, semantic facts below) preserve content identity and review traceability. 03 proposes **technical Ink knot IDs, stable Line IDs, EventRegistry IDs, read-only query names, scene asset registry and dispatch semantics** per `NARRATIVE_SYSTEM.md`/`GAME_STATE.md`. Do not infer IDs from row order or use rejected old `D1-B`/`D2-A` as new semantic scenes. `Rxx` markers are not readable dialogue lines.

## 4. Minimum cross-day consequence — Nut D1→D2

| Step | Exact evidence / source | Guard and result |
|---|---|---|
| Day 1 player choice | `D103-C01-A` vs `D103-C01-B` | A invites talking about food; B completes normal sale |
| Day 1 **fact-bearing dialogue** | `D103-L005A`: “ผมชอบทำอาหารครับ ชอบคิดว่าของที่มีอยู่เอามาทำอะไรได้บ้าง” | After this line **actually occurs**, semantic `told` fact `NUT_FOOD_INTEREST_TOLD_D1` may be recorded once: Nut told Player his interest |
| TRUE Day 2 | `SC-D2-03` → `D203-L003T` | If and only if fact exists in **current playthrough**, show Nut referring to **yesterday's actual conversation** |
| FALSE Day 2 | `SC-D2-03` → `D203-L003F` | If fact absent, show ordinary current-day shopping question; **do not** imply prior food talk |
| Both variants | `D203-R00`, then `D203-C01-A/B` → `D203-R01` | Both variants use same continuation; no threshold, new Promise, family disclosure, or extra relationship score |

The `NUT_FOOD_INTEREST_TOLD_D1` token is **a narrative semantic fact reference**, not an approved TypeScript event identifier. D1 `D103-C01-A` alone is not evidence that the response line was displayed. Learning Nut's name (`D103-L004`) or meeting him does not imply knowing his food interest. No permission to share this information with a third party follows from the conversation. D3 has **no entry dependency** on this fact.

## 5. State, knowledge, consent/permission and event guards

| Scope | Allowed source of truth | Forbidden inference or extra rule |
|---|---|---|
| All characters | Distinguish `seen` / `told` / `permission` with evidence line, owner/recipient, provenance and scope, per day packages §§C | No merging observation into disclosure or disclosure into permission; no “being polite” score or TSPR formula |
| มะนาว | Name when she states it `D101-L007`; eraser/pencil observations `SC-D1-01`/`SC-D2-01` | No family reason for eraser, no notebook-reading right or automatic permission |
| ส้ม | Name `D102-L007`; two candies; D2 acceptance only if `D202-L007A` completes; D3 chair placement and passing sound at `D301-L002–L003` | No assumed candy recipient, poverty/backstory, motorcycle rider's identity, or who made male voice; no forced discussion of fear or cross-day seat promise |
| นัท | Name `D103-L004`; food told fact only `D103-L005A`; D3 can decline discussing trusted adults and still sit briefly | No fact from unseen D1 branch; no family/overnight facts, sharing permission, phone/messaging event, or cross-day confidentiality promise |
| กันต์ | D1 known as **“เด็กชายที่ชายคา”**. D3 observed shelf incident at `D303-L002`; only own speech `D303-L010A` yields `KAN_NAME_TOLD_D3` | No name displayed in scene, speaker label, Album or backlog ahead of actual line; no theft inference, no physical restraint, no obligation to apologize or disclose |
| Time / progress | Shop closes 21:00 Day 1, Day 2, Day 3. Demo ends after D3 shop close as UI | No scene interaction after shop close; no lodging overnight; no 7-day resolution or Good/Bad/True Ending |
| One-time semantics | Branch output and fact/event commit once when evidence occurs, no duplicate from rapid/double input or rerender within same playthrough | No persistent flag merely to render text; no silent Domain Event/Promise/TSPR delta for every narrative reference |

**Semantic—not implementation—facts to check:** `NUT_FOOD_INTEREST_TOLD_D1`, `KAN_NAME_TOLD_D3`, `KAN_SHELF_ITEMS_KNOCKED_D3`, Som food acceptance/refusal, and scene-local chair/short-stay observations. Exact technical storage and G-01 dependent payloads remain 03/domain authority; these narrative facts are not all mandates to create new durable fields. `KAN_NAME_TOLD_D3` is generated only after the child chooses to tell and speaks the name, not from the source character ID.

## 6. Required Narrative Test Paths — expectations, not executed results

Full test matrices: **P1 §F (13 cases), P2 §F (12 cases), P3 §F (15 cases)**. The following index specifies the essential cross-package paths for 03 read-only verification planning:

| Acceptance path | Source cases / exact observation expected |
|---|---|
| End-to-end progress | `START → NOTICE/PROLOGUE → all 9 scenes → DEMO_END`, no orphan branches; P1/P2/P3 main-flow tests, P3 `T01`, `T11`, `T13` |
| Immediate outcome variants | Day 1 every C01/C02 has corresponding response and rejoins; Day 2 Som 3 outcomes and responses `D202-L007P/A/N`; Day 3 chair, short stay, two cleanup variants and name/no-name (P3 `T02–T11`) |
| Nut TRUE callback | D1 `D103-C01-A` → `D103-L005A` → semantic told fact present → **only** D2 `D203-L003T` → `D203-R00` |
| Nut FALSE callback | D1 `D103-C01-B` → no `L005A`/food fact → **only** D2 `D203-L003F` → `D203-R00`; no fabricated memory |
| D2 Som acceptance/refusal | In `D202-C01-B`, C02-A accepted vs C02-B declined; food prop/real dialogue reflects result, no invented price/inventory/debt; C01-A stays within budget |
| Kan name provenance | D3 `D303-C02-A` → name learned after `D303-L010A`; `C02-B` → unnamed through demo; full flow available both |
| D3 specific editorial lines | `D301-L002`: **รถมอเตอร์ไซค์ผ่านหน้าร้าน** + unidentified male voice from road; `D302-L001`: **“ค่ำแล้ว นัทกลับมาที่ม้านั่งในร้าน”**; P3 `T01–T04` |
| Shop-time and scope | Day 1/2/3 windows per §2, no child at shop after 21:00; no Bas, toy puzzle, repair, full-game epilogue; P2 `T10`, P3 `T12–T13` |
| Privacy / non-disclosure | No compulsory family disclosure or inferred permission; Som, Nut, Kan may decline to talk/name and still proceed; P3 `T14` |
| Same-playthrough idempotency | Rapid/double choice events do **not** duplicate food fact, giving item, shelf incident, cleanup, name disclosure or other domain effects. P1 `T10`, P3 `T15`; compare each package's other no-replay expectations |

**Required technical test ownership:** 03 owns runnable Vitest/Playwright/browser cases and actual results once authorization exists. These are **designed expected outputs**, not claims of executed tests.

**Deferred production testing (not removed):** Save/Resume restore, choice checkpoint restore without choice preselection, coherent Ink+Zustand state snapshots, no repeated one-shot SFX/domain effects after load, story/schema/build compatibility, save slots/localStorage error cases and Prototype→Full Game migration. See `GAME_STATE.md` G-02/G-03 and P1/P2/P3 §§F/G; P3 `RT01–RT04`. Per `CR-NAR-001 v0.2` **CR-09**, the Emergency Demo **plans to defer Production Save/Resume**; this is **not** evidence that the existing full-game Save DoD or Release Gate passed or was abolished. Communicate reload/progress-loss limitations if this demo ships without persistence; **in-playthrough no-duplicate-effect testing is still required**.

## 7. Essential / Optional Asset and presentation handoff

All identifiers below (such as `BG_SHOP_MORNING`, `BG_SHOP_AFTERNOON`, `BG_SHOP_EVENING`) are **proposed semantic placeholders**, **not** approved production asset IDs, completed assets, or final export formats. 03/05 must reconcile the manifest, stage anchors and fallback mapping under `UI_ASSET_SPEC.md` when implementation is separately authorized.

| Scope | Essential to understand story and choices (can be text/placeholder) | Optional and skippable |
|---|---|---|
| Notice/Prologue | Thai UI text, `D1N-C01-A` start control, shop opening narration; **functional pause menu if Notice claims it exists** | Door-opening SFX, lighting animation |
| Day 1 (P1 §E) | Counter; pencil, eraser; two candies; food items; separate awning/counter space; correct unnamed speaker label; closing sign at 21:00 | Morning/evening light shifts, bag/door SFX, character blink/wave |
| Day 2 (P2 §E) | Old small eraser differentiated from on-shelf item; choice-specific food portion only if Som **accepts**; Nut T/F dialogue readable without audio; closing sign/time | Store ambience, coin/bag effects, nuanced expression |
| Day 3 (P3 §E) | Shelf and chair; **motorcycle and male voice cues in narration even with audio muted**; bench and 21:00 closure; exactly two items fallen and collected by correct branch; unnamed-boy vs Kan label conditional on speech; Demo End UI texts/return control | Passing motorcycle SFX, character movement, falling-item SFX, fade lighting and ambient sound |

Keep UI dialogue/choice semantics distinct from world props (React vs Phaser per technical contract). Propose only essential expressions; neutral sprites or labeled placeholders suffice. Sound must not be sole channel for an important narrative fact. Asset location/anchor/license/catalog U-01/U-02 and visual readiness are **not** asserted here.

## 8. Limitations, read-only handoff gate and decisions

- **Editorial:** Owner-approved **9-scene structure** and 01-reviewed **P1 v0.3 / P2 v0.2 / P3 v0.2** are content-ready. Day 3 v0.2 changed *only* the motorcycle wording at `D301-L002`, evening wording at `D302-L001`, related references/test expectations and document review status. Choice labels, outcomes and state meanings remain unchanged.
- **Coordination reference verified:** `CR-NAR-001 v0.2` is now available and reviewed. Its `CR-01`–`CR-10` ledger, Owner-approved scene windows, narrative invariants and scope/puzzle revisions align with the three 01-accepted Day 1–3 packages and the structure in this Index. The CR is **Architecture-reviewed coordination**, not a Repository-installed Source-of-Truth revision. Its older **PENDING N-03 CONTENT APPROVAL** table is a drafting-time snapshot, now superseded as to Day 1–3 content status by the later 01 Editorial Acceptance decisions; no contradictory **Owner-confirmed structural decision** was identified.
- **Technical mapping pending:** This package does not include release Ink/Line/Event IDs, TypeScript payloads or a compiled story; these are 03's responsibility. `G-01` numeric/state formula and permission representation are **not invented** by 04.
- **No implementation/test claims:** No game build, narrative compiler, event registry, asset manifest, browser acceptance, deployment or production save/restore was run or altered by 04.
- **Notice/UI integration guard:** `D1N-L002` promises only access to a **pause menu**; if 03's actual demo shell lacks a working pause menu, the text must be aligned to the shipped UI before release. Final audience rating/safety notices and any help contacts require separate verified policy/content before publication.
- **Implementation gate:** `PLANNING A–D CONFIRMED` / **IMPLEMENTATION AUTHORIZATION PENDING**; no Git mutation, no code/config/doc Source of Truth changes, no production compilation, commit/push/PR/merge or deploy is authorized by this index.

**v1.2 Editorial Errata (01, no narrative changes):** Updated authoritative Day 3 local handoff reference to `P3-D3-v0.3` (only corrected Kan name-disclosure editorial description and reading-rule reference); corrected P1 narrative test count from 12 to 13. No dialogue, choices, conditions, or state semantics changed.

**v1.1 Changelog (coordination verification only):** Linked and verified `CR-NAR-001 v0.2`; added change-ledger cross-references and historical-status reconciliation; clarified `CR-09` Save/Resume deferral and Repository canonicalization guard. **No Thai dialogue, choice text, outcomes, narrative facts, permission, approved structure, or implementation contract changed.**

**Handoff result:** **DAY 1–3 EDITORIAL CONTENT READY FOR TECHNICAL HANDOFF** — read-only 03 planning and content-to-technical mapping review may proceed. **No Major Owner Decision Required** on the accepted narrative content. Next change, if any, must preserve revision traceability and be reviewed under the 01/Owner authority boundary.
