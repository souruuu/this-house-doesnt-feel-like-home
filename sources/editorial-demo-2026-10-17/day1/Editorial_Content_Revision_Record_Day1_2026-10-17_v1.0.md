# This House Doesn't Feel Like Home — Day 1 Editorial Content Revision Record

**Record ID:** `NAR-EMO-D1-EDITORIAL-REC-v1.0`  
**Date:** 17 October 2026 (ICT)  
**From:** 04 — Narrative / Scene Cards  
**Authority:** Latest Owner Editorial Decisions (SC-D1-01, SC-D1-02, SC-D1-03)  
**Scope:** Editorial decision and exact wording override only. **No repository or runtime mutation.**

## Approved Day 1 Emotional Content Register

| Semantic Scene | Editorial content reference | Owner decision | Effective editorial text |
|---|---|---|---|
| `SC-D1-01` มะนาว | `NAR-EMO-SC-D1-01-v0.3.1` | **APPROVED FOR EDITORIAL CONTENT** | Entire v0.3.1 scene script as approved; do not rewrite absent real canon conflict |
| `SC-D1-02` ส้ม | `NAR-EMO-SC-D1-02-v0.2` | **APPROVED FOR EDITORIAL CONTENT** | Entire v0.2 scene script as approved; note minor staging review for bag-hand-off in Choice B; this is not a new story outcome |
| `SC-D1-03` นัท/เด็กชายที่ชายคา/Quiet Close | `NAR-EMO-SC-D1-03-v0.2.1` **plus exact Owner wording override below** | **APPROVED FOR EDITORIAL CONTENT WITH ONE WORDING ADJUSTMENT** | v0.2.1 script unchanged except exact `EM2-D103-NA03` wording below |

## One-line Owner wording adjustment — SC-D1-03

**Anchor:** `D103-C01-A` → `EM2-D103-NA02` → `EM2-D103-NA03` → `D103-L005A` (food interest fact-bearing line).  
**Ref:** `EM2-D103-NA03` (Player dialogue; player-facing).  
**Previous v0.2.1:** “อ้าว คิดจริงจังเลยเหรอ แค่ถามเล่น ๆ เองนะ”  
**Owner-approved final wording:** **“โห คิดเป็นเรื่องเป็นราวเลยนะ”**  
**Reason:** Friendly teasing without minimizing Nut's interest.  
**Effective read rule:** If referring to approved SC-D1-03 for editorial content, read the exact v0.2.1 script with the replacement line above; the original v0.2.1 draft is preserved for traceability. **Do not alter any other line or assign a new technical ID.**

**Explicitly unchanged:** Nut `D103-L005A` — “ผมชอบทำอาหารครับ ชอบคิดว่าของที่มีอยู่เอามาทำอะไรได้บ้าง”; this remains the **only fact-bearing line** for `NUT_FOOD_INTEREST_TOLD_D1`, committed only after that line occurs. `D103-C01-B` cannot learn food interest. All Choice B lines, awning-boy content (never named on Day 1), shop Quiet Close at 21:00, state/permission/promise invariants and branch/rejoin remain exactly as approved in v0.2.1.

## Canon and implementation distinction

- `P1-D1-v0.3` remains the previously approved **Production Canon Baseline document**; this record registers **later, explicit Owner editorial approvals** for the three emotional scene scripts. It is not a repository-installed canonical revision or an instruction to silently overwrite P1.
- For Day 2 callback planning, the accepted Day 1 fact semantics remain: `NUT_FOOD_INTEREST_TOLD_D1` iff `D103-L005A` actually occurs in the current playthrough, not when Choice A is clicked. Day 2 `D203-L003T/F` are still owned by `P2-D2-v0.2` until separately approved emotional revisions.
- Stage directions do not create new facts, technical IDs, mandatory assets, or relationships. No implementation/build/Git/config/doc-source mutations authorized.

**Record status:** **DAY 1 SCENES — EDITORIAL CONTENT APPROVED** (under the three cited Owner decisions). **IMPLEMENTATION AUTHORIZATION PENDING.**
