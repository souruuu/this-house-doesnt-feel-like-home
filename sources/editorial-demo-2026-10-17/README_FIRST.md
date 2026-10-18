# Editorial Narrative Handoff — Day 1–3 (17 October 2026)

**Project:** This House Doesn't Feel Like Home

**Owner decision:** Editorial Content approved for **all nine Day 1–3 scenes**. Day 2 approval specifically applies to `Narrative_Emotional_Revision_Proposal_Day2_v0.1_corrected.md` with `D202-L001` beginning **“ช่วงบ่าย...”**. Day 3 approval specifically applies to `Narrative_Emotional_Revision_Proposal_Day3_v0.1.md` in full. Day 1 previously approved as listed below.

**Important:** This is an **EDITORIAL HANDOFF FOR READ-ONLY REVIEW / IMPLEMENTATION PLANNING ONLY**. **IMPLEMENTATION AUTHORIZATION: PENDING.** This package does **not** grant permission to modify repository files, code, tests, configs, source-of-truth docs, git branches/commits/push/PR, builds or deployments. Codex and 03 must await a new, explicit Owner Implementation Authorization before implementing any content in the game.

## Effective approved editorial scripts (5 files)

1. `day1/Narrative_Emotional_Revision_Proposal_SC-D1-01_v0.3.1.md` — `SC-D1-01` (Manao).
2. `day1/Narrative_Emotional_Revision_Proposal_SC-D1-02_v0.2.md` — `SC-D1-02` (Som).
3. `day1/Narrative_Emotional_Revision_SC-D1-03_v0.2.1_Owner_Approved.md` — `SC-D1-03` (Nut, unnamed boy, Quiet Close); final `EM2-D103-NA03`: **“โห คิดเป็นเรื่องเป็นราวเลยนะ”**; `D103-L005A` fact-bearing line is unchanged.
4. `day2/Narrative_Emotional_Revision_Proposal_Day2_v0.1_corrected.md` — `SC-D2-01`, `SC-D2-02`, `SC-D2-03` (3 scenes), with only `D202-L001` changed from original v0.1 **“หลังเลิกเรียน”** to **“ช่วงบ่าย”**. The old document header may still say PROPOSED; the Owner explicitly approved this corrected version on 17 Oct 2026, and this manifest records that newer decision.
5. `day3/Narrative_Emotional_Revision_Proposal_Day3_v0.1.md` — `SC-D3-01`, `SC-D3-02`, `SC-D3-03` (3 scenes) and DEMO_END UI. The original document header says PROPOSED; the Owner explicitly approved the whole v0.1 on 17 Oct 2026. Day 3 `D301-L001` **“หลังเลิกเรียน”** is **intentional canonical wording** and must not be replaced by the Day 2 correction.

## Editorial approval register (1 file)

- `day1/Editorial_Content_Revision_Record_Day1_2026-10-17_v1.0.md` records prior Day 1 editorial approvals and the final exact wording override for `EM2-D103-NA03`.

## Canon and integration references (NOT bundled; retrieve from authoritative repo / 03's verified sources)

- Approved production-content baselines: `P1-D1-v0.3`, `P2-D2-v0.2`, `P3-D3-v0.3`. These were cited by the editorial scripts but have not been verified as physical files in this handoff's local working set. **Never infer they are present in the zip.** They remain prior approved Canon baselines; Owner-approved emotional writing supplies later editorial texts but is not automatically installed in the repository.
- Handoff / change context: `NAR-HANDOFF-D1D3-v1.2`, `CR-NAR-001 v0.2`, if present in 03's verified sources.
- Repository contracts: `AGENTS.md`, `PROJECT.md`, `MASTER_PLAN.md`, `ARCHITECTURE.md`, `docs/NARRATIVE_SYSTEM.md`, `docs/GAME_STATE.md`, `docs/UI_ASSET_SPEC.md`, `sources/narrative_map_7_day_Updates.md`, and `README.md` (use actual verified repository paths; do not invent missing files).
- Old `สำเนาของ game dev.docx` is **writing-style reference only, not Canon**, and is **not bundled**. Superseded emotional draft versions are **not bundled**.

## Instructions for 03 and Codex (read-only until separately authorized)

1. Read this manifest and `AGENTS.md` / authoritative repo contracts.
2. Inventory whether approved Canon baselines and the five effective editorial scripts are available and identify exact source path and version for each. Never silently choose superseded drafts or infer missing canonical sources.
3. Produce a **read-only integration plan**: old/new scene line mapping, which proposed `EM*` refs need stable production Line IDs, story knots/choice/rejoin positions, UI speakers/name reveal timing, `seen`/`told`/permission provenance, EventRegistry implications, all branch outcomes, and textual / runtime test changes to be made once authorized.
4. Critical invariants: Day 1 Nut `NUT_FOOD_INTEREST_TOLD_D1` only from actual `D103-L005A` (not merely clicking Choice A); Day 2 TRUE/FALSE `D203-L003T/F` according to evidence; Som Day 2 `D202-C02` only after C01-B, and only her own acceptance yields offered-food grant; Kan name only after actual Day 3 `D303-L010A`, never on C02-B; Day 3 21:00 shop close then `DEMO_END`; choice utterances render once; `EM*` content references are **not** already technical event/line IDs.
5. Report missing source documents, ambiguities, dependencies, and validation plan to Owner. **STOP before code/doc edits, branch creation, commit, PR, or tests that modify files.**

## Bundle integrity (SHA-256)

- `day1/Narrative_Emotional_Revision_Proposal_SC-D1-01_v0.3.1.md` — `4d772af01152ae639702b66a6b70e76027d96d9725fb804b51b00c20ab0f76d1`
- `day1/Narrative_Emotional_Revision_Proposal_SC-D1-02_v0.2.md` — `f1c63f468c55642edd172c4114b95129e0303b9227bd4864b0b2457d2b440b09`
- `day1/Narrative_Emotional_Revision_SC-D1-03_v0.2.1_Owner_Approved.md` — `6eb14f99ac6316a13422f1c72d85b62e9ba456b3795e99588bac6f39452f9d35`
- `day1/Editorial_Content_Revision_Record_Day1_2026-10-17_v1.0.md` — `a4b7c68df14198772aa8c508d7987357ec97d5c750d55d7f99c90af6c51c6995`
- `day2/Narrative_Emotional_Revision_Proposal_Day2_v0.1_corrected.md` — `6f5d0b8cf3dc62d132c848af6af6896dc3758732775ff787f99c401cb29f707d`
- `day3/Narrative_Emotional_Revision_Proposal_Day3_v0.1.md` — `4c4d3403952588d8ec5133e9511ce04532055e7e748cc26a5a45e8241cb688d4`
